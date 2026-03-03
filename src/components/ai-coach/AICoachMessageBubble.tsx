import React from 'react';
import { cn } from '../../lib/utils';
import { AICoachMessage } from '../../types/ai-coach';
import { Copy, Check, Sparkles } from 'lucide-react';

interface AICoachMessageBubbleProps {
  message: AICoachMessage;
  onApplySuggestion?: (text: string) => void;
  language?: string;
}

/**
 * Individual message bubble in the AI Coach conversation
 */
export function AICoachMessageBubble({
  message,
  onApplySuggestion,
  language = 'en',
}: AICoachMessageBubbleProps) {
  const [copied, setCopied] = React.useState(false);
  const isAssistant = message.role === 'assistant';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleApply = () => {
    onApplySuggestion?.(message.content);
  };

  const labels = {
    copy: language === 'fr' ? 'Copier' : 'Copy',
    copied: language === 'fr' ? 'Copie!' : 'Copied!',
    apply: language === 'fr' ? 'Utiliser cette reponse' : 'Use this answer',
  };

  return (
    <div
      className={cn(
        'flex w-full mb-3 md:mb-2.5',
        isAssistant ? 'justify-start' : 'justify-end'
      )}
    >
      <div
        className={cn(
          'max-w-[85%] md:max-w-[90%] rounded-2xl px-4 md:px-3 py-3 md:py-2',
          isAssistant
            ? 'bg-slate-100 dark:bg-slate-800 rounded-tl-sm'
            : 'bg-gradient-to-br from-[#FF6B00] to-[#FF8533] text-white rounded-tr-sm'
        )}
      >
        {/* Message content */}
        <div
          className={cn(
            'text-sm md:text-xs leading-relaxed whitespace-pre-wrap',
            isAssistant
              ? 'text-slate-700 dark:text-slate-200'
              : 'text-white'
          )}
        >
          {message.content}
        </div>

        {/* Action buttons for assistant messages */}
        {isAssistant && (
          <div className="flex flex-wrap items-center gap-2 md:gap-1.5 mt-3 md:mt-2 pt-2 md:pt-1.5 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 md:gap-1 px-3 md:px-2 py-1.5 md:py-1 text-xs md:text-[10px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 active:bg-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg md:rounded transition-colors"
            >
              {copied ? (
                <Check className="w-4 h-4 md:w-3 md:h-3 text-green-500" />
              ) : (
                <Copy className="w-4 h-4 md:w-3 md:h-3" />
              )}
              {copied ? labels.copied : labels.copy}
            </button>

            {onApplySuggestion && (
              <button
                onClick={handleApply}
                className="flex items-center gap-1.5 md:gap-1 px-3 md:px-2 py-1.5 md:py-1 text-xs md:text-[10px] font-medium text-[#FF6B00] hover:text-[#FF8533] active:bg-orange-100 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg md:rounded transition-colors"
              >
                <Sparkles className="w-4 h-4 md:w-3 md:h-3" />
                {labels.apply}
              </button>
            )}
          </div>
        )}

        {/* Timestamp */}
        <div
          className={cn(
            'text-[11px] md:text-[10px] mt-1.5 md:mt-1',
            isAssistant
              ? 'text-slate-400 dark:text-slate-500'
              : 'text-white/70'
          )}
        >
          {new Date(message.createdAt).toLocaleTimeString(
            language === 'fr' ? 'fr-FR' : 'en-US',
            { hour: '2-digit', minute: '2-digit' }
          )}
        </div>
      </div>
    </div>
  );
}

export default AICoachMessageBubble;
