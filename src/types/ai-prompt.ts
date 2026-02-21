/**
 * AI Prompt types for the Prompt Registry
 */

// AIPrompt DTO matching backend
export interface AIPromptDto {
  id: string;
  name: string;
  description: string;
  category: string;
  planType: string;
  language: string;
  sectionName?: string;
  systemPrompt: string;
  userPromptTemplate: string;
  variables: string;
  isActive: boolean;
  version: number;
  parentPromptId?: string;
  notes?: string;
  usageCount: number;
  lastUsedAt?: string;
  averageRating: number;
  ratingCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}

// Version history entry
export interface AIPromptVersionDto {
  id: string;
  aiPromptId: string;
  version: number;
  systemPrompt: string;
  userPromptTemplate: string;
  variables?: string;
  notes?: string;
  changedBy?: string;
  changedAt: string;
}

// Test result
export interface AIPromptTestResult {
  promptId: string;
  testInput: string;
  generatedOutput: string;
  tokensUsed: number;
  temperature: number;
  testedAt: string;
  model: string;
  responseTime: string;
  error?: string;
}

// Statistics
export interface AIPromptStats {
  promptId: string;
  name: string;
  totalUsage: number;
  averageRating: number;
  ratingCount: number;
  lastUsedAt?: string;
  activeVersions: number;
  totalVersions: number;
  mostUsedLanguage: string;
  mostUsedPlanType: string;
}

// Request types
export interface CreateAIPromptRequest {
  name: string;
  description: string;
  category: string;
  planType: string;
  language: string;
  systemPrompt: string;
  userPromptTemplate: string;
  variables?: string;
  notes?: string;
  sectionName?: string;
}

export interface UpdateAIPromptRequest {
  name?: string;
  description?: string;
  systemPrompt?: string;
  userPromptTemplate?: string;
  variables?: string;
  notes?: string;
  isActive?: boolean;
  sectionName?: string;
}

export interface TestAIPromptRequest {
  promptId: string;
  sampleVariables: string;
  testContext?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface TestDraftAIPromptRequest {
  systemPrompt: string;
  userPromptTemplate: string;
  sampleVariables: string;
  testContext?: string;
  maxTokens?: number;
  temperature?: number;
}

export interface RollbackAIPromptRequest {
  targetVersion: number;
  notes?: string;
}

// Filter options
export interface AIPromptFilter {
  category?: string;
  planType?: string;
  language?: string;
  isActive?: boolean;
  search?: string;
}

// Categories
export const AI_PROMPT_CATEGORIES = [
  'ContentGeneration',
  'SystemPrompt',
  'QuestionSuggestions',
  'SectionImprovement',
] as const;

export type AIPromptCategory = typeof AI_PROMPT_CATEGORIES[number];

// Plan types
export const PLAN_TYPES = [
  'BusinessPlan',
  'StrategicPlan',
  'LeanCanvas',
] as const;

export type PlanType = typeof PLAN_TYPES[number];

// Languages
export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'French' },
] as const;

export type Language = 'en' | 'fr';

// Section names
export const SECTION_NAMES = [
  'ExecutiveSummary',
  'ProblemStatement',
  'Solution',
  'MarketAnalysis',
  'CompetitiveAnalysis',
  'SwotAnalysis',
  'BusinessModel',
  'MarketingStrategy',
  'BrandingStrategy',
  'OperationsPlan',
  'ManagementTeam',
  'FinancialProjections',
  'FundingRequirements',
  'RiskAnalysis',
  'ExitStrategy',
  'MissionStatement',
  'SocialImpact',
  'BeneficiaryProfile',
  'GrantStrategy',
  'SustainabilityPlan',
] as const;

export type SectionName = typeof SECTION_NAMES[number];
