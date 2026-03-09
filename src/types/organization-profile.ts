import type { Organization } from '../lib/types';

export interface OrganizationProfile extends Organization {
  sector?: string;
  teamSize?: string;
  fundingStatus?: string;
  targetMarket?: string;
  businessStage?: string;
  goalsJson?: string;
  city?: string;
  province?: string;
  country?: string;
  profileCompletenessScore?: number;
}

export interface UpdateOrganizationProfileRequest {
  name: string;
  description?: string;
  website?: string;
  industry?: string;
  sector?: string;
  teamSize?: string;
  fundingStatus?: string;
  targetMarket?: string;
  businessStage?: string;
  goalsJson?: string;
  city?: string;
  province?: string;
  country?: string;
}

export interface AdaptiveQuestionnaireResponse {
  questions: AdaptiveQuestionDto[];
  skippedQuestions: SkippedQuestionDto[];
  totalQuestions: number;
  remainingQuestions: number;
  profileCompletenessScore: number;
}

export interface AdaptiveQuestionDto {
  id: string;
  questionNumber: number;
  stepNumber: number;
  questionText: string;
  helpText?: string;
  questionType: string;
  options?: string;
  displayOrder: number;
  isRequired: boolean;
  icon?: string;
  sectionGroup?: string;
  coachPrompt?: string;
  expertAdvice?: string;
  profileFieldKey?: string;
  prefilledValue?: string;
  isGapQuestion: boolean;
  existingResponse?: string;
}

export interface SkippedQuestionDto {
  id: string;
  questionNumber: number;
  questionText: string;
  profileFieldKey: string;
  profileFieldValue: string;
}

export interface SubmitAdaptiveResponseRequest {
  questionId: string;
  questionNumber?: number;
  responseText: string;
  writeBackToProfile: boolean;
}

export interface OnboardingProfileCompleteRequest {
  companyName: string;
  persona: string;
  industry?: string;
  sector?: string;
  businessStage?: string;
  teamSize?: string;
  fundingStatus?: string;
  targetMarket?: string;
  goalsJson?: string;
  city?: string;
  province?: string;
  country?: string;
  createBusinessPlan?: boolean;
}

export interface OnboardingProfileCompleteResponse {
  success: boolean;
  organizationId?: string;
  businessPlanId?: string;
  message?: string;
}

export const PROFILE_FIELD_KEYS = {
  companyName: 'companyName',
  industry: 'industry',
  sector: 'sector',
  teamSize: 'teamSize',
  fundingStatus: 'fundingStatus',
  targetMarket: 'targetMarket',
  businessStage: 'businessStage',
  goalsJson: 'goalsJson',
  city: 'city',
  province: 'province',
  country: 'country',
} as const;

export function calculateProfileCompletion(profile: OrganizationProfile | null): {
  score: number;
  filled: string[];
  missing: string[];
} {
  if (!profile) return { score: 0, filled: [], missing: Object.keys(PROFILE_FIELD_KEYS) };

  const fields: Array<{ key: string; value: string | undefined }> = [
    { key: 'industry', value: profile.industry },
    { key: 'sector', value: profile.sector },
    { key: 'teamSize', value: profile.teamSize },
    { key: 'fundingStatus', value: profile.fundingStatus },
    { key: 'targetMarket', value: profile.targetMarket },
    { key: 'businessStage', value: profile.businessStage },
    { key: 'goalsJson', value: profile.goalsJson },
    { key: 'city', value: profile.city },
    { key: 'province', value: profile.province },
    { key: 'country', value: profile.country },
  ];

  const filled = fields.filter(f => f.value && f.value.trim() !== '').map(f => f.key);
  const missing = fields.filter(f => !f.value || f.value.trim() === '').map(f => f.key);
  const score = Math.round((filled.length / fields.length) * 100);

  return { score, filled, missing };
}
