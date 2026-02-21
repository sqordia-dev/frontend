// Enums matching backend
export enum SectionType {
  ExecutiveSummary = 1,
  CompanyOverview = 2,
  MarketAnalysis = 3,
  ProductsServices = 4,
  MarketingStrategy = 5,
  OperationsPlan = 6,
  ManagementTeam = 7,
  FinancialProjections = 8,
  FundingRequest = 9,
  Appendix = 10,
  SWOTAnalysis = 11,
  RiskAssessment = 12,
  ImplementationTimeline = 13,
  ExitStrategy = 14,
  // OBNL-specific
  MissionVision = 100,
  ImpactMeasurement = 101,
  GovernanceStructure = 102,
  // Lean Canvas-specific
  Problem = 200,
  Solution = 201,
  UniqueValueProposition = 202,
  Channels = 203,
  CustomerSegments = 204,
  CostStructure = 205,
  RevenueStreams = 206,
  KeyMetrics = 207,
  UnfairAdvantage = 208,
}

export enum BusinessPlanType {
  BusinessPlan = 0,
  StrategicPlan = 1,
  LeanCanvas = 2,
}

export enum PromptAlias {
  Production = 1,
  Staging = 2,
  Development = 3,
  Experimental = 4,
}

export enum OutputFormat {
  Prose = 1,
  Table = 2,
  Chart = 3,
  Mixed = 4,
  Structured = 5,
}

// Helper functions
export const getSectionTypeName = (type: SectionType): string => {
  return SectionType[type] || 'Unknown';
};

export const getBusinessPlanTypeName = (type: BusinessPlanType): string => {
  return BusinessPlanType[type] || 'Unknown';
};

export const getPromptAliasName = (alias: PromptAlias | null): string => {
  if (alias === null) return '';
  return PromptAlias[alias] || 'Unknown';
};

export const getOutputFormatName = (format: OutputFormat): string => {
  return OutputFormat[format] || 'Unknown';
};

// Section type options for dropdowns
export const SECTION_TYPE_OPTIONS = [
  // Standard Business Plan
  { value: SectionType.ExecutiveSummary, label: 'Executive Summary', group: 'Business Plan' },
  { value: SectionType.CompanyOverview, label: 'Company Overview', group: 'Business Plan' },
  { value: SectionType.MarketAnalysis, label: 'Market Analysis', group: 'Business Plan' },
  { value: SectionType.ProductsServices, label: 'Products & Services', group: 'Business Plan' },
  { value: SectionType.MarketingStrategy, label: 'Marketing Strategy', group: 'Business Plan' },
  { value: SectionType.OperationsPlan, label: 'Operations Plan', group: 'Business Plan' },
  { value: SectionType.ManagementTeam, label: 'Management Team', group: 'Business Plan' },
  { value: SectionType.FinancialProjections, label: 'Financial Projections', group: 'Business Plan' },
  { value: SectionType.FundingRequest, label: 'Funding Request', group: 'Business Plan' },
  { value: SectionType.Appendix, label: 'Appendix', group: 'Business Plan' },
  { value: SectionType.SWOTAnalysis, label: 'SWOT Analysis', group: 'Business Plan' },
  { value: SectionType.RiskAssessment, label: 'Risk Assessment', group: 'Business Plan' },
  { value: SectionType.ImplementationTimeline, label: 'Implementation Timeline', group: 'Business Plan' },
  { value: SectionType.ExitStrategy, label: 'Exit Strategy', group: 'Business Plan' },
  // OBNL
  { value: SectionType.MissionVision, label: 'Mission & Vision', group: 'OBNL' },
  { value: SectionType.ImpactMeasurement, label: 'Impact Measurement', group: 'OBNL' },
  { value: SectionType.GovernanceStructure, label: 'Governance Structure', group: 'OBNL' },
  // Lean Canvas
  { value: SectionType.Problem, label: 'Problem', group: 'Lean Canvas' },
  { value: SectionType.Solution, label: 'Solution', group: 'Lean Canvas' },
  { value: SectionType.UniqueValueProposition, label: 'Unique Value Proposition', group: 'Lean Canvas' },
  { value: SectionType.Channels, label: 'Channels', group: 'Lean Canvas' },
  { value: SectionType.CustomerSegments, label: 'Customer Segments', group: 'Lean Canvas' },
  { value: SectionType.CostStructure, label: 'Cost Structure', group: 'Lean Canvas' },
  { value: SectionType.RevenueStreams, label: 'Revenue Streams', group: 'Lean Canvas' },
  { value: SectionType.KeyMetrics, label: 'Key Metrics', group: 'Lean Canvas' },
  { value: SectionType.UnfairAdvantage, label: 'Unfair Advantage', group: 'Lean Canvas' },
];

export const BUSINESS_PLAN_TYPE_OPTIONS = [
  { value: BusinessPlanType.BusinessPlan, label: 'Business Plan' },
  { value: BusinessPlanType.StrategicPlan, label: 'Strategic Plan' },
  { value: BusinessPlanType.LeanCanvas, label: 'Lean Canvas' },
];

export const PROMPT_ALIAS_OPTIONS = [
  { value: PromptAlias.Production, label: 'Production' },
  { value: PromptAlias.Staging, label: 'Staging' },
  { value: PromptAlias.Development, label: 'Development' },
  { value: PromptAlias.Experimental, label: 'Experimental' },
];

export const OUTPUT_FORMAT_OPTIONS = [
  { value: OutputFormat.Prose, label: 'Prose' },
  { value: OutputFormat.Table, label: 'Table' },
  { value: OutputFormat.Chart, label: 'Chart' },
  { value: OutputFormat.Mixed, label: 'Mixed' },
  { value: OutputFormat.Structured, label: 'Structured' },
];

