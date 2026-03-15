import { apiClient } from './api-client';

export interface AIConfiguration {
  activeProvider: string;
  fallbackProviders: string[];
  providers: {
    [key: string]: ProviderInfo;
  };
}

export interface ProviderInfo {
  isConfigured: boolean;
  model: string;
  apiKeyPreview: string;
  lastTested?: Date;
  lastTestSuccess?: boolean;
  source?: string; // 'Database' or 'Environment'
}

export interface AIConfigurationRequest {
  activeProvider: string;
  fallbackProviders: string[];
  providers: {
    [key: string]: ProviderSettingsRequest;
  };
}

export interface ProviderSettingsRequest {
  apiKey?: string; // null or undefined = don't update
  model: string;
}

export interface ProviderTestRequest {
  apiKey: string;
  model: string;
}

export interface ProviderTestResponse {
  success: boolean;
  message: string;
  responseTimeMs: number;
  modelUsed: string;
  errorDetails?: string;
}

export interface SectionOverride {
  provider: string;
  model?: string;
}

export const AVAILABLE_MODELS: { [key: string]: string[] } = {
  OpenAI: ['gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano', 'o3', 'o4-mini'],
  Claude: ['claude-sonnet-4-6', 'claude-opus-4-6', 'claude-haiku-4-5-20251001'],
  Gemini: ['gemini-2.5-flash', 'gemini-2.5-pro'],
};

export const aiConfigService = {
  /**
   * Get current AI provider configuration
   */
  async getConfiguration(): Promise<AIConfiguration> {
    const response = await apiClient.get<AIConfiguration>('/api/v1/admin/ai-config');
    return response.data as AIConfiguration;
  },

  /**
   * Update AI provider configuration
   */
  async updateConfiguration(config: AIConfigurationRequest): Promise<void> {
    await apiClient.post('/api/v1/admin/ai-config', config);
  },

  /**
   * Test connection to an AI provider
   */
  async testProvider(
    provider: string,
    request: ProviderTestRequest
  ): Promise<ProviderTestResponse> {
    const response = await apiClient.post<ProviderTestResponse>(
      `/api/v1/admin/ai-config/test/${provider}`,
      request
    );
    return response.data as ProviderTestResponse;
  },

  /**
   * Get available models for a provider
   */
  async getAvailableModels(provider: string): Promise<string[]> {
    const response = await apiClient.get<string[]>(`/api/v1/admin/ai-config/models/${provider}`);
    return response.data as string[];
  },

  /**
   * Get section-specific AI provider overrides
   */
  async getSectionOverrides(): Promise<Record<string, SectionOverride>> {
    const response = await apiClient.get<Record<string, SectionOverride>>('/api/v1/admin/ai-config/section-overrides');
    return response.data as Record<string, SectionOverride>;
  },

  /**
   * Update section-specific AI provider overrides
   */
  async updateSectionOverrides(overrides: Record<string, SectionOverride>): Promise<void> {
    await apiClient.post('/api/v1/admin/ai-config/section-overrides', overrides);
  },
};
