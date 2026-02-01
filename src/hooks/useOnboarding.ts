import { useState, useEffect, useCallback } from 'react';
import { onboardingService } from '../lib/onboarding-service';
import {
  OnboardingProgressDto,
  OnboardingData,
  OnboardingCompleteRequest,
} from '../types/onboarding';

interface UseOnboardingReturn {
  /** Current onboarding progress */
  progress: OnboardingProgressDto | null;
  /** Whether progress is currently loading */
  isLoading: boolean;
  /** Error message if loading failed */
  error: string | null;
  /** Whether onboarding is complete */
  isComplete: boolean;
  /** Save progress to backend */
  saveProgress: (currentStep: number, data: OnboardingData) => Promise<void>;
  /** Complete onboarding and create plan */
  completeOnboarding: (request: OnboardingCompleteRequest) => Promise<{ planId: string }>;
  /** Refresh progress from backend */
  refreshProgress: () => Promise<void>;
}

/**
 * Hook for managing onboarding state
 * Fetches progress on mount and provides methods for saving/completing
 */
export function useOnboarding(): UseOnboardingReturn {
  const [progress, setProgress] = useState<OnboardingProgressDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch progress on mount
  const fetchProgress = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await onboardingService.getOnboardingProgress();
      setProgress(data);
    } catch (err: any) {
      console.error('Failed to fetch onboarding progress:', err);
      setError(err.message || 'Failed to load onboarding progress');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Save progress
  const saveProgress = useCallback(async (currentStep: number, data: OnboardingData) => {
    try {
      await onboardingService.saveOnboardingProgress({
        currentStep,
        data,
      });

      // Update local state
      setProgress((prev) => prev ? {
        ...prev,
        currentStep,
        data,
      } : null);
    } catch (err: any) {
      console.warn('Failed to save progress:', err);
      // Don't throw - we don't want to block the user
    }
  }, []);

  // Complete onboarding
  const completeOnboarding = useCallback(async (request: OnboardingCompleteRequest) => {
    const result = await onboardingService.completeOnboarding(request);

    // Update local state
    setProgress((prev) => prev ? {
      ...prev,
      isComplete: true,
      completedAt: new Date().toISOString(),
    } : null);

    return result;
  }, []);

  return {
    progress,
    isLoading,
    error,
    isComplete: progress?.isComplete ?? false,
    saveProgress,
    completeOnboarding,
    refreshProgress: fetchProgress,
  };
}

export default useOnboarding;
