import { QueryClient } from '@tanstack/react-query';

/**
 * React Query client configuration for data fetching and caching
 * Provides automatic caching, background refetching, and deduplication
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Cache data for 10 minutes after it becomes unused
      gcTime: 10 * 60 * 1000,
      // Only retry once on failure
      retry: 1,
      // Don't refetch on window focus to reduce API calls
      refetchOnWindowFocus: false,
      // Don't refetch on reconnect by default
      refetchOnReconnect: false,
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
    },
  },
});

/**
 * Query key factory for consistent cache key management
 */
export const queryKeys = {
  // Business Plans
  businessPlans: {
    all: ['business-plans'] as const,
    lists: () => [...queryKeys.businessPlans.all, 'list'] as const,
    list: (organizationId: string) => [...queryKeys.businessPlans.lists(), organizationId] as const,
    details: () => [...queryKeys.businessPlans.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.businessPlans.details(), id] as const,
    sections: (planId: string) => [...queryKeys.businessPlans.detail(planId), 'sections'] as const,
  },

  // Organizations
  organizations: {
    all: ['organizations'] as const,
    lists: () => [...queryKeys.organizations.all, 'list'] as const,
    details: () => [...queryKeys.organizations.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.organizations.details(), id] as const,
    members: (id: string) => [...queryKeys.organizations.detail(id), 'members'] as const,
  },

  // User
  user: {
    all: ['user'] as const,
    current: () => [...queryKeys.user.all, 'current'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
  },

  // Templates
  templates: {
    all: ['templates'] as const,
    list: () => [...queryKeys.templates.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.templates.all, id] as const,
  },

  // Questionnaire
  questionnaire: {
    all: ['questionnaire'] as const,
    questions: (planId: string) => [...queryKeys.questionnaire.all, planId, 'questions'] as const,
    responses: (planId: string) => [...queryKeys.questionnaire.all, planId, 'responses'] as const,
  },
} as const;
