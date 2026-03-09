import { useState, useCallback } from 'react';
import { ClipboardList, Loader2, Search, Plus, FilePlus, Send, Trash2, AlertCircle, History } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { QuestionnaireVersionProvider, useQuestionnaireVersion } from '@/contexts/QuestionnaireVersionContext';
import { useQuestionnaireManager } from '@/hooks/useQuestionnaireManager';
import { useQuestionFilters } from '@/hooks/useQuestionFilters';
import { useAiContentActions } from '@/hooks/useAiContentActions';
import type { AdminQuestionTemplate, UpdateQuestionTemplateRequest } from '@/types/admin-question-template';
import type { QuestionnaireStep, UpdateQuestionnaireStepRequest } from '@/types/questionnaire-version';
import { StepAccordion } from '@/components/cms/questionnaire/StepAccordion';
import { QuestionCard } from '@/components/cms/questionnaire/QuestionCard';
import { QuestionEditorPanel } from '@/components/cms/questionnaire/QuestionEditorPanel';
import { QuestionnaireVersionHistory } from '@/components/cms/questionnaire/QuestionnaireVersionHistory';
import { VersionBadge } from '@/components/cms/shared/VersionBadge';
import { ResizablePanel } from '@/components/ui/resizable-panel';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// ── Persona filter ──────────────────────────────────────────────
type PersonaFilter = 'all' | 'Entrepreneur' | 'Consultant' | 'OBNL';
const PERSONA_TABS: { value: PersonaFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'Entrepreneur', label: 'Entrepreneur' },
  { value: 'Consultant', label: 'Consultant' },
  { value: 'OBNL', label: 'OBNL' },
];
const COMING_SOON: Set<PersonaFilter> = new Set(['Consultant', 'OBNL']);

