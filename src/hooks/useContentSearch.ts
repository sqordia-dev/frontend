import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import type { CmsPageDefinition } from '../lib/cms-page-registry';
import type { CmsContentBlock } from '../lib/cms-types';

const DEBOUNCE_MS = 300;

export function useContentSearch(
  pages: CmsPageDefinition[],
  blocks: CmsContentBlock[],
) {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setSearchQuery = useCallback((value: string) => {
    setQuery(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebouncedQuery(value);
    }, DEBOUNCE_MS);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const filteredPages = useMemo(() => {
    if (!debouncedQuery.trim()) return pages;
    const q = debouncedQuery.toLowerCase();

    return pages
      .map((page) => {
        const pageMatch = page.label.toLowerCase().includes(q);
        const matchingSections = page.sections.filter((section) => {
          if (section.label.toLowerCase().includes(q)) return true;
          // Check block keys and content
          return blocks.some(
            (b) =>
              b.sectionKey === section.key &&
              (b.blockKey.toLowerCase().includes(q) || b.content.toLowerCase().includes(q)),
          );
        });

        if (pageMatch) return page;
        if (matchingSections.length > 0) return { ...page, sections: matchingSections };
        return null;
      })
      .filter(Boolean) as CmsPageDefinition[];
  }, [pages, blocks, debouncedQuery]);

  return {
    query,
    setSearchQuery,
    filteredPages,
  };
}
