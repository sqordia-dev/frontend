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
      
      const response = await apiClient.post('/api/v1/profile/upload-picture', formData);
      
      const data = response.data;
      if (data.isSuccess && data.value) {
        return data.value;
      }
      if (data.errorMessage) {
        throw new Error(data.errorMessage);
      }
      throw new Error('Failed to upload profile picture');
    } catch (error: any) {
      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      throw new Error(error.message || 'Failed to upload profile picture.');
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