// ── Inner component (inside provider) ───────────────────────────
function QuestionnaireManagerInner() {
  const {
    activeVersion,
    isLoading,
    isDirty,
    error,
    isEditMode,
    createDraft,
    publishDraft,
    discardDraft,
    clearError,
  } = useQuestionnaireVersion();

  const {
    groupedQuestions,
    updateQuestion,
    deleteQuestion,
    createQuestion,
    reorderQuestions,
    updateStep,
    duplicateQuestion,
    toggleQuestionStatus,
  } = useQuestionnaireManager();

  const ai = useAiContentActions();

  const allQuestions = activeVersion?.questions ?? [];
  const allSteps = activeVersion?.steps ?? [];

  const { persona, setPersona, searchQuery, setSearchQuery, filteredGrouped, counts } =
    useQuestionFilters(allQuestions, groupedQuestions);

  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([1, 2, 3, 4, 5]));
  const [language, setLanguage] = useState<'en' | 'fr'>('fr');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);

  const selectedQuestion = selectedQuestionId
    ? allQuestions.find((q) => q.id === selectedQuestionId) ?? null
    : null;

  const totalQuestions = allQuestions.length;
  const activeQuestions = allQuestions.filter((q) => q.isActive).length;

  const toggleStep = useCallback((stepNumber: number) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      next.has(stepNumber) ? next.delete(stepNumber) : next.add(stepNumber);
      return next;
    });
  }, []);

  const handleAddQuestion = async () => {
    if (!activeVersion) return;
    const firstStep = filteredGrouped[0]?.stepNumber ?? 1;
    const stepQs = allQuestions.filter((q) => q.stepNumber === firstStep);
    const maxOrder = Math.max(...stepQs.map((q) => q.order), 0);

    const created = await createQuestion({
      questionText: 'Nouvelle question',
      questionTextEN: 'New question',
      questionType: 'LongText',
      stepNumber: firstStep,
      order: maxOrder + 1,
      isRequired: false,
    });

    if (created) {
      setSelectedQuestionId(created.id);
      setExpandedSteps((prev) => new Set([...prev, firstStep]));
    }
  };

  const handleAiSuggestForStep = async (step: QuestionnaireStep) => {
    const stepQuestions = allQuestions
      .filter((q) => q.stepNumber === step.stepNumber)
      .map((q) => q.questionText);
    await ai.suggestQuestions(step.titleFR, stepQuestions, persona === 'all' ? 'all personas' : persona);
  };

  const handleUpdateStep = useCallback(
    (stepNumber: number, data: UpdateQuestionnaireStepRequest) => updateStep(stepNumber, data),
    [updateStep],
  );

  const handleUpdateQuestion = useCallback(
    (questionId: string, data: UpdateQuestionTemplateRequest) => updateQuestion(questionId, data),
    [updateQuestion],
  );

  const handleCreateDraft = async () => {
    setIsCreating(true);
    try { await createDraft(); } finally { setIsCreating(false); }
  };

  const handlePublish = async () => {
    if (!confirm('Publish this draft? It will become the active questionnaire for all users.')) return;
    setIsPublishing(true);
    try { await publishDraft(); } finally { setIsPublishing(false); }
  };

  const handleDiscard = async () => {
    if (!confirm('Discard this draft? All unpublished changes will be lost.')) return;
    setIsDiscarding(true);
    try { await discardDraft(); } finally { setIsDiscarding(false); }
  };

  // ── Loading state ────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={24} className="animate-spin text-momentum-orange" />
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-6rem)]">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="shrink-0 pb-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-strategy-blue text-white">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">Questionnaire</h1>
                {activeVersion && (
                  <>
                    <span className="text-sm text-gray-400 dark:text-gray-500">v{activeVersion.versionNumber}</span>
                    <VersionBadge status={activeVersion.status} />
                    {isDirty && (
                      <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                        Unsaved
                      </span>
                    )}
                  </>
                )}
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {activeQuestions} active / {totalQuestions} total questions · {allSteps.length} steps
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setHistoryOpen(true)}>
              <History className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">History</span>
            </Button>

            {!isEditMode && (
              <Button
                variant="brand"
                size="sm"
                onClick={handleCreateDraft}
                disabled={isCreating || isLoading}
              >
                {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FilePlus className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">{isCreating ? 'Creating...' : 'Create Draft'}</span>
              </Button>
            )}

            {isEditMode && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDiscard}
                  disabled={isDiscarding || isPublishing}
                  className="text-red-600 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  {isDiscarding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isDiscarding ? 'Discarding...' : 'Discard'}</span>
                </Button>
                <Button
                  size="sm"
                  onClick={handlePublish}
                  disabled={isPublishing || isDiscarding}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white"
                >
                  {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isPublishing ? 'Publishing...' : 'Publish'}</span>
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="flex-1 truncate">{error}</span>
              <button onClick={clearError} className="text-xs underline shrink-0">Dismiss</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Filters ──────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Persona tabs */}
          <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            {PERSONA_TABS.map((tab) => {
              const count = counts[tab.value] ?? 0;
              const isActive = persona === tab.value;
              const isComingSoon = COMING_SOON.has(tab.value);

              return (
                <button
                  key={tab.value}
                  onClick={() => !isComingSoon && setPersona(tab.value)}
                  disabled={isComingSoon}
                  className={cn(
                    'px-3 py-2 text-xs font-medium transition-colors flex items-center gap-1.5',
                    isComingSoon && 'opacity-40 cursor-not-allowed',
                    isActive
                      ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                      : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
                  )}
                >
                  {tab.label}
                  {!isComingSoon && (
                    <span className={cn(
                      'text-[10px] tabular-nums',
                      isActive ? 'text-white/60 dark:text-gray-900/60' : 'text-gray-400',
                    )}>
                      {count}
                    </span>
                  )}
                  {isComingSoon && (
                    <span className="text-[9px] font-semibold uppercase text-amber-600 dark:text-amber-400">Soon</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search + add */}
          <div className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-momentum-orange/20 focus:border-momentum-orange transition-colors"
              />
            </div>
            {isEditMode && (
              <Button variant="brand" size="sm" onClick={handleAddQuestion}>
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add Question</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Main content area ─────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        {/* Step list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-w-0">
          {filteredGrouped.length === 0 && !isLoading && (
            <div className="text-center py-16 text-gray-500 dark:text-gray-400">
              <ClipboardList className="w-8 h-8 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
              <p className="text-sm font-medium">No questions found.</p>
              <p className="text-xs mt-1">Try adjusting your filters or adding a new question.</p>
            </div>
          )}

          {filteredGrouped.map((group) => {
            const step = allSteps.find((s) => s.stepNumber === group.stepNumber);
            if (!step) return null;

            return (
              <StepAccordion
                key={group.stepNumber}
                step={step}
                questions={group.questions}
                language={language}
                isEditMode={isEditMode}
                isExpanded={expandedSteps.has(group.stepNumber)}
                onToggle={() => toggleStep(group.stepNumber)}
                onReorder={reorderQuestions}
                onUpdateStep={handleUpdateStep}
                onAiSuggest={() => handleAiSuggestForStep(step)}
                isAiLoading={ai.isLoading('suggest-questions')}
              >
                {group.questions.map((question) => (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    language={language}
                    isEditMode={isEditMode}
                    onEdit={() => setSelectedQuestionId(question.id)}
                    onToggleStatus={() => toggleQuestionStatus(question.id, question.isActive)}
                    onDelete={async () => {
                      await deleteQuestion(question.id);
                      if (selectedQuestionId === question.id) setSelectedQuestionId(null);
                    }}
                    onDuplicate={() => duplicateQuestion(question)}
                    onAdaptPersona={async () => {
                      const adapted = await ai.adaptForPersona(
                        question.questionText,
                        question.personaType ?? 'General',
                        'Entrepreneur',
                      );
                      if (adapted) {
                        await createQuestion({
                          questionText: adapted,
                          questionType: question.questionType,
                          stepNumber: question.stepNumber,
                          order: question.order + 1,
                          isRequired: question.isRequired,
                          personaType: 'Entrepreneur',
                        });
                      }
                    }}
                  />
                ))}
              </StepAccordion>
            );
          })}
        </div>

        {/* Editor panel */}
        {selectedQuestion && (
          <ResizablePanel
            defaultWidth={480}
            minWidth={360}
            maxWidth={720}
            side="right"
            className="h-full"
          >
            <QuestionEditorPanel
              question={selectedQuestion}
              isEditMode={isEditMode}
              language={language}
              onClose={() => setSelectedQuestionId(null)}
              onUpdate={handleUpdateQuestion}
            />
          </ResizablePanel>
        )}
      </div>

      <QuestionnaireVersionHistory open={historyOpen} onOpenChange={setHistoryOpen} />
    </div>
  );
}

// ── Exported page with provider wrapper ─────────────────────────
export function QuestionnaireManagerPage() {
  return (
    <QuestionnaireVersionProvider>
      <QuestionnaireManagerInner />
    </QuestionnaireVersionProvider>
  );
}

export default QuestionnaireManagerPage;
