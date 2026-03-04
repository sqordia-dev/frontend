'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle } from 'lucide-react';
import { GenerationProgress } from '@/components/generation';
import { useGenerationStatus } from '@/hooks/useGenerationStatus';
import { businessPlanService } from '@/lib/business-plan-service';

const translations = {
  en: {
    preparing: 'Preparing your business plan...',
    invalidPlanId: 'Invalid Plan ID',
    noPlanIdProvided: 'No plan ID was provided in the URL.',
    checkUrl: 'Please check the URL and try again.',
    backToDashboard: 'Back to Dashboard',
  },
  fr: {
    preparing: "Preparation de votre plan d'affaires...",
    invalidPlanId: 'ID de plan invalide',
    noPlanIdProvided: "Aucun ID de plan n'a ete fourni dans l'URL.",
    checkUrl: "Veuillez verifier l'URL et reessayer.",
    backToDashboard: 'Retour au tableau de bord',
  },
};

interface GenerationContentProps {
  locale: string;
  planId: string;
}

export default function GenerationContent({ locale, planId }: GenerationContentProps) {
  const router = useRouter();
  const basePath = locale === 'fr' ? '/fr' : '';
  const t = translations[locale as keyof typeof translations] || translations.en;

  const [planTitle, setPlanTitle] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const hasStartedRef = useRef(false);

  const {
    status,
    progress,
    error,
    startGeneration,
    cancelGeneration,
    retryGeneration,
  } = useGenerationStatus(planId, {
    autoStart: false,
    onComplete: () => {
      setTimeout(() => {
        router.push(`${basePath}/business-plan/${planId}/preview`);
      }, 1500);
    },
  });

  useEffect(() => {
    const initializeGeneration = async () => {
      if (!planId) {
        setInitError('No plan ID provided');
        setIsInitializing(false);
        return;
      }

      try {
        const plan = await businessPlanService.getBusinessPlan(planId);
        setPlanTitle(plan.title || 'Business Plan');

        const planStatus = (plan.status || '').toLowerCase();
        if (planStatus === 'generated' || planStatus === 'completed') {
          router.push(`${basePath}/business-plan/${planId}/preview`);
          return;
        }

        const existingStatus = await businessPlanService.getGenerationStatus(planId);
        const generationStatus = (existingStatus?.status || existingStatus?.generationStatus || '').toLowerCase();
        if (generationStatus === 'completed' || generationStatus === 'generated') {
          router.push(`${basePath}/business-plan/${planId}/preview`);
          return;
        }

        setIsInitializing(false);

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
  }, [planId, router, startGeneration, basePath]);

  const handleCancel = async () => {
    await cancelGeneration();
    router.push(`${basePath}/dashboard`);
  };

  const handleRetry = async () => {
    await retryGeneration();
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <Loader2
            size={48}
            className="animate-spin mx-auto mb-4 text-orange-500"
            aria-hidden="true"
          />
          <p className="text-gray-600 dark:text-gray-400">
            {t.preparing}
          </p>
        </div>
      </div>
    );
  }

  if (initError || !planId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 px-4">
        <div className="text-center max-w-md">
          <AlertCircle
            size={48}
            className="mx-auto mb-4 text-red-500"
            aria-hidden="true"
          />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {initError || t.invalidPlanId}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {initError ? t.checkUrl : t.noPlanIdProvided}
          </p>
          <button
            onClick={() => router.push(`${basePath}/dashboard`)}
            className="px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            {t.backToDashboard}
          </button>
        </div>
      </div>
    );
  }

  return (
    <GenerationProgress
      status={status}
      progress={progress}
      error={error}
      onCancel={handleCancel}
      onRetry={handleRetry}
      planTitle={planTitle}
    />
  );
}
