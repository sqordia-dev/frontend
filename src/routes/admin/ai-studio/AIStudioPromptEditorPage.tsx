import React, { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Save,
  Play,
  Loader2,
  History,
  Eye,
  EyeOff,
  Code2,
  MessageSquare,
  Settings2,
  Wand2,
  Copy,
  Check,
  Brain,
  Sparkles,
  Zap,
  ChevronDown,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { promptRegistryService } from '../../../lib/prompt-registry-service';
import {
  MonacoPromptEditor,
  DeploymentLabelPicker,
  DeploymentBadge,
  VersionHistorySidebar,
  PromptImprover,
  PerformanceDashboard,
} from '../../../components/admin/prompt-registry';
import type {
  PromptTemplateDto,
  PromptVersionHistoryDto,
  PromptTestResultDto,
  PromptAlias,
} from '../../../types/prompt-registry';
import { cn } from '../../../lib/utils';

// AI Provider configurations
const AI_PROVIDERS = [
  {
    id: 'claude',
    name: 'Claude',
    fullName: 'Anthropic Claude',
    models: ['claude-3-5-sonnet-20241022', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
    icon: Brain,
    color: '#D97706',
    bgGradient: 'from-amber-500 to-orange-600'
  },
  {
    id: 'openai',
    name: 'OpenAI',
    fullName: 'OpenAI GPT',
    models: ['gpt-4-turbo', 'gpt-4o', 'gpt-4o-mini', 'gpt-3.5-turbo'],
    icon: Sparkles,
    color: '#10B981',
    bgGradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 'gemini',
    name: 'Gemini',
    fullName: 'Google Gemini',
    models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'],
    icon: Zap,
    color: '#3B82F6',
    bgGradient: 'from-blue-500 to-indigo-600'
  },
];

export function AIStudioPromptEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { language } = useTheme();

  // Prompt state
  const [prompt, setPrompt] = useState<PromptTemplateDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editor state
  const [editSystemPrompt, setEditSystemPrompt] = useState('');
  const [editUserPromptTemplate, setEditUserPromptTemplate] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Deployment label
  const [deploymentLabel, setDeploymentLabel] = useState<PromptAlias | null>(null);
  const [deploymentLoading, setDeploymentLoading] = useState(false);

  // AI Provider & Model
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  // Test parameters
  const [testVariables, setTestVariables] = useState('{}');
  const [testMaxTokens, setTestMaxTokens] = useState(1000);
  const [testTemperature, setTestTemperature] = useState(0.7);
  const [testResult, setTestResult] = useState<PromptTestResultDto | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Version history
  const [showHistory, setShowHistory] = useState(false);
  const [versionHistory, setVersionHistory] = useState<PromptVersionHistoryDto[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Improver & Performance
  const [showImprover, setShowImprover] = useState(false);
  const [showPerformance, setShowPerformance] = useState(false);

  // Copy state
  const [copiedOutput, setCopiedOutput] = useState(false);

  // Current provider
  const currentProvider = AI_PROVIDERS.find(p => p.id === selectedProvider) || AI_PROVIDERS[0];
  const ProviderIcon = currentProvider.icon;

  const t = {
    back: language === 'fr' ? 'Retour aux prompts' : 'Back to Prompts',
    save: language === 'fr' ? 'Sauvegarder' : 'Save',
    saving: language === 'fr' ? 'Sauvegarde...' : 'Saving...',
    unsaved: language === 'fr' ? 'Non sauvegardé' : 'Unsaved',
    saved: language === 'fr' ? 'Sauvegardé!' : 'Saved!',
    test: language === 'fr' ? 'Tester' : 'Test',
    testing: language === 'fr' ? 'Test en cours...' : 'Testing...',
    history: language === 'fr' ? 'Historique' : 'History',
    improve: language === 'fr' ? 'Améliorer' : 'Improve',
    analytics: language === 'fr' ? 'Analytics' : 'Analytics',
    systemPrompt: language === 'fr' ? 'PROMPT SYSTÈME' : 'SYSTEM PROMPT',
    userTemplate: language === 'fr' ? 'TEMPLATE UTILISATEUR' : 'USER PROMPT TEMPLATE',
    variableHint: language === 'fr' ? '(utilisez {{variable}} pour les variables)' : '(use {{variable}} for variables)',
    testVariables: language === 'fr' ? 'Variables de test (JSON)' : 'Test Variables (JSON)',
    testOutput: language === 'fr' ? 'Sortie du test' : 'Test Output',
    tokens: language === 'fr' ? 'Tokens' : 'Tokens',
    responseTime: language === 'fr' ? 'Temps' : 'Time',
    copy: language === 'fr' ? 'Copier' : 'Copy',
    copied: language === 'fr' ? 'Copié!' : 'Copied!',
    settings: language === 'fr' ? 'Paramètres' : 'Settings',
    maxTokens: language === 'fr' ? 'Max Tokens' : 'Max Tokens',
    temperature: language === 'fr' ? 'Température' : 'Temperature',
    provider: language === 'fr' ? 'Fournisseur' : 'Provider',
    model: language === 'fr' ? 'Modèle' : 'Model',
    deploy: language === 'fr' ? 'Déploiement' : 'Deployment',
    section: language === 'fr' ? 'Section' : 'Section',
    type: language === 'fr' ? 'Type' : 'Type',
    notFound: language === 'fr' ? 'Prompt non trouvé' : 'Prompt not found',
  };

  // Load prompt
  useEffect(() => {
    const loadPrompt = async () => {
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const data = await promptRegistryService.getById(id);
        setPrompt(data);
        setEditSystemPrompt(data.systemPrompt || '');
        setEditUserPromptTemplate(data.userPromptTemplate || '');
        setEditDescription(data.description || '');
        setDeploymentLabel(data.alias);
      } catch (err: any) {
        console.error('Error loading prompt:', err);
        setError(err.message || 'Failed to load prompt');
      } finally {
        setLoading(false);
      }
    };
    loadPrompt();
  }, [id]);

  // Track dirty state
  useEffect(() => {
    if (!prompt) return;
    const hasChanges =
      editSystemPrompt !== (prompt.systemPrompt || '') ||
      editUserPromptTemplate !== (prompt.userPromptTemplate || '') ||
      editDescription !== (prompt.description || '');
    setIsDirty(hasChanges);
  }, [editSystemPrompt, editUserPromptTemplate, editDescription, prompt]);

  // Handle save
  const handleSave = async () => {
    if (!prompt || !isDirty) return;
    setSaving(true);
    try {
      await promptRegistryService.update(prompt.id, {
        systemPrompt: editSystemPrompt,
        userPromptTemplate: editUserPromptTemplate,
        description: editDescription,
      });
      // Reload prompt to get updated version
      const updated = await promptRegistryService.getById(prompt.id);
      setPrompt(updated);
      setIsDirty(false);
      setSuccessMessage(t.saved);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error saving prompt:', err);
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  // Handle test
  const handleTest = async () => {
    if (!prompt) return;
    setTestLoading(true);
    setTestResult(null);
    try {
      const result = await promptRegistryService.testPrompt(prompt.id, {
        sampleVariables: testVariables,
        maxTokens: testMaxTokens,
        temperature: testTemperature,
      });
      setTestResult(result);
    } catch (err: any) {
      console.error('Error testing prompt:', err);
      setError(err.message || 'Test failed');
    } finally {
      setTestLoading(false);
    }
  };

  // Handle deployment label change
  const handleDeploymentLabelChange = async (alias: PromptAlias | null) => {
    if (!prompt) return;
    setDeploymentLoading(true);
    try {
      await promptRegistryService.setAlias(prompt.id, { alias });
      setDeploymentLabel(alias);
    } catch (err) {
      console.error('Error setting alias:', err);
    } finally {
      setDeploymentLoading(false);
    }
  };

  // Handle toggle active
  const handleToggleActive = async () => {
    if (!prompt) return;
    try {
      if (prompt.isActive) {
        await promptRegistryService.deactivate(prompt.id);
      } else {
        await promptRegistryService.activate(prompt.id);
      }
      const updated = await promptRegistryService.getById(prompt.id);
      setPrompt(updated);
    } catch (err) {
      console.error('Error toggling active:', err);
    }
  };

  // Load history
  const loadHistory = async () => {
    if (!prompt) return;
    setHistoryLoading(true);
    try {
      const history = await promptRegistryService.getVersionHistory(
        prompt.sectionType,
        prompt.planType,
        prompt.industryCategory
      );
      setVersionHistory(history);
      setShowHistory(true);
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Provider change
  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);
    const provider = AI_PROVIDERS.find(p => p.id === providerId);
    if (provider) {
      setSelectedModel(provider.models[0]);
    }
    setShowProviderDropdown(false);
  };

  // Copy output
  const handleCopyOutput = () => {
    if (testResult?.output) {
      navigator.clipboard.writeText(testResult.output);
      setCopiedOutput(true);
      setTimeout(() => setCopiedOutput(false), 2000);
    }
  };

  // Handle improvement applied
  const handleImprovementApplied = (improvedSystem: string, improvedUser: string) => {
    setEditSystemPrompt(improvedSystem);
    setEditUserPromptTemplate(improvedUser);
    setShowImprover(false);
    setSuccessMessage(language === 'fr' ? 'Améliorations appliquées!' : 'Improvements applied!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Handle rollback from version history
  const handleRollback = async (versionItem: { id?: string; version: number }) => {
    if (!prompt) return;
    const historyItem = versionHistory.find(h => h.version === versionItem.version);
    if (!historyItem) return;
    try {
      await promptRegistryService.rollback(historyItem.id);
      const updated = await promptRegistryService.getById(prompt.id);
      setPrompt(updated);
      setEditSystemPrompt(updated.systemPrompt || '');
      setEditUserPromptTemplate(updated.userPromptTemplate || '');
      setEditDescription(updated.description || '');
      setShowHistory(false);
      setSuccessMessage(language === 'fr'
        ? `Retour à la version ${versionItem.version} réussi`
        : `Successfully rolled back to version ${versionItem.version}`);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error restoring version:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <p className="text-zinc-600 dark:text-zinc-400">{error || t.notFound}</p>
        <Link
          to="/admin/ai-studio/prompts"
          className="text-orange-500 hover:underline"
        >
          {t.back}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                to="/admin/ai-studio/prompts"
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-zinc-500" />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-zinc-900 dark:text-white">
                    {prompt.name}
                  </h1>
                  {isDirty && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded">
                      {t.unsaved}
                    </span>
                  )}
                  {successMessage && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {successMessage}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-500 mt-0.5">
                  <span>{prompt.sectionTypeName}</span>
                  <span>•</span>
                  <span>{prompt.planTypeName}</span>
                  <span>•</span>
                  <span>v{prompt.version}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={loadHistory}
                disabled={historyLoading}
                className="p-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
                title={t.history}
              >
                {historyLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <History className="w-4 h-4" />}
              </button>
              <button
                onClick={handleToggleActive}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  prompt.isActive
                    ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30'
                    : 'text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                )}
                title={prompt.isActive ? 'Deactivate' : 'Activate'}
              >
                {prompt.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setShowImprover(true)}
                disabled={!editSystemPrompt && !editUserPromptTemplate}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                  (editSystemPrompt || editUserPromptTemplate)
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white hover:from-violet-600 hover:to-purple-700'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                )}
              >
                <Wand2 className="w-4 h-4" />
                <span className="hidden sm:inline">{t.improve}</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !isDirty}
                className={cn(
                  'flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-colors',
                  isDirty
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                )}
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? t.saving : t.save}
              </button>
            </div>
          </div>
        </div>

        {/* Metadata Bar */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">{t.deploy}:</span>
              <DeploymentLabelPicker
                value={deploymentLabel}
                onChange={handleDeploymentLabelChange}
                loading={deploymentLoading}
              />
            </div>
            <div className="w-px h-4 bg-zinc-200 dark:bg-zinc-700" />
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">{t.section}:</span>
              <span className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium rounded">
                {prompt.sectionTypeName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">{t.type}:</span>
              <span className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-medium rounded">
                {prompt.planTypeName}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor Column */}
          <div className="space-y-6">
            {/* System Prompt */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
              <label className="flex items-center gap-2 text-xs font-medium text-zinc-500 mb-3">
                <Code2 className="w-3.5 h-3.5" />
                {t.systemPrompt}
              </label>
              <MonacoPromptEditor
                value={editSystemPrompt}
                onChange={setEditSystemPrompt}
                placeholder={language === 'fr' ? 'Entrez le prompt système...' : 'Enter system prompt...'}
                minHeight={200}
                maxHeight={400}
                showLineNumbers={true}
                showMinimap={false}
              />
            </div>

            {/* User Prompt Template */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
              <label className="flex items-center gap-2 text-xs font-medium text-zinc-500 mb-3">
                <MessageSquare className="w-3.5 h-3.5" />
                {t.userTemplate}
                <span className="text-zinc-400 font-normal">{t.variableHint}</span>
              </label>
              <MonacoPromptEditor
                value={editUserPromptTemplate}
                onChange={setEditUserPromptTemplate}
                placeholder={language === 'fr' ? 'Entrez le template utilisateur...' : 'Enter user prompt template...'}
                minHeight={250}
                maxHeight={500}
                showLineNumbers={true}
                showMinimap={false}
              />
            </div>
          </div>

          {/* Test Column */}
          <div className="space-y-6">
            {/* Test Panel */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-orange-500" />
                  {language === 'fr' ? 'Tester le Prompt' : 'Test Prompt'}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      showSettings
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                        : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                    )}
                  >
                    <Settings2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Settings */}
              {showSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-4 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg space-y-4"
                >
                  {/* Provider */}
                  <div className="relative">
                    <label className="text-xs text-zinc-500 mb-1 block">{t.provider}</label>
                    <button
                      onClick={() => setShowProviderDropdown(!showProviderDropdown)}
                      className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn('w-6 h-6 rounded flex items-center justify-center bg-gradient-to-br', currentProvider.bgGradient)}>
                          <ProviderIcon className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span className="text-sm">{currentProvider.name}</span>
                      </div>
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    </button>
                    {showProviderDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg">
                        {AI_PROVIDERS.map(provider => {
                          const Icon = provider.icon;
                          return (
                            <button
                              key={provider.id}
                              onClick={() => handleProviderChange(provider.id)}
                              className={cn(
                                'w-full px-3 py-2 flex items-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-700',
                                selectedProvider === provider.id && 'bg-zinc-50 dark:bg-zinc-700'
                              )}
                            >
                              <div className={cn('w-6 h-6 rounded flex items-center justify-center bg-gradient-to-br', provider.bgGradient)}>
                                <Icon className="w-3.5 h-3.5 text-white" />
                              </div>
                              <span className="text-sm">{provider.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Model */}
                  <div className="relative">
                    <label className="text-xs text-zinc-500 mb-1 block">{t.model}</label>
                    <button
                      onClick={() => setShowModelDropdown(!showModelDropdown)}
                      className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                    >
                      <span className="text-sm">{selectedModel}</span>
                      <ChevronDown className="w-4 h-4 text-zinc-400" />
                    </button>
                    {showModelDropdown && (
                      <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg">
                        {currentProvider.models.map(model => (
                          <button
                            key={model}
                            onClick={() => { setSelectedModel(model); setShowModelDropdown(false); }}
                            className={cn(
                              'w-full px-3 py-2 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-700',
                              selectedModel === model && 'bg-zinc-50 dark:bg-zinc-700'
                            )}
                          >
                            {model}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Max Tokens & Temperature */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">{t.maxTokens}</label>
                      <input
                        type="number"
                        value={testMaxTokens}
                        onChange={e => setTestMaxTokens(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-500 mb-1 block">{t.temperature}</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="2"
                        value={testTemperature}
                        onChange={e => setTestTemperature(Number(e.target.value))}
                        className="w-full px-3 py-2 text-sm bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Test Variables */}
              <div className="mb-4">
                <label className="text-xs text-zinc-500 mb-2 block">{t.testVariables}</label>
                <textarea
                  value={testVariables}
                  onChange={e => setTestVariables(e.target.value)}
                  placeholder='{"companyName": "Acme Inc", "industry": "Technology"}'
                  className="w-full h-24 px-3 py-2 font-mono text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg resize-none"
                />
              </div>

              {/* Run Test Button */}
              <button
                onClick={handleTest}
                disabled={testLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all disabled:opacity-50"
              >
                {testLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t.testing}
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    {t.test}
                  </>
                )}
              </button>
            </div>

            {/* Test Result */}
            {testResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                    {t.testOutput}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-zinc-500">
                    <span>{t.tokens}: {testResult.tokensUsed}</span>
                    <span>{t.responseTime}: {testResult.responseTimeMs}ms</span>
                    <button
                      onClick={handleCopyOutput}
                      className="flex items-center gap-1 text-orange-500 hover:text-orange-600"
                    >
                      {copiedOutput ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedOutput ? t.copied : t.copy}
                    </button>
                  </div>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg max-h-80 overflow-y-auto">
                  <pre className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                    {testResult.output}
                  </pre>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Version History Sidebar */}
      <VersionHistorySidebar
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        versions={versionHistory.map(v => ({
          id: v.id,
          version: v.version,
          createdAt: v.createdAt,
          createdBy: v.createdBy,
          systemPrompt: '', // Not available in history DTO
          userPromptTemplate: '', // Not available in history DTO
          notes: v.hasSystemPromptChanges ? 'System prompt changed' : undefined,
        }))}
        currentSystemPrompt={prompt.systemPrompt ?? ''}
        currentUserPromptTemplate={prompt.userPromptTemplate ?? ''}
        loading={historyLoading}
        onRollback={handleRollback}
        promptName={prompt.name}
      />

      {/* AI Improver */}
      <PromptImprover
        isOpen={showImprover}
        onClose={() => setShowImprover(false)}
        systemPrompt={editSystemPrompt}
        userPromptTemplate={editUserPromptTemplate}
        onApply={handleImprovementApplied}
      />

      {/* Performance Dashboard */}
      {prompt && (
        <PerformanceDashboard
          isOpen={showPerformance}
          onClose={() => setShowPerformance(false)}
          promptId={prompt.id}
          promptName={prompt.name}
          language={language as 'en' | 'fr'}
        />
      )}
    </div>
  );
}

export default AIStudioPromptEditorPage;
