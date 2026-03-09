import { cn } from '@/lib/utils';

interface VersionBadgeProps {
  status: 'Draft' | 'Published' | 'Archived';
  className?: string;
}

const statusStyles: Record<string, string> = {
  Draft: 'bg-[#FF6B00]/10 text-[#FF6B00]',
  Published: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  Archived: 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400',
};

export function VersionBadge({ status, className }: VersionBadgeProps) {
  return (
    <span
      className={cn(
        'px-2 py-0.5 text-[10px] font-bold uppercase rounded-md tracking-wider',
        statusStyles[status],
        className,
      )}
    >
      {status}
    </span>
  );
}
