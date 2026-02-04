import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cmsService } from '@/lib/cms-service';
import { CmsVersion } from '@/lib/cms-types';
import { Calendar, User, FileText } from 'lucide-react';

interface CmsVersionHistoryProps {
  open: boolean;
  onClose: () => void;
}

export default function CmsVersionHistory({ open, onClose }: CmsVersionHistoryProps) {
  const [versions, setVersions] = useState<CmsVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const fetchVersions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await cmsService.getVersions();
        if (!cancelled) {
          // Sort by version number descending (most recent first)
          const sorted = [...data].sort((a, b) => b.versionNumber - a.versionNumber);
          setVersions(sorted);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err.message || 'Failed to load versions');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchVersions();

    return () => {
      cancelled = true;
    };
  }, [open]);

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'warning';
      case 'Published':
        return 'success';
      case 'Archived':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Version History</SheetTitle>
          <SheetDescription>
            View all content versions and their publication status.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-3">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-12" />
                </div>
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </div>
            ))
          ) : error ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-10 h-10 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No versions found.
              </p>
            </div>
          ) : (
            versions.map((version) => (
              <div
                key={version.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
              >
                {/* Header: Badge + Version number */}
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={getStatusVariant(version.status) as any}>
                    {version.status}
                  </Badge>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    v{version.versionNumber}
                  </span>
                  <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
                    {version.contentBlockCount} block{version.contentBlockCount !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Created info */}
                <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Created {formatDate(version.createdAt)}</span>
                </div>

                {version.createdByUserName && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <User className="w-3.5 h-3.5" />
                    <span>by {version.createdByUserName}</span>
                  </div>
                )}

                {/* Published info */}
                {version.publishedAt && (
                  <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 mt-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>
                      Published {formatDate(version.publishedAt)}
                      {version.publishedByUserName && ` by ${version.publishedByUserName}`}
                    </span>
                  </div>
                )}

                {/* Notes */}
                {version.notes && (
                  <p className="mt-2 text-xs text-gray-600 dark:text-gray-400 italic border-t border-gray-100 dark:border-gray-800 pt-2">
                    {version.notes}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
