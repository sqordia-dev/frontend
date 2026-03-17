import { AiGenerateButton } from './AiGenerateButton';
import { AiTranslateButton } from './AiTranslateButton';
import { cn } from '@/lib/utils';

interface BilingualTextareaProps {
  valueFR: string;
  valueEN: string;
  onChangeFR: (value: string) => void;
  onChangeEN: (value: string) => void;
  onAiGenerate?: (language: 'fr' | 'en') => void;
  onAiTranslate?: (direction: 'fr-to-en' | 'en-to-fr') => void;
  isGenerating?: { fr?: boolean; en?: boolean };
  isTranslating?: { 'fr-to-en'?: boolean; 'en-to-fr'?: boolean };
  rows?: number;
  disabled?: boolean;
  monospace?: boolean;
  labelFR?: string;
  labelEN?: string;
  placeholderFR?: string;
  placeholderEN?: string;
  className?: string;
}

export function BilingualTextarea({
  valueFR,
  valueEN,
  onChangeFR,
  onChangeEN,
  onAiGenerate,
  onAiTranslate,
  isGenerating,
  isTranslating,
  rows = 3,
  disabled = false,
  monospace = false,
  labelFR = 'French',
  labelEN = 'English',
  placeholderFR,
  placeholderEN,
  className,
}: BilingualTextareaProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* French */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <img src="/quebec-flag.svg" alt="" className="w-4 h-3 object-contain" />
            {labelFR}
          </label>
          <div className="flex items-center gap-1">
            {onAiGenerate && (
              <AiGenerateButton
                onClick={() => onAiGenerate('fr')}
                isLoading={isGenerating?.fr}
                disabled={disabled}
              />
            )}
            {onAiTranslate && (
              <AiTranslateButton
                onClick={() => onAiTranslate('en-to-fr')}
                isLoading={isTranslating?.['en-to-fr']}
                disabled={disabled || !valueEN}
                direction="en-to-fr"
              />
            )}
          </div>
        </div>
        <textarea
          value={valueFR}
          onChange={(e) => onChangeFR(e.target.value)}
          rows={rows}
          disabled={disabled}
          placeholder={placeholderFR}
          className={cn(
            'w-full px-3 py-2 text-sm border border-border rounded-lg bg-background',
            'focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] outline-none transition-all',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            monospace && 'font-mono text-xs',
          )}
        />
      </div>

      {/* English */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            <span className="text-[10px] font-bold bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded">EN</span>
            {labelEN}
          </label>
          <div className="flex items-center gap-1">
            {onAiGenerate && (
              <AiGenerateButton
                onClick={() => onAiGenerate('en')}
                isLoading={isGenerating?.en}
                disabled={disabled}
              />
            )}
            {onAiTranslate && (
              <AiTranslateButton
                onClick={() => onAiTranslate('fr-to-en')}
                isLoading={isTranslating?.['fr-to-en']}
                disabled={disabled || !valueFR}
                direction="fr-to-en"
              />
            )}
          </div>
        </div>
        <textarea
          value={valueEN}
          onChange={(e) => onChangeEN(e.target.value)}
          rows={rows}
          disabled={disabled}
          placeholder={placeholderEN}
          className={cn(
            'w-full px-3 py-2 text-sm border border-border rounded-lg bg-background',
            'focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] outline-none transition-all',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            monospace && 'font-mono text-xs',
          )}
        />
      </div>
    </div>
  );
}
