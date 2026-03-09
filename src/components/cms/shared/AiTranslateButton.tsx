import { Globe, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AiTranslateButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  direction: 'fr-to-en' | 'en-to-fr';
  className?: string;
}

export function AiTranslateButton({
  onClick,
  isLoading = false,
  disabled = false,
  direction,
  className,
}: AiTranslateButtonProps) {
  const label = direction === 'fr-to-en' ? 'FR → EN' : 'EN → FR';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isLoading}
      aria-label={`Translate ${label}`}
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-md transition-colors',
        'text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/50',
        (disabled || isLoading) && 'opacity-50 cursor-not-allowed',
        className,
      )}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Globe className="w-3.5 h-3.5" />
      )}
      <span>{label}</span>
    </button>
  );
}
