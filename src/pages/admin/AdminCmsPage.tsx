import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, X, ChevronRight } from 'lucide-react';
import { CmsProvider, useCms } from '@/contexts/CmsContext';
import { cmsService } from '@/lib/cms-service';
import { CmsContentBlock, CmsVersion } from '@/lib/cms-types';
import { SaveStatus } from '@/components/features/questionnaire/AutoSaveIndicator';
import { Skeleton } from '@/components/ui/skeleton';
import CmsPageHeader from '@/components/cms/CmsPageHeader';
import CmsTreeNav from '@/components/cms/CmsTreeNav';
import CmsContentEditor from '@/components/cms/CmsContentEditor';
import CmsQuestionManager from '@/components/cms/CmsQuestionManager';
import CmsEmptyState from '@/components/cms/CmsEmptyState';
import CmsPublishDialog from '@/components/cms/CmsPublishDialog';
import CmsVersionHistory from '@/components/cms/CmsVersionHistory';
import { CMS_PAGE_REGISTRY, CmsPageDefinition } from '@/lib/cms-page-registry';

function AdminCmsEditor() {
  const navigate = useNavigate();
  const {
    activeVersion,
    isLoading,
    lastSaved,
    error,
    createVersion,
    saveBlocks,
    publishVersion,
    deleteVersion,
    setIsDirty,
    clearError,
  } = useCms();

  // State
  const [language, setLanguage] = useState('en');
  const [localBlocks, setLocalBlocks] = useState<CmsContentBlock[]>([]);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [modifiedBlockIds, setModifiedBlockIds] = useState<Set<string>>(new Set());
  const [activePage, setActivePage] = useState<CmsPageDefinition>(CMS_PAGE_REGISTRY[0]);
  const [activeSection, setActiveSection] = useState<string>(CMS_PAGE_REGISTRY[0].sections[0]?.key ?? '');
  const [isCreating, setIsCreating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedVersions, setPublishedVersions] = useState<CmsVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const performSaveRef = useRef<() => Promise<void>>();

  // Load published versions info when no active version
  useEffect(() => {
    if (!activeVersion && !isLoading) {
      let cancelled = false;
      const loadVersions = async () => {
        try {
          setLoadingVersions(true);
          const versions = await cmsService.getVersions();
          if (!cancelled) {
            setPublishedVersions(versions.filter((v) => v.status === 'Published'));
          }
        } catch {
          // Silently fail
        } finally {
          if (!cancelled) setLoadingVersions(false);
        }
      };
      loadVersions();
      return () => {
        cancelled = true;
      };
    }
  }, [activeVersion, isLoading]);

  // Sync localBlocks when activeVersion changes
  useEffect(() => {
    if (activeVersion?.contentBlocks) {
      setLocalBlocks(activeVersion.contentBlocks);
      setModifiedBlockIds(new Set());
    }
  }, [activeVersion]);

  // Block counts per section
  const sectionBlockCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const block of localBlocks) {
      if (block.language === language) {
        counts[block.sectionKey] = (counts[block.sectionKey] ?? 0) + 1;
      }
    }
    return counts;
  }, [localBlocks, language]);

  // Compute which sections have been modified
  const modifiedSections = useMemo(() => {
    const sections = new Set<string>();
    for (const blockId of modifiedBlockIds) {
      const block = localBlocks.find((b) => b.id === blockId);
      if (block) {
        sections.add(block.sectionKey);
      }
    }
    return sections;
  }, [modifiedBlockIds, localBlocks]);

  // Handle page click from tree nav
  const handlePageClick = useCallback((pageKey: string) => {
    const page = CMS_PAGE_REGISTRY.find((p) => p.key === pageKey);
    if (page) {
      setActivePage(page);
      // Select the first section of this page
      const firstSection = page.sections[0]?.key ?? '';
      setActiveSection(firstSection);
    }
  }, []);

  // Handle section click from tree nav
  const handleSectionClick = useCallback((pageKey: string, sectionKey: string) => {
    const page = CMS_PAGE_REGISTRY.find((p) => p.key === pageKey);
    if (page) {
      setActivePage(page);
    }
    setActiveSection(sectionKey);

    // Scroll to section if it's already rendered
    const el = sectionRefs.current[sectionKey];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Auto-save logic
  const performSave = useCallback(async () => {
    if (!activeVersion || modifiedBlockIds.size === 0) return;

    const blocksToSave = localBlocks.filter((b) => modifiedBlockIds.has(b.id));
    if (blocksToSave.length === 0) return;

    try {
      setSaveStatus('saving');
      await saveBlocks(activeVersion.id, {
        blocks: blocksToSave.map((b) => ({
          id: b.id,
          content: b.content,
          sortOrder: b.sortOrder,
          metadata: b.metadata ?? undefined,
        })),
      });
      setModifiedBlockIds(new Set());
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
    }
  }, [activeVersion, localBlocks, modifiedBlockIds, saveBlocks]);

  // Keep ref in sync
  useEffect(() => {
    performSaveRef.current = performSave;
  }, [performSave]);

  // Block change handler with debounce
  const handleBlockChange = useCallback(
    (blockId: string, content: string, metadata?: string) => {
      setLocalBlocks((prev) =>
        prev.map((b) =>
          b.id === blockId
            ? { ...b, content, metadata: metadata ?? b.metadata }
            : b
        )
      );
      setModifiedBlockIds((prev) => {
        const next = new Set(prev);
        next.add(blockId);
        return next;
      });
      setIsDirty(true);

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      saveTimeoutRef.current = setTimeout(() => {
        performSaveRef.current?.();
      }, 2000);
    },
    [setIsDirty]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Create version
  const handleCreateVersion = useCallback(async () => {
    try {
      setIsCreating(true);
      await createVersion();
    } catch {
      // Error handled by context
    } finally {
      setIsCreating(false);
    }
  }, [createVersion]);

  // Publish flow
  const handlePublishConfirm = useCallback(
    async (_notes: string) => {
      if (!activeVersion) return;
      try {
        setIsPublishing(true);
        if (modifiedBlockIds.size > 0) {
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }
          await performSave();
        }
        await publishVersion(activeVersion.id);
        setShowPublishDialog(false);
        setSaveStatus('idle');
      } catch {
        // Error handled by context
      } finally {
        setIsPublishing(false);
      }
    },
    [activeVersion, modifiedBlockIds, performSave, publishVersion]
  );

  // Discard flow
  const handleDiscard = useCallback(async () => {
    if (!activeVersion) return;
    const confirmed = window.confirm(
      'Are you sure you want to discard this draft? This action cannot be undone.'
    );
    if (!confirmed) return;
    try {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      await deleteVersion(activeVersion.id);
      setSaveStatus('idle');
      setModifiedBlockIds(new Set());
    } catch {
      // Error handled by context
    }
  }, [activeVersion, deleteVersion]);

  // Preview handler - save pending changes before navigating
  const handlePreview = useCallback(async () => {
    // Save any pending changes before navigating to preview
    if (modifiedBlockIds.size > 0) {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      await performSave();
    }
    navigate('/admin/cms/preview');
  }, [modifiedBlockIds, performSave, navigate]);

  // Image upload handler
  const handleImageUpload = useCallback(async (file: File): Promise<string> => {
    const asset = await cmsService.uploadAsset(file, 'cms');
    return asset.url;
  }, []);

  // Loading state
  if (isLoading || loadingVersions) {
    return (
      <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
        <div className="h-14 border-b border-gray-200 dark:border-gray-800 flex items-center px-4">
          <Skeleton className="h-5 w-40" />
          <div className="flex-1" />
          <Skeleton className="h-8 w-24" />
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-72 border-r border-gray-200 dark:border-gray-800 p-3 space-y-2">
            <Skeleton className="h-9 w-full" />
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-8 w-full" />
            ))}
          </div>
          <div className="flex-1 p-6 space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    );
  }

  // Error banner
  const errorBanner = error && (
    <div className="mx-4 mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-2">
      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
      <p className="text-sm text-red-600 dark:text-red-400 flex-1">{error}</p>
      <button
        type="button"
        onClick={clearError}
        className="text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );

  // Special renderer detection (e.g. question templates manage their own data)
  const isSpecialPage = !!activePage.specialRenderer;
  let activeStepFilter: number | null = null;
  if (isSpecialPage && activeSection) {
    const match = activeSection.match(/\.step(\d+)$/);
    if (match) activeStepFilter = parseInt(match[1], 10);
  }

  // Empty state - no active version (skip for special pages that don't need CMS versioning)
  if (!activeVersion && !isSpecialPage) {
    const latestPublished = publishedVersions.sort(
      (a, b) => b.versionNumber - a.versionNumber
    )[0];

    return (
      <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
        <CmsPageHeader
          version={null}
          saveStatus="idle"
          lastSaved={null}
          language={language}
          onLanguageChange={setLanguage}
          onPreview={handlePreview}
          onPublish={() => {}}
          onDiscard={() => {}}
          onVersionHistory={() => setShowVersionHistory(true)}
          disabled
        />
        {errorBanner}
        <div className="flex-1 flex items-center justify-center">
          <CmsEmptyState
            hasPublishedVersion={publishedVersions.length > 0}
            publishedVersionNumber={latestPublished?.versionNumber}
            onCreateVersion={handleCreateVersion}
            isCreating={isCreating}
          />
        </div>
        <CmsVersionHistory
          open={showVersionHistory}
          onClose={() => setShowVersionHistory(false)}
        />
      </div>
    );
  }

  // Active section info for breadcrumb
  const activeSectionDef = activePage.sections.find((s) => s.key === activeSection);

  // Determine which section keys to pass to editor
  const editorSectionKeys = activeSection
    ? [activeSection]
    : activePage.sections.map((s) => s.key);

  // Active editor: standalone full-screen layout
  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900">
      <CmsPageHeader
        version={activeVersion}
        saveStatus={saveStatus}
        lastSaved={lastSaved}
        language={language}
        onLanguageChange={setLanguage}
        onPreview={handlePreview}
        onPublish={() => setShowPublishDialog(true)}
        onDiscard={handleDiscard}
        onVersionHistory={() => setShowVersionHistory(true)}
        disabled={isSpecialPage}
      />

      {errorBanner}

      <div className="flex flex-1 overflow-hidden">
        {/* Tree Navigation */}
        <CmsTreeNav
          pages={CMS_PAGE_REGISTRY}
          activePage={activePage.key}
          activeSection={activeSection}
          onSectionClick={handleSectionClick}
          onPageClick={handlePageClick}
          modifiedSections={modifiedSections}
          blockCounts={sectionBlockCounts}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto">
          {/* Breadcrumb + Section Header */}
          <div className="sticky top-0 z-10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800/50 px-6 py-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                {activePage.icon}
                <span>{activePage.label}</span>
              </span>
              {activeSectionDef && (
                <>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                  <span className="flex items-center gap-1.5 font-medium text-gray-900 dark:text-white">
                    {activeSectionDef.icon}
                    <span>{activeSectionDef.label}</span>
                  </span>
                  {!isSpecialPage && (
                    <span className="text-xs text-gray-400 dark:text-gray-500 ml-1">
                      {sectionBlockCounts[activeSection] ?? 0} block{(sectionBlockCounts[activeSection] ?? 0) !== 1 ? 's' : ''}
                    </span>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Content: Special renderer or Block Editor */}
          {isSpecialPage ? (
            <CmsQuestionManager activeStepFilter={activeStepFilter} />
          ) : (
            <div className="p-6">
              <CmsContentEditor
                blocks={localBlocks}
                language={language}
                onBlockChange={handleBlockChange}
                onImageUpload={handleImageUpload}
                sectionRefs={sectionRefs}
                pageSectionKeys={editorSectionKeys}
                flatMode={!!activeSection}
              />
            </div>
          )}
        </main>
      </div>

      {activeVersion && (
        <CmsPublishDialog
          open={showPublishDialog}
          onClose={() => setShowPublishDialog(false)}
          onConfirm={handlePublishConfirm}
          versionNumber={activeVersion.versionNumber}
          blockCount={activeVersion.contentBlockCount}
          isPublishing={isPublishing}
        />
      )}

      <CmsVersionHistory
        open={showVersionHistory}
        onClose={() => setShowVersionHistory(false)}
      />
    </div>
  );
}

export default function AdminCmsPage() {
  return (
    <CmsProvider>
      <AdminCmsEditor />
    </CmsProvider>
  );
}