export const AI_PROVIDER_OPTIONS = [
  { value: 'OpenAI', label: 'OpenAI (GPT-4o)' },
  { value: 'Claude', label: 'Claude (Claude 3.5 Sonnet)' },
  { value: 'Gemini', label: 'Gemini (Gemini 1.5 Pro)' },
];

// DTOs
export interface PromptTemplateDto {
  id: string;
  sectionType: SectionType;
  sectionTypeName: string;
  planType: BusinessPlanType;
  planTypeName: string;
  industryCategory: string | null;
  version: number;
  isActive: boolean;
  alias: PromptAlias | null;
  aliasName: string | null;
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  outputFormat: OutputFormat;
  outputFormatName: string;
  visualElementsJson: string | null;
  exampleOutput: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  totalUsageCount: number;
  averageRating: number;
  acceptanceRate: number;
  editRate: number;
  regenerateRate: number;
  ratingCount: number;
}

export interface PromptTemplateListDto {
  id: string;
  sectionType: SectionType;
  sectionTypeName: string;
  planType: BusinessPlanType;
  planTypeName: string;
  industryCategory: string | null;
  version: number;
  isActive: boolean;
  alias: PromptAlias | null;
  aliasName: string | null;
  name: string;
  description: string;
  outputFormat: OutputFormat;
  outputFormatName: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  totalUsageCount: number;
  averageRating: number;
  acceptanceRate: number;
}

export interface PromptVersionHistoryDto {
  id: string;
  version: number;
  isActive: boolean;
  alias: PromptAlias | null;
  aliasName: string | null;
  name: string;
  createdAt: string;
  createdBy: string;
  totalUsageCount: number;
  averageRating: number;
  acceptanceRate: number;
  hasSystemPromptChanges: boolean;
  hasUserPromptChanges: boolean;
  hasOutputFormatChanges: boolean;
}

export interface PromptTestResultDto {
  renderedSystemPrompt: string;
  renderedUserPrompt: string;
  output: string;
  tokensUsed: number;
  inputTokens: number;
  outputTokens: number;
  responseTimeMs: number;
  provider: string;
  model: string;
  success: boolean;
  error: string | null;
}

export interface PerformancePeriodDto {
  periodStart: string;
  periodEnd: string;
  usageCount: number;
  editCount: number;
  regenerateCount: number;
  acceptCount: number;
  ratingCount: number;
  averageRating: number;
  editRate: number;
  regenerateRate: number;
  acceptanceRate: number;
}

export interface PromptPerformanceDto {
  promptTemplateId: string;
  promptName: string;
  totalUsageCount: number;
  totalEditCount: number;
  totalRegenerateCount: number;
  totalAcceptCount: number;
  totalRatingCount: number;
  averageRating: number;
  editRate: number;
  regenerateRate: number;
  acceptanceRate: number;
  periods: PerformancePeriodDto[];
}

export interface TopPerformerDto {
  id: string;
  name: string;
  sectionTypeName: string;
  planTypeName: string;
  usageCount: number;
  averageRating: number;
  acceptanceRate: number;
}

export interface UsageTrendDto {
  date: string;
  usageCount: number;
  acceptCount: number;
  editCount: number;
  regenerateCount: number;
}

export interface SectionPerformanceDto {
  sectionType: string;
  sectionTypeName: string;
  promptCount: number;
  usageCount: number;
  averageRating: number;
  acceptanceRate: number;
}

export interface PromptPerformanceSummaryDto {
  totalPrompts: number;
  activePrompts: number;
  totalUsage: number;
  overallAverageRating: number;
  overallAcceptanceRate: number;
  overallEditRate: number;
  overallRegenerateRate: number;
  topPerformingPrompts: TopPerformerDto[];
  mostUsedPrompts: TopPerformerDto[];
  highestRatedPrompts: TopPerformerDto[];
  usageTrends: UsageTrendDto[];
  performanceBySection: SectionPerformanceDto[];
}

// Request types
export interface CreatePromptTemplateRequest {
  sectionType: SectionType;
  planType: BusinessPlanType;
  industryCategory?: string | null;
  name: string;
  description?: string | null;
  systemPrompt: string;
  userPromptTemplate: string;
  outputFormat: OutputFormat;
  visualElementsJson?: string | null;
  exampleOutput?: string | null;
}

export interface UpdatePromptTemplateRequest {
  name?: string | null;
  description?: string | null;
  systemPrompt?: string | null;
  userPromptTemplate?: string | null;
  outputFormat?: OutputFormat | null;
  visualElementsJson?: string | null;
  exampleOutput?: string | null;
  industryCategory?: string | null;
}

export interface TestPromptRequest {
  sampleVariables: string;
  provider?: string | null;
  maxTokens?: number;
  temperature?: number;
}

export interface TestDraftPromptRequest {
  sectionType: SectionType;
  planType: BusinessPlanType;
  systemPrompt: string;
  userPromptTemplate: string;
  sampleVariables: string;
  provider?: string | null;
  maxTokens?: number;
  temperature?: number;
}

export interface PromptRegistryFilter {
  sectionType?: SectionType | null;
  planType?: BusinessPlanType | null;
  isActive?: boolean | null;
  alias?: PromptAlias | null;
  industryCategory?: string | null;
  search?: string | null;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string | null;
  sortDirection?: string | null;
}

export interface SetAliasRequest {
  alias: PromptAlias | null;
}

// Paginated response
export interface PaginatedList<T> {
  items: T[];
  pageNumber: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
