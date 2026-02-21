import { apiClient } from './api-client';
import type {
  AIPromptDto,
  AIPromptVersionDto,
  AIPromptTestResult,
  AIPromptStats,
  CreateAIPromptRequest,
  UpdateAIPromptRequest,
  TestAIPromptRequest,
  TestDraftAIPromptRequest,
  RollbackAIPromptRequest,
  AIPromptFilter,
} from '../types/ai-prompt';

const API_BASE = '/api/v1/admin/ai-prompts';

/**
 * Service for managing AI prompts
 */
export const aiPromptService = {
  /**
   * Get all prompts with optional filtering
   */
  async getAll(filter?: AIPromptFilter): Promise<AIPromptDto[]> {
    const params: Record<string, string | boolean> = {};
    if (filter?.category) params.category = filter.category;
    if (filter?.planType) params.planType = filter.planType;
    if (filter?.language) params.language = filter.language;
    if (filter?.isActive !== undefined) params.isActive = filter.isActive;

    const response = await apiClient.get<AIPromptDto[]>(API_BASE, params);
    return response.data;
  },

  /**
   * Get a single prompt by ID
   */
  async getById(promptId: string): Promise<AIPromptDto> {
    const response = await apiClient.get<AIPromptDto>(`${API_BASE}/${promptId}`);
    return response.data;
  },

  /**
   * Create a new prompt
   */
  async create(request: CreateAIPromptRequest): Promise<string> {
    const response = await apiClient.post<{ id: string }>(API_BASE, request);
    return response.data.id;
  },

  /**
   * Update an existing prompt
   */
  async update(promptId: string, request: UpdateAIPromptRequest): Promise<boolean> {
    await apiClient.put(`${API_BASE}/${promptId}`, request);
    return true;
  },

  /**
   * Delete a prompt
   */
  async delete(promptId: string): Promise<boolean> {
    await apiClient.delete(`${API_BASE}/${promptId}`);
    return true;
  },

  /**
   * Toggle prompt active status
   */
  async toggleStatus(promptId: string, isActive: boolean): Promise<boolean> {
    await apiClient.patch(`${API_BASE}/${promptId}/status`, isActive);
    return true;
  },

  /**
   * Update prompt status (alternative endpoint)
   */
  async updateStatus(promptId: string, status: 'active' | 'inactive'): Promise<boolean> {
    await apiClient.put(`${API_BASE}/${promptId}/status`, { status });
    return true;
  },

  /**
   * Test an existing prompt
   */
  async test(request: TestAIPromptRequest): Promise<AIPromptTestResult> {
    const response = await apiClient.post<AIPromptTestResult>(`${API_BASE}/test`, request);
    return response.data;
  },

  /**
   * Test a draft prompt without saving
   */
  async testDraft(request: TestDraftAIPromptRequest): Promise<AIPromptTestResult> {
    const response = await apiClient.post<AIPromptTestResult>(`${API_BASE}/test-draft`, request);
    return response.data;
  },

  /**
   * Get version history for a prompt
   */
  async getVersionHistory(promptId: string): Promise<AIPromptVersionDto[]> {
    const response = await apiClient.get<AIPromptVersionDto[]>(`${API_BASE}/${promptId}/history`);
    return response.data;
  },

  /**
   * Rollback a prompt to a previous version
   */
  async rollback(promptId: string, request: RollbackAIPromptRequest): Promise<boolean> {
    await apiClient.post(`${API_BASE}/${promptId}/rollback`, request);
    return true;
  },

  /**
   * Get prompt statistics
   */
  async getStats(): Promise<AIPromptStats[]> {
    const response = await apiClient.get<AIPromptStats[]>(`${API_BASE}/stats`);
    return response.data;
  },

  /**
   * Migrate default prompts to database
   */
  async migrateDefaults(): Promise<{ migrated: number; prompts: string[] }> {
    const response = await apiClient.post<{ migrated: number; prompts: string[] }>(
      `${API_BASE}/migrate-defaults`
    );
    return response.data;
  },

  /**
   * Create a new version of a prompt
   */
  async createVersion(parentPromptId: string, request: CreateAIPromptRequest): Promise<string> {
    const response = await apiClient.post<{ id: string }>(
      `${API_BASE}/${parentPromptId}/versions`,
      request
    );
    return response.data.id;
  },

  /**
   * Get all versions of a prompt (parent-child relationship)
   */
  async getVersions(parentPromptId: string): Promise<AIPromptDto[]> {
    const response = await apiClient.get<AIPromptDto[]>(`${API_BASE}/${parentPromptId}/versions`);
    return response.data;
  },
};

export default aiPromptService;
