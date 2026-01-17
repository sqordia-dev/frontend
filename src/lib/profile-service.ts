import { apiClient } from './api-client';
import { ApiResponse } from './types';

export const profileService = {
  async getProfile(): Promise<any> {
    const response = await apiClient.get('/api/v1/profile');
    return response.data;
  },

  async updateProfile(data: any): Promise<any> {
    const response = await apiClient.put('/api/v1/profile', data);
    return response.data;
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
      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      throw new Error(error.message || 'Failed to change password.');
    }
  }
};
