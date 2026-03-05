import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/query-client';
import { previsioService } from '../lib/previsio-service';
import type { MonthlyValue, FinancialPlanSettings } from '../types/financial-projections';

// === Financial Plan ===

export function useFinancialPlan(businessPlanId: string) {
  return useQuery({
    queryKey: queryKeys.previsio.plan(businessPlanId),
    queryFn: () => previsioService.getPlan(businessPlanId),
    enabled: !!businessPlanId,
  });
}

export function useCreateFinancialPlan(businessPlanId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ startYear, projectionYears }: { startYear: number; projectionYears?: number }) =>
      previsioService.createPlan(businessPlanId, startYear, projectionYears),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.previsio.plan(businessPlanId) });
    },
  });
}

export function useUpdatePlanSettings(businessPlanId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (settings: FinancialPlanSettings) => previsioService.updateSettings(businessPlanId, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.previsio.plan(businessPlanId) });
    },
  });
}

// === Sales ===

export function useSalesModule(businessPlanId: string) {
  return useQuery({
    queryKey: queryKeys.previsio.sales(businessPlanId),
    queryFn: () => previsioService.getSales(businessPlanId),
    enabled: !!businessPlanId,
  });
}

export function useCreateProduct(businessPlanId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof previsioService.createProduct>[1]) =>
      previsioService.createProduct(businessPlanId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.previsio.sales(businessPlanId) });
    },
  });
}

export function useUpdateProduct(businessPlanId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, data }: { productId: string; data: Parameters<typeof previsioService.updateProduct>[2] }) =>
      previsioService.updateProduct(businessPlanId, productId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.previsio.sales(businessPlanId) });
    },
  });
}

export function useDeleteProduct(businessPlanId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => previsioService.deleteProduct(businessPlanId, productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.previsio.sales(businessPlanId) });
    },
  });
}

export function useUpdateVolumeGrid(businessPlanId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ productId, year, values }: { productId: string; year: number; values: MonthlyValue[] }) =>
      previsioService.updateVolumeGrid(businessPlanId, productId, year, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.previsio.sales(businessPlanId) });
    },
  });
}

export function useReplicateYear(businessPlanId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sourceYear, targetYear, rate, productIds }: { sourceYear: number; targetYear: number; rate: number; productIds?: string[] }) =>
      previsioService.replicateYear(businessPlanId, sourceYear, targetYear, rate, productIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.previsio.sales(businessPlanId) });
    },
  });
}

// === COGS ===

export function useCOGSModule(businessPlanId: string) {
  return useQuery({
    queryKey: queryKeys.previsio.cogs(businessPlanId),
    queryFn: () => previsioService.getCOGS(businessPlanId),
    enabled: !!businessPlanId,
  });
}

export function useCreateCOGS(businessPlanId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof previsioService.createCOGS>[1]) =>
      previsioService.createCOGS(businessPlanId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.previsio.cogs(businessPlanId) });
    },
  });
}

export function useUpdateCOGS(businessPlanId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: Parameters<typeof previsioService.updateCOGS>[2] }) =>
      previsioService.updateCOGS(businessPlanId, itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.previsio.cogs(businessPlanId) });
    },
  });
}

export function useDeleteCOGS(businessPlanId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => previsioService.deleteCOGS(businessPlanId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.previsio.cogs(businessPlanId) });
    },
  });
}

// === Payroll ===

export function usePayrollModule(businessPlanId: string) {
  return useQuery({
    queryKey: queryKeys.previsio.payroll(businessPlanId),
    queryFn: () => previsioService.getPayroll(businessPlanId),
    enabled: !!businessPlanId,
  });
}

export function useCreatePayroll(businessPlanId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof previsioService.createPayrollItem>[1]) =>
      previsioService.createPayrollItem(businessPlanId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.previsio.payroll(businessPlanId) });
    },
  });
}

export function useUpdatePayroll(businessPlanId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: Parameters<typeof previsioService.updatePayrollItem>[2] }) =>
      previsioService.updatePayrollItem(businessPlanId, itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.previsio.payroll(businessPlanId) });
    },
  });
}

export function useDeletePayroll(businessPlanId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => previsioService.deletePayrollItem(businessPlanId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.previsio.payroll(businessPlanId) });
    },
  });
}

// === Expenses ===

export function useSalesExpenses(businessPlanId: string) {
  return useQuery({
    queryKey: queryKeys.previsio.salesExpenses(businessPlanId),
    queryFn: () => previsioService.getSalesExpenses(businessPlanId),
    enabled: !!businessPlanId,
  });
}

