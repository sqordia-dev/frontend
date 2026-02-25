import React from 'react';

/**
 * Persona types for onboarding
 */
export type OnboardingPersona = 'entrepreneur' | 'consultant' | 'obnl';

/**
 * Business stage types
 */
export type BusinessStage = 'Idea' | 'Startup' | 'Established';

/**
 * Team size options
 */
export type TeamSize = 'Solo' | '2-5' | '6-20' | '20+';

/**
 * Funding status options
 */
export type FundingStatus = 'Bootstrapped' | 'Seeking' | 'Funded';

/**
 * Goal options for onboarding
 */
export const GOAL_OPTIONS = [
  'Funding',
  'Growth',
  'Launch',
  'Market',
  'Team',
  'Strategy',
  'Partnerships',
  'Validation',
] as const;

export type Goal = typeof GOAL_OPTIONS[number];

/**
 * Data collected during onboarding flow
 */
export interface OnboardingData {
  userName?: string;
  // Step 1: Company & Persona
  companyName?: string;
  industry?: string;
  persona?: OnboardingPersona;
  // Step 2: Business Context
  businessStage?: BusinessStage;
  teamSize?: TeamSize;
  fundingStatus?: FundingStatus;
  // Step 3: Goals & Target Market
  goals?: Goal[];
  targetMarket?: string;
  // Legacy fields (for backward compatibility)
  businessName?: string;
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
 * Industry options for business details step (as per user journey doc)
 */
export const INDUSTRY_OPTIONS = [
  'Technology',
  'Healthcare',
  'Finance',
  'Retail',
  'Manufacturing',
  'Food',
  'Services',
  'Education',
  'Construction',
  'Entertainment',
  'Other',
] as const;

export type Industry = typeof INDUSTRY_OPTIONS[number];
