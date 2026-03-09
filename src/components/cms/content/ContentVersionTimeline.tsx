import { useEffect, useState } from 'react';
import { History, Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { VersionTimelineItem } from '@/components/cms/shared/VersionTimelineItem';
import { cmsService } from '@/lib/cms-service';
import { useCms } from '@/contexts/CmsContext';
import type { CmsVersion } from '@/lib/cms-types';
import { cn } from '@/lib/utils';

interface ContentVersionTimelineProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContentVersionTimeline({ open, onOpenChange }: ContentVersionTimelineProps) {
  const { activeVersion, createVersion } = useCms();
  const [versions, setVersions] = useState<CmsVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setIsLoading(true);
    cmsService.getVersions()
      .then(setVersions)
      .catch(() => setVersions([]))
      .finally(() => setIsLoading(false));
  }, [open]);

  async function handleRestore(version: CmsVersion) {
    setRestoringId(version.id);
    try {
      await createVersion(`Restored from version ${version.versionNumber}`);
      onOpenChange(false);
    } finally {
      setRestoringId(null);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[380px] sm:max-w-[420px] flex flex-col">
        <SheetHeader className="pb-3 border-b border-border">
          <SheetTitle className="flex items-center gap-2 text-base">
            <History className="w-4 h-4 text-[#FF6B00]" />
            Version History
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : versions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <History className="w-8 h-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-foreground">No versions yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Create a draft and start editing to build version history.
              </p>
            </div>
          ) : (
            <div className="relative space-y-3">
              {/* Timeline line */}
              <div className="absolute left-[26px] top-4 bottom-4 w-px bg-border" />

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
                  itemCount={version.contentBlockCount}
                  itemLabel="blocks"
                  onRestore={() => handleRestore(version)}
                  isRestoring={restoringId === version.id}
                />
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
