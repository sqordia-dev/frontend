import { apiClient } from './api-client';

export interface GenerateCmsContentRequest {
  brief: string;
  blockType: string;
  language: string;
  sectionContext?: string;
  useWebSearch?: boolean;
}

export interface CmsAiGenerationResult {
  content: string;
  citations: string[];
  modelUsed: string;
}

export const cmsAiService = {
  async generate(request: GenerateCmsContentRequest): Promise<CmsAiGenerationResult> {
    const res = await apiClient.post<CmsAiGenerationResult>('/api/v1/admin/cms/ai/generate', request);
    return res.data;
  },

  streamUrl: '/api/v1/admin/cms/ai/stream',
};
