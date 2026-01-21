import { apiClient } from './api-client';
import { FinancialProjection, CreateFinancialProjectionRequest } from './types';

export const financialService = {
  async createFinancialProjection(data: CreateFinancialProjectionRequest): Promise<FinancialProjection> {
    try {
      const response = await apiClient.post<FinancialProjection>('/api/v1/financial/projections', data);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      throw new Error(error.message || 'Failed to create financial projection.');
    }
  },

  async getFinancialProjections(businessPlanId: string): Promise<FinancialProjection[]> {
    try {
      const response = await apiClient.get<FinancialProjection[]>(`/api/v1/financial/projections/business-plan/${businessPlanId}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.errorMessage) {
        throw new Error(error.response.data.errorMessage);
      }
      throw new Error(error.message || 'Failed to get financial projections.');
    }
  },

  async getFinancialProjection(id: string): Promise<FinancialProjection> {
    const response = await apiClient.get<FinancialProjection>(`/api/v1/financial/projections/${id}`);
    return response.data;
  },

  async updateFinancialProjection(id: string, data: Partial<FinancialProjection>): Promise<FinancialProjection> {
    const response = await apiClient.put<FinancialProjection>(`/api/v1/financial/projections/${id}`, data);
    return response.data;
  },

  async deleteFinancialProjection(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/financial/projections/${id}`);
  },

  async getProjectionsByScenario(businessPlanId: string, scenario: string): Promise<FinancialProjection[]> {
    const response = await apiClient.get<FinancialProjection[]>(`/api/v1/financial/projections/business-plan/${businessPlanId}/scenario/${scenario}`);
    return response.data;
  },

  async getKPIs(businessPlanId: string): Promise<any[]> {
    const response = await apiClient.get<any[]>(`/api/v1/financial/kpis/business-plan/${businessPlanId}`);
    return response.data;
  },

  async getKPIsByCategory(businessPlanId: string, category: string): Promise<any[]> {
    const response = await apiClient.get<any[]>(`/api/v1/financial/kpis/business-plan/${businessPlanId}/category/${category}`);
    return response.data;
  },

  async getKPIByName(businessPlanId: string, kpiName: string): Promise<any> {
    const response = await apiClient.get(`/api/v1/financial/kpis/business-plan/${businessPlanId}/name/${kpiName}`);
    return response.data;
  },

  async getBreakEvenAnalysis(businessPlanId: string): Promise<any> {
    const response = await apiClient.get(`/api/v1/financial/analysis/break-even/business-plan/${businessPlanId}`);
    return response.data;
  },

  async getSensitivityAnalysis(businessPlanId: string): Promise<any> {
    const response = await apiClient.get(`/api/v1/financial/analysis/sensitivity/business-plan/${businessPlanId}`);
    return response.data;
  },

  async getScenarioAnalysis(businessPlanId: string): Promise<any> {
    const response = await apiClient.get(`/api/v1/financial/analysis/scenario/business-plan/${businessPlanId}`);
    return response.data;
  },

  async getNPV(businessPlanId: string): Promise<any> {
    const response = await apiClient.get(`/api/v1/financial/investment/npv/business-plan/${businessPlanId}`);
    return response.data;
  },

  async getIRR(businessPlanId: string): Promise<any> {
    const response = await apiClient.get(`/api/v1/financial/investment/irr/business-plan/${businessPlanId}`);
    return response.data;
  },

  async getROI(businessPlanId: string): Promise<any> {
    const response = await apiClient.get(`/api/v1/financial/investment/roi/business-plan/${businessPlanId}`);
    return response.data;
  },

  async analyzeInvestment(data: any): Promise<any> {
    const response = await apiClient.post(`/api/v1/financial/investment/analysis`, data);
    return response.data;
  },

  async getFinancialReports(businessPlanId: string): Promise<any> {
    const response = await apiClient.get(`/api/v1/financial/reports/business-plan/${businessPlanId}`);
    return response.data;
  },

  async getBalanceSheet(businessPlanId: string): Promise<any> {
    const response = await apiClient.get(`/api/v1/financial/reports/balance-sheet/business-plan/${businessPlanId}`);
    return response.data;
  },

  async getCashFlow(businessPlanId: string): Promise<any> {
    const response = await apiClient.get(`/api/v1/financial/reports/cash-flow/business-plan/${businessPlanId}`);
    return response.data;
  },

  async getProfitLoss(businessPlanId: string): Promise<any> {
    const response = await apiClient.get(`/api/v1/financial/reports/profit-loss/business-plan/${businessPlanId}`);
    return response.data;
  },

  async calculateTax(data: any): Promise<any> {
    const response = await apiClient.post(`/api/v1/financial/tax/calculate`, data);
    return response.data;
  },

  async getTaxProjection(projectionId: string): Promise<any> {
    const response = await apiClient.get(`/api/v1/financial/tax/projection/${projectionId}`);
    return response.data;
  },

  async getTaxRules(): Promise<any[]> {
    const response = await apiClient.get<any[]>(`/api/v1/financial/tax/rules`);
    return response.data;
  },

  async getCurrencies(): Promise<any[]> {
    const response = await apiClient.get<any[]>(`/api/v1/financial/currencies`);
    return response.data;
  },

  async getCurrency(currencyCode: string): Promise<any> {
    const response = await apiClient.get(`/api/v1/financial/currencies/${currencyCode}`);
    return response.data;
  },

  async getExchangeRate(from: string, to: string): Promise<number> {
    const response = await apiClient.get<number>(`/api/v1/financial/currencies/exchange-rate?from=${from}&to=${to}`);
    return response.data;
  },

  async convertCurrency(amount: number, from: string, to: string): Promise<number> {
    const response = await apiClient.post<number>(`/api/v1/financial/currencies/convert`, { amount, from, to });
    return response.data;
  }
};
