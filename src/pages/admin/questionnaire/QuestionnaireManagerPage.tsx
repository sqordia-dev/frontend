import { useState, useCallback } from 'react';
import { Loader2, Search, Plus, FilePlus, Send, Trash2, AlertCircle, History, Languages, Eye, Pencil, X } from 'lucide-react';
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

const STATUS_CONFIG = {
  Draft: {
    bg: 'bg-[#FF6B00]/8 dark:bg-[#FF6B00]/15',
    text: 'text-[#FF6B00]',
    dot: 'bg-[#FF6B00]',
    label: 'Draft',
  },
  Published: {
    bg: 'bg-emerald-500/8 dark:bg-emerald-500/15',
    text: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    label: 'Published',
  },
  Archived: {
    bg: 'bg-gray-500/8 dark:bg-gray-500/15',
    text: 'text-gray-500 dark:text-gray-400',
    dot: 'bg-gray-400',
    label: 'Archived',
  },
} as const;

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
  const requiredQuestions = allQuestions.filter((q) => q.isRequired).length;

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
      <div className="flex flex-col items-center justify-center py-24 sm:py-32 gap-3">
        <div className="w-12 h-12 rounded-2xl bg-[#FF6B00]/10 dark:bg-[#FF6B00]/20 flex items-center justify-center">
          <Loader2 size={22} className="animate-spin text-[#FF6B00]" />
        </div>
        <p className="text-sm text-muted-foreground">Loading questionnaire...</p>
      </div>
    );
  }

  const statusConfig = activeVersion ? STATUS_CONFIG[activeVersion.status] : null;

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)]">
      {/* ── Header ────────────────────────────────────────────── */}
      <div className="shrink-0 pb-3 sm:pb-5 space-y-3 sm:space-y-4">
        {/* Top row: title + version (stacks on mobile) */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            {/* Title + badges (wraps naturally) */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                Questionnaire
              </h1>
              {activeVersion && statusConfig && (
                <div className={cn(
                  'inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-semibold tracking-wide uppercase',
                  statusConfig.bg, statusConfig.text,
                )}>
                  <span className={cn('w-1.5 h-1.5 rounded-full', statusConfig.dot)} />
                  {statusConfig.label}
                  <span className="opacity-60 font-normal normal-case">v{activeVersion.versionNumber}</span>
                </div>
              )}
              {isDirty && (
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-amber-600 dark:text-amber-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Unsaved
                </span>
              )}
            </div>

            {/* Stats bar — compact grid on mobile, inline on desktop */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 sm:gap-x-4 text-[12px] sm:text-[13px] text-muted-foreground">
              <span className="tabular-nums">
                <strong className="text-foreground font-semibold">{activeQuestions}</strong> active
              </span>
              <span className="hidden sm:block w-px h-3.5 bg-border" />
              <span className="tabular-nums">
                <strong className="text-foreground font-semibold">{totalQuestions}</strong> total
              </span>
              <span className="hidden sm:block w-px h-3.5 bg-border" />
              <span className="tabular-nums">
                <strong className="text-foreground font-semibold">{requiredQuestions}</strong> req.
              </span>
              <span className="hidden sm:block w-px h-3.5 bg-border" />
              <span className="tabular-nums">
                <strong className="text-foreground font-semibold">{allSteps.length}</strong> steps
              </span>
            </div>
          </div>

          {/* Actions — scrollable row on mobile */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 overflow-x-auto -mx-1 px-1 pb-1 sm:pb-0 sm:mx-0 sm:px-0">
            {/* Language toggle */}
            <button
              onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 sm:py-2 text-xs font-medium rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground active:bg-muted transition-colors shrink-0"
              title={`Switch to ${language === 'fr' ? 'English' : 'French'}`}
            >
              <Languages size={14} />
              <span className="uppercase font-bold tracking-wider">{language}</span>
            </button>

            <button
              onClick={() => setHistoryOpen(true)}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 sm:py-2 text-xs font-medium rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground active:bg-muted transition-colors shrink-0"
            >
              <History size={14} />
              <span className="hidden sm:inline">History</span>
            </button>

            {!isEditMode && (
              <Button
                variant="brand"
                size="sm"
                onClick={handleCreateDraft}
                disabled={isCreating || isLoading}
                className="gap-1 sm:gap-1.5 shrink-0"
              >
                {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FilePlus className="w-3.5 h-3.5" />}
                <span className="hidden xs:inline sm:inline">{isCreating ? 'Creating...' : 'Draft'}</span>
              </Button>
            )}

            {isEditMode && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDiscard}
                  disabled={isDiscarding || isPublishing}
                  className="gap-1 sm:gap-1.5 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 shrink-0"
                >
                  {isDiscarding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{isDiscarding ? 'Discarding...' : 'Discard'}</span>
                </Button>
                <Button
                  size="sm"
                  onClick={handlePublish}
                  disabled={isPublishing || isDiscarding}
                  className="gap-1 sm:gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shrink-0"
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
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 border border-red-200/60 dark:border-red-800/40">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </div>
                <span className="flex-1 text-xs sm:text-sm truncate">{error}</span>
                <button onClick={clearError} className="text-xs font-medium hover:underline shrink-0 opacity-70 hover:opacity-100 transition-opacity">
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Filters bar ──────────────────────────────────────── */}
        <div className="space-y-2 sm:space-y-0 sm:flex sm:flex-row sm:gap-3 sm:items-center">
          {/* Top filter row: mode + persona (scrollable on mobile) */}
          <div className="flex items-center gap-2 overflow-x-auto -mx-1 px-1 pb-1 sm:pb-0 sm:mx-0 sm:px-0">
            {/* Mode indicator */}
            <div className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border shrink-0',
              isEditMode
                ? 'bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 border-[#FF6B00]/20 text-[#FF6B00]'
                : 'bg-muted/50 border-border text-muted-foreground',
            )}>
              {isEditMode ? <Pencil size={12} /> : <Eye size={12} />}
              {isEditMode ? 'Editing' : 'Viewing'}
            </div>

            {/* Persona tabs */}
            <div className="flex rounded-lg bg-muted/50 dark:bg-muted/30 p-0.5 gap-0.5 shrink-0">
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
                      'px-2 sm:px-3 py-1.5 text-[11px] sm:text-xs font-medium rounded-md transition-all flex items-center gap-1 sm:gap-1.5 whitespace-nowrap',
                      isComingSoon && 'opacity-35 cursor-not-allowed',
                      isActive
                        ? 'bg-card text-foreground shadow-sm ring-1 ring-border/50'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {tab.label}
                    {!isComingSoon && (
                      <span className={cn(
                        'text-[10px] tabular-nums',
                        isActive ? 'text-foreground/60' : 'text-muted-foreground/60',
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
          </div>

          <div className="hidden sm:block flex-1" />

          {/* Search + add */}
          <div className="flex gap-2">
            <div className="relative flex-1 sm:w-56 lg:w-64 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions..."
                className="w-full pl-9 pr-3 py-2 border border-border rounded-lg bg-card text-sm text-foreground placeholder-muted-foreground/50 focus:ring-2 focus:ring-[#FF6B00]/15 focus:border-[#FF6B00]/40 outline-none transition-all"
              />
            </div>
            {isEditMode && (
              <Button variant="brand" size="sm" onClick={handleAddQuestion} className="gap-1.5 shrink-0">
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Add</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ── Main content area ─────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden rounded-xl border border-border bg-card">
        {/* Step list */}
        <div className="flex-1 overflow-y-auto min-w-0">
          {filteredGrouped.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16 sm:py-24 px-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-3 sm:mb-4">
                <Search className="w-6 h-6 sm:w-7 sm:h-7 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">No questions found</p>
              <p className="text-xs text-muted-foreground text-center max-w-[240px]">
                Try adjusting your filters or search query, or add a new question to get started.
              </p>
            </div>
          )}

          <div className="divide-y divide-border/50">
            {filteredGrouped.map((group, index) => {
              const step = allSteps.find((s) => s.stepNumber === group.stepNumber);
              if (!step) return null;

              return (
                <motion.div
                  key={group.stepNumber}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <StepAccordion
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
                        isSelected={selectedQuestionId === question.id}
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
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Editor panel — desktop: resizable side panel */}
        {selectedQuestion && (
          <div className="hidden lg:block h-full">
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
          </div>
        )}
      </div>

      {/* Editor panel — mobile/tablet: full-screen bottom sheet */}
      <AnimatePresence>
        {selectedQuestion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="lg:hidden fixed inset-0 z-50"
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/40 dark:bg-black/60"
              onClick={() => setSelectedQuestionId(null)}
            />
            {/* Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute inset-x-0 bottom-0 top-12 sm:top-16 rounded-t-2xl overflow-hidden shadow-2xl"
            >
              <QuestionEditorPanel
                question={selectedQuestion}
                isEditMode={isEditMode}
                language={language}
                onClose={() => setSelectedQuestionId(null)}
                onUpdate={handleUpdateQuestion}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
