/**
 * Questionnaire Types
 * Types for the questionnaire flow components
 */

// Question type determines which input component to render
export type QuestionType = 'text' | 'textarea' | 'select' | 'multiselect' | 'number' | 'date';

// Answer can be various types depending on question type
export type Answer = string | string[] | number | Date | null;

// Option for select/multiselect questions
export interface Option {
  value: string;
  label: string;
  description?: string;
}

// Individual question definition
export interface Question {
  id: string;
  text: string;
  description?: string;
  type: QuestionType;
  required: boolean;
  options?: Option[];
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  tip?: string;
  example?: string;
  order?: number;
  section?: string;
}

// Question template containing multiple questions
export interface QuestionTemplate {
  id: string;
  name: string;
  description?: string;
  questions: Question[];
  estimatedMinutes?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Questionnaire state for tracking progress
export interface QuestionnaireState {
  currentIndex: number;
  answers: Record<string, Answer>;
  isComplete: boolean;
  startedAt?: string;
  completedAt?: string;
}

// Save status for auto-save functionality
export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error';

// Props for questionnaire components
export interface QuestionnaireContainerProps {
  planId: string;
  onComplete?: () => void;
  initialAnswers?: Record<string, Answer>;
}

export interface QuestionnaireHeaderProps {
  planTitle?: string;
  saveStatus: SaveStatus;
  onBack?: () => void;
}

export interface QuestionnaireProgressProps {
  currentIndex: number;
  totalQuestions: number;
  estimatedMinutesRemaining?: number;
}

export interface QuestionCardProps {
  question: Question;
  value: Answer;
  onChange: (value: Answer) => void;
  isActive?: boolean;
  questionNumber?: number;
}

export interface QuestionInputProps {
  question: Question;
  value: Answer;
  onChange: (value: Answer) => void;
  autoFocus?: boolean;
}

export interface QuestionnaireNavigationProps {
  currentIndex: number;
  totalQuestions: number;
  canGoNext: boolean;
  canGoPrevious: boolean;
  isLastQuestion: boolean;
  isRequired: boolean;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onComplete: () => void;
}

// Input component specific props
export interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  autoFocus?: boolean;
  id?: string;
  'aria-describedby'?: string;
}

export interface TextareaInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  autoFocus?: boolean;
  rows?: number;
  id?: string;
  'aria-describedby'?: string;
}

export interface SelectInputProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  id?: string;
  'aria-describedby'?: string;
}

export interface MultiSelectInputProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: Option[];
  id?: string;
  'aria-describedby'?: string;
}

export interface NumberInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  autoFocus?: boolean;
  id?: string;
  'aria-describedby'?: string;
}

export interface DateInputProps {
  value: Date | null;
  onChange: (value: Date | null) => void;
  min?: string;
  max?: string;
  autoFocus?: boolean;
  id?: string;
  'aria-describedby'?: string;
}

// API response types
export interface QuestionnaireResponse {
  template: QuestionTemplate;
  answers: Record<string, Answer>;
  progress: {
    completedQuestions: number;
    totalQuestions: number;
    completionPercentage: number;
  };
}

export interface SaveAnswersResponse {
  success: boolean;
  savedAt: string;
}

export interface SubmitQuestionnaireResponse {
  success: boolean;
  planId: string;
  redirectUrl?: string;
}
