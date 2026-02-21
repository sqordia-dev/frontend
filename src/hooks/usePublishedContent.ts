import { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { cmsService } from '../lib/cms-service';
import { CmsContentBlock, PublishedContent } from '../lib/cms-types';
import { useTheme } from '../contexts/ThemeContext';
import { getUserFriendlyError } from '../utils/error-messages';

interface UsePublishedContentOptions {
  sectionKey?: string;
  language?: string; // Override language from ThemeContext
  enabled?: boolean; // Allow disabling the fetch (default true)
}

export interface UsePublishedContentReturn {
  content: PublishedContent | null;
  getBlock: (blockKey: string) => CmsContentBlock | undefined;
  getBlockContent: (blockKey: string, fallback?: string) => string;
  getSectionBlocks: (sectionKey: string) => CmsContentBlock[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Preview context: when provided, usePublishedContent returns this data instead of fetching
export const CmsPreviewContext = createContext<UsePublishedContentReturn | null>(null);

// Global cache to avoid re-fetching across components
const contentCache: Map<string, { data: PublishedContent; timestamp: number }> = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function usePublishedContent(options: UsePublishedContentOptions = {}): UsePublishedContentReturn {
  // Check for preview context (must be called unconditionally per rules of hooks)
  const previewOverride = useContext(CmsPreviewContext);

  const { language: themeLanguage } = useTheme();
  const language = options.language || themeLanguage || 'fr';
  const { sectionKey, enabled = true } = options;

  const [content, setContent] = useState<PublishedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const cacheKey = `${sectionKey || 'all'}:${language}`;

  const fetchContent = useCallback(async () => {
    if (!enabled) return;

    // Check cache
    const cached = contentCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      setContent(cached.data);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await cmsService.getPublishedContent(sectionKey, language);
      if (mountedRef.current) {
        setContent(data);
        contentCache.set(cacheKey, { data, timestamp: Date.now() });
      }
    } catch (err: any) {
      if (mountedRef.current) {
        // Don't set error for 404 - just means no published content yet
        if (err.response?.status !== 404) {
          setError(getUserFriendlyError(err, 'load'));
        }
        setContent(null);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [cacheKey, sectionKey, language, enabled]);

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

  const getBlockContent = useCallback(
    (blockKey: string, fallback: string = ''): string => {
      const block = getBlock(blockKey);
      return block?.content ?? fallback;
    },
    [getBlock]
  );

  const getSectionBlocks = useCallback(
    (sKey: string): CmsContentBlock[] => {
      return content?.sections?.[sKey] || [];
    },
    [content]
  );

  const refetch = useCallback(async () => {
    // Clear cache for this key
    contentCache.delete(cacheKey);
    await fetchContent();
  }, [cacheKey, fetchContent]);

  // If wrapped in CmsPreviewProvider, return draft data instead of fetched content
  if (previewOverride) {
    return previewOverride;
  }

  return {
    content,
    getBlock,
    getBlockContent,
    getSectionBlocks,
    isLoading,
    error,
    refetch,
  };
}
