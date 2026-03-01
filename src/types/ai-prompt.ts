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
  /** AI provider to use (claude, openai, gemini). Defaults to active provider. */
  provider?: string;
}

export interface TestDraftAIPromptRequest {
  systemPrompt: string;
  userPromptTemplate: string;
  sampleVariables: string;
  testContext?: string;
  maxTokens?: number;
  temperature?: number;
  /** AI provider to use (claude, openai, gemini). Defaults to active provider. */
  provider?: string;
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

// Section structure based on business plan chapters
// Chapter 0: SOMMAIRE EXÉCUTIF (Executive Summary)
export const EXECUTIVE_SUMMARY_SECTIONS = [
  'ExecutiveSummary_CompanyPresentation',      // 1.1 Présentation de l'entreprise
  'ExecutiveSummary_VisionMission',            // 1.2 Vision et mission
  'ExecutiveSummary_ValueProposition',         // 1.3 Proposition de valeur
  'ExecutiveSummary_ProductsServices',         // 1.4 Produits / Services
  'ExecutiveSummary_TargetOpportunity',        // 1.5 Cible et opportunité
  'ExecutiveSummary_StrategyAdvantages',       // 1.6 Stratégie et avantages compétitifs
  'ExecutiveSummary_FinancialSummary',         // 1.7 Synthèse financière
] as const;

// Chapter 1: LE PROJET (The Project)
export const PROJECT_SECTIONS = [
  'Project_Description',                       // 1.1 Description du projet
  'Project_MissionVisionValues',               // 1.2 Mission, vision et valeurs
  'Project_ProductsServices',                  // 1.3 Produits ou services
  'Project_Status',                            // 1.4 État d'avancement
  'Project_Differentiators',                   // 1.5 Différenciateurs / avantages compétitifs
  'Project_PriorityObjectives',                // 1.6 Objectifs prioritaires (an 1)
  'Project_ImplementationTimeline',            // 1.7 Calendrier de réalisation
] as const;

// Chapter 2: PROMOTEURS (Promoters/Founders)
export const PROMOTERS_SECTIONS = [
  'Promoters_LegalStructure',                  // 2.1 Structure juridique
  'Promoters_Profile',                         // 2.2 Profil du(des) promoteur(s)
  'Promoters_SharePercentage',                 // 2.3 Pourcentage d'action
  'Promoters_OrganizationalStructure',         // 2.4 Structure organisationnelle
] as const;

// Chapter 3: ÉTUDE DE MARCHÉ (Market Study)
export const MARKET_STUDY_SECTIONS = [
  'MarketStudy_MarketAnalysis',                // 3.1 Analyse de marché
  'MarketStudy_TrendsOpportunities',           // 3.2 Tendances et opportunités
  'MarketStudy_TargetClientele',               // 3.3 Clientèle cible
  'MarketStudy_PestelAnalysis',                // 3.4 Analyse PESTEL
  'MarketStudy_SwotAnalysis',                  // 3.5 Analyse SWOT
  'MarketStudy_CompetitiveAnalysis',           // 3.6 Analyse de la concurrence
  'MarketStudy_Positioning',                   // 3.7 Positionnement
] as const;

// Chapter 4: PLAN MARKETING & VENTES (Marketing & Sales Plan)
export const MARKETING_SALES_SECTIONS = [
  'MarketingSales_MarketingStrategy',          // 4.1 Stratégie marketing
  'MarketingSales_ProductServiceList',         // 4.2 Liste de produits/services (Tableau Prix vs Coût)
  'MarketingSales_PricingStrategy',            // 4.3 Stratégie de prix
  'MarketingSales_ActionPlan',                 // 4.4 Plan d'action marketing et ventes
  'MarketingSales_ExitStrategy',               // 4.5 Exit strategy
  'MarketingSales_BrandingStrategy',           // 4.6 Branding strategy
  'MarketingSales_SuccessFactors',             // 4.7 Success factors
] as const;

// Chapter 5: PLAN OPÉRATIONNEL (Operations Plan)
export const OPERATIONS_SECTIONS = [
  'Operations_Location',                       // 5.1 L'emplacement
  'Operations_Procurement',                    // 5.2 Approvisionnement
  'Operations_PermitsInsurance',               // 5.3 Permis / Assurances
  'Operations_ExpansionStrategy',              // 5.4 Stratégie d'expansion
  'Operations_HumanResources',                 // 5.5 Ressources humaines / Planification
  'Operations_OperationalActivity',            // 5.6 Activité opérationnelle
  'Operations_SuppliersPartners',              // 5.7 Fournisseurs / Partenaires
  'Operations_ProductionCosts',                // 5.8 Coûts de la production
  'Operations_RiskMitigation',                 // 5.9 Stratégie d'atténuation des risques
] as const;

// Chapter 6: ANALYSE FINANCIÈRE (Financial Analysis)
export const FINANCIAL_ANALYSIS_SECTIONS = [
  'Financial_StartupCosts',                    // 6.1 Coûts de démarrage
  'Financial_FixedAssets',                     // 6.2 Immobilisations
  'Financial_InventoryStock',                  // 6.3 Stocks / Marchandises
  'Financial_ProductionCosts',                 // 6.4 Coûts liés à la production
  'Financial_Projections3to5Years',            // 6.5 Prévisions financières 3-5 ans
  'Financial_IncomeStatement',                 // 6.6 États des résultats
  'Financial_BalanceSheet',                    // 6.7 Bilan
  'Financial_RepaymentStrategy',               // 6.8 Stratégie de remboursement
  'Financial_CurrentState',                    // 6.9 État financier actuel
] as const;

// Chapter 7: ANNEXE (Appendix)
export const APPENDIX_SECTIONS = [
  'Appendix_PromoterCV',                       // 8.1 CV des promoteurs
  'Appendix_PersonalBalance',                  // 8.2 Bilan personnel
  'Appendix_Survey',                           // 8.3 Sondage / Enquête
  'Appendix_ShareholderAgreement',             // 8.4 Convention d'actionnaires
  'Appendix_LayoutPlan',                       // 8.5 Plan d'aménagement / Bail
  'Appendix_IntentionLetters',                 // 8.6 Lettres d'intention / Contrat
  'Appendix_Licenses',                         // 8.7 Licence
] as const;

// Combined section names for all chapters
export const SECTION_NAMES = [
  ...EXECUTIVE_SUMMARY_SECTIONS,
  ...PROJECT_SECTIONS,
  ...PROMOTERS_SECTIONS,
  ...MARKET_STUDY_SECTIONS,
  ...MARKETING_SALES_SECTIONS,
  ...OPERATIONS_SECTIONS,
  ...FINANCIAL_ANALYSIS_SECTIONS,
  ...APPENDIX_SECTIONS,
] as const;

export type SectionName = typeof SECTION_NAMES[number];

// Section chapter groupings with labels (for UI display)
export const SECTION_CHAPTERS = [
  {
    key: 'executiveSummary',
    labelFr: '0. Sommaire Exécutif',
    labelEn: '0. Executive Summary',
    sections: EXECUTIVE_SUMMARY_SECTIONS,
  },
  {
    key: 'project',
    labelFr: '1. Le Projet',
    labelEn: '1. The Project',
    sections: PROJECT_SECTIONS,
  },
  {
    key: 'promoters',
    labelFr: '2. Promoteurs',
    labelEn: '2. Promoters',
    sections: PROMOTERS_SECTIONS,
  },
  {
    key: 'marketStudy',
    labelFr: '3. Étude de Marché',
    labelEn: '3. Market Study',
    sections: MARKET_STUDY_SECTIONS,
  },
  {
    key: 'marketingSales',
    labelFr: '4. Plan Marketing & Ventes',
    labelEn: '4. Marketing & Sales Plan',
    sections: MARKETING_SALES_SECTIONS,
  },
  {
    key: 'operations',
    labelFr: '5. Plan Opérationnel',
    labelEn: '5. Operations Plan',
    sections: OPERATIONS_SECTIONS,
  },
  {
    key: 'financialAnalysis',
    labelFr: '6. Analyse Financière',
    labelEn: '6. Financial Analysis',
    sections: FINANCIAL_ANALYSIS_SECTIONS,
  },
  {
    key: 'appendix',
    labelFr: '7. Annexe',
    labelEn: '7. Appendix',
    sections: APPENDIX_SECTIONS,
  },
] as const;

// Section display names mapping (for UI labels)
export const SECTION_DISPLAY_NAMES: Record<SectionName, { fr: string; en: string }> = {
  // Executive Summary
  'ExecutiveSummary_CompanyPresentation': { fr: '1.1 Présentation de l\'entreprise', en: '1.1 Company Presentation' },
  'ExecutiveSummary_VisionMission': { fr: '1.2 Vision et mission', en: '1.2 Vision and Mission' },
  'ExecutiveSummary_ValueProposition': { fr: '1.3 Proposition de valeur', en: '1.3 Value Proposition' },
  'ExecutiveSummary_ProductsServices': { fr: '1.4 Produits / Services', en: '1.4 Products / Services' },
  'ExecutiveSummary_TargetOpportunity': { fr: '1.5 Cible et opportunité', en: '1.5 Target and Opportunity' },
  'ExecutiveSummary_StrategyAdvantages': { fr: '1.6 Stratégie et avantages compétitifs', en: '1.6 Strategy and Competitive Advantages' },
  'ExecutiveSummary_FinancialSummary': { fr: '1.7 Synthèse financière', en: '1.7 Financial Summary' },

  // Project
  'Project_Description': { fr: '1.1 Description du projet', en: '1.1 Project Description' },
  'Project_MissionVisionValues': { fr: '1.2 Mission, vision et valeurs', en: '1.2 Mission, Vision and Values' },
  'Project_ProductsServices': { fr: '1.3 Produits ou services', en: '1.3 Products or Services' },
  'Project_Status': { fr: '1.4 État d\'avancement', en: '1.4 Project Status' },
  'Project_Differentiators': { fr: '1.5 Différenciateurs / avantages compétitifs', en: '1.5 Differentiators / Competitive Advantages' },
  'Project_PriorityObjectives': { fr: '1.6 Objectifs prioritaires (an 1)', en: '1.6 Priority Objectives (Year 1)' },
  'Project_ImplementationTimeline': { fr: '1.7 Calendrier de réalisation', en: '1.7 Implementation Timeline' },

  // Promoters
  'Promoters_LegalStructure': { fr: '2.1 Structure juridique', en: '2.1 Legal Structure' },
  'Promoters_Profile': { fr: '2.2 Profil du(des) promoteur(s)', en: '2.2 Promoter Profile(s)' },
  'Promoters_SharePercentage': { fr: '2.3 Pourcentage d\'action', en: '2.3 Share Percentage' },
  'Promoters_OrganizationalStructure': { fr: '2.4 Structure organisationnelle', en: '2.4 Organizational Structure' },

  // Market Study
  'MarketStudy_MarketAnalysis': { fr: '3.1 Analyse de marché', en: '3.1 Market Analysis' },
  'MarketStudy_TrendsOpportunities': { fr: '3.2 Tendances et opportunités', en: '3.2 Trends and Opportunities' },
  'MarketStudy_TargetClientele': { fr: '3.3 Clientèle cible', en: '3.3 Target Clientele' },
  'MarketStudy_PestelAnalysis': { fr: '3.4 Analyse PESTEL', en: '3.4 PESTEL Analysis' },
  'MarketStudy_SwotAnalysis': { fr: '3.5 Analyse SWOT', en: '3.5 SWOT Analysis' },
  'MarketStudy_CompetitiveAnalysis': { fr: '3.6 Analyse de la concurrence', en: '3.6 Competitive Analysis' },
  'MarketStudy_Positioning': { fr: '3.7 Positionnement', en: '3.7 Positioning' },

  // Marketing & Sales
  'MarketingSales_MarketingStrategy': { fr: '4.1 Stratégie marketing', en: '4.1 Marketing Strategy' },
  'MarketingSales_ProductServiceList': { fr: '4.2 Liste de produits/services', en: '4.2 Products/Services List' },
  'MarketingSales_PricingStrategy': { fr: '4.3 Stratégie de prix', en: '4.3 Pricing Strategy' },
  'MarketingSales_ActionPlan': { fr: '4.4 Plan d\'action marketing et ventes', en: '4.4 Marketing & Sales Action Plan' },
  'MarketingSales_ExitStrategy': { fr: '4.5 Exit strategy', en: '4.5 Exit Strategy' },
  'MarketingSales_BrandingStrategy': { fr: '4.6 Branding strategy', en: '4.6 Branding Strategy' },
  'MarketingSales_SuccessFactors': { fr: '4.7 Success factors', en: '4.7 Success Factors' },

  // Operations
  'Operations_Location': { fr: '5.1 L\'emplacement', en: '5.1 Location' },
  'Operations_Procurement': { fr: '5.2 Approvisionnement', en: '5.2 Procurement' },
  'Operations_PermitsInsurance': { fr: '5.3 Permis / Assurances', en: '5.3 Permits / Insurance' },
  'Operations_ExpansionStrategy': { fr: '5.4 Stratégie d\'expansion', en: '5.4 Expansion Strategy' },
  'Operations_HumanResources': { fr: '5.5 Ressources humaines / Planification', en: '5.5 Human Resources / Planning' },
  'Operations_OperationalActivity': { fr: '5.6 Activité opérationnelle', en: '5.6 Operational Activity' },
  'Operations_SuppliersPartners': { fr: '5.7 Fournisseurs / Partenaires', en: '5.7 Suppliers / Partners' },
  'Operations_ProductionCosts': { fr: '5.8 Coûts de la production', en: '5.8 Production Costs' },
  'Operations_RiskMitigation': { fr: '5.9 Stratégie d\'atténuation des risques', en: '5.9 Risk Mitigation Strategy' },

  // Financial Analysis
  'Financial_StartupCosts': { fr: '6.1 Coûts de démarrage', en: '6.1 Startup Costs' },
  'Financial_FixedAssets': { fr: '6.2 Immobilisations', en: '6.2 Fixed Assets' },
  'Financial_InventoryStock': { fr: '6.3 Stocks / Marchandises', en: '6.3 Inventory / Stock' },
  'Financial_ProductionCosts': { fr: '6.4 Coûts liés à la production', en: '6.4 Production Related Costs' },
  'Financial_Projections3to5Years': { fr: '6.5 Prévisions financières 3-5 ans', en: '6.5 Financial Projections 3-5 Years' },
  'Financial_IncomeStatement': { fr: '6.6 États des résultats', en: '6.6 Income Statement' },
  'Financial_BalanceSheet': { fr: '6.7 Bilan', en: '6.7 Balance Sheet' },
  'Financial_RepaymentStrategy': { fr: '6.8 Stratégie de remboursement', en: '6.8 Repayment Strategy' },
  'Financial_CurrentState': { fr: '6.9 État financier actuel', en: '6.9 Current Financial State' },

  // Appendix
  'Appendix_PromoterCV': { fr: '8.1 CV des promoteurs', en: '8.1 Promoter CVs' },
  'Appendix_PersonalBalance': { fr: '8.2 Bilan personnel', en: '8.2 Personal Balance Sheet' },
  'Appendix_Survey': { fr: '8.3 Sondage / Enquête', en: '8.3 Survey / Research' },
  'Appendix_ShareholderAgreement': { fr: '8.4 Convention d\'actionnaires', en: '8.4 Shareholder Agreement' },
  'Appendix_LayoutPlan': { fr: '8.5 Plan d\'aménagement / Bail', en: '8.5 Layout Plan / Lease' },
  'Appendix_IntentionLetters': { fr: '8.6 Lettres d\'intention / Contrat', en: '8.6 Intention Letters / Contract' },
  'Appendix_Licenses': { fr: '8.7 Licence', en: '8.7 Licenses' },
};
