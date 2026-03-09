import { Sparkles, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AiGenerateButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  label?: string;
  className?: string;
}

export function AiGenerateButton({
  onClick,
  isLoading = false,
  disabled = false,
  label,
  className,
}: AiGenerateButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-label={label || 'Generate with AI'}
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors',
        'text-purple-600 bg-purple-50 hover:bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30 dark:hover:bg-purple-900/50',
        (disabled || isLoading) && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Sparkles className="w-3.5 h-3.5" />
      )}
      {label && <span>{label}</span>}
    </button>
  );
}
