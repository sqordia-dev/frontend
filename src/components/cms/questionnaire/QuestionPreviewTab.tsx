import { Lightbulb } from 'lucide-react';
import type { AdminQuestionTemplate } from '@/types/admin-question-template';
import { cn } from '@/lib/utils';

interface QuestionPreviewTabProps {
  question: AdminQuestionTemplate;
  language: 'en' | 'fr';
}

export function QuestionPreviewTab({ question, language }: QuestionPreviewTabProps) {
  const questionText =
    language === 'en' && question.questionTextEN ? question.questionTextEN : question.questionText;
  const helpText =
    language === 'en' && question.helpTextEN ? question.helpTextEN : question.helpText;
  const expertAdvice =
    language === 'en' && question.expertAdviceEN ? question.expertAdviceEN : question.expertAdviceFR;

  const options =
    language === 'en' && question.optionsEN
      ? question.optionsEN.split('\n').filter(Boolean)
      : question.options
        ? question.options.split('\n').filter(Boolean)
        : [];

  const inputClass = cn(
    'w-full px-3 py-2 text-sm border border-border rounded-lg bg-background',
    'focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] outline-none',
    'cursor-not-allowed opacity-70',
  );

  const renderInput = () => {
    switch (question.questionType) {
      case 'ShortText':
        return <input type="text" readOnly className={inputClass} placeholder="Short answer..." />;
      case 'LongText':
        return <textarea readOnly rows={4} className={cn(inputClass, 'resize-none')} placeholder="Long answer..." />;
      case 'Number':
        return <input type="number" readOnly className={inputClass} placeholder="0" />;
      case 'Currency':
        return (
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
            <input type="number" readOnly className={cn(inputClass, 'pl-7')} placeholder="0.00" />
          </div>
        );
      case 'Percentage':
        return (
          <div className="relative">
            <input type="number" readOnly className={cn(inputClass, 'pr-8')} placeholder="0" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">%</span>
          </div>
        );
      case 'Date':
        return <input type="date" readOnly className={inputClass} />;
      case 'YesNo':
        return (
          <div className="flex gap-3">
            {['Yes', 'No'].map((opt) => (
              <label key={opt} className="flex items-center gap-2 cursor-not-allowed">
                <input type="radio" disabled name="yesno-preview" className="accent-[#FF6B00]" />
                <span className="text-sm text-foreground">{language === 'fr' ? (opt === 'Yes' ? 'Oui' : 'Non') : opt}</span>
              </label>
            ))}
          </div>
        );
      case 'SingleChoice':
        return (
          <div className="space-y-2">
            {options.length > 0 ? options.map((opt, i) => (
              <label key={i} className="flex items-center gap-2 cursor-not-allowed">
                <input type="radio" disabled name="single-preview" className="accent-[#FF6B00]" />
                <span className="text-sm text-foreground">{opt}</span>
              </label>
            )) : (
              <p className="text-xs text-muted-foreground italic">No options defined yet.</p>
            )}
          </div>
        );
      case 'MultipleChoice':
        return (
          <div className="space-y-2">
            {options.length > 0 ? options.map((opt, i) => (
              <label key={i} className="flex items-center gap-2 cursor-not-allowed">
                <input type="checkbox" disabled className="accent-[#FF6B00]" />
                <span className="text-sm text-foreground">{opt}</span>
              </label>
            )) : (
              <p className="text-xs text-muted-foreground italic">No options defined yet.</p>
            )}
          </div>
        );
      case 'Scale':
        return (
          <div className="space-y-2">
            <input type="range" disabled min={1} max={10} className="w-full accent-[#FF6B00]" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>10</span>
            </div>
          </div>
        );
      default:
        return <input type="text" readOnly className={inputClass} placeholder="Answer..." />;
    }
  };

  return (
    <div className="p-4 space-y-6">
      <div className="p-4 rounded-xl border border-border bg-card space-y-4">
        <div>
          <p className="text-sm font-semibold text-foreground leading-snug">
            {questionText}
            {question.isRequired && <span className="text-red-500 ml-1">*</span>}
          </p>
          {helpText && (
            <p className="text-xs text-muted-foreground mt-1">{helpText}</p>
          )}
        </div>

        <div>{renderInput()}</div>
      </div>

      {expertAdvice && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
          <Lightbulb size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1">
              {language === 'fr' ? "Conseil d'expert" : 'Expert Tip'}
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-400 whitespace-pre-wrap">{expertAdvice}</p>
          </div>
        </div>
      )}
    </div>
  );
}
