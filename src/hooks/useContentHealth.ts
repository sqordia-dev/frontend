import { useMemo } from 'react';
import type { CmsContentBlock } from '../lib/cms-types';
import type { CmsPageDefinition } from '../lib/cms-page-registry';

export interface ContentHealthMetrics {
  total: number;
  filled: number;
  empty: number;
  untranslated: number;
  healthPercentage: number;
  bySection: Map<string, { filled: number; total: number }>;
}

export function useContentHealth(
  blocks: CmsContentBlock[],
  pages: CmsPageDefinition[],
) {
  return useMemo<ContentHealthMetrics>(() => {
    const bySection = new Map<string, { filled: number; total: number }>();

    let total = 0;
    let filled = 0;
    let empty = 0;
    let untranslated = 0;

    // Group blocks by blockKey to check bilingual coverage
    const blocksByKey = new Map<string, CmsContentBlock[]>();
    for (const block of blocks) {
      const existing = blocksByKey.get(block.blockKey) ?? [];
      existing.push(block);
      blocksByKey.set(block.blockKey, existing);
    }

    for (const block of blocks) {
      total++;
      const hasContent = block.content.trim().length > 0;

      if (hasContent) {
        filled++;
      } else {
        empty++;
      }

      // Check if counterpart language exists
      const siblings = blocksByKey.get(block.blockKey) ?? [];
      const otherLang = block.language === 'en' ? 'fr' : 'en';
      const hasOtherLang = siblings.some(
        (b) => b.language === otherLang && b.content.trim().length > 0,
      );
      if (hasContent && !hasOtherLang) {
        untranslated++;
      }

      // Track by section
      const section = bySection.get(block.sectionKey) ?? { filled: 0, total: 0 };
      section.total++;
      if (hasContent) section.filled++;
      bySection.set(block.sectionKey, section);
    }

    const healthPercentage = total > 0 ? Math.round((filled / total) * 100) : 100;

    return { total, filled, empty, untranslated, healthPercentage, bySection };
  }, [blocks, pages]);
}
