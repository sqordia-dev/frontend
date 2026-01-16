import { apiClient } from './api-client';
import { Organization, CreateOrganizationRequest, ApiResponse } from './types';

export const organizationService = {
  async getOrganizations(): Promise<Organization[]> {
    try {
      const response = await apiClient.get<Organization[]>('/api/v1/organizations');
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      throw new Error(error.message || 'Failed to get organizations.');
    }
  },

  async getOrganization(organizationId: string): Promise<Organization> {
    try {
      const response = await apiClient.get<Organization>(`/api/v1/organizations/${organizationId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      throw new Error(error.message || 'Failed to get organization.');
    }
  },

  async createOrganization(data: CreateOrganizationRequest): Promise<Organization> {
    try {
      const response = await apiClient.post<Organization>('/api/v1/organizations', data);
      return response.data;
    } catch (error: any) {
      console.error('Create organization error:', error.response?.data);

      // Handle ASP.NET Core validation error format
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages: string[] = [];

        Object.keys(errors).forEach(field => {
          const fieldErrors = errors[field];
          if (Array.isArray(fieldErrors)) {
            fieldErrors.forEach(msg => {
              errorMessages.push(`${field}: ${msg}`);
            });
          } else {
            errorMessages.push(`${field}: ${fieldErrors}`);
          }
        });

        if (errorMessages.length > 0) {
          throw new Error(errorMessages.join('\n'));
        }
      }

      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }

      if (error.response?.data?.title) {
        throw new Error(error.response.data.title);
      }

      throw new Error(error.message || 'Failed to create organization.');
    }
  },

  async updateOrganization(organizationId: string, data: Partial<Organization>): Promise<Organization> {
    const response = await apiClient.put<Organization>(`/api/v1/organizations/${organizationId}`, data);
    return response.data;
  },

  async deleteOrganization(organizationId: string): Promise<void> {
    await apiClient.delete(`/api/v1/organizations/${organizationId}`);
  },

  async getOrganizationDetail(organizationId: string): Promise<any> {
    const response = await apiClient.get(`/api/v1/organizations/${organizationId}/detail`);
    return response.data;
  },

  async deactivateOrganization(organizationId: string): Promise<void> {
    await apiClient.post(`/api/v1/organizations/${organizationId}/deactivate`);
  },

  async reactivateOrganization(organizationId: string): Promise<void> {
    await apiClient.post(`/api/v1/organizations/${organizationId}/reactivate`);
  },

  async getOrganizationMembers(organizationId: string): Promise<any[]> {
    const response = await apiClient.get(`/api/v1/organizations/${organizationId}/members`);
    return response.data;
  },

  async addOrganizationMember(organizationId: string, data: any): Promise<any> {
    const response = await apiClient.post(`/api/v1/organizations/${organizationId}/members`, data);
    return response.data;
  },

  async updateOrganizationMember(organizationId: string, memberId: string, data: any): Promise<any> {
    const response = await apiClient.put(`/api/v1/organizations/${organizationId}/members/${memberId}`, data);
    return response.data;
  },

  async removeOrganizationMember(organizationId: string, memberId: string): Promise<void> {
    await apiClient.delete(`/api/v1/organizations/${organizationId}/members/${memberId}`);
  },

  async updateMemberRole(organizationId: string, memberId: string, roleId: string): Promise<void> {
    await apiClient.put(`/api/v1/organizations/${organizationId}/members/${memberId}/role`, { roleId });
  },

  async getOrganizationSettings(organizationId: string): Promise<any> {
    const response = await apiClient.get(`/api/v1/organizations/${organizationId}/settings`);
    return response.data;
  },

  async updateOrganizationSettings(organizationId: string, settings: any): Promise<any> {
    const response = await apiClient.put(`/api/v1/organizations/${organizationId}/settings`, settings);
    return response.data;
  }
};
