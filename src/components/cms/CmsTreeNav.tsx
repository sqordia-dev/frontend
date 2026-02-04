import { useState, useMemo, useEffect } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { CmsPageDefinition } from '@/lib/cms-page-registry';

interface CmsTreeNavProps {
  pages: CmsPageDefinition[];
  activePage: string;
  activeSection: string;
  onSectionClick: (pageKey: string, sectionKey: string) => void;
  onPageClick: (pageKey: string) => void;
  modifiedSections: Set<string>;
  blockCounts: Record<string, number>;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function CmsTreeNav({
  pages,
  activePage,
  activeSection,
  onSectionClick,
  onPageClick,
  modifiedSections,
  blockCounts,
  searchQuery,
  onSearchChange,
}: CmsTreeNavProps) {
  // Track which pages are expanded
  const [expandedPages, setExpandedPages] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    // Expand the page containing the active section
    for (const page of pages) {
      if (
        page.key === activePage ||
        page.sections.some((s) => s.key === activeSection)
      ) {
        initial.add(page.key);
      }
    }
    return initial;
  });

  // Auto-expand when active page/section changes externally
  useEffect(() => {
    setExpandedPages((prev) => {
      const next = new Set(prev);
      next.add(activePage);
      return next;
    });
  }, [activePage]);

  const togglePage = (pageKey: string) => {
    setExpandedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageKey)) {
        next.delete(pageKey);
      } else {
        next.add(pageKey);
      }
      return next;
    });
  };

  // Compute page-level block totals
  const pageBlockTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const page of pages) {
      totals[page.key] = page.sections.reduce(
        (sum, s) => sum + (blockCounts[s.key] ?? 0),
        0
      );
    }
    return totals;
  }, [pages, blockCounts]);

  // Filter pages/sections by search query
  const filteredPages = useMemo(() => {
    if (!searchQuery.trim()) return pages;

    const q = searchQuery.toLowerCase();
    return pages
      .map((page) => {
        const pageMatches = page.label.toLowerCase().includes(q);
        const matchingSections = page.sections.filter((s) =>
          s.label.toLowerCase().includes(q)
        );

        if (pageMatches) return page;
        if (matchingSections.length > 0) {
          return { ...page, sections: matchingSections };
        }
        return null;
      })
      .filter(Boolean) as CmsPageDefinition[];
  }, [pages, searchQuery]);

  // Auto-expand all pages when searching
  const effectiveExpanded = useMemo(() => {
    if (searchQuery.trim()) {
      return new Set(filteredPages.map((p) => p.key));
    }
    return expandedPages;
  }, [searchQuery, filteredPages, expandedPages]);

  return (
    <aside className="w-72 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-950/80 flex flex-col h-full">
      {/* Search */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-800">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
          <Input
            type="text"
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8 h-9 text-sm bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
          />
        </div>
      </div>

      {/* Tree */}
      <ScrollArea className="flex-1">
        <nav className="py-2 px-1.5" aria-label="Content pages">
          {filteredPages.length === 0 && (
            <div className="px-3 py-8 text-center">
              <p className="text-sm text-gray-400 dark:text-gray-500">
                No pages match your search
              </p>
            </div>
          )}

          {filteredPages.map((page) => {
            const isPageActive = activePage === page.key;
            const isExpanded = effectiveExpanded.has(page.key);
            const total = pageBlockTotals[page.key] ?? 0;
            const hasModified = page.sections.some((s) =>
              modifiedSections.has(s.key)
            );

            return (
              <div key={page.key} className="mb-0.5">
                {/* Page node */}
                <button
                  type="button"
                  onClick={() => {
                    togglePage(page.key);
                    onPageClick(page.key);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-2.5 py-2 text-sm rounded-lg transition-all duration-150 group',
                    isPageActive && !activeSection
                      ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-medium'
                      : isPageActive
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                  )}
                >
                  <span className="w-5 h-5 flex items-center justify-center shrink-0 text-gray-500 dark:text-gray-400">
                    {page.icon}
                  </span>
                  <span className="flex-1 text-left truncate">{page.label}</span>
                  {hasModified && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] shrink-0" />
                  )}
                  {total > 0 && (
                    <span className="text-[11px] tabular-nums text-gray-400 dark:text-gray-500 shrink-0">
                      {total}
                    </span>
                  )}
                  <ChevronRight
                    className={cn(
                      'w-3.5 h-3.5 shrink-0 text-gray-400 dark:text-gray-500 transition-transform duration-200',
                      isExpanded && 'rotate-90'
                    )}
                  />
                </button>

                {/* Section children */}
                {isExpanded && (
                  <div className="ml-[18px] mt-0.5 mb-1 border-l-2 border-gray-200 dark:border-gray-700/70">
                    {page.sections.map((section) => {
                      const isSectionActive = activeSection === section.key;
                      const sectionCount = blockCounts[section.key] ?? 0;
                      const isModified = modifiedSections.has(section.key);

                      return (
                        <button
                          key={section.key}
                          type="button"
                          onClick={() => onSectionClick(page.key, section.key)}
                          className={cn(
                            'w-full flex items-center gap-2 pl-3.5 pr-2.5 py-1.5 text-[13px] rounded-r-lg transition-all duration-150',
                            isSectionActive
                              ? 'bg-orange-50 dark:bg-orange-900/15 text-[#FF6B00] font-medium border-l-2 border-[#FF6B00] -ml-[2px]'
                              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/60 hover:text-gray-700 dark:hover:text-gray-300'
                          )}
                        >
                          <span className="flex-1 text-left truncate">{section.label}</span>
                          {isModified && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B00] shrink-0" />
                          )}
                          {sectionCount > 0 && (
                            <span
                              className={cn(
                                'text-[11px] tabular-nums shrink-0',
                                isSectionActive
                                  ? 'text-[#FF6B00]/70'
                                  : 'text-gray-400 dark:text-gray-500'
                              )}
                            >
                              {sectionCount}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>
    </aside>
  );
}
