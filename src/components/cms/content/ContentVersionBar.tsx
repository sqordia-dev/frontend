import { useState } from 'react';
import { Save, Send, Trash2, Plus, Loader2, AlertCircle } from 'lucide-react';
import { useCms } from '@/contexts/CmsContext';
import { VersionBadge } from '@/components/cms/shared/VersionBadge';
import { useContentBlocks } from '@/hooks/useContentBlocks';
import { cn } from '@/lib/utils';

interface ContentVersionBarProps {
  onToggleTimeline: () => void;
  className?: string;
}

export function ContentVersionBar({ onToggleTimeline, className }: ContentVersionBarProps) {
  const { activeVersion, isLoading, error, publishVersion, createVersion, deleteVersion, clearError } = useCms();
  const { isDirty, isSaving, saveAllDirty } = useContentBlocks();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleSave() {
    await saveAllDirty();
  }

  async function handlePublish() {
    if (!activeVersion) return;
    setIsPublishing(true);
    try {
      await publishVersion(activeVersion.id);
    } finally {
      setIsPublishing(false);
    }
  }

  async function handleCreateDraft() {
    setIsCreating(true);
    try {
      await createVersion('New draft');
    } finally {
      setIsCreating(false);
    }
  }

  async function handleDiscard() {
    if (!activeVersion) return;
    if (!confirm('Discard this draft version? This cannot be undone.')) return;
    setIsDeleting(true);
    try {
      await deleteVersion(activeVersion.id);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div
      className={cn(
        'sticky top-0 z-30 flex items-center gap-3 px-4 py-2.5',
        'bg-white dark:bg-gray-900 border-b border-border shadow-sm',
        className,
      )}
    >
      {/* Version info */}
      <div className="flex items-center gap-2 min-w-0">
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        ) : activeVersion ? (
          <>
            <span className="text-sm font-bold text-foreground whitespace-nowrap">
              Version {activeVersion.versionNumber}
            </span>
            <VersionBadge status={activeVersion.status} />
          </>
        ) : (
          <span className="text-sm text-muted-foreground">No active draft</span>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 min-w-0 flex-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{error}</span>
          <button
            type="button"
            onClick={clearError}
            className="flex-shrink-0 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex-1" />

      {/* Dirty indicator */}
      {isDirty && !isSaving && (
        <span className="text-xs text-amber-600 dark:text-amber-400 font-medium whitespace-nowrap">
          Unsaved changes
        </span>
      )}

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* History */}
        <button
          type="button"
          onClick={onToggleTimeline}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          History
        </button>

        {activeVersion ? (
          <>
            {/* Save */}
            {isDirty && (
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-muted hover:bg-muted/80 text-foreground transition-colors disabled:opacity-50"
              >
                {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save
              </button>
            )}

            {/* Publish */}
            {activeVersion.status === 'Draft' && (
              <button
                type="button"
                onClick={handlePublish}
                disabled={isPublishing || isDirty}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors',
                  'bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-50',
                )}
              >
                {isPublishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Publish
              </button>
            )}

            {/* Discard */}
            {activeVersion.status === 'Draft' && (
              <button
                type="button"
                onClick={handleDiscard}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-border text-muted-foreground hover:text-red-600 hover:border-red-300 transition-colors disabled:opacity-50"
              >
                {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Discard
              </button>
            )}
          </>
        ) : (
          /* Create draft */
          <button
            type="button"
            onClick={handleCreateDraft}
            disabled={isCreating}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FF6B00] text-white hover:bg-[#e55e00] transition-colors disabled:opacity-50"
          >
            {isCreating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Create Draft
          </button>
        )}
      </div>
    </div>
  );
}
