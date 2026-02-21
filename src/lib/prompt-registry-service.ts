import { apiClient } from './api-client';
import {
  PromptTemplateDto,
  PromptTemplateListDto,
  PromptVersionHistoryDto,
  PromptTestResultDto,
  PromptPerformanceDto,
  PromptPerformanceSummaryDto,
  CreatePromptTemplateRequest,
  UpdatePromptTemplateRequest,
  TestPromptRequest,
  TestDraftPromptRequest,
  PromptRegistryFilter,
  SetAliasRequest,
  PaginatedList,
  SectionType,
  BusinessPlanType,
} from '../types/prompt-registry';

const BASE_URL = '/api/v1/admin/prompt-registry';

/**
 * Helper function to handle API responses that may be wrapped in Result<T>
 */
function handleResponse<T>(data: any): T {
  // Check if it's a Result wrapper
  if (data && typeof data === 'object' && 'isSuccess' in data) {
    if (data.isSuccess && data.value !== undefined) {
      return data.value as T;
    } else if (!data.isSuccess) {
      throw new Error(data.error?.message || 'Operation failed');
    }
  }
  // Direct value response
  return data as T;
}

/**
 * Service for managing prompt templates in the admin registry
 */
export const promptRegistryService = {
  /**
   * Gets all prompt templates with filtering and pagination
   */
  async getAll(filter?: PromptRegistryFilter): Promise<PaginatedList<PromptTemplateListDto>> {
    try {
      const params = new URLSearchParams();

      if (filter) {
        if (filter.sectionType !== null && filter.sectionType !== undefined) {
          params.append('sectionType', filter.sectionType.toString());
        }
        if (filter.planType !== null && filter.planType !== undefined) {
          params.append('planType', filter.planType.toString());
        }
        if (filter.isActive !== null && filter.isActive !== undefined) {
          params.append('isActive', filter.isActive.toString());
        }
        if (filter.alias !== null && filter.alias !== undefined) {
          params.append('alias', filter.alias.toString());
        }
        if (filter.industryCategory) {
          params.append('industryCategory', filter.industryCategory);
        }
        if (filter.search) {
          params.append('search', filter.search);
        }
        if (filter.pageNumber) {
          params.append('pageNumber', filter.pageNumber.toString());
        }
        if (filter.pageSize) {
          params.append('pageSize', filter.pageSize.toString());
        }
        if (filter.sortBy) {
          params.append('sortBy', filter.sortBy);
        }
        if (filter.sortDirection) {
          params.append('sortDirection', filter.sortDirection);
        }
      }

      const queryString = params.toString();
      const url = queryString ? `${BASE_URL}?${queryString}` : BASE_URL;
      const response = await apiClient.get(url);
      return handleResponse<PaginatedList<PromptTemplateListDto>>(response.data);
    } catch (error: any) {
      console.error('Error in getAll:', error);
      throw error;
    }
  },

  /**
   * Gets a single prompt template by ID
   */
  async getById(id: string): Promise<PromptTemplateDto> {
    try {
      const response = await apiClient.get(`${BASE_URL}/${id}`);
      return handleResponse<PromptTemplateDto>(response.data);
    } catch (error: any) {
      console.error('Error in getById:', error);
      throw error;
    }
  },

  /**
   * Creates a new prompt template
   */
  async create(request: CreatePromptTemplateRequest): Promise<string> {
    try {
      const response = await apiClient.post(BASE_URL, request);
      return handleResponse<string>(response.data);
    } catch (error: any) {
      console.error('Error in create:', error);
      throw error;
    }
  },

  /**
   * Updates an existing prompt template
   */
  async update(id: string, request: UpdatePromptTemplateRequest): Promise<void> {
    try {
      const response = await apiClient.put(`${BASE_URL}/${id}`, request);
      handleResponse<void>(response.data);
    } catch (error: any) {
      console.error('Error in update:', error);
      throw error;
    }
  },

  /**
   * Deletes a prompt template
   */
  async delete(id: string): Promise<void> {
    try {
      const response = await apiClient.delete(`${BASE_URL}/${id}`);
      handleResponse<void>(response.data);
    } catch (error: any) {
      console.error('Error in delete:', error);
      throw error;
    }
  },

  /**
   * Activates a prompt template (deactivates others for same section/plan)
   */
  async activate(id: string): Promise<void> {
    try {
      const response = await apiClient.post(`${BASE_URL}/${id}/activate`);
      handleResponse<void>(response.data);
    } catch (error: any) {
      console.error('Error in activate:', error);
      throw error;
    }
  },

  /**
   * Deactivates a prompt template
   */
  async deactivate(id: string): Promise<void> {
    try {
      const response = await apiClient.post(`${BASE_URL}/${id}/deactivate`);
      handleResponse<void>(response.data);
    } catch (error: any) {
      console.error('Error in deactivate:', error);
      throw error;
    }
  },

  /**
   * Sets the deployment alias for a prompt template
   */
  async setAlias(id: string, request: SetAliasRequest): Promise<void> {
    try {
      const response = await apiClient.post(`${BASE_URL}/${id}/alias`, request);
      handleResponse<void>(response.data);
    } catch (error: any) {
      console.error('Error in setAlias:', error);
      throw error;
    }
  },

  /**
   * Creates a new version of an existing prompt template
   */
  async createVersion(id: string): Promise<string> {
    try {
      const response = await apiClient.post(`${BASE_URL}/${id}/create-version`);
      return handleResponse<string>(response.data);
    } catch (error: any) {
      console.error('Error in createVersion:', error);
      throw error;
    }
  },

  /**
   * Gets the version history for a section/plan type combination
   */
  async getVersionHistory(
    sectionType: SectionType,
    planType: BusinessPlanType,
    industryCategory?: string | null
  ): Promise<PromptVersionHistoryDto[]> {
    try {
      const params = new URLSearchParams();
      params.append('sectionType', sectionType.toString());
      params.append('planType', planType.toString());
      if (industryCategory) {
        params.append('industryCategory', industryCategory);
      }

      const response = await apiClient.get(`${BASE_URL}/versions?${params.toString()}`);
      return handleResponse<PromptVersionHistoryDto[]>(response.data);
    } catch (error: any) {
      console.error('Error in getVersionHistory:', error);
      throw error;
    }
  },

  /**
   * Rolls back to a specific version (activates it)
   */
  async rollback(id: string): Promise<void> {
    try {
      const response = await apiClient.post(`${BASE_URL}/${id}/rollback`);
      handleResponse<void>(response.data);
    } catch (error: any) {
      console.error('Error in rollback:', error);
      throw error;
    }
  },

  /**
   * Tests an existing prompt with sample data
   */
  async testPrompt(id: string, request: TestPromptRequest): Promise<PromptTestResultDto> {
    try {
      const response = await apiClient.post(`${BASE_URL}/${id}/test`, request);
      return handleResponse<PromptTestResultDto>(response.data);
    } catch (error: any) {
      console.error('Error in testPrompt:', error);
      throw error;
    }
  },

  /**
   * Tests a draft prompt (before saving) with sample data
   */
  async testDraftPrompt(request: TestDraftPromptRequest): Promise<PromptTestResultDto> {
    try {
      const response = await apiClient.post(`${BASE_URL}/test-draft`, request);
      return handleResponse<PromptTestResultDto>(response.data);
    } catch (error: any) {
      console.error('Error in testDraftPrompt:', error);
      throw error;
    }
  },

  /**
   * Gets detailed performance metrics for a prompt template
   */
  async getPerformance(id: string, startDate?: string): Promise<PromptPerformanceDto> {
    try {
      const params = startDate ? `?startDate=${startDate}` : '';
      const response = await apiClient.get(`${BASE_URL}/${id}/performance${params}`);
      return handleResponse<PromptPerformanceDto>(response.data);
    } catch (error: any) {
      console.error('Error in getPerformance:', error);
      throw error;
    }
  },

  /**
   * Gets a summary of performance across all prompts
   */
  async getPerformanceSummary(): Promise<PromptPerformanceSummaryDto> {
    try {
      const response = await apiClient.get(`${BASE_URL}/performance-summary`);
      return handleResponse<PromptPerformanceSummaryDto>(response.data);
    } catch (error: any) {
      console.error('Error in getPerformanceSummary:', error);
      throw error;
    }
  },
};

export default promptRegistryService;
