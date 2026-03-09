import { useState, useEffect } from 'react';
import { History, Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { VersionTimelineItem } from '@/components/cms/shared/VersionTimelineItem';
import { questionnaireVersionService } from '@/lib/questionnaire-version-service';
import type { QuestionnaireVersion } from '@/types/questionnaire-version';
import { useQuestionnaireVersion } from '@/contexts/QuestionnaireVersionContext';

interface QuestionnaireVersionHistoryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuestionnaireVersionHistory({ open, onOpenChange }: QuestionnaireVersionHistoryProps) {
  const { activeVersion } = useQuestionnaireVersion();
  const [versions, setVersions] = useState<QuestionnaireVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await questionnaireVersionService.getVersionHistory();
        setVersions(data);
      } catch {
        setError('Failed to load version history.');
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [open]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[420px] sm:max-w-[420px] flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <History size={16} className="text-indigo-600 dark:text-indigo-400" />
            </div>
            <SheetTitle className="text-base">Version History</SheetTitle>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            All questionnaire versions and their status.
          </p>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={20} className="animate-spin text-muted-foreground" />
            </div>
          )}

          {error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {!isLoading && !error && versions.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-12">No versions found.</p>
          )}

          {!isLoading && versions.length > 0 && (
            <div className="relative space-y-4">
              {/* Timeline line */}
              <div className="absolute left-[26px] top-3 bottom-3 w-px bg-border" />

              {versions.map((version) => (
                <VersionTimelineItem
                  key={version.id}
                  versionNumber={version.versionNumber}
                  status={version.status}
                  createdAt={version.createdAt}
                  publishedAt={version.publishedAt}
                  notes={version.notes}
                  createdByUserName={version.createdByUserName}
                  isCurrent={activeVersion?.id === version.id}
                  itemCount={version.questionCount}
                  itemLabel="questions"
                />
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
