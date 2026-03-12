import { Sparkles, Loader2 } from 'lucide-react';
import type { QuestionnaireStep, UpdateQuestionnaireStepRequest } from '@/types/questionnaire-version';
import { StepTitleEditor } from '@/components/admin/questionnaire/StepTitleEditor';
import { cn } from '@/lib/utils';

const stepColors: Record<number, string> = {
  1: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  2: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
  3: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  4: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
  5: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  6: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
  7: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
};

interface StepHeaderProps {
  step: QuestionnaireStep;
  language: 'en' | 'fr';
  isEditMode: boolean;
  questionCount: number;
  onUpdateStep: (stepNumber: number, data: UpdateQuestionnaireStepRequest) => Promise<QuestionnaireStep | null>;
  onAiSuggest: () => void;
  isAiLoading: boolean;
}

export function StepHeader({
  step,
  language,
  isEditMode,
  questionCount,
  onUpdateStep,
  onAiSuggest,
  isAiLoading,
}: StepHeaderProps) {
  const colorClass = stepColors[step.stepNumber] ?? stepColors[1];

  return (
    <div className="flex items-center gap-3 flex-1 min-w-0 group">
      <span
        className={cn(
          'inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold shrink-0',
          colorClass,
        )}
      >
        {step.stepNumber}
      </span>

      <div className="flex-1 min-w-0">
        <StepTitleEditor
          step={step}
          language={language}
          isEditMode={isEditMode}
          onSave={onUpdateStep}
        />
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        <span className="text-[11px] text-muted-foreground/60 tabular-nums font-medium">
          {questionCount} {questionCount === 1 ? 'question' : 'questions'}
        </span>

        {isEditMode && (
          <button
            onClick={(e) => { e.stopPropagation(); onAiSuggest(); }}
            disabled={isAiLoading}
            title="AI: Suggest questions for this step"
            className={cn(
              'inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium rounded-md transition-all',
              'text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20',
              'opacity-0 group-hover:opacity-100',
              isAiLoading && 'opacity-100 cursor-not-allowed',
            )}
          >
            {isAiLoading ? (
              <Loader2 size={11} className="animate-spin" />
            ) : (
              <Sparkles size={11} />
            )}
            <span>Suggest</span>
          </button>
        )}
      </div>
    </div>
  );
}
