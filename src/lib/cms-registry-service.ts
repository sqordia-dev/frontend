import { apiClient } from './api-client';

// Types matching backend response DTOs
export interface CmsPageRegistryResponse {
  id: string;
  key: string;
  label: string;
  description: string | null;
  sortOrder: number;
  iconName: string | null;
  specialRenderer: string | null;
  sections: CmsSectionResponse[];
}

export interface CmsPageDetailResponse {
  id: string;
  key: string;
  label: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  iconName: string | null;
  specialRenderer: string | null;
  sections: CmsSectionDetailResponse[];
  created: string;
  lastModified: string | null;
}

export interface CmsSectionResponse {
  id: string;
  key: string;
  label: string;
  description: string | null;
  sortOrder: number;
  iconName: string | null;
}

export interface CmsSectionDetailResponse {
  id: string;
  cmsPageId: string;
  key: string;
  label: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  iconName: string | null;
  blockDefinitions: CmsBlockDefinitionResponse[];
}

export interface CmsBlockDefinitionResponse {
  id: string;
  cmsSectionId: string;
  blockKey: string;
  blockType: string;
  label: string;
  description: string | null;
  defaultContent: string | null;
  sortOrder: number;
  isRequired: boolean;
  isActive: boolean;
  validationRules: string | null;
  metadataSchema: string | null;
  placeholder: string | null;
  maxLength: number;
}

// Helper to unwrap backend responses that may be Result<T> wrapped
function unwrap<T>(data: unknown): T {
  if (data && typeof data === 'object' && 'isSuccess' in data) {
    const result = data as { isSuccess: boolean; value?: T; error?: { message: string } };
    if (result.isSuccess && result.value !== undefined) {
      return result.value;
    }
    if (!result.isSuccess) {
      throw new Error(result.error?.message || 'Operation failed');
    }
  }
  return data as T;
}

// Check if the error indicates CMS registry tables haven't been migrated yet
function isCmsTablesNotAvailable(error: unknown): boolean {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { code?: string } } };
    return axiosError.response?.data?.code === 'CmsRegistry.TablesNotAvailable';
  }
  return false;
}

export const cmsRegistryService = {
  /**
   * Get all pages with their sections from the registry.
   * Falls back to empty array if tables are not available.
   */
  async getPages(): Promise<CmsPageRegistryResponse[]> {
    try {
      const response = await apiClient.get<CmsPageRegistryResponse[]>('/api/v1/admin/cms/registry/pages');
      return unwrap<CmsPageRegistryResponse[]>(response.data);
    } catch (error: unknown) {
      if (isCmsTablesNotAvailable(error)) {
        console.warn('CMS registry tables not available, using static fallback');
        return [];
      }
      // For other errors (including 500), return empty to allow static fallback
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 500) {
        console.warn('CMS registry API error, using static fallback');
        return [];
      }
      throw error;
    }
  },

  /**
   * Get a specific page with its sections and block definitions.
   */
  async getPage(pageKey: string): Promise<CmsPageDetailResponse | null> {
    try {
      const response = await apiClient.get<CmsPageDetailResponse>(`/api/v1/admin/cms/registry/pages/${pageKey}`);
      return unwrap<CmsPageDetailResponse>(response.data);
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        return null;
      }
      if (isCmsTablesNotAvailable(error) || axiosError.response?.status === 500) {
        console.warn('CMS registry tables not available');
        return null;
      }
      throw error;
    }
  },

  /**
   * Get all sections for a specific page.
   */
  async getSections(pageKey: string): Promise<CmsSectionResponse[]> {
    try {
      const response = await apiClient.get<CmsSectionResponse[]>(`/api/v1/admin/cms/registry/pages/${pageKey}/sections`);
      return unwrap<CmsSectionResponse[]>(response.data);
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404 || isCmsTablesNotAvailable(error)) {
        return [];
      }
      throw error;
    }
  },

  /**
   * Get all block definitions for a specific section.
   */
  async getBlockDefinitions(sectionKey: string): Promise<CmsBlockDefinitionResponse[]> {
    try {
      const response = await apiClient.get<CmsBlockDefinitionResponse[]>(`/api/v1/admin/cms/registry/sections/${sectionKey}/block-definitions`);
      return unwrap<CmsBlockDefinitionResponse[]>(response.data);
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404 || isCmsTablesNotAvailable(error)) {
        return [];
      }
      throw error;
    }
  },

  /**
   * Validate if a section key exists in the registry.
   */
  async validateSectionKey(sectionKey: string): Promise<boolean> {
    try {
      const response = await apiClient.get<boolean>(`/api/v1/admin/cms/registry/sections/${sectionKey}/validate`);
      return unwrap<boolean>(response.data);
    } catch (error: unknown) {
      if (isCmsTablesNotAvailable(error)) {
        return false;
      }
      throw error;
    }
  },

  /**
   * Seed the database registry from the static registry.
   * Admin only operation.
   */
  async seedRegistry(): Promise<void> {
    try {
      await apiClient.post('/api/v1/admin/cms/registry/seed');
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number; data?: { error?: { message?: string } } } };
      if (axiosError.response?.status === 400) {
        // Already seeded, not an error
        console.info('CMS registry already seeded');
        return;
      }
      throw error;
    }
  },
};
