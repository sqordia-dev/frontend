import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { businessPlanService } from '../lib/business-plan-service';
import { queryKeys } from '../lib/query-client';
import type { BusinessPlan, CreateBusinessPlanRequest } from '../lib/types';

/**
 * Hook to fetch all business plans for the current user
 */
export function useBusinessPlans() {
  return useQuery({
    queryKey: queryKeys.businessPlans.lists(),
    queryFn: () => businessPlanService.getBusinessPlans(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch business plans for a specific organization
 */
export function useOrganizationBusinessPlans(organizationId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.businessPlans.list(organizationId || ''),
    queryFn: () => businessPlanService.getBusinessPlansByOrganization(organizationId!),
    enabled: !!organizationId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to fetch a single business plan by ID
 */
export function useBusinessPlan(planId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.businessPlans.detail(planId || ''),
    queryFn: () => businessPlanService.getBusinessPlan(planId!),
    enabled: !!planId,
    staleTime: 2 * 60 * 1000, // 2 minutes for individual plans
  });
}

/**
 * Hook to fetch sections for a business plan
 */
export function useBusinessPlanSections(planId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.businessPlans.sections(planId || ''),
    queryFn: async () => {
      const response = await businessPlanService.getSections(planId!);
      return response;
    },
    enabled: !!planId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to create a new business plan
 */
export function useCreateBusinessPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBusinessPlanRequest) =>
      businessPlanService.createBusinessPlan(data),
    onSuccess: () => {
      // Invalidate and refetch business plans list
      queryClient.invalidateQueries({ queryKey: queryKeys.businessPlans.all });
    },
  });
}

/**
 * Hook to update a business plan
 */
export function useUpdateBusinessPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BusinessPlan> }) =>
      businessPlanService.updateBusinessPlan(id, data),
    onSuccess: (_, variables) => {
      // Invalidate specific plan and lists
      queryClient.invalidateQueries({
        queryKey: queryKeys.businessPlans.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.businessPlans.lists() });
    },
  });
}

/**
 * Hook to delete a business plan
 */
export function useDeleteBusinessPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => businessPlanService.deleteBusinessPlan(id),
    onSuccess: (_, id) => {
      // Remove from cache and invalidate lists
      queryClient.removeQueries({ queryKey: queryKeys.businessPlans.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.businessPlans.lists() });
    },
  });
}

/**
 * Hook to duplicate a business plan
 */
export function useDuplicateBusinessPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => businessPlanService.duplicateBusinessPlan(id),
    onSuccess: () => {
      // Invalidate lists to show new plan
      queryClient.invalidateQueries({ queryKey: queryKeys.businessPlans.lists() });
    },
  });
}
