import { apiClient } from './api-client';
import { Template, CreateTemplateRequest, ApiResponse } from './types';

export const templateService = {
  async getTemplates(): Promise<Template[]> {
    try {
      // Use the correct API endpoint for admin
      const response = await apiClient.get<any>('/api/v1/template');
      
      // Backend returns Result wrapper
      if (response.data && typeof response.data === 'object' && 'isSuccess' in response.data) {
        if (response.data.isSuccess && response.data.value) {
          return Array.isArray(response.data.value) ? response.data.value : [];
        } else if (!response.data.isSuccess) {
          throw new Error(response.data.error?.message || 'Failed to get templates');
        }
      }
      
      // Handle direct response format
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error: any) {
      console.error('Failed to fetch templates:', error);
      if (error.response?.status === 401) {
        throw new Error('Unauthorized - please log in as admin');
      } else if (error.response?.status === 403) {
        throw new Error('Forbidden - admin access required');
      }
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      throw new Error(error.message || 'Failed to get templates.');
    }
  },

  async getTemplate(id: string): Promise<Template> {
    try {
      const response = await apiClient.get<any>(`/api/v1/template/${id}`);
      
      // Backend returns Result wrapper
      if (response.data && typeof response.data === 'object' && 'isSuccess' in response.data) {
        if (response.data.isSuccess && response.data.value) {
          return response.data.value;
        } else if (!response.data.isSuccess) {
          throw new Error(response.data.error?.message || 'Template not found');
        }
      }
      
      // Handle direct response format
      if (response.data && response.data.id) {
        return response.data;
      }
      
      throw new Error('Template not found');
    } catch (error: any) {
      console.error('Failed to fetch template:', error);
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      throw new Error(error.message || 'Failed to get template.');
    }
  },

  async createTemplate(data: CreateTemplateRequest): Promise<Template> {
    try {
      const response = await apiClient.post<any>('/api/v1/template', data);
      
      // Backend returns Result wrapper
      if (response.data && typeof response.data === 'object' && 'isSuccess' in response.data) {
        if (response.data.isSuccess && response.data.value) {
          return response.data.value;
        } else if (!response.data.isSuccess) {
          throw new Error(response.data.error?.message || 'Failed to create template');
        }
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      throw new Error(error.message || 'Failed to create template.');
    }
  },

  async updateTemplate(id: string, data: Partial<Template>): Promise<Template> {
    try {
      const response = await apiClient.put<any>(`/api/v1/template/${id}`, data);
      
      // Backend returns Result wrapper
      if (response.data && typeof response.data === 'object' && 'isSuccess' in response.data) {
        if (response.data.isSuccess && response.data.value) {
          return response.data.value;
        } else if (!response.data.isSuccess) {
          throw new Error(response.data.error?.message || 'Failed to update template');
        }
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      throw new Error(error.message || 'Failed to update template.');
    }
  },

  async deleteTemplate(id: string): Promise<void> {
    try {
      await apiClient.delete(`/api/v1/template/${id}`);
    } catch (error: any) {
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      throw new Error(error.message || 'Failed to delete template.');
    }
  },

  async getPublicTemplates(): Promise<Template[]> {
    try {
      const response = await apiClient.get<any>('/api/v1/template/public');
      
      // Backend returns Result wrapper
      if (response.data && typeof response.data === 'object' && 'isSuccess' in response.data) {
        if (response.data.isSuccess && response.data.value) {
          return Array.isArray(response.data.value) ? response.data.value : [];
        } else if (!response.data.isSuccess) {
          throw new Error(response.data.error?.message || 'Failed to get public templates');
        }
      }
      
      // Handle direct response format
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error: any) {
      console.error('Failed to fetch public templates:', error);
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      throw new Error(error.message || 'Failed to get public templates.');
    }
  },

  async getPopularTemplates(): Promise<Template[]> {
    try {
      const response = await apiClient.get<any>('/api/Template/popular');
      
      if (response.data?.isSuccess && response.data.value) {
        return Array.isArray(response.data.value) ? response.data.value : [];
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch popular templates:', error);
      return [];
    }
  },

  async getRecentTemplates(): Promise<Template[]> {
    try {
      const response = await apiClient.get<any>('/api/Template/recent');
      
      if (response.data?.isSuccess && response.data.value) {
        return Array.isArray(response.data.value) ? response.data.value : [];
      }
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      console.error('Failed to fetch recent templates:', error);
      return [];
    }
  },

  async searchTemplates(query: string): Promise<Template[]> {
    try {
      const response = await apiClient.get<any>(`/api/v1/template/search?searchTerm=${encodeURIComponent(query)}`);
      
      // Backend returns Result wrapper
      if (response.data && typeof response.data === 'object' && 'isSuccess' in response.data) {
        if (response.data.isSuccess && response.data.value) {
          return Array.isArray(response.data.value) ? response.data.value : [];
        }
      }
      
      if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error: any) {
      console.error('Failed to search templates:', error);
      return [];
    }
  },

  async getTemplatesByCategory(category: string): Promise<Template[]> {
    try {
      const response = await apiClient.get<any>(`/api/v1/template/category/${encodeURIComponent(category)}`);
      
      // Backend returns Result wrapper
      if (response.data && typeof response.data === 'object' && 'isSuccess' in response.data) {
        if (response.data.isSuccess && response.data.value) {
          return Array.isArray(response.data.value) ? response.data.value : [];
        }
      }
      
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error: any) {
      console.error('Failed to fetch templates by category:', error);
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      throw new Error(error.message || 'Failed to get templates by category.');
    }
  },

  async getTemplatesByIndustry(industry: string): Promise<Template[]> {
    try {
      const response = await apiClient.get<any>(`/api/v1/template/industry/${encodeURIComponent(industry)}`);
      
      // Backend returns Result wrapper
      if (response.data && typeof response.data === 'object' && 'isSuccess' in response.data) {
        if (response.data.isSuccess && response.data.value) {
          return Array.isArray(response.data.value) ? response.data.value : [];
        }
      }
      
      if (Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error: any) {
      console.error('Failed to fetch templates by industry:', error);
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      throw new Error(error.message || 'Failed to get templates by industry.');
    }
  },

  async getTemplatesByAuthor(author: string): Promise<Template[]> {
    const response = await apiClient.get<Template[]>(`/api/Template/author/${author}`);
    return response.data;
  },

  async cloneTemplate(id: string, newName?: string): Promise<Template> {
    try {
      const response = await apiClient.post<any>(`/api/v1/template/${id}/clone`, { name: newName || `Clone of Template ${id}` });
      
      // Backend returns Result wrapper
      if (response.data && typeof response.data === 'object' && 'isSuccess' in response.data) {
        if (response.data.isSuccess && response.data.value) {
          return response.data.value;
        } else if (!response.data.isSuccess) {
          throw new Error(response.data.error?.message || 'Failed to clone template');
        }
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      throw new Error(error.message || 'Failed to clone template.');
    }
  },

  async publishTemplate(id: string): Promise<void> {
    try {
      await apiClient.post(`/api/v1/template/${id}/publish`);
    } catch (error: any) {
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      throw new Error(error.message || 'Failed to publish template.');
    }
  },

  async archiveTemplate(id: string): Promise<void> {
    try {
      await apiClient.post(`/api/v1/template/${id}/archive`);
    } catch (error: any) {
      if (error.response?.data?.error?.message) {
        throw new Error(error.response.data.error.message);
      }
      throw new Error(error.message || 'Failed to archive template.');
    }
  },

  async rateTemplate(id: string, rating: number): Promise<void> {
    await apiClient.post(`/api/Template/${id}/rate`, { rating });
  },

  async getTemplateAnalytics(id: string): Promise<any> {
    const response = await apiClient.get(`/api/Template/${id}/analytics`);
    return response.data;
  },

  async getTemplateUsage(id: string): Promise<any> {
    const response = await apiClient.get(`/api/Template/${id}/usage`);
    return response.data;
  }
};
