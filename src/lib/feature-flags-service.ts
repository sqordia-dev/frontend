import { apiClient } from './api-client';

// Enums matching backend
export enum FeatureFlagType {
  Temporary = 0,
  Permanent = 1
}

export enum FeatureFlagState {
  Active = 0,
  PotentiallyStale = 1,
  Stale = 2,
  Archived = 3
}

// Response interfaces
export interface FeatureFlag {
  name: string;
  key: string;
  isEnabled: boolean;
  description?: string;
  category: string;
  tags: string[];
  type: FeatureFlagType;
  state: FeatureFlagState;
  created: string;
  createdBy?: string;
  lastModified?: string;
  lastModifiedBy?: string;
  expiresAt?: string;
}

export interface FeatureFlagListResponse {
  flags: FeatureFlag[];
  totalCount: number;
  enabledCount: number;
  disabledCount: number;
  staleCount: number;
}

// Request interfaces
export interface CreateFeatureFlagRequest {
  name: string;
  description?: string;
  category: string;
  tags: string[];
  type: FeatureFlagType;
  expiresAt?: string;
  isEnabled: boolean;
}

export interface UpdateFeatureFlagRequest {
  description?: string;
  category?: string;
  tags?: string[];
  type?: FeatureFlagType;
  state?: FeatureFlagState;
  expiresAt?: string;
}

export interface ToggleFeatureFlagRequest {
  isEnabled: boolean;
}

// Predefined feature flag categories
export const FEATURE_FLAG_CATEGORIES = {
  AI: {
    label: 'AI Features',
    icon: 'Sparkles',
    flags: [
      { name: 'AIGenerationEnabled', description: 'Enable AI-powered content generation' },
      { name: 'UseClaudeAsDefault', description: 'Use Claude as the default AI provider' },
      { name: 'UseGeminiAsDefault', description: 'Use Gemini as the default AI provider' },
      { name: 'EnableAIFallbackMode', description: 'Enable fallback to alternative AI providers' }
    ]
  },
  Export: {
    label: 'Export Features',
    icon: 'FileOutput',
    flags: [
      { name: 'ExportToPDF', description: 'Enable PDF export functionality' },
      { name: 'ExportToWord', description: 'Enable Word document export' },
      { name: 'ExportToExcel', description: 'Enable Excel spreadsheet export' }
    ]
  },
  Premium: {
    label: 'Premium Features',
    icon: 'Crown',
    flags: [
      { name: 'AdvancedAnalytics', description: 'Enable advanced analytics dashboard' },
      { name: 'CollaborativeEditing', description: 'Enable real-time collaborative editing' },
      { name: 'MultipleBusinessPlans', description: 'Allow multiple business plans per user' },
      { name: 'UnlimitedRevisions', description: 'Enable unlimited document revisions' }
    ]
  }
} as const;

// Helper to get type label
export function getFeatureFlagTypeLabel(type: FeatureFlagType): string {
  switch (type) {
    case FeatureFlagType.Temporary:
      return 'Temporary';
    case FeatureFlagType.Permanent:
      return 'Permanent';
    default:
      return 'Unknown';
  }
}

// Helper to get state label and color
export function getFeatureFlagStateInfo(state: FeatureFlagState): { label: string; color: string; bgColor: string } {
  switch (state) {
    case FeatureFlagState.Active:
      return { label: 'Active', color: 'text-green-700', bgColor: 'bg-green-100' };
    case FeatureFlagState.PotentiallyStale:
      return { label: 'Potentially Stale', color: 'text-yellow-700', bgColor: 'bg-yellow-100' };
    case FeatureFlagState.Stale:
      return { label: 'Stale', color: 'text-orange-700', bgColor: 'bg-orange-100' };
    case FeatureFlagState.Archived:
      return { label: 'Archived', color: 'text-gray-700', bgColor: 'bg-gray-100' };
    default:
      return { label: 'Unknown', color: 'text-gray-700', bgColor: 'bg-gray-100' };
  }
}

// Helper to extract value from Result wrapper
function extractValue<T>(data: any): T {
  if (data && typeof data === 'object' && 'isSuccess' in data) {
    if (data.isSuccess && data.value !== undefined) {
      return data.value as T;
    }
    if (!data.isSuccess) {
      throw new Error(data.error?.message || 'Operation failed');
    }
  }
  return data as T;
}

