import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Database,
  Search,
  X,
  Save,
  Clock,
  Star,
  Edit3,
  Play,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  History,
  CheckCircle,
  RotateCcw,
  Eye,
  EyeOff,
  BookOpen,
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
} from '../../types/ai-prompt';
import VariableForm from '../../components/admin/VariableForm';

// Section colors for badges
const SECTION_COLORS: Record<string, { bg: string; text: string }> = {
  'ExecutiveSummary': { bg: 'bg-orange-100 dark:bg-orange-900', text: 'text-orange-700 dark:text-orange-200' },
  'MarketAnalysis': { bg: 'bg-purple-100 dark:bg-purple-900', text: 'text-purple-700 dark:text-purple-200' },
  'FinancialProjections': { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-700 dark:text-green-200' },
  'CompetitiveAnalysis': { bg: 'bg-blue-100 dark:bg-blue-900', text: 'text-blue-700 dark:text-blue-200' },
  'OperationsPlan': { bg: 'bg-cyan-100 dark:bg-cyan-900', text: 'text-cyan-700 dark:text-cyan-200' },
  'ManagementTeam': { bg: 'bg-amber-100 dark:bg-amber-900', text: 'text-amber-700 dark:text-amber-200' },
  'RiskAnalysis': { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-700 dark:text-red-200' },
  'MarketingStrategy': { bg: 'bg-pink-100 dark:bg-pink-900', text: 'text-pink-700 dark:text-pink-200' },
};

const getColorForSection = (sectionName?: string) => {
  if (!sectionName) return { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-200' };
  return SECTION_COLORS[sectionName] || { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-200' };
};

const formatTimeAgo = (date?: string): string => {
  if (!date) return 'Never';
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

const AdminPromptRegistryPage: React.FC = () => {
  // State
  const [prompts, setPrompts] = useState<AIPromptDto[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<AIPromptDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 12;

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('');
  const [filterPlanType, setFilterPlanType] = useState<string>('');
  const [filterLanguage, setFilterLanguage] = useState<string>('');
  const [filterActiveOnly, setFilterActiveOnly] = useState<boolean>(false);

  // Panels
  const [showEditorPanel, setShowEditorPanel] = useState(false);
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<AIPromptDto | null>(null);

  // Editor form state
  const [editSystemPrompt, setEditSystemPrompt] = useState('');
  const [editUserPromptTemplate, setEditUserPromptTemplate] = useState('');
  const [editVariables, setEditVariables] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Test state
  const [testVariables, setTestVariables] = useState('{}');
  const [testMaxTokens, setTestMaxTokens] = useState(1000);
  const [testTemperature, setTestTemperature] = useState(0.7);
  const [testResult, setTestResult] = useState<AIPromptTestResult | null>(null);
  const [testLoading, setTestLoading] = useState(false);

  // Version history state
  const [versionHistory, setVersionHistory] = useState<AIPromptVersionDto[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

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
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'load'));
      console.error('Error loading prompts:', err);
    } finally {
      setLoading(false);
    }
  }, [filterCategory, filterPlanType, filterLanguage, filterActiveOnly]);

  // Filter and search prompts client-side
  useEffect(() => {
    let filtered = [...prompts];

    // Search
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
    setCurrentPage(1);
  }, [prompts, searchTerm]);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  // Pagination
  const totalPages = Math.ceil(filteredPrompts.length / pageSize);
  const paginatedPrompts = filteredPrompts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Handlers
  const openEditorPanel = (prompt: AIPromptDto) => {
    setSelectedPrompt(prompt);
    setEditSystemPrompt(prompt.systemPrompt);
    setEditUserPromptTemplate(prompt.userPromptTemplate);
    setEditVariables(prompt.variables || '{}');
    setEditNotes(prompt.notes || '');
    setShowEditorPanel(true);
  };

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
      setSuccessMessage('Prompt saved successfully! A version snapshot was created.');
      setTimeout(() => setSuccessMessage(null), 3000);
      setShowEditorPanel(false);
      loadPrompts();
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'save'));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (prompt: AIPromptDto) => {
    try {
      await aiPromptService.toggleStatus(prompt.id, !prompt.isActive);
      loadPrompts();
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'save'));
    }
  };

  const openTestPanel = (prompt: AIPromptDto) => {
    setSelectedPrompt(prompt);
    setEditSystemPrompt(prompt.systemPrompt);
    setEditUserPromptTemplate(prompt.userPromptTemplate);
    setTestResult(null);
    setShowTestPanel(true);
  };

  const handleTest = async () => {
    if (!selectedPrompt) return;
    setTestLoading(true);
    setTestResult(null);
    try {
      const result = await aiPromptService.test({
        promptId: selectedPrompt.id,
        sampleVariables: testVariables,
        maxTokens: testMaxTokens,
        temperature: testTemperature,
      });
      setTestResult(result);
    } catch (err: any) {
      setTestResult({
        promptId: selectedPrompt.id,
        testInput: testVariables,
        generatedOutput: '',
        tokensUsed: 0,
        temperature: testTemperature,
        testedAt: new Date().toISOString(),
        model: 'unknown',
        responseTime: '0s',
        error: getUserFriendlyError(err, 'ai'),
      });
    } finally {
      setTestLoading(false);
    }
  };

  const handleTestDraft = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      const result = await aiPromptService.testDraft({
        systemPrompt: editSystemPrompt,
        userPromptTemplate: editUserPromptTemplate,
        sampleVariables: testVariables,
        maxTokens: testMaxTokens,
        temperature: testTemperature,
      });
      setTestResult(result);
    } catch (err: any) {
      setTestResult({
        promptId: 'draft',
        testInput: testVariables,
        generatedOutput: '',
        tokensUsed: 0,
        temperature: testTemperature,
        testedAt: new Date().toISOString(),
        model: 'unknown',
        responseTime: '0s',
        error: getUserFriendlyError(err, 'ai'),
      });
    } finally {
      setTestLoading(false);
    }
  };

  const openHistoryPanel = async (prompt: AIPromptDto) => {
    setSelectedPrompt(prompt);
    setHistoryLoading(true);
    setShowHistoryPanel(true);
    try {
      const history = await aiPromptService.getVersionHistory(prompt.id);
      setVersionHistory(history);
    } catch (err: any) {
      console.error('Error loading version history:', err);
      setVersionHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleRollback = async (version: AIPromptVersionDto) => {
    if (!selectedPrompt) return;
    try {
      await aiPromptService.rollback(selectedPrompt.id, {
        targetVersion: version.version,
        notes: `Rolled back to version ${version.version}`,
      });
      setSuccessMessage(`Successfully rolled back to version ${version.version}`);
      setTimeout(() => setSuccessMessage(null), 3000);
      setShowHistoryPanel(false);
      loadPrompts();
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'save'));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Database className="w-8 h-8 text-orange-500" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Prompt Registry</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage AI prompts for business plan generation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/admin/prompt-registry/docs"
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
            >
              <BookOpen className="w-4 h-4" />
              <span>Documentation</span>
            </Link>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {filteredPrompts.length} prompts
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-300">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-2 text-green-700 dark:text-green-300">
          <CheckCircle className="w-5 h-5" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4">
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Category filter */}
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">All Categories</option>
            {AI_PROMPT_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Plan type filter */}
          <select
            value={filterPlanType}
            onChange={e => setFilterPlanType(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">All Plan Types</option>
            {PLAN_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Language filter */}
          <select
            value={filterLanguage}
            onChange={e => setFilterLanguage(e.target.value)}
            className="px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="">All Languages</option>
            {LANGUAGES.map(lang => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>

          {/* Active filter */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={filterActiveOnly}
              onChange={e => setFilterActiveOnly(e.target.checked)}
              className="w-4 h-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Active only</span>
          </label>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {paginatedPrompts.map(prompt => {
              const sectionColor = getColorForSection(prompt.sectionName);
              return (
                <div
                  key={prompt.id}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {prompt.sectionName && (
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${sectionColor.bg} ${sectionColor.text}`}>
                            {prompt.sectionName}
                          </span>
                        )}
                        <span className={`w-2 h-2 rounded-full ${prompt.isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                      </div>
                      <h3 className="font-medium text-gray-900 dark:text-white truncate">
                        {prompt.name}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span className="uppercase">{prompt.language}</span>
                        <span>•</span>
                        <span>{prompt.planType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(prompt.updatedAt)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      <span>{prompt.averageRating.toFixed(1)}</span>
                    </div>
                    <span>v{prompt.version}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditorPanel(prompt)}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </button>
                    <button
                      onClick={() => openTestPanel(prompt)}
                      className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                      title="Test prompt"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => openHistoryPanel(prompt)}
                      className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                      title="Version history"
                    >
                      <History className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(prompt)}
                      className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                      title={prompt.isActive ? 'Deactivate' : 'Activate'}
                    >
                      {prompt.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Editor Panel */}
      {showEditorPanel && selectedPrompt && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowEditorPanel(false)} />
          <div className="relative w-full max-w-3xl bg-white dark:bg-gray-900 shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Edit Prompt</h2>
                <p className="text-sm text-gray-500">{selectedPrompt.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
                <button
                  onClick={() => setShowEditorPanel(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Metadata */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Category</div>
                  <div className="font-medium text-gray-900 dark:text-white">{selectedPrompt.category}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Plan Type</div>
                  <div className="font-medium text-gray-900 dark:text-white">{selectedPrompt.planType}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Language</div>
                  <div className="font-medium text-gray-900 dark:text-white uppercase">{selectedPrompt.language}</div>
                </div>
              </div>

              {/* System Prompt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  System Prompt
                </label>
                <textarea
                  value={editSystemPrompt}
                  onChange={e => setEditSystemPrompt(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* User Prompt Template */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  User Prompt Template
                  <span className="ml-2 text-xs text-gray-400">Use {'{variableName}'} for variables</span>
                </label>
                <textarea
                  value={editUserPromptTemplate}
                  onChange={e => setEditUserPromptTemplate(e.target.value)}
                  rows={10}
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  rows={3}
                  placeholder="Optional notes about this prompt..."
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              {/* Test Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Test Before Saving</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-2">Test Variables</label>
                    <VariableForm
                      systemPrompt={editSystemPrompt}
                      userPromptTemplate={editUserPromptTemplate}
                      value={testVariables}
                      onChange={setTestVariables}
                      compact
                    />
                  </div>
                  <div className="flex items-center gap-4 pt-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Temperature</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.1"
                          value={testTemperature}
                          onChange={e => setTestTemperature(parseFloat(e.target.value))}
                          className="w-24"
                        />
                        <span className="text-xs text-gray-600 dark:text-gray-400 w-8">{testTemperature}</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Max Tokens</label>
                      <input
                        type="number"
                        min="100"
                        max="4000"
                        value={testMaxTokens}
                        onChange={e => setTestMaxTokens(parseInt(e.target.value))}
                        className="w-20 px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-xs bg-white dark:bg-gray-800"
                      />
                    </div>
                    <button
                      onClick={handleTestDraft}
                      disabled={testLoading}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
                    >
                      {testLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                      Test Draft
                    </button>
                  </div>
                  {testResult && (
                    <div className={`p-4 rounded-lg ${testResult.error ? 'bg-red-50 dark:bg-red-900/30' : 'bg-green-50 dark:bg-green-900/30'}`}>
                      {testResult.error ? (
                        <p className="text-red-700 dark:text-red-300">{testResult.error}</p>
                      ) : (
                        <div>
                          <div className="text-xs text-gray-500 mb-2">Generated Output ({testResult.responseTime})</div>
                          <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white max-h-96 overflow-y-auto">
                            {testResult.generatedOutput}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test Panel (standalone) */}
      {showTestPanel && selectedPrompt && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowTestPanel(false)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Test Prompt</h2>
                <p className="text-sm text-gray-500">{selectedPrompt.name}</p>
              </div>
              <button
                onClick={() => setShowTestPanel(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Test Variables
                </label>
                <VariableForm
                  systemPrompt={editSystemPrompt}
                  userPromptTemplate={editUserPromptTemplate}
                  value={testVariables}
                  onChange={setTestVariables}
                />
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1">Temperature: {testTemperature}</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={testTemperature}
                    onChange={e => setTestTemperature(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div className="w-24">
                  <label className="block text-xs text-gray-500 mb-1">Max Tokens</label>
                  <input
                    type="number"
                    min="100"
                    max="4000"
                    value={testMaxTokens}
                    onChange={e => setTestMaxTokens(parseInt(e.target.value))}
                    className="w-full px-2 py-1 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900"
                  />
                </div>
              </div>

              <button
                onClick={handleTest}
                disabled={testLoading}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 transition-colors"
              >
                {testLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                Run Test
              </button>

              {testResult && (
                <div className={`p-4 rounded-lg ${testResult.error ? 'bg-red-50 dark:bg-red-900/30 border border-red-200' : 'bg-gray-50 dark:bg-gray-800'}`}>
                  {testResult.error ? (
                    <div className="flex items-start gap-2 text-red-700 dark:text-red-300">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p>{testResult.error}</p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>Response Time: {testResult.responseTime}</span>
                        <span>Tokens: {testResult.tokensUsed}</span>
                      </div>
                      <pre className="whitespace-pre-wrap text-sm text-gray-900 dark:text-white max-h-96 overflow-y-auto bg-white dark:bg-gray-900 p-4 rounded border border-gray-200 dark:border-gray-700">
                        {testResult.generatedOutput}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History Panel */}
      {showHistoryPanel && selectedPrompt && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowHistoryPanel(false)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-gray-900 shadow-xl overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Version History</h2>
                <p className="text-sm text-gray-500">{selectedPrompt.name}</p>
              </div>
              <button
                onClick={() => setShowHistoryPanel(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {historyLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                </div>
              ) : versionHistory.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No version history yet</p>
                  <p className="text-sm">Versions are saved automatically when you edit a prompt</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {versionHistory.map(version => (
                    <div
                      key={version.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-200 text-sm font-medium rounded">
                            v{version.version}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(version.changedAt).toLocaleString()}
                          </span>
                          {version.changedBy && (
                            <span className="text-xs text-gray-400">by {version.changedBy}</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleRollback(version)}
                          className="flex items-center gap-1 px-3 py-1.5 text-sm border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Rollback
                        </button>
                      </div>
                      {version.notes && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{version.notes}</p>
                      )}
                      <details className="text-sm">
                        <summary className="cursor-pointer text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                          View content
                        </summary>
                        <div className="mt-2 space-y-2">
                          <div>
                            <div className="text-xs text-gray-400 mb-1">System Prompt</div>
                            <pre className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs max-h-32 overflow-y-auto">
                              {version.systemPrompt}
                            </pre>
                          </div>
                          <div>
                            <div className="text-xs text-gray-400 mb-1">User Prompt Template</div>
                            <pre className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-xs max-h-32 overflow-y-auto">
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
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromptRegistryPage;
