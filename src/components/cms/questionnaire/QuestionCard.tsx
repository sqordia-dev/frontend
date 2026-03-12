import { GripVertical, Trash2, Copy, ToggleLeft, ToggleRight, Users, EyeOff } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { AdminQuestionTemplate } from '@/types/admin-question-template';
import { QUESTION_TYPES } from '@/types/admin-question-template';
import { cn } from '@/lib/utils';

const TYPE_ICONS: Record<string, string> = {
  ShortText: 'Aa',
  LongText: '\u00B6',
  Number: '#',
  Currency: '$',
  Percentage: '%',
  Date: '\u2630',
  YesNo: '\u2713',
  SingleChoice: '\u25C9',
  MultipleChoice: '\u2611',
  Scale: '\u2194',
};

interface QuestionCardProps {
  question: AdminQuestionTemplate;
  language: 'en' | 'fr';
  isEditMode: boolean;
  isSelected?: boolean;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onAdaptPersona: () => void;
}

export function QuestionCard({
  question,
  language,
  isEditMode,
  isSelected = false,
  onEdit,
  onToggleStatus,
  onDelete,
  onDuplicate,
  onAdaptPersona,
}: QuestionCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
    disabled: !isEditMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 1000 : undefined,
  };

  const displayText =
    language === 'en' && question.questionTextEN
      ? question.questionTextEN
      : question.questionText || question.questionTextEN || '';

  const typeLabel =
    QUESTION_TYPES.find((t) => t.value === question.questionType)?.label ?? question.questionType;
  const typeIcon = TYPE_ICONS[question.questionType] ?? 'Q';

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onEdit}
      className={cn(
        'group relative flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 transition-all cursor-pointer',
        'border-b border-border/30 last:border-b-0',
        !question.isActive && 'opacity-45',
        isDragging && 'shadow-xl bg-card rounded-lg border border-border scale-[1.01]',
        isSelected
          ? 'bg-[#FF6B00]/[0.04] dark:bg-[#FF6B00]/[0.08]'
          : 'hover:bg-muted/40',
      )}
    >
      {/* Selected indicator */}
      {isSelected && (
        <div className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r-full bg-[#FF6B00]" />
      )}

      {/* Drag handle */}
      {isEditMode && (
        <button
          {...attributes}
          {...listeners}
          onClick={(e) => e.stopPropagation()}
          className="p-1 text-muted-foreground/30 hover:text-muted-foreground cursor-grab active:cursor-grabbing touch-none rounded hover:bg-muted transition-all shrink-0 sm:opacity-0 sm:group-hover:opacity-100"
          title="Drag to reorder"
        >
          <GripVertical size={14} />
        </button>
      )}

      {/* Order + type indicator */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        <span className="text-[10px] sm:text-[11px] font-bold text-muted-foreground/50 tabular-nums w-4 sm:w-5 text-right">
          {question.order}
        </span>
        <div className={cn(
          'w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-[10px] sm:text-[11px] font-bold shrink-0',
          'bg-muted/60 dark:bg-muted/40 text-muted-foreground',
        )}>
          {typeIcon}
        </div>
      </div>

      {/* Question text */}
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-[13px] font-medium text-foreground truncate leading-snug',
          !question.isActive && 'line-through decoration-muted-foreground/30',
        )}>
          {displayText}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          {question.section && (
            <span className="text-[11px] text-muted-foreground/60 truncate">{question.section}</span>
          )}
        </div>
      </div>

      {/* Badges */}
      <div className="hidden sm:flex items-center gap-1.5 shrink-0">
        {question.isRequired && (
          <span className="text-[10px] font-semibold text-red-500/70 dark:text-red-400/70 bg-red-500/8 dark:bg-red-500/15 px-1.5 py-0.5 rounded">
            Required
          </span>
        )}
        <span className="text-[10px] font-medium text-muted-foreground bg-muted/60 dark:bg-muted/40 px-1.5 py-0.5 rounded">
          {typeLabel}
        </span>
        {!question.isActive && (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted/60 dark:bg-muted/40 px-1.5 py-0.5 rounded">
            <EyeOff size={9} />
            Off
          </span>
        )}
      </div>

      {/* Actions */}
      {isEditMode && (
        <div
          className="flex items-center gap-0.5 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onDuplicate}
            title="Duplicate"
            className="p-1.5 text-muted-foreground/50 hover:text-foreground hover:bg-muted rounded-md transition-colors"
          >
            <Copy size={13} />
          </button>
          <button
            onClick={onAdaptPersona}
            title="Adapt for persona"
            className="p-1.5 text-muted-foreground/50 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-md transition-colors"
          >
            <Users size={13} />
          </button>
          <button
            onClick={onToggleStatus}
            title={question.isActive ? 'Deactivate' : 'Activate'}
            className="p-1.5 text-muted-foreground/50 hover:text-foreground hover:bg-muted rounded-md transition-colors"
          >
            {question.isActive ? <ToggleRight size={13} className="text-emerald-500" /> : <ToggleLeft size={13} />}
          </button>
          <button
            onClick={onDelete}
            title="Delete"
            className="p-1.5 text-muted-foreground/50 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
