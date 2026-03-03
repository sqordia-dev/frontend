import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Star,
  CheckCircle,
  Edit3,
  RefreshCw,
  BarChart3,
  Crown,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

interface PromptMetrics {
  id: string;
  name: string;
  usageCount: number;
  acceptanceRate: number;
  editRate: number;
  regenerateRate: number;
  averageRating: number;
}

interface PromptComparisonCardProps {
  promptA: PromptMetrics;
  promptB: PromptMetrics;
  language?: 'en' | 'fr';
}

interface MetricRowProps {
  label: string;
  valueA: number;
  valueB: number;
  format?: 'number' | 'percent' | 'rating';
  higherIsBetter?: boolean;
  icon?: React.ReactNode;
}

const formatValue = (value: number, format: 'number' | 'percent' | 'rating'): string => {
  switch (format) {
    case 'percent':
      return `${(value * 100).toFixed(1)}%`;
    case 'rating':
      return value.toFixed(1);
    default:
      return value.toLocaleString();
  }
};

const MetricRow: React.FC<MetricRowProps> = ({
  label,
  valueA,
  valueB,
  format = 'number',
  higherIsBetter = true,
  icon,
}) => {
  const diff = valueA - valueB;
  const percentDiff = valueB !== 0 ? (diff / valueB) * 100 : diff > 0 ? 100 : 0;

  const aIsWinner = higherIsBetter ? valueA > valueB : valueA < valueB;
  const bIsWinner = higherIsBetter ? valueB > valueA : valueB < valueA;
  const isTie = valueA === valueB;

  return (
    <div className="flex items-center py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0">
      {/* Label */}
      <div className="flex items-center gap-2 w-1/4">
        {icon && <span className="text-zinc-400">{icon}</span>}
        <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{label}</span>
      </div>

      {/* Prompt A Value */}
      <div className={cn(
        'w-1/4 text-center',
        aIsWinner && 'text-green-600 dark:text-green-400 font-semibold',
        bIsWinner && 'text-zinc-500',
        isTie && 'text-zinc-600 dark:text-zinc-300'
      )}>
        <span className="text-sm">{formatValue(valueA, format)}</span>
        {aIsWinner && <Crown className="inline w-3 h-3 ml-1 text-yellow-500" />}
      </div>

      {/* Difference */}
      <div className="w-1/4 flex items-center justify-center gap-1">
        {!isTie && (
          <>
            {diff > 0 ? (
              <TrendingUp className={cn(
                'w-4 h-4',
                higherIsBetter ? 'text-green-500' : 'text-red-500'
              )} />
            ) : (
              <TrendingDown className={cn(
                'w-4 h-4',
                higherIsBetter ? 'text-red-500' : 'text-green-500'
              )} />
            )}
            <span className={cn(
              'text-xs font-medium',
              (higherIsBetter && diff > 0) || (!higherIsBetter && diff < 0)
                ? 'text-green-600 dark:text-green-400'
                : 'text-red-600 dark:text-red-400'
            )}>
              {diff > 0 ? '+' : ''}{percentDiff.toFixed(1)}%
            </span>
          </>
        )}
        {isTie && (
          <>
            <Minus className="w-4 h-4 text-zinc-400" />
            <span className="text-xs text-zinc-400">Same</span>
          </>
        )}
      </div>

      {/* Prompt B Value */}
      <div className={cn(
        'w-1/4 text-center',
        bIsWinner && 'text-green-600 dark:text-green-400 font-semibold',
        aIsWinner && 'text-zinc-500',
        isTie && 'text-zinc-600 dark:text-zinc-300'
      )}>
        <span className="text-sm">{formatValue(valueB, format)}</span>
        {bIsWinner && <Crown className="inline w-3 h-3 ml-1 text-yellow-500" />}
      </div>
    </div>
  );
};

