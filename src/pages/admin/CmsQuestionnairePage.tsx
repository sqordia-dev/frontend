import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../lib/auth-service';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { MobileBottomNav, type NavItemConfig } from '@/components/layout/MobileBottomNav';
import {
  ArrowLeft,
  History,
  Send,
  Loader2,
  X,
  ChevronRight,
  ChevronDown,
  Search,
  Plus,
  GripVertical,
  Trash2,
  Copy,
  ToggleLeft,
  ToggleRight,
  FileEdit,
  XCircle,
  CheckCircle,
  AlertCircle,
  Save,
  Pencil,
  ClipboardList,
  Layers,
  Sparkles,
  Bot,
  Play,
  Zap,
  LayoutDashboard,
  Users,
  Palette,
  ListTodo,
} from 'lucide-react';
import CA from 'country-flag-icons/react/3x2/CA';
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
import { QuestionnaireVersionHistorySidebar } from '../../components/admin/questionnaire/QuestionnaireVersionHistorySidebar';
import { StepTitleEditor } from '../../components/admin/questionnaire/StepTitleEditor';
import { questionnaireVersionService } from '../../lib/questionnaire-version-service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cmsAiService } from '../../lib/cms-ai-service';
import { adminQuestionTemplateService, type TestCoachPromptResponse } from '../../lib/admin-question-template-service';

// Quebec Flag Component
const QuebecFlag = ({ className = '' }: { className?: string }) => (
  <img
    src="/quebec-flag.svg"
    alt="French"
    className={className}
    style={{ objectFit: 'contain', display: 'block' }}
  />
);

type PersonaFilter = 'all' | 'Entrepreneur' | 'Consultant' | 'OBNL';
type Language = 'en' | 'fr';

// Step colors
const stepColors: Record<number, string> = {
  1: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
  2: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
  3: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
  4: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
  5: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-200 dark:border-pink-800',
  6: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800',
  7: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
};

// Sortable Question Row
interface SortableQuestionRowProps {
  question: AdminQuestionTemplate;
  language: Language;
  isEditMode: boolean;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
}

function SortableQuestionRow({
  question,
  language,
  isEditMode,
  onEdit,
  onToggleStatus,
  onDelete,
  onDuplicate,
}: SortableQuestionRowProps) {
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

  const displayText = language === 'en' && question.questionTextEN
    ? question.questionTextEN
    : question.questionText || question.questionTextEN || '';

  const helpText = language === 'en' && question.helpTextEN
    ? question.helpTextEN
    : question.helpText || '';

  const truncatedHelp = helpText.length > 80 ? helpText.substring(0, 80) + '...' : helpText;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors cursor-pointer border-b border-border/30 last:border-b-0",
        !question.isActive && "opacity-50",
        isDragging && "shadow-lg bg-card rounded-lg border border-border"
      )}
      onClick={onEdit}
    >
      {/* Drag Handle */}
      {isEditMode && (
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="p-1 text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing touch-none rounded hover:bg-muted transition-colors shrink-0 opacity-0 group-hover:opacity-100"
          title="Drag to reorder"
        >
          <GripVertical size={14} />
        </button>
      )}

      {/* Order number */}
      <div className="w-6 h-6 rounded-md bg-muted/50 flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
        {question.order}
      </div>

      {/* Question content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{displayText}</p>
        {truncatedHelp && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{truncatedHelp}</p>
        )}
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 shrink-0">
        {question.isRequired && (
          <Badge variant="destructive" className="text-[9px] h-5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
            Required
          </Badge>
        )}
        <Badge variant="secondary" className="text-[9px] h-5">
          {QUESTION_TYPES.find(t => t.value === question.questionType)?.label || question.questionType}
        </Badge>
        {!question.isActive && (
          <Badge variant="outline" className="text-[9px] h-5">
            Inactive
          </Badge>
        )}
      </div>

      {/* Actions */}
      {isEditMode ? (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <button
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            className="p-1.5 text-muted-foreground hover:text-blue-500 hover:bg-blue-500/10 rounded transition-colors"
            title="Duplicate"
          >
            <Copy size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleStatus(); }}
            className={cn(
              'p-1.5 rounded transition-colors',
              question.isActive
                ? 'text-emerald-500 hover:text-muted-foreground hover:bg-muted'
                : 'text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10'
            )}
            title={question.isActive ? 'Deactivate' : 'Activate'}
          >
            {question.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded transition-colors"
            title="Delete"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
          <span className="text-xs text-momentum-orange font-medium">View</span>
          <Pencil size={14} className="text-momentum-orange" />
        </div>
      )}
    </div>
  );
}

// Question Editor Slide-over
interface QuestionEditorProps {
  question: AdminQuestionTemplate | null;
  isNew: boolean;
  steps: { stepNumber: number; titleFR: string; titleEN: string | null }[];
  selectedStep: number;
  isEditMode: boolean;
  isSaving: boolean;
  onSave: (data: CreateQuestionTemplateRequest | UpdateQuestionTemplateRequest) => Promise<void>;
  onClose: () => void;
}

