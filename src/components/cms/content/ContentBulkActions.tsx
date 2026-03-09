import { Sparkles, Globe, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAiContentActions } from '@/hooks/useAiContentActions';
import { useContentBlocks } from '@/hooks/useContentBlocks';
import type { CmsContentBlock } from '@/lib/cms-types';

interface ContentBulkActionsProps {
  selectedBlockIds: Set<string>;
  language: 'en' | 'fr';
  onClearSelection: () => void;
  className?: string;
}

export function ContentBulkActions({
  selectedBlockIds,
  language,
  onClearSelection,
  className,
}: ContentBulkActionsProps) {
  const { blocks, getBlockContent, updateBlock } = useContentBlocks();
  const { batchFillEmpty, translate, isLoading } = useAiContentActions();

  const count = selectedBlockIds.size;

  if (count === 0) return null;

  const selectedBlocks = blocks.filter((b) => selectedBlockIds.has(b.id));

  async function handleFillEmpty() {
    const emptyBlocks = selectedBlocks
      .filter((b) => !getBlockContent(b.id).trim())
      .map((b: CmsContentBlock) => ({
        id: b.id,
        blockKey: b.blockKey,
        blockType: b.blockType,
        sectionKey: b.sectionKey,
      }));

    if (emptyBlocks.length === 0) return;

    const results = await batchFillEmpty(emptyBlocks, language);
    results.forEach((content, blockId) => {
      updateBlock(blockId, content);
    });
  }

  async function handleTranslateAll() {
    const fromLang = language === 'en' ? 'fr' : 'en';
    for (const block of selectedBlocks) {
      const content = getBlockContent(block.id);
      if (!content.trim()) continue;
      const result = await translate({ content, fromLang, toLang: language, blockType: block.blockType });
      if (result) updateBlock(block.id, result);
    }
  }

  const isFilling = isLoading('batch-fill');
  const isTranslating = isLoading(`translate-${language === 'en' ? 'fr' : 'en'}-${language}`);

  return (
    <div
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-40',
        'flex items-center gap-2 px-4 py-3 rounded-2xl',
        'bg-gray-900 dark:bg-gray-800 text-white shadow-2xl border border-gray-700',
        'animate-in slide-in-from-bottom-4 duration-200',
        className,
      )}
    >
      <span className="text-xs font-bold text-gray-300 mr-1 whitespace-nowrap">
        {count} block{count !== 1 ? 's' : ''} selected
      </span>

      {/* Fill empty */}
      <button
        type="button"
        onClick={handleFillEmpty}
        disabled={isFilling || isTranslating}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors',
          'bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-50',
        )}
      >
        {isFilling ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Sparkles className="w-3.5 h-3.5" />
        )}
        Fill Empty
      </button>

      {/* Translate all */}
      <button
        type="button"
        onClick={handleTranslateAll}
        disabled={isFilling || isTranslating}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors',
          'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50',
        )}
      >
        {isTranslating ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Globe className="w-3.5 h-3.5" />
        )}
        Translate All
      </button>

      {/* Divider */}
      <div className="w-px h-5 bg-gray-600" />

      {/* Clear */}
      <button
        type="button"
        onClick={onClearSelection}
        className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors"
      >
        <X className="w-3.5 h-3.5" />
        Clear
      </button>
    </div>
  );
}
