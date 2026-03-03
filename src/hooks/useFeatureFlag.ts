import { useState, useEffect, useCallback, useRef } from 'react';
import {
  featureFlagsService,
  FeatureFlag,
  FeatureFlagListResponse
} from '../lib/feature-flags-service';

/**
 * Hook for checking if a single feature flag is enabled
 * Caches the result and provides loading/error states
 */
export function useFeatureFlag(
  featureName: string,
  defaultValue: boolean = false
): {
  isEnabled: boolean;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
} {
  const [isEnabled, setIsEnabled] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);

  const fetchFlag = useCallback(async () => {
    if (!featureName) {
      setIsEnabled(defaultValue);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const enabled = await featureFlagsService.isEnabled(featureName);
      if (isMountedRef.current) {
        setIsEnabled(enabled);
        setError(null);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to check feature flag'));
        setIsEnabled(defaultValue);
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [featureName, defaultValue]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchFlag();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchFlag]);

  return { isEnabled, isLoading, error, refresh: fetchFlag };
}

/**
 * Hook for getting all feature flags (simple format)
 * Returns a dictionary of flag names to boolean values
 */
export function useFeatureFlags(): {
  flags: Record<string, boolean>;
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  isEnabled: (flagName: string) => boolean;
} {
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);

  const fetchFlags = useCallback(async () => {
    try {
      setIsLoading(true);
      const flagsData = await featureFlagsService.getAllFlags();
      if (isMountedRef.current) {
        setFlags(flagsData);
        setError(null);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch feature flags'));
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchFlags();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchFlags]);

  const isEnabled = useCallback((flagName: string) => {
    return flags[flagName] ?? false;
  }, [flags]);

  return { flags, isLoading, error, refresh: fetchFlags, isEnabled };
}

/**
 * Hook for managing feature flags with full metadata (admin use)
 * Provides CRUD operations and detailed flag information
 */
export function useFeatureFlagsAdmin(): {
  flags: FeatureFlag[];
  stats: {
    totalCount: number;
    enabledCount: number;
    disabledCount: number;
    staleCount: number;
  };
  isLoading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  toggleFlag: (flagName: string, isEnabled: boolean) => Promise<void>;
  createFlag: (data: Parameters<typeof featureFlagsService.createFlag>[0]) => Promise<FeatureFlag>;
  updateFlag: (flagName: string, data: Parameters<typeof featureFlagsService.updateFlag>[1]) => Promise<FeatureFlag>;
  markAsStale: (flagName: string) => Promise<void>;
  archiveFlag: (flagName: string) => Promise<void>;
} {
  const [response, setResponse] = useState<FeatureFlagListResponse>({
    flags: [],
    totalCount: 0,
    enabledCount: 0,
    disabledCount: 0,
    staleCount: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);

  const fetchFlags = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await featureFlagsService.getAllFlagsDetailed();
      if (isMountedRef.current) {
        setResponse(data);
        setError(null);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch feature flags'));
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    fetchFlags();

    return () => {
      isMountedRef.current = false;
    };
  }, [fetchFlags]);

  const toggleFlag = useCallback(async (flagName: string, isEnabled: boolean) => {
    // Optimistic update
    setResponse(prev => ({
      ...prev,
      flags: prev.flags.map(f =>
        f.name === flagName ? { ...f, isEnabled } : f
      ),
      enabledCount: prev.enabledCount + (isEnabled ? 1 : -1),
      disabledCount: prev.disabledCount + (isEnabled ? -1 : 1)
    }));

    try {
      await featureFlagsService.toggleFlag(flagName, isEnabled);
      // Refresh to get server state
      await fetchFlags();
    } catch (err) {
      // Revert on error
      await fetchFlags();
      throw err;
    }
  }, [fetchFlags]);

  const createFlag = useCallback(async (data: Parameters<typeof featureFlagsService.createFlag>[0]) => {
    const newFlag = await featureFlagsService.createFlag(data);
    await fetchFlags();
    return newFlag;
  }, [fetchFlags]);

  const updateFlag = useCallback(async (flagName: string, data: Parameters<typeof featureFlagsService.updateFlag>[1]) => {
    const updatedFlag = await featureFlagsService.updateFlag(flagName, data);
    await fetchFlags();
    return updatedFlag;
  }, [fetchFlags]);

  const markAsStale = useCallback(async (flagName: string) => {
    await featureFlagsService.markAsStale(flagName);
    await fetchFlags();
  }, [fetchFlags]);

  const archiveFlag = useCallback(async (flagName: string) => {
    await featureFlagsService.archiveFlag(flagName);
    await fetchFlags();
  }, [fetchFlags]);

  return {
    flags: response.flags,
    stats: {
      totalCount: response.totalCount,
      enabledCount: response.enabledCount,
      disabledCount: response.disabledCount,
      staleCount: response.staleCount
    },
    isLoading,
    error,
    refresh: fetchFlags,
    toggleFlag,
    createFlag,
    updateFlag,
    markAsStale,
    archiveFlag
  };
}

export default useFeatureFlag;
