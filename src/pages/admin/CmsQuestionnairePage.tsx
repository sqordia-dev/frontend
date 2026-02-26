import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  GripVertical,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronRight,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Copy,
  ToggleLeft,
  ToggleRight,
  History,
  Send,
  FileEdit,
  XCircle,
  ArrowLeft,
  Brain,
  ClipboardList,
  Languages,
} from 'lucide-react';
import CA from 'country-flag-icons/react/3x2/CA';

// Quebec Flag Component
const QuebecFlag = ({ className = '' }: { className?: string }) => (
  <img
    src="/quebec-flag.svg"
    alt="French"
    className={className}
    style={{ objectFit: 'contain', display: 'block' }}
  />
);
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type {
  AdminQuestionTemplate,
  CreateQuestionTemplateRequest,
  UpdateQuestionTemplateRequest,
} from '../../types/admin-question-template';
import { QUESTION_TYPES, PERSONA_TYPES } from '../../types/admin-question-template';
import { cn } from '@/lib/utils';
import { QuestionnaireVersionProvider, useQuestionnaireVersion } from '../../contexts/QuestionnaireVersionContext';
import { StepTitleEditor } from '../../components/admin/questionnaire/StepTitleEditor';
import { QuestionnaireVersionHistorySidebar } from '../../components/admin/questionnaire/QuestionnaireVersionHistorySidebar';
import { questionnaireVersionService } from '../../lib/questionnaire-version-service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

type PersonaFilter = 'all' | 'Entrepreneur' | 'Consultant' | 'OBNL';
type Language = 'en' | 'fr';

interface GroupedQuestions {
  [stepNumber: number]: AdminQuestionTemplate[];
}

// Sortable Question Item Component
interface SortableQuestionItemProps {
  question: AdminQuestionTemplate;
  index: number;
  isEditMode: boolean;
  getDisplayText: (fr: string | null, en: string | null) => string;
  getQuestionTypeLabel: (type: string) => string;
  onEdit: () => void;
  onDuplicate: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}

function SortableQuestionItem({
  question,
  index,
  isEditMode,
  getDisplayText,
  getQuestionTypeLabel,
  onEdit,
  onDuplicate,
  onToggleStatus,
  onDelete,
}: SortableQuestionItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id, disabled: !isEditMode });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-4 px-5 py-4 hover:bg-muted/50 transition-colors',
        isDragging && 'bg-muted shadow-lg rounded-lg',
        !question.isActive && 'opacity-50'
      )}
    >
      {/* Drag Handle */}
      {isEditMode && (
        <button
          {...attributes}
          {...listeners}
          className="p-1.5 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none rounded-md hover:bg-muted transition-colors"
          title="Drag to reorder"
        >
          <GripVertical size={16} />
        </button>
      )}

      {/* Order number */}
      <span className="w-8 h-8 rounded-lg bg-muted text-muted-foreground flex items-center justify-center text-sm font-semibold shrink-0">
        {index + 1}
      </span>

      {/* Question info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {getDisplayText(question.questionText, question.questionTextEN)}
        </p>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          <Badge variant="secondary" className="text-[10px] font-medium">
            {getQuestionTypeLabel(question.questionType)}
          </Badge>
          {question.isRequired && (
            <Badge variant="destructive" className="text-[10px] font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
              Required
            </Badge>
          )}
          {question.personaType && (
            <Badge variant="outline" className="text-[10px] font-medium text-blue-600 border-blue-200 dark:text-blue-400 dark:border-blue-800">
              {question.personaType}
            </Badge>
          )}
          {question.section && (
            <Badge variant="outline" className="text-[10px] font-medium text-purple-600 border-purple-200 dark:text-purple-400 dark:border-purple-800">
              {question.section}
            </Badge>
          )}
          {!question.isActive && (
            <Badge variant="secondary" className="text-[10px] font-medium">
              Inactive
            </Badge>
          )}
        </div>
      </div>

      {/* Actions - only show in edit mode */}
      {isEditMode && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-2 text-muted-foreground hover:text-momentum-orange hover:bg-momentum-orange/10 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 size={15} />
          </button>
          <button
            onClick={onDuplicate}
            className="p-2 text-muted-foreground hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Duplicate"
          >
            <Copy size={15} />
          </button>
          <button
            onClick={onToggleStatus}
            className={cn(
              'p-2 rounded-lg transition-colors',
              question.isActive
                ? 'text-emerald-500 hover:text-muted-foreground hover:bg-muted'
                : 'text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
            )}
            title={question.isActive ? 'Deactivate' : 'Activate'}
          >
            {question.isActive ? <ToggleRight size={15} /> : <ToggleLeft size={15} />}
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}
    </div>
  );
}

