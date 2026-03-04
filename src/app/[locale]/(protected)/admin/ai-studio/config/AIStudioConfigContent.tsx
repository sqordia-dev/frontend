'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Database,
  Server,
  Zap,
  Settings2,
  Layers,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  Save,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';
import {
  aiConfigService,
  AIConfiguration,
  AVAILABLE_MODELS,
  ProviderTestResponse,
  SectionOverride,
} from '@/lib/ai-config-service';
import { cn } from '@/lib/utils';

// Section types for override configuration
const SECTION_GROUPS = {
  'Business Plan': [
    { key: 'ExecutiveSummary', label: { en: 'Executive Summary', fr: 'Resume executif' } },
    { key: 'CompanyOverview', label: { en: 'Company Overview', fr: "Vue d'ensemble" } },
    { key: 'MarketAnalysis', label: { en: 'Market Analysis', fr: 'Analyse de marche' } },
    { key: 'ProductsServices', label: { en: 'Products & Services', fr: 'Produits et services' } },
    { key: 'MarketingStrategy', label: { en: 'Marketing Strategy', fr: 'Strategie marketing' } },
    { key: 'OperationsPlan', label: { en: 'Operations Plan', fr: "Plan d'operations" } },
    { key: 'ManagementTeam', label: { en: 'Management Team', fr: 'Equipe de direction' } },
    { key: 'FinancialProjections', label: { en: 'Financial Projections', fr: 'Projections financieres' } },
    { key: 'FundingRequest', label: { en: 'Funding Request', fr: 'Demande de financement' } },
    { key: 'SWOTAnalysis', label: { en: 'SWOT Analysis', fr: 'Analyse SWOT' } },
    { key: 'RiskAssessment', label: { en: 'Risk Assessment', fr: 'Evaluation des risques' } },
  ],
  'Lean Canvas': [
    { key: 'Problem', label: { en: 'Problem', fr: 'Probleme' } },
    { key: 'Solution', label: { en: 'Solution', fr: 'Solution' } },
    { key: 'UniqueValueProposition', label: { en: 'Unique Value Proposition', fr: 'Proposition de valeur' } },
    { key: 'Channels', label: { en: 'Channels', fr: 'Canaux' } },
    { key: 'CustomerSegments', label: { en: 'Customer Segments', fr: 'Segments clients' } },
    { key: 'CostStructure', label: { en: 'Cost Structure', fr: 'Structure des couts' } },
    { key: 'RevenueStreams', label: { en: 'Revenue Streams', fr: 'Sources de revenus' } },
  ],
  'OBNL (Non-profit)': [
    { key: 'MissionVision', label: { en: 'Mission & Vision', fr: 'Mission et vision' } },
    { key: 'ImpactMeasurement', label: { en: 'Impact Measurement', fr: "Mesure d'impact" } },
    { key: 'GovernanceStructure', label: { en: 'Governance Structure', fr: 'Structure de gouvernance' } },
  ],
};

const PROVIDERS = ['OpenAI', 'Claude', 'Gemini'] as const;

const PROVIDER_COLORS = {
  OpenAI: { bg: 'bg-emerald-500', text: 'text-emerald-500', light: 'bg-emerald-500/10' },
  Claude: { bg: 'bg-orange-500', text: 'text-orange-500', light: 'bg-orange-500/10' },
  Gemini: { bg: 'bg-blue-500', text: 'text-blue-500', light: 'bg-blue-500/10' },
};

