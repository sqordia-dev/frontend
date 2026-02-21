import type { AdminQuestionTemplate } from './admin-question-template';

/**
 * Questionnaire version status
 */
export type QuestionnaireVersionStatus = 'Draft' | 'Published' | 'Archived';

/**
 * Questionnaire step configuration
 */
export interface QuestionnaireStep {
  id: string;
  stepNumber: number;
  titleFR: string;
  titleEN: string | null;
  descriptionFR: string | null;
  descriptionEN: string | null;
  isActive: boolean;
  questionCount: number;
}

/**
 * Questionnaire version summary
 */
export interface QuestionnaireVersion {
  id: string;
  versionNumber: number;
  status: QuestionnaireVersionStatus;
  notes: string | null;
  createdByUserId: string;
  createdByUserName: string | null;
  createdAt: string;
  publishedAt: string | null;
  publishedByUserName: string | null;
  questionCount: number;
}

/**
 * Questionnaire version with full details
 */
export interface QuestionnaireVersionDetail extends QuestionnaireVersion {
  questions: AdminQuestionTemplate[];
  steps: QuestionnaireStep[];
}

/**
 * Request to create a new draft version
 */
export interface CreateQuestionnaireVersionRequest {
  notes?: string;
}

/**
 * Request to update a step configuration
 */
export interface UpdateQuestionnaireStepRequest {
  titleFR?: string;
  titleEN?: string;
  descriptionFR?: string;
  descriptionEN?: string;
}
