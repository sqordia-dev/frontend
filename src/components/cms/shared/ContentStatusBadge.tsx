import { cn } from '@/lib/utils';

export type ContentStatus = 'filled' | 'empty' | 'stale' | 'untranslated';

interface ContentStatusBadgeProps {
  status: ContentStatus;
  className?: string;
}

const statusConfig: Record<ContentStatus, { color: string; label: string }> = {
  filled: { color: 'bg-emerald-500', label: 'Filled' },
  empty: { color: 'bg-red-500', label: 'Empty' },
  stale: { color: 'bg-amber-500', label: 'Stale' },
  untranslated: { color: 'bg-blue-500', label: 'Untranslated' },
};

export function ContentStatusBadge({ status, className }: ContentStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn('inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground', className)}
      title={config.label}
    >
      <span className={cn('w-2 h-2 rounded-full', config.color)} />
      {config.label}
    </span>
  );
}
