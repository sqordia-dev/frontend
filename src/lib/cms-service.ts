import { apiClient } from './api-client';
import {
  CmsVersion,
  CmsVersionDetail,
  CmsContentBlock,
  CmsAsset,
  PublishedContent,
  CreateCmsVersionRequest,
  UpdateCmsVersionRequest,
  CreateContentBlockRequest,
  UpdateContentBlockRequest,
  BulkUpdateContentBlocksRequest,
  ReorderContentBlocksRequest,
} from './cms-types';

// Helper to unwrap backend responses that may be Result<T> wrapped
function unwrap<T>(data: any): T {
  if (data && typeof data === 'object' && 'isSuccess' in data) {
    if (data.isSuccess && data.value !== undefined) {
      return data.value as T;
    }
    if (!data.isSuccess) {
      throw new Error(data.error?.message || 'Operation failed');
    }
  }
  return data as T;
}

// Check if the error indicates CMS tables haven't been migrated yet
function isCmsTablesNotAvailable(error: any): boolean {
  return error.response?.data?.code === 'Cms.TablesNotAvailable';
}

export const cmsService = {
  // === Version Operations ===

  async getVersions(): Promise<CmsVersion[]> {
    try {
      const response = await apiClient.get<CmsVersion[]>('/api/v1/admin/cms/versions');
      return unwrap<CmsVersion[]>(response.data);
    } catch (error: any) {
      if (error.response?.status === 500 || isCmsTablesNotAvailable(error)) {
        return [];
      }
      throw error;
    }
  },

  async getActiveVersion(): Promise<CmsVersionDetail | null> {
    try {
      const response = await apiClient.get<CmsVersionDetail | null>('/api/v1/admin/cms/versions/active');
      // 204 No Content means no active draft
      if (response.status === 204 || !response.data) {
        return null;
      }
      return unwrap<CmsVersionDetail>(response.data);
    } catch (error: any) {
      // 404, 500, or CMS tables not available - no active draft
      if (error.response?.status === 404 || error.response?.status === 500 || isCmsTablesNotAvailable(error)) {
        return null;
      }
      throw error;
    }
  },

  async getVersion(id: string): Promise<CmsVersionDetail> {
    const response = await apiClient.get<CmsVersionDetail>(`/api/v1/admin/cms/versions/${id}`);
    return unwrap<CmsVersionDetail>(response.data);
  },

  async createVersion(request: CreateCmsVersionRequest): Promise<CmsVersionDetail> {
    const response = await apiClient.post<CmsVersionDetail>('/api/v1/admin/cms/versions', request);
    return unwrap<CmsVersionDetail>(response.data);
  },

  async updateVersion(id: string, request: UpdateCmsVersionRequest): Promise<CmsVersion> {
    const response = await apiClient.put<CmsVersion>(`/api/v1/admin/cms/versions/${id}`, request);
    return unwrap<CmsVersion>(response.data);
  },

  async publishVersion(id: string): Promise<CmsVersion> {
    const response = await apiClient.post<CmsVersion>(`/api/v1/admin/cms/versions/${id}/publish`);
    return unwrap<CmsVersion>(response.data);
  },

  async deleteVersion(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/admin/cms/versions/${id}`);
  },

  // === Block Operations ===

  async getBlocks(versionId: string, sectionKey?: string, language?: string): Promise<CmsContentBlock[]> {
    const params: Record<string, string> = {};
    if (sectionKey) params.sectionKey = sectionKey;
    if (language) params.language = language;
    const response = await apiClient.get<CmsContentBlock[]>(`/api/v1/admin/cms/versions/${versionId}/blocks`, params);
    return unwrap<CmsContentBlock[]>(response.data);
  },

  async getBlock(versionId: string, blockId: string): Promise<CmsContentBlock> {
    const response = await apiClient.get<CmsContentBlock>(`/api/v1/admin/cms/versions/${versionId}/blocks/${blockId}`);
    return unwrap<CmsContentBlock>(response.data);
  },

  async createBlock(versionId: string, request: CreateContentBlockRequest): Promise<CmsContentBlock> {
    const response = await apiClient.post<CmsContentBlock>(`/api/v1/admin/cms/versions/${versionId}/blocks`, request);
    return unwrap<CmsContentBlock>(response.data);
  },

  async updateBlock(versionId: string, blockId: string, request: UpdateContentBlockRequest): Promise<CmsContentBlock> {
    const response = await apiClient.put<CmsContentBlock>(`/api/v1/admin/cms/versions/${versionId}/blocks/${blockId}`, request);
    return unwrap<CmsContentBlock>(response.data);
  },

  async bulkUpdateBlocks(versionId: string, request: BulkUpdateContentBlocksRequest): Promise<CmsContentBlock[]> {
    const response = await apiClient.put<CmsContentBlock[]>(`/api/v1/admin/cms/versions/${versionId}/blocks/bulk`, request);
    return unwrap<CmsContentBlock[]>(response.data);
  },

  async reorderBlocks(versionId: string, request: ReorderContentBlocksRequest): Promise<void> {
    await apiClient.put(`/api/v1/admin/cms/versions/${versionId}/blocks/reorder`, request);
  },

  async deleteBlock(versionId: string, blockId: string): Promise<void> {
    await apiClient.delete(`/api/v1/admin/cms/versions/${versionId}/blocks/${blockId}`);
  },

  async clonePublished(versionId: string): Promise<CmsContentBlock[]> {
    const response = await apiClient.post<CmsContentBlock[]>(`/api/v1/admin/cms/versions/${versionId}/blocks/clone-published`);
    return unwrap<CmsContentBlock[]>(response.data);
  },

  // === Asset Operations ===

  async uploadAsset(file: File, category: string): Promise<CmsAsset> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);
    const response = await apiClient.post<CmsAsset>('/api/v1/admin/cms/assets', formData);
    return unwrap<CmsAsset>(response.data);
  },

  async getAssets(category?: string): Promise<CmsAsset[]> {
    const params: Record<string, string> = {};
    if (category) params.category = category;
    const response = await apiClient.get<CmsAsset[]>('/api/v1/admin/cms/assets', params);
    return unwrap<CmsAsset[]>(response.data);
  },

  async deleteAsset(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/admin/cms/assets/${id}`);
  },

  // === Published Content (Public) ===

  async getPublishedContent(sectionKey?: string, language?: string): Promise<PublishedContent> {
    const params: Record<string, string> = {};
    if (sectionKey) params.sectionKey = sectionKey;
    if (language) params.language = language;
    try {
      const response = await apiClient.get<PublishedContent>('/api/v1/content', params);
      return unwrap<PublishedContent>(response.data);
    } catch (error: any) {
      // 404 or 500 - no published content or CMS tables not available
      if (error.response?.status === 404 || error.response?.status === 500) {
        return { sections: {} } as PublishedContent;
      }
      throw error;
    }
  },

  async getPublishedContentByPage(pageKey: string, language?: string): Promise<PublishedContent> {
    const params: Record<string, string> = {};
    if (language) params.language = language;
    try {
      const response = await apiClient.get<PublishedContent>(`/api/v1/content/pages/${pageKey}`, params);
      return unwrap<PublishedContent>(response.data);
    } catch (error: any) {
      // 404 or 500 - no published content or CMS tables not available
      if (error.response?.status === 404 || error.response?.status === 500) {
        return { sections: {} } as PublishedContent;
      }
      throw error;
    }
  },

  async getPublishedBlock(blockKey: string, language?: string): Promise<CmsContentBlock> {
    const params: Record<string, string> = {};
    if (language) params.language = language;
    const response = await apiClient.get<CmsContentBlock>(`/api/v1/content/${blockKey}`, params);
    return unwrap<CmsContentBlock>(response.data);
  },
};
