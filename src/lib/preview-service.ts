import { apiClient } from './api-client';
import {
  BusinessPlanPreview,
  PlanSection,
  AIAssistAction,
  ExportFormat,
  ShareResult,
} from '../types/preview';

/**
 * Preview Service
 * API functions for business plan preview, editing, and export
 */
export const previewService = {
  /**
   * Load full business plan preview with all sections
   * @param planId The business plan ID
   * @returns Business plan preview data
   */
  async loadPlanPreview(planId: string): Promise<BusinessPlanPreview> {
    // Fetch plan details
    const planResponse = await apiClient.get<any>(`/api/v1/business-plans/${planId}`);
    const plan = planResponse.data?.value || planResponse.data;

    // Fetch sections
    const sectionsResponse = await apiClient.get<any>(`/api/v1/business-plans/${planId}/sections`);
    const sectionsData = sectionsResponse.data?.value || sectionsResponse.data;

    // Ensure sections is an array - handle various response formats
    let sectionsArray: any[] = [];
    if (Array.isArray(sectionsData)) {
      sectionsArray = sectionsData;
    } else if (sectionsData?.sections && Array.isArray(sectionsData.sections)) {
      sectionsArray = sectionsData.sections;
    } else if (sectionsData && typeof sectionsData === 'object') {
      // If it's an object with section names as keys (e.g., { ExecutiveSummary: {...}, MarketAnalysis: {...} })
      sectionsArray = Object.entries(sectionsData)
        .filter(([key, value]: [string, any]) => value && typeof value === 'object')
        .map(([key, value]: [string, any]) => ({
          ...value,
          name: value.name || key, // Use the object key as section name if not present
        }));
    }

    // Normalize sections to match PlanSection interface
    // Backend may return section name in: name, sectionName, sectionId, or id
    let sections = sectionsArray.map((section: any, index: number) => {
      // Determine the section identifier (what backend expects for API calls)
      const sectionName = section.name || section.sectionName || section.sectionId || section.id;

      return {
        id: section.id || sectionName || `section-${index}`,
        title: section.title || formatSectionName(sectionName || `Section ${index + 1}`),
        content: section.content || null,
        order: section.order ?? section.sortOrder ?? index,
        name: sectionName, // Always store the section identifier for API calls
        isGenerated: !!section.content,
      };
    });

    // Sort by order
    sections.sort((a: PlanSection, b: PlanSection) => a.order - b.order);

    return {
      id: plan.id,
      title: plan.title || 'Business Plan',
      sections,
      createdAt: plan.createdAt || new Date().toISOString(),
      updatedAt: plan.updatedAt || plan.createdAt || new Date().toISOString(),
      description: plan.description,
      industry: plan.industry,
      status: plan.status,
      planType: plan.planType || plan.type || plan.PlanType || 'BusinessPlan',
    };
  },

  /**
   * Load a specific section
   * @param planId The business plan ID
   * @param sectionId The section ID/name
   * @returns Section data
   */
  async loadSection(planId: string, sectionId: string): Promise<PlanSection> {
    const response = await apiClient.get<any>(
      `/api/v1/business-plans/${planId}/sections/${sectionId}`
    );
    const section = response.data?.value || response.data;

    return {
      id: section.id || section.name || sectionId,
      title: section.title || formatSectionName(section.name || sectionId),
      content: section.content || null,
      order: section.order ?? section.sortOrder ?? 0,
      name: section.name,
      isGenerated: !!section.content,
    };
  },

  /**
   * Update section content
   * @param planId The business plan ID
   * @param sectionId The section ID/name
   * @param content New content
   */
  async updateSection(planId: string, sectionId: string, content: string): Promise<void> {
    await apiClient.put(`/api/v1/business-plans/${planId}/sections/${sectionId}`, {
      content,
    });
  },

  /**
   * Regenerate a section using AI
   * @param planId The business plan ID
   * @param sectionId The section ID/name
   */
  async regenerateSection(planId: string, sectionId: string): Promise<void> {
    await apiClient.post(`/api/v1/business-plans/${planId}/regenerate/${sectionId}`);
  },

  /**
   * Get AI assistance for section content
   * @param planId The business plan ID
   * @param sectionId The section ID/name
   * @param action The AI action to perform
   * @param content Current content
   * @param planType The business plan type (e.g., 'BusinessPlan', 'StrategicPlan', 'LeanCanvas')
   * @param language The language for the improvement ('en' or 'fr')
   * @param customPrompt Optional custom instructions for the AI
   * @returns Improved content
   */
  async aiAssistSection(
    planId: string,
    sectionId: string,
    action: AIAssistAction,
    content: string,
    planType: string = 'BusinessPlan',
    language: string = 'en',
    customPrompt?: string
  ): Promise<string> {
    // Map action to backend endpoint
    // 'custom' uses 'improve' endpoint with customPrompt
    let endpoint: string;
    if (action === 'shorten') {
      endpoint = 'simplify';
    } else if (action === 'custom') {
      endpoint = 'improve';
    } else {
      endpoint = action;
    }

    const response = await apiClient.post<any>(
      `/api/v1/business-plans/${planId}/sections/${sectionId}/${endpoint}`,
      {
        currentContent: content,
        improvementType: action === 'custom' ? 'custom' : action,
        language: language,
        planType: planType,
        customPrompt: customPrompt,
      }
    );

    // Handle different response formats
    if (response.data?.value?.content) {
      return response.data.value.content;
    }
    if (response.data?.content) {
      return response.data.content;
    }
    if (typeof response.data === 'string') {
      return response.data;
    }
    if (response.data?.improvedContent) {
      return response.data.improvedContent;
    }

    throw new Error('Unable to parse AI response');
  },

  /**
   * Export business plan to PDF or DOCX
   * @param planId The business plan ID
   * @param format Export format
   * @returns File blob
   */
  async exportPlan(planId: string, format: ExportFormat): Promise<Blob> {
    const endpoint = format === 'pdf' ? 'export/pdf' : 'export/word';

    const response = await apiClient.get<Blob>(`/api/v1/business-plans/${planId}/${endpoint}`, undefined, {
      responseType: 'blob',
    });

    return response.data as Blob;
  },

  /**
   * Create a shareable link for the business plan
   * @param planId The business plan ID
   * @returns Share URL and details
   */
  async sharePlan(planId: string): Promise<ShareResult> {
    const response = await apiClient.post<any>(
      `/api/v1/business-plans/${planId}/shares/public`,
      {
        permission: 0, // ReadOnly
      }
    );

    const data = response.data?.value || response.data;

    // Generate share URL
    const baseUrl = window.location.origin;
    const shareId = data.id || data.shareId;
    const shareToken = data.shareToken || data.token;

    // Try different URL patterns based on backend response
    let shareUrl = '';
    if (data.shareUrl) {
      shareUrl = data.shareUrl;
    } else if (shareToken) {
      shareUrl = `${baseUrl}/shared/${shareToken}`;
    } else if (shareId) {
      shareUrl = `${baseUrl}/shared/plan/${shareId}`;
    } else {
      // Fallback - just use the preview URL
      shareUrl = `${baseUrl}/business-plan/${planId}/preview`;
    }

    return {
      shareUrl,
      shareId,
      expiresAt: data.expiresAt,
    };
  },
};

/**
 * Format section name for display
 */
function formatSectionName(name: string): string {
  return name
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export default previewService;
