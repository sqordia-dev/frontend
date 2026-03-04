import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  MessageSquare,
  Search,
  Loader2,
  Sparkles,
  Lightbulb,
  Save,
  ChevronDown,
  HelpCircle,
  Play,
  Copy,
  Check,
  AlertCircle,
  Settings2,
  Brain,
  Zap,
  ChevronUp,
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { adminQuestionTemplateService, type TestCoachPromptResponse } from '../../../lib/admin-question-template-service';
import { MonacoPromptEditor } from '../../../components/admin/prompt-registry';
import { cn } from '../../../lib/utils';
import type { AdminQuestionTemplate } from '../../../types/admin-question-template';
import { STEP_DEFINITIONS } from '../../../types/admin-question-template';

// AI Provider options for testing
const AI_PROVIDERS = [
  { id: 'openai', name: 'OpenAI', icon: Sparkles, color: 'from-emerald-500 to-teal-600' },
  { id: 'claude', name: 'Claude', icon: Brain, color: 'from-amber-500 to-orange-600' },
  { id: 'gemini', name: 'Gemini', icon: Zap, color: 'from-blue-500 to-indigo-600' },
];

type LanguageTab = 'fr' | 'en';
type ContentTab = 'coachPrompt' | 'expertTip';

export function AIStudioQuestionsPage() {
  const { language: uiLanguage } = useTheme();
  const [questions, setQuestions] = useState<AdminQuestionTemplate[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<AdminQuestionTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [languageTab, setLanguageTab] = useState<LanguageTab>('fr');
  const [contentTab, setContentTab] = useState<ContentTab>('coachPrompt');

  // Editable content
  const [coachPromptFR, setCoachPromptFR] = useState('');
  const [coachPromptEN, setCoachPromptEN] = useState('');
  const [expertAdviceFR, setExpertAdviceFR] = useState('');
  const [expertAdviceEN, setExpertAdviceEN] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Testing state
  const [showTestPanel, setShowTestPanel] = useState(false);
  const [testAnswer, setTestAnswer] = useState('');
  const [testLanguage, setTestLanguage] = useState<'fr' | 'en'>('fr');
  const [testProvider, setTestProvider] = useState('openai');
  const [testResult, setTestResult] = useState<TestCoachPromptResponse | null>(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);
  const [copiedOutput, setCopiedOutput] = useState(false);
  const [showTestSettings, setShowTestSettings] = useState(false);
  const [testMaxTokens, setTestMaxTokens] = useState(500);
  const [testTemperature, setTestTemperature] = useState(0.7);

  const t = {
    title: uiLanguage === 'fr' ? 'Prompts Questions' : 'Question Prompts',
    subtitle: uiLanguage === 'fr'
      ? 'Gérez les prompts IA et conseils d\'expert pour chaque question'
      : 'Manage AI coach prompts and expert tips for each question',
    back: uiLanguage === 'fr' ? 'Retour à AI Studio' : 'Back to AI Studio',
    search: uiLanguage === 'fr' ? 'Rechercher...' : 'Search questions...',
    coachPrompt: uiLanguage === 'fr' ? 'Prompt IA' : 'AI Coach Prompt',
    expertTip: uiLanguage === 'fr' ? 'Conseil d\'expert' : 'Expert Tip',
    french: 'Français',
    english: 'English',
    save: uiLanguage === 'fr' ? 'Sauvegarder' : 'Save',
    saving: uiLanguage === 'fr' ? 'Sauvegarde...' : 'Saving...',
    step: uiLanguage === 'fr' ? 'Étape' : 'Step',
    required: uiLanguage === 'fr' ? 'Requis' : 'Required',
    optional: uiLanguage === 'fr' ? 'Optionnel' : 'Optional',
    selectQuestion: uiLanguage === 'fr' ? 'Sélectionnez une question' : 'Select a question',
    noPrompt: uiLanguage === 'fr' ? 'Aucun prompt défini' : 'No prompt defined',
    noExpertTip: uiLanguage === 'fr' ? 'Aucun conseil défini' : 'No expert tip defined',
    testPrompt: uiLanguage === 'fr' ? 'Tester le prompt' : 'Test Prompt',
    hideTest: uiLanguage === 'fr' ? 'Masquer le test' : 'Hide Test',
    testAnswer: uiLanguage === 'fr' ? 'Réponse de test' : 'Test Answer',
    testAnswerPlaceholder: uiLanguage === 'fr' ? 'Entrez une réponse pour tester le prompt IA...' : 'Enter an answer to test the AI prompt...',
    runTest: uiLanguage === 'fr' ? 'Exécuter le test' : 'Run Test',
    testing: uiLanguage === 'fr' ? 'Test en cours...' : 'Testing...',
    testOutput: uiLanguage === 'fr' ? 'Sortie du coach IA' : 'AI Coach Output',
    tokens: uiLanguage === 'fr' ? 'Tokens' : 'Tokens',
    responseTime: uiLanguage === 'fr' ? 'Temps' : 'Time',
    copy: uiLanguage === 'fr' ? 'Copier' : 'Copy',
    copied: uiLanguage === 'fr' ? 'Copié!' : 'Copied!',
    settings: uiLanguage === 'fr' ? 'Paramètres' : 'Settings',
    maxTokens: uiLanguage === 'fr' ? 'Max Tokens' : 'Max Tokens',
    temperature: uiLanguage === 'fr' ? 'Température' : 'Temperature',
    provider: uiLanguage === 'fr' ? 'Fournisseur IA' : 'AI Provider',
    noCoachPrompt: uiLanguage === 'fr' ? 'Aucun prompt coach défini pour cette langue' : 'No coach prompt defined for this language',
    testInLanguage: uiLanguage === 'fr' ? 'Langue du test' : 'Test Language',
  };

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const data = await adminQuestionTemplateService.getAll({ isActive: true });
      const sorted = data.sort((a, b) => {
        if (a.stepNumber !== b.stepNumber) return a.stepNumber - b.stepNumber;
        return a.order - b.order;
      });
      setQuestions(sorted);
    } catch (err) {
      console.error('Error loading questions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedQuestion) {
      setCoachPromptFR(selectedQuestion.coachPromptFR || '');
      setCoachPromptEN(selectedQuestion.coachPromptEN || '');
      setExpertAdviceFR(selectedQuestion.expertAdviceFR || '');
      setExpertAdviceEN(selectedQuestion.expertAdviceEN || '');
      setHasChanges(false);
    }
  }, [selectedQuestion]);

  useEffect(() => {
    if (selectedQuestion) {
      const changed =
        coachPromptFR !== (selectedQuestion.coachPromptFR || '') ||
        coachPromptEN !== (selectedQuestion.coachPromptEN || '') ||
        expertAdviceFR !== (selectedQuestion.expertAdviceFR || '') ||
        expertAdviceEN !== (selectedQuestion.expertAdviceEN || '');
      setHasChanges(changed);
    }
  }, [coachPromptFR, coachPromptEN, expertAdviceFR, expertAdviceEN, selectedQuestion]);

  const handleSave = async () => {
    if (!selectedQuestion || !hasChanges) return;
    setSaving(true);
    try {
      await adminQuestionTemplateService.update(selectedQuestion.id, {
        coachPromptFR: coachPromptFR || undefined,
        coachPromptEN: coachPromptEN || undefined,
        expertAdviceFR: expertAdviceFR || undefined,
        expertAdviceEN: expertAdviceEN || undefined,
      });
      setSelectedQuestion({
        ...selectedQuestion,
        coachPromptFR,
        coachPromptEN,
        expertAdviceFR,
        expertAdviceEN,
      });
      setHasChanges(false);
    } catch (err) {
      console.error('Error saving:', err);
    } finally {
      setSaving(false);
    }
  };

  // Reset test state when selected question changes
  useEffect(() => {
    setTestResult(null);
    setTestError(null);
    setTestAnswer('');
  }, [selectedQuestion?.id]);

  const handleRunTest = async () => {
    if (!selectedQuestion || !testAnswer.trim()) return;

    // Check if coach prompt exists for the selected language
    const prompt = testLanguage === 'fr' ? coachPromptFR : coachPromptEN;
    if (!prompt) {
      setTestError(t.noCoachPrompt);
      return;
    }

    setTestLoading(true);
    setTestError(null);
    setTestResult(null);

    try {
      const result = await adminQuestionTemplateService.testCoachPrompt(selectedQuestion.id, {
        answer: testAnswer,
        language: testLanguage,
        provider: testProvider,
        maxTokens: testMaxTokens,
        temperature: testTemperature,
      });
      setTestResult(result);
    } catch (err: any) {
      console.error('Error testing prompt:', err);
      setTestError(err.message || 'Failed to test prompt');
    } finally {
      setTestLoading(false);
    }
  };

  const handleCopyOutput = () => {
    if (testResult?.output) {
      navigator.clipboard.writeText(testResult.output);
      setCopiedOutput(true);
      setTimeout(() => setCopiedOutput(false), 2000);
    }
  };

  const canRunTest = selectedQuestion && testAnswer.trim() &&
    (testLanguage === 'fr' ? coachPromptFR : coachPromptEN);

  const filteredQuestions = questions.filter(q => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      q.questionText.toLowerCase().includes(query) ||
      (q.questionTextEN?.toLowerCase().includes(query))
    );
  });

  const groupedQuestions = filteredQuestions.reduce((acc, q) => {
    const step = q.stepNumber;
    if (!acc[step]) acc[step] = [];
    acc[step].push(q);
    return acc;
  }, {} as Record<number, AdminQuestionTemplate[]>);

  const getStepLabel = (stepNumber: number) => {
    const step = STEP_DEFINITIONS.find(s => s.number === stepNumber);
    if (!step) return `${t.step} ${stepNumber}`;
    return uiLanguage === 'fr' ? step.labelFR : step.label;
  };

  const getCurrentContent = () => {
    if (contentTab === 'coachPrompt') {
      return languageTab === 'fr' ? coachPromptFR : coachPromptEN;
    }
    return languageTab === 'fr' ? expertAdviceFR : expertAdviceEN;
  };

  const setCurrentContent = (value: string) => {
    if (contentTab === 'coachPrompt') {
      if (languageTab === 'fr') setCoachPromptFR(value);
      else setCoachPromptEN(value);
    } else {
      if (languageTab === 'fr') setExpertAdviceFR(value);
      else setExpertAdviceEN(value);
    }
  };

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
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/admin/ai-studio"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{t.title}</h1>
              <p className="text-slate-400 mt-1">{t.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
              <span className="text-sm font-medium text-purple-400">
                {questions.length} {uiLanguage === 'fr' ? 'questions' : 'questions'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div>
        <div className="flex gap-6 h-[calc(100vh-200px)]">
          {/* Left: Question List */}
          <div className="w-80 flex-shrink-0 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden">
            {/* Search */}
            <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.search}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                />
              </div>
            </div>

            {/* Question List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                </div>
              ) : (
                <div className="p-2 space-y-4">
                  {Object.entries(groupedQuestions).map(([stepNum, stepQuestions]) => (
                    <div key={stepNum}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                        {t.step} {stepNum}: {getStepLabel(Number(stepNum))}
                      </div>
                      <div className="space-y-1">
                        {stepQuestions.map((q) => (
                          <button
                            key={q.id}
                            onClick={() => setSelectedQuestion(q)}
                            className={cn(
                              'w-full text-left px-3 py-2 rounded-lg transition-colors',
                              'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                              selectedQuestion?.id === q.id && 'bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-800'
                            )}
                          >
                            <div className="flex items-start gap-2">
                              <span className="flex-shrink-0 w-5 h-5 rounded bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-300">
                                {q.order}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm text-zinc-700 dark:text-zinc-300 line-clamp-2">
                                  {uiLanguage === 'fr' ? q.questionText : (q.questionTextEN || q.questionText)}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  {q.coachPromptFR && (
                                    <span className="inline-flex items-center gap-0.5 text-[10px] text-purple-600 dark:text-purple-400">
                                      <Sparkles className="w-2.5 h-2.5" />
                                      AI
                                    </span>
                                  )}
                                  {q.expertAdviceFR && (
                                    <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-600 dark:text-amber-400">
                                      <Lightbulb className="w-2.5 h-2.5" />
                                      Tip
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Editor */}
          <div className="flex-1 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 flex flex-col overflow-hidden">
            {selectedQuestion ? (
              <>
                {/* Question Info */}
                <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded">
                          {t.step} {selectedQuestion.stepNumber}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-medium bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 rounded">
                          {selectedQuestion.questionType}
                        </span>
                      </div>
                      <h3 className="text-base font-medium text-zinc-900 dark:text-white">
                        {uiLanguage === 'fr' ? selectedQuestion.questionText : (selectedQuestion.questionTextEN || selectedQuestion.questionText)}
                      </h3>
                      {selectedQuestion.helpText && (
                        <p className="text-xs text-zinc-500 mt-1 flex items-start gap-1">
                          <HelpCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {uiLanguage === 'fr' ? selectedQuestion.helpText : (selectedQuestion.helpTextEN || selectedQuestion.helpText)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleSave}
                      disabled={!hasChanges || saving}
                      className={cn(
                        'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
                        hasChanges
                          ? 'bg-purple-600 hover:bg-purple-700 text-white'
                          : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 cursor-not-allowed'
                      )}
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {saving ? t.saving : t.save}
                    </button>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                    <button
                      onClick={() => setContentTab('coachPrompt')}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                        contentTab === 'coachPrompt'
                          ? 'bg-white dark:bg-zinc-700 text-purple-600 dark:text-purple-400 shadow-sm'
                          : 'text-zinc-600 dark:text-zinc-400'
                      )}
                    >
                      <Sparkles className="w-4 h-4" />
                      {t.coachPrompt}
                    </button>
                    <button
                      onClick={() => setContentTab('expertTip')}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                        contentTab === 'expertTip'
                          ? 'bg-white dark:bg-zinc-700 text-amber-600 dark:text-amber-400 shadow-sm'
                          : 'text-zinc-600 dark:text-zinc-400'
                      )}
                    >
                      <Lightbulb className="w-4 h-4" />
                      {t.expertTip}
                    </button>
                  </div>

                  <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                    <button
                      onClick={() => setLanguageTab('fr')}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                        languageTab === 'fr' ? 'bg-white dark:bg-zinc-700 shadow-sm' : ''
                      )}
                    >
                      🇫🇷 {t.french}
                    </button>
                    <button
                      onClick={() => setLanguageTab('en')}
                      className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                        languageTab === 'en' ? 'bg-white dark:bg-zinc-700 shadow-sm' : ''
                      )}
                    >
                      🇬🇧 {t.english}
                    </button>
                  </div>
                </div>

                {/* Editor + Test Panel */}
                <div className="flex-1 flex flex-col overflow-hidden">
                  {/* Editor */}
                  <div className={cn(
                    'p-4 overflow-hidden transition-all',
                    showTestPanel && contentTab === 'coachPrompt' ? 'flex-1' : 'flex-1'
                  )}>
                    <div className="h-full rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                      <MonacoPromptEditor
                        value={getCurrentContent()}
                        onChange={setCurrentContent}
                        minHeight={showTestPanel && contentTab === 'coachPrompt' ? 150 : 300}
                        maxHeight={showTestPanel && contentTab === 'coachPrompt' ? 300 : 800}
                        placeholder={contentTab === 'coachPrompt' ? t.noPrompt : t.noExpertTip}
                      />
                    </div>
                  </div>

                  {/* Test Panel - Only for Coach Prompt */}
                  {contentTab === 'coachPrompt' && (
                    <div className="border-t border-zinc-200 dark:border-zinc-800">
                      {/* Toggle Button */}
                      <button
                        onClick={() => setShowTestPanel(!showTestPanel)}
                        className="w-full flex items-center justify-between px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Play className="w-4 h-4 text-purple-500" />
                          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                            {showTestPanel ? t.hideTest : t.testPrompt}
                          </span>
                        </div>
                        {showTestPanel ? (
                          <ChevronDown className="w-4 h-4 text-zinc-400" />
                        ) : (
                          <ChevronUp className="w-4 h-4 text-zinc-400" />
                        )}
                      </button>

                      {/* Test Panel Content */}
                      <AnimatePresence>
                        {showTestPanel && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 space-y-4">
                              {/* Test Settings Row */}
                              <div className="flex items-center gap-3">
                                {/* Language Toggle */}
                                <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                                  <button
                                    onClick={() => setTestLanguage('fr')}
                                    className={cn(
                                      'px-2 py-1 text-xs font-medium rounded transition-colors',
                                      testLanguage === 'fr' ? 'bg-white dark:bg-zinc-700 shadow-sm' : ''
                                    )}
                                  >
                                    🇫🇷 FR
                                  </button>
                                  <button
                                    onClick={() => setTestLanguage('en')}
                                    className={cn(
                                      'px-2 py-1 text-xs font-medium rounded transition-colors',
                                      testLanguage === 'en' ? 'bg-white dark:bg-zinc-700 shadow-sm' : ''
                                    )}
                                  >
                                    🇬🇧 EN
                                  </button>
                                </div>

                                {/* Provider Selector */}
                                <div className="flex items-center gap-1">
                                  {AI_PROVIDERS.map(p => {
                                    const Icon = p.icon;
                                    return (
                                      <button
                                        key={p.id}
                                        onClick={() => setTestProvider(p.id)}
                                        className={cn(
                                          'p-1.5 rounded-lg transition-colors',
                                          testProvider === p.id
                                            ? 'bg-zinc-200 dark:bg-zinc-700'
                                            : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                        )}
                                        title={p.name}
                                      >
                                        <Icon className={cn(
                                          'w-4 h-4',
                                          testProvider === p.id ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'
                                        )} />
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Settings Toggle */}
                                <button
                                  onClick={() => setShowTestSettings(!showTestSettings)}
                                  className={cn(
                                    'p-1.5 rounded-lg transition-colors',
                                    showTestSettings
                                      ? 'bg-zinc-200 dark:bg-zinc-700'
                                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                                  )}
                                >
                                  <Settings2 className="w-4 h-4 text-zinc-500" />
                                </button>
                              </div>

                              {/* Advanced Settings */}
                              {showTestSettings && (
                                <div className="flex items-center gap-4 p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                                  <div className="flex items-center gap-2">
                                    <label className="text-xs text-zinc-500">{t.maxTokens}:</label>
                                    <input
                                      type="number"
                                      value={testMaxTokens}
                                      onChange={e => setTestMaxTokens(Number(e.target.value))}
                                      className="w-20 px-2 py-1 text-xs bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <label className="text-xs text-zinc-500">{t.temperature}:</label>
                                    <input
                                      type="number"
                                      step="0.1"
                                      min="0"
                                      max="2"
                                      value={testTemperature}
                                      onChange={e => setTestTemperature(Number(e.target.value))}
                                      className="w-16 px-2 py-1 text-xs bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 rounded"
                                    />
                                  </div>
                                </div>
                              )}

                              {/* Test Answer Input */}
                              <div>
                                <label className="text-xs font-medium text-zinc-500 mb-1 block">
                                  {t.testAnswer}
                                </label>
                                <textarea
                                  value={testAnswer}
                                  onChange={e => setTestAnswer(e.target.value)}
                                  placeholder={t.testAnswerPlaceholder}
                                  className="w-full h-20 px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg resize-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent"
                                />
                              </div>

                              {/* Run Test Button */}
                              <button
                                onClick={handleRunTest}
                                disabled={!canRunTest || testLoading}
                                className={cn(
                                  'w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all',
                                  canRunTest && !testLoading
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                                    : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-400 cursor-not-allowed'
                                )}
                              >
                                {testLoading ? (
                                  <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    {t.testing}
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-4 h-4" />
                                    {t.runTest}
                                  </>
                                )}
                              </button>

                              {/* Error */}
                              {testError && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
                                  <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                                  <p className="text-sm text-red-600 dark:text-red-400">{testError}</p>
                                </div>
                              )}

                              {/* Test Result */}
                              {testResult && (
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                    <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                                      {t.testOutput}
                                    </h4>
                                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                                      <span>{t.tokens}: {testResult.tokensUsed}</span>
                                      <span>{t.responseTime}: {testResult.responseTimeMs}ms</span>
                                      <button
                                        onClick={handleCopyOutput}
                                        className="flex items-center gap-1 text-purple-500 hover:text-purple-600"
                                      >
                                        {copiedOutput ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                        {copiedOutput ? t.copied : t.copy}
                                      </button>
                                    </div>
                                  </div>
                                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg max-h-40 overflow-y-auto">
                                    <p className="text-sm text-zinc-700 dark:text-zinc-300 whitespace-pre-wrap">
                                      {testResult.output}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-zinc-400" />
                  </div>
                  <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                    {t.selectQuestion}
                  </h3>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIStudioQuestionsPage;
