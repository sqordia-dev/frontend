import { ReactNode, useCallback, useMemo } from 'react';
import { CmsPreviewContext, UsePublishedContentReturn } from '@/hooks/usePublishedContent';
import { CmsContentBlock, PublishedContent } from '@/lib/cms-types';

interface CmsPreviewProviderProps {
  blocks: CmsContentBlock[];
  language: string;
  children: ReactNode;
}

/**
 * Wraps children so that usePublishedContent returns draft content
 * instead of fetching from the published API endpoint.
 */
export default function CmsPreviewProvider({ blocks, language, children }: CmsPreviewProviderProps) {
  // Filter blocks by language and build sections map
  const content = useMemo<PublishedContent>(() => {
    const filteredBlocks = (blocks || []).filter((b) => b.language === language);
    const sections: Record<string, CmsContentBlock[]> = {};
    for (const block of filteredBlocks) {
      if (!sections[block.sectionKey]) {
        sections[block.sectionKey] = [];
      }
      sections[block.sectionKey].push(block);
    }
    // Sort blocks within each section by sortOrder
    for (const key of Object.keys(sections)) {
      sections[key].sort((a, b) => a.sortOrder - b.sortOrder);
    }
    return { sections };
  }, [blocks, language]);

  const getBlock = useCallback(
    (blockKey: string): CmsContentBlock | undefined => {
      if (!content.sections) return undefined;
      for (const sectionBlocks of Object.values(content.sections)) {
        const block = sectionBlocks.find((b) => b.blockKey === blockKey);
        if (block) return block;
      }
      return undefined;
    },
    [content]
  );

  const getBlockContent = useCallback(
    (blockKey: string, fallback: string = ''): string => {
      const block = getBlock(blockKey);
      return block?.content ?? fallback;
    },
    [getBlock]
  );

  const getSectionBlocks = useCallback(
    (sectionKey: string): CmsContentBlock[] => {
      return content.sections?.[sectionKey] || [];
    },
    [content]
  );

  const refetch = useCallback(async () => {
    // No-op in preview mode — content comes from props
  }, []);

  const value = useMemo<UsePublishedContentReturn>(
    () => ({
      content,
      getBlock,
      getBlockContent,
      getSectionBlocks,
      isLoading: false,
      error: null,
      refetch,
    }),
    [content, getBlock, getBlockContent, getSectionBlocks, refetch]
  );

  return (
    <CmsPreviewContext.Provider value={value}>
      {children}
    </CmsPreviewContext.Provider>
  );
}
