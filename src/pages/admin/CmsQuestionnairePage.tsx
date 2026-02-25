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
} from 'lucide-react';
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
        'group flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors',
        isDragging && 'bg-slate-100 shadow-lg rounded-lg',
        !question.isActive && 'opacity-50'
      )}
    >
      {/* Drag Handle */}
      {isEditMode && (
        <button
          {...attributes}
          {...listeners}
          className="p-1 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing touch-none"
          title="Drag to reorder"
        >
          <GripVertical size={18} />
        </button>
      )}

      {/* Order number */}
      <span className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-sm font-medium flex-shrink-0">
        {index + 1}
      </span>

      {/* Question info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">
          {getDisplayText(question.questionText, question.questionTextEN)}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {getQuestionTypeLabel(question.questionType)}
          </span>
          {question.isRequired && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600">
              Required
            </span>
          )}
          {question.personaType && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
              {question.personaType}
            </span>
          )}
          {question.section && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">
              {question.section}
            </span>
          )}
          {!question.isActive && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 text-slate-500">
              Inactive
            </span>
          )}
        </div>
      </div>

      {/* Actions - only show in edit mode */}
      {isEditMode && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-2 text-slate-400 hover:text-[#FF6B00] hover:bg-orange-50 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={onDuplicate}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Duplicate"
          >
            <Copy size={16} />
          </button>
          <button
            onClick={onToggleStatus}
            className={cn(
              'p-2 rounded-lg transition-colors',
              question.isActive
                ? 'text-green-500 hover:text-slate-600 hover:bg-slate-100'
                : 'text-slate-400 hover:text-green-600 hover:bg-green-50'
            )}
            title={question.isActive ? 'Deactivate' : 'Activate'}
          >
            {question.isActive ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 size={16} />
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

  // Get version badge info
  const getVersionBadge = () => {
    if (!activeVersion) return null;

    if (activeVersion.status === 'Draft') {
      return {
        label: `Draft v${activeVersion.versionNumber}`,
        className: 'bg-[#FF6B00]/10 text-[#FF6B00] border-[#FF6B00]/20',
      };
    }
    return {
      label: `Published v${activeVersion.versionNumber}`,
      className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    };
  };

  const versionBadge = getVersionBadge();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/admin/cms"
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                title="Back to CMS"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Questionnaire Editor</h1>
                <p className="text-sm text-slate-500">Manage questions, order, and content for the Growth Architect wizard</p>
              </div>
              {/* Version Badge */}
              {versionBadge && (
                <span className={cn(
                  'px-3 py-1 text-xs font-bold rounded-full border',
                  versionBadge.className
                )}>
                  {versionBadge.label}
                </span>
              )}
              {isDirty && isEditMode && (
                <span className="text-xs text-amber-600 font-medium">
                  Unsaved changes
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              {/* Version History Button */}
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-2"
              >
                <History size={16} />
                History
              </button>

              {/* Action buttons based on mode */}
              {!isEditMode ? (
                // View mode - show "Edit" button to create draft
                <button
                  onClick={handleCreateDraft}
                  disabled={isCreatingDraft}
                  className="bg-[#FF6B00] hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isCreatingDraft ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Creating Draft...
                    </>
                  ) : (
                    <>
                      <FileEdit size={16} />
                      Edit Questionnaire
                    </>
                  )}
                </button>
              ) : (
                // Edit mode - show Publish and Discard buttons
                <>
                  <button
                    onClick={handleDiscard}
                    disabled={isDiscarding}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isDiscarding ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Discarding...
                      </>
                    ) : (
                      <>
                        <XCircle size={16} />
                        Discard Draft
                      </>
                    )}
                  </button>
                  <button
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        Publish Changes
                      </>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Secondary toolbar */}
          <div className="flex items-center justify-between mt-4 border-t border-slate-100 pt-4 -mb-px">
            <div className="flex items-center gap-1">
              {/* Persona filter tabs */}
              {(['all', 'Entrepreneur', 'Consultant', 'OBNL'] as PersonaFilter[]).map((persona) => (
                <button
                  key={persona}
                  onClick={() => setPersonaFilter(persona)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium border-b-2 transition-all',
                    personaFilter === persona
                      ? 'border-[#FF6B00] text-[#FF6B00]'
                      : 'border-transparent text-slate-500 hover:text-slate-700'
                  )}
                >
                  {persona === 'all' ? 'All Personas' : persona}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {/* Language toggle */}
              <div className="flex items-center bg-slate-100 rounded-lg p-1">
                <button
                  onClick={() => setLanguage('en')}
                  className={cn(
                    'px-3 py-1.5 text-xs font-semibold rounded-md transition-all',
                    language === 'en'
                      ? 'bg-white text-[#FF6B00] shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('fr')}
                  className={cn(
                    'px-3 py-1.5 text-xs font-semibold rounded-md transition-all',
                    language === 'fr'
                      ? 'bg-white text-[#FF6B00] shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  FR
                </button>
              </div>

              {/* Show inactive toggle */}
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInactive}
                  onChange={(e) => setShowInactive(e.target.checked)}
                  className="rounded border-slate-300 text-[#FF6B00] focus:ring-[#FF6B00]"
                />
                Show inactive
              </label>

              {/* Add question button - only in edit mode */}
              {isEditMode && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-[#FF6B00] hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2"
                >
                  <Plus size={16} />
                  Add Question
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      {error && (
        <div className="max-w-7xl mx-auto px-6 mt-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle size={20} className="text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
            <button onClick={clearError} className="ml-auto text-red-500 hover:text-red-700">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="max-w-7xl mx-auto px-6 mt-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
            <CheckCircle size={20} className="text-green-500" />
            <span className="text-sm text-green-700">{successMessage}</span>
          </div>
        </div>
      )}

      {/* Read-only mode notice */}
      {!isEditMode && activeVersion && (
        <div className="max-w-7xl mx-auto px-6 mt-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
            <AlertCircle size={20} className="text-blue-500" />
            <span className="text-sm text-blue-700">
              You are viewing the published version. Click "Edit Questionnaire" to create a draft and make changes.
            </span>
          </div>
        </div>
      )}

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Coming Soon for Consultant and OBNL */}
        {(personaFilter === 'Consultant' || personaFilter === 'OBNL') ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="relative">
              {/* Background decoration */}
              <div className="absolute -inset-4 bg-gradient-to-r from-slate-100 to-slate-50 rounded-3xl -z-10" />

              {/* Icon */}
              <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium mb-4">
                <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                Coming Soon
              </div>
            </div>

            {/* Text content */}
            <h3 className="text-xl font-semibold text-slate-900 mb-2 text-center">
              {personaFilter} Questionnaire
            </h3>
            <p className="text-slate-500 text-center max-w-sm leading-relaxed">
              We're building specialized questions tailored for {personaFilter === 'OBNL' ? 'non-profit organizations' : 'business consultants'}. Check back soon.
            </p>
          </div>
        ) : isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[#FF6B00]" />
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
                    className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
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
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors group cursor-pointer"
                    >
                      <StepTitleEditor
                        step={step}
                        language={language}
                        isEditMode={isEditMode}
                        onSave={updateStep}
                      />
                      {isExpanded ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
                    </div>

                    {/* Questions list */}
                    {isExpanded && (
                      <div className="border-t border-slate-100">
                        {stepQuestions.length === 0 ? (
                          <div className="px-6 py-8 text-center text-slate-400">
                            <p className="mb-2">No questions in this step</p>
                            {isEditMode && (
                              <button
                                onClick={() => {
                                  setSelectedStep(step.stepNumber);
                                  setIsCreateModalOpen(true);
                                }}
                                className="text-[#FF6B00] hover:underline text-sm font-medium"
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
                              <div className="divide-y divide-slate-100">
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
                          <div className="px-6 py-3 border-t border-slate-100">
                            <button
                              onClick={() => {
                                setSelectedStep(step.stepNumber);
                                setIsCreateModalOpen(true);
                              }}
                              className="text-sm text-[#FF6B00] hover:text-orange-700 font-medium flex items-center gap-1"
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
              // Fallback when no steps data
              <div className="text-center py-20 text-slate-400">
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Question Text (FR) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Question Text (French) <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.questionText}
              onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent resize-none"
              rows={2}
              required
            />
          </div>

          {/* Question Text (EN) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Question Text (English)
            </label>
            <textarea
              value={formData.questionTextEN}
              onChange={(e) => setFormData({ ...formData, questionTextEN: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent resize-none"
              rows={2}
            />
          </div>

          {/* Help Text (FR) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Help Text (French)
            </label>
            <textarea
              value={formData.helpText}
              onChange={(e) => setFormData({ ...formData, helpText: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent resize-none"
              rows={2}
              placeholder="Additional guidance for the user..."
            />
          </div>

          {/* Help Text (EN) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Help Text (English)
            </label>
            <textarea
              value={formData.helpTextEN}
              onChange={(e) => setFormData({ ...formData, helpTextEN: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent resize-none"
              rows={2}
              placeholder="Additional guidance for the user..."
            />
          </div>

          {/* Row: Type, Step, Persona */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Question Type <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.questionType}
                onChange={(e) => setFormData({ ...formData, questionType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
                required
              >
                {QUESTION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Step <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.stepNumber}
                onChange={(e) => setFormData({ ...formData, stepNumber: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
                required
              >
                {steps.map((step) => (
                  <option key={step.stepNumber} value={step.stepNumber}>
                    {step.stepNumber}. {getStepLabel(step.stepNumber)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Persona
              </label>
              <select
                value={formData.personaType || '__all__'}
                onChange={(e) => setFormData({ ...formData, personaType: e.target.value === '__all__' ? null : e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
              >
                {PERSONA_TYPES.map((persona) => (
                  <option key={persona.value} value={persona.value}>{persona.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row: Order, Required */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Order
              </label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
                min={1}
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isRequired}
                  onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                  className="rounded border-slate-300 text-[#FF6B00] focus:ring-[#FF6B00] w-5 h-5"
                />
                <span className="text-sm font-medium text-slate-700">Required</span>
              </label>
            </div>
          </div>

          {/* Options (for choice types) */}
          {needsOptions && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Options (French) - JSON Array
                </label>
                <textarea
                  value={formData.options}
                  onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent font-mono text-sm resize-none"
                  rows={3}
                  placeholder='["Option 1", "Option 2", "Option 3"]'
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Options (English) - JSON Array
                </label>
                <textarea
                  value={formData.optionsEN}
                  onChange={(e) => setFormData({ ...formData, optionsEN: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent font-mono text-sm resize-none"
                  rows={3}
                  placeholder='["Option 1", "Option 2", "Option 3"]'
                />
              </div>
            </>
          )}

          {/* Section */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Section Name (optional)
            </label>
            <input
              type="text"
              value={formData.section}
              onChange={(e) => setFormData({ ...formData, section: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent"
              placeholder="e.g. Business Overview"
            />
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving || !formData.questionText}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#FF6B00] hover:bg-orange-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Question
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
