import { CmsBlockCard } from '@/components/cms/blocks/CmsBlockCard';
import { AiGenerateButton } from '@/components/cms/shared/AiGenerateButton';
import { AiTranslateButton } from '@/components/cms/shared/AiTranslateButton';
import { ContentStatusBadge } from '@/components/cms/shared/ContentStatusBadge';
import { useAiContentActions } from '@/hooks/useAiContentActions';
import type { CmsContentBlock } from '@/lib/cms-types';
import type { ContentStatus } from '@/components/cms/shared/ContentStatusBadge';
import { cn } from '@/lib/utils';

interface ContentBlockCardProps {
  block: CmsContentBlock;
  content: string;
  onContentChange: (content: string) => void;
  language: 'en' | 'fr';
  className?: string;
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
    case 'Text': return 'bg-blue-50 text-blue-500 dark:bg-blue-900/30';
    case 'RichText': return 'bg-purple-50 text-purple-500 dark:bg-purple-900/30';
    case 'Image': return 'bg-emerald-50 text-emerald-500 dark:bg-emerald-900/30';
    case 'Link': return 'bg-[#FF6B00]/10 text-[#FF6B00]';
    case 'Json': return 'bg-slate-100 text-slate-600 dark:bg-slate-800';
    case 'Number': return 'bg-amber-50 text-amber-600 dark:bg-amber-900/30';
    case 'Boolean': return 'bg-teal-50 text-teal-600 dark:bg-teal-900/30';
    default: return 'bg-muted text-muted-foreground';
  }
}

export function ContentBlockCard({
  block,
  content,
  onContentChange,
  language,
  className,
}: ContentBlockCardProps) {
  const { generateField, translate, isLoading } = useAiContentActions();
  const status = deriveStatus(content);
  const canAi = block.blockType === 'Text' || block.blockType === 'RichText';

  const generateKey = `generate-${block.blockKey}-${language}`;
  const translateKey = `translate-${language === 'en' ? 'fr' : 'en'}-${language}`;

  async function handleGenerate() {
    const result = await generateField({
      blockKey: block.blockKey,
      blockType: block.blockType,
      language,
      sectionContext: block.sectionKey,
    });
    if (result) onContentChange(result);
  }

  async function handleTranslate() {
    const fromLang = language === 'en' ? 'fr' : 'en';
    const result = await translate({
      content,
      fromLang,
      toLang: language,
      blockType: block.blockType,
    });
    if (result) onContentChange(result);
  }

  return (
    <div className={cn('relative group', className)}>
      {/* Status + AI actions overlay */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <ContentStatusBadge status={status} />
        {canAi && (
          <>
            <AiGenerateButton
              onClick={handleGenerate}
              isLoading={isLoading(generateKey)}
              label="Generate"
            />
            {content.trim().length > 0 && (
              <AiTranslateButton
                onClick={handleTranslate}
                isLoading={isLoading(translateKey)}
                direction={language === 'en' ? 'fr-to-en' : 'en-to-fr'}
              />
            )}
          </>
        )}
      </div>

      <CmsBlockCard
        block={block}
        content={content}
        onContentChange={onContentChange}
        icon={getBlockIcon(block.blockType)}
        iconColorClass={getBlockIconColor(block.blockType)}
      />
    </div>
  );
}
