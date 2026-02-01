import { apiClient } from './api-client';
import { TOCSettings, UpdateTOCSettingsRequest, DEFAULT_TOC_SETTINGS } from '../types/toc-settings';

/**
 * TOC Settings Service
 * API functions for managing business plan table of contents settings
 */
export const tocSettingsService = {
  /**
   * Get TOC settings for a business plan
   * @param planId The business plan ID
   * @returns TOC settings
   */
  async getSettings(planId: string): Promise<TOCSettings> {
    const response = await apiClient.get<any>(`/api/v1/business-plans/${planId}/toc-settings`);
    const data = response.data?.value || response.data;
    return normalizeResponse(data, planId);
  },

  /**
   * Update TOC settings for a business plan
   * @param planId The business plan ID
   * @param settings TOC settings to update
   * @returns Updated TOC settings
   */
  async updateSettings(planId: string, settings: UpdateTOCSettingsRequest): Promise<TOCSettings> {
    const response = await apiClient.put<any>(`/api/v1/business-plans/${planId}/toc-settings`, settings);
    const data = response.data?.value || response.data;
    return normalizeResponse(data, planId);
  },
};

/**
 * Normalize TOC settings response to handle different API response formats
 */
function normalizeResponse(data: any, planId: string): TOCSettings {
  if (!data) {
    return {
      id: '',
      businessPlanId: planId,
      ...DEFAULT_TOC_SETTINGS,
    };
  }

  return {
    id: data.id || data.Id || '',
    businessPlanId: data.businessPlanId || data.BusinessPlanId || planId,
    style: data.style || data.Style || DEFAULT_TOC_SETTINGS.style,
    showPageNumbers: data.showPageNumbers ?? data.ShowPageNumbers ?? DEFAULT_TOC_SETTINGS.showPageNumbers,
    showIcons: data.showIcons ?? data.ShowIcons ?? DEFAULT_TOC_SETTINGS.showIcons,
    showCategoryHeaders: data.showCategoryHeaders ?? data.ShowCategoryHeaders ?? DEFAULT_TOC_SETTINGS.showCategoryHeaders,
    styleSettingsJson: data.styleSettingsJson || data.StyleSettingsJson,
    createdAt: data.createdAt || data.CreatedAt,
    updatedAt: data.updatedAt || data.UpdatedAt,
  };
}

export default tocSettingsService;
