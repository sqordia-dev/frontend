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

export const AVAILABLE_MODELS: { [key: string]: string[] } = {
  OpenAI: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
  Claude: [
    'claude-sonnet-4-20250514',
    'claude-3-5-sonnet-20241022',
    'claude-3-5-haiku-20241022',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307',
  ],
  Gemini: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'],
};

export const aiConfigService = {
  /**
   * Get current AI provider configuration
   */
  async getConfiguration(): Promise<AIConfiguration> {
    const response = await apiClient.get('/api/v1/admin/ai-config');
    return response.data;
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
    const response = await apiClient.post(
      `/api/v1/admin/ai-config/test/${provider}`,
      request
    );
    return response.data;
  },

  /**
   * Get available models for a provider
   */
  async getAvailableModels(provider: string): Promise<string[]> {
    const response = await apiClient.get(`/api/v1/admin/ai-config/models/${provider}`);
    return response.data;
  },
};
