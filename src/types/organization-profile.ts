import type { Organization } from '../lib/types';

export interface OrganizationProfile extends Organization {
  sector?: string;
  legalForm?: string;
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
  legalForm?: string;
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
  name: 'name',
  industry: 'industry',
  teamSize: 'teamSize',
  fundingStatus: 'fundingStatus',
  targetMarket: 'targetMarket',
  businessStage: 'businessStage',
  goalsJson: 'goalsJson',
  location: 'location',
} as const;

export function calculateProfileCompletion(profile: OrganizationProfile | null): {
  score: number;
  filled: string[];
  missing: string[];
} {
  if (!profile) return { score: 0, filled: [], missing: Object.keys(PROFILE_FIELD_KEYS) };

  const hasValue = (v: string | undefined) => !!v && v.trim() !== '';

  const fields: Array<{ key: string; isFilled: boolean }> = [
    { key: 'name', isFilled: hasValue(profile.name) },
    { key: 'industry', isFilled: hasValue(profile.industry) },
    { key: 'businessStage', isFilled: hasValue(profile.businessStage) },
    { key: 'teamSize', isFilled: hasValue(profile.teamSize) },
    { key: 'fundingStatus', isFilled: hasValue(profile.fundingStatus) },
    { key: 'targetMarket', isFilled: hasValue(profile.targetMarket) },
    { key: 'goalsJson', isFilled: hasValue(profile.goalsJson) },
    { key: 'location', isFilled: hasValue(profile.city) || hasValue(profile.province) || hasValue(profile.country) },
  ];

  const filled = fields.filter(f => f.isFilled).map(f => f.key);
  const missing = fields.filter(f => !f.isFilled).map(f => f.key);
  const score = Math.round((filled.length / fields.length) * 100);

  return { score, filled, missing };
}
