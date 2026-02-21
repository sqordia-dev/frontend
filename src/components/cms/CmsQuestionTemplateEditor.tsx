import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  GripVertical,
  Edit2,
  Trash2,
  Save,
  X,
  AlertCircle,
  CheckCircle,
  Loader2,
  Copy,
  ToggleLeft,
  ToggleRight,
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
import { adminQuestionTemplateService } from '../../lib/admin-question-template-service';
import type {
  AdminQuestionTemplate,
  CreateQuestionTemplateRequest,
  UpdateQuestionTemplateRequest,
} from '../../types/admin-question-template';
import { QUESTION_TYPES, PERSONA_TYPES, STEP_DEFINITIONS } from '../../types/admin-question-template';
import { cn } from '@/lib/utils';
import { getUserFriendlyError } from '../../utils/error-messages';

type PersonaFilter = 'all' | 'Entrepreneur' | 'Consultant' | 'OBNL';
type Language = 'en' | 'fr';

interface CmsQuestionTemplateEditorProps {
  selectedStepNumber: number;
  stepLabel?: string; // Dynamic label from CMS
}

// Sortable Question Item Component
interface SortableQuestionItemProps {
  question: AdminQuestionTemplate;
  index: number;
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
  } = useSortable({ id: question.id });

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
        'group flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors',
        isDragging && 'bg-slate-100 shadow-lg rounded-lg',
        !question.isActive && 'opacity-50'
      )}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="p-1 text-slate-400 hover:text-slate-600 cursor-grab active:cursor-grabbing touch-none"
        title="Drag to reorder"
      >
        <GripVertical size={16} />
      </button>

      {/* Order number */}
      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-medium flex-shrink-0">
        {index + 1}
      </span>

      {/* Question info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-900 truncate">
          {getDisplayText(question.questionText, question.questionTextEN)}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
            {getQuestionTypeLabel(question.questionType)}
          </span>
          {question.isRequired && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-50 text-red-600">
              Required
            </span>
          )}
          {question.personaType && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600">
              {question.personaType}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-1.5 text-slate-400 hover:text-[#FF6B00] hover:bg-orange-50 rounded transition-colors"
          title="Edit"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={onDuplicate}
          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          title="Duplicate"
        >
          <Copy size={14} />
        </button>
        <button
          onClick={onToggleStatus}
          className={cn(
            'p-1.5 rounded transition-colors',
            question.isActive
              ? 'text-green-500 hover:text-slate-600 hover:bg-slate-100'
              : 'text-slate-400 hover:text-green-600 hover:bg-green-50'
          )}
          title={question.isActive ? 'Deactivate' : 'Activate'}
        >
          {question.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

export function CmsQuestionTemplateEditor({ selectedStepNumber, stepLabel: propStepLabel }: CmsQuestionTemplateEditorProps) {
  // State
  const [questions, setQuestions] = useState<AdminQuestionTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filters
  const [personaFilter, setPersonaFilter] = useState<PersonaFilter>('all');
  const [language, setLanguage] = useState<Language>('en');
  const [showInactive, setShowInactive] = useState(false);

  // UI State
  const [editingQuestion, setEditingQuestion] = useState<AdminQuestionTemplate | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch questions for selected step
  const fetchQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const params: { stepNumber?: number; personaType?: string; isActive?: boolean } = {
        stepNumber: selectedStepNumber,
      };

      if (personaFilter !== 'all') {
        params.personaType = personaFilter;
      }
      if (!showInactive) {
        params.isActive = true;
      }

      const data = await adminQuestionTemplateService.getAll(params);
      // Sort by order
      data.sort((a, b) => a.order - b.order);
      setQuestions(data);
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'load'));
    } finally {
      setIsLoading(false);
    }
  }, [selectedStepNumber, personaFilter, showInactive]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

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
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex(q => q.id === active.id);
    const newIndex = questions.findIndex(q => q.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    // Optimistically update UI
    const reorderedQuestions = arrayMove(questions, oldIndex, newIndex);
    setQuestions(reorderedQuestions);

    // Prepare reorder request
    const reorderItems = reorderedQuestions.map((q, index) => ({
      questionId: q.id,
      order: index + 1,
    }));

    try {
      await adminQuestionTemplateService.reorder(reorderItems);
      setSuccessMessage('Questions reordered');
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'save'));
      await fetchQuestions();
    }
  };

  // Handle create question
  const handleCreateQuestion = async (data: CreateQuestionTemplateRequest) => {
    try {
      setIsSaving(true);
      await adminQuestionTemplateService.create(data);
      setSuccessMessage('Question created');
      setIsCreateModalOpen(false);
      await fetchQuestions();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'save'));
    } finally {
      setIsSaving(false);
    }
  };

  // Handle update question
  const handleUpdateQuestion = async (id: string, data: UpdateQuestionTemplateRequest) => {
    try {
      setIsSaving(true);
      await adminQuestionTemplateService.update(id, data);
      setSuccessMessage('Question updated');
      setEditingQuestion(null);
      await fetchQuestions();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'save'));
    } finally {
      setIsSaving(false);
    }
  };

  // Handle delete question
  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Are you sure you want to delete this question?')) return;

    try {
      await adminQuestionTemplateService.delete(id);
      setSuccessMessage('Question deleted');
      await fetchQuestions();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'delete'));
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await adminQuestionTemplateService.toggleStatus(id, !currentStatus);
      setSuccessMessage(`Question ${currentStatus ? 'deactivated' : 'activated'}`);
      await fetchQuestions();
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'save'));
    }
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
      order: questions.length + 1,
      isRequired: question.isRequired,
      section: question.section || undefined,
      options: question.options || undefined,
      optionsEN: question.optionsEN || undefined,
    };

    await handleCreateQuestion(newQuestion);
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

  // Get step label - use prop if provided (full label from CMS), otherwise build from STEP_DEFINITIONS
  const stepDef = STEP_DEFINITIONS.find(s => s.number === selectedStepNumber);
  const fallbackLabel = language === 'fr' ? stepDef?.labelFR : stepDef?.label;
  // CMS label is the full label (e.g., "Step 1: Vision & Mission"), fallback needs prefix
  const headerLabel = propStepLabel || `Step ${selectedStepNumber}: ${fallbackLabel}`;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {headerLabel}
            </h2>
            <p className="text-sm text-slate-500">{questions.length} questions</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Language toggle */}
            <div className="flex items-center bg-slate-100 rounded-lg p-0.5">
              <button
                onClick={() => setLanguage('en')}
                className={cn(
                  'px-2.5 py-1 text-xs font-semibold rounded-md transition-all',
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
                  'px-2.5 py-1 text-xs font-semibold rounded-md transition-all',
                  language === 'fr'
                    ? 'bg-white text-[#FF6B00] shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                )}
              >
                FR
              </button>
            </div>

            {/* Show inactive */}
            <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-slate-300 text-[#FF6B00] focus:ring-[#FF6B00] w-3.5 h-3.5"
              />
              Inactive
            </label>

            {/* Add button */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-[#FF6B00] hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5"
            >
              <Plus size={14} />
              Add
            </button>
          </div>
        </div>

        {/* Persona filter */}
        <div className="flex items-center gap-1 mt-3">
          {(['all', 'Entrepreneur', 'Consultant', 'OBNL'] as PersonaFilter[]).map((persona) => (
            <button
              key={persona}
              onClick={() => setPersonaFilter(persona)}
              className={cn(
                'px-3 py-1 text-xs font-medium rounded-full transition-all',
                personaFilter === persona
                  ? 'bg-[#FF6B00] text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              )}
            >
              {persona === 'all' ? 'All' : persona}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
          <AlertCircle size={16} className="text-red-500" />
          <span className="text-sm text-red-700 flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <X size={14} />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mx-6 mt-4 bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
          <CheckCircle size={16} className="text-green-500" />
          <span className="text-sm text-green-700">{successMessage}</span>
        </div>
      )}

      {/* Questions list */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-[#FF6B00]" />
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <p className="mb-2">No questions in this step</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="text-[#FF6B00] hover:underline text-sm font-medium"
            >
              Add first question
            </button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={questions.map(q => q.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="divide-y divide-slate-100">
                {questions.map((question, index) => (
                  <SortableQuestionItem
                    key={question.id}
                    question={question}
                    index={index}
                    getDisplayText={getDisplayText}
                    getQuestionTypeLabel={getQuestionTypeLabel}
                    onEdit={() => setEditingQuestion(question)}
                    onDuplicate={() => handleDuplicateQuestion(question)}
                    onToggleStatus={() => handleToggleStatus(question.id, question.isActive)}
                    onDelete={() => handleDeleteQuestion(question.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Create Question Modal */}
      {isCreateModalOpen && (
        <QuestionModal
          title="Create New Question"
          initialData={{
            stepNumber: selectedStepNumber,
            questionType: 'ShortText',
            isRequired: false,
            order: questions.length + 1,
          }}
          onSave={handleCreateQuestion}
          onClose={() => setIsCreateModalOpen(false)}
          isSaving={isSaving}
        />
      )}

      {/* Edit Question Modal */}
      {editingQuestion && (
        <QuestionModal
          title="Edit Question"
          initialData={editingQuestion}
          onSave={(data) => handleUpdateQuestion(editingQuestion.id, data as UpdateQuestionTemplateRequest)}
          onClose={() => setEditingQuestion(null)}
          isSaving={isSaving}
        />
      )}
    </div>
  );
}

// Question Modal Component
interface QuestionModalProps {
  title: string;
  initialData: Partial<AdminQuestionTemplate> & { stepNumber: number; questionType: string; isRequired: boolean; order: number };
  onSave: (data: CreateQuestionTemplateRequest) => Promise<void>;
  onClose: () => void;
  isSaving: boolean;
}

function QuestionModal({ title, initialData, onSave, onClose, isSaving }: QuestionModalProps) {
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
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Question Text (FR) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Question Text (French) <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.questionText}
              onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent resize-none text-sm"
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
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent resize-none text-sm"
              rows={2}
            />
          </div>

          {/* Help Text */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Help Text (FR)</label>
              <input
                type="text"
                value={formData.helpText}
                onChange={(e) => setFormData({ ...formData, helpText: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Help Text (EN)</label>
              <input
                type="text"
                value={formData.helpTextEN}
                onChange={(e) => setFormData({ ...formData, helpTextEN: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Row: Type, Persona */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
              <select
                value={formData.questionType}
                onChange={(e) => setFormData({ ...formData, questionType: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent text-sm"
              >
                {QUESTION_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Persona</label>
              <select
                value={formData.personaType || '__all__'}
                onChange={(e) => setFormData({ ...formData, personaType: e.target.value === '__all__' ? null : e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent text-sm"
              >
                {PERSONA_TYPES.map((persona) => (
                  <option key={persona.value} value={persona.value}>{persona.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Required checkbox */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isRequired}
              onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
              className="rounded border-slate-300 text-[#FF6B00] focus:ring-[#FF6B00] w-4 h-4"
            />
            <span className="text-sm font-medium text-slate-700">Required question</span>
          </label>

          {/* Options (for choice types) */}
          {needsOptions && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Options (FR) - JSON</label>
                <textarea
                  value={formData.options}
                  onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent font-mono text-xs resize-none"
                  rows={3}
                  placeholder='["Option 1", "Option 2"]'
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Options (EN) - JSON</label>
                <textarea
                  value={formData.optionsEN}
                  onChange={(e) => setFormData({ ...formData, optionsEN: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent font-mono text-xs resize-none"
                  rows={3}
                  placeholder='["Option 1", "Option 2"]'
                />
              </div>
            </div>
          )}
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
                <Loader2 size={14} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={14} />
                Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
