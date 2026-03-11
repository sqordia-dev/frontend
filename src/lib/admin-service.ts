import { apiClient } from './api-client';
import { ApiResponse } from './types';

// Type for API response data that could be either a Result wrapper or direct value
type ApiData<T = any> = { isSuccess?: boolean; value?: T; error?: { message?: string }; items?: T[]; Items?: T[]; totalCount?: number; TotalCount?: number; pageNumber?: number; PageNumber?: number; totalPages?: number; TotalPages?: number; Id?: string; id?: string } | T;

// Helper to safely extract data from API response
function extractApiData<T>(data: unknown): T {
  const d = data as ApiData<T>;
  if (d && typeof d === 'object' && 'isSuccess' in d) {
    if (d.isSuccess && d.value !== undefined) {
      return d.value as T;
    }
    if (!d.isSuccess && d.error?.message) {
      throw new Error(d.error.message);
    }
  }
  return d as T;
}

export const adminService = {
  async getOverview(): Promise<any> {
    try {
      const response = await apiClient.get<any>('/api/v1/admin/overview');
      const data = response.data as ApiData;
      // Check if it's a Result wrapper first
      if (data && typeof data === 'object' && 'isSuccess' in data) {
        if (data.isSuccess && data.value) {
          return data.value;
        } else if (!data.isSuccess) {
          throw new Error(data.error?.message || 'Failed to load overview');
        }
      }
      if (!data) {
        throw new Error('No data received from server');
      }
      return data;
    } catch (error: any) {
      console.error('Error in getOverview:', error);
      if (error.response?.status === 401) {
        throw new Error('Unauthorized - please log in as admin');
      } else if (error.response?.status === 403) {
        throw new Error('Forbidden - admin access required');
      }
      throw error;
    }
  },

  async getSystemHealth(): Promise<any> {
    const response = await apiClient.get<any>('/api/v1/admin/system-health');
    // Backend returns value directly (not wrapped in Result)
    // Check if it's a Result wrapper first
    const data = response.data as ApiData;
    if (data && typeof data === 'object' && 'isSuccess' in data) {
      if (data.isSuccess && data.value) {
        return data.value;
      } else if (!data.isSuccess) {
        throw new Error(data.error?.message || 'Failed to load system health');
      }
    }
    return data;
  },

  async getUsers(params?: any): Promise<any> {
    try {
      const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
      const response = await apiClient.get<any>(`/api/v1/admin/users${queryString}`);

      // Backend returns value directly (not wrapped in Result)
      // Check if it's a Result wrapper first
      if (response.data && typeof response.data === 'object' && 'isSuccess' in response.data) {
        // It's a Result wrapper
        if (response.data.isSuccess && response.data.value) {
          const data = response.data.value;
          // Handle PaginatedList - extract items if it's a paginated response
          return data.items || data.Items || data;
        } else if (!response.data.isSuccess) {
          throw new Error(response.data.error?.message || 'Failed to load users');
        }
      }
      
      // Direct value response - backend returns PaginatedList directly
      const data = response.data;
      if (!data) {
        throw new Error('No data received from server');
      }
      
      // Handle PaginatedList structure
      if (data.items || data.Items) {
        return data.items || data.Items;
      }
      
      // If it's already an array, return it
      if (Array.isArray(data)) {
        return data;
      }
      
      // Otherwise return empty array
      return [];
    } catch (error: any) {
      console.error('Error in getUsers:', error);
      // Re-throw with more context if needed
      if (error.response?.status === 401) {
        throw new Error('Unauthorized - please log in as admin');
      } else if (error.response?.status === 403) {
        throw new Error('Forbidden - admin access required');
      }
      throw error;
    }
  },

  async updateUserStatus(userId: string, status: string, reason: string): Promise<void> {
    // Convert status string to UserStatus enum value
    const statusEnum = status === 'Active' ? 'Active' : status === 'Inactive' ? 'Inactive' : status;
    await apiClient.put(`/api/v1/admin/users/${userId}/status`, { status: statusEnum, reason });
  },

  async getOrganizations(params?: any): Promise<any> {
    try {
      const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
      const response = await apiClient.get<any>(`/api/v1/admin/organizations${queryString}`);
      
      // Backend returns value directly (not wrapped in Result)
      // Check if it's a Result wrapper first
      if (response.data && typeof response.data === 'object' && 'isSuccess' in response.data) {
        // It's a Result wrapper
        if (response.data.isSuccess && response.data.value) {
          const data = response.data.value;
          // Handle PaginatedList - extract items if it's a paginated response
          return data.items || data.Items || data;
        } else if (!response.data.isSuccess) {
          throw new Error(response.data.error?.message || 'Failed to load organizations');
        }
      }
      
      // Direct value response - backend returns PaginatedList directly
      const data = response.data;
      if (!data) {
        throw new Error('No data received from server');
      }
      
      // Handle PaginatedList structure
      if (data.items || data.Items) {
        return data.items || data.Items;
      }
      
      // If it's already an array, return it
      if (Array.isArray(data)) {
        return data;
      }
      
      // Otherwise return empty array
      return [];
    } catch (error: any) {
      console.error('Error in getOrganizations:', error);
      // Re-throw with more context if needed
      if (error.response?.status === 401) {
        throw new Error('Unauthorized - please log in as admin');
      } else if (error.response?.status === 403) {
        throw new Error('Forbidden - admin access required');
      }
      throw error;
    }
  },

  async updateOrganizationStatus(organizationId: string, isActive: boolean | string, reason: string): Promise<void> {
    // Handle both boolean and string status
    const activeStatus = typeof isActive === 'boolean' ? isActive : (isActive === 'true' || isActive === 'active');
    await apiClient.put(`/api/v1/admin/organizations/${organizationId}/status`, { isActive: activeStatus, reason });
  },

  async getBusinessPlans(params?: any): Promise<any> {
    try {
      const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
      const response = await apiClient.get<any>(`/api/v1/admin/business-plans${queryString}`);
      
      // Backend returns value directly (not wrapped in Result)
      // Check if it's a Result wrapper first
      if (response.data && typeof response.data === 'object' && 'isSuccess' in response.data) {
        // It's a Result wrapper
        if (response.data.isSuccess && response.data.value) {
          const data = response.data.value;
          // Handle PaginatedList - extract items if it's a paginated response
          return data.items || data.Items || data;
        } else if (!response.data.isSuccess) {
          throw new Error(response.data.error?.message || 'Failed to load business plans');
        }
      }
      
      // Direct value response - backend returns PaginatedList directly
      const data = response.data;
      if (!data) {
        throw new Error('No data received from server');
      }
      
      // Handle PaginatedList structure
      if (data.items || data.Items) {
        return data.items || data.Items;
      }
      
      // If it's already an array, return it
      if (Array.isArray(data)) {
        return data;
      }
      
      // Otherwise return empty array
      return [];
    } catch (error: any) {
      console.error('Error in getBusinessPlans:', error);
      // Re-throw with more context if needed
      if (error.response?.status === 401) {
        throw new Error('Unauthorized - please log in as admin');
      } else if (error.response?.status === 403) {
        throw new Error('Forbidden - admin access required');
      }
      throw error;
    }
  },

  async regenerateBusinessPlan(businessPlanId: string): Promise<void> {
    await apiClient.post(`/api/v1/admin/business-plans/${businessPlanId}/regenerate`);
  },

  async getActivityLogs(filters?: any): Promise<any> {
    try {
      const queryString = filters ? `?${new URLSearchParams(filters).toString()}` : '';
      const response = await apiClient.get<any>(`/api/v1/admin/activity-logs${queryString}`);
      
      // Backend returns Result<PaginatedList<AdminActivityLog>>
      if (response.data && typeof response.data === 'object' && 'isSuccess' in response.data) {
        if (response.data.isSuccess && response.data.value) {
          const data = response.data.value;
          // Handle PaginatedList - extract Items (capital I) if it's a paginated response
          return data.Items || data.items || data;
        } else if (!response.data.isSuccess) {
          throw new Error(response.data.error?.message || 'Failed to load activity logs');
        }
      }
      
      // Handle direct response (not wrapped in Result)
      const data = response.data;
      if (!data) {
        throw new Error('No data received from server');
      }
      
      // Handle PaginatedList structure - PaginatedList uses Items (capital I)
      if (data.Items || data.items) {
        return data.Items || data.items;
      }
      
      // If it's already an array, return it
      if (Array.isArray(data)) {
        return data;
      }
      
      // Otherwise return empty array
      return [];
    } catch (error: any) {
      console.error('Error in getActivityLogs:', error);
      if (error.response?.status === 401) {
        throw new Error('Unauthorized - please log in as admin');
      } else if (error.response?.status === 403) {
        throw new Error('Forbidden - admin access required');
      }
      throw error;
    }
  },

  async getReport(reportType: string): Promise<any> {
    const response = await apiClient.get<any>(`/api/v1/admin/reports/${reportType}`);
    return response.data;
  },

  async getAIUsageStats(startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get<any>(`/api/v1/admin/ai-usage-stats${queryString}`);
    if (response.data?.isSuccess && response.data.value) {
      return response.data.value;
    } else if (response.data && !response.data.isSuccess) {
      throw new Error(response.data.error?.message || 'Failed to load AI usage stats');
    }
    return response.data;
  },

  async getAIPrompts(): Promise<any[]> {
    try {
      const response = await apiClient.get<any>('/api/v1/admin/ai-prompts');
      // Backend returns array directly (not wrapped in Result)
      if (Array.isArray(response.data)) {
        return response.data;
      }
      // Handle Result wrapper if present
      if (response.data?.isSuccess && response.data.value) {
        return Array.isArray(response.data.value) ? response.data.value : [];
      }
      return [];
    } catch (error: any) {
      console.error('Error in getAIPrompts:', error);
      if (error.response?.status === 401) {
        throw new Error('Unauthorized - please log in as admin');
      } else if (error.response?.status === 403) {
        throw new Error('Forbidden - admin access required');
      }
      throw error;
    }
  },

  async getAIPrompt(promptId: string): Promise<any> {
    const response = await apiClient.get<any>(`/api/v1/admin/ai-prompts/${promptId}`);
    return response.data;
  },

  async createAIPrompt(data: any): Promise<string> {
    try {
      const response = await apiClient.post<any>('/api/v1/admin/ai-prompts', data);
      // Backend returns { Id: string } on creation
      return response.data?.Id || response.data?.id || response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  async updateAIPrompt(promptId: string, data: any): Promise<void> {
    try {
      await apiClient.put(`/api/v1/admin/ai-prompts/${promptId}`, data);
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  async deleteAIPrompt(promptId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/v1/admin/ai-prompts/${promptId}`);
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  async updateAIPromptStatus(promptId: string, isActive: boolean): Promise<void> {
    try {
      // Backend PUT endpoint expects { Status: "active" | "inactive" }
      await apiClient.put(`/api/v1/admin/ai-prompts/${promptId}/status`, { 
        Status: isActive ? 'active' : 'inactive' 
      });
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  async getAIPromptVersions(parentPromptId: string): Promise<any[]> {
    const response = await apiClient.get<any>(`/api/v1/admin/ai-prompts/${parentPromptId}/versions`);
    return response.data;
  },

  async getAIPromptStats(): Promise<any> {
    const response = await apiClient.get<any>('/api/v1/admin/ai-prompts/stats');
    return response.data;
  },

  async testAIPrompt(promptId: string, testData: any): Promise<any> {
    const response = await apiClient.post<any>('/api/v1/admin/ai-prompts/test', { promptId, ...testData });
    return response.data;
  },

  async migrateDefaultPrompts(): Promise<{ migrated: number; prompts: any[] }> {
    try {
      const response = await apiClient.post<any>('/api/v1/admin/ai-prompts/migrate-defaults');
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  // ======== User Management ========

  async getUserDetail(userId: string): Promise<any> {
    const response = await apiClient.get<any>(`/api/v1/admin/users/${userId}`);
    if (response.data?.isSuccess && response.data.value) {
      return response.data.value;
    }
    return response.data;
  },

  async getUsersPaginated(params?: Record<string, any>): Promise<{ items: any[]; totalCount: number; pageNumber: number; totalPages: number }> {
    const queryString = params ? `?${new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '').map(([k, v]) => [k, String(v)])
    ).toString()}` : '';
    const response = await apiClient.get<any>(`/api/v1/admin/users${queryString}`);

    if (response.data?.isSuccess && response.data.value) {
      return response.data.value;
    }
    const data = response.data;
    if (data?.items || data?.Items) {
      return {
        items: data.items || data.Items || [],
        totalCount: data.totalCount || data.TotalCount || 0,
        pageNumber: data.pageNumber || data.PageNumber || 1,
        totalPages: data.totalPages || data.TotalPages || 1
      };
    }
    if (Array.isArray(data)) {
      return { items: data, totalCount: data.length, pageNumber: 1, totalPages: 1 };
    }
    return { items: [], totalCount: 0, pageNumber: 1, totalPages: 1 };
  },

  async createUser(data: {
    firstName: string;
    lastName: string;
    email: string;
    password?: string;
    userType?: string;
    sendWelcomeEmail?: boolean;
    emailVerified?: boolean;
    roleIds?: string[];
  }): Promise<string> {
    const response = await apiClient.post<any>('/api/v1/admin/users', data);
    if (response.data?.isSuccess && response.data.value) {
      return response.data.value;
    }
    return response.data;
  },

  async updateUserProfile(userId: string, data: {
    firstName?: string;
    lastName?: string;
    userName?: string;
    userType?: string;
    phoneNumber?: string;
    emailVerified?: boolean;
    isActive?: boolean;
  }): Promise<void> {
    await apiClient.put(`/api/v1/admin/users/${userId}/profile`, data);
  },

  async resetUserPassword(userId: string, newPassword?: string): Promise<void> {
    await apiClient.post(`/api/v1/admin/users/${userId}/reset-password`, { newPassword });
  },

  async getUserSessions(userId: string): Promise<any[]> {
    const response = await apiClient.get<any>(`/api/v1/admin/users/${userId}/sessions`);
    if (response.data?.isSuccess && response.data.value) {
      return response.data.value;
    }
    return Array.isArray(response.data) ? response.data : [];
  },

  async terminateUserSession(userId: string, sessionId: string): Promise<void> {
    await apiClient.delete(`/api/v1/admin/users/${userId}/sessions/${sessionId}`);
  },

  async terminateAllUserSessions(userId: string): Promise<void> {
    await apiClient.delete(`/api/v1/admin/users/${userId}/sessions`);
  },

  async getUserLoginHistory(userId: string, limit: number = 50): Promise<any[]> {
    const response = await apiClient.get<any>(`/api/v1/admin/users/${userId}/login-history?limit=${limit}`);
    if (response.data?.isSuccess && response.data.value) {
      return response.data.value;
    }
    return Array.isArray(response.data) ? response.data : [];
  },

  async exportUsers(params?: Record<string, any>): Promise<Blob> {
    const queryString = params ? `?${new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '').map(([k, v]) => [k, String(v)])
    ).toString()}` : '';
    const response = await apiClient.get<any>(`/api/v1/admin/users/export${queryString}`, {
      responseType: 'blob'
    });

    const data = response.data;

    // Handle different response types
    if (data instanceof Blob) {
      // Check if it's a JSON error response disguised as blob
      if (data.type === 'application/json') {
        const text = await data.text();
        const errorData = JSON.parse(text);
        throw new Error(errorData.message || 'Export failed');
      }
      return data;
    }

    // If response is not a Blob, try to create one from the data
    if (data) {
      return new Blob([data], { type: 'text/csv' });
    }

    throw new Error('No data received from export endpoint');
  },

  async bulkUpdateUserStatus(userIds: string[], status: string, reason: string): Promise<any> {
    const response = await apiClient.post<any>('/api/v1/admin/users/bulk-status', { userIds, status, reason });
    if (response.data?.isSuccess && response.data.value) {
      return response.data.value;
    }
    return response.data;
  },

  // ======== AI Insights ========

  async getAiInsights(): Promise<any[]> {
    const response = await apiClient.get<any>('/api/v1/admin/ai-insights');
    return extractApiData<any[]>(response.data);
  },

  async runBatchAnalysis(): Promise<any> {
    const response = await apiClient.post<any>('/api/v1/admin/analytics/run-batch');
    return extractApiData<any>(response.data);
  },

  // ======== Organization Detail (Admin) ========

  async getOrganizationDetail(organizationId: string): Promise<any> {
    const response = await apiClient.get<any>(`/api/v1/admin/organizations/${organizationId}`);
    return extractApiData<any>(response.data);
  },

  async getOrganizationsPaginated(params?: Record<string, string>): Promise<{ items: any[]; totalCount: number; totalPages: number }> {
    const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
    const response = await apiClient.get<any>(`/api/v1/admin/organizations${queryString}`);
    const data = extractApiData<any>(response.data);

    if (data?.items || data?.Items) {
      return {
        items: data.items || data.Items || [],
        totalCount: data.totalCount ?? data.TotalCount ?? 0,
        totalPages: data.totalPages ?? data.TotalPages ?? 1,
      };
    }

    if (Array.isArray(data)) {
      return { items: data, totalCount: data.length, totalPages: 1 };
    }

    return { items: [], totalCount: 0, totalPages: 1 };
  },

  async createOrganization(data: {
    name: string;
    description?: string;
    organizationType?: string;
    website?: string;
    ownerUserId?: string;
    maxMembers?: number;
    allowMemberInvites?: boolean;
    requireEmailVerification?: boolean;
  }): Promise<string> {
    try {
      const response = await apiClient.post<any>('/api/v1/admin/organizations', data);
      return extractApiData<string>(response.data);
    } catch (error: any) {
      if (error.response?.data?.error) throw new Error(error.response.data.error);
      if (error.response?.data?.message) throw new Error(error.response.data.message);
      throw error;
    }
  },

  async updateOrganization(organizationId: string, data: {
    name?: string;
    description?: string;
    organizationType?: string;
    website?: string;
    maxMembers?: number;
    allowMemberInvites?: boolean;
    requireEmailVerification?: boolean;
  }): Promise<void> {
    try {
      await apiClient.put(`/api/v1/admin/organizations/${organizationId}`, data);
    } catch (error: any) {
      if (error.response?.data?.error) throw new Error(error.response.data.error);
      if (error.response?.data?.message) throw new Error(error.response.data.message);
      throw error;
    }
  },

  async deleteOrganization(organizationId: string): Promise<void> {
    try {
      await apiClient.delete(`/api/v1/admin/organizations/${organizationId}`);
    } catch (error: any) {
      if (error.response?.data?.error) throw new Error(error.response.data.error);
      if (error.response?.data?.message) throw new Error(error.response.data.message);
      throw error;
    }
  },

  async inviteMemberByEmail(organizationId: string, email: string, role: string): Promise<void> {
    try {
      await apiClient.post(`/api/v1/organizations/${organizationId}/invitations`, { email, role });
    } catch (error: any) {
      if (error.response?.data?.error) throw new Error(error.response.data.error);
      if (error.response?.data?.message) throw new Error(error.response.data.message);
      throw error;
    }
  },
};
