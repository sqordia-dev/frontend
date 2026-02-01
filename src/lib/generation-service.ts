import { apiClient } from './api-client';
import { GenerationStatusDto } from '../types/generation';

/**
 * Generation Service
 * API functions for managing business plan AI generation
 */
export const generationService = {
  /**
   * Start generating a business plan
   * @param planId The business plan ID to generate
   */
  async startGeneration(planId: string): Promise<void> {
    // Business plan generation can take 2-5 minutes (multiple sections, each calling OpenAI)
    // Set timeout to 10 minutes (600000ms) to allow for completion
    await apiClient.post(`/api/v1/business-plans/${planId}/generate`, undefined, {
      timeout: 600000, // 10 minutes
    });
  },

  /**
   * Get current generation status
   * @param planId The business plan ID
   * @returns Generation status with section details
   */
  async getGenerationStatus(planId: string): Promise<GenerationStatusDto> {
    const response = await apiClient.get<any>(`/api/v1/business-plans/${planId}/generation-status`);

    // Handle wrapped response format (isSuccess/value)
    if (response.data?.isSuccess && response.data.value) {
      return response.data.value;
    }

    // Handle direct response format
    if (response.data) {
      // Map backend response to our DTO format
      const data = response.data;

      // Handle completedSections - backend may return number or array
      let completedSectionsArray: string[] = [];
      if (Array.isArray(data.completedSections)) {
        completedSectionsArray = data.completedSections;
      } else if (typeof data.completedSections === 'number') {
        // Backend returns count, not array - create placeholder array for compatibility
        completedSectionsArray = Array(data.completedSections).fill('completed');
      }

      return {
        status: data.status || data.generationStatus || 'pending',
        totalSections: data.totalSections || data.sections?.length || 0,
        completedSections: completedSectionsArray,
        currentSection: data.currentSection || null,
        sections: (data.sections || []).map((section: any) => ({
          id: section.id || section.name,
          name: section.name || section.title || section.id,
          status: section.status || 'pending',
        })),
        errorMessage: data.errorMessage || data.error || null,
      };
    }

    // Return default status if no data
    return {
      status: 'pending',
      totalSections: 0,
      completedSections: [],
      currentSection: null,
      sections: [],
      errorMessage: null,
    };
  },

  /**
   * Cancel an ongoing generation
   * @param planId The business plan ID
   */
  async cancelGeneration(planId: string): Promise<void> {
    await apiClient.post(`/api/v1/business-plans/${planId}/generation/cancel`);
  },

  /**
   * Retry a failed generation
   * @param planId The business plan ID
   */
  async retryGeneration(planId: string): Promise<void> {
    // Retry is essentially starting generation again
    await this.startGeneration(planId);
  },
};

export default generationService;
