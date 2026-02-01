import { apiClient } from './api-client';
import { BusinessPlan, CreateBusinessPlanRequest, ApiResponse } from './types';

const DEMO_PLANS: BusinessPlan[] = [
  {
    id: 'demo-plan-1',
    title: 'TechStart 2024 Business Plan',
    description: 'Cloud-based project management platform for small businesses',
    industry: 'Technology',
    businessType: 'Startup',
    status: 'InProgress',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'demo-plan-2',
    title: 'Green Earth OBNL Strategic Plan',
    description: 'Environmental education nonprofit serving local schools',
    industry: 'Education',
    businessType: 'OBNL',
    status: 'Draft',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const businessPlanService = {
  async getBusinessPlans(): Promise<BusinessPlan[]> {
    if (localStorage.getItem('demoMode') === 'true') {
      const customPlans = localStorage.getItem('demoPlans');
      if (customPlans) {
        return JSON.parse(customPlans);
      }
      return DEMO_PLANS;
    }

    try {
      const response = await apiClient.get<BusinessPlan[]>('/api/v1/business-plans');
      
      // Backend returns the array directly via Ok(result.Value)
      const plansData = Array.isArray(response.data) ? response.data : [];
      
      // Defensive filter: ensure no deleted plans slip through (backend should filter, but just in case)
      return plansData.filter((plan: any) => !plan.isDeleted && !plan.IsDeleted);
    } catch (error: any) {
      console.error('Failed to fetch business plans:', error);
      return [];
    }
  },

  async getBusinessPlan(id: string): Promise<BusinessPlan> {
    if (localStorage.getItem('demoMode') === 'true') {
      const customPlans = localStorage.getItem('demoPlans');
      const plans = customPlans ? JSON.parse(customPlans) : DEMO_PLANS;
      const plan = plans.find((p: BusinessPlan) => p.id === id);
      if (plan) return plan;
      throw new Error('Plan not found');
    }

    const response = await apiClient.get<BusinessPlan>(`/api/v1/business-plans/${id}`);
    if (response.data && response.data.id) {
      return response.data;
    }
    if ((response.data as any).value) {
      return (response.data as any).value;
    }
    throw new Error('Failed to get business plan');
  },

  async createBusinessPlan(data: CreateBusinessPlanRequest): Promise<BusinessPlan> {
    if (localStorage.getItem('demoMode') === 'true') {
      const newPlan: BusinessPlan = {
        id: 'demo-plan-' + Date.now(),
        title: data.title,
        description: data.description || '',
        industry: data.industry || 'General',
        businessType: data.businessType,
        status: 'Draft',
        createdAt: new Date().toISOString()
      };

      const customPlans = localStorage.getItem('demoPlans');
      const plans = customPlans ? JSON.parse(customPlans) : [...DEMO_PLANS];
      plans.push(newPlan);
      localStorage.setItem('demoPlans', JSON.stringify(plans));

      return newPlan;
    }

    try {
      const response = await apiClient.post<any>('/api/v1/business-plans', data);

      // Handle wrapped response format (isSuccess/value)
      if (response.data?.isSuccess && response.data.value) {
        return response.data.value;
      }

      // Handle direct response format
      if (response.data && response.data.id) {
        return response.data;
      }

      throw new Error(response.data?.errorMessage || 'Failed to create business plan');
    } catch (error: any) {
      console.error('Create business plan error:', error.response?.data);

      // Handle ASP.NET Core validation error format
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages: string[] = [];

        // Handle errors object with field names as keys
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

      throw new Error(error.message || 'Failed to create business plan. Please try again.');
    }
  },

  async exportToPDF(id: string): Promise<Blob> {
    const response = await apiClient.get(`/api/v1/business-plans/${id}/export/pdf`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async exportToWord(id: string): Promise<Blob> {
    const response = await apiClient.get(`/api/v1/business-plans/${id}/export/word`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async exportToHTML(id: string): Promise<string> {
    const response = await apiClient.get(`/api/v1/business-plans/${id}/export/html`);
    return response.data;
  },

  async getExportStatus(id: string): Promise<any> {
    const response = await apiClient.get(`/api/v1/business-plans/${id}/export/status`);
    return response.data;
  },

  async getExportTemplates(id: string): Promise<any[]> {
    const response = await apiClient.get(`/api/v1/business-plans/${id}/export/templates`);
    return response.data;
  },

  async updateBusinessPlan(id: string, data: Partial<BusinessPlan>): Promise<BusinessPlan> {
    const response = await apiClient.put<BusinessPlan>(`/api/v1/business-plans/${id}`, data);
    if (response.data && response.data.id) {
      return response.data;
    }
    if ((response.data as any).value) {
      return (response.data as any).value;
    }
    throw new Error('Failed to update business plan');
  },

  async deleteBusinessPlan(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/business-plans/${id}`);
  },

  async archiveBusinessPlan(id: string): Promise<void> {
    await apiClient.post(`/api/v1/business-plans/${id}/archive`);
  },

  async unarchiveBusinessPlan(id: string): Promise<void> {
    await apiClient.post(`/api/v1/business-plans/${id}/unarchive`);
  },

  async generateBusinessPlan(id: string): Promise<void> {
    // Business plan generation can take 2-5 minutes (multiple sections, each calling OpenAI)
    // Set timeout to 10 minutes (600000ms) to allow for completion
    await apiClient.post(`/api/v1/business-plans/${id}/generate`, undefined, {
      timeout: 600000, // 10 minutes
    });
  },

  async getGenerationStatus(id: string): Promise<any> {
    const response = await apiClient.get(`/api/v1/business-plans/${id}/generation-status`);
    return response.data;
  },

  async regenerateSection(id: string, sectionName: string): Promise<void> {
    await apiClient.post(`/api/v1/business-plans/${id}/regenerate/${sectionName}`);
  },

  async getAvailableSections(): Promise<string[]> {
    const response = await apiClient.get('/api/v1/business-plans/available-sections');
    return response.data;
  },

  async getPlanTypes(): Promise<any[]> {
    const response = await apiClient.get('/api/v1/business-plans/plan-types');
    return response.data;
  },

  async getBusinessPlansByOrganization(organizationId: string): Promise<BusinessPlan[]> {
    const response = await apiClient.get<BusinessPlan[]>(`/api/v1/business-plans/organizations/${organizationId}`);
    return Array.isArray(response.data) ? response.data : [];
  },

  async getSections(id: string): Promise<any[]> {
    const response = await apiClient.get(`/api/v1/business-plans/${id}/sections`);
    return response.data;
  },

  async getSection(id: string, sectionName: string): Promise<any> {
    const response = await apiClient.get(`/api/v1/business-plans/${id}/sections/${sectionName}`);
    return response.data;
  },

  async updateSection(id: string, sectionName: string, content: any): Promise<any> {
    const response = await apiClient.put(`/api/v1/business-plans/${id}/sections/${sectionName}`, content);
    return response.data;
  },

  async expandSection(id: string, sectionName: string, currentContent?: string, planType?: string, language: string = 'en'): Promise<any> {
    // First get the section to get current content if not provided
    if (!currentContent) {
      const section = await this.getSection(id, sectionName);
      currentContent = section.content || '';
    }
    
    // Strip HTML tags to get plain text for length validation
    const stripHtml = (html: string): string => {
      if (typeof document === 'undefined') {
        // Fallback for non-browser environments - use regex
        return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      }
      const tmp = document.createElement('DIV');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    };
    
    const plainText = stripHtml(currentContent || '').trim();
    
    // If content is too short, provide a default prompt
    let finalContent = currentContent || '';
    if (plainText.length < 10) {
      finalContent = 'Expand this section with more details, examples, and comprehensive information.';
    }
    
    const requestBody = {
      currentContent: finalContent,
      improvementType: 'expand',
      language: language,
      planType: planType || 'BusinessPlan'
    };
    
    const response = await apiClient.post(`/api/v1/business-plans/${id}/sections/${sectionName}/expand`, requestBody);
    return response.data;
  },

  async improveSection(id: string, sectionName: string, currentContent?: string, planType?: string, language: string = 'en'): Promise<any> {
    // First get the section to get current content if not provided
    if (!currentContent && currentContent !== '') {
      const section = await this.getSection(id, sectionName);
      currentContent = section.content || '';
    }
    
    // Strip HTML tags to get plain text for length validation
    const stripHtml = (html: string): string => {
      if (!html) return '';
      if (typeof document === 'undefined') {
        // Fallback for non-browser environments - use regex
        return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      }
      try {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
      } catch {
        return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      }
    };
    
    const plainText = stripHtml(currentContent || '').trim();
    
    // If content is too short, provide a default prompt based on section name
    let finalContent = currentContent || '';
    if (plainText.length < 10) {
      const sectionPrompts: { [key: string]: string } = {
        'executive-summary': 'Provide a comprehensive overview of the business plan highlighting key objectives, strategies, and financial projections for the next three to five years.',
        'business-concept': 'Describe the innovative business idea that addresses market needs and creates value for customers in a unique and compelling way.',
        'target-market': 'Provide detailed analysis of ideal customer demographics, behaviors, and market segments with specific examples and data.',
        'market-analysis': 'Include in-depth research of industry trends, market size, growth potential, and competitive landscape with supporting statistics.',
        'competitive-advantage': 'Explain unique features and strategies that differentiate the business from competitors and create sustainable advantages.',
        'marketing-strategy': 'Describe the comprehensive plan for reaching and engaging the target audience through various channels and tactics.',
        'operations-plan': 'Detail the day-to-day operational structure, processes, and resources required to run the business efficiently.',
        'management-team': 'Introduce key team members, their roles, experience, and how they contribute to business success and growth.',
        'financial-projections': 'Provide detailed revenue forecasts, expense budgets, cash flow analysis, and break-even projections for multiple years.',
        'risk-analysis': 'Identify potential risks and mitigation strategies to ensure business continuity and protect against major threats.',
      };
      finalContent = sectionPrompts[sectionName.toLowerCase()] || 'Create comprehensive and detailed content for this business plan section with specific examples and supporting information.';
    }
    
    // Ensure final content is at least 10 characters (backend requirement)
    if (finalContent.trim().length < 10) {
      finalContent = 'Create comprehensive content for this business plan section with detailed information and examples.';
    }
    
    const requestBody = {
      currentContent: finalContent,
      improvementType: 'improve',
      language: language,
      planType: planType || 'BusinessPlan'
    };
    
    console.log('Improve section request:', { 
      sectionName, 
      contentLength: finalContent.length, 
      planType,
      requestBody: {
        currentContent: finalContent.substring(0, 100) + '...',
        improvementType: requestBody.improvementType,
        language: requestBody.language,
        planType: requestBody.planType
      }
    });
    
    try {
      const response = await apiClient.post(`/api/v1/business-plans/${id}/sections/${sectionName}/improve`, requestBody);
      return response.data;
    } catch (error: any) {
      console.error('Improve section API error:', {
        status: error.response?.status,
        data: error.response?.data,
        requestBody
      });
      throw error;
    }
  },

  async simplifySection(id: string, sectionName: string, currentContent?: string, planType?: string, language: string = 'en'): Promise<any> {
    // First get the section to get current content if not provided
    if (!currentContent) {
      const section = await this.getSection(id, sectionName);
      currentContent = section.content || '';
    }
    
    // Strip HTML tags to get plain text for length validation
    const stripHtml = (html: string): string => {
      if (typeof document === 'undefined') {
        // Fallback for non-browser environments - use regex
        return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      }
      const tmp = document.createElement('DIV');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    };
    
    const plainText = stripHtml(currentContent || '').trim();
    
    // If content is too short, we can't simplify it
    if (plainText.length < 10) {
      throw new Error('Section content must be at least 10 characters to simplify. Please add content first.');
    }
    
    const requestBody = {
      currentContent: currentContent || '',
      improvementType: 'simplify',
      language: language,
      planType: planType || 'BusinessPlan'
    };
    
    const response = await apiClient.post(`/api/v1/business-plans/${id}/sections/${sectionName}/simplify`, requestBody);
    return response.data;
  },

  async getQuestionnaire(id: string, language?: 'en' | 'fr'): Promise<any> {
    const config = language ? {
      headers: { 'Accept-Language': language }
    } : undefined;
    const response = await apiClient.get(`/api/v1/business-plans/${id}/questionnaire`, undefined, config);
    return response.data;
  },

  async getQuestionnaireResponses(id: string, language?: 'en' | 'fr'): Promise<any[]> {
    const config = language ? {
      headers: { 'Accept-Language': language }
    } : undefined;
    const response = await apiClient.get(`/api/v1/business-plans/${id}/questionnaire/responses`, undefined, config);
    // Handle wrapped response format
    if (response.data?.value) {
      return Array.isArray(response.data.value) ? response.data.value : [];
    }
    return Array.isArray(response.data) ? response.data : [];
  },

  async getQuestionnaireProgress(id: string): Promise<any> {
    const response = await apiClient.get(`/api/v1/business-plans/${id}/questionnaire/progress`);
    return response.data;
  },

  async submitQuestionnaireResponses(id: string, responses: any): Promise<void> {
    await apiClient.post(`/api/v1/business-plans/${id}/questionnaire/responses`, responses);
  },

  async suggestAnswer(id: string, questionId: string, questionText: string, planType: string, existingResponse?: string, language: string = 'en'): Promise<string> {
    const requestBody = {
      questionText: questionText,
      planType: planType,
      existingResponse: existingResponse || null,
      organizationContext: null, // Can be enhanced later
      suggestionCount: 1, // Return single suggestion for simplicity
      language: language
    };
    
    const response = await apiClient.post<{ suggestions?: Array<{ answer: string }> }>(`/api/v1/business-plans/${id}/questionnaire/questions/${questionId}/suggest-answer`, requestBody);
    
    // Extract the first suggestion's answer text
    if (response.data?.suggestions && response.data.suggestions.length > 0) {
      return response.data.suggestions[0].answer;
    }
    
    // Fallback: return as string if structure is different
    return typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
  },

  async getFinancialProjections(id: string): Promise<any[]> {
    const response = await apiClient.get(`/api/v1/business-plans/${id}/financial-projections`);
    return response.data;
  },

  async createFinancialProjection(id: string, data: any): Promise<any> {
    const response = await apiClient.post(`/api/v1/business-plans/${id}/financial-projections`, data);
    return response.data;
  },

  async updateFinancialProjection(businessPlanId: string, projectionId: string, data: any): Promise<any> {
    const response = await apiClient.put(`/api/v1/business-plans/${businessPlanId}/financial-projections/${projectionId}`, data);
    return response.data;
  },

  async deleteFinancialProjection(businessPlanId: string, projectionId: string): Promise<void> {
    await apiClient.delete(`/api/v1/business-plans/${businessPlanId}/financial-projections/${projectionId}`);
  },

  async validateFinancialProjection(businessPlanId: string, projectionId: string): Promise<any> {
    const response = await apiClient.post(`/api/v1/business-plans/${businessPlanId}/financial-projections/${projectionId}/validate`);
    return response.data;
  },

  async getFinancialProjectionMetrics(id: string): Promise<any> {
    const response = await apiClient.get(`/api/v1/business-plans/${id}/financial-projections/metrics`);
    return response.data;
  },

  async getFinancialProjectionTemplates(id: string): Promise<any[]> {
    const response = await apiClient.get(`/api/v1/business-plans/${id}/financial-projections/templates`);
    return response.data;
  },

  async applyFinancialProjectionTemplate(id: string, templateId: string): Promise<void> {
    await apiClient.post(`/api/v1/business-plans/${id}/financial-projections/apply-template`, { templateId });
  },

  async generateFinancialScenario(id: string, scenario: any): Promise<any> {
    const response = await apiClient.post(`/api/v1/business-plans/${id}/financial-projections/generate-scenario`, scenario);
    return response.data;
  },

  async exportFinancialProjections(id: string, format: string): Promise<Blob> {
    const response = await apiClient.get(`/api/v1/business-plans/${id}/financial-projections/export?format=${format}`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Duplicate business plan
  async duplicateBusinessPlan(id: string, newTitle?: string): Promise<BusinessPlan> {
    const response = await apiClient.post<any>(`/api/v1/business-plans/${id}/duplicate`, { 
      newTitle: newTitle || undefined 
    });
    if (response.data?.isSuccess && response.data.value) {
      return response.data.value;
    }
    if (response.data && response.data.id) {
      return response.data;
    }
    throw new Error('Failed to duplicate business plan');
  },

  // Helper function to convert permission string to number
  permissionToNumber(permission: 'ReadOnly' | 'Edit' | 'FullAccess'): number {
    const permissionMap: Record<'ReadOnly' | 'Edit' | 'FullAccess', number> = {
      'ReadOnly': 0,
      'Edit': 1,
      'FullAccess': 2
    };
    return permissionMap[permission];
  },

  // Share business plan
  async shareBusinessPlan(id: string, userIdOrEmail: string, permission: 'ReadOnly' | 'Edit' | 'FullAccess', isEmail: boolean = false): Promise<any> {
    const permissionNumber = businessPlanService.permissionToNumber(permission);
    const requestBody = isEmail 
      ? { email: userIdOrEmail, permission: permissionNumber }
      : { sharedWithUserId: userIdOrEmail, permission: permissionNumber };
    
    const response = await apiClient.post(`/api/v1/business-plans/${id}/shares`, requestBody);
    return response.data;
  },

  async createPublicShare(id: string, permission: 'ReadOnly' | 'Edit' | 'FullAccess', expiresAt?: string): Promise<any> {
    const permissionNumber = businessPlanService.permissionToNumber(permission);
    const response = await apiClient.post(`/api/v1/business-plans/${id}/shares/public`, {
      permission: permissionNumber,
      expiresAt
    });
    return response.data;
  },

  async getShares(id: string): Promise<any[]> {
    const response = await apiClient.get(`/api/v1/business-plans/${id}/shares`);
    return Array.isArray(response.data) ? response.data : [];
  },

  async revokeShare(id: string, shareId: string): Promise<void> {
    await apiClient.delete(`/api/v1/business-plans/${id}/shares/${shareId}`);
  },

  async updateSharePermission(id: string, shareId: string, permission: 'ReadOnly' | 'Edit' | 'FullAccess'): Promise<any> {
    const permissionNumber = businessPlanService.permissionToNumber(permission);
    const response = await apiClient.put(`/api/v1/business-plans/${id}/shares/${shareId}/permission`, { permission: permissionNumber });
    return response.data;
  },

  // Version history
  async createVersion(id: string, comment?: string): Promise<any> {
    const response = await apiClient.post(`/api/v1/business-plans/${id}/versions`, { comment });
    return response.data;
  },

  async getVersions(id: string): Promise<any[]> {
    const response = await apiClient.get(`/api/v1/business-plans/${id}/versions`);
    return Array.isArray(response.data) ? response.data : [];
  },

  async getVersion(id: string, versionNumber: number): Promise<any> {
    const response = await apiClient.get(`/api/v1/business-plans/${id}/versions/${versionNumber}`);
    return response.data;
  },

  async restoreVersion(id: string, versionNumber: number): Promise<any> {
    const response = await apiClient.post(`/api/v1/business-plans/${id}/versions/${versionNumber}/restore`);
    return response.data;
  },

  async uploadCoverImage(id: string, file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiClient.post(`/api/v1/business-plans/${id}/cover/upload-image`, formData);
      
      const data = response.data;
      
      // Handle different response formats
      if (data.isSuccess && data.value) {
        return data.value;
      }
      
      if (data.url) {
        return data.url;
      }
      
      if (data.coverImageUrl) {
        return data.coverImageUrl;
      }
      
      if (typeof data === 'string' && data.startsWith('http')) {
        return data;
      }
      
      if (data.errorMessage) {
        throw new Error(data.errorMessage);
      }
      
      throw new Error('Failed to upload cover image: Invalid response format');
    } catch (error: any) {
      console.error('Cover image upload error:', error);
      const errorMessage = 
        error.response?.data?.errorMessage ||
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.userMessage ||
        error.message ||
        'Failed to upload cover image';
      throw new Error(errorMessage);
    }
  },

  async updateCoverSettings(id: string, coverSettings: { backgroundColor?: string; accentColor?: string; coverImageUrl?: string }): Promise<void> {
    try {
      // Try dedicated cover endpoint first
      await apiClient.put(`/api/v1/business-plans/${id}/cover`, coverSettings);
    } catch (error: any) {
      // Fallback to updating the business plan with coverSettings
      if (error.response?.status === 404) {
        await this.updateBusinessPlan(id, { coverSettings } as any);
      } else {
        throw error;
      }
    }
  }
};
