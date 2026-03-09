import { cn } from '@/lib/utils';
import type { ContentHealthMetrics } from '@/hooks/useContentHealth';

interface ContentHealthBarProps {
  health: ContentHealthMetrics;
  className?: string;
}

function getHealthColor(pct: number): string {
  if (pct >= 80) return 'bg-emerald-500';
  if (pct >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

function getHealthLabel(pct: number): string {
  if (pct >= 80) return 'Good';
  if (pct >= 50) return 'Fair';
  return 'Poor';
}

export function ContentHealthBar({ health, className }: ContentHealthBarProps) {
  const { total, filled, empty, untranslated, healthPercentage } = health;
  const barColor = getHealthColor(healthPercentage);
  const healthLabel = getHealthLabel(healthPercentage);

  return (
    <div
      className={cn(
        'flex flex-col gap-2 px-4 py-3 bg-white dark:bg-gray-900 border-b border-border',
        className,
      )}
    >
      {/* Top row: label + metrics */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Content Health
        </span>

        <span className="flex items-center gap-1.5 text-xs font-bold text-foreground">
          <span
            className={cn('w-2 h-2 rounded-full', barColor)}
          />
          {healthPercentage}% {healthLabel}
        </span>

        <span className="text-xs text-muted-foreground">
          {filled} / {total} blocks filled
        </span>

        {empty > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            {empty} empty
          </span>
        )}

        {untranslated > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-md bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            {untranslated} untranslated
          </span>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${healthPercentage}%` }}
        />
      </div>
    </div>
  );
}
