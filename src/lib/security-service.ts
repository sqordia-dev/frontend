import { apiClient } from './api-client';
import { ApiResponse } from './types';

export const securityService = {
  async getLoginHistory(): Promise<any[]> {
    const response = await apiClient.get('/api/v1/security/login-history');
    return response.data;
  },

  async getSessions(): Promise<any[]> {
    const response = await apiClient.get('/api/v1/security/sessions');
    return response.data;
  },

  async revokeSession(sessionId: string): Promise<void> {
    await apiClient.delete(`/api/v1/security/sessions/${sessionId}`);
  },

  async revokeAllSessions(): Promise<void> {
    await apiClient.post('/api/v1/security/sessions/revoke-all');
  },

  async revokeOtherSessions(): Promise<void> {
    await apiClient.post('/api/v1/security/sessions/revoke-others');
  },

  async forcePasswordChange(userId: string): Promise<void> {
    await apiClient.post(`/api/v1/security/force-password-change/${userId}`);
  },

  async unlockAccount(userId: string): Promise<void> {
    await apiClient.post(`/api/v1/security/unlock-account/${userId}`);
  }
};
