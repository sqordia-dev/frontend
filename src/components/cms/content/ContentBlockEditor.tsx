import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CmsBlockCard } from '@/components/cms/blocks/CmsBlockCard';
import { ContentStatusBadge } from '@/components/cms/shared/ContentStatusBadge';
import type { CmsContentBlock } from '@/lib/cms-types';
import type { ContentStatus } from '@/components/cms/shared/ContentStatusBadge';
import { cn } from '@/lib/utils';

interface ContentBlockEditorProps {
  block: CmsContentBlock | null;
  content: string;
  onContentChange: (content: string) => void;
  onClose: () => void;
}

function formatBlockLabel(blockKey: string): string {
  const parts = blockKey.split('.');
  const last = parts[parts.length - 1];
  return last
    .replace(/_/g, ' ')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function deriveStatus(content: string): ContentStatus {
  return content.trim().length > 0 ? 'filled' : 'empty';
}

function getBlockIcon(blockType: string): string {
  switch (blockType) {
    case 'Text': return 'title';
    case 'RichText': return 'article';
    case 'Image': return 'image';
    case 'Link': return 'link';
    case 'Json': return 'data_object';
    case 'Number': return 'pin';
    case 'Boolean': return 'toggle_on';
    default: return 'text_fields';
  }
}

function getBlockIconColor(blockType: string): string {
  switch (blockType) {
    case 'RichText': return 'bg-purple-50 text-purple-500 dark:bg-purple-900/30';
    case 'Json': return 'bg-slate-100 text-slate-600 dark:bg-slate-800';
    default: return 'bg-blue-50 text-blue-500 dark:bg-blue-900/30';
  }
}

export function ContentBlockEditor({
  block,
  content,
  onContentChange,
  onClose,
}: ContentBlockEditorProps) {
  const isOpen = block !== null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent
        className={cn('sm:max-w-2xl')}
        mobileSheet
      >
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle className="text-base font-bold">
              {block ? formatBlockLabel(block.blockKey) : 'Edit Block'}
            </DialogTitle>
            {block && (
              <>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-md bg-muted text-muted-foreground tracking-wider">
                  {block.blockType}
                </span>
                <ContentStatusBadge status={deriveStatus(content)} />
              </>
            )}
          </div>
          {block && (
            <p className="text-xs text-muted-foreground font-mono mt-1">
              {block.blockKey}
            </p>
          )}
        </DialogHeader>

        {block && (
          <div className="mt-2">
            <CmsBlockCard
              block={block}
              content={content}
              onContentChange={onContentChange}
              icon={getBlockIcon(block.blockType)}
              iconColorClass={getBlockIconColor(block.blockType)}
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
