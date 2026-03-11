import { apiClient } from './api-client';
import { Organization, CreateOrganizationRequest, ApiResponse } from './types';
import type { UpdateOrganizationProfileRequest, OrganizationProfile } from '../types/organization-profile';

export const organizationService = {
  async getOrganizations(): Promise<Organization[]> {
    try {
      const response = await apiClient.get<Organization[]>('/api/v1/organizations');
      // Handle both wrapped ({ value: [...] }) and unwrapped ([...]) response formats
      const data = response.data;
      if (data && !Array.isArray(data) && (data as any).value) {
        return (data as any).value;
      }
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      const msg = error.response?.data?.message
        || error.response?.data?.errorMessage
        || error.userMessage
        || error.message
        || 'Failed to get organizations.';
      throw new Error(msg);
    }
  },

  async getOrganization(organizationId: string): Promise<Organization> {
    try {
      const response = await apiClient.get<Organization>(`/api/v1/organizations/${organizationId}`);
      return response.data;
    } catch (error: any) {
      const msg = error.response?.data?.message
        || error.response?.data?.errorMessage
        || error.message
        || 'Failed to get organization.';
      throw new Error(msg);
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

      const msg = error.response?.data?.message
        || error.response?.data?.errorMessage
        || error.response?.data?.title
        || error.message
        || 'Failed to create organization.';
      throw new Error(msg);
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
    const response = await apiClient.get<any[]>(`/api/v1/organizations/${organizationId}/members`);
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
  },

  async getOrganizationProfile(organizationId: string): Promise<OrganizationProfile> {
    const response = await apiClient.get<OrganizationProfile>(`/api/v1/organizations/${organizationId}`);
    return response.data;
  },

  async updateOrganizationProfile(organizationId: string, data: UpdateOrganizationProfileRequest): Promise<OrganizationProfile> {
    const response = await apiClient.put<OrganizationProfile>(`/api/v1/organizations/${organizationId}`, data);
    return response.data;
  },

  async getMyOrganizationProfile(organizationId?: string): Promise<OrganizationProfile | null> {
    try {
      if (organizationId) {
        return await organizationService.getOrganizationProfile(organizationId);
      }
      const orgs = await organizationService.getOrganizations();
      if (orgs.length === 0) return null;
      return await organizationService.getOrganizationProfile(orgs[0].id);
    } catch {
      return null;
    }
  },

  // ── Invitation Management ──────────────────────────────────────────────

  async inviteMemberByEmail(organizationId: string, email: string, role: string): Promise<any> {
    const response = await apiClient.post(`/api/v1/organizations/${organizationId}/invitations`, { email, role });
    const data = response.data as any;
    if (data?.isSuccess && data.value) return data.value;
    return data;
  },

  async getPendingInvitations(organizationId: string): Promise<any[]> {
    const response = await apiClient.get(`/api/v1/organizations/${organizationId}/invitations`);
    const data = response.data as any;
    if (data?.isSuccess && data.value) return data.value;
    if (Array.isArray(data)) return data;
    return [];
  },

  async cancelInvitation(organizationId: string, invitationId: string): Promise<void> {
    await apiClient.delete(`/api/v1/organizations/${organizationId}/invitations/${invitationId}`);
  },

  async acceptInvitation(token: string): Promise<any> {
    const response = await apiClient.post(`/api/v1/organizations/invitations/${token}/accept`);
    const data = response.data as any;
    if (data?.isSuccess && data.value) return data.value;
    return data;
  }
};