export default function AIStudioConfigContent({ locale }: { locale: string }) {
  const { language } = useTheme();
  const [config, setConfig] = useState<AIConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // State for showing/hiding API keys
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});

  // State for editing API keys
  const [editedApiKeys, setEditedApiKeys] = useState<Record<string, string>>({});

  // State for editing models
  const [editedModels, setEditedModels] = useState<Record<string, string>>({});

  // State for active provider selection
  const [selectedActiveProvider, setSelectedActiveProvider] = useState<string>('OpenAI');

  // State for fallback providers
  const [selectedFallbacks, setSelectedFallbacks] = useState<string[]>([]);

  // State for testing providers
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, ProviderTestResponse>>({});

  // State for section overrides
  const [sectionOverrides, setSectionOverrides] = useState<Record<string, SectionOverride>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  const t = {
    title: language === 'fr' ? 'Configuration IA' : 'AI Configuration',
    subtitle: language === 'fr'
      ? 'Configurez les fournisseurs IA pour la generation de plans d\'affaires'
      : 'Configure AI providers for business plan generation',
    back: language === 'fr' ? 'Retour a AI Studio' : 'Back to AI Studio',
    activeProvider: language === 'fr' ? 'Fournisseur principal' : 'Primary Provider',
    activeProviderDesc: language === 'fr'
      ? 'Le fournisseur IA utilise par defaut pour toutes les generations'
      : 'The default AI provider used for all generations',
    fallbackProviders: language === 'fr' ? 'Fournisseurs de secours' : 'Fallback Providers',
    fallbackProvidersDesc: language === 'fr'
      ? 'Utilises si le fournisseur principal echoue (dans l\'ordre)'
      : 'Used if the primary provider fails (in order)',
    providerConfig: language === 'fr' ? 'Configuration des fournisseurs' : 'Provider Configuration',
    sectionOverrides: language === 'fr' ? 'Remplacements par section' : 'Section Overrides',
    sectionOverridesDesc: language === 'fr'
      ? 'Definir un fournisseur IA specifique pour certaines sections'
      : 'Set a specific AI provider for certain sections',
    useDefault: language === 'fr' ? 'Utiliser par defaut' : 'Use Default',
    save: language === 'fr' ? 'Enregistrer' : 'Save Configuration',
    saving: language === 'fr' ? 'Enregistrement...' : 'Saving...',
    test: language === 'fr' ? 'Tester' : 'Test',
    testing: language === 'fr' ? 'Test...' : 'Testing...',
    configured: language === 'fr' ? 'Configure' : 'Configured',
    notConfigured: language === 'fr' ? 'Non configure' : 'Not configured',
    apiKey: language === 'fr' ? 'Cle API' : 'API Key',
    model: language === 'fr' ? 'Modele' : 'Model',
    success: language === 'fr' ? 'Configuration enregistree avec succes!' : 'Configuration saved successfully!',
  };

  useEffect(() => {
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      setError(null);

      const [configData, overridesData] = await Promise.all([
        aiConfigService.getConfiguration(),
        aiConfigService.getSectionOverrides().catch(() => ({})),
      ]);

      setConfig(configData);
      setSelectedActiveProvider(configData.activeProvider);
      setSelectedFallbacks(configData.fallbackProviders);
      setSectionOverrides(overridesData);

      // Initialize edited models with current values
      const models: Record<string, string> = {};
      Object.entries(configData.providers).forEach(([key, info]) => {
        models[key] = info.model;
      });
      setEditedModels(models);
    } catch (err: any) {
      setError(err.message || 'Failed to load configuration');
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
        activeProvider: selectedActiveProvider,
        fallbackProviders: selectedFallbacks,
        providers: {} as Record<string, { apiKey?: string; model: string }>,
      };

      // Build provider settings
      Object.keys(config.providers).forEach((providerName) => {
        request.providers[providerName] = {
          apiKey: editedApiKeys[providerName] || undefined,
          model: editedModels[providerName],
        };
      });

      await Promise.all([
        aiConfigService.updateConfiguration(request),
        aiConfigService.updateSectionOverrides(sectionOverrides),
      ]);

      setSuccessMessage(t.success);
      await loadConfiguration();
      setEditedApiKeys({});

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleTestProvider = async (providerName: string) => {
    if (!config) return;

    const apiKey = editedApiKeys[providerName] || '';
    const model = editedModels[providerName];

    if (!apiKey && !config.providers[providerName]?.isConfigured) {
      setError(`Please enter an API key for ${providerName} first`);
      return;
    }

    try {
      setTestingProvider(providerName);
      setError(null);

      const result = await aiConfigService.testProvider(providerName, {
        apiKey: apiKey || 'existing',
        model,
      });

      setTestResults({ ...testResults, [providerName]: result });
    } catch (err: any) {
      setError(err.message || 'Test failed');
    } finally {
      setTestingProvider(null);
    }
  };

  const handleSectionOverrideChange = (sectionKey: string, provider: string | null) => {
    if (provider === null || provider === 'default') {
      const newOverrides = { ...sectionOverrides };
      delete newOverrides[sectionKey];
      setSectionOverrides(newOverrides);
    } else {
      setSectionOverrides({
        ...sectionOverrides,
        [sectionKey]: { provider, model: editedModels[provider] },
      });
    }
  };

  const toggleFallback = (provider: string) => {
    if (provider === selectedActiveProvider) return;

    if (selectedFallbacks.includes(provider)) {
      setSelectedFallbacks(selectedFallbacks.filter(p => p !== provider));
    } else {
      setSelectedFallbacks([...selectedFallbacks, provider]);
    }
  };

  const toggleGroup = (group: string) => {
    setExpandedGroups({ ...expandedGroups, [group]: !expandedGroups[group] });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-zinc-600 dark:text-zinc-400">Failed to load configuration</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-800 dark:via-slate-900 dark:to-black p-6 md:p-8"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }} />
        </div>

        {/* Gradient orbs */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-slate-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-zinc-500/20 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/ai-studio"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500 to-zinc-600 flex items-center justify-center shadow-lg shadow-slate-500/25">
              <Settings2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{t.title}</h1>
              <p className="text-slate-400 mt-1">{t.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-500/10 border border-slate-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-medium text-slate-400">
                {selectedActiveProvider}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="space-y-6">
        {/* Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 dark:text-red-400">{error}</p>
            </motion.div>
          )}
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-3"
            >
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-green-700 dark:text-green-400">{successMessage}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active Provider Selection */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{t.activeProvider}</h2>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">{t.activeProviderDesc}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {PROVIDERS.map((provider) => {
              const providerInfo = config.providers[provider];
              const isActive = selectedActiveProvider === provider;
              const colors = PROVIDER_COLORS[provider];

              return (
                <button
                  key={provider}
                  onClick={() => setSelectedActiveProvider(provider)}
                  disabled={!providerInfo?.isConfigured && !editedApiKeys[provider]}
                  className={cn(
                    'relative p-4 rounded-xl border-2 text-left transition-all',
                    isActive
                      ? `border-current ${colors.text} ${colors.light}`
                      : 'border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600',
                    (!providerInfo?.isConfigured && !editedApiKeys[provider]) && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-zinc-900 dark:text-white">{provider}</span>
                    {isActive && <CheckCircle className={cn('w-5 h-5', colors.text)} />}
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {providerInfo?.isConfigured || editedApiKeys[provider] ? t.configured : t.notConfigured}
                  </p>
                  {providerInfo?.source && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-zinc-400">
                      {providerInfo.source === 'Database' ? <Database className="w-3 h-3" /> : <Server className="w-3 h-3" />}
                      <span>{providerInfo.source}</span>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Fallback Providers */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <RefreshCw className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{t.fallbackProviders}</h2>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">{t.fallbackProvidersDesc}</p>

          <div className="flex flex-wrap gap-2">
            {PROVIDERS.filter(p => p !== selectedActiveProvider).map((provider) => {
              const isSelected = selectedFallbacks.includes(provider);
              const colors = PROVIDER_COLORS[provider];
              const providerInfo = config.providers[provider];
              const isConfigured = providerInfo?.isConfigured || !!editedApiKeys[provider];

              return (
                <button
                  key={provider}
                  onClick={() => toggleFallback(provider)}
                  disabled={!isConfigured}
                  className={cn(
                    'px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all flex items-center gap-2',
                    isSelected
                      ? `${colors.light} ${colors.text} border-current`
                      : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400',
                    !isConfigured && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {isSelected && <CheckCircle className="w-4 h-4" />}
                  {provider}
                  {selectedFallbacks.indexOf(provider) >= 0 && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-zinc-200 dark:bg-zinc-700 rounded">
                      #{selectedFallbacks.indexOf(provider) + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Provider Configuration */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Brain className="w-5 h-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{t.providerConfig}</h2>
          </div>

          <div className="space-y-6">
            {PROVIDERS.map((providerName) => {
              const provider = config.providers[providerName];
              const colors = PROVIDER_COLORS[providerName];

              return (
                <div
                  key={providerName}
                  className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-700 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', colors.bg)}>
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-zinc-900 dark:text-white">{providerName}</h3>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {provider?.model || editedModels[providerName]}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {provider?.isConfigured ? (
                        <span className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          {t.configured}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                          <AlertCircle className="w-3 h-3" />
                          {t.notConfigured}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* API Key */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      {t.apiKey}
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showApiKeys[providerName] ? 'text' : 'password'}
                          value={editedApiKeys[providerName] || ''}
                          onChange={(e) => setEditedApiKeys({ ...editedApiKeys, [providerName]: e.target.value })}
                          placeholder={provider?.apiKeyPreview || 'Enter API key...'}
                          className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKeys({ ...showApiKeys, [providerName]: !showApiKeys[providerName] })}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                        >
                          {showApiKeys[providerName] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <button
                        onClick={() => handleTestProvider(providerName)}
                        disabled={testingProvider === providerName}
                        className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                      >
                        {testingProvider === providerName ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t.testing}
                          </>
                        ) : (
                          t.test
                        )}
                      </button>
                    </div>
                    {testResults[providerName] && (
                      <div
                        className={cn(
                          'mt-2 p-3 rounded-lg flex items-start gap-2 text-sm',
                          testResults[providerName].success
                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                        )}
                      >
                        {testResults[providerName].success ? (
                          <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        )}
                        <span>
                          {testResults[providerName].message} ({testResults[providerName].responseTimeMs}ms)
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Model Selection */}
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      {t.model}
                    </label>
                    <select
                      value={editedModels[providerName] || ''}
                      onChange={(e) => setEditedModels({ ...editedModels, [providerName]: e.target.value })}
                      className="w-full px-4 py-2 border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    >
                      {AVAILABLE_MODELS[providerName]?.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section Overrides */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6">
          <div className="flex items-center gap-3 mb-2">
            <Layers className="w-5 h-5 text-indigo-500" />
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">{t.sectionOverrides}</h2>
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">{t.sectionOverridesDesc}</p>

          <div className="space-y-4">
            {Object.entries(SECTION_GROUPS).map(([groupName, sections]) => (
              <div key={groupName} className="border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleGroup(groupName)}
                  className="w-full flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <span className="font-medium text-zinc-900 dark:text-white">{groupName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-500">
                      {sections.filter(s => sectionOverrides[s.key]).length} / {sections.length} overrides
                    </span>
                    {expandedGroups[groupName] ? (
                      <ChevronDown className="w-5 h-5 text-zinc-400" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-zinc-400" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {expandedGroups[groupName] && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 space-y-3 border-t border-zinc-200 dark:border-zinc-700">
                        {sections.map((section) => {
                          const override = sectionOverrides[section.key];
                          const label = section.label[language === 'fr' ? 'fr' : 'en'];

                          return (
                            <div key={section.key} className="flex items-center justify-between gap-4">
                              <span className="text-sm text-zinc-700 dark:text-zinc-300 flex-1">{label}</span>
                              <select
                                value={override?.provider || 'default'}
                                onChange={(e) => handleSectionOverrideChange(section.key, e.target.value === 'default' ? null : e.target.value)}
                                className={cn(
                                  'px-3 py-1.5 text-sm border rounded-lg transition-colors',
                                  override?.provider
                                    ? `${PROVIDER_COLORS[override.provider as keyof typeof PROVIDER_COLORS]?.light} ${PROVIDER_COLORS[override.provider as keyof typeof PROVIDER_COLORS]?.text} border-current`
                                    : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                                )}
                              >
                                <option value="default">{t.useDefault} ({selectedActiveProvider})</option>
                                {PROVIDERS.map((provider) => (
                                  <option key={provider} value={provider}>
                                    {provider}
                                  </option>
                                ))}
                              </select>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 transition-all shadow-lg shadow-orange-500/25 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t.saving}
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {t.save}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
