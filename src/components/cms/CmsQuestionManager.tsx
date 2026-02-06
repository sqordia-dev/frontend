import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  Loader2,
  AlertCircle,
  FileText,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { adminQuestionTemplateService } from '@/lib/admin-question-template-service';
import { STEP_DEFINITIONS } from '@/types/admin-question-template';
import type { AdminQuestionTemplate } from '@/types/admin-question-template';
import QuestionTemplateSheet from './QuestionTemplateSheet';

interface CmsQuestionManagerProps {
  activeStepFilter: number | null;
}

const questionTypeBadgeClass: Record<string, string> = {
  ShortText: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  LongText: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  SingleChoice: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  MultipleChoice: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  Number: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  Currency: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  Percentage: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
  Date: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  YesNo: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
  Scale: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
};

export default function CmsQuestionManager({ activeStepFilter }: CmsQuestionManagerProps) {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<AdminQuestionTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<AdminQuestionTemplate | null>(null);
  const [showSheet, setShowSheet] = useState(false);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminQuestionTemplateService.getAll();
      setQuestions(data);
    } catch {
      setError('Failed to load questions');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Group questions by step
  const groupedByStep = useMemo(() => {
    const filtered = activeStepFilter
      ? questions.filter((q) => q.stepNumber === activeStepFilter)
      : questions;

    const groups: Record<number, AdminQuestionTemplate[]> = {};
    for (const q of filtered) {
      if (!groups[q.stepNumber]) groups[q.stepNumber] = [];
      groups[q.stepNumber].push(q);
    }
    // Sort within each group
    for (const key of Object.keys(groups)) {
      groups[Number(key)].sort((a, b) => a.order - b.order);
    }
    return groups;
  }, [questions, activeStepFilter]);

  const stepNumbers = useMemo(
    () => Object.keys(groupedByStep).map(Number).sort((a, b) => a - b),
    [groupedByStep]
  );

  const handleCreate = () => {
    setEditingQuestion(null);
    setShowSheet(true);
  };

  const handleEdit = (question: AdminQuestionTemplate) => {
    setEditingQuestion(question);
    setShowSheet(true);
  };

  const handleDelete = async (question: AdminQuestionTemplate) => {
    const confirmed = window.confirm(
      `Are you sure you want to deactivate "${question.questionText.slice(0, 60)}..."?`
    );
    if (!confirmed) return;
    try {
      await adminQuestionTemplateService.delete(question.id);
      await loadQuestions();
    } catch {
      setError('Failed to delete question');
    }
  };

  const handleToggleStatus = async (question: AdminQuestionTemplate) => {
    setTogglingIds((prev) => new Set(prev).add(question.id));
    try {
      await adminQuestionTemplateService.toggleStatus(question.id, !question.isActive);
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === question.id ? { ...q, isActive: !q.isActive } : q
        )
      );
    } catch {
      setError('Failed to toggle question status');
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(question.id);
        return next;
      });
    }
  };

  const handleMoveUp = async (question: AdminQuestionTemplate) => {
    const stepQuestions = groupedByStep[question.stepNumber];
    if (!stepQuestions) return;
    const idx = stepQuestions.findIndex((q) => q.id === question.id);
    if (idx <= 0) return;

    const prev = stepQuestions[idx - 1];
    const items = [
      { questionId: question.id, order: prev.order },
      { questionId: prev.id, order: question.order },
    ];

    try {
      await adminQuestionTemplateService.reorder(items);
      await loadQuestions();
    } catch {
      setError('Failed to reorder questions');
    }
  };

  const handleMoveDown = async (question: AdminQuestionTemplate) => {
    const stepQuestions = groupedByStep[question.stepNumber];
    if (!stepQuestions) return;
    const idx = stepQuestions.findIndex((q) => q.id === question.id);
    if (idx < 0 || idx >= stepQuestions.length - 1) return;

    const next = stepQuestions[idx + 1];
    const items = [
      { questionId: question.id, order: next.order },
      { questionId: next.id, order: question.order },
    ];

    try {
      await adminQuestionTemplateService.reorder(items);
      await loadQuestions();
    } catch {
      setError('Failed to reorder questions');
    }
  };

  const handleSaved = () => {
    setShowSheet(false);
    setEditingQuestion(null);
    loadQuestions();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        <span className="ml-2 text-sm text-gray-500">Loading questions...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Questionnaire Questions
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {questions.length} question{questions.length !== 1 ? 's' : ''} across {STEP_DEFINITIONS.length} steps
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/cms/questionnaire-preview')}
          >
            <Eye className="w-4 h-4 mr-1.5" />
            Preview Questionnaire
          </Button>
          <Button variant="brand" size="sm" onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Question
          </Button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-600 dark:text-red-400 flex-1">{error}</p>
          <button type="button" onClick={() => setError(null)} className="text-red-400 hover:text-red-600 text-xs">
            Dismiss
          </button>
        </div>
      )}

      {/* Empty state */}
      {stepNumbers.length === 0 && (
        <div className="text-center py-16">
          <FileText className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {activeStepFilter
              ? `No questions found for Step ${activeStepFilter}.`
              : 'No questions found.'}
          </p>
          <Button variant="outline" size="sm" className="mt-4" onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create First Question
          </Button>
        </div>
      )}

      {/* Question groups by step */}
      {stepNumbers.map((stepNum) => {
        const stepDef = STEP_DEFINITIONS.find((s) => s.number === stepNum);
        const stepQuestions = groupedByStep[stepNum] || [];

        return (
          <div key={stepNum} className="mb-8">
            {/* Step header */}
            {!activeStepFilter && (
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-[#FF6B00]/10 text-[#FF6B00] text-sm font-bold">
                  {stepNum}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  {stepDef?.label ?? `Step ${stepNum}`}
                </h3>
                <span className="text-xs text-gray-400 dark:text-gray-500">
                  {stepQuestions.length} question{stepQuestions.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Question rows */}
            <div className="space-y-1.5">
              {stepQuestions.map((question, idx) => (
                <div
                  key={question.id}
                  className={cn(
                    'group flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-150',
                    question.isActive
                      ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700'
                      : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200/60 dark:border-gray-800/60 opacity-60'
                  )}
                >
                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => handleMoveUp(question)}
                      disabled={idx === 0}
                      className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveDown(question)}
                      disabled={idx === stepQuestions.length - 1}
                      className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Order + Icon */}
                  <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums w-5 text-center shrink-0">
                    {question.order}
                  </span>
                  {question.icon && (
                    <span className="text-base shrink-0">{question.icon}</span>
                  )}

                  {/* Question text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white truncate">
                      {question.questionText}
                    </p>
                    {question.questionTextEN && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
                        EN: {question.questionTextEN}
                      </p>
                    )}
                  </div>

                  {/* Type badge */}
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 shrink-0',
                      questionTypeBadgeClass[question.questionType] ?? ''
                    )}
                  >
                    {question.questionType}
                  </Badge>

                  {/* Persona badge */}
                  {question.personaType && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0.5 shrink-0">
                      {question.personaType}
                    </Badge>
                  )}

                  {/* Required indicator */}
                  {question.isRequired && (
                    <span className="text-[10px] text-red-500 font-medium shrink-0">REQ</span>
                  )}

                  {/* Active toggle */}
                  <Switch
                    checked={question.isActive}
                    onCheckedChange={() => handleToggleStatus(question)}
                    disabled={togglingIds.has(question.id)}
                    className="shrink-0"
                  />

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEdit(question)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                      title="Edit question"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(question)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                      title="Delete question"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Edit/Create Sheet */}
      <QuestionTemplateSheet
        open={showSheet}
        onClose={() => {
          setShowSheet(false);
          setEditingQuestion(null);
        }}
        question={editingQuestion}
        onSaved={handleSaved}
      />
    </div>
  );
}