// Main content component that uses the context
function QuestionnaireEditorContent() {
  const {
    activeVersion,
    isLoading,
    isDirty,
    error,
    isEditMode,
    loadVersion,
    createDraft,
    publishDraft,
    discardDraft,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    updateStep,
    clearError,
  } = useQuestionnaireVersion();

  // Local UI state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [personaFilter, setPersonaFilter] = useState<PersonaFilter>('all');
  const [language, setLanguage] = useState<Language>('en');
  const [showInactive, setShowInactive] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([1, 2, 3, 4, 5]));
  const [editingQuestion, setEditingQuestion] = useState<AdminQuestionTemplate | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedStep, setSelectedStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Get questions from active version
  const questions = activeVersion?.questions || [];

  // Filter questions based on persona and active status
  const filteredQuestions = questions.filter(q => {
    if (personaFilter !== 'all' && q.personaType !== personaFilter && q.personaType !== null) {
      return false;
    }
    if (!showInactive && !q.isActive) {
      return false;
    }
    return true;
  });

  // Group questions by step
  const groupedQuestions: GroupedQuestions = filteredQuestions.reduce((acc, q) => {
    const step = q.stepNumber || 1;
    if (!acc[step]) acc[step] = [];
    acc[step].push(q);
    return acc;
  }, {} as GroupedQuestions);

  // Sort questions within each step by order
  Object.keys(groupedQuestions).forEach(step => {
    groupedQuestions[Number(step)].sort((a, b) => a.order - b.order);
  });

  // Get steps from active version
  const steps = activeVersion?.steps || [];

  // Toggle step expansion
  const toggleStep = (stepNumber: number) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepNumber)) {
        newSet.delete(stepNumber);
      } else {
        newSet.add(stepNumber);
      }
      return newSet;
    });
  };

  // Handle creating draft
  const handleCreateDraft = async () => {
    try {
      setIsCreatingDraft(true);
      await createDraft();
      setSuccessMessage('Draft created successfully. You can now edit questions.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      // Error is handled by context
    } finally {
      setIsCreatingDraft(false);
    }
  };

  // Handle publishing draft
  const handlePublish = async () => {
    if (!confirm('Are you sure you want to publish this draft? This will make all changes live.')) {
      return;
    }

    try {
      setIsPublishing(true);
      await publishDraft();
      setSuccessMessage('Draft published successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      // Error is handled by context
    } finally {
      setIsPublishing(false);
    }
  };

  // Handle discarding draft
  const handleDiscard = async () => {
    if (!confirm('Are you sure you want to discard this draft? All changes will be lost.')) {
      return;
    }

    try {
      setIsDiscarding(true);
      await discardDraft();
      setSuccessMessage('Draft discarded. Viewing published version.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      // Error is handled by context
    } finally {
      setIsDiscarding(false);
    }
  };

  // Handle restoring a version from history
  const handleRestoreVersion = async (versionId: string) => {
    await questionnaireVersionService.restoreVersion(versionId);
    await loadVersion();
    setSuccessMessage('Version restored as new draft.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Handle create question
  const handleCreateQuestion = async (data: CreateQuestionTemplateRequest) => {
    try {
      setIsSaving(true);
      const result = await createQuestion(data);
      if (result) {
        setSuccessMessage('Question created successfully');
        setIsCreateModalOpen(false);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handle update question
  const handleUpdateQuestion = async (id: string, data: UpdateQuestionTemplateRequest) => {
    try {
      setIsSaving(true);
      const result = await updateQuestion(id, data);
      if (result) {
        setSuccessMessage('Question updated successfully');
        setEditingQuestion(null);
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete question
  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    const result = await deleteQuestion(id);
    if (result) {
      setSuccessMessage('Question deleted successfully');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (question: AdminQuestionTemplate) => {
    await updateQuestion(question.id, { isActive: !question.isActive });
    setSuccessMessage(`Question ${question.isActive ? 'deactivated' : 'activated'} successfully`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Handle duplicate question
  const handleDuplicateQuestion = async (question: AdminQuestionTemplate) => {
    const newQuestion: CreateQuestionTemplateRequest = {
      questionText: `${question.questionText} (Copy)`,
      questionTextEN: question.questionTextEN ? `${question.questionTextEN} (Copy)` : undefined,
      helpText: question.helpText || undefined,
      helpTextEN: question.helpTextEN || undefined,
      questionType: question.questionType,
      stepNumber: question.stepNumber,
      personaType: question.personaType,
      order: question.order + 1,
      isRequired: question.isRequired,
      section: question.section || undefined,
      options: question.options || undefined,
      optionsEN: question.optionsEN || undefined,
      validationRules: question.validationRules || undefined,
      conditionalLogic: question.conditionalLogic || undefined,
    };

    await handleCreateQuestion(newQuestion);
  };

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end for reordering
  const handleDragEnd = async (event: DragEndEvent, stepNumber: number) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const stepQuestions = groupedQuestions[stepNumber] || [];
    const oldIndex = stepQuestions.findIndex(q => q.id === active.id);
    const newIndex = stepQuestions.findIndex(q => q.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Prepare reorder request
    const reorderedQuestions = arrayMove(stepQuestions, oldIndex, newIndex);
    const reorderItems = reorderedQuestions.map((q, index) => ({
      questionId: q.id,
      order: index + 1,
    }));

    const success = await reorderQuestions(reorderItems);
    if (success) {
      setSuccessMessage('Questions reordered successfully');
      setTimeout(() => setSuccessMessage(null), 2000);
    }
  };

  // Get display text based on language
  const getDisplayText = (fr: string | null, en: string | null): string => {
    if (language === 'en' && en) return en;
    return fr || en || '';
  };

  // Get question type label
  const getQuestionTypeLabel = (type: string): string => {
    return QUESTION_TYPES.find(t => t.value === type)?.label || type;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border/50 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/admin/cms"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                title="Back to CMS"
              >
                <ArrowLeft size={20} />
              </Link>

              {/* Logo */}
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-strategy-blue text-white shadow-md">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-lg font-bold text-foreground">Questionnaire Editor</h1>
                    {/* Version Badge */}
                    {activeVersion && (
                      <Badge
                        variant={activeVersion.status === 'Draft' ? 'warning' : 'success'}
                        className="text-[10px] font-bold"
                      >
                        {activeVersion.status === 'Draft' ? `Draft v${activeVersion.versionNumber}` : `Published v${activeVersion.versionNumber}`}
                      </Badge>
                    )}
                    {isDirty && isEditMode && (
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
                        Unsaved changes
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">Manage questions for the Growth Architect wizard</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Version History Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsHistoryOpen(true)}
                className="text-muted-foreground"
              >
                <History size={16} className="mr-2" />
                History
              </Button>

              {/* Action buttons based on mode */}
              {!isEditMode ? (
                <Button
                  onClick={handleCreateDraft}
                  disabled={isCreatingDraft}
                  className="bg-momentum-orange hover:bg-momentum-orange/90 text-white"
                >
                  {isCreatingDraft ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Creating Draft...
                    </>
                  ) : (
                    <>
                      <FileEdit size={16} className="mr-2" />
                      Edit Questionnaire
                    </>
                  )}
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDiscard}
                    disabled={isDiscarding}
                  >
                    {isDiscarding ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Discarding...
                      </>
                    ) : (
                      <>
                        <XCircle size={16} className="mr-2" />
                        Discard Draft
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white"
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Send size={16} className="mr-2" />
                        Publish Changes
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Secondary toolbar */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center gap-1">
              {/* Persona filter tabs */}
              {(['all', 'Entrepreneur', 'Consultant', 'OBNL'] as PersonaFilter[]).map((persona) => (
                <button
                  key={persona}
                  onClick={() => setPersonaFilter(persona)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-lg transition-all',
                    personaFilter === persona
                      ? 'bg-momentum-orange/10 text-momentum-orange'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  {persona === 'all' ? 'All Personas' : persona}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {/* Language toggle */}
              <div className="flex items-center bg-muted rounded-lg p-1">
                <button
                  onClick={() => setLanguage('en')}
                  className={cn(
                    'px-3 py-1.5 text-xs font-semibold rounded-md transition-all',
                    language === 'en'
                      ? 'bg-card text-momentum-orange shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('fr')}
                  className={cn(
                    'px-3 py-1.5 text-xs font-semibold rounded-md transition-all',
                    language === 'fr'
                      ? 'bg-card text-momentum-orange shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  FR
                </button>
              </div>

              {/* Show inactive toggle */}
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="rounded border-border text-momentum-orange focus:ring-momentum-orange"
                />
                Show inactive
              </label>

              {/* Add question button - only in edit mode */}
              {isEditMode && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-momentum-orange hover:bg-momentum-orange/90 text-white"
                  size="sm"
                >
                  <Plus size={16} className="mr-2" />
                  Add Question
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="max-w-7xl mx-auto px-6">
        {error && (
          <div className="mt-4 bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle size={20} className="text-destructive shrink-0" />
            <span className="text-sm text-destructive flex-1">{error}</span>
            <button onClick={clearError} className="text-destructive hover:text-destructive/80">
              <X size={16} />
            </button>
          </div>
        )}

        {successMessage && (
          <div className="mt-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3">
            <CheckCircle size={20} className="text-emerald-500 shrink-0" />
            <span className="text-sm text-emerald-700 dark:text-emerald-300">{successMessage}</span>
          </div>
        )}

        {/* Read-only mode notice */}
        {!isEditMode && activeVersion && (
          <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle size={20} className="text-blue-500 shrink-0" />
            <span className="text-sm text-blue-700 dark:text-blue-300">
              You are viewing the published version. Click "Edit Questionnaire" to create a draft and make changes.
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Coming Soon for Consultant and OBNL */}
        {(personaFilter === 'Consultant' || personaFilter === 'OBNL') ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              {/* Icon */}
              <div className="w-20 h-20 bg-card rounded-2xl shadow-lg border border-border flex items-center justify-center mx-auto mb-6">
                <ClipboardList className="w-10 h-10 text-muted-foreground" />
              </div>

              {/* Badge */}
              <Badge variant="secondary" className="mb-4">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse mr-2" />
                Coming Soon
              </Badge>
            </div>

            {/* Text content */}
            <h3 className="text-xl font-semibold text-foreground mb-2 text-center">
              {personaFilter} Questionnaire
            </h3>
            <p className="text-muted-foreground text-center max-w-sm leading-relaxed">
              We're building specialized questions tailored for {personaFilter === 'OBNL' ? 'non-profit organizations' : 'business consultants'}. Check back soon.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-momentum-orange" />
          </div>
        ) : (
          <div className="space-y-4">
            {steps.length > 0 ? (
              steps.map((step) => {
                const stepQuestions = groupedQuestions[step.stepNumber] || [];
                const isExpanded = expandedSteps.has(step.stepNumber);

                return (
                  <div
                    key={step.stepNumber}
                    className="bg-card rounded-xl border border-border/50 shadow-sm overflow-hidden"
                  >
                    {/* Step header */}
                    <div
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleStep(step.stepNumber)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          toggleStep(step.stepNumber);
                        }
                      }}
                      className="w-full px-5 py-4 flex items-center justify-between hover:bg-muted/50 transition-colors group cursor-pointer"
                    >
                      <StepTitleEditor
                        step={step}
                        language={language}
                        isEditMode={isEditMode}
                        onSave={updateStep}
                      />
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary" className="text-[10px]">
                          {stepQuestions.length} questions
                        </Badge>
                        {isExpanded ? (
                          <ChevronDown size={18} className="text-muted-foreground" />
                        ) : (
                          <ChevronRight size={18} className="text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    {/* Questions list */}
                    {isExpanded && (
                      <div className="border-t border-border/50">
                        {stepQuestions.length === 0 ? (
                          <div className="px-6 py-10 text-center">
                            <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
                              <ClipboardList className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <p className="text-muted-foreground mb-2">No questions in this step</p>
                            {isEditMode && (
                              <button
                                onClick={() => {
                                  setSelectedStep(step.stepNumber);
                                  setIsCreateModalOpen(true);
                                }}
                                className="text-momentum-orange hover:underline text-sm font-medium"
                              >
                                Add first question
                              </button>
                            )}
                          </div>
                        ) : (
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(event) => handleDragEnd(event, step.stepNumber)}
                          >
                            <SortableContext
                              items={stepQuestions.map(q => q.id)}
                              strategy={verticalListSortingStrategy}
                            >
                              <div className="divide-y divide-border/50">
                                {stepQuestions.map((question, index) => (
                                  <SortableQuestionItem
                                    key={question.id}
                                    question={question}
                                    index={index}
                                    isEditMode={isEditMode}
                                    getDisplayText={getDisplayText}
                                    getQuestionTypeLabel={getQuestionTypeLabel}
                                    onEdit={() => setEditingQuestion(question)}
                                    onDuplicate={() => handleDuplicateQuestion(question)}
                                    onToggleStatus={() => handleToggleStatus(question)}
                                    onDelete={() => handleDeleteQuestion(question.id)}
                                  />
                                ))}
                              </div>
                            </SortableContext>
                          </DndContext>
                        )}

                        {/* Add question to step - only in edit mode */}
                        {isEditMode && stepQuestions.length > 0 && (
                          <div className="px-5 py-3 border-t border-border/50 bg-muted/30">
                            <button
                              onClick={() => {
                                setSelectedStep(step.stepNumber);
                                setIsCreateModalOpen(true);
                              }}
                              className="text-sm text-momentum-orange hover:text-momentum-orange/80 font-medium flex items-center gap-1.5 transition-colors"
                            >
                              <Plus size={14} />
                              Add question to this step
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-20 text-muted-foreground">
                <p>No questionnaire data available</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create Question Modal */}
      {isCreateModalOpen && isEditMode && (
        <QuestionModal
          title="Create New Question"
          initialData={{
            stepNumber: selectedStep,
            questionType: 'ShortText',
            isRequired: false,
            order: (groupedQuestions[selectedStep]?.length || 0) + 1,
          }}
          language={language}
          steps={steps}
          onSave={handleCreateQuestion}
          onClose={() => setIsCreateModalOpen(false)}
          isSaving={isSaving}
        />
      )}

      {/* Edit Question Modal */}
      {editingQuestion && isEditMode && (
        <QuestionModal
          title="Edit Question"
          initialData={editingQuestion}
          language={language}
          steps={steps}
          onSave={(data) => handleUpdateQuestion(editingQuestion.id, data)}
          onClose={() => setEditingQuestion(null)}
          isSaving={isSaving}
        />
      )}

      {/* Version History Sidebar */}
      <QuestionnaireVersionHistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onRestore={handleRestoreVersion}
        currentVersionId={activeVersion?.id}
      />
    </div>
  );
}

// Main page component with provider wrapper
export default function CmsQuestionnairePage() {
  return (
    <QuestionnaireVersionProvider>
      <QuestionnaireEditorContent />
    </QuestionnaireVersionProvider>
  );
}

// Question Modal Component
interface QuestionModalProps {
  title: string;
  initialData: Partial<AdminQuestionTemplate> & { stepNumber: number; questionType: string; isRequired: boolean; order: number };
  language: Language;
  steps: { stepNumber: number; titleFR: string; titleEN: string | null }[];
  onSave: (data: CreateQuestionTemplateRequest) => Promise<void>;
  onClose: () => void;
  isSaving: boolean;
}

function QuestionModal({ title, initialData, language, steps, onSave, onClose, isSaving }: QuestionModalProps) {
  const [formData, setFormData] = useState({
    questionText: initialData.questionText || '',
    questionTextEN: initialData.questionTextEN || '',
    helpText: initialData.helpText || '',
    helpTextEN: initialData.helpTextEN || '',
    questionType: initialData.questionType,
    stepNumber: initialData.stepNumber,
    personaType: initialData.personaType || null,
    order: initialData.order,
    isRequired: initialData.isRequired,
    section: initialData.section || '',
    options: initialData.options || '',
    optionsEN: initialData.optionsEN || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      ...formData,
      personaType: formData.personaType === '__all__' ? null : formData.personaType,
      options: formData.options || undefined,
      optionsEN: formData.optionsEN || undefined,
    });
  };

  const needsOptions = ['SingleChoice', 'MultipleChoice', 'Scale'].includes(formData.questionType);

  const getStepLabel = (stepNumber: number) => {
    const step = steps.find(s => s.stepNumber === stepNumber);
    if (!step) return `Step ${stepNumber}`;
    return language === 'fr' ? step.titleFR : (step.titleEN || step.titleFR);
  };

  const inputClass = "w-full px-4 py-3 border border-border/60 rounded-xl bg-muted/30 hover:bg-muted/50 focus:bg-background focus:ring-2 focus:ring-momentum-orange/20 focus:border-momentum-orange transition-all duration-200 text-sm";
  const selectClass = "w-full px-4 py-3 border border-border/60 rounded-xl bg-muted/30 hover:bg-muted/50 focus:bg-background focus:ring-2 focus:ring-momentum-orange/20 focus:border-momentum-orange transition-all duration-200 text-sm appearance-none cursor-pointer";
  const labelClass = "block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-border/50 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-momentum-orange/10 text-momentum-orange">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">{title}</h2>
              <p className="text-xs text-muted-foreground">Fill in the question details below</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Question Text Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1 w-1 rounded-full bg-momentum-orange" />
              <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Question Text</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* French */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-7 items-center justify-center rounded overflow-hidden border border-border/50 shrink-0">
                      <QuebecFlag className="w-7 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      French <span className="text-momentum-orange">*</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground/60 tabular-nums">
                    {formData.questionText.length} chars
                  </span>
                </div>
                <textarea
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  className={cn(inputClass, "resize-y min-h-[100px]")}
                  rows={4}
                  required
                  placeholder="Entrez la question en français..."
                />
              </div>

              {/* English */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-7 items-center justify-center rounded overflow-hidden border border-border/50 shrink-0">
                      <CA className="w-7 h-5" title="" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      English
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground/60 tabular-nums">
                    {formData.questionTextEN.length} chars
                  </span>
                </div>
                <textarea
                  value={formData.questionTextEN}
                  onChange={(e) => setFormData({ ...formData, questionTextEN: e.target.value })}
                  className={cn(inputClass, "resize-y min-h-[100px]")}
                  rows={4}
                  placeholder="Enter the question in English..."
                />
              </div>
            </div>
          </div>

          {/* Help Text Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1 w-1 rounded-full bg-blue-500" />
              <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Help Text</span>
              <span className="text-[10px] text-muted-foreground">(Optional)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* French */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-7 items-center justify-center rounded overflow-hidden border border-border/50 shrink-0">
                      <QuebecFlag className="w-7 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      French
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground/60 tabular-nums">
                    {formData.helpText.length} chars
                  </span>
                </div>
                <textarea
                  value={formData.helpText}
                  onChange={(e) => setFormData({ ...formData, helpText: e.target.value })}
                  className={cn(inputClass, "resize-y min-h-[80px]")}
                  rows={3}
                  placeholder="Texte d'aide pour l'utilisateur..."
                />
              </div>

              {/* English */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-5 w-7 items-center justify-center rounded overflow-hidden border border-border/50 shrink-0">
                      <CA className="w-7 h-5" title="" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      English
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground/60 tabular-nums">
                    {formData.helpTextEN.length} chars
                  </span>
                </div>
                <textarea
                  value={formData.helpTextEN}
                  onChange={(e) => setFormData({ ...formData, helpTextEN: e.target.value })}
                  className={cn(inputClass, "resize-y min-h-[80px]")}
                  rows={3}
                  placeholder="Help text for the user..."
                />
              </div>
            </div>
          </div>

          {/* Configuration Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <div className="h-1 w-1 rounded-full bg-purple-500" />
              <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Configuration</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>
                  Question Type <span className="text-momentum-orange">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.questionType}
                    onChange={(e) => setFormData({ ...formData, questionType: e.target.value })}
                    className={selectClass}
                    required
                  >
                    {QUESTION_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  Step <span className="text-momentum-orange">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.stepNumber}
                    onChange={(e) => setFormData({ ...formData, stepNumber: Number(e.target.value) })}
                    className={selectClass}
                    required
                  >
                    {steps.map((step) => (
                      <option key={step.stepNumber} value={step.stepNumber}>
                        {step.stepNumber}. {getStepLabel(step.stepNumber)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Persona</label>
                <div className="relative">
                  <select
                    value={formData.personaType || '__all__'}
                    onChange={(e) => setFormData({ ...formData, personaType: e.target.value === '__all__' ? null : e.target.value })}
                    className={selectClass}
                  >
                    {PERSONA_TYPES.map((persona) => (
                      <option key={persona.value} value={persona.value}>{persona.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                  className={inputClass}
                  min={1}
                />
              </div>

              <div className="flex items-end pb-0.5">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.isRequired}
                      onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className={cn(
                      "w-11 h-6 rounded-full transition-colors duration-200",
                      formData.isRequired ? "bg-momentum-orange" : "bg-muted"
                    )} />
                    <div className={cn(
                      "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200",
                      formData.isRequired && "translate-x-5"
                    )} />
                  </div>
                  <span className="text-sm font-medium text-foreground">Required</span>
                </label>
              </div>
            </div>
          </div>

          {/* Options (for choice types) */}
          {needsOptions && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="h-1 w-1 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-foreground uppercase tracking-wide">Options</span>
                <span className="text-[10px] text-muted-foreground">(JSON Array)</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* French */}
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-5 w-7 items-center justify-center rounded overflow-hidden border border-border/50 shrink-0">
                      <QuebecFlag className="w-7 h-5" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      French
                    </span>
                  </div>
                  <textarea
                    value={formData.options}
                    onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                    className={cn(inputClass, "resize-none font-mono text-xs")}
                    rows={3}
                    placeholder='["Option 1", "Option 2"]'
                  />
                </div>

                {/* English */}
                <div className="relative">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-5 w-7 items-center justify-center rounded overflow-hidden border border-border/50 shrink-0">
                      <CA className="w-7 h-5" title="" />
                    </div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      English
                    </span>
                  </div>
                  <textarea
                    value={formData.optionsEN}
                    onChange={(e) => setFormData({ ...formData, optionsEN: e.target.value })}
                    className={cn(inputClass, "resize-none font-mono text-xs")}
                    rows={3}
                    placeholder='["Option 1", "Option 2"]'
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section Name */}
          <div>
            <label className={labelClass}>Section Name <span className="text-muted-foreground font-normal">(optional)</span></label>
            <input
              type="text"
              value={formData.section}
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              className={inputClass}
              placeholder="e.g. Business Overview"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border/50 flex items-center justify-end gap-3 bg-muted/30">
          <Button variant="ghost" onClick={onClose} className="px-6">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving || !formData.questionText}
            className="bg-momentum-orange hover:bg-momentum-orange/90 text-white px-6 shadow-lg shadow-momentum-orange/25"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} className="mr-2" />
                Save Question
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
