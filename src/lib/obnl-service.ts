import { apiClient } from './api-client';
import { OBNLPlan, CreateOBNLPlanRequest, ApiResponse } from './types';

export const obnlService = {
  async createOBNLPlan(data: CreateOBNLPlanRequest): Promise<{ id: string; message: string }> {
    try {
      const response = await apiClient.post<{ id: string; message: string }>('/api/obnl/plans', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      throw new Error(error.message || 'Failed to create OBNL plan.');
    }
  },

  async getOBNLPlan(planId: string): Promise<OBNLPlan> {
    try {
      const response = await apiClient.get<OBNLPlan>(`/api/obnl/plans/${planId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      throw new Error(error.message || 'Failed to get OBNL plan.');
    }
  },

  async updateOBNLPlan(planId: string, data: Partial<OBNLPlan>): Promise<OBNLPlan> {
    const response = await apiClient.put<OBNLPlan>(`/api/obnl/plans/${planId}`, data);
    return response.data;
  },

  async deleteOBNLPlan(planId: string): Promise<void> {
    await apiClient.delete(`/api/obnl/plans/${planId}`);
  },

  async getOBNLPlansByOrganization(organizationId: string): Promise<OBNLPlan[]> {
    const response = await apiClient.get<OBNLPlan[]>(`/api/obnl/organizations/${organizationId}/plans`);
    return response.data;
  },

  async getGrants(planId: string): Promise<any[]> {
    const response = await apiClient.get(`/api/obnl/plans/${planId}/grants`);
    return response.data;
  },

  async addGrant(planId: string, grantData: any): Promise<any> {
    const response = await apiClient.post(`/api/obnl/plans/${planId}/grants`, grantData);
    return response.data;
  },

  async getImpactMeasurements(planId: string): Promise<any[]> {
    const response = await apiClient.get(`/api/obnl/plans/${planId}/impact-measurements`);
    return response.data;
  },

  async addImpactMeasurement(planId: string, measurementData: any): Promise<any> {
    const response = await apiClient.post(`/api/obnl/plans/${planId}/impact-measurements`, measurementData);
    return response.data;
  },

  async analyzeCompliance(planId: string): Promise<any> {
    const response = await apiClient.post(`/api/obnl/plans/${planId}/compliance/analyze`);
    return response.data;
  }
};
