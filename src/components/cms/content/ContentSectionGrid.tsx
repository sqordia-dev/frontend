import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useContentBlocks } from '@/hooks/useContentBlocks';
import { ContentBlockCard } from './ContentBlockCard';
import { getSectionLabel, getSectionIcon } from '@/lib/cms-page-registry';

interface ContentSectionGridProps {
  sectionKey: string;
  language: 'en' | 'fr';
  className?: string;
}

export function ContentSectionGrid({
  sectionKey,
  language,
  className,
}: ContentSectionGridProps) {
  const { getBlocksForSection, getBlockContent, updateBlock } = useContentBlocks();
  const blocks = getBlocksForSection(sectionKey, language);
  const sectionLabel = getSectionLabel(sectionKey);
  const sectionIcon = getSectionIcon(sectionKey);

  if (blocks.length === 0) {
    return (
      <div className={cn('flex flex-col items-center justify-center py-16 px-6 text-center', className)}>
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
          <FileText className="w-5 h-5 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-foreground mb-1">No blocks found</p>
        <p className="text-xs text-muted-foreground max-w-xs">
          There are no content blocks for this section in {language === 'en' ? 'English' : 'French'}.
          Switch languages or select a different section.
        </p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-5 pb-3 border-b border-border">
        <span className="text-muted-foreground">{sectionIcon}</span>
        <h2 className="text-base font-bold text-foreground">{sectionLabel}</h2>
        <span className="text-xs font-medium text-muted-foreground px-2 py-0.5 bg-muted rounded-md ml-auto">
          {blocks.length} block{blocks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Blocks grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {blocks.map((block) => (
          <ContentBlockCard
            key={block.id}
            block={block}
            content={getBlockContent(block.id)}
            onContentChange={(content) => updateBlock(block.id, content)}
            language={language}
          />
        ))}
      </div>
    </div>
  );
}
