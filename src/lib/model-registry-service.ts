import { apiClient } from './api-client';

// ── Types ───────────────────────────────────────────────

export interface ModelRegistryConfig {
  activeProvider: string;
  fallbackOrder: string[];
  providerModels: Record<string, string>;
  sectionOverrides: Record<string, SectionModelOverride>;
  knownModels: Record<string, KnownModel[]>;
}

export interface SectionModelOverride {
  provider: string;
  model: string;
  temperature?: number;
}

export interface KnownModel {
  id: string;
  name: string;
  provider: string;
  maxTokens?: number;
  supportsToolUse?: boolean;
  costPer1kInput?: number;
  costPer1kOutput?: number;
}

export interface SetProviderModelRequest {
  model: string;
}

export interface SetFallbacksRequest {
  fallbackOrder: string[];
}

export interface SetSectionOverrideRequest {
  provider: string;
  model: string;
  temperature?: number;
}

// ── Helpers ─────────────────────────────────────────────

function extractValue<T>(data: any): T {
  if (data && typeof data === 'object' && 'isSuccess' in data) {
    if (data.isSuccess && data.value !== undefined) return data.value as T;
    if (!data.isSuccess) throw new Error(data.error?.message || 'Operation failed');
  }
  return data as T;
}

// ── Service ─────────────────────────────────────────────

const BASE = '/api/v1/ai/models';

export const modelRegistryService = {
  /** Get full model registry configuration */
  async getConfig(): Promise<ModelRegistryConfig> {
    const response = await apiClient.get(`${BASE}/config`);
    return extractValue<ModelRegistryConfig>(response.data);
  },

  /** Set active AI provider */
  async setActiveProvider(provider: string): Promise<void> {
    await apiClient.put(`${BASE}/active-provider`, { provider });
  },

  /** Set model for a specific provider */
  async setProviderModel(provider: string, model: string): Promise<void> {
    await apiClient.put(`${BASE}/${provider}`, { model });
  },

  /** Set fallback provider order */
  async setFallbacks(fallbackOrder: string[]): Promise<void> {
    await apiClient.put(`${BASE}/fallbacks`, { fallbackOrder });
  },

  /** Set section-specific model override */
  async setSectionOverride(sectionType: string, override: SetSectionOverrideRequest): Promise<void> {
    await apiClient.put(`${BASE}/section-overrides/${sectionType}`, override);
  },

  /** Remove section override */
  async removeSectionOverride(sectionType: string): Promise<void> {
    await apiClient.delete(`${BASE}/section-overrides/${sectionType}`);
  },

  /** Get available models for a provider */
  async getAvailableModels(provider: string): Promise<KnownModel[]> {
    const response = await apiClient.get(`${BASE}/${provider}/available`);
    return extractValue<KnownModel[]>(response.data);
  },

  /** Force refresh model registry cache */
  async refreshCache(): Promise<void> {
    await apiClient.post(`${BASE}/refresh`);
  },
};
