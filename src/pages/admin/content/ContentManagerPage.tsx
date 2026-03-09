import { useState, useEffect, useCallback } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { CmsProvider, useCms } from '@/contexts/CmsContext';
import { useContentBlocks } from '@/hooks/useContentBlocks';
import { useContentHealth } from '@/hooks/useContentHealth';
import { loadCmsPages } from '@/lib/cms-page-registry';
import type { CmsPageDefinition } from '@/lib/cms-page-registry';
import { LanguageToggle } from '@/components/cms/shared/LanguageToggle';
import { ContentVersionBar } from '@/components/cms/content/ContentVersionBar';
import { ContentHealthBar } from '@/components/cms/content/ContentHealthBar';
import { ContentPageNav } from '@/components/cms/content/ContentPageNav';
import { ContentSectionGrid } from '@/components/cms/content/ContentSectionGrid';
import { ContentVersionTimeline } from '@/components/cms/content/ContentVersionTimeline';
import { ContentBulkActions } from '@/components/cms/content/ContentBulkActions';
import { ContentAiBatchPanel } from '@/components/cms/content/ContentAiBatchPanel';
import { cn } from '@/lib/utils';

// Inner component — must be inside CmsProvider so useCms() works
function ContentManagerInner() {
  const { isLoading, activeVersion } = useCms();
  const { blocks } = useContentBlocks();

  const [pages, setPages] = useState<CmsPageDefinition[]>([]);
  const [isPagesLoading, setIsPagesLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set());
  const [language, setLanguage] = useState<'en' | 'fr'>('fr');
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [batchPanelOpen, setBatchPanelOpen] = useState(false);
  const [selectedBlockIds] = useState<Set<string>>(new Set());

  // Load page definitions
  useEffect(() => {
    setIsPagesLoading(true);
    loadCmsPages()
      .then((loaded) => {
        setPages(loaded);
        // Auto-expand and select first page/section
        if (loaded.length > 0) {
          const first = loaded[0];
          setExpandedPages(new Set([first.key]));
          if (first.sections.length > 0) {
            setSelectedSection(first.sections[0].key);
          }
        }
      })
      .finally(() => setIsPagesLoading(false));
  }, []);

  const health = useContentHealth(blocks, pages);

  const handleExpandPage = useCallback((pageKey: string) => {
    setExpandedPages((prev) => {
      const next = new Set(prev);
      if (next.has(pageKey)) {
        next.delete(pageKey);
      } else {
        next.add(pageKey);
      }
      return next;
    });
  }, []);

  const handleSelectSection = useCallback((sectionKey: string) => {
    setSelectedSection(sectionKey);
    // Ensure parent page is expanded
    const parentPage = pages.find((p) =>
      p.sections.some((s) => s.key === sectionKey)
    );
    if (parentPage) {
      setExpandedPages((prev) => {
        if (prev.has(parentPage.key)) return prev;
        return new Set([...prev, parentPage.key]);
      });
    }
  }, [pages]);

  const showLoading = isLoading || isPagesLoading;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background">
      {/* Version bar */}
      <ContentVersionBar onToggleTimeline={() => setTimelineOpen((o) => !o)} />

      {/* Health bar */}
      {!showLoading && <ContentHealthBar health={health} />}

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar */}
        {!showLoading && (
          <ContentPageNav
            pages={pages}
            blocks={blocks}
            selectedSection={selectedSection}
            onSelectSection={handleSelectSection}
            expandedPages={expandedPages}
            onExpandPage={handleExpandPage}
            healthBySection={health.bySection}
            className="w-64 flex-shrink-0"
          />
        )}

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto">
          {showLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#FF6B00]" />
                <p className="text-sm text-muted-foreground">Loading content manager...</p>
              </div>
            </div>
          ) : !activeVersion ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-[#FF6B00]/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-[#FF6B00]" />
              </div>
              <div>
                <p className="text-base font-bold text-foreground mb-1">No active draft</p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Create a new draft version to start editing content blocks across all pages.
                </p>
              </div>
            </div>
          ) : !selectedSection ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-8 text-center">
              <p className="text-sm text-muted-foreground">
                Select a section from the left panel to start editing.
              </p>
            </div>
          ) : (
            <div className="p-6">
              {/* Language toggle */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <LanguageToggle value={language} onChange={setLanguage} />
                </div>
                <button
                  type="button"
                  onClick={() => setBatchPanelOpen((o) => !o)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors',
                    batchPanelOpen
                      ? 'bg-purple-600 text-white'
                      : 'bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-400',
                  )}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Batch
                </button>
              </div>

              <ContentSectionGrid sectionKey={selectedSection} language={language} />
            </div>
          )}
        </main>

        {/* AI Batch Panel */}
        {batchPanelOpen && (
          <ContentAiBatchPanel
            open={batchPanelOpen}
            onClose={() => setBatchPanelOpen(false)}
            language={language}
            sectionKey={selectedSection ?? undefined}
          />
        )}
      </div>

      {/* Version timeline sheet */}
      <ContentVersionTimeline open={timelineOpen} onOpenChange={setTimelineOpen} />

      {/* Bulk actions floating bar */}
      <ContentBulkActions
        selectedBlockIds={selectedBlockIds}
        language={language}
        onClearSelection={() => {}}
      />
    </div>
  );
}

// Public export — wraps inner content in CmsProvider
export function ContentManagerPage() {
  return (
    <CmsProvider>
      <ContentManagerInner />
    </CmsProvider>
  );
}

export default ContentManagerPage;
