import { useState, useEffect, useCallback } from 'react';
import {
  subscriptionIntelligenceService,
  SubscriptionIntelligence,
  ActivePromotion,
  CouponValidationResult,
} from '../lib/subscription-intelligence-service';

/**
 * Hook for consuming subscription intelligence (ML engagement, churn, upgrade, promotions).
 */
export function useSubscriptionIntelligence(organizationId: string | null | undefined) {
  const [intelligence, setIntelligence] = useState<SubscriptionIntelligence | null>(null);
  const [promotions, setPromotions] = useState<ActivePromotion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!organizationId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [intel, promos] = await Promise.all([
        subscriptionIntelligenceService.getIntelligence(organizationId),
        subscriptionIntelligenceService.getActivePromotions(organizationId),
      ]);
      setIntelligence(intel);
      setPromotions(promos);
    } catch (err: any) {
      setError(err.message || 'Failed to load intelligence');
    } finally {
      setIsLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    load();
  }, [load]);

  const validateCoupon = useCallback(
    async (code: string): Promise<CouponValidationResult | null> => {
      if (!organizationId) return null;
      try {
        return await subscriptionIntelligenceService.validateCoupon(code, organizationId);
      } catch {
        return null;
      }
    },
    [organizationId],
  );

  return {
    intelligence,
    promotions,
    isLoading,
    error,
    refresh: load,
    validateCoupon,
    // Convenience accessors
    engagementLevel: intelligence?.engagement.level ?? null,
    churnRisk: intelligence?.churn.riskLevel ?? null,
    upgradeProbability: intelligence?.upgrade.upgradeProbability ?? 0,
    recommendedPlan: intelligence?.upgrade.recommendedPlan ?? null,
    shouldOfferPromotion: intelligence?.promotion.shouldOffer ?? false,
  };
}
