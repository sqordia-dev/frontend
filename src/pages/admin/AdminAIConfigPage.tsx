import { useState, useEffect } from 'react';
import { Brain, CheckCircle, XCircle, Eye, EyeOff, Loader, AlertCircle, Database, Server, Clock } from 'lucide-react';
import {
  aiConfigService,
  AIConfiguration,
  AVAILABLE_MODELS,
  ProviderTestResponse,
} from '../../lib/ai-config-service';
import { getUserFriendlyError } from '../../utils/error-messages';

// OpenAI is the only active provider - others are coming soon
const COMING_SOON_PROVIDERS = ['Claude', 'Gemini'];

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
      setError(getUserFriendlyError(err, 'load'));
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
      setError(getUserFriendlyError(err, 'save'));
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
      setError(getUserFriendlyError(err, 'load'));
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="w-8 h-8 animate-spin text-[#FF6B00]" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Failed to load configuration</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="w-8 h-8 text-[#FF6B00]" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI Provider Configuration</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Configure AI models for business plan generation. Currently using OpenAI as the primary provider.
          Support for Claude and Gemini is coming soon.
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
          <p className="text-green-700 dark:text-green-400">{successMessage}</p>
        </div>
      )}

      {/* Active Provider Selection */}
      <div className="mb-8 p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Active Provider</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Object.keys(config.providers).map((providerName) => {
            const provider = config.providers[providerName];
            const isComingSoon = COMING_SOON_PROVIDERS.includes(providerName);
            const isActive = providerName === 'OpenAI'; // OpenAI is always active

            return (
              <div
                key={providerName}
                className={`relative p-4 border-2 rounded-lg transition-all text-left ${
                  isActive
                    ? 'border-[#FF6B00] bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10'
                    : 'border-gray-200 dark:border-gray-700'
                } ${isComingSoon ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {/* Coming Soon Badge */}
                {isComingSoon && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="inline-flex items-center gap-1 bg-slate-900 text-white px-2 py-1 rounded-full text-xs font-medium">
                      <Clock className="w-3 h-3" />
                      Soon
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mb-2">
                  <span className={`font-semibold ${isComingSoon ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-white'}`}>
                    {providerName}
                  </span>
                  {isActive && <CheckCircle className="w-5 h-5 text-[#FF6B00]" />}
                </div>
                <p className={`text-sm ${isComingSoon ? 'text-gray-400 dark:text-gray-600' : 'text-gray-500 dark:text-gray-400'}`}>
                  {isComingSoon ? 'Coming soon' : provider.isConfigured ? 'Configured' : 'Not configured'}
                </p>
                {!isComingSoon && provider.source && (
                  <div className="flex items-center gap-1 mt-2 text-xs text-gray-400 dark:text-gray-500">
                    {provider.source === 'Database' ? (
                      <Database className="w-3 h-3" />
                    ) : (
                      <Server className="w-3 h-3" />
                    )}
                    <span>{provider.source}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Fallback Providers - Hidden until other providers are available */}
      {/*
      <div className="mb-8 p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Fallback Providers</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Additional providers will be available as fallbacks once Claude and Gemini support is added.
        </p>
      </div>
      */}

      {/* Provider Configuration Cards */}
      {Object.entries(config.providers).map(([providerName, provider]) => {
        const isComingSoon = COMING_SOON_PROVIDERS.includes(providerName);

        // Coming Soon providers get a simplified card
        if (isComingSoon) {
          return (
            <div key={providerName} className="mb-6 p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm opacity-60">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-semibold text-gray-400 dark:text-gray-500">{providerName} Configuration</h2>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-full text-xs font-medium">
                  <Clock className="w-3 h-3" />
                  Coming Soon
                </div>
              </div>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {providerName} integration is coming soon. Stay tuned for updates.
              </p>
            </div>
          );
        }

        // OpenAI gets the full configuration card
        return (
          <div key={providerName} className="mb-6 p-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{providerName} Configuration</h2>
                {provider.source && (
                  <span className={`px-2 py-1 text-xs rounded-full flex items-center gap-1 ${
                    provider.source === 'Database'
                      ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                  }`}>
                    {provider.source === 'Database' ? (
                      <Database className="w-3 h-3" />
                    ) : (
                      <Server className="w-3 h-3" />
                    )}
                    {provider.source}
                  </span>
                )}
              </div>
              <span className="px-3 py-1 bg-[#FF6B00] text-white text-sm rounded-full">Active</span>
            </div>

            {/* API Key */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">API Key</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showApiKeys[providerName] ? 'text' : 'password'}
                    value={editedApiKeys[providerName] || ''}
                    onChange={(e) => handleApiKeyChange(providerName, e.target.value)}
                    placeholder={provider.apiKeyPreview}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => toggleApiKeyVisibility(providerName)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
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
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
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
                  className={`mt-2 p-3 rounded-lg flex items-start gap-2 ${
                    testResults[providerName].success
                      ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                      : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                  }`}
                >
                  {testResults[providerName].success ? (
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="text-sm">
                    <p>{testResults[providerName].message} ({testResults[providerName].responseTimeMs}ms)</p>
                    {testResults[providerName].errorDetails && (
                      <p className="mt-1 text-xs opacity-75">{testResults[providerName].errorDetails}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Model Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Model</label>
              <select
                value={editedModels[providerName]}
                onChange={(e) => handleModelChange(providerName, e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
              >
                {AVAILABLE_MODELS[providerName]?.map((model) => (
                  <option key={model} value={model}>
                    {model}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
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
        );
      })}

      {/* Save Button */}
      <div className="flex justify-end gap-4 mt-8">
        <button
          onClick={loadConfiguration}
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-[#FF6B00] text-white rounded-lg hover:bg-[#FF6B00]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
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
