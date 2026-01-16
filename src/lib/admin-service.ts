import { apiClient } from './api-client';
import { ApiResponse } from './types';

export const adminService = {
  async getOverview(): Promise<any> {
    try {
      const response = await apiClient.get('/api/v1/admin/overview');
      // Backend returns value directly (not wrapped in Result)
      // Check if it's a Result wrapper first
      if (response.data && typeof response.data === 'object' && 'isSuccess' in response.data) {
        // It's a Result wrapper
        if (response.data.isSuccess && response.data.value) {
          return response.data.value;
        } else if (!response.data.isSuccess) {
          throw new Error(response.data.error?.message || 'Failed to load overview');
        }
      }
      // Direct value response - backend returns AdminSystemOverview directly
      if (!response.data) {
        throw new Error('No data received from server');
      }
      return response.data;
    } catch (error: any) {
      console.error('Error in getOverview:', error);
      // Re-throw with more context if needed
      if (error.response?.status === 401) {
        throw new Error('Unauthorized - please log in as admin');
      } else if (error.response?.status === 403) {
        throw new Error('Forbidden - admin access required');
      }
      throw error;
    }
  },

  async getSystemHealth(): Promise<any> {
    const response = await apiClient.get('/api/v1/admin/system-health');
    // Backend returns value directly (not wrapped in Result)
    // Check if it's a Result wrapper first
    if (response.data && typeof response.data === 'object' && 'isSuccess' in response.data) {
      // It's a Result wrapper
      if (response.data.isSuccess && response.data.value) {
        return response.data.value;
      } else if (!response.data.isSuccess) {
        throw new Error(response.data.error?.message || 'Failed to load system health');
      }
    }
    // Direct value response
    return response.data;
  },

  async getUsers(params?: any): Promise<any> {
    try {
      const queryString = params ? `?${new URLSearchParams(params).toString()}` : '';
      const response = await apiClient.get(`/api/v1/admin/users${queryString}`);
      
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
      const response = await apiClient.get(`/api/v1/admin/organizations${queryString}`);
      
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
      const response = await apiClient.get(`/api/v1/admin/business-plans${queryString}`);
      
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
      const response = await apiClient.get(`/api/v1/admin/activity-logs${queryString}`);
      
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
    const response = await apiClient.get(`/api/v1/admin/reports/${reportType}`);
    return response.data;
  },

  async getAIUsageStats(startDate?: string, endDate?: string): Promise<any> {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await apiClient.get(`/api/v1/admin/ai-usage-stats${queryString}`);
    if (response.data?.isSuccess && response.data.value) {
      return response.data.value;
    } else if (response.data && !response.data.isSuccess) {
      throw new Error(response.data.error?.message || 'Failed to load AI usage stats');
    }
    return response.data;
  },

  async getAIPrompts(): Promise<any[]> {
    try {
      const response = await apiClient.get('/api/v1/admin/ai-prompts');
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
    const response = await apiClient.get(`/api/v1/admin/ai-prompts/${promptId}`);
    return response.data;
  },

  async createAIPrompt(data: any): Promise<string> {
    try {
      const response = await apiClient.post('/api/v1/admin/ai-prompts', data);
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
    const response = await apiClient.get(`/api/v1/admin/ai-prompts/${parentPromptId}/versions`);
    return response.data;
  },

  async getAIPromptStats(): Promise<any> {
    const response = await apiClient.get('/api/v1/admin/ai-prompts/stats');
    return response.data;
  },

  async testAIPrompt(promptId: string, testData: any): Promise<any> {
    const response = await apiClient.post('/api/v1/admin/ai-prompts/test', { promptId, ...testData });
    return response.data;
  },

  async migrateDefaultPrompts(): Promise<{ migrated: number; prompts: any[] }> {
    try {
      const response = await apiClient.post('/api/v1/admin/ai-prompts/migrate-defaults');
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  }
};
