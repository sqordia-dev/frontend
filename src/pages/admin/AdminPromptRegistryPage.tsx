import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Database,
  Search,
  X,
  Save,
  Clock,
  Edit3,
  Play,
  ChevronDown,
  AlertCircle,
  Loader2,
  History,
  CheckCircle,
  RotateCcw,
  Eye,
  EyeOff,
  BookOpen,
  Sparkles,
  Settings2,
  Copy,
  Check,
  Zap,
  Brain,
  Bot,
  FileText,
  Code2,
  MessageSquare,
  ArrowLeft,
} from 'lucide-react';
import { aiPromptService } from '../../lib/ai-prompt-service';
import { getUserFriendlyError } from '../../utils/error-messages';
import type {
  AIPromptDto,
  AIPromptVersionDto,
  AIPromptTestResult,
  AIPromptFilter,
} from '../../types/ai-prompt';
import {
  AI_PROMPT_CATEGORIES,
  PLAN_TYPES,
  LANGUAGES,
  SECTION_DISPLAY_NAMES,
  type SectionName,
} from '../../types/ai-prompt';
import VariableForm from '../../components/admin/VariableForm';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';
import { ResizablePanel } from '@/components/ui/resizable-panel';

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

// Chapter-based colors for section badges
const CHAPTER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'ExecutiveSummary': { bg: 'bg-orange-50 dark:bg-orange-950', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800' },
  'Project': { bg: 'bg-blue-50 dark:bg-blue-950', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
  'Promoters': { bg: 'bg-amber-50 dark:bg-amber-950', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800' },
  'MarketStudy': { bg: 'bg-purple-50 dark:bg-purple-950', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800' },
  'MarketingSales': { bg: 'bg-pink-50 dark:bg-pink-950', text: 'text-pink-600 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-800' },
  'Operations': { bg: 'bg-cyan-50 dark:bg-cyan-950', text: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-800' },
  'Financial': { bg: 'bg-green-50 dark:bg-green-950', text: 'text-green-600 dark:text-green-400', border: 'border-green-200 dark:border-green-800' },
  'Appendix': { bg: 'bg-gray-50 dark:bg-gray-950', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-200 dark:border-gray-800' },
};

const getColorForSection = (sectionName?: string) => {
  const defaultColors = {
    bg: 'bg-warm-gray-50 dark:bg-warm-gray-900',
    text: 'text-warm-gray-600 dark:text-warm-gray-400',
    border: 'border-warm-gray-200 dark:border-warm-gray-700'
  };

  if (!sectionName) return defaultColors;

  // Extract chapter prefix from section name (e.g., 'ExecutiveSummary_CompanyPresentation' -> 'ExecutiveSummary')
  const chapterPrefix = sectionName.split('_')[0];
  return CHAPTER_COLORS[chapterPrefix] || defaultColors;
};

// Get display name for section based on language
const getSectionDisplayName = (sectionName: string | undefined, lang: string): string => {
  if (!sectionName) return 'Unknown Section';

  const displayNames = SECTION_DISPLAY_NAMES[sectionName as SectionName];
  if (displayNames) {
    return lang === 'fr' ? displayNames.fr : displayNames.en;
  }

  // Fallback: Convert camelCase/PascalCase to readable format
  return sectionName
    .replace(/_/g, ' - ')
    .replace(/([A-Z])/g, ' $1')
    .trim();
};

const formatTimeAgo = (date?: string): string => {
  if (!date) return 'Never';
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

type ViewMode = 'list' | 'workbench';

const AdminPromptRegistryPage: React.FC = () => {
  const { language } = useTheme();

  // View mode
  const [viewMode, setViewMode] = useState<ViewMode>('workbench');

  // State
  const [prompts, setPrompts] = useState<AIPromptDto[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<AIPromptDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterPlanType, setFilterPlanType] = useState<string>('');
  const [filterLanguage, setFilterLanguage] = useState<string>('');
  const [filterActiveOnly, setFilterActiveOnly] = useState<boolean>(false);

  // Selected prompt for workbench
  const [selectedPrompt, setSelectedPrompt] = useState<AIPromptDto | null>(null);

  // Editor state
  const [editSystemPrompt, setEditSystemPrompt] = useState('');
  const [editUserPromptTemplate, setEditUserPromptTemplate] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  // AI Provider & Model
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  const [showProviderDropdown, setShowProviderDropdown] = useState(false);
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  // Test parameters
  const [testVariables, setTestVariables] = useState('{}');
  const [testMaxTokens, setTestMaxTokens] = useState(1000);
  const [testTemperature, setTestTemperature] = useState(0.7);
  const [testResult, setTestResult] = useState<AIPromptTestResult | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Version history
  const [showHistory, setShowHistory] = useState(false);
  const [versionHistory, setVersionHistory] = useState<AIPromptVersionDto[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Copy state
  const [copiedOutput, setCopiedOutput] = useState(false);

  // Current provider config
  const currentProvider = AI_PROVIDERS.find(p => p.id === selectedProvider) || AI_PROVIDERS[0];

  // Load prompts
  const loadPrompts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filter: AIPromptFilter = {};
      if (filterCategory) filter.category = filterCategory;
      if (filterPlanType) filter.planType = filterPlanType;
      if (filterLanguage) filter.language = filterLanguage;
      if (filterActiveOnly) filter.isActive = true;

      const result = await aiPromptService.getAll(filter);
      setPrompts(result);

      // Auto-select first prompt if none selected
      if (result.length > 0 && !selectedPrompt) {
        selectPrompt(result[0]);
      }
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'load'));
      console.error('Error loading prompts:', err);
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterPlanType, filterLanguage, filterActiveOnly]);

  // Filter prompts client-side
  useEffect(() => {
    let filtered = [...prompts];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          (p.sectionName && p.sectionName.toLowerCase().includes(term))
      );
    }

    setFilteredPrompts(filtered);
  }, [prompts, searchTerm]);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  // Select prompt
  const selectPrompt = useCallback((prompt: AIPromptDto) => {
    setSelectedPrompt(prompt);
    setEditSystemPrompt(prompt.systemPrompt);
    setEditUserPromptTemplate(prompt.userPromptTemplate);
    setEditNotes(prompt.notes || '');
    setTestResult(null);
    setIsDirty(false);

    // Auto-populate test variables with prompt's section info
    const defaultVariables: Record<string, string> = {};
    if (prompt.sectionName) {
      defaultVariables.sectionName = prompt.sectionName;
    }
    if (prompt.planType) {
      defaultVariables.planType = prompt.planType;
    }
    if (prompt.language) {
      defaultVariables.language = prompt.language;
    }
    // Add sample business context
    defaultVariables.businessName = 'Sample Business Inc.';
    defaultVariables.businessDescription = 'A sample business for testing prompt output.';
    defaultVariables.industry = 'Technology';
    defaultVariables.targetMarket = 'Small to medium businesses';

    setTestVariables(JSON.stringify(defaultVariables, null, 2));
  }, []);

  // Track changes
  useEffect(() => {
    if (!selectedPrompt) return;
    const hasChanges =
      editSystemPrompt !== selectedPrompt.systemPrompt ||
      editUserPromptTemplate !== selectedPrompt.userPromptTemplate ||
      editNotes !== (selectedPrompt.notes || '');
    setIsDirty(hasChanges);
  }, [editSystemPrompt, editUserPromptTemplate, editNotes, selectedPrompt]);

  // Handle save
  const handleSave = async () => {
    if (!selectedPrompt) return;
    setSaving(true);
    setError(null);
    try {
      await aiPromptService.update(selectedPrompt.id, {
        systemPrompt: editSystemPrompt,
        userPromptTemplate: editUserPromptTemplate,
        notes: editNotes,
      });
      setSuccessMessage(language === 'fr' ? 'Prompt sauvegardé avec succès!' : 'Prompt saved successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      setIsDirty(false);
      loadPrompts();
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'save'));
    } finally {
      setSaving(false);
    }
  };

  // Handle test
  const handleTest = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      if (selectedPrompt && !isDirty) {
        // Test saved prompt
        const result = await aiPromptService.test({
          promptId: selectedPrompt.id,
          sampleVariables: testVariables,
          maxTokens: testMaxTokens,
          temperature: testTemperature,
          provider: selectedProvider,
        });
        setTestResult(result);
      } else {
        // Test draft
        const result = await aiPromptService.testDraft({
          systemPrompt: editSystemPrompt,
          userPromptTemplate: editUserPromptTemplate,
          sampleVariables: testVariables,
          maxTokens: testMaxTokens,
          temperature: testTemperature,
          provider: selectedProvider,
        });
        setTestResult(result);
      }
    } catch (err: any) {
      setTestResult({
        promptId: selectedPrompt?.id || 'draft',
        testInput: testVariables,
        generatedOutput: '',
        tokensUsed: 0,
        temperature: testTemperature,
        testedAt: new Date().toISOString(),
        model: selectedModel,
        responseTime: '0s',
        error: getUserFriendlyError(err, 'ai'),
      });
    } finally {
      setTestLoading(false);
    }
  };

  // Handle toggle active
  const handleToggleActive = async (prompt: AIPromptDto) => {
    try {
      await aiPromptService.toggleStatus(prompt.id, !prompt.isActive);
      loadPrompts();
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'save'));
    }
  };

  // Load version history
  const loadHistory = async () => {
    if (!selectedPrompt) return;
    setHistoryLoading(true);
    setShowHistory(true);
    try {
      const history = await aiPromptService.getVersionHistory(selectedPrompt.id);
      setVersionHistory(history);
    } catch (err: any) {
      console.error('Error loading version history:', err);
      setVersionHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  // Handle rollback
  const handleRollback = async (version: AIPromptVersionDto) => {
    if (!selectedPrompt) return;
    try {
      await aiPromptService.rollback(selectedPrompt.id, {
        targetVersion: version.version,
        notes: `Rolled back to version ${version.version}`,
      });
      setSuccessMessage(language === 'fr'
        ? `Retour à la version ${version.version} réussi`
        : `Successfully rolled back to version ${version.version}`);
      setTimeout(() => setSuccessMessage(null), 3000);
      setShowHistory(false);
      loadPrompts();
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'save'));
    }
  };

  // Copy output
  const handleCopyOutput = () => {
    if (testResult?.generatedOutput) {
      navigator.clipboard.writeText(testResult.generatedOutput);
      setCopiedOutput(true);
      setTimeout(() => setCopiedOutput(false), 2000);
    }
  };

  // Change provider
  const handleProviderChange = (providerId: string) => {
    setSelectedProvider(providerId);
    const provider = AI_PROVIDERS.find(p => p.id === providerId);
    if (provider) {
      setSelectedModel(provider.models[0]);
    }
    setShowProviderDropdown(false);
  };

  return (
    <div className="h-full bg-warm-gray-50 dark:bg-warm-gray-950">
      {/* Page Toolbar */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 bg-white dark:bg-warm-gray-900 border-b border-warm-gray-200 dark:border-warm-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-momentum-orange to-orange-600 flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-warm-gray-900 dark:text-white">
              {language === 'fr' ? 'Registre de Prompts' : 'Prompt Registry'}
            </h1>
            <p className="text-xs text-warm-gray-500">
              {prompts.length} {language === 'fr' ? 'prompts' : 'prompts'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="hidden sm:flex items-center bg-warm-gray-100 dark:bg-warm-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                viewMode === 'list'
                  ? 'bg-white dark:bg-warm-gray-700 text-warm-gray-900 dark:text-white shadow-sm'
                  : 'text-warm-gray-500 hover:text-warm-gray-700'
              )}
            >
              {language === 'fr' ? 'Liste' : 'List'}
            </button>
            <button
              onClick={() => setViewMode('workbench')}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                viewMode === 'workbench'
                  ? 'bg-white dark:bg-warm-gray-700 text-warm-gray-900 dark:text-white shadow-sm'
                  : 'text-warm-gray-500 hover:text-warm-gray-700'
              )}
            >
              Workbench
            </button>
          </div>

          <Link
            to="/admin/prompt-registry/docs"
            className="p-2 text-warm-gray-500 hover:text-warm-gray-700 dark:hover:text-warm-gray-300 hover:bg-warm-gray-100 dark:hover:bg-warm-gray-800 rounded-lg transition-colors"
            title={language === 'fr' ? 'Documentation' : 'Documentation'}
          >
            <BookOpen className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-red-50 dark:bg-red-900/90 border border-red-200 dark:border-red-800 rounded-xl shadow-lg flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500" />
            <span className="text-sm text-red-700 dark:text-red-200">{error}</span>
            <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded">
              <X className="w-4 h-4 text-red-500" />
            </button>
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-green-50 dark:bg-green-900/90 border border-green-200 dark:border-green-800 rounded-xl shadow-lg flex items-center gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="text-sm text-green-700 dark:text-green-200">{successMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {viewMode === 'workbench' ? (
        <WorkbenchView
          prompts={filteredPrompts}
          selectedPrompt={selectedPrompt}
          loading={loading}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          filterPlanType={filterPlanType}
          setFilterPlanType={setFilterPlanType}
          selectPrompt={selectPrompt}
          handleToggleActive={handleToggleActive}
          editSystemPrompt={editSystemPrompt}
          setEditSystemPrompt={setEditSystemPrompt}
          editUserPromptTemplate={editUserPromptTemplate}
          setEditUserPromptTemplate={setEditUserPromptTemplate}
          editNotes={editNotes}
          setEditNotes={setEditNotes}
          isDirty={isDirty}
          saving={saving}
          handleSave={handleSave}
          currentProvider={currentProvider}
          selectedProvider={selectedProvider}
          selectedModel={selectedModel}
          showProviderDropdown={showProviderDropdown}
          setShowProviderDropdown={setShowProviderDropdown}
          showModelDropdown={showModelDropdown}
          setShowModelDropdown={setShowModelDropdown}
          handleProviderChange={handleProviderChange}
          setSelectedModel={setSelectedModel}
          testVariables={testVariables}
          setTestVariables={setTestVariables}
          testMaxTokens={testMaxTokens}
          setTestMaxTokens={setTestMaxTokens}
          testTemperature={testTemperature}
          setTestTemperature={setTestTemperature}
          showSettings={showSettings}
          setShowSettings={setShowSettings}
          testResult={testResult}
          testLoading={testLoading}
          handleTest={handleTest}
          handleCopyOutput={handleCopyOutput}
          copiedOutput={copiedOutput}
          loadHistory={loadHistory}
          language={language}
        />
      ) : (
        <ListView
          prompts={filteredPrompts}
          loading={loading}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterCategory={filterCategory}
          setFilterCategory={setFilterCategory}
          filterPlanType={filterPlanType}
          setFilterPlanType={setFilterPlanType}
          filterLanguage={filterLanguage}
          setFilterLanguage={setFilterLanguage}
          filterActiveOnly={filterActiveOnly}
          setFilterActiveOnly={setFilterActiveOnly}
          selectPrompt={(p) => { selectPrompt(p); setViewMode('workbench'); }}
          handleToggleActive={handleToggleActive}
          language={language}
        />
      )}

      {/* History Modal */}
      <AnimatePresence>
        {showHistory && selectedPrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
          >
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowHistory(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full sm:max-w-2xl max-h-[90vh] sm:max-h-[80vh] bg-white dark:bg-warm-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Mobile handle */}
              <div className="sm:hidden flex justify-center pt-2 pb-1">
                <div className="w-10 h-1 rounded-full bg-warm-gray-300 dark:bg-warm-gray-600" />
              </div>

              <div className="sticky top-0 bg-white dark:bg-warm-gray-900 border-b border-warm-gray-200 dark:border-warm-gray-800 px-4 py-3 sm:p-4 flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="text-base sm:text-lg font-semibold text-warm-gray-900 dark:text-white">
                    {language === 'fr' ? 'Historique des versions' : 'Version History'}
                  </h2>
                  <p className="text-xs sm:text-sm text-warm-gray-500 truncate">{selectedPrompt.name}</p>
                </div>
                <button
                  onClick={() => setShowHistory(false)}
                  className="p-2 hover:bg-warm-gray-100 dark:hover:bg-warm-gray-800 rounded-lg transition-colors shrink-0"
                >
                  <X className="w-5 h-5 text-warm-gray-500" />
                </button>
              </div>

              <div className="p-3 sm:p-4 overflow-y-auto max-h-[calc(90vh-100px)] sm:max-h-[calc(80vh-80px)]">
                {historyLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 animate-spin text-momentum-orange" />
                  </div>
                ) : versionHistory.length === 0 ? (
                  <div className="text-center py-12 text-warm-gray-500">
                    <History className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">{language === 'fr' ? 'Aucun historique' : 'No version history yet'}</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {versionHistory.map(version => (
                      <div
                        key={version.id}
                        className="border border-warm-gray-200 dark:border-warm-gray-700 rounded-xl p-3 sm:p-4 hover:border-momentum-orange/50 transition-colors"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 sm:mb-3">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-momentum-orange/10 text-momentum-orange text-xs sm:text-sm font-medium rounded-lg">
                              v{version.version}
                            </span>
                            <span className="text-xs sm:text-sm text-warm-gray-500">
                              {new Date(version.changedAt).toLocaleDateString()}
                            </span>
                          </div>
                          <button
                            onClick={() => handleRollback(version)}
                            className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm border border-momentum-orange text-momentum-orange rounded-lg hover:bg-momentum-orange hover:text-white transition-colors"
                          >
                            <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            <span className="hidden sm:inline">{language === 'fr' ? 'Restaurer' : 'Rollback'}</span>
                          </button>
                        </div>
                        {version.notes && (
                          <p className="text-xs sm:text-sm text-warm-gray-600 dark:text-warm-gray-400 mb-2">{version.notes}</p>
                        )}
                        <details className="text-xs sm:text-sm">
                          <summary className="cursor-pointer text-warm-gray-500 hover:text-momentum-orange">
                            {language === 'fr' ? 'Voir le contenu' : 'View content'}
                          </summary>
                          <div className="mt-2 sm:mt-3 space-y-2 sm:space-y-3">
                            <div>
                              <div className="text-[10px] sm:text-xs text-warm-gray-400 mb-1">System Prompt</div>
                              <pre className="bg-warm-gray-50 dark:bg-warm-gray-800 p-2 sm:p-3 rounded-lg text-[10px] sm:text-xs max-h-24 sm:max-h-32 overflow-y-auto">
                                {version.systemPrompt}
                              </pre>
                            </div>
                            <div>
                              <div className="text-[10px] sm:text-xs text-warm-gray-400 mb-1">User Prompt Template</div>
                              <pre className="bg-warm-gray-50 dark:bg-warm-gray-800 p-2 sm:p-3 rounded-lg text-[10px] sm:text-xs max-h-24 sm:max-h-32 overflow-y-auto">
                                {version.userPromptTemplate}
                              </pre>
                            </div>
                          </div>
                        </details>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// WORKBENCH VIEW COMPONENT
// ============================================
interface WorkbenchViewProps {
  prompts: AIPromptDto[];
  selectedPrompt: AIPromptDto | null;
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  filterCategory: string;
  setFilterCategory: (v: string) => void;
  filterPlanType: string;
  setFilterPlanType: (v: string) => void;
  selectPrompt: (p: AIPromptDto) => void;
  handleToggleActive: (p: AIPromptDto) => void;
  editSystemPrompt: string;
  setEditSystemPrompt: (v: string) => void;
  editUserPromptTemplate: string;
  setEditUserPromptTemplate: (v: string) => void;
  editNotes: string;
  setEditNotes: (v: string) => void;
  isDirty: boolean;
  saving: boolean;
  handleSave: () => void;
  currentProvider: typeof AI_PROVIDERS[0];
  selectedProvider: string;
  selectedModel: string;
  showProviderDropdown: boolean;
  setShowProviderDropdown: (v: boolean) => void;
  showModelDropdown: boolean;
  setShowModelDropdown: (v: boolean) => void;
  handleProviderChange: (id: string) => void;
  setSelectedModel: (m: string) => void;
  testVariables: string;
  setTestVariables: (v: string) => void;
  testMaxTokens: number;
  setTestMaxTokens: (v: number) => void;
  testTemperature: number;
  setTestTemperature: (v: number) => void;
  showSettings: boolean;
  setShowSettings: (v: boolean) => void;
  testResult: AIPromptTestResult | null;
  testLoading: boolean;
  handleTest: () => void;
  handleCopyOutput: () => void;
  copiedOutput: boolean;
  loadHistory: () => void;
  language: string;
}

function WorkbenchView({
  prompts,
  selectedPrompt,
  loading,
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  filterPlanType,
  setFilterPlanType,
  selectPrompt,
  handleToggleActive,
  editSystemPrompt,
  setEditSystemPrompt,
  editUserPromptTemplate,
  setEditUserPromptTemplate,
  editNotes,
  setEditNotes,
  isDirty,
  saving,
  handleSave,
  currentProvider,
  selectedProvider,
  selectedModel,
  showProviderDropdown,
  setShowProviderDropdown,
  showModelDropdown,
  setShowModelDropdown,
  handleProviderChange,
  setSelectedModel,
  testVariables,
  setTestVariables,
  testMaxTokens,
  setTestMaxTokens,
  testTemperature,
  setTestTemperature,
  showSettings,
  setShowSettings,
  testResult,
  testLoading,
  handleTest,
  handleCopyOutput,
  copiedOutput,
  loadHistory,
  language,
}: WorkbenchViewProps) {
  const ProviderIcon = currentProvider.icon;
  const [showMobileList, setShowMobileList] = useState(!selectedPrompt);

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-180px)] md:h-[calc(100vh-140px)]">
      {/* Left Sidebar - Prompt List (hidden on mobile when prompt selected) */}
      <div className={cn(
        "lg:w-72 border-r border-warm-gray-200 dark:border-warm-gray-800 bg-white dark:bg-warm-gray-900 flex flex-col",
        selectedPrompt && !showMobileList ? "hidden lg:flex" : "flex"
      )}>
        {/* Sidebar Header */}
        <div className="p-3 border-b border-warm-gray-200 dark:border-warm-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray-400" />
            <input
              type="text"
              placeholder={language === 'fr' ? 'Rechercher...' : 'Search prompts...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm border border-warm-gray-200 dark:border-warm-gray-700 rounded-lg bg-warm-gray-50 dark:bg-warm-gray-800 text-warm-gray-900 dark:text-white focus:ring-2 focus:ring-momentum-orange focus:border-transparent"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex gap-2 mt-2">
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="flex-1 px-2 py-1.5 text-xs border border-warm-gray-200 dark:border-warm-gray-700 rounded-lg bg-white dark:bg-warm-gray-800 text-warm-gray-700 dark:text-warm-gray-300"
            >
              <option value="">{language === 'fr' ? 'Catégorie' : 'Category'}</option>
              {AI_PROMPT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              value={filterPlanType}
              onChange={e => setFilterPlanType(e.target.value)}
              className="flex-1 px-2 py-1.5 text-xs border border-warm-gray-200 dark:border-warm-gray-700 rounded-lg bg-white dark:bg-warm-gray-800 text-warm-gray-700 dark:text-warm-gray-300"
            >
              <option value="">{language === 'fr' ? 'Type' : 'Plan Type'}</option>
              {PLAN_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Prompt List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-momentum-orange" />
            </div>
          ) : prompts.length === 0 ? (
            <div className="text-center py-12 px-4 text-warm-gray-500">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">{language === 'fr' ? 'Aucun prompt trouvé' : 'No prompts found'}</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {prompts.map(prompt => {
                const sectionColor = getColorForSection(prompt.sectionName);
                const isSelected = selectedPrompt?.id === prompt.id;

                return (
                  <button
                    key={prompt.id}
                    onClick={() => { selectPrompt(prompt); setShowMobileList(false); }}
                    className={cn(
                      'w-full text-left p-3 rounded-xl transition-all',
                      isSelected
                        ? 'bg-momentum-orange/10 border-l-4 border-momentum-orange'
                        : 'hover:bg-warm-gray-50 dark:hover:bg-warm-gray-800 border-l-4 border-transparent'
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {prompt.sectionName && (
                            <span className={cn(
                              'px-1.5 py-0.5 text-[10px] font-medium rounded',
                              sectionColor.bg, sectionColor.text
                            )}>
                              {getSectionDisplayName(prompt.sectionName, language)}
                            </span>
                          )}
                          <span className={cn(
                            'w-1.5 h-1.5 rounded-full',
                            prompt.isActive ? 'bg-green-500' : 'bg-warm-gray-300'
                          )} />
                        </div>
                        <h3 className={cn(
                          'text-sm font-medium truncate',
                          isSelected ? 'text-momentum-orange' : 'text-warm-gray-900 dark:text-white'
                        )}>
                          {prompt.name}
                        </h3>
                        <div className="flex items-center gap-2 text-[11px] text-warm-gray-400 mt-1">
                          <span className="uppercase">{prompt.language}</span>
                          <span>•</span>
                          <span>v{prompt.version}</span>
                          <span>•</span>
                          <span>{formatTimeAgo(prompt.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-warm-gray-200 dark:border-warm-gray-800">
          <div className="text-xs text-warm-gray-400 text-center">
            {prompts.length} {language === 'fr' ? 'prompts' : 'prompts'}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={cn(
        "flex-1 flex flex-col lg:flex-row",
        selectedPrompt && !showMobileList ? "flex" : "hidden lg:flex"
      )}>
        {selectedPrompt ? (
          <>
            {/* Editor Panel */}
            <div className="flex-1 flex flex-col lg:border-r border-warm-gray-200 dark:border-warm-gray-800 bg-white dark:bg-warm-gray-900">
              {/* Editor Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-warm-gray-200 dark:border-warm-gray-800">
                <div className="flex items-center gap-3">
                  {/* Mobile back button */}
                  <button
                    onClick={() => setShowMobileList(true)}
                    className="lg:hidden p-2 -ml-2 text-warm-gray-500 hover:text-warm-gray-700 dark:hover:text-warm-gray-300 hover:bg-warm-gray-100 dark:hover:bg-warm-gray-800 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h2 className="font-medium text-warm-gray-900 dark:text-white truncate max-w-[200px]">
                    {selectedPrompt.name}
                  </h2>
                  {isDirty && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 rounded">
                      {language === 'fr' ? 'Non sauvegardé' : 'Unsaved'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadHistory}
                    className="p-2 text-warm-gray-500 hover:text-warm-gray-700 dark:hover:text-warm-gray-300 hover:bg-warm-gray-100 dark:hover:bg-warm-gray-800 rounded-lg transition-colors"
                    title={language === 'fr' ? 'Historique' : 'Version History'}
                  >
                    <History className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleToggleActive(selectedPrompt)}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      selectedPrompt.isActive
                        ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30'
                        : 'text-warm-gray-400 hover:bg-warm-gray-100 dark:hover:bg-warm-gray-800'
                    )}
                    title={selectedPrompt.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {selectedPrompt.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving || !isDirty}
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                      isDirty
                        ? 'bg-momentum-orange text-white hover:bg-orange-600'
                        : 'bg-warm-gray-100 dark:bg-warm-gray-800 text-warm-gray-400 cursor-not-allowed'
                    )}
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {language === 'fr' ? 'Sauvegarder' : 'Save'}
                  </button>
                </div>
              </div>

              {/* Metadata Bar */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 px-3 sm:px-4 py-2 bg-warm-gray-50 dark:bg-warm-gray-800/50 text-[10px] sm:text-xs border-b border-warm-gray-200 dark:border-warm-gray-800">
                <div className="flex items-center gap-1">
                  <span className="text-warm-gray-400 hidden sm:inline">{language === 'fr' ? 'Catégorie:' : 'Category:'}</span>
                  <span className="px-1.5 py-0.5 bg-warm-gray-200 dark:bg-warm-gray-700 text-warm-gray-700 dark:text-warm-gray-300 font-medium rounded">{selectedPrompt.category}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-warm-gray-400 hidden sm:inline">{language === 'fr' ? 'Type:' : 'Type:'}</span>
                  <span className="px-1.5 py-0.5 bg-warm-gray-200 dark:bg-warm-gray-700 text-warm-gray-700 dark:text-warm-gray-300 font-medium rounded">{selectedPrompt.planType}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-warm-gray-400 hidden sm:inline">{language === 'fr' ? 'Langue:' : 'Lang:'}</span>
                  <span className="px-1.5 py-0.5 bg-warm-gray-200 dark:bg-warm-gray-700 text-warm-gray-700 dark:text-warm-gray-300 font-medium rounded uppercase">{selectedPrompt.language}</span>
                </div>
              </div>

              {/* Editor Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* System Prompt */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-warm-gray-500 mb-2">
                    <Code2 className="w-3.5 h-3.5" />
                    SYSTEM PROMPT
                  </label>
                  <textarea
                    value={editSystemPrompt}
                    onChange={e => setEditSystemPrompt(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-3 border border-warm-gray-200 dark:border-warm-gray-700 rounded-xl bg-warm-gray-50 dark:bg-warm-gray-800 text-warm-gray-900 dark:text-white font-mono text-sm leading-relaxed focus:ring-2 focus:ring-momentum-orange focus:border-transparent resize-y"
                    placeholder="Enter system prompt..."
                  />
                </div>

                {/* User Prompt Template */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-warm-gray-500 mb-2">
                    <MessageSquare className="w-3.5 h-3.5" />
                    USER PROMPT TEMPLATE
                    <span className="text-warm-gray-400 font-normal">
                      {language === 'fr' ? '(utilisez {variable} pour les variables)' : '(use {variable} for variables)'}
                    </span>
                  </label>
                  <textarea
                    value={editUserPromptTemplate}
                    onChange={e => setEditUserPromptTemplate(e.target.value)}
                    rows={12}
                    className="w-full px-4 py-3 border border-warm-gray-200 dark:border-warm-gray-700 rounded-xl bg-warm-gray-50 dark:bg-warm-gray-800 text-warm-gray-900 dark:text-white font-mono text-sm leading-relaxed focus:ring-2 focus:ring-momentum-orange focus:border-transparent resize-y"
                    placeholder="Enter user prompt template..."
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="flex items-center gap-2 text-xs font-medium text-warm-gray-500 mb-2">
                    <Edit3 className="w-3.5 h-3.5" />
                    NOTES
                  </label>
                  <textarea
                    value={editNotes}
                    onChange={e => setEditNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-warm-gray-200 dark:border-warm-gray-700 rounded-xl bg-warm-gray-50 dark:bg-warm-gray-800 text-warm-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-momentum-orange focus:border-transparent resize-y"
                    placeholder={language === 'fr' ? 'Notes optionnelles...' : 'Optional notes...'}
                  />
                </div>
              </div>
            </div>

            {/* Test Panel - hidden on mobile, resizable */}
            <ResizablePanel
              defaultWidth={420}
              minWidth={320}
              maxWidth={600}
              side="right"
              className="hidden lg:block border-l border-warm-gray-200 dark:border-warm-gray-800"
            >
              <div className="h-full flex flex-col bg-warm-gray-50 dark:bg-warm-gray-950">
              {/* Test Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-warm-gray-900 border-b border-warm-gray-200 dark:border-warm-gray-800">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br',
                    currentProvider.bgGradient
                  )}>
                    <ProviderIcon className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-warm-gray-900 dark:text-white">
                      {language === 'fr' ? 'Tester le Prompt' : 'Test Prompt'}
                    </h3>
                    <p className="text-xs text-warm-gray-500">{currentProvider.fullName}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    showSettings
                      ? 'bg-momentum-orange/10 text-momentum-orange'
                      : 'text-warm-gray-500 hover:bg-warm-gray-100 dark:hover:bg-warm-gray-800'
                  )}
                >
                  <Settings2 className="w-4 h-4" />
                </button>
              </div>

              {/* Section Context Indicator */}
              {selectedPrompt?.sectionName && (
                <div className="px-4 py-2 bg-purple-50 dark:bg-purple-900/20 border-b border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 text-xs">
                    <FileText className="w-3.5 h-3.5 text-purple-500" />
                    <span className="text-purple-600 dark:text-purple-400 font-medium">
                      {language === 'fr' ? 'Section ciblée:' : 'Testing for section:'}
                    </span>
                    <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-200 rounded font-medium">
                      {getSectionDisplayName(selectedPrompt.sectionName, language)}
                    </span>
                  </div>
                  <p className="text-[11px] text-purple-500 dark:text-purple-400 mt-1">
                    {language === 'fr'
                      ? 'Le test génèrera du contenu uniquement pour cette section'
                      : 'Test will generate content only for this section'}
                  </p>
                </div>
              )}

              {/* Provider & Model Selectors */}
              <div className="px-4 py-3 bg-white dark:bg-warm-gray-900 border-b border-warm-gray-200 dark:border-warm-gray-800 space-y-3">
                {/* Provider Selector */}
                <div className="relative">
                  <label className="block text-xs font-medium text-warm-gray-500 mb-1.5">
                    {language === 'fr' ? 'Fournisseur' : 'Provider'}
                  </label>
                  <button
                    onClick={() => setShowProviderDropdown(!showProviderDropdown)}
                    className="w-full flex items-center justify-between px-3 py-2 border border-warm-gray-200 dark:border-warm-gray-700 rounded-lg bg-warm-gray-50 dark:bg-warm-gray-800 text-sm text-warm-gray-900 dark:text-white hover:border-momentum-orange transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <ProviderIcon className="w-4 h-4" style={{ color: currentProvider.color }} />
                      <span>{currentProvider.name}</span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-warm-gray-400" />
                  </button>

                  <AnimatePresence>
                    {showProviderDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-warm-gray-900 border border-warm-gray-200 dark:border-warm-gray-700 rounded-lg shadow-lg z-20 overflow-hidden"
                      >
                        {AI_PROVIDERS.map(provider => {
                          const Icon = provider.icon;
                          return (
                            <button
                              key={provider.id}
                              onClick={() => handleProviderChange(provider.id)}
                              className={cn(
                                'w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors',
                                selectedProvider === provider.id
                                  ? 'bg-momentum-orange/10 text-momentum-orange'
                                  : 'text-warm-gray-700 dark:text-warm-gray-300 hover:bg-warm-gray-50 dark:hover:bg-warm-gray-800'
                              )}
                            >
                              <div className={cn(
                                'w-6 h-6 rounded-md flex items-center justify-center bg-gradient-to-br',
                                provider.bgGradient
                              )}>
                                <Icon className="w-3.5 h-3.5 text-white" />
                              </div>
                              <div className="text-left">
                                <div className="font-medium">{provider.name}</div>
                                <div className="text-xs text-warm-gray-400">{provider.fullName}</div>
                              </div>
                              {selectedProvider === provider.id && (
                                <Check className="w-4 h-4 ml-auto text-momentum-orange" />
                              )}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Model Selector */}
                <div className="relative">
                  <label className="block text-xs font-medium text-warm-gray-500 mb-1.5">
                    {language === 'fr' ? 'Modèle' : 'Model'}
                  </label>
                  <button
                    onClick={() => setShowModelDropdown(!showModelDropdown)}
                    className="w-full flex items-center justify-between px-3 py-2 border border-warm-gray-200 dark:border-warm-gray-700 rounded-lg bg-warm-gray-50 dark:bg-warm-gray-800 text-sm text-warm-gray-900 dark:text-white hover:border-momentum-orange transition-colors"
                  >
                    <span className="font-mono text-xs">{selectedModel}</span>
                    <ChevronDown className="w-4 h-4 text-warm-gray-400" />
                  </button>

                  <AnimatePresence>
                    {showModelDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-warm-gray-900 border border-warm-gray-200 dark:border-warm-gray-700 rounded-lg shadow-lg z-20 overflow-hidden"
                      >
                        {currentProvider.models.map(model => (
                          <button
                            key={model}
                            onClick={() => { setSelectedModel(model); setShowModelDropdown(false); }}
                            className={cn(
                              'w-full flex items-center justify-between px-3 py-2 text-sm font-mono transition-colors',
                              selectedModel === model
                                ? 'bg-momentum-orange/10 text-momentum-orange'
                                : 'text-warm-gray-700 dark:text-warm-gray-300 hover:bg-warm-gray-50 dark:hover:bg-warm-gray-800'
                            )}
                          >
                            <span className="text-xs">{model}</span>
                            {selectedModel === model && <Check className="w-4 h-4" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Settings Panel */}
                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-3 pt-2">
                        {/* Temperature */}
                        <div>
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-medium text-warm-gray-500">
                              Temperature
                            </label>
                            <span className="text-xs font-mono text-warm-gray-700 dark:text-warm-gray-300">
                              {testTemperature.toFixed(1)}
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={testTemperature}
                            onChange={e => setTestTemperature(parseFloat(e.target.value))}
                            className="w-full h-2 bg-warm-gray-200 dark:bg-warm-gray-700 rounded-lg appearance-none cursor-pointer accent-momentum-orange"
                          />
                          <div className="flex justify-between text-[10px] text-warm-gray-400 mt-1">
                            <span>{language === 'fr' ? 'Précis' : 'Precise'}</span>
                            <span>{language === 'fr' ? 'Créatif' : 'Creative'}</span>
                          </div>
                        </div>

                        {/* Max Tokens */}
                        <div>
                          <label className="block text-xs font-medium text-warm-gray-500 mb-1.5">
                            Max Tokens
                          </label>
                          <input
                            type="number"
                            min="100"
                            max="4000"
                            value={testMaxTokens}
                            onChange={e => setTestMaxTokens(parseInt(e.target.value) || 1000)}
                            className="w-full px-3 py-2 text-sm border border-warm-gray-200 dark:border-warm-gray-700 rounded-lg bg-warm-gray-50 dark:bg-warm-gray-800 text-warm-gray-900 dark:text-white focus:ring-2 focus:ring-momentum-orange focus:border-transparent"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Variables Input */}
              <div className="px-4 py-3 bg-white dark:bg-warm-gray-900 border-b border-warm-gray-200 dark:border-warm-gray-800">
                <label className="block text-xs font-medium text-warm-gray-500 mb-2">
                  {language === 'fr' ? 'Variables de test' : 'Test Variables'}
                </label>
                <VariableForm
                  systemPrompt={editSystemPrompt}
                  userPromptTemplate={editUserPromptTemplate}
                  value={testVariables}
                  onChange={setTestVariables}
                  compact
                />
              </div>

              {/* Run Button */}
              <div className="px-4 py-3 bg-white dark:bg-warm-gray-900 border-b border-warm-gray-200 dark:border-warm-gray-800">
                <button
                  onClick={handleTest}
                  disabled={testLoading}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-white transition-all',
                    testLoading
                      ? 'bg-warm-gray-400 cursor-not-allowed'
                      : `bg-gradient-to-r ${currentProvider.bgGradient} hover:opacity-90 shadow-lg shadow-${currentProvider.color}/20`
                  )}
                >
                  {testLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>{language === 'fr' ? 'Génération...' : 'Generating...'}</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5" />
                      <span>{language === 'fr' ? 'Exécuter le test' : 'Run Test'}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Output Area */}
              <div className="flex-1 overflow-y-auto p-4">
                {testResult ? (
                  <div className="space-y-3">
                    {/* Output Header */}
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-warm-gray-700 dark:text-warm-gray-300">
                        {language === 'fr' ? 'Résultat' : 'Output'}
                      </h4>
                      {!testResult.error && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-warm-gray-400">
                            {testResult.responseTime} • {testResult.tokensUsed} tokens
                          </span>
                          <button
                            onClick={handleCopyOutput}
                            className="p-1.5 text-warm-gray-400 hover:text-warm-gray-600 dark:hover:text-warm-gray-300 hover:bg-warm-gray-100 dark:hover:bg-warm-gray-800 rounded transition-colors"
                          >
                            {copiedOutput ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Output Content */}
                    {testResult.error ? (
                      <div className="p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-red-700 dark:text-red-300">
                              {language === 'fr' ? 'Erreur' : 'Error'}
                            </p>
                            <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                              {testResult.error}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white dark:bg-warm-gray-900 border border-warm-gray-200 dark:border-warm-gray-700 rounded-xl overflow-hidden">
                        <div className="p-4 max-h-[400px] overflow-y-auto">
                          <pre className="whitespace-pre-wrap text-sm text-warm-gray-800 dark:text-warm-gray-200 font-sans leading-relaxed">
                            {testResult.generatedOutput}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Test Info */}
                    <div className="flex items-center gap-2 text-xs text-warm-gray-400">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(testResult.testedAt).toLocaleString()}</span>
                      <span>•</span>
                      <span className="font-mono">{testResult.model}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 rounded-2xl bg-warm-gray-100 dark:bg-warm-gray-800 flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-warm-gray-300 dark:text-warm-gray-600" />
                    </div>
                    <p className="text-sm text-warm-gray-500 mb-2">
                      {language === 'fr'
                        ? 'Cliquez sur "Exécuter le test" pour voir les résultats'
                        : 'Click "Run Test" to see results'}
                    </p>
                    <p className="text-xs text-warm-gray-400">
                      {language === 'fr'
                        ? 'Remplissez les variables et ajustez les paramètres'
                        : 'Fill in the variables and adjust the settings'}
                    </p>
                  </div>
                )}
              </div>
              </div>
            </ResizablePanel>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-warm-gray-50 dark:bg-warm-gray-950">
            <div className="text-center">
              <div className="w-20 h-20 rounded-2xl bg-warm-gray-100 dark:bg-warm-gray-800 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-10 h-10 text-warm-gray-300 dark:text-warm-gray-600" />
              </div>
              <h3 className="text-lg font-medium text-warm-gray-700 dark:text-warm-gray-300 mb-2">
                {language === 'fr' ? 'Sélectionnez un prompt' : 'Select a prompt'}
              </h3>
              <p className="text-sm text-warm-gray-500 max-w-sm">
                {language === 'fr'
                  ? 'Choisissez un prompt dans la liste pour le modifier et le tester'
                  : 'Choose a prompt from the list to edit and test it'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// LIST VIEW COMPONENT
// ============================================
interface ListViewProps {
  prompts: AIPromptDto[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  filterCategory: string;
  setFilterCategory: (v: string) => void;
  filterPlanType: string;
  setFilterPlanType: (v: string) => void;
  filterLanguage: string;
  setFilterLanguage: (v: string) => void;
  filterActiveOnly: boolean;
  setFilterActiveOnly: (v: boolean) => void;
  selectPrompt: (p: AIPromptDto) => void;
  handleToggleActive: (p: AIPromptDto) => void;
  language: string;
}

function ListView({
  prompts,
  loading,
  searchTerm,
  setSearchTerm,
  filterCategory,
  setFilterCategory,
  filterPlanType,
  setFilterPlanType,
  filterLanguage,
  setFilterLanguage,
  filterActiveOnly,
  setFilterActiveOnly,
  selectPrompt,
  handleToggleActive,
  language,
}: ListViewProps) {
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto pb-24 md:pb-6">
      {/* Filters */}
      <div className="mb-4 sm:mb-6 bg-white dark:bg-warm-gray-900 rounded-xl shadow-sm border border-warm-gray-200 dark:border-warm-gray-800 p-3 sm:p-4">
        <div className="space-y-3 sm:space-y-0 sm:flex sm:flex-wrap sm:gap-4 sm:items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-0 sm:min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-gray-400" />
            <input
              type="text"
              placeholder={language === 'fr' ? 'Rechercher...' : 'Search prompts...'}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-warm-gray-200 dark:border-warm-gray-700 rounded-lg bg-white dark:bg-warm-gray-800 text-warm-gray-900 dark:text-white focus:ring-2 focus:ring-momentum-orange focus:border-transparent"
            />
          </div>

          {/* Filter row on mobile */}
          <div className="flex flex-wrap gap-2 sm:contents">
            <select
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              className="flex-1 min-w-[120px] px-3 py-2 text-sm border border-warm-gray-200 dark:border-warm-gray-700 rounded-lg bg-white dark:bg-warm-gray-800 text-warm-gray-900 dark:text-white"
            >
              <option value="">{language === 'fr' ? 'Catégorie' : 'Category'}</option>
              {AI_PROMPT_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            <select
              value={filterPlanType}
              onChange={e => setFilterPlanType(e.target.value)}
              className="flex-1 min-w-[100px] px-3 py-2 text-sm border border-warm-gray-200 dark:border-warm-gray-700 rounded-lg bg-white dark:bg-warm-gray-800 text-warm-gray-900 dark:text-white"
            >
              <option value="">{language === 'fr' ? 'Type' : 'Type'}</option>
              {PLAN_TYPES.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            <select
              value={filterLanguage}
              onChange={e => setFilterLanguage(e.target.value)}
              className="flex-1 min-w-[80px] px-3 py-2 text-sm border border-warm-gray-200 dark:border-warm-gray-700 rounded-lg bg-white dark:bg-warm-gray-800 text-warm-gray-900 dark:text-white"
            >
              <option value="">{language === 'fr' ? 'Langue' : 'Lang'}</option>
              {LANGUAGES.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filterActiveOnly}
              onChange={e => setFilterActiveOnly(e.target.checked)}
              className="w-4 h-4 text-momentum-orange rounded border-warm-gray-300 focus:ring-momentum-orange"
            />
            <span className="text-sm text-warm-gray-700 dark:text-warm-gray-300 whitespace-nowrap">
              {language === 'fr' ? 'Actifs' : 'Active'}
            </span>
          </label>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-momentum-orange" />
        </div>
      ) : prompts.length === 0 ? (
        <div className="text-center py-16">
          <Database className="w-16 h-16 mx-auto text-warm-gray-300 dark:text-warm-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-warm-gray-700 dark:text-warm-gray-300 mb-2">
            {language === 'fr' ? 'Aucun prompt trouvé' : 'No prompts found'}
          </h3>
          <p className="text-sm text-warm-gray-500">
            {language === 'fr' ? 'Essayez de modifier vos filtres' : 'Try adjusting your filters'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {prompts.map(prompt => {
            const sectionColor = getColorForSection(prompt.sectionName);
            return (
              <motion.div
                key={prompt.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group bg-white dark:bg-warm-gray-900 rounded-xl shadow-sm border border-warm-gray-200 dark:border-warm-gray-800 p-4 hover:shadow-md hover:border-momentum-orange/50 transition-all cursor-pointer"
                onClick={() => selectPrompt(prompt)}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {prompt.sectionName && (
                        <span className={cn(
                          'px-2 py-0.5 text-xs font-medium rounded-lg border',
                          sectionColor.bg, sectionColor.text, sectionColor.border
                        )}>
                          {getSectionDisplayName(prompt.sectionName, language)}
                        </span>
                      )}
                      <span className={cn(
                        'w-2 h-2 rounded-full',
                        prompt.isActive ? 'bg-green-500' : 'bg-warm-gray-300'
                      )} />
                    </div>
                    <h3 className="font-medium text-warm-gray-900 dark:text-white truncate group-hover:text-momentum-orange transition-colors">
                      {prompt.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-warm-gray-500 dark:text-warm-gray-400 mt-1">
                      <span className="uppercase">{prompt.language}</span>
                      <span>•</span>
                      <span>{prompt.planType}</span>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-warm-gray-500 dark:text-warm-gray-400 mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{formatTimeAgo(prompt.updatedAt)}</span>
                  </div>
                  <span>v{prompt.version}</span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); selectPrompt(prompt); }}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm bg-momentum-orange text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    <Edit3 className="w-3 h-3" />
                    {language === 'fr' ? 'Modifier' : 'Edit'}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleActive(prompt); }}
                    className="p-1.5 text-warm-gray-600 dark:text-warm-gray-400 hover:text-momentum-orange hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                    title={prompt.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {prompt.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminPromptRegistryPage;
