export interface AdminQuestionTemplate {
  id: string;
  personaType: string | null;
  stepNumber: number;
  questionText: string;
  questionTextEN: string | null;
  helpText: string | null;
  helpTextEN: string | null;
  questionType: string;
  order: number;
  isRequired: boolean;
  section: string | null;
  options: string | null;
  optionsEN: string | null;
  validationRules: string | null;
  conditionalLogic: string | null;
  isActive: boolean;
  created: string;
  lastModified: string | null;
}

export interface CreateQuestionTemplateRequest {
  questionText: string;
  questionTextEN?: string;
  helpText?: string;
  helpTextEN?: string;
  questionType: string;
  stepNumber: number;
  personaType?: string | null;
  order: number;
  isRequired: boolean;
  section?: string;
  options?: string;
  optionsEN?: string;
  validationRules?: string;
  conditionalLogic?: string;
}

export interface UpdateQuestionTemplateRequest {
  questionText?: string;
  questionTextEN?: string;
  helpText?: string;
  helpTextEN?: string;
  questionType?: string;
  stepNumber?: number;
  personaType?: string | null;
  order?: number;
  isRequired?: boolean;
  section?: string;
  options?: string;
  optionsEN?: string;
  validationRules?: string;
  conditionalLogic?: string;
  isActive?: boolean;
}

export const QUESTION_TYPES = [
  { value: 'ShortText', label: 'Short Text' },
  { value: 'LongText', label: 'Long Text' },
  { value: 'SingleChoice', label: 'Single Choice' },
  { value: 'MultipleChoice', label: 'Multiple Choice' },
  { value: 'Number', label: 'Number' },
  { value: 'Currency', label: 'Currency' },
  { value: 'Percentage', label: 'Percentage' },
  { value: 'Date', label: 'Date' },
  { value: 'YesNo', label: 'Yes / No' },
  { value: 'Scale', label: 'Scale' },
] as const;

export const PERSONA_TYPES = [
  { value: '__all__', label: 'All Personas' },
  { value: 'Entrepreneur', label: 'Entrepreneur' },
  { value: 'Consultant', label: 'Consultant' },
  { value: 'OBNL', label: 'OBNL (Non-profit)' },
] as const;

export const STEP_DEFINITIONS = [
  { number: 1, label: 'Vision & Mission', labelFR: 'Vision et mission' },
  { number: 2, label: 'Market & Customers', labelFR: 'March\u00e9 et clients' },
  { number: 3, label: 'Products & Services', labelFR: 'Produits et services' },
  { number: 4, label: 'Strategy & Operations', labelFR: 'Strat\u00e9gie et op\u00e9rations' },
  { number: 5, label: 'Financials & Growth', labelFR: 'Finances et croissance' },
] as const;
