import { apiClient } from './api-client';

export interface EmailTemplateDto {
  id: string;
  name: string;
  category: string;
  subjectFr: string;
  subjectEn: string;
  bodyFr: string;
  bodyEn: string;
  variablesJson: string;
  isActive: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailTemplateRequest {
  name: string;
  category: string;
  subjectFr: string;
  subjectEn: string;
  bodyFr: string;
  bodyEn: string;
  variablesJson?: string;
}

export interface UpdateEmailTemplateRequest {
  subjectFr: string;
  subjectEn: string;
  bodyFr: string;
  bodyEn: string;
  variablesJson?: string;
  isActive?: boolean;
}

export interface GenerateEmailTemplateRequest {
  templateName: string;
  purpose: string;
  variables: string[];
  tone?: string;
}

export const emailTemplateService = {
  async getAll(): Promise<EmailTemplateDto[]> {
    const res = await apiClient.get<EmailTemplateDto[]>('/api/v1/admin/email-templates');
    return res.data;
  },

  async getById(id: string): Promise<EmailTemplateDto> {
    const res = await apiClient.get<EmailTemplateDto>(`/api/v1/admin/email-templates/${id}`);
    return res.data;
  },

  async create(request: CreateEmailTemplateRequest): Promise<EmailTemplateDto> {
    const res = await apiClient.post<EmailTemplateDto>('/api/v1/admin/email-templates', request);
    return res.data;
  },

  async update(id: string, request: UpdateEmailTemplateRequest): Promise<EmailTemplateDto> {
    const res = await apiClient.put<EmailTemplateDto>(`/api/v1/admin/email-templates/${id}`, request);
    return res.data;
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/admin/email-templates/${id}`);
  },

  async generate(request: GenerateEmailTemplateRequest): Promise<EmailTemplateDto> {
    const res = await apiClient.post<EmailTemplateDto>('/api/v1/admin/email-templates/generate', request);
    return res.data;
  },

  async preview(id: string, language: string = 'en', variables: Record<string, string> = {}): Promise<string> {
    const res = await apiClient.post<string>(`/api/v1/admin/email-templates/${id}/preview`, { language, variables });
    return res.data;
  },
};
