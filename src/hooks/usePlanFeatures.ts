import { useState, useEffect, useCallback, useRef } from 'react';
import {
  planFeaturesService,
  PlanFeaturesSnapshot,
  PlanFeatures,
} from '../lib/plan-features-service';

/**
 * Hook for loading the current organization's plan features & usage.
 * Returns helpers to check boolean features, limits, and usage.
 */
export function usePlanFeatures(organizationId: string | null | undefined) {
  const [snapshot, setSnapshot] = useState<PlanFeaturesSnapshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);

  const fetch = useCallback(async () => {
    if (!organizationId) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await planFeaturesService.getPlanFeatures(organizationId);
      if (isMountedRef.current) {
        setSnapshot(data);
        setError(null);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to load plan features'));
      }
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    isMountedRef.current = true;
    fetch();
    return () => { isMountedRef.current = false; };
  }, [fetch]);

  const isEnabled = useCallback(
    (key: string): boolean => {
      if (!snapshot) return false;
      return planFeaturesService.isEnabled(snapshot.features, key);
    },
    [snapshot]
  );

  const getLimit = useCallback(
    (key: string): number => {
      if (!snapshot) return 0;
      return planFeaturesService.getLimit(snapshot.features, key);
    },
    [snapshot]
  );

  const isUnlimited = useCallback(
    (key: string): boolean => {
      if (!snapshot) return false;
      return planFeaturesService.isUnlimited(snapshot.features, key);
    },
    [snapshot]
  );

  const formatLimit = useCallback(
    (key: string, unlimitedLabel = 'Unlimited'): string => {
      if (!snapshot) return '—';
      return planFeaturesService.formatLimit(snapshot.features, key, unlimitedLabel);
    },
    [snapshot]
  );

  const getUsage = useCallback(
    (key: string) => snapshot?.usage[key] ?? null,
    [snapshot]
  );

  return {
    snapshot,
    isLoading,
    error,
    refresh: fetch,
    planType: snapshot?.planType ?? null,
    planName: snapshot?.planName ?? null,
    isEnabled,
    getLimit,
    isUnlimited,
    formatLimit,
    getUsage,
    PlanFeatures,
  };
}

export default usePlanFeatures;
