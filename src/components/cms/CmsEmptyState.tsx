import { Palette, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CmsEmptyStateProps {
  hasPublishedVersion: boolean;
  publishedVersionNumber?: number;
  onCreateVersion: () => void;
  isCreating?: boolean;
}

export default function CmsEmptyState({
  hasPublishedVersion,
  publishedVersionNumber,
  onCreateVersion,
  isCreating = false,
}: CmsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
      {hasPublishedVersion ? (
        <>
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-6">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Published v{publishedVersionNumber} is live
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-md">
            Your content is live on the website. Create a new draft version to make changes
            without affecting the published content.
          </p>
          <Button
            variant="brand"
            onClick={onCreateVersion}
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Start New Version'
            )}
          </Button>
        </>
      ) : (
        <>
          <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-6">
            <Palette className="w-8 h-8 text-[#FF6B00]" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Start Managing Your Content
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-md">
            Create your first content version to start managing your website's text, images,
            and other content from a single place.
          </p>
          <Button
            variant="brand"
            onClick={onCreateVersion}
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              'Create First Version'
            )}
          </Button>
        </>
      )}
    </div>
  );
}
