import { ReactNode } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import type { QuestionnaireStep, UpdateQuestionnaireStepRequest } from '@/types/questionnaire-version';
import type { AdminQuestionTemplate } from '@/types/admin-question-template';
import { StepHeader } from './StepHeader';
import { cn } from '@/lib/utils';

interface StepAccordionProps {
  step: QuestionnaireStep;
  questions: AdminQuestionTemplate[];
  language: 'en' | 'fr';
  isEditMode: boolean;
  isExpanded: boolean;
  onToggle: () => void;
  onReorder: (items: { questionId: string; order: number }[]) => Promise<boolean>;
  onUpdateStep: (stepNumber: number, data: UpdateQuestionnaireStepRequest) => Promise<QuestionnaireStep | null>;
  onAiSuggest: () => void;
  isAiLoading: boolean;
  children: ReactNode;
}

export function StepAccordion({
  step,
  questions,
  language,
  isEditMode,
  isExpanded,
  onToggle,
  onReorder,
  onUpdateStep,
  onAiSuggest,
  isAiLoading,
  children,
}: StepAccordionProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex((q) => q.id === active.id);
    const newIndex = questions.findIndex((q) => q.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(questions, oldIndex, newIndex);
    const items = reordered.map((q, idx) => ({ questionId: q.id, order: idx + 1 }));
    await onReorder(items);
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors text-left group"
      >
        <span className="text-muted-foreground shrink-0 transition-transform duration-200">
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
        </span>

        <StepHeader
          step={step}
          language={language}
          isEditMode={isEditMode}
          questionCount={questions.length}
          onUpdateStep={onUpdateStep}
          onAiSuggest={onAiSuggest}
          isAiLoading={isAiLoading}
        />
      </button>

      {isExpanded && (
        <div className={cn('border-t border-border/50', questions.length === 0 && 'px-4 py-6 text-center text-sm text-muted-foreground')}>
          {questions.length === 0 ? (
            <p>No questions in this step yet.</p>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
                {children}
              </SortableContext>
            </DndContext>
          )}
        </div>
      )}
    </div>
  );
}