export const PromptComparisonCard: React.FC<PromptComparisonCardProps> = ({
  promptA,
  promptB,
  language = 'en',
}) => {
  const t = {
    usage: language === 'fr' ? 'Utilisations' : 'Usage',
    acceptance: language === 'fr' ? 'Acceptation' : 'Acceptance',
    editRate: language === 'fr' ? 'Éditions' : 'Edits',
    regenerateRate: language === 'fr' ? 'Régénérations' : 'Regenerations',
    rating: language === 'fr' ? 'Note' : 'Rating',
    difference: language === 'fr' ? 'Différence' : 'Difference',
  };

  // Calculate overall winner
  const scores = {
    a: 0,
    b: 0,
  };

  // Usage (higher is better)
  if (promptA.usageCount > promptB.usageCount) scores.a++;
  else if (promptB.usageCount > promptA.usageCount) scores.b++;

  // Acceptance rate (higher is better)
  if (promptA.acceptanceRate > promptB.acceptanceRate) scores.a++;
  else if (promptB.acceptanceRate > promptA.acceptanceRate) scores.b++;

  // Edit rate (lower is better)
  if (promptA.editRate < promptB.editRate) scores.a++;
  else if (promptB.editRate < promptA.editRate) scores.b++;

  // Regenerate rate (lower is better)
  if (promptA.regenerateRate < promptB.regenerateRate) scores.a++;
  else if (promptB.regenerateRate < promptA.regenerateRate) scores.b++;

  // Rating (higher is better)
  if (promptA.averageRating > promptB.averageRating) scores.a++;
  else if (promptB.averageRating > promptA.averageRating) scores.b++;

  const overallWinner = scores.a > scores.b ? 'A' : scores.b > scores.a ? 'B' : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden"
    >
      {/* Header */}
      <div className="grid grid-cols-4 gap-4 px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700">
        <div className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
          Metric
        </div>
        <div className={cn(
          'text-center text-xs font-semibold uppercase tracking-wide',
          overallWinner === 'A' ? 'text-green-600 dark:text-green-400' : 'text-zinc-600 dark:text-zinc-300'
        )}>
          {promptA.name.length > 20 ? `${promptA.name.substring(0, 20)}...` : promptA.name}
          {overallWinner === 'A' && <Crown className="inline w-3 h-3 ml-1 text-yellow-500" />}
        </div>
        <div className="text-center text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
          {t.difference}
        </div>
        <div className={cn(
          'text-center text-xs font-semibold uppercase tracking-wide',
          overallWinner === 'B' ? 'text-green-600 dark:text-green-400' : 'text-zinc-600 dark:text-zinc-300'
        )}>
          {promptB.name.length > 20 ? `${promptB.name.substring(0, 20)}...` : promptB.name}
          {overallWinner === 'B' && <Crown className="inline w-3 h-3 ml-1 text-yellow-500" />}
        </div>
      </div>

      {/* Metrics */}
      <div className="px-4">
        <MetricRow
          label={t.usage}
          valueA={promptA.usageCount}
          valueB={promptB.usageCount}
          format="number"
          higherIsBetter={true}
          icon={<BarChart3 className="w-4 h-4" />}
        />
        <MetricRow
          label={t.acceptance}
          valueA={promptA.acceptanceRate}
          valueB={promptB.acceptanceRate}
          format="percent"
          higherIsBetter={true}
          icon={<CheckCircle className="w-4 h-4" />}
        />
        <MetricRow
          label={t.editRate}
          valueA={promptA.editRate}
          valueB={promptB.editRate}
          format="percent"
          higherIsBetter={false}
          icon={<Edit3 className="w-4 h-4" />}
        />
        <MetricRow
          label={t.regenerateRate}
          valueA={promptA.regenerateRate}
          valueB={promptB.regenerateRate}
          format="percent"
          higherIsBetter={false}
          icon={<RefreshCw className="w-4 h-4" />}
        />
        <MetricRow
          label={t.rating}
          valueA={promptA.averageRating}
          valueB={promptB.averageRating}
          format="rating"
          higherIsBetter={true}
          icon={<Star className="w-4 h-4" />}
        />
      </div>

      {/* Footer with winner summary */}
      <div className="px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 border-t border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-500">
            {language === 'fr' ? 'Score global:' : 'Overall Score:'}
          </span>
          <div className="flex items-center gap-4">
            <span className={cn(
              'font-semibold',
              overallWinner === 'A' ? 'text-green-600' : 'text-zinc-600'
            )}>
              A: {scores.a}/5
            </span>
            <span className="text-zinc-400">vs</span>
            <span className={cn(
              'font-semibold',
              overallWinner === 'B' ? 'text-green-600' : 'text-zinc-600'
            )}>
              B: {scores.b}/5
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PromptComparisonCard;