export function useCreateSalesExpense(businessPlanId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof previsioService.createSalesExpense>[1]) =>
      previsioService.createSalesExpense(businessPlanId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.previsio.salesExpenses(businessPlanId) });
    },
  });
}

export function useUpdateSalesExpense(businessPlanId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: Parameters<typeof previsioService.updateSalesExpense>[2] }) =>
      previsioService.updateSalesExpense(businessPlanId, itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.previsio.salesExpenses(businessPlanId) });
    },
  });
}

export function useDeleteSalesExpense(businessPlanId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => previsioService.deleteSalesExpense(businessPlanId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.previsio.salesExpenses(businessPlanId) });
    },
  });
}

export function useAdminExpenses(businessPlanId: string) {
  return useQuery({
    queryKey: queryKeys.previsio.adminExpenses(businessPlanId),
    queryFn: () => previsioService.getAdminExpenses(businessPlanId),
    enabled: !!businessPlanId,
  });
}

export function useCreateAdminExpense(businessPlanId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof previsioService.createAdminExpense>[1]) =>
      previsioService.createAdminExpense(businessPlanId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.previsio.adminExpenses(businessPlanId) });
    },
  });
}

export function useUpdateAdminExpense(businessPlanId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, data }: { itemId: string; data: Parameters<typeof previsioService.updateAdminExpense>[2] }) =>
      previsioService.updateAdminExpense(businessPlanId, itemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.previsio.adminExpenses(businessPlanId) });
    },
  });
}

export function useDeleteAdminExpense(businessPlanId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => previsioService.deleteAdminExpense(businessPlanId, itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.previsio.adminExpenses(businessPlanId) });
    },
  });
}

// === CAPEX ===

export function useCapexAssets(businessPlanId: string) {
  return useQuery({
    queryKey: queryKeys.previsio.capex(businessPlanId),
    queryFn: () => previsioService.getCapex(businessPlanId),
    enabled: !!businessPlanId,
  });
}

export function useCreateCapex(businessPlanId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof previsioService.createCapexAsset>[1]) =>
      previsioService.createCapexAsset(businessPlanId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.previsio.capex(businessPlanId) });
    },
  });
}

export function useUpdateCapex(businessPlanId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ assetId, data }: { assetId: string; data: Parameters<typeof previsioService.updateCapexAsset>[2] }) =>
      previsioService.updateCapexAsset(businessPlanId, assetId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.previsio.capex(businessPlanId) });
    },
  });
}

export function useDeleteCapex(businessPlanId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (assetId: string) => previsioService.deleteCapexAsset(businessPlanId, assetId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.previsio.capex(businessPlanId) });
    },
  });
}

// === Financing ===

export function useFinancingModule(businessPlanId: string) {
  return useQuery({
    queryKey: queryKeys.previsio.financing(businessPlanId),
    queryFn: () => previsioService.getFinancing(businessPlanId),
    enabled: !!businessPlanId,
  });
}

export function useCreateFinancing(businessPlanId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Parameters<typeof previsioService.createFinancingSource>[1]) =>
      previsioService.createFinancingSource(businessPlanId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.previsio.financing(businessPlanId) });
    },
  });
}

export function useUpdateFinancing(businessPlanId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ sourceId, data }: { sourceId: string; data: Parameters<typeof previsioService.updateFinancingSource>[2] }) =>
      previsioService.updateFinancingSource(businessPlanId, sourceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.previsio.financing(businessPlanId) });
    },
  });
}

export function useDeleteFinancing(businessPlanId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sourceId: string) => previsioService.deleteFinancingSource(businessPlanId, sourceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.previsio.financing(businessPlanId) });
    },
  });
}

export function useAmortizationSchedule(businessPlanId: string, sourceId: string) {
  return useQuery({
    queryKey: [...queryKeys.previsio.financing(businessPlanId), sourceId, 'amortization'],
    queryFn: () => previsioService.getAmortizationSchedule(businessPlanId, sourceId),
    enabled: !!businessPlanId && !!sourceId,
  });
}

// === Project Cost ===

export function useProjectCost(businessPlanId: string) {
  return useQuery({
    queryKey: queryKeys.previsio.projectCost(businessPlanId),
    queryFn: () => previsioService.getProjectCost(businessPlanId),
    enabled: !!businessPlanId,
  });
}

// === Ratios ===

export function useFinancialRatios(businessPlanId: string) {
  return useQuery({
    queryKey: queryKeys.previsio.ratios(businessPlanId),
    queryFn: () => previsioService.getRatios(businessPlanId),
    enabled: !!businessPlanId,
  });
}
