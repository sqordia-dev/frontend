import { Eye, Edit, RotateCcw, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VersionTimelineItemProps {
  versionNumber: number;
  status: 'Draft' | 'Published' | 'Archived';
  createdAt: string;
  publishedAt?: string | null;
  notes?: string | null;
  createdByUserName?: string | null;
  isCurrent?: boolean;
  itemCount?: number;
  itemLabel?: string;
  onRestore?: () => void;
  isRestoring?: boolean;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = diff / (1000 * 60 * 60);
  if (hours < 24) return `Today, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  if (hours < 48) return `Yesterday, ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const statusColor: Record<string, string> = {
  Draft: 'bg-[#FF6B00]/10 text-[#FF6B00]',
  Published: 'bg-emerald-100 text-emerald-600',
  Archived: 'bg-slate-200 text-slate-500',
};

const nodeColor: Record<string, string> = {
  Draft: 'border-[#FF6B00] bg-[#FF6B00]/10',
  Published: 'border-emerald-500 bg-emerald-100',
  Archived: 'border-slate-400 bg-slate-100',
};

const borderColor: Record<string, string> = {
  Draft: 'border-l-[#FF6B00]',
  Published: 'border-l-emerald-500',
  Archived: 'border-l-slate-300',
};

export function VersionTimelineItem({
  versionNumber,
  status,
  createdAt,
  publishedAt,
  notes,
  createdByUserName,
  isCurrent,
  itemCount,
  itemLabel = 'items',
  onRestore,
  isRestoring,
}: VersionTimelineItemProps) {
  return (
    <div className="relative pl-12">
      <div
        className={cn(
          'absolute left-[18px] top-3 w-4 h-4 rounded-full border-2 z-10',
          nodeColor[status],
          isCurrent && 'ring-4 ring-[#FF6B00]/20',
        )}
      />

      <div
        className={cn(
          'bg-white dark:bg-gray-900 rounded-xl border-l-4 shadow-sm ring-1 ring-slate-200 dark:ring-gray-700 p-4 transition-all hover:shadow-md',
          borderColor[status],
          isCurrent && 'ring-2 ring-[#FF6B00]/30',
          status === 'Archived' && 'opacity-75 hover:opacity-100',
        )}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-foreground">Version {versionNumber}</span>
              <span className={cn('px-2 py-0.5 text-[10px] font-bold uppercase rounded-md tracking-wider', statusColor[status])}>
                {status}
              </span>
              {isCurrent && (
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md tracking-wider bg-[#FF6B00]/10 text-[#FF6B00]">
                  Current
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground font-medium">{formatDate(createdAt)}</p>
          </div>
          {createdByUserName && (
            <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
              {createdByUserName.split(' ').map(n => n[0]).join('').slice(0, 2)}
            </div>
          )}
        </div>

        {itemCount !== undefined && (
          <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
            <div>
              <p className="text-[11px] text-muted-foreground uppercase font-medium mb-0.5">{itemLabel}</p>
              <p className="font-semibold text-foreground">{itemCount}</p>
            </div>
            {publishedAt && (
              <div>
                <p className="text-[11px] text-muted-foreground uppercase font-medium mb-0.5">Published</p>
                <p className="font-medium text-muted-foreground text-xs">{formatDate(publishedAt)}</p>
              </div>
            )}
          </div>
        )}

        {notes && (
          <div className="mb-3 p-3 bg-muted/50 rounded-lg">
            <p className="text-[11px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Notes</p>
            <p className="text-sm text-muted-foreground italic">"{notes}"</p>
          </div>
        )}

        {onRestore && (status === 'Archived' || (status === 'Published' && !isCurrent)) && (
          <button
            onClick={onRestore}
            disabled={isRestoring}
            className={cn(
              'w-full py-2 px-3 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5',
              isRestoring
                ? 'bg-muted text-muted-foreground cursor-not-allowed'
                : status === 'Published'
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm'
                  : 'bg-white dark:bg-gray-800 text-foreground border border-border hover:bg-muted',
            )}
          >
            {isRestoring ? (
              <><Loader2 size={14} className="animate-spin" /> Restoring...</>
            ) : (
              <><RotateCcw size={14} /> Restore as Draft</>
            )}
          </button>
        )}

        {status === 'Published' && isCurrent && (
          <div className="w-full py-2 px-3 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-center flex items-center justify-center gap-1.5">
            <Eye size={14} /> Currently Active
          </div>
        )}

        {status === 'Draft' && isCurrent && (
          <div className="w-full py-2 px-3 text-xs font-medium text-[#FF6B00] bg-[#FF6B00]/5 rounded-lg text-center flex items-center justify-center gap-1.5">
            <Edit size={14} /> Currently Editing
          </div>
        )}
      </div>
    </div>
  );
}
