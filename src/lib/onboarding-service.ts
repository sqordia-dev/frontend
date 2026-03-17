import { apiClient } from './api-client';
import {
  OnboardingProgressDto,
  OnboardingProgressRequest,
} from '../types/onboarding';
import type { OnboardingProfileCompleteRequest, OnboardingProfileCompleteResponse } from '../types/organization-profile';

/**
 * Service for managing onboarding flow
 * Handles progress persistence and completion
 */
export const onboardingService = {
  /**
   * Get the current user's onboarding progress
   * Maps backend field names (isCompleted, data as JSON string) to frontend types
   */
  async getOnboardingProgress(): Promise<OnboardingProgressDto> {
    try {
      const response = await apiClient.get('/api/v1/onboarding/progress');
      const raw = response.data as any;
      // Handle Result<T> wrapper
      const dto = (raw?.isSuccess !== undefined && raw?.value) ? raw.value : raw;

      // Parse data from JSON string to object
      let parsedData = {};
      if (dto.data) {
        try { parsedData = typeof dto.data === 'string' ? JSON.parse(dto.data) : dto.data; } catch { parsedData = {}; }
      }

      return {
        userId: dto.userId ?? '',
        currentStep: dto.currentStep ?? 0,
        isComplete: dto.isCompleted ?? false,
        data: parsedData,
        startedAt: dto.lastUpdated ?? new Date().toISOString(),
      };
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
   * Transforms frontend format to backend expected format:
   *   frontend: { currentStep, data: {} }
   *   backend:  { step, stepData: "JSON string" }
   */
  async saveOnboardingProgress(request: OnboardingProgressRequest): Promise<void> {
    try {
      await apiClient.post('/api/v1/onboarding/progress', {
        step: request.currentStep,
        stepData: JSON.stringify(request.data),
      });
    } catch (error: any) {
      console.warn('Failed to save onboarding progress:', error);
      // Don't throw - we don't want to block the user
    }
  },

  /**
   * Complete onboarding profile — saves org profile data and creates plan in one call
   */
  async completeOnboardingProfile(request: OnboardingProfileCompleteRequest): Promise<OnboardingProfileCompleteResponse> {
    try {
      // Store persona locally
      localStorage.setItem('userPersona', request.persona);

      const response = await apiClient.post<OnboardingProfileCompleteResponse>('/api/v1/onboarding/v2/complete', request);
      const data = (response.data as any).value || response.data;

      // Also set persona on user endpoint for consistency
      const personaCapitalized = request.persona.charAt(0).toUpperCase() + request.persona.slice(1);
      await apiClient.post('/api/v1/user/persona', { persona: personaCapitalized }).catch(() => {});

      return data;
    } catch (error: any) {
      console.error('Failed to complete onboarding:', error);
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
