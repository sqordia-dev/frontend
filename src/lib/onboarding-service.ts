import { apiClient } from './api-client';
import {
  OnboardingProgressDto,
  OnboardingProgressRequest,
  OnboardingCompleteRequest,
  OnboardingCompleteResponse,
} from '../types/onboarding';

/**
 * Service for managing onboarding flow
 * Handles progress persistence and completion
 */
export const onboardingService = {
  /**
   * Get the current user's onboarding progress
   */
  async getOnboardingProgress(): Promise<OnboardingProgressDto> {
    try {
      const response = await apiClient.get<OnboardingProgressDto>('/api/v1/onboarding/progress');
      return response.data;
    } catch (error: any) {
      // If 404, user hasn't started onboarding yet
      if (error.response?.status === 404) {
        return {
          userId: '',
          currentStep: 0,
          isComplete: false,
          data: {},
          startedAt: new Date().toISOString(),
        };
      }
      throw error;
    }
  },

  /**
   * Save onboarding progress after each step
   */
  async saveOnboardingProgress(request: OnboardingProgressRequest): Promise<void> {
    try {
      await apiClient.post('/api/v1/onboarding/progress', request);
    } catch (error: any) {
      console.warn('Failed to save onboarding progress:', error);
      // Don't throw - we don't want to block the user
    }
  },

  /**
   * Complete onboarding and create the business plan
   * Returns the newly created plan ID
   */
  async completeOnboarding(request: OnboardingCompleteRequest): Promise<OnboardingCompleteResponse> {
    try {
      // First, mark onboarding as complete
      await apiClient.post('/api/v1/onboarding/complete', request);

      // Update user persona
      await apiClient.post('/api/v1/user/persona', {
        persona: request.persona.charAt(0).toUpperCase() + request.persona.slice(1),
      });

      // Create the business plan
      const planResponse = await apiClient.post<{ id: string }>('/api/v1/business-plans', {
        title: request.businessName,
        description: request.description,
        industry: request.industry,
        templateId: request.templateId,
        persona: request.persona.charAt(0).toUpperCase() + request.persona.slice(1),
      });

      // Handle wrapped response format
      const planData = (planResponse.data as any).value || planResponse.data;

      return {
        planId: planData.id,
      };
    } catch (error: any) {
      console.error('Failed to complete onboarding:', error);

      // Extract error message
      const errorMessage =
        error.response?.data?.errorMessage ||
        error.response?.data?.message ||
        error.message ||
        'Failed to complete onboarding';

      throw new Error(errorMessage);
    }
  },

  /**
   * Check if user needs onboarding
   * Returns true if user hasn't completed onboarding
   */
  async needsOnboarding(): Promise<boolean> {
    try {
      const progress = await this.getOnboardingProgress();
      return !progress.isComplete;
    } catch (error) {
      // If we can't check, assume they don't need onboarding
      return false;
    }
  },
};

export default onboardingService;
