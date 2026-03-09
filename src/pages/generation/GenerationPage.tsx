import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { GenerationProgress } from '../../components/generation';
import { useGenerationStatus } from '../../hooks/useGenerationStatus';
import { businessPlanService } from '../../lib/business-plan-service';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import SEO from '../../components/SEO';
import { LoadingSpinner } from '../../components/ui/loading-spinner';
import { Button } from '@/components/ui/button';

/**
 * GenerationPage Component
 * Full-screen page for AI business plan generation
 * Gets planId from URL params, starts generation, shows progress
 */
export default function GenerationPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();
  const { t } = useTheme();
  const toast = useToast();

  const [planTitle, setPlanTitle] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [alreadyGenerated, setAlreadyGenerated] = useState(false);
  const hasStartedRef = useRef(false);

  // Use generation status hook
  const {
    status,
    progress,
    error,
    startGeneration,
    cancelGeneration,
    retryGeneration,
  } = useGenerationStatus(planId, {
    autoStart: false, // We'll start manually after checking status
    onComplete: () => {
      // Navigate to preview page after a brief delay
      setTimeout(() => {
        navigate(`/business-plan/${planId}/preview`);
      }, 1500);
    },
  });

  // Initialize and start generation
  useEffect(() => {
    const initializeGeneration = async () => {
      if (!planId) {
        setInitError(t('generation.noPlanId'));
        setIsInitializing(false);
        return;
      }

      try {
        // Fetch plan details
        const plan = await businessPlanService.getBusinessPlan(planId);
        setPlanTitle(plan.title || 'Business Plan');

        // Check if already generated - handle multiple status naming conventions
        const planStatus = (plan.status || (plan as any).Status || '').toLowerCase();
        if (planStatus === 'generated' || planStatus === 'completed') {
          // Already generated, show friendly message then redirect
          setAlreadyGenerated(true);
          setTimeout(() => navigate(`/business-plan/${planId}/preview`), 2000);
          setIsInitializing(false);
          return;
        }

        // Also check generation status endpoint
        const existingStatus = await businessPlanService.getGenerationStatus(planId);
        const generationStatus = (existingStatus?.status || existingStatus?.generationStatus || '').toLowerCase();
        if (generationStatus === 'completed' || generationStatus === 'generated') {
          // Already complete, show friendly message then redirect
          setAlreadyGenerated(true);
          setTimeout(() => navigate(`/business-plan/${planId}/preview`), 2000);
          setIsInitializing(false);
          return;
        }

        setIsInitializing(false);

        // Start generation if not already started
        if (!hasStartedRef.current) {
          hasStartedRef.current = true;
          await startGeneration();
        }
      } catch (err) {
        console.error('Failed to initialize generation:', err);
        hasStartedRef.current = false;
        setInitError(t('generation.failedToLoad'));
        setIsInitializing(false);
        toast.error(
          t('generation.errorTitle') || 'Generation Error',
          t('generation.failedToLoad') || 'Failed to initialize business plan generation.'
        );
      }
    };

    initializeGeneration();
  }, [planId, navigate, startGeneration]);

  // Handle cancel
  const handleCancel = async () => {
    await cancelGeneration();
    navigate('/dashboard');
  };

  // Handle retry
  const handleRetry = async () => {
    hasStartedRef.current = false;
    await retryGeneration();
  };

  // Already generated - friendly redirect
  if (alreadyGenerated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t('generation.planReady')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('generation.redirectingToPreview')}
          </p>
        </div>
      </div>
    );
  }

  // Initial loading state
  if (isInitializing) {
    return (
      <>
        <SEO
          title="Starting Generation | Sqordia"
          description="Preparing to generate your business plan"
          noindex={true}
          nofollow={true}
        />
        <LoadingSpinner
          size="lg"
          text={t('generation.preparingPlan')}
          fullPage
        />
      </>
    );
  }

  // Initialization error state
  if (initError || !planId) {
    return (
      <>
        <SEO
          title="Error | Sqordia"
          description="An error occurred"
          noindex={true}
          nofollow={true}
        />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="text-center max-w-md">
            <AlertCircle
              size={48}
              className="mx-auto mb-4 text-red-500"
              aria-hidden="true"
            />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {initError || 'Invalid Plan ID'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {initError
                ? t('generation.checkUrl')
                : t('generation.invalidPlanId')}
            </p>
            <Button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold"
            >
              {t('generation.backToDashboard')}
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title={`Generating ${planTitle} | Sqordia`}
        description="AI is generating your business plan"
        noindex={true}
        nofollow={true}
      />
      <GenerationProgress
        status={status}
        progress={progress}
        error={error}
        onCancel={handleCancel}
        onRetry={handleRetry}
        planTitle={planTitle}
        planId={planId}
      />
    </>
  );
}