export const featureFlagsService = {
  /**
   * Get all feature flags (simple format - just name and enabled state)
   */
  async getAllFlags(): Promise<Record<string, boolean>> {
    const response = await apiClient.get<Record<string, boolean> | { isSuccess: boolean; value: Record<string, boolean> }>('/api/v1/settings/features');
    return extractValue<Record<string, boolean>>(response.data);
  },

  /**
   * Check if a specific feature is enabled
   */
  async isEnabled(featureName: string): Promise<boolean> {
    try {
      const response = await apiClient.get<boolean | { isSuccess: boolean; value: boolean }>(`/api/v1/settings/features/${encodeURIComponent(featureName)}`);
      return extractValue<boolean>(response.data);
    } catch (error) {
      console.error(`Failed to check feature flag '${featureName}':`, error);
      return false; // Default to disabled on error
    }
  },

  /**
   * Get all feature flags with detailed metadata (admin only)
   */
  async getAllFlagsDetailed(): Promise<FeatureFlagListResponse> {
    const response = await apiClient.get<FeatureFlagListResponse | { isSuccess: boolean; value: FeatureFlagListResponse }>('/api/v1/settings/features/detailed');
    return extractValue<FeatureFlagListResponse>(response.data);
  },

  /**
   * Get a specific feature flag with detailed metadata (admin only)
   */
  async getFlagDetailed(featureName: string): Promise<FeatureFlag> {
    const response = await apiClient.get<FeatureFlag | { isSuccess: boolean; value: FeatureFlag }>(`/api/v1/settings/features/${encodeURIComponent(featureName)}/detailed`);
    return extractValue<FeatureFlag>(response.data);
  },

  /**
   * Create a new feature flag (admin only)
   */
  async createFlag(request: CreateFeatureFlagRequest): Promise<FeatureFlag> {
    const response = await apiClient.post<FeatureFlag | { isSuccess: boolean; value: FeatureFlag }>('/api/v1/settings/features', request);
    return extractValue<FeatureFlag>(response.data);
  },

  /**
   * Update a feature flag's metadata (admin only)
   */
  async updateFlag(featureName: string, request: UpdateFeatureFlagRequest): Promise<FeatureFlag> {
    const response = await apiClient.patch<FeatureFlag | { isSuccess: boolean; value: FeatureFlag }>(`/api/v1/settings/features/${encodeURIComponent(featureName)}`, request);
    return extractValue<FeatureFlag>(response.data);
  },

  /**
   * Toggle a feature flag's enabled state (admin only)
   */
  async toggleFlag(featureName: string, isEnabled: boolean): Promise<FeatureFlag> {
    const response = await apiClient.post<FeatureFlag | { isSuccess: boolean; value: FeatureFlag }>(`/api/v1/settings/features/${encodeURIComponent(featureName)}/toggle`, { isEnabled });
    return extractValue<FeatureFlag>(response.data);
  },

  /**
   * Enable a feature flag (admin only)
   */
  async enableFlag(featureName: string): Promise<void> {
    const response = await apiClient.post<{ isSuccess: boolean; error?: { message: string } }>(`/api/v1/settings/features/${encodeURIComponent(featureName)}/enable`);
    if (response.data && 'isSuccess' in response.data && !response.data.isSuccess) {
      throw new Error(response.data.error?.message || 'Failed to enable feature');
    }
  },

  /**
   * Disable a feature flag (admin only)
   */
  async disableFlag(featureName: string): Promise<void> {
    const response = await apiClient.post<{ isSuccess: boolean; error?: { message: string } }>(`/api/v1/settings/features/${encodeURIComponent(featureName)}/disable`);
    if (response.data && 'isSuccess' in response.data && !response.data.isSuccess) {
      throw new Error(response.data.error?.message || 'Failed to disable feature');
    }
  },

  /**
   * Mark a feature flag as stale (admin only)
   */
  async markAsStale(featureName: string): Promise<void> {
    const response = await apiClient.post<{ isSuccess: boolean; error?: { message: string } }>(`/api/v1/settings/features/${encodeURIComponent(featureName)}/stale`);
    if (response.data && 'isSuccess' in response.data && !response.data.isSuccess) {
      throw new Error(response.data.error?.message || 'Failed to mark feature as stale');
    }
  },

  /**
   * Archive a feature flag (admin only)
   */
  async archiveFlag(featureName: string): Promise<void> {
    const response = await apiClient.delete<{ isSuccess: boolean; error?: { message: string } }>(`/api/v1/settings/features/${encodeURIComponent(featureName)}/archive`);
    if (response.data && 'isSuccess' in response.data && !response.data.isSuccess) {
      throw new Error(response.data.error?.message || 'Failed to archive feature');
    }
  },

  /**
   * Initialize predefined feature flags if they don't exist
   */
  async initializePredefinedFlags(): Promise<void> {
    const existingFlags = await this.getAllFlags();

    for (const [category, categoryData] of Object.entries(FEATURE_FLAG_CATEGORIES)) {
      for (const flagDef of categoryData.flags) {
        if (!(flagDef.name in existingFlags)) {
          try {
            await this.createFlag({
              name: flagDef.name,
              description: flagDef.description,
              category: category,
              tags: [category.toLowerCase()],
              type: FeatureFlagType.Permanent,
              isEnabled: false
            });
          } catch (error) {
            // Flag might already exist, ignore 409 conflicts
            console.warn(`Could not create flag '${flagDef.name}':`, error);
          }
        }
      }
    }
  }
};
