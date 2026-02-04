import { useState, useEffect, useCallback, useRef } from 'react';
import { cmsService } from '../lib/cms-service';
import { CmsContentBlock, PublishedContent } from '../lib/cms-types';
import { useTheme } from '../contexts/ThemeContext';

interface UseCmsContentOptions {
  enabled?: boolean;
}

export interface UseCmsContentReturn {
  /** Get CMS content for a block key, with optional i18n fallback */
  getContent: (blockKey: string, i18nFallbackKey?: string) => string;
  /** Get raw CMS block (with type, metadata, etc.) */
  getBlock: (blockKey: string) => CmsContentBlock | undefined;
  /** Get all blocks for a specific section */
  getSectionBlocks: (sectionKey: string) => CmsContentBlock[];
  /** Whether content is still loading */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
  /** Force refetch content */
  refetch: () => Promise<void>;
}

// Global cache keyed by pageKey:language
const pageContentCache: Map<string, { data: PublishedContent; timestamp: number }> = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Hook to consume CMS content for a specific page with i18n translation fallback.
 *
 * Usage:
 *   const { getContent } = useCmsContent('dashboard');
 *   const title = getContent('dashboard.welcome_title', 'dashboard.welcome');
 *   // Returns CMS content if available, otherwise falls back to t('dashboard.welcome')
 */
export function useCmsContent(pageKey: string, options: UseCmsContentOptions = {}): UseCmsContentReturn {
  const { language: themeLanguage, t } = useTheme();
  const language = themeLanguage || 'fr';
  const { enabled = true } = options;

  const [content, setContent] = useState<PublishedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const cacheKey = `${pageKey}:${language}`;

  const fetchContent = useCallback(async () => {
    if (!enabled || !pageKey) return;

    // Check cache
    const cached = pageContentCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setContent(cached.data);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await cmsService.getPublishedContentByPage(pageKey, language);
      if (mountedRef.current) {
        setContent(data);
        pageContentCache.set(cacheKey, { data, timestamp: Date.now() });
      }
    } catch (err: any) {
      if (mountedRef.current) {
        // Don't set error for 404 - just means no published content yet
        if (err.response?.status !== 404) {
          setError(err.message || 'Failed to load content');
        }
        setContent(null);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [cacheKey, pageKey, language, enabled]);

  useEffect(() => {
    mountedRef.current = true;
    fetchContent();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchContent]);

  const getBlock = useCallback(
    (blockKey: string): CmsContentBlock | undefined => {
      if (!content?.sections) return undefined;
      for (const blocks of Object.values(content.sections)) {
        const block = blocks.find((b) => b.blockKey === blockKey);
        if (block) return block;
      }
      return undefined;
    },
    [content]
  );

  const getContent = useCallback(
    (blockKey: string, i18nFallbackKey?: string): string => {
      // First try CMS content
      const block = getBlock(blockKey);
      if (block?.content) return block.content;

      // Then try i18n translation if fallback key provided
      if (i18nFallbackKey) {
        const translated = t(i18nFallbackKey);
        // t() returns the key itself if not found, check for that
        if (translated !== i18nFallbackKey) return translated;
      }

      return '';
    },
    [getBlock, t]
  );

  const getSectionBlocks = useCallback(
    (sectionKey: string): CmsContentBlock[] => {
      return content?.sections?.[sectionKey] || [];
    },
    [content]
  );

  const refetch = useCallback(async () => {
    pageContentCache.delete(cacheKey);
    await fetchContent();
  }, [cacheKey, fetchContent]);

  return {
    getContent,
    getBlock,
    getSectionBlocks,
    isLoading,
    error,
    refetch,
  };
}
