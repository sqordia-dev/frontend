import React from 'react';
import { cn } from '../../lib/utils';
import { AICoachTokenUsage } from '../../types/ai-coach';
import { AlertTriangle, Zap } from 'lucide-react';

interface AICoachTokenIndicatorProps {
  tokenUsage: AICoachTokenUsage | null;
  language?: string;
  compact?: boolean;
}

/**
 * Token usage indicator for AI Coach
 * Shows progress bar and warning when near limit
 */
export function AICoachTokenIndicator({
  tokenUsage,
  language = 'en',
  compact = false,
}: AICoachTokenIndicatorProps) {
  if (!tokenUsage) return null;

  const { tokensUsed, tokenLimit, usagePercent, isNearLimit, warningMessage } = tokenUsage;

  const labels = {
    tokensUsed: language === 'fr' ? 'Tokens utilises' : 'Tokens used',
    of: language === 'fr' ? 'sur' : 'of',
    remaining: language === 'fr' ? 'restants' : 'remaining',
  };

  // Color based on usage
  const getProgressColor = () => {
    if (usagePercent >= 100) return 'bg-red-500';
    if (usagePercent >= 80) return 'bg-amber-500';
    return 'bg-gradient-to-r from-[#FF6B00] to-[#FF8533]';
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString(language === 'fr' ? 'fr-FR' : 'en-US');
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <Zap className={cn(
          'w-3.5 h-3.5',
          isNearLimit ? 'text-amber-500' : 'text-slate-400 dark:text-slate-500'
        )} />
        <div className="flex items-center gap-1.5">
          <div className="w-16 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-300', getProgressColor())}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
          <span className={cn(
            'tabular-nums',
            isNearLimit ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500 dark:text-slate-400'
          )}>
            {Math.round(usagePercent)}%
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Warning banner */}
      {warningMessage && (
        <div className={cn(
          'flex items-start gap-2 p-2.5 rounded-lg text-xs',
          usagePercent >= 100
            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
            : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
        )}>
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{warningMessage}</span>
        </div>
      )}

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            {labels.tokensUsed}
          </span>
          <span className={cn(
            'tabular-nums font-medium',
            isNearLimit ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300'
          )}>
            {formatNumber(tokensUsed)} {labels.of} {formatNumber(tokenLimit)}
          </span>
        </div>

        <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', getProgressColor())}
            style={{ width: `${Math.min(usagePercent, 100)}%` }}
          />
        </div>

        <div className="flex justify-end">
          <span className="text-xs text-slate-400 dark:text-slate-500 tabular-nums">
            {formatNumber(tokenUsage.tokensRemaining)} {labels.remaining}
          </span>
        </div>
      </div>
    </div>
  );
}

export default AICoachTokenIndicator;
