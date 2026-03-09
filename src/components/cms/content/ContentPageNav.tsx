import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CmsPageDefinition } from '@/lib/cms-page-registry';
import { ContentPageNavItem } from './ContentPageNavItem';
import { useContentSearch } from '@/hooks/useContentSearch';
import type { CmsContentBlock } from '@/lib/cms-types';

interface ContentPageNavProps {
  pages: CmsPageDefinition[];
  blocks: CmsContentBlock[];
  selectedSection: string | null;
  onSelectSection: (sectionKey: string) => void;
  expandedPages: Set<string>;
  onExpandPage: (pageKey: string) => void;
  healthBySection: Map<string, { filled: number; total: number }>;
  className?: string;
}

export function ContentPageNav({
  pages,
  blocks,
  selectedSection,
  onSelectSection,
  expandedPages,
  onExpandPage,
  healthBySection,
  className,
}: ContentPageNavProps) {
  const { query, setSearchQuery, filteredPages } = useContentSearch(pages, blocks);

  return (
    <aside
      className={cn(
        'flex flex-col h-full bg-white dark:bg-gray-900 border-r border-border',
        className,
      )}
    >
      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="search"
            value={query}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search pages..."
            className={cn(
              'w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-border bg-muted/40',
              'focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] transition-all',
            )}
          />
        </div>
      </div>

      {/* Page tree */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {filteredPages.length === 0 && (
          <p className="px-3 py-4 text-xs text-muted-foreground text-center">
            No pages found
          </p>
        )}
        {filteredPages.map((page) => (
          <ContentPageNavItem
            key={page.key}
            page={page}
            isExpanded={expandedPages.has(page.key)}
            onToggle={() => onExpandPage(page.key)}
            selectedSection={selectedSection}
            onSelectSection={onSelectSection}
            sectionHealth={healthBySection}
          />
        ))}
      </nav>
    </aside>
  );
}
