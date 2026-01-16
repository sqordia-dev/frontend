import { apiClient } from './api-client';
import { ApiResponse } from './types';

export const rolesService = {
  async getRoles(): Promise<any[]> {
    const response = await apiClient.get('/api/v1/roles');
    return response.data;
  },

  async getRole(id: string): Promise<any> {
    const response = await apiClient.get(`/api/v1/roles/${id}`);
    return response.data;
  },

  async createRole(data: any): Promise<any> {
    const response = await apiClient.post('/api/v1/roles', data);
    return response.data;
  },

  async updateRole(id: string, data: any): Promise<any> {
    const response = await apiClient.put(`/api/v1/roles/${id}`, data);
    return response.data;
  },

  async deleteRole(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/roles/${id}`);
  },

  async getPermissions(): Promise<any[]> {
    const response = await apiClient.get('/api/v1/roles/permissions');
    return response.data;
  },

  async assignRole(userId: string, roleId: string): Promise<void> {
    await apiClient.post('/api/v1/roles/assign', { userId, roleId });
  },

  async getUserRoles(userId: string): Promise<any[]> {
    const response = await apiClient.get(`/api/v1/roles/users/${userId}`);
    return response.data;
  },

  async removeUserRole(userId: string, roleId: string): Promise<void> {
    await apiClient.delete(`/api/v1/roles/users/${userId}/roles/${roleId}`);
  }
};
