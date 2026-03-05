import { apiClient } from './api-client';
import type {
  FinancialPlanDto, FinancialPlanSettings, SalesModuleData, SalesProduct,
  SalesVolumeGrid, MonthlyValue, COGSModuleData, COGSItem, PayrollModuleData,
  PayrollItem, SalaryCalculation, SalesExpenseItem, AdminExpenseItem,
  CapexAsset, FinancingModuleData, FinancingSource, AmortizationEntry,
  ProjectCostData, ProfitLossStatement, CashFlowStatement, BalanceSheetStatement,
  FinancialRatios
} from '../types/financial-projections';

const BASE = (businessPlanId: string) => `/api/v1/business-plans/${businessPlanId}/previsio`;

export const previsioService = {
  // === Financial Plan ===
  async getPlan(businessPlanId: string): Promise<FinancialPlanDto> {
    const res = await apiClient.get<FinancialPlanDto>(BASE(businessPlanId));
    return res.data;
  },

  async createPlan(businessPlanId: string, startYear: number, projectionYears = 3): Promise<FinancialPlanDto> {
    const res = await apiClient.post<FinancialPlanDto>(BASE(businessPlanId), { startYear, projectionYears });
    return res.data;
  },

  async updateSettings(businessPlanId: string, settings: FinancialPlanSettings): Promise<FinancialPlanDto> {
    const res = await apiClient.put<FinancialPlanDto>(`${BASE(businessPlanId)}/settings`, settings);
    return res.data;
  },

  async deletePlan(businessPlanId: string): Promise<void> {
    await apiClient.delete(BASE(businessPlanId));
  },

  // === Sales ===
  async getSales(businessPlanId: string): Promise<SalesModuleData> {
    const res = await apiClient.get<SalesModuleData>(`${BASE(businessPlanId)}/sales`);
    return res.data;
  },

  async createProduct(businessPlanId: string, data: Omit<SalesProduct, 'id' | 'sortOrder' | 'hasCOGS' | 'volumeIndexationRate' | 'priceIndexationRate'>): Promise<SalesProduct> {
    const res = await apiClient.post<SalesProduct>(`${BASE(businessPlanId)}/sales/products`, data);
    return res.data;
  },

  async updateProduct(businessPlanId: string, productId: string, data: Partial<SalesProduct>): Promise<SalesProduct> {
    const res = await apiClient.put<SalesProduct>(`${BASE(businessPlanId)}/sales/products/${productId}`, data);
    return res.data;
  },

  async deleteProduct(businessPlanId: string, productId: string): Promise<void> {
    await apiClient.delete(`${BASE(businessPlanId)}/sales/products/${productId}`);
  },

  async getVolumeGrid(businessPlanId: string, productId: string, year: number): Promise<SalesVolumeGrid> {
    const res = await apiClient.get<SalesVolumeGrid>(`${BASE(businessPlanId)}/sales/products/${productId}/volumes/${year}`);
    return res.data;
  },

  async updateVolumeGrid(businessPlanId: string, salesProductId: string, year: number, monthlyValues: MonthlyValue[]): Promise<SalesVolumeGrid> {
    const res = await apiClient.put<SalesVolumeGrid>(`${BASE(businessPlanId)}/sales/volumes`, { salesProductId, year, monthlyValues });
    return res.data;
  },

  async replicateYear(businessPlanId: string, sourceYear: number, targetYear: number, augmentationRate: number, productIds?: string[]): Promise<void> {
    await apiClient.post(`${BASE(businessPlanId)}/sales/replicate`, { sourceYear, targetYear, augmentationRate, productIds });
  },

  // === COGS ===
  async getCOGS(businessPlanId: string): Promise<COGSModuleData> {
    const res = await apiClient.get<COGSModuleData>(`${BASE(businessPlanId)}/cogs`);
    return res.data;
  },

  async createCOGS(businessPlanId: string, data: { linkedSalesProductId: string; costMode: string; costValue: number; beginningInventory: number }): Promise<COGSItem> {
    const res = await apiClient.post<COGSItem>(`${BASE(businessPlanId)}/cogs`, data);
    return res.data;
  },

  async updateCOGS(businessPlanId: string, itemId: string, data: Partial<COGSItem>): Promise<COGSItem> {
    const res = await apiClient.put<COGSItem>(`${BASE(businessPlanId)}/cogs/${itemId}`, data);
    return res.data;
  },

  async deleteCOGS(businessPlanId: string, itemId: string): Promise<void> {
    await apiClient.delete(`${BASE(businessPlanId)}/cogs/${itemId}`);
  },

  // === Payroll ===
  async getPayroll(businessPlanId: string): Promise<PayrollModuleData> {
    const res = await apiClient.get<PayrollModuleData>(`${BASE(businessPlanId)}/payroll`);
    return res.data;
  },

  async createPayrollItem(businessPlanId: string, data: Omit<PayrollItem, 'id' | 'sortOrder' | 'monthlySalary' | 'monthlyTotalCost' | 'startMonth' | 'startYear' | 'salaryIndexationRate'>): Promise<PayrollItem> {
    const res = await apiClient.post<PayrollItem>(`${BASE(businessPlanId)}/payroll`, data);
    return res.data;
  },

  async updatePayrollItem(businessPlanId: string, itemId: string, data: Partial<PayrollItem>): Promise<PayrollItem> {
    const res = await apiClient.put<PayrollItem>(`${BASE(businessPlanId)}/payroll/${itemId}`, data);
    return res.data;
  },

  async deletePayrollItem(businessPlanId: string, itemId: string): Promise<void> {
    await apiClient.delete(`${BASE(businessPlanId)}/payroll/${itemId}`);
  },

  async calculateSalary(amount: number, fromFrequency: string, toFrequency: string): Promise<SalaryCalculation> {
    const res = await apiClient.post<SalaryCalculation>(`/api/v1/business-plans/00000000-0000-0000-0000-000000000000/previsio/payroll/calculate-salary`, { amount, fromFrequency, toFrequency });
    return res.data;
  },

  // === Sales Expenses ===
  async getSalesExpenses(businessPlanId: string): Promise<SalesExpenseItem[]> {
    const res = await apiClient.get<SalesExpenseItem[]>(`${BASE(businessPlanId)}/expenses/sales`);
    return res.data;
  },

  async createSalesExpense(businessPlanId: string, data: Partial<SalesExpenseItem>): Promise<SalesExpenseItem> {
    const res = await apiClient.post<SalesExpenseItem>(`${BASE(businessPlanId)}/expenses/sales`, data);
    return res.data;
  },

  async updateSalesExpense(businessPlanId: string, itemId: string, data: Partial<SalesExpenseItem>): Promise<SalesExpenseItem> {
    const res = await apiClient.put<SalesExpenseItem>(`${BASE(businessPlanId)}/expenses/sales/${itemId}`, data);
    return res.data;
  },

  async deleteSalesExpense(businessPlanId: string, itemId: string): Promise<void> {
    await apiClient.delete(`${BASE(businessPlanId)}/expenses/sales/${itemId}`);
  },

  // === Admin Expenses ===
  async getAdminExpenses(businessPlanId: string): Promise<AdminExpenseItem[]> {
    const res = await apiClient.get<AdminExpenseItem[]>(`${BASE(businessPlanId)}/expenses/admin`);
    return res.data;
  },

  async createAdminExpense(businessPlanId: string, data: Partial<AdminExpenseItem>): Promise<AdminExpenseItem> {
    const res = await apiClient.post<AdminExpenseItem>(`${BASE(businessPlanId)}/expenses/admin`, data);
    return res.data;
  },

  async updateAdminExpense(businessPlanId: string, itemId: string, data: Partial<AdminExpenseItem>): Promise<AdminExpenseItem> {
    const res = await apiClient.put<AdminExpenseItem>(`${BASE(businessPlanId)}/expenses/admin/${itemId}`, data);
    return res.data;
  },

  async deleteAdminExpense(businessPlanId: string, itemId: string): Promise<void> {
    await apiClient.delete(`${BASE(businessPlanId)}/expenses/admin/${itemId}`);
  },

  // === CAPEX ===
  async getCapex(businessPlanId: string): Promise<CapexAsset[]> {
    const res = await apiClient.get<CapexAsset[]>(`${BASE(businessPlanId)}/capex`);
    return res.data;
  },

  async createCapexAsset(businessPlanId: string, data: Partial<CapexAsset>): Promise<CapexAsset> {
    const res = await apiClient.post<CapexAsset>(`${BASE(businessPlanId)}/capex`, data);
    return res.data;
  },

  async updateCapexAsset(businessPlanId: string, assetId: string, data: Partial<CapexAsset>): Promise<CapexAsset> {
    const res = await apiClient.put<CapexAsset>(`${BASE(businessPlanId)}/capex/${assetId}`, data);
    return res.data;
  },

  async deleteCapexAsset(businessPlanId: string, assetId: string): Promise<void> {
    await apiClient.delete(`${BASE(businessPlanId)}/capex/${assetId}`);
  },

  // === Financing ===
  async getFinancing(businessPlanId: string): Promise<FinancingModuleData> {
    const res = await apiClient.get<FinancingModuleData>(`${BASE(businessPlanId)}/financing`);
    return res.data;
  },

  async createFinancingSource(businessPlanId: string, data: Partial<FinancingSource>): Promise<FinancingSource> {
    const res = await apiClient.post<FinancingSource>(`${BASE(businessPlanId)}/financing`, data);
    return res.data;
  },

  async updateFinancingSource(businessPlanId: string, sourceId: string, data: Partial<FinancingSource>): Promise<FinancingSource> {
    const res = await apiClient.put<FinancingSource>(`${BASE(businessPlanId)}/financing/${sourceId}`, data);
    return res.data;
  },

  async deleteFinancingSource(businessPlanId: string, sourceId: string): Promise<void> {
    await apiClient.delete(`${BASE(businessPlanId)}/financing/${sourceId}`);
  },

  async getAmortizationSchedule(businessPlanId: string, sourceId: string): Promise<AmortizationEntry[]> {
    const res = await apiClient.get<AmortizationEntry[]>(`${BASE(businessPlanId)}/financing/${sourceId}/amortization`);
    return res.data;
  },

  // === Project Cost ===
  async getProjectCost(businessPlanId: string): Promise<ProjectCostData> {
    const res = await apiClient.get<ProjectCostData>(`${BASE(businessPlanId)}/project-cost`);
    return res.data;
  },

  async updateProjectCostSettings(businessPlanId: string, data: Partial<ProjectCostData>): Promise<ProjectCostData> {
    const res = await apiClient.put<ProjectCostData>(`${BASE(businessPlanId)}/project-cost`, data);
    return res.data;
  },

  // === Statements ===
  async recalculate(businessPlanId: string, language: string = 'fr'): Promise<void> {
    await apiClient.post(`${BASE(businessPlanId)}/statements/recalculate`, null, { params: { language } });
  },

  async getProfitLoss(businessPlanId: string, year: number, language: string = 'fr'): Promise<ProfitLossStatement> {
    const res = await apiClient.get<ProfitLossStatement>(`${BASE(businessPlanId)}/statements/profit-loss/${year}`, { params: { language } });
    return res.data;
  },

  async getCashFlow(businessPlanId: string, year: number, language: string = 'fr'): Promise<CashFlowStatement> {
    const res = await apiClient.get<CashFlowStatement>(`${BASE(businessPlanId)}/statements/cash-flow/${year}`, { params: { language } });
    return res.data;
  },

  async getBalanceSheet(businessPlanId: string, year: number, language: string = 'fr'): Promise<BalanceSheetStatement> {
    const res = await apiClient.get<BalanceSheetStatement>(`${BASE(businessPlanId)}/statements/balance-sheet/${year}`, { params: { language } });
    return res.data;
  },

  async getRatios(businessPlanId: string): Promise<FinancialRatios> {
    const res = await apiClient.get<FinancialRatios>(`${BASE(businessPlanId)}/statements/ratios`);
    return res.data;
  },
};
