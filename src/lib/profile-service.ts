import { apiClient } from './api-client';
import { ApiResponse } from './types';
import { getUserFriendlyError } from '../utils/error-messages';

export class ProfileValidationError extends Error {
  fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string>) {
    super(message);
    this.name = 'ProfileValidationError';
    this.fieldErrors = fieldErrors;
  }
}

export const profileService = {
  async getProfile(): Promise<any> {
    const response = await apiClient.get('/api/v1/profile');
    return response.data;
  },

  async updateProfile(data: any): Promise<any> {
    try {
      const response = await apiClient.put('/api/v1/profile', data);
      return response.data;
    } catch (error: any) {
      const responseData = error.response?.data;

      // Extract field-specific errors from ASP.NET validation response
      if (responseData?.errors && typeof responseData.errors === 'object') {
        const fieldErrors: Record<string, string> = {};
        Object.entries(responseData.errors).forEach(([field, messages]) => {
          // Normalize field name to lowercase for matching
          const normalizedField = field.toLowerCase();
          fieldErrors[normalizedField] = (messages as string[])[0] || 'Invalid value';
        });

        const allMessages = Object.values(fieldErrors).join('. ');
        throw new ProfileValidationError(allMessages, fieldErrors);
      }

      throw new Error(getUserFriendlyError(error, 'profile'));
    }
  },

  async uploadProfilePicture(file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Don't set Content-Type header - axios will set it automatically with boundary for FormData
      const response = await apiClient.post('/api/v1/profile/upload-picture', formData);
      
      const data = response.data;
      
      // Handle different response formats
      // Format 1: { isSuccess: true, value: "url" }
      if (data.isSuccess && data.value) {
        return data.value;
      }
      
      // Format 2: { url: "..." } or direct URL string
      if (data.url) {
        return data.url;
      }
      
      if (typeof data === 'string' && data.startsWith('http')) {
        return data;
      }
      
      // Format 3: { profilePictureUrl: "..." }
      if (data.profilePictureUrl) {
        return data.profilePictureUrl;
      }
      
      // Error cases
      if (data.errorMessage) {
        throw new Error(data.errorMessage);
      }
      
      if (data.message) {
        throw new Error(data.message);
      }
      
      throw new Error('Failed to upload profile picture: Invalid response format');
    } catch (error: any) {
      console.error('Profile picture upload error:', error);
      
      // Extract error message from various possible locations
      const errorMessage = 
        error.response?.data?.errorMessage ||
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.userMessage ||
        error.message ||
        'Failed to upload profile picture';
      
      throw new Error(errorMessage);
    }
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const response = await apiClient.post('/api/v1/profile/change-password', {
        currentPassword,
        newPassword
      });
      const data = response.data;
      if (!data.isSuccess && data.errorMessage) {
        throw new Error(data.errorMessage);
      }
    } catch (error: any) {
      throw new Error(getUserFriendlyError(error, 'password'));
    }
  }
};
