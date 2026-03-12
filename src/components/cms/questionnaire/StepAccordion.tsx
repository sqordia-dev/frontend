import { ReactNode } from 'react';
import { ChevronRight, Inbox } from 'lucide-react';
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
import { motion, AnimatePresence } from 'framer-motion';
import type { QuestionnaireStep, UpdateQuestionnaireStepRequest } from '@/types/questionnaire-version';
import type { AdminQuestionTemplate } from '@/types/admin-question-template';
import { StepHeader } from './StepHeader';
import { cn } from '@/lib/utils';

const STEP_ACCENT_COLORS: Record<number, { border: string; bg: string }> = {
  1: { border: 'border-l-blue-500', bg: 'bg-blue-500' },
  2: { border: 'border-l-violet-500', bg: 'bg-violet-500' },
  3: { border: 'border-l-emerald-500', bg: 'bg-emerald-500' },
  4: { border: 'border-l-amber-500', bg: 'bg-amber-500' },
  5: { border: 'border-l-rose-500', bg: 'bg-rose-500' },
  6: { border: 'border-l-cyan-500', bg: 'bg-cyan-500' },
  7: { border: 'border-l-pink-500', bg: 'bg-pink-500' },
};

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

  const accent = STEP_ACCENT_COLORS[step.stepNumber] ?? STEP_ACCENT_COLORS[1];

  return (
    <div className={cn('border-l-[3px] transition-colors', accent.border)}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-5 py-3 sm:py-3.5 hover:bg-muted/30 transition-colors text-left group"
      >
        <span className={cn(
          'text-muted-foreground/40 shrink-0 transition-transform duration-200',
          isExpanded && 'rotate-90',
        )}>
          <ChevronRight size={15} />
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

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {questions.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-5 py-10 text-center">
                <Inbox size={20} className="text-muted-foreground/30" />
                <p className="text-xs text-muted-foreground/60">No questions in this step yet.</p>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
                  <div className="ml-2">
                    {children}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
