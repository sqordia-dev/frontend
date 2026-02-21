import { apiClient } from './api-client';
import type {
  QuestionnaireVersion,
  QuestionnaireVersionDetail,
  QuestionnaireStep,
  CreateQuestionnaireVersionRequest,
  UpdateQuestionnaireStepRequest,
} from '../types/questionnaire-version';
import type {
  AdminQuestionTemplate,
  CreateQuestionTemplateRequest,
  UpdateQuestionTemplateRequest,
} from '../types/admin-question-template';

const BASE_URL = '/api/v1/admin/questionnaire-versions';

export const questionnaireVersionService = {
  // ==================== Version Management ====================

  /**
   * Get all versions (history)
   */
  async getVersionHistory(): Promise<QuestionnaireVersion[]> {
    const response = await apiClient.get<QuestionnaireVersion[]>(BASE_URL);
    return Array.isArray(response.data) ? response.data : [];
  },

  /**
   * Get the active draft version (if any)
   */
  async getActiveDraft(): Promise<QuestionnaireVersionDetail | null> {
    const response = await apiClient.get<QuestionnaireVersionDetail>(`${BASE_URL}/active`);
    // 204 No Content returns null
    if (!response.data) return null;
    return response.data;
  },

  /**
   * Get the currently published version
   */
  async getPublishedVersion(): Promise<QuestionnaireVersionDetail> {
    const response = await apiClient.get<QuestionnaireVersionDetail>(`${BASE_URL}/published`);
    return response.data;
  },

  /**
   * Get a specific version by ID
   */
  async getVersionById(versionId: string): Promise<QuestionnaireVersionDetail> {
    const response = await apiClient.get<QuestionnaireVersionDetail>(`${BASE_URL}/${versionId}`);
    return response.data;
  },

  /**
   * Create a new draft version (clones from published)
   */
  async createDraft(notes?: string): Promise<QuestionnaireVersionDetail> {
    const request: CreateQuestionnaireVersionRequest = { notes };
    const response = await apiClient.post<QuestionnaireVersionDetail>(BASE_URL, request);
    return response.data;
  },

  /**
   * Publish a draft version
   */
  async publishDraft(versionId: string): Promise<QuestionnaireVersion> {
    const response = await apiClient.post<QuestionnaireVersion>(`${BASE_URL}/${versionId}/publish`);
    return response.data;
  },

  /**
   * Discard (delete) a draft version
   */
  async discardDraft(versionId: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${versionId}`);
  },

  /**
   * Restore an archived version as a new draft
   */
  async restoreVersion(versionId: string): Promise<QuestionnaireVersionDetail> {
    const response = await apiClient.post<QuestionnaireVersionDetail>(`${BASE_URL}/${versionId}/restore`);
    return response.data;
  },

  // ==================== Draft Question Editing ====================

  /**
   * Create a new question in the draft version
   */
  async createQuestion(
    versionId: string,
    data: CreateQuestionTemplateRequest
  ): Promise<AdminQuestionTemplate> {
    const response = await apiClient.post<AdminQuestionTemplate>(
      `${BASE_URL}/${versionId}/questions`,
      data
    );
    return response.data;
  },

  /**
   * Update a question in the draft version
   */
  async updateQuestion(
    versionId: string,
    questionId: string,
    data: UpdateQuestionTemplateRequest
  ): Promise<AdminQuestionTemplate> {
    const response = await apiClient.put<AdminQuestionTemplate>(
      `${BASE_URL}/${versionId}/questions/${questionId}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a question from the draft version
   */
  async deleteQuestion(versionId: string, questionId: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${versionId}/questions/${questionId}`);
  },

  /**
   * Reorder questions in the draft version
   */
  async reorderQuestions(
    versionId: string,
    items: { questionId: string; order: number }[]
  ): Promise<void> {
    await apiClient.put(`${BASE_URL}/${versionId}/questions/reorder`, { items });
  },

  // ==================== Draft Step Editing ====================

  /**
   * Update a step configuration in the draft version
   */
  async updateStep(
    versionId: string,
    stepNumber: number,
    data: UpdateQuestionnaireStepRequest
  ): Promise<QuestionnaireStep> {
    const response = await apiClient.put<QuestionnaireStep>(
      `${BASE_URL}/${versionId}/steps/${stepNumber}`,
      data
    );
    return response.data;
  },
};
