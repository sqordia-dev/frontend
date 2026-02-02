import { useState, useEffect, useCallback, useRef } from 'react';
import { GenerationStatusDto } from '../types/generation';
import { generationService } from '../lib/generation-service';

interface UseGenerationStatusOptions {
  /** Polling interval in milliseconds (default: 2000) */
  pollInterval?: number;
  /** Whether to auto-start polling (default: true) */
  autoStart?: boolean;
  /** Callback when generation completes */
  onComplete?: () => void;
  /** Callback when generation fails */
  onError?: (error: string) => void;
}

interface UseGenerationStatusReturn {
  /** Current generation status */
  status: GenerationStatusDto | null;
  /** Whether status is currently loading */
  isLoading: boolean;
  /** Error message if any */
  error: string | null;
  /** Whether generation is currently in progress */
  isGenerating: boolean;
  /** Progress percentage (0-100) */
  progress: number;
  /** Start the generation process */
  startGeneration: () => Promise<void>;
  /** Cancel the generation process */
  cancelGeneration: () => Promise<void>;
  /** Retry a failed generation */
  retryGeneration: () => Promise<void>;
  /** Manually refresh status */
  refreshStatus: () => Promise<void>;
}

/**
 * Hook for managing business plan generation status
 * Polls the backend for status updates every 2 seconds
 */
export function useGenerationStatus(
  planId: string | undefined,
  options: UseGenerationStatusOptions = {}
): UseGenerationStatusReturn {
  const {
    pollInterval = 2000,
    autoStart = true,
    onComplete,
    onError,
  } = options;

  const [status, setStatus] = useState<GenerationStatusDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Refs for cleanup and callbacks
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const hasStartedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const onErrorRef = useRef(onError);

  // Update refs when callbacks change
  useEffect(() => {
    onCompleteRef.current = onComplete;
    onErrorRef.current = onError;
  }, [onComplete, onError]);

  // Fetch current status
  const fetchStatus = useCallback(async () => {
    if (!planId || !isMountedRef.current) return;

    try {
      const statusData = await generationService.getGenerationStatus(planId);

      if (!isMountedRef.current) return;

      setStatus(statusData);
      setError(null);

      const statusLower = (statusData.status ?? '').toString().toLowerCase();
      const progressPct =
        statusData.totalSections > 0 && (statusData.completedSections?.length ?? 0) >= 0
          ? Math.round(((statusData.completedSections?.length ?? 0) / statusData.totalSections) * 100)
          : 0;

      const isComplete =
        statusLower === 'completed' ||
        statusLower === 'generated' ||
        progressPct >= 100;

      if (isComplete) {
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        onCompleteRef.current?.();
      }

      if (statusLower === 'failed') {
        // Stop polling
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        setError(statusData.errorMessage || 'Generation failed');
        onErrorRef.current?.(statusData.errorMessage || 'Generation failed');
      }
    } catch (err) {
      if (!isMountedRef.current) return;

      console.error('Failed to fetch generation status:', err);
      // Don't set error on fetch failures - keep trying
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [planId]);

  // Start polling
  const startPolling = useCallback(() => {
    // Clear existing interval
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    // Start new polling interval
    pollIntervalRef.current = setInterval(fetchStatus, pollInterval);
  }, [fetchStatus, pollInterval]);

  // Stop polling
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Start generation
  const startGeneration = useCallback(async () => {
    if (!planId) return;

    setIsLoading(true);
    setError(null);
    hasStartedRef.current = true;

    try {
      // Start generation (fire and forget - it runs in background)
      generationService.startGeneration(planId).catch(err => {
        console.error('Generation start failed:', err);
        if (isMountedRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to start generation');
          onErrorRef.current?.(err instanceof Error ? err.message : 'Failed to start generation');
        }
      });

      // Start polling for status updates
      startPolling();
      // Fetch initial status immediately
      await fetchStatus();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start generation';
      setError(errorMessage);
      onErrorRef.current?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [planId, fetchStatus, startPolling]);

  // Cancel generation
  const cancelGeneration = useCallback(async () => {
    if (!planId) return;

    try {
      await generationService.cancelGeneration(planId);
      stopPolling();
      await fetchStatus();
    } catch (err) {
      console.error('Failed to cancel generation:', err);
      // Fetch status anyway to get latest state
      await fetchStatus();
    }
  }, [planId, fetchStatus, stopPolling]);

  // Retry generation
  const retryGeneration = useCallback(async () => {
    if (!planId) return;

    setError(null);
    setIsLoading(true);

    try {
      await generationService.retryGeneration(planId);
      startPolling();
      await fetchStatus();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to retry generation';
      setError(errorMessage);
      onErrorRef.current?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [planId, fetchStatus, startPolling]);

  // Manual refresh
  const refreshStatus = useCallback(async () => {
    await fetchStatus();
  }, [fetchStatus]);

  // Initial fetch and auto-start polling
  useEffect(() => {
    isMountedRef.current = true;

    if (planId && autoStart) {
      // Fetch initial status
      fetchStatus().then(() => {
        // Start polling if not complete/failed
        if (isMountedRef.current && status?.status !== 'completed' && status?.status !== 'failed') {
          startPolling();
        }
      });
    }

    return () => {
      isMountedRef.current = false;
      stopPolling();
    };
  }, [planId, autoStart]); // Only run on mount and when planId changes

  // Calculate progress
  const progress = status
    ? status.totalSections > 0
      ? Math.round((status.completedSections.length / status.totalSections) * 100)
      : 0
    : 0;

  const isGenerating = status?.status === 'generating';

  return {
    status,
    isLoading,
    error,
    isGenerating,
    progress,
    startGeneration,
    cancelGeneration,
    retryGeneration,
    refreshStatus,
  };
}

export default useGenerationStatus;
