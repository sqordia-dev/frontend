import { useState } from 'react';
import { FilePlus, Send, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useQuestionnaireVersion } from '@/contexts/QuestionnaireVersionContext';
import { VersionBadge } from '@/components/cms/shared/VersionBadge';
import { cn } from '@/lib/utils';

interface VersionControlBarProps {
  onHistoryOpen: () => void;
}

export function VersionControlBar({ onHistoryOpen }: VersionControlBarProps) {
  const { activeVersion, isLoading, isDirty, error, isEditMode, createDraft, publishDraft, discardDraft, clearError } =
    useQuestionnaireVersion();

  const [isCreating, setIsCreating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);

  const handleCreateDraft = async () => {
    setIsCreating(true);
    try {
      await createDraft();
    } finally {
      setIsCreating(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm('Publish this draft? It will become the active questionnaire for all users.')) return;
    setIsPublishing(true);
    try {
      await publishDraft();
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDiscard = async () => {
    if (!confirm('Discard this draft? All unpublished changes will be lost.')) return;
    setIsDiscarding(true);
    try {
      await discardDraft();
    } finally {
      setIsDiscarding(false);
    }
  };

  return (
    <div className="sticky top-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center gap-3 px-6 py-3">
        {/* Version info */}
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          {activeVersion ? (
            <>
              <span className="text-sm font-semibold text-foreground">
                v{activeVersion.versionNumber}
              </span>
              <VersionBadge status={activeVersion.status} />
              {isDirty && (
                <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">
                  Unsaved changes
                </span>
              )}
            </>
          ) : isLoading ? (
            <Loader2 size={14} className="animate-spin text-muted-foreground" />
          ) : (
            <span className="text-sm text-muted-foreground">No version loaded</span>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 max-w-xs truncate">
            <AlertCircle size={13} />
            <span className="truncate">{error}</span>
            <button onClick={clearError} className="underline shrink-0">Dismiss</button>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onHistoryOpen}
            className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
          >
            History
          </button>

          {!isEditMode && (
            <button
              onClick={handleCreateDraft}
              disabled={isCreating || isLoading}
              className={cn(
                'inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors',
                'bg-[#FF6B00] text-white hover:bg-orange-600 shadow-sm',
                (isCreating || isLoading) && 'opacity-50 cursor-not-allowed',
              )}
            >
              {isCreating ? (
                <><Loader2 size={13} className="animate-spin" /> Creating...</>
              ) : (
                <><FilePlus size={13} /> Create Draft</>
              )}
            </button>
          )}

          {isEditMode && (
            <>
              <button
                onClick={handleDiscard}
                disabled={isDiscarding || isPublishing}
                className={cn(
                  'inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors',
                  'border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
                  (isDiscarding || isPublishing) && 'opacity-50 cursor-not-allowed',
                )}
              >
                {isDiscarding ? (
                  <><Loader2 size={13} className="animate-spin" /> Discarding...</>
                ) : (
                  <><Trash2 size={13} /> Discard</>
                )}
              </button>

              <button
                onClick={handlePublish}
                disabled={isPublishing || isDiscarding}
                className={cn(
                  'inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors',
                  'bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm',
                  (isPublishing || isDiscarding) && 'opacity-50 cursor-not-allowed',
                )}
              >
                {isPublishing ? (
                  <><Loader2 size={13} className="animate-spin" /> Publishing...</>
                ) : (
                  <><Send size={13} /> Publish</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
