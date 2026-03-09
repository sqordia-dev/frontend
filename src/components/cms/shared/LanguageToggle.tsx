import { cn } from '@/lib/utils';

interface LanguageToggleProps {
  value: 'en' | 'fr';
  onChange: (lang: 'en' | 'fr') => void;
  className?: string;
}

export function LanguageToggle({ value, onChange, className }: LanguageToggleProps) {
  return (
    <div className={cn('inline-flex rounded-lg border border-border bg-muted/50 p-0.5', className)}>
      <button
        type="button"
        onClick={() => onChange('en')}
        className={cn(
          'px-3 py-1 text-xs font-semibold rounded-md transition-colors',
          value === 'en'
            ? 'bg-white dark:bg-gray-800 text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => onChange('fr')}
        className={cn(
          'px-3 py-1 text-xs font-semibold rounded-md transition-colors',
          value === 'fr'
            ? 'bg-white dark:bg-gray-800 text-foreground shadow-sm'
            : 'text-muted-foreground hover:text-foreground',
        )}
      >
        FR
      </button>
    </div>
  );
}
