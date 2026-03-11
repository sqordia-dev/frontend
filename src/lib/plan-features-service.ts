import { apiClient } from './api-client';

// Matches backend PlanFeaturesSnapshot
export interface PlanFeaturesSnapshot {
  planType: string;
  planName: string;
  features: Record<string, string>;
  usage: Record<string, UsageInfo>;
}

export interface UsageInfo {
  current: number;
  limit: number; // -1 = unlimited
  percent: number;
  isNearLimit: boolean;
}

export interface FeatureCheckResult {
  allowed: boolean;
  currentUsage: number;
  limit: number;
  usagePercent: number;
  isNearLimit: boolean;
  denialReason?: string;
  upgradePrompt?: string;
}

// Feature key constants (mirrors backend PlanFeatures)
export const PlanFeatures = {
  MaxBusinessPlans: 'max_business_plans',
  MaxOrganizations: 'max_organizations',
  MaxTeamMembers: 'max_team_members',
  MaxAiGenerationsMonthly: 'max_ai_generations_monthly',
  MaxAiCoachMessagesMonthly: 'max_ai_coach_messages_monthly',
  MaxStorageMb: 'max_storage_mb',
  ExportHtml: 'export_html',
  ExportPdf: 'export_pdf',
  ExportWord: 'export_word',
  ExportPowerpoint: 'export_powerpoint',
  ExportExcel: 'export_excel',
  ExportAgentBlueprints: 'export_agent_blueprints',
  AiProviderTier: 'ai_provider_tier',
  PrioritySectionsClaude: 'priority_sections_claude',
  FinancialProjectionsBasic: 'financial_projections_basic',
  FinancialProjectionsAdvanced: 'financial_projections_advanced',
  CustomBranding: 'custom_branding',
  ApiAccess: 'api_access',
  PrioritySupport: 'priority_support',
  DedicatedSupport: 'dedicated_support',
  WhiteLabel: 'white_label',
} as const;

function extractValue<T>(data: any): T {
  if (data && typeof data === 'object' && 'isSuccess' in data) {
    if (data.isSuccess && data.value !== undefined) return data.value as T;
    if (!data.isSuccess) throw new Error(data.error?.message || 'Operation failed');
  }
  return data as T;
}

export const planFeaturesService = {
  async getPlanFeatures(organizationId: string): Promise<PlanFeaturesSnapshot> {
    const response = await apiClient.get(
      `/api/v1/subscriptions/organizations/${organizationId}/plan-features`
    );
    return extractValue<PlanFeaturesSnapshot>(response.data);
  },

  async checkFeature(organizationId: string, featureKey: string): Promise<FeatureCheckResult> {
    const response = await apiClient.get(
      `/api/v1/subscriptions/organizations/${organizationId}/features/${encodeURIComponent(featureKey)}/check`
    );
    return extractValue<FeatureCheckResult>(response.data);
  },

  // Helpers for interpreting feature values
  isEnabled(features: Record<string, string>, key: string): boolean {
    return features[key] === 'true';
  },

  getLimit(features: Record<string, string>, key: string): number {
    const val = features[key];
    if (!val) return 0;
    const num = parseInt(val, 10);
    return isNaN(num) ? 0 : num;
  },

  isUnlimited(features: Record<string, string>, key: string): boolean {
    return features[key] === '-1';
  },

  formatLimit(features: Record<string, string>, key: string, unlimitedLabel = 'Unlimited'): string {
    if (planFeaturesService.isUnlimited(features, key)) return unlimitedLabel;
    return features[key] ?? '0';
  },
};
