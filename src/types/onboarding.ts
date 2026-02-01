import React from 'react';

/**
 * Persona types for onboarding
 */
export type OnboardingPersona = 'entrepreneur' | 'consultant' | 'obnl';

/**
 * Data collected during onboarding flow
 */
export interface OnboardingData {
  userName?: string;
  persona?: OnboardingPersona;
  businessName?: string;
  industry?: string;
  description?: string;
  templateId?: string;
  planId?: string;
}

/**
 * Props passed to each step component
 */
export interface StepProps {
  data: OnboardingData;
  onNext: (stepData: Partial<OnboardingData>) => void;
  onBack: () => void;
  onComplete?: () => Promise<void>;
  isFirstStep: boolean;
  isLastStep: boolean;
}

/**
 * Configuration for an onboarding step
 */
export interface OnboardingStep {
  id: string;
  title: string;
  component: React.ComponentType<StepProps>;
}

/**
 * Onboarding progress stored in backend
 */
export interface OnboardingProgressDto {
  userId: string;
  currentStep: number;
  isComplete: boolean;
  data: OnboardingData;
  startedAt: string;
  completedAt?: string;
}

/**
 * Request to save onboarding progress
 */
export interface OnboardingProgressRequest {
  currentStep: number;
  data: OnboardingData;
}

/**
 * Request to complete onboarding
 */
export interface OnboardingCompleteRequest {
  persona: OnboardingPersona;
  businessName: string;
  industry?: string;
  description?: string;
  templateId?: string;
}

/**
 * Response from completing onboarding
 */
export interface OnboardingCompleteResponse {
  planId: string;
}

/**
 * Template option for template selection step
 */
export interface TemplateOption {
  id: string;
  name: string;
  description: string;
  sectionCount: number;
  isRecommended?: boolean;
  industry?: string;
}

/**
 * Industry options for business details step
 */
export const INDUSTRY_OPTIONS = [
  'Technology',
  'Retail',
  'Healthcare',
  'Food & Beverage',
  'Manufacturing',
  'Professional Services',
  'Construction',
  'Education',
  'Finance & Insurance',
  'Real Estate',
  'Transportation & Logistics',
  'Arts & Entertainment',
  'Non-Profit',
  'Other',
] as const;

export type Industry = typeof INDUSTRY_OPTIONS[number];
