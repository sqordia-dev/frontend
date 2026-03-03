import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MessageSquare,
  Lightbulb,
  ChevronDown,
  Check,
  Save,
  Loader2,
  Languages,
  Search,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useTheme } from '../../../contexts/ThemeContext';
import { adminQuestionTemplateService } from '../../../lib/admin-question-template-service';
import type { AdminQuestionTemplate } from '../../../types/admin-question-template';
import { STEP_DEFINITIONS } from '../../../types/admin-question-template';
import { MonacoPromptEditor } from './MonacoPromptEditor';

interface QuestionPromptViewerProps {
  isOpen: boolean;
  onClose: () => void;
}

type LanguageTab = 'fr' | 'en';
type ContentTab = 'coachPrompt' | 'expertTip';

export function QuestionPromptViewer({ isOpen, onClose }: QuestionPromptViewerProps) {
  const { language: uiLanguage } = useTheme();
  const [questions, setQuestions] = useState<AdminQuestionTemplate[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<AdminQuestionTemplate | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [languageTab, setLanguageTab] = useState<LanguageTab>('fr');
  const [contentTab, setContentTab] = useState<ContentTab>('coachPrompt');

  // Editable content
  const [coachPromptFR, setCoachPromptFR] = useState('');
  const [coachPromptEN, setCoachPromptEN] = useState('');
  const [expertAdviceFR, setExpertAdviceFR] = useState('');
  const [expertAdviceEN, setExpertAdviceEN] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Translations
  const t = {
    title: uiLanguage === 'fr' ? 'Prompts des Questions' : 'Question Prompts',
    subtitle: uiLanguage === 'fr'
      ? 'Voir et modifier les prompts IA et conseils d\'expert pour chaque question'
      : 'View and edit AI prompts and expert tips for each question',
    selectQuestion: uiLanguage === 'fr' ? 'Sélectionner une question' : 'Select a question',
    searchPlaceholder: uiLanguage === 'fr' ? 'Rechercher une question...' : 'Search questions...',
    coachPrompt: uiLanguage === 'fr' ? 'Prompt IA' : 'AI Coach Prompt',
    expertTip: uiLanguage === 'fr' ? 'Conseil d\'expert' : 'Expert Tip',
    french: 'Français',
    english: 'English',
    save: uiLanguage === 'fr' ? 'Sauvegarder' : 'Save',
    saving: uiLanguage === 'fr' ? 'Sauvegarde...' : 'Saving...',
    saved: uiLanguage === 'fr' ? 'Sauvegardé' : 'Saved',
    noPrompt: uiLanguage === 'fr' ? 'Aucun prompt défini' : 'No prompt defined',
    noExpertTip: uiLanguage === 'fr' ? 'Aucun conseil défini' : 'No expert tip defined',
    step: uiLanguage === 'fr' ? 'Étape' : 'Step',
    required: uiLanguage === 'fr' ? 'Requis' : 'Required',
    optional: uiLanguage === 'fr' ? 'Optionnel' : 'Optional',
    helpText: uiLanguage === 'fr' ? 'Texte d\'aide' : 'Help Text',
  };

  // Load questions on mount
  useEffect(() => {
    if (isOpen) {
      loadQuestions();
    }
  }, [isOpen]);

  const loadQuestions = async () => {
    setLoading(true);
    try {
      const data = await adminQuestionTemplateService.getAll({ isActive: true });
      // Sort by step number then order
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

  // Update local state when question is selected
  useEffect(() => {
    if (selectedQuestion) {
      setCoachPromptFR(selectedQuestion.coachPromptFR || '');
      setCoachPromptEN(selectedQuestion.coachPromptEN || '');
      setExpertAdviceFR(selectedQuestion.expertAdviceFR || '');
      setExpertAdviceEN(selectedQuestion.expertAdviceEN || '');
      setHasChanges(false);
    }
  }, [selectedQuestion]);

  // Track changes
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

      // Update local state
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

  // Filter questions by search
  const filteredQuestions = questions.filter(q => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      q.questionText.toLowerCase().includes(query) ||
      (q.questionTextEN?.toLowerCase().includes(query)) ||
      `step ${q.stepNumber}`.includes(query) ||
      `étape ${q.stepNumber}`.includes(query)
    );
  });

  // Group questions by step
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-5xl max-h-[90vh] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  {t.title}
                </h2>
                <p className="text-xs text-zinc-500">{t.subtitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-zinc-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Question Selector */}
            <div className="w-80 border-r border-zinc-200 dark:border-zinc-800 flex flex-col">
              {/* Search */}
              <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className={cn(
                      'w-full pl-9 pr-3 py-2 text-sm rounded-lg border',
                      'bg-zinc-50 dark:bg-zinc-800',
                      'border-zinc-200 dark:border-zinc-700',
                      'focus:outline-none focus:ring-2 focus:ring-purple-500/50'
                    )}
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
                                    <span className={cn(
                                      'text-[10px]',
                                      q.isRequired ? 'text-red-500' : 'text-zinc-400'
                                    )}>
                                      {q.isRequired ? t.required : t.optional}
                                    </span>
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

            {/* Right: Prompt Editor */}
            <div className="flex-1 flex flex-col">
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
                          {selectedQuestion.personaType && (
                            <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded">
                              {selectedQuestion.personaType}
                            </span>
                          )}
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

                      {/* Save Button */}
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
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t.saving}
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            {t.save}
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex items-center justify-between px-4 py-2 border-b border-zinc-200 dark:border-zinc-800">
                    {/* Content Type Tabs */}
                    <div className="flex gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                      <button
                        onClick={() => setContentTab('coachPrompt')}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                          contentTab === 'coachPrompt'
                            ? 'bg-white dark:bg-zinc-700 text-purple-600 dark:text-purple-400 shadow-sm'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
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
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                        )}
                      >
                        <Lightbulb className="w-4 h-4" />
                        {t.expertTip}
                      </button>
                    </div>

                    {/* Language Tabs */}
                    <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                      <button
                        onClick={() => setLanguageTab('fr')}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                          languageTab === 'fr'
                            ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                        )}
                      >
                        <span className="text-base">🇫🇷</span>
                        {t.french}
                      </button>
                      <button
                        onClick={() => setLanguageTab('en')}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors',
                          languageTab === 'en'
                            ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                        )}
                      >
                        <span className="text-base">🇬🇧</span>
                        {t.english}
                      </button>
                    </div>
                  </div>

                  {/* Editor */}
                  <div className="flex-1 p-4 overflow-hidden">
                    <div className="h-full rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
                      <MonacoPromptEditor
                        value={getCurrentContent()}
                        onChange={setCurrentContent}
                        minHeight={300}
                        maxHeight={600}
                        placeholder={contentTab === 'coachPrompt' ? t.noPrompt : t.noExpertTip}
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* Empty State */
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-zinc-400" />
                    </div>
                    <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
                      {t.selectQuestion}
                    </h3>
                    <p className="text-sm text-zinc-500 max-w-[300px]">
                      {uiLanguage === 'fr'
                        ? 'Sélectionnez une question dans la liste pour voir et modifier son prompt IA et conseil d\'expert'
                        : 'Select a question from the list to view and edit its AI prompt and expert tip'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default QuestionPromptViewer;
