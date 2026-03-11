import { apiClient } from './api-client';

// ── Response Types ──────────────────────────────────────

export interface SubscriptionIntelligence {
  engagement: EngagementScore;
  churn: ChurnPrediction;
  upgrade: UpgradePropensity;
  promotion: PromotionRecommendation;
}

export interface EngagementScore {
  score: number;
  level: string; // 'low' | 'medium' | 'high'
  signals: Record<string, number>;
}

export interface ChurnPrediction {
  churnProbability: number;
  riskLevel: string; // 'low' | 'medium' | 'high'
  riskFactors: string[];
  recommendedAction: string;
  daysToLikelyChurn?: number;
}

export interface UpgradePropensity {
  upgradeProbability: number;
  recommendedPlan?: string;
  upgradeSignals: string[];
  suggestedPromotionType?: string;
}

export interface PromotionRecommendation {
  shouldOffer: boolean;
  promotionType: string;
  discountPercent: number;
  targetPlan?: string;
  messageKey?: string;
  urgency: string; // 'low' | 'medium' | 'high'
  validDays: number;
  reason: string;
}

export interface CouponValidationResult {
  isValid: boolean;
  code?: string;
  discountPercent: number;
  targetPlan?: string;
  errorMessage?: string;
}

export interface GeneratedCoupon {
  code: string;
  discountPercent: number;
  promotionType: string;
  targetPlan?: string;
  validUntil: string;
  reason: string;
}

export interface ActivePromotion {
  promotionType: string;
  couponCode?: string;
  discountPercent: number;
  targetPlan?: string;
  messageKey?: string;
  urgency: string;
  expiresAt?: string;
}

// ── Helpers ─────────────────────────────────────────────

function extractValue<T>(data: any): T {
  if (data && typeof data === 'object' && 'isSuccess' in data) {
    if (data.isSuccess && data.value !== undefined) return data.value as T;
    if (!data.isSuccess) throw new Error(data.error?.message || 'Operation failed');
  }
  return data as T;
}

// ── Service ─────────────────────────────────────────────

const BASE = '/api/v1/subscription-intelligence';

export const subscriptionIntelligenceService = {
  /** Get full ML intelligence for an organization */
  async getIntelligence(organizationId: string): Promise<SubscriptionIntelligence> {
    const response = await apiClient.get(`${BASE}/organizations/${organizationId}`);
    return extractValue<SubscriptionIntelligence>(response.data);
  },

  /** Validate a coupon code for an organization */
  async validateCoupon(code: string, organizationId: string): Promise<CouponValidationResult> {
    const response = await apiClient.post(`${BASE}/coupons/validate`, { code, organizationId });
    return extractValue<CouponValidationResult>(response.data);
  },

  /** Generate a personalized coupon based on ML recommendations */
  async generatePersonalizedCoupon(organizationId: string): Promise<GeneratedCoupon> {
    const response = await apiClient.post(`${BASE}/organizations/${organizationId}/generate-coupon`);
    return extractValue<GeneratedCoupon>(response.data);
  },

  /** Get active promotions (personalized + global) */
  async getActivePromotions(organizationId: string): Promise<ActivePromotion[]> {
    const response = await apiClient.get(`${BASE}/organizations/${organizationId}/promotions`);
    return extractValue<ActivePromotion[]>(response.data);
  },
};
