import { GripVertical, Trash2, Copy, ToggleLeft, ToggleRight, Users } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { AdminQuestionTemplate } from '@/types/admin-question-template';
import { QUESTION_TYPES } from '@/types/admin-question-template';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface QuestionCardProps {
  question: AdminQuestionTemplate;
  language: 'en' | 'fr';
  isEditMode: boolean;
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
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : undefined,
  };

  const displayText =
    language === 'en' && question.questionTextEN
      ? question.questionTextEN
      : question.questionText || question.questionTextEN || '';

  const typeLabel =
    QUESTION_TYPES.find((t) => t.value === question.questionType)?.label ?? question.questionType;

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onEdit}
      className={cn(
        'group flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer',
        'border-b border-border/30 last:border-b-0 hover:bg-muted/30',
        !question.isActive && 'opacity-50',
        isDragging && 'shadow-lg bg-card rounded-lg border border-border',
      )}
    >
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

      <div className="w-6 h-6 rounded-md bg-muted/50 flex items-center justify-center text-[10px] font-bold text-muted-foreground shrink-0">
        {question.order}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{displayText}</p>
        {question.section && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{question.section}</p>
        )}
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        {question.isRequired && (
          <Badge variant="destructive" className="text-[9px] h-5 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-0">
            Required
          </Badge>
        )}
        <Badge variant="secondary" className="text-[9px] h-5">
          {typeLabel}
        </Badge>
        {!question.isActive && (
          <Badge variant="outline" className="text-[9px] h-5">
            Inactive
          </Badge>
        )}
      </div>

      {isEditMode && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onDuplicate}
            title="Duplicate"
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
          >
            <Copy size={13} />
          </button>
          <button
            onClick={onAdaptPersona}
            title="Adapt for persona"
            className="p-1.5 text-muted-foreground hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded transition-colors"
          >
            <Users size={13} />
          </button>
          <button
            onClick={onToggleStatus}
            title={question.isActive ? 'Deactivate' : 'Activate'}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
          >
            {question.isActive ? <ToggleRight size={13} className="text-emerald-500" /> : <ToggleLeft size={13} />}
          </button>
          <button
            onClick={onDelete}
            title="Delete"
            className="p-1.5 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
          >
            <Trash2 size={13} />
          </button>
        </div>
      )}
    </div>
  );
}
