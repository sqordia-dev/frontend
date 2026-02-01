import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { GenerationProgress } from '../../components/generation';
import { useGenerationStatus } from '../../hooks/useGenerationStatus';
import { businessPlanService } from '../../lib/business-plan-service';
import SEO from '../../components/SEO';

/**
 * GenerationPage Component
 * Full-screen page for AI business plan generation
 * Gets planId from URL params, starts generation, shows progress
 */
export default function GenerationPage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();

  const [planTitle, setPlanTitle] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
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
        setInitError('No plan ID provided');
        setIsInitializing(false);
        return;
      }

      try {
        // Fetch plan details
        const plan = await businessPlanService.getBusinessPlan(planId);
        setPlanTitle(plan.title || 'Business Plan');

        // Check if already generated - handle multiple status naming conventions
        const planStatus = (plan.status || plan.Status || '').toLowerCase();
        if (planStatus === 'generated' || planStatus === 'completed') {
          // Already generated, redirect to preview
          navigate(`/business-plan/${planId}/preview`);
          return;
        }

        // Also check generation status endpoint
        const existingStatus = await businessPlanService.getGenerationStatus(planId);
        const generationStatus = (existingStatus?.status || existingStatus?.generationStatus || '').toLowerCase();
        if (generationStatus === 'completed' || generationStatus === 'generated') {
          // Already complete, redirect to preview
          navigate(`/business-plan/${planId}/preview`);
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
        setInitError('Failed to load business plan. Please try again.');
        setIsInitializing(false);
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
    await retryGeneration();
  };

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
          <div className="text-center">
            <Loader2
              size={48}
              className="animate-spin mx-auto mb-4 text-orange-500"
              aria-hidden="true"
            />
            <p className="text-gray-600 dark:text-gray-400">
              Preparing your business plan...
            </p>
          </div>
        </div>
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 px-4">
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
                ? 'Please check the URL and try again.'
                : 'No plan ID was provided in the URL.'}
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            >
              Back to Dashboard
            </button>
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
      />
    </>
  );
}
