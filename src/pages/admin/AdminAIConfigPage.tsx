import React, { useState, useEffect } from 'react';
import { Brain, CheckCircle, XCircle, Eye, EyeOff, Loader, AlertCircle } from 'lucide-react';
import {
  aiConfigService,
  AIConfiguration,
  AVAILABLE_MODELS,
  ProviderTestResponse,
} from '../../lib/ai-config-service';

export function AdminAIConfigPage() {
  const [config, setConfig] = useState<AIConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // State for showing/hiding API keys
  const [showApiKeys, setShowApiKeys] = useState<{ [key: string]: boolean }>({
    OpenAI: false,
    Claude: false,
    Gemini: false,
  });

  // State for editing API keys
  const [editedApiKeys, setEditedApiKeys] = useState<{ [key: string]: string }>({});

  // State for editing models
  const [editedModels, setEditedModels] = useState<{ [key: string]: string }>({});

  // State for testing providers
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<{ [key: string]: ProviderTestResponse }>({});

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await aiConfigService.getConfiguration();
      setConfig(data);

      // Initialize edited models with current values
      const models: { [key: string]: string } = {};
      Object.entries(data.providers).forEach(([key, info]) => {
        models[key] = info.model;
      });
      setEditedModels(models);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config) return;

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const request = {
        activeProvider: config.activeProvider,
        fallbackProviders: config.fallbackProviders,
        providers: {} as any,
      };

      // Build provider settings
      Object.keys(config.providers).forEach((providerName) => {
        request.providers[providerName] = {
          apiKey: editedApiKeys[providerName] || undefined, // Only send if changed
          model: editedModels[providerName],
        };
      });

      await aiConfigService.updateConfiguration(request);
      setSuccessMessage('AI configuration saved successfully!');

      // Reload configuration to get updated previews
      await loadConfiguration();

      // Clear edited API keys after save
      setEditedApiKeys({});
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTestProvider = async (providerName: string) => {
    if (!config) return;

    const apiKey = editedApiKeys[providerName] || '';
    const model = editedModels[providerName];

    if (!apiKey && !config.providers[providerName].isConfigured) {
      setError(`Please enter an API key for ${providerName} first`);
      return;
    }

    try {
      setTestingProvider(providerName);
      setError(null);

      const result = await aiConfigService.testProvider(providerName, {
        apiKey: apiKey || 'existing', // Use 'existing' placeholder if not changed
        model,
      });

      setTestResults({ ...testResults, [providerName]: result });
    } catch (err: any) {
      setError(`Test failed for ${providerName}: ${err.message}`);
    } finally {
      setTestingProvider(null);
    }
  };

  const toggleApiKeyVisibility = (providerName: string) => {
    setShowApiKeys({
      ...showApiKeys,
      [providerName]: !showApiKeys[providerName],
    });
  };

  const handleApiKeyChange = (providerName: string, value: string) => {
    setEditedApiKeys({
      ...editedApiKeys,
      [providerName]: value,
    });
  };

  const handleModelChange = (providerName: string, value: string) => {
    setEditedModels({
      ...editedModels,
      [providerName]: value,
    });
  };

  const handleActiveProviderChange = (providerName: string) => {
    if (config) {
      setConfig({
        ...config,
        activeProvider: providerName,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600">Failed to load configuration</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">AI Provider Configuration</h1>
        </div>
        <p className="text-gray-600">
          Configure AI models for business plan generation. You can switch between OpenAI, Claude, and
          Gemini, with automatic fallback support.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}

      {/* Active Provider Selection */}
      <div className="mb-8 p-6 bg-white border rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Active Provider</h2>
        <div className="grid grid-cols-3 gap-4">
          {Object.keys(config.providers).map((providerName) => {
            const provider = config.providers[providerName];
            const isActive = config.activeProvider === providerName;

            return (
              <button
                key={providerName}
                onClick={() => handleActiveProviderChange(providerName)}
                className={`p-4 border-2 rounded-lg transition-all ${
                  isActive
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                } ${!provider.isConfigured && !editedApiKeys[providerName] ? 'opacity-50' : ''}`}
                disabled={!provider.isConfigured && !editedApiKeys[providerName]}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold">{providerName}</span>
                  {isActive && <CheckCircle className="w-5 h-5 text-primary" />}
                </div>
                <p className="text-sm text-gray-500">
                  {provider.isConfigured ? 'Configured' : 'Not configured'}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Provider Configuration Cards */}
      {Object.entries(config.providers).map(([providerName, provider]) => (
        <div key={providerName} className="mb-6 p-6 bg-white border rounded-lg shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">{providerName} Configuration</h2>
            {config.activeProvider === providerName && (
              <span className="px-3 py-1 bg-primary text-white text-sm rounded-full">Active</span>
            )}
          </div>

          {/* API Key */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showApiKeys[providerName] ? 'text' : 'password'}
                  value={editedApiKeys[providerName] || ''}
                  onChange={(e) => handleApiKeyChange(providerName, e.target.value)}
                  placeholder={provider.apiKeyPreview}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => toggleApiKeyVisibility(providerName)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showApiKeys[providerName] ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              <button
                onClick={() => handleTestProvider(providerName)}
                disabled={testingProvider === providerName}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {testingProvider === providerName ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  'Test'
                )}
              </button>
            </div>
            {testResults[providerName] && (
              <div
                className={`mt-2 p-3 rounded-lg flex items-center gap-2 ${
                  testResults[providerName].success
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {testResults[providerName].success ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {testResults[providerName].message} ({testResults[providerName].responseTimeMs}ms)
                </span>
              </div>
            )}
          </div>

          {/* Model Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
            <select
              value={editedModels[providerName]}
              onChange={(e) => handleModelChange(providerName, e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              {AVAILABLE_MODELS[providerName]?.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {provider.isConfigured ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Configured and ready</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-yellow-500" />
                <span>API key required</span>
              </>
            )}
          </div>
        </div>
      ))}

      {/* Save Button */}
      <div className="flex justify-end gap-4">
        <button
          onClick={loadConfiguration}
          className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {saving ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            'Save Configuration'
          )}
        </button>
      </div>
    </div>
  );
}
