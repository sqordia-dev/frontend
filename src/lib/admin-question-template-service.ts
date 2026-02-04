import { apiClient } from './api-client';
import type {
  AdminQuestionTemplate,
  CreateQuestionTemplateRequest,
  UpdateQuestionTemplateRequest,
} from '../types/admin-question-template';

const BASE_URL = '/api/v1/admin/question-templates';

export const adminQuestionTemplateService = {
  async getAll(params?: {
    stepNumber?: number;
    personaType?: string;
    isActive?: boolean;
  }): Promise<AdminQuestionTemplate[]> {
    const queryParams: Record<string, string> = {};
    if (params?.stepNumber) queryParams.stepNumber = String(params.stepNumber);
    if (params?.personaType) queryParams.personaType = params.personaType;
    if (params?.isActive !== undefined) queryParams.isActive = String(params.isActive);

    const response = await apiClient.get<AdminQuestionTemplate[]>(BASE_URL, queryParams);
    return Array.isArray(response.data) ? response.data : [];
  },

  async getById(id: string): Promise<AdminQuestionTemplate> {
    const response = await apiClient.get<AdminQuestionTemplate>(`${BASE_URL}/${id}`);
    return response.data;
  },

  async create(data: CreateQuestionTemplateRequest): Promise<string> {
    const response = await apiClient.post<{ id: string }>(BASE_URL, data);
    return response.data?.id;
  },

  async update(id: string, data: UpdateQuestionTemplateRequest): Promise<void> {
    await apiClient.put(`${BASE_URL}/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },

  async reorder(items: { questionId: string; order: number }[]): Promise<void> {
    await apiClient.put(`${BASE_URL}/reorder`, { items });
  },

  async toggleStatus(id: string, isActive: boolean): Promise<void> {
    await apiClient.patch(`${BASE_URL}/${id}/status`, isActive);
  },
};