function QuestionEditor({
  question,
  isNew,
  steps,
  selectedStep,
  isEditMode,
  isSaving,
  onSave,
  onClose,
}: QuestionEditorProps) {
  const toast = useToast();
  const [formData, setFormData] = useState({
    questionText: '',
    questionTextEN: '',
    helpText: '',
    helpTextEN: '',
    questionType: 'ShortText',
    stepNumber: selectedStep,
    personaType: null as string | null,
    order: 1,
    isRequired: false,
    section: '',
    options: '',
    optionsEN: '',
    expertAdviceFR: '',
    expertAdviceEN: '',
    coachPromptFR: '',
    coachPromptEN: '',
  });

  // Tab state for expert/coach sections
  const [activeTab, setActiveTab] = useState<'basic' | 'expert' | 'coach'>('basic');

  // AI generation states
  const [isGeneratingExpertFR, setIsGeneratingExpertFR] = useState(false);
  const [isGeneratingExpertEN, setIsGeneratingExpertEN] = useState(false);
  const [isGeneratingCoachFR, setIsGeneratingCoachFR] = useState(false);
  const [isGeneratingCoachEN, setIsGeneratingCoachEN] = useState(false);

  // Test coach prompt states
  const [testAnswer, setTestAnswer] = useState('');
  const [testLanguage, setTestLanguage] = useState<'fr' | 'en'>('fr');
  const [isTestingPrompt, setIsTestingPrompt] = useState(false);
  const [testResult, setTestResult] = useState<TestCoachPromptResponse | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  // AI generation handler
  const handleAiGenerate = async (
    brief: string,
    language: string,
    field: keyof typeof formData,
    setLoading: (v: boolean) => void,
  ) => {
    const currentValue = formData[field] as string;
    if (currentValue && !confirm('This will overwrite existing content. Continue?')) return;
    setLoading(true);
    try {
      const result = await cmsAiService.generate({
        brief,
        blockType: 'Text',
        language,
        sectionContext: 'questionnaire',
      });
      setFormData(prev => ({ ...prev, [field]: result.content }));
    } catch (err) {
      console.error('AI generation failed:', err);
      toast.error('AI Generation Error', 'AI generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Test coach prompt handler
  const handleTestCoachPrompt = async () => {
    if (!question?.id) return;
    setIsTestingPrompt(true);
    setTestResult(null);
    setTestError(null);
    try {
      const result = await adminQuestionTemplateService.testCoachPrompt(question.id, {
        answer: testAnswer,
        language: testLanguage,
      });
      setTestResult(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Test failed. Make sure the question is saved with a coach prompt.';
      setTestError(message);
    } finally {
      setIsTestingPrompt(false);
    }
  };

  useEffect(() => {
    if (question) {
      setFormData({
        questionText: question.questionText || '',
        questionTextEN: question.questionTextEN || '',
        helpText: question.helpText || '',
        helpTextEN: question.helpTextEN || '',
        questionType: question.questionType,
        stepNumber: question.stepNumber || 1,
        personaType: question.personaType,
        order: question.order,
        isRequired: question.isRequired,
        section: question.section || '',
        options: question.options || '',
        optionsEN: question.optionsEN || '',
        expertAdviceFR: question.expertAdviceFR || '',
        expertAdviceEN: question.expertAdviceEN || '',
        coachPromptFR: question.coachPromptFR || '',
        coachPromptEN: question.coachPromptEN || '',
      });
    } else if (isNew) {
      setFormData({
        questionText: '',
        questionTextEN: '',
        helpText: '',
        helpTextEN: '',
        questionType: 'ShortText',
        stepNumber: selectedStep,
        personaType: null,
        order: 1,
        isRequired: false,
        section: '',
        options: '',
        optionsEN: '',
        expertAdviceFR: '',
        expertAdviceEN: '',
        coachPromptFR: '',
        coachPromptEN: '',
      });
    }
  }, [question, isNew, selectedStep]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave({
      ...formData,
      personaType: formData.personaType === '__all__' ? null : formData.personaType,
      options: formData.options || undefined,
      optionsEN: formData.optionsEN || undefined,
      expertAdviceFR: formData.expertAdviceFR || undefined,
      expertAdviceEN: formData.expertAdviceEN || undefined,
      coachPromptFR: formData.coachPromptFR || undefined,
      coachPromptEN: formData.coachPromptEN || undefined,
    });
  };

  const needsOptions = ['SingleChoice', 'MultipleChoice', 'Scale'].includes(formData.questionType);

  const getStepLabel = (stepNumber: number) => {
    const step = steps.find(s => s.stepNumber === stepNumber);
    return step?.titleEN || step?.titleFR || `Step ${stepNumber}`;
  };

  const inputClass = "w-full px-3 py-2.5 border border-border/60 rounded-lg bg-muted/30 hover:bg-muted/50 focus:bg-background focus:ring-2 focus:ring-momentum-orange/20 focus:border-momentum-orange transition-all text-sm";
  const selectClass = "w-full px-3 py-2.5 border border-border/60 rounded-lg bg-muted/30 hover:bg-muted/50 focus:bg-background focus:ring-2 focus:ring-momentum-orange/20 focus:border-momentum-orange transition-all text-sm appearance-none cursor-pointer";
  const labelClass = "block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-card border-l border-border/50 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="h-14 border-b border-border/50 px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                {isNew ? 'New Question' : isEditMode ? 'Edit Question' : 'View Question'}
              </h2>
              {question && (
                <p className="text-[10px] text-muted-foreground">Order: {question.order}</p>
              )}
            </div>
          </div>
          {isEditMode && (
            <Button
              onClick={handleSubmit}
              disabled={isSaving || !formData.questionText}
              className="bg-momentum-orange hover:bg-momentum-orange/90 text-white h-8 text-xs"
            >
              {isSaving ? (
                <Loader2 size={14} className="mr-1.5 animate-spin" />
              ) : (
                <Save size={14} className="mr-1.5" />
              )}
              {isNew ? 'Create' : 'Save'}
            </Button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Tabs */}
          <div className="sticky top-0 bg-card border-b border-border/50 px-6 pt-4 pb-0 z-10">
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1 w-fit">
              <button
                onClick={() => setActiveTab('basic')}
                className={cn(
                  'px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5',
                  activeTab === 'basic'
                    ? 'bg-card text-momentum-orange shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Pencil size={12} />
                Basic
              </button>
              <button
                onClick={() => setActiveTab('expert')}
                className={cn(
                  'px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5',
                  activeTab === 'expert'
                    ? 'bg-card text-momentum-orange shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Sparkles size={12} />
                Expert Tips
                {(formData.expertAdviceFR || formData.expertAdviceEN) && (
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('coach')}
                className={cn(
                  'px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5',
                  activeTab === 'coach'
                    ? 'bg-card text-momentum-orange shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Bot size={12} />
                AI Coach
                {(formData.coachPromptFR || formData.coachPromptEN) && (
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                )}
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
          {/* BASIC TAB */}
          {activeTab === 'basic' && (
            <>
          {/* Question Text - Side by side */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-1 w-1 rounded-full bg-momentum-orange" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wide">Question Text</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="flex h-4 w-6 items-center justify-center rounded overflow-hidden border border-border/50">
                    <QuebecFlag className="w-6 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">
                    FR <span className="text-momentum-orange">*</span>
                  </span>
                </div>
                <textarea
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  className={cn(inputClass, "resize-none h-24")}
                  required
                  disabled={!isEditMode}
                  placeholder="Entrez la question..."
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="flex h-4 w-6 items-center justify-center rounded overflow-hidden border border-border/50">
                    <CA className="w-6 h-4" title="" />
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">EN</span>
                </div>
                <textarea
                  value={formData.questionTextEN}
                  onChange={(e) => setFormData({ ...formData, questionTextEN: e.target.value })}
                  className={cn(inputClass, "resize-none h-24")}
                  disabled={!isEditMode}
                  placeholder="Enter question..."
                />
              </div>
            </div>
          </div>

          {/* Help Text */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-1 w-1 rounded-full bg-blue-500" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wide">Help Text</span>
              <span className="text-[10px] text-muted-foreground">(optional)</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="flex h-4 w-6 items-center justify-center rounded overflow-hidden border border-border/50">
                    <QuebecFlag className="w-6 h-4" />
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">FR</span>
                </div>
                <textarea
                  value={formData.helpText}
                  onChange={(e) => setFormData({ ...formData, helpText: e.target.value })}
                  className={cn(inputClass, "resize-none h-16")}
                  disabled={!isEditMode}
                  placeholder="Texte d'aide..."
                />
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="flex h-4 w-6 items-center justify-center rounded overflow-hidden border border-border/50">
                    <CA className="w-6 h-4" title="" />
                  </div>
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">EN</span>
                </div>
                <textarea
                  value={formData.helpTextEN}
                  onChange={(e) => setFormData({ ...formData, helpTextEN: e.target.value })}
                  className={cn(inputClass, "resize-none h-16")}
                  disabled={!isEditMode}
                  placeholder="Help text..."
                />
              </div>
            </div>
          </div>

          {/* Configuration */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-1 w-1 rounded-full bg-purple-500" />
              <span className="text-xs font-bold text-foreground uppercase tracking-wide">Configuration</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelClass}>Type <span className="text-momentum-orange">*</span></label>
                <div className="relative">
                  <select
                    value={formData.questionType}
                    onChange={(e) => setFormData({ ...formData, questionType: e.target.value })}
                    className={selectClass}
                    required
                    disabled={!isEditMode}
                  >
                    {QUESTION_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Step <span className="text-momentum-orange">*</span></label>
                <div className="relative">
                  <select
                    value={formData.stepNumber}
                    onChange={(e) => setFormData({ ...formData, stepNumber: Number(e.target.value) })}
                    className={selectClass}
                    required
                    disabled={!isEditMode}
                  >
                    {steps.map((step) => (
                      <option key={step.stepNumber} value={step.stepNumber}>
                        {step.stepNumber}. {getStepLabel(step.stepNumber)}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              <div>
                <label className={labelClass}>Persona</label>
                <div className="relative">
                  <select
                    value={formData.personaType || '__all__'}
                    onChange={(e) => setFormData({ ...formData, personaType: e.target.value === '__all__' ? null : e.target.value })}
                    className={selectClass}
                    disabled={!isEditMode}
                  >
                    {PERSONA_TYPES.map((persona) => (
                      <option key={persona.value} value={persona.value}>{persona.label}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <label className={labelClass}>Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                  className={inputClass}
                  min={1}
                  disabled={!isEditMode}
                />
              </div>

              <div>
                <label className={labelClass}>Section</label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className={inputClass}
                  placeholder="e.g. Overview"
                  disabled={!isEditMode}
                />
              </div>

              <div className="flex items-end pb-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={formData.isRequired}
                      onChange={(e) => setFormData({ ...formData, isRequired: e.target.checked })}
                      className="sr-only peer"
                      disabled={!isEditMode}
                    />
                    <div className={cn(
                      "w-9 h-5 rounded-full transition-colors duration-200",
                      formData.isRequired ? "bg-momentum-orange" : "bg-muted",
                      !isEditMode && "opacity-50"
                    )} />
                    <div className={cn(
                      "absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200",
                      formData.isRequired && "translate-x-4"
                    )} />
                  </div>
                  <span className="text-xs font-medium text-foreground">Required</span>
                </label>
              </div>
            </div>
          </div>

          {/* Options */}
          {needsOptions && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-1 w-1 rounded-full bg-emerald-500" />
                <span className="text-xs font-bold text-foreground uppercase tracking-wide">Options</span>
                <span className="text-[10px] text-muted-foreground">(JSON array)</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="flex h-4 w-6 items-center justify-center rounded overflow-hidden border border-border/50">
                      <QuebecFlag className="w-6 h-4" />
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">FR</span>
                  </div>
                  <textarea
                    value={formData.options}
                    onChange={(e) => setFormData({ ...formData, options: e.target.value })}
                    className={cn(inputClass, "resize-none font-mono text-[11px] h-20")}
                    placeholder='["Option 1", "Option 2"]'
                    disabled={!isEditMode}
                  />
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="flex h-4 w-6 items-center justify-center rounded overflow-hidden border border-border/50">
                      <CA className="w-6 h-4" title="" />
                    </div>
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase">EN</span>
                  </div>
                  <textarea
                    value={formData.optionsEN}
                    onChange={(e) => setFormData({ ...formData, optionsEN: e.target.value })}
                    className={cn(inputClass, "resize-none font-mono text-[11px] h-20")}
                    placeholder='["Option 1", "Option 2"]'
                    disabled={!isEditMode}
                  />
                </div>
              </div>
            </div>
          )}
            </>
          )}

          {/* EXPERT TIPS TAB */}
          {activeTab === 'expert' && (
            <div className="space-y-6">
              <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Sparkles size={18} className="text-orange-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-orange-800 dark:text-orange-300">Expert Tips (Conseil d'expert)</h3>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                      These tips appear in the "Need help?" bubble when users need guidance answering questions.
                      Use clear, actionable advice with examples.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-4 w-6 items-center justify-center rounded overflow-hidden border border-border/50">
                        <QuebecFlag className="w-6 h-4" />
                      </div>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">FR</span>
                    </div>
                    {isEditMode && (
                      <button
                        onClick={() => handleAiGenerate(
                          `Generate expert advice in French for this business plan question: ${formData.questionText}`,
                          'fr',
                          'expertAdviceFR',
                          setIsGeneratingExpertFR,
                        )}
                        disabled={isGeneratingExpertFR || !formData.questionText}
                        className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isGeneratingExpertFR ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                        Generate
                      </button>
                    )}
                  </div>
                  <textarea
                    value={formData.expertAdviceFR}
                    onChange={(e) => setFormData({ ...formData, expertAdviceFR: e.target.value })}
                    className={cn(inputClass, "resize-none h-64 text-sm leading-relaxed")}
                    placeholder="Conseil d'expert pour bien répondre :&#10;&#10;Décrivez les points clés...&#10;&#10;Astuce : ..."
                    disabled={!isEditMode}
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {formData.expertAdviceFR.length} characters
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-4 w-6 items-center justify-center rounded overflow-hidden border border-border/50">
                        <CA className="w-6 h-4" title="" />
                      </div>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">EN</span>
                    </div>
                    {isEditMode && (
                      <button
                        onClick={() => handleAiGenerate(
                          `Generate expert advice in English for this business plan question: ${formData.questionText || formData.questionTextEN}`,
                          'en',
                          'expertAdviceEN',
                          setIsGeneratingExpertEN,
                        )}
                        disabled={isGeneratingExpertEN || (!formData.questionText && !formData.questionTextEN)}
                        className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isGeneratingExpertEN ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
                        Generate
                      </button>
                    )}
                  </div>
                  <textarea
                    value={formData.expertAdviceEN}
                    onChange={(e) => setFormData({ ...formData, expertAdviceEN: e.target.value })}
                    className={cn(inputClass, "resize-none h-64 text-sm leading-relaxed")}
                    placeholder="Expert advice for a good answer:&#10;&#10;Describe key points...&#10;&#10;Tip: ..."
                    disabled={!isEditMode}
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {formData.expertAdviceEN.length} characters
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* AI COACH TAB */}
          {activeTab === 'coach' && (
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Bot size={18} className="text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300">AI Coach Prompts</h3>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      These prompts are used by the AI to generate personalized suggestions for users.
                      Include context analysis steps and response format instructions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-4 w-6 items-center justify-center rounded overflow-hidden border border-border/50">
                        <QuebecFlag className="w-6 h-4" />
                      </div>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">FR</span>
                    </div>
                    {isEditMode && (
                      <button
                        onClick={() => handleAiGenerate(
                          `Generate an AI coach system prompt in French for this business plan question: ${formData.questionText}. The prompt should instruct the AI to analyze the user's answer and provide personalized coaching suggestions.`,
                          'fr',
                          'coachPromptFR',
                          setIsGeneratingCoachFR,
                        )}
                        disabled={isGeneratingCoachFR || !formData.questionText}
                        className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isGeneratingCoachFR ? <Loader2 size={10} className="animate-spin" /> : <Bot size={10} />}
                        Generate
                      </button>
                    )}
                  </div>
                  <textarea
                    value={formData.coachPromptFR}
                    onChange={(e) => setFormData({ ...formData, coachPromptFR: e.target.value })}
                    className={cn(inputClass, "resize-none h-80 text-sm font-mono leading-relaxed")}
                    placeholder="Tu es un expert en...&#10;&#10;ÉTAPE 1 : ANALYSE DU CONTEXTE&#10;...&#10;&#10;ÉTAPE 2 : GÉNÉRATION&#10;..."
                    disabled={!isEditMode}
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {formData.coachPromptFR.length} characters
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <div className="flex h-4 w-6 items-center justify-center rounded overflow-hidden border border-border/50">
                        <CA className="w-6 h-4" title="" />
                      </div>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">EN</span>
                    </div>
                    {isEditMode && (
                      <button
                        onClick={() => handleAiGenerate(
                          `Generate an AI coach system prompt in English for this business plan question: ${formData.questionText || formData.questionTextEN}. The prompt should instruct the AI to analyze the user's answer and provide personalized coaching suggestions.`,
                          'en',
                          'coachPromptEN',
                          setIsGeneratingCoachEN,
                        )}
                        disabled={isGeneratingCoachEN || (!formData.questionText && !formData.questionTextEN)}
                        className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {isGeneratingCoachEN ? <Loader2 size={10} className="animate-spin" /> : <Bot size={10} />}
                        Generate
                      </button>
                    )}
                  </div>
                  <textarea
                    value={formData.coachPromptEN}
                    onChange={(e) => setFormData({ ...formData, coachPromptEN: e.target.value })}
                    className={cn(inputClass, "resize-none h-80 text-sm font-mono leading-relaxed")}
                    placeholder="You are an expert in...&#10;&#10;STEP 1: CONTEXT ANALYSIS&#10;...&#10;&#10;STEP 2: GENERATION&#10;..."
                    disabled={!isEditMode}
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {formData.coachPromptEN.length} characters
                  </p>
                </div>
              </div>

              {/* Test Coach Prompt Section */}
              {question?.id && (
                <div className="border border-border/60 rounded-xl p-4 space-y-4 bg-muted/20">
                  <div className="flex items-center gap-2">
                    <Play size={14} className="text-emerald-600" />
                    <span className="text-xs font-bold text-foreground uppercase tracking-wide">Test Coach Prompt</span>
                    <span className="text-[10px] text-muted-foreground">(tests the saved prompt)</span>
                  </div>

                  <div className="grid grid-cols-[120px_1fr] gap-3 items-start">
                    <div>
                      <label className={labelClass}>Language</label>
                      <div className="flex items-center gap-1 mt-1">
                        <button
                          onClick={() => setTestLanguage('fr')}
                          className={cn(
                            'px-2.5 py-1 text-[10px] font-semibold rounded-md transition-colors',
                            testLanguage === 'fr'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          )}
                        >
                          FR
                        </button>
                        <button
                          onClick={() => setTestLanguage('en')}
                          className={cn(
                            'px-2.5 py-1 text-[10px] font-semibold rounded-md transition-colors',
                            testLanguage === 'en'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          )}
                        >
                          EN
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className={labelClass}>Sample Answer</label>
                      <textarea
                        value={testAnswer}
                        onChange={(e) => setTestAnswer(e.target.value)}
                        className={cn(inputClass, "resize-none h-20 text-sm")}
                        placeholder="Type a sample user answer to test the coach prompt..."
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleTestCoachPrompt}
                    disabled={isTestingPrompt || !testAnswer.trim()}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {isTestingPrompt ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
                    Test Prompt
                  </button>

                  {testError && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <XCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-red-700 dark:text-red-300">{testError}</p>
                      </div>
                    </div>
                  )}

                  {testResult && (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">AI Response</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                            {testResult.provider}/{testResult.model}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-foreground leading-relaxed whitespace-pre-wrap bg-white dark:bg-card rounded-lg p-3 border border-border/40">
                        {testResult.output}
                      </div>
                      <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
                        <span>Response time: <strong>{testResult.responseTimeMs}ms</strong></span>
                        <span>Tokens: <strong>{testResult.tokensUsed}</strong></span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
    </>
  );
}

// Main content component
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

  const navigate = useNavigate();
  const { theme, toggleTheme, language: appLanguage, setLanguage: setAppLanguage, t } = useTheme();

  // Logout handler
  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  // Mobile navigation items
  const mobileMainNav: NavItemConfig[] = [
    { name: appLanguage === 'fr' ? 'Aperçu' : 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: appLanguage === 'fr' ? 'Utilisateurs' : 'Users', href: '/admin/users', icon: Users },
    { name: 'CMS', href: '/admin/cms', icon: Palette },
  ];

  const mobileMoreNav: NavItemConfig[] = [
    { name: 'AI Studio', href: '/admin/ai-studio', icon: Sparkles },
    { name: appLanguage === 'fr' ? 'Problèmes' : 'Issues', href: '/admin/bug-report', icon: ListTodo },
  ];

  // UI state
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [personaFilter, setPersonaFilter] = useState<PersonaFilter>('all');
  const [language, setLanguage] = useState<Language>('en');
  const [showInactive, setShowInactive] = useState(false);
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([1, 2, 3, 4, 5, 6, 7]));
  const [searchQuery, setSearchQuery] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Editor state
  const [editingQuestion, setEditingQuestion] = useState<AdminQuestionTemplate | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [selectedStep, setSelectedStep] = useState<number>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);

  // Get questions and steps
  const questions = activeVersion?.questions || [];
  const steps = activeVersion?.steps || [];

  // Filter questions
  const filteredQuestions = questions.filter(q => {
    if (personaFilter !== 'all' && q.personaType !== personaFilter && q.personaType !== null) {
      return false;
    }
    if (!showInactive && !q.isActive) {
      return false;
    }
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      const matchesFR = q.questionText?.toLowerCase().includes(search);
      const matchesEN = q.questionTextEN?.toLowerCase().includes(search);
      if (!matchesFR && !matchesEN) {
        return false;
      }
    }
    return true;
  });

  // Group by step
  const groupedQuestions: Record<number, AdminQuestionTemplate[]> = {};
  filteredQuestions.forEach(q => {
    const step = q.stepNumber || 1;
    if (!groupedQuestions[step]) groupedQuestions[step] = [];
    groupedQuestions[step].push(q);
  });
  Object.keys(groupedQuestions).forEach(step => {
    groupedQuestions[Number(step)].sort((a, b) => a.order - b.order);
  });

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Toggle step
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

  // Handle create draft
  const handleCreateDraft = async () => {
    setIsCreatingDraft(true);
    try {
      await createDraft();
      setSuccessMessage('Draft created. You can now edit questions.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } finally {
      setIsCreatingDraft(false);
    }
  };

  // Handle publish
  const handlePublish = async () => {
    if (!confirm('Publish this draft? Changes will go live.')) return;
    setIsPublishing(true);
    try {
      await publishDraft();
      setSuccessMessage('Published successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } finally {
      setIsPublishing(false);
    }
  };

  // Handle discard
  const handleDiscard = async () => {
    if (!confirm('Discard this draft? All changes will be lost.')) return;
    setIsDiscarding(true);
    try {
      await discardDraft();
      setEditingQuestion(null);
      setIsCreatingNew(false);
      setSuccessMessage('Draft discarded.');
      setTimeout(() => setSuccessMessage(null), 3000);
    } finally {
      setIsDiscarding(false);
    }
  };

  // Handle restore version
  const handleRestoreVersion = async (versionId: string) => {
    await questionnaireVersionService.restoreVersion(versionId);
    await loadVersion();
    setSuccessMessage('Version restored as new draft.');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Handle save question
  const handleSaveQuestion = useCallback(async (data: CreateQuestionTemplateRequest | UpdateQuestionTemplateRequest) => {
    setIsSaving(true);
    try {
      if (isCreatingNew) {
        const result = await createQuestion(data as CreateQuestionTemplateRequest);
        if (result) {
          setSuccessMessage('Question created');
          setIsCreatingNew(false);
          setEditingQuestion(null);
        }
      } else if (editingQuestion) {
        const result = await updateQuestion(editingQuestion.id, data as UpdateQuestionTemplateRequest);
        if (result) {
          setSuccessMessage('Question updated');
          setEditingQuestion(null);
        }
      }
      setTimeout(() => setSuccessMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  }, [isCreatingNew, editingQuestion, createQuestion, updateQuestion]);

  // Handle delete
  const handleDeleteQuestion = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    const result = await deleteQuestion(id);
    if (result) {
      if (editingQuestion?.id === id) {
        setEditingQuestion(null);
      }
      setSuccessMessage('Question deleted');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (question: AdminQuestionTemplate) => {
    await updateQuestion(question.id, { isActive: !question.isActive });
    setSuccessMessage(`Question ${question.isActive ? 'deactivated' : 'activated'}`);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Handle duplicate
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
    };
    const result = await createQuestion(newQuestion);
    if (result) {
      setSuccessMessage('Question duplicated');
      setTimeout(() => setSuccessMessage(null), 3000);
    }
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent, stepNumber: number) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const stepQuestions = groupedQuestions[stepNumber] || [];
    const oldIndex = stepQuestions.findIndex(q => q.id === active.id);
    const newIndex = stepQuestions.findIndex(q => q.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reorderedQuestions = arrayMove(stepQuestions, oldIndex, newIndex);
    const reorderItems = reorderedQuestions.map((q, index) => ({
      questionId: q.id,
      order: index + 1,
    }));

    const success = await reorderQuestions(reorderItems);
    if (success) {
      setSuccessMessage('Reordered');
      setTimeout(() => setSuccessMessage(null), 2000);
    }
  };

  // Add new question
  const handleAddQuestion = (stepNumber: number) => {
    setSelectedStep(stepNumber);
    setEditingQuestion(null);
    setIsCreatingNew(true);
  };

  // Close editor
  const closeEditor = () => {
    setEditingQuestion(null);
    setIsCreatingNew(false);
  };

  // Get step title
  const getStepTitle = (stepNumber: number) => {
    const step = steps.find(s => s.stepNumber === stepNumber);
    return language === 'fr' ? step?.titleFR : (step?.titleEN || step?.titleFR) || `Step ${stepNumber}`;
  };

  // Stats
  const totalQuestions = filteredQuestions.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-card border-b border-border/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="h-14 flex items-center justify-between">
            {/* Left */}
            <div className="flex items-center gap-3">
              <Link
                to="/admin/cms"
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
                title="Back to CMS"
              >
                <ArrowLeft size={18} />
              </Link>

              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-strategy-blue/10 flex items-center justify-center">
                  <ClipboardList className="w-4 h-4 text-strategy-blue" />
                </div>
                <div>
                  <h1 className="text-sm font-bold text-foreground">Questionnaire Editor</h1>
                  <div className="flex items-center gap-2">
                    {activeVersion && (
                      <Badge
                        variant={activeVersion.status === 'Draft' ? 'warning' : 'success'}
                        className="text-[9px] font-bold h-4"
                      >
                        {activeVersion.status} v{activeVersion.versionNumber}
                      </Badge>
                    )}
                    {isDirty && isEditMode && (
                      <span className="text-[10px] text-amber-600 font-medium">Unsaved</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsHistoryOpen(true)}
                className="h-8 px-2"
              >
                <History size={16} />
              </Button>

              {/* Language toggle */}
              <div className="flex items-center bg-muted rounded-lg p-0.5 mx-1">
                <button
                  onClick={() => setLanguage('en')}
                  className={cn(
                    'px-2.5 py-1 text-xs font-semibold rounded-md transition-all',
                    language === 'en' ? 'bg-card text-momentum-orange shadow-sm' : 'text-muted-foreground'
                  )}
                >
                  EN
                </button>
                <button
                  onClick={() => setLanguage('fr')}
                  className={cn(
                    'px-2.5 py-1 text-xs font-semibold rounded-md transition-all',
                    language === 'fr' ? 'bg-card text-momentum-orange shadow-sm' : 'text-muted-foreground'
                  )}
                >
                  FR
                </button>
              </div>

              {!isEditMode ? (
                <Button
                  onClick={handleCreateDraft}
                  disabled={isCreatingDraft}
                  className="bg-momentum-orange hover:bg-momentum-orange/90 text-white h-8 text-xs"
                >
                  {isCreatingDraft ? (
                    <Loader2 size={14} className="mr-1.5 animate-spin" />
                  ) : (
                    <FileEdit size={14} className="mr-1.5" />
                  )}
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDiscard}
                    disabled={isDiscarding}
                    className="h-8 text-xs"
                  >
                    {isDiscarding ? <Loader2 size={14} className="mr-1 animate-spin" /> : <XCircle size={14} className="mr-1" />}
                    Discard
                  </Button>
                  <Button
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white h-8 text-xs"
                  >
                    {isPublishing ? <Loader2 size={14} className="mr-1 animate-spin" /> : <Send size={14} className="mr-1" />}
                    Publish
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      {(error || successMessage || (!isEditMode && activeVersion)) && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-4 space-y-2">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-2 flex items-center gap-2">
              <AlertCircle size={14} className="text-destructive shrink-0" />
              <span className="text-xs text-destructive flex-1">{error}</span>
              <button onClick={clearError} className="text-destructive hover:text-destructive/80">&times;</button>
            </div>
          )}
          {successMessage && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg px-4 py-2 flex items-center gap-2">
              <CheckCircle size={14} className="text-emerald-500 shrink-0" />
              <span className="text-xs text-emerald-700 dark:text-emerald-300">{successMessage}</span>
            </div>
          )}
          {!isEditMode && activeVersion && !error && !successMessage && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2 flex items-center gap-2">
              <AlertCircle size={14} className="text-blue-500 shrink-0" />
              <span className="text-xs text-blue-700 dark:text-blue-300">
                Viewing published version. Click "Edit" to make changes.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-6">
        {/* Filters & Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {/* Persona Filter */}
          <div className="flex items-center gap-1 bg-card border border-border/50 rounded-lg p-1">
            {(['all', 'Entrepreneur', 'Consultant', 'OBNL'] as PersonaFilter[]).map((persona) => (
              <button
                key={persona}
                onClick={() => setPersonaFilter(persona)}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                  personaFilter === persona
                    ? 'bg-momentum-orange/10 text-momentum-orange'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                {persona === 'all' ? 'All' : persona}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-border/60 rounded-xl bg-card focus:bg-background focus:ring-2 focus:ring-momentum-orange/20 focus:border-momentum-orange transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInactive(!showInactive)}
              className={cn(
                'px-3 py-2 text-xs font-medium rounded-lg border transition-colors',
                showInactive
                  ? 'bg-muted border-border text-foreground'
                  : 'border-border/50 text-muted-foreground hover:text-foreground'
              )}
            >
              {showInactive ? 'Hide Inactive' : 'Show Inactive'}
            </button>
            {isEditMode && (
              <Button
                onClick={() => handleAddQuestion(1)}
                className="bg-momentum-orange hover:bg-momentum-orange/90 text-white h-9 text-xs"
              >
                <Plus size={14} className="mr-1.5" />
                Add Question
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="mb-4 text-xs text-muted-foreground">
          <Layers size={14} className="inline mr-1" />
          {totalQuestions} questions
        </div>

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-momentum-orange" />
          </div>
        ) : (personaFilter === 'Consultant' || personaFilter === 'OBNL') ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-card rounded-2xl border border-border flex items-center justify-center mx-auto mb-4">
              <ClipboardList className="w-8 h-8 text-muted-foreground" />
            </div>
            <Badge variant="secondary" className="mb-3">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse mr-1.5" />
              Coming Soon
            </Badge>
            <h3 className="text-lg font-semibold text-foreground mb-1">{personaFilter} Questionnaire</h3>
            <p className="text-sm text-muted-foreground">
              We're building specialized questions for {personaFilter === 'OBNL' ? 'non-profit organizations' : 'consultants'}.
            </p>
          </div>
        ) : (
          /* Step Cards */
          <div className="space-y-3">
            {steps.map((step) => {
              const stepQuestions = groupedQuestions[step.stepNumber] || [];
              const isExpanded = expandedSteps.has(step.stepNumber);
              const stepColor = stepColors[step.stepNumber] || stepColors[1];

              return (
                <div
                  key={step.stepNumber}
                  className="bg-card rounded-xl border border-border/50 overflow-hidden"
                >
                  {/* Step Header */}
                  <div
                    onClick={() => toggleStep(step.stepNumber)}
                    className="group w-full px-4 py-3.5 flex items-center justify-between hover:bg-muted/30 transition-colors cursor-pointer"
                  >
                    <StepTitleEditor
                      step={{ ...step, questionCount: stepQuestions.length }}
                      language={language}
                      isEditMode={isEditMode}
                      onSave={updateStep}
                    />
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-[10px]">
                        {stepQuestions.length}
                      </Badge>
                      {isExpanded ? (
                        <ChevronDown size={18} className="text-muted-foreground" />
                      ) : (
                        <ChevronRight size={18} className="text-muted-foreground" />
                      )}
                    </div>
                  </div>

                  {/* Questions */}
                  {isExpanded && (
                    <div className="border-t border-border/50">
                      {stepQuestions.length === 0 ? (
                        <div className="py-8 text-center">
                          <p className="text-sm text-muted-foreground mb-2">No questions in this step</p>
                          {isEditMode && (
                            <button
                              onClick={() => handleAddQuestion(step.stepNumber)}
                              className="text-sm text-momentum-orange hover:underline"
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
                            {stepQuestions.map((question) => (
                              <SortableQuestionRow
                                key={question.id}
                                question={question}
                                language={language}
                                isEditMode={isEditMode}
                                onEdit={() => setEditingQuestion(question)}
                                onToggleStatus={() => handleToggleStatus(question)}
                                onDelete={() => handleDeleteQuestion(question.id)}
                                onDuplicate={() => handleDuplicateQuestion(question)}
                              />
                            ))}
                          </SortableContext>
                        </DndContext>
                      )}

                      {/* Add question button */}
                      {isEditMode && stepQuestions.length > 0 && (
                        <button
                          onClick={() => handleAddQuestion(step.stepNumber)}
                          className="w-full py-3 text-xs text-momentum-orange hover:text-momentum-orange/80 font-medium flex items-center justify-center gap-1 border-t border-border/30 hover:bg-muted/30 transition-colors"
                        >
                          <Plus size={12} />
                          Add question
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Question Editor */}
      {(editingQuestion || isCreatingNew) && (
        <QuestionEditor
          question={editingQuestion}
          isNew={isCreatingNew}
          steps={steps}
          selectedStep={selectedStep}
          isEditMode={isEditMode}
          isSaving={isSaving}
          onSave={handleSaveQuestion}
          onClose={closeEditor}
        />
      )}

      {/* Version History */}
      <QuestionnaireVersionHistorySidebar
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onRestore={handleRestoreVersion}
        currentVersionId={activeVersion?.id}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        mainNavItems={mobileMainNav}
        moreMenuItems={mobileMoreNav}
        backLink={{
          label: appLanguage === 'fr' ? 'Retour au tableau de bord' : 'Back to Dashboard',
          href: '/dashboard',
        }}
        onLogout={handleLogout}
        t={t}
        theme={theme}
        onThemeToggle={toggleTheme}
        language={appLanguage}
        onLanguageChange={setAppLanguage}
        showUserProfile={false}
      />
    </div>
  );
}

// Main page component
export default function CmsQuestionnairePage() {
  return (
    <QuestionnaireVersionProvider>
      <QuestionnaireEditorContent />
    </QuestionnaireVersionProvider>
  );
}
