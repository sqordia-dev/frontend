import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { GripVertical } from 'lucide-react';
import { CmsProvider, useCms } from '../../contexts/CmsContext';
import { CmsHeader } from '../../components/cms/CmsHeader';
import { CmsLeftSidebar } from '../../components/cms/CmsLeftSidebar';
import { CmsMainEditor } from '../../components/cms/CmsMainEditor';
import { CmsLivePreview } from '../../components/cms/CmsLivePreview';
import { CmsMobileDrawer } from '../../components/cms/CmsMobileDrawer';
import { CmsVersionHistorySidebar } from '../../components/cms/modals/CmsVersionHistorySidebar';
import { CmsScheduleDialog } from '../../components/cms/modals/CmsScheduleDialog';
import { CmsQuestionTemplateEditor } from '../../components/cms/CmsQuestionTemplateEditor';
import { loadCmsPages, CmsPageDefinition } from '../../lib/cms-page-registry';
import { CmsContentBlock } from '../../lib/cms-types';

type Language = 'en' | 'fr';
type PreviewDevice = 'desktop' | 'tablet' | 'mobile';

interface CmsEditorContentProps {
  pages: CmsPageDefinition[];
}

function CmsEditorContent({ pages }: CmsEditorContentProps) {
  const { activeVersion, isLoading, isDirty, lastSaved, createVersion, saveBlocks, publishVersion, setIsDirty } = useCms();

  // Selected page and section
  const [selectedPageKey, setSelectedPageKey] = useState<string>('landing');
  const [selectedSectionKey, setSelectedSectionKey] = useState<string>('landing.hero');
  const [expandedPages, setExpandedPages] = useState<Set<string>>(new Set(['landing']));

  // Language
  const [language, setLanguage] = useState<Language>('en');

  // Preview
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice>('desktop');

  // Mobile drawer
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  // Dialogs
  const [isVersionHistoryOpen, setIsVersionHistoryOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);

  // Content blocks for current section
  const [sectionBlocks, setSectionBlocks] = useState<CmsContentBlock[]>([]);
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});

  // Publishing state
  const [isPublishing, setIsPublishing] = useState(false);

  // Resizable preview panel
  const [previewWidth, setPreviewWidth] = useState(480); // Default 480px
  const isResizing = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Build dynamic pages with labels from CMS content
  const dynamicPages = useMemo(() => {
    if (!activeVersion) return pages;

    return pages.map(page => {
      // For question_templates, update section labels from CMS content
      if (page.key === 'question_templates') {
        const updatedSections = page.sections.map(section => {
          // Look for label block like 'question_templates.step1.label'
          const labelBlock = activeVersion.contentBlocks.find(
            b => b.blockKey === `${section.key}.label` && b.language === language
          );
          if (labelBlock) {
            return { ...section, label: labelBlock.content };
          }
          return section;
        });
        return { ...page, sections: updatedSections };
      }
      return page;
    });
  }, [pages, activeVersion, language]);

  // Get selected page and section
  const selectedPage = dynamicPages.find(p => p.key === selectedPageKey);
  const selectedSection = selectedPage?.sections.find(s => s.key === selectedSectionKey);

  // Auto-select first section with content when version loads
  useEffect(() => {
    if (activeVersion && activeVersion.contentBlocks.length > 0) {
      // Find sections that have content
      const sectionsWithContent = new Set(
        activeVersion.contentBlocks
          .filter(b => b.language === language)
          .map(b => b.sectionKey)
      );

      // If current section has no content, find one that does
      if (!sectionsWithContent.has(selectedSectionKey)) {
        for (const page of dynamicPages) {
          // Skip pages with special renderers (like Questions)
          if (page.specialRenderer) continue;

          for (const section of page.sections) {
            if (sectionsWithContent.has(section.key)) {
              setSelectedPageKey(page.key);
              setSelectedSectionKey(section.key);
              setExpandedPages(prev => new Set([...prev, page.key]));
              return;
            }
          }
        }
      }
    }
  }, [activeVersion, language, dynamicPages]); // Only run when version loads, not on every selection change

  // Load blocks when section changes
  useEffect(() => {
    if (activeVersion && selectedSectionKey) {
      const blocks = activeVersion.contentBlocks.filter(
        b => b.sectionKey === selectedSectionKey && b.language === language
      );
      setSectionBlocks(blocks);
      // Initialize edited content
      const initial: Record<string, string> = {};
      blocks.forEach(b => {
        initial[b.id] = b.content;
      });
      setEditedContent(initial);
    } else {
      setSectionBlocks([]);
      setEditedContent({});
    }
  }, [activeVersion, selectedSectionKey, language]);

  // Handle content change
  const handleContentChange = useCallback((blockId: string, content: string) => {
    setEditedContent(prev => ({ ...prev, [blockId]: content }));
    setIsDirty(true);
  }, [setIsDirty]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!activeVersion) return;

    const blocksToUpdate = Object.entries(editedContent).map(([id, content]) => ({
      id,
      content,
    }));

    if (blocksToUpdate.length > 0) {
      await saveBlocks(activeVersion.id, { blocks: blocksToUpdate });
    }
  }, [activeVersion, editedContent, saveBlocks]);

  // Handle publish
  const handlePublish = useCallback(async () => {
    if (!activeVersion) return;

    setIsPublishing(true);
    try {
      // Save any pending changes first
      if (isDirty) {
        await handleSave();
      }
      await publishVersion(activeVersion.id);
      // Create new draft after publishing
      await createVersion();
    } catch (err) {
      console.error('Failed to publish:', err);
    } finally {
      setIsPublishing(false);
    }
  }, [activeVersion, isDirty, handleSave, publishVersion, createVersion]);

  // Handle page selection
  const handlePageClick = (pageKey: string) => {
    setExpandedPages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(pageKey)) {
        newSet.delete(pageKey);
      } else {
        newSet.add(pageKey);
      }
      return newSet;
    });
  };

  // Handle section selection
  const handleSectionClick = (pageKey: string, sectionKey: string) => {
    setSelectedPageKey(pageKey);
    setSelectedSectionKey(sectionKey);
    setIsMobileDrawerOpen(false);
  };

  // Calculate time since last saved
  const getTimeSinceLastSaved = () => {
    if (!lastSaved) return null;
    const diff = Date.now() - lastSaved.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Saved just now';
    if (minutes === 1) return 'Saved 1 min ago';
    return `Saved ${minutes} min ago`;
  };

  // Handle resize start
  const handleResizeStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing.current || !containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = containerRect.right - e.clientX;
      // Constrain between 300px and 800px
      setPreviewWidth(Math.max(300, Math.min(800, newWidth)));
    };

    const handleMouseUp = () => {
      isResizing.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-500">Loading CMS Editor...</p>
        </div>
      </div>
    );
  }

  if (!activeVersion) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl text-[#FF6B00]">edit_document</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Active Draft</h2>
          <p className="text-slate-500 mb-6">Create a new draft to start editing content.</p>
          <button
            onClick={() => createVersion()}
            className="bg-[#FF6B00] hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            Create New Draft
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#F9FAFB]">
      {/* Header */}
      <CmsHeader
        versionNumber={activeVersion.versionNumber}
        lastSaved={getTimeSinceLastSaved()}
        language={language}
        onLanguageChange={setLanguage}
        onPublish={handlePublish}
        isPublishing={isPublishing}
        isDirty={isDirty}
        onOpenVersionHistory={() => setIsVersionHistoryOpen(true)}
        onOpenSchedule={() => setIsScheduleDialogOpen(true)}
        onOpenMobileMenu={() => setIsMobileDrawerOpen(true)}
      />

      {/* Main Content */}
      <div ref={containerRef} className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Hidden on mobile */}
        <CmsLeftSidebar
          pages={dynamicPages}
          selectedPageKey={selectedPageKey}
          selectedSectionKey={selectedSectionKey}
          expandedPages={expandedPages}
          onPageClick={handlePageClick}
          onSectionClick={handleSectionClick}
        />

        {/* Main Content Area - Conditional based on specialRenderer */}
        {selectedPage?.specialRenderer === 'question-templates' ? (
          <CmsQuestionTemplateEditor
            selectedStepNumber={
              selectedSectionKey.startsWith('question_templates.step')
                ? parseInt(selectedSectionKey.replace('question_templates.step', ''), 10)
                : 1
            }
            stepLabel={selectedSection?.label}
          />
        ) : (
          <>
            {/* Main Editor */}
            <div className="flex flex-col flex-1 min-w-0">
              <CmsMainEditor
                selectedPage={selectedPage}
                selectedSection={selectedSection}
                blocks={sectionBlocks}
                editedContent={editedContent}
                onContentChange={handleContentChange}
                onSave={handleSave}
                isDirty={isDirty}
              />
            </div>

            {/* Resizable Divider - Hidden on tablet/mobile */}
            <div
              className="hidden lg:flex w-2 bg-slate-100 hover:bg-slate-200 cursor-col-resize items-center justify-center group transition-colors flex-shrink-0"
              onMouseDown={handleResizeStart}
            >
              <GripVertical size={16} className="text-slate-400 group-hover:text-slate-600 transition-colors" />
            </div>

            {/* Live Preview - Hidden on tablet/mobile */}
            <div className="hidden lg:block flex-shrink-0 h-full" style={{ width: previewWidth }}>
              <CmsLivePreview
                device={previewDevice}
                onDeviceChange={setPreviewDevice}
                blocks={sectionBlocks}
                editedContent={editedContent}
                sectionKey={selectedSectionKey}
                isDraft={activeVersion?.status === 'Draft'}
              />
            </div>
          </>
        )}
      </div>

      {/* Mobile Drawer */}
      <CmsMobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        pages={dynamicPages}
        selectedPageKey={selectedPageKey}
        selectedSectionKey={selectedSectionKey}
        expandedPages={expandedPages}
        onPageClick={handlePageClick}
        onSectionClick={handleSectionClick}
        language={language}
        onLanguageChange={setLanguage}
      />

      {/* Version History Sidebar */}
      <CmsVersionHistorySidebar
        isOpen={isVersionHistoryOpen}
        onClose={() => setIsVersionHistoryOpen(false)}
        versionId={activeVersion.id}
      />

      {/* Schedule Dialog */}
      <CmsScheduleDialog
        isOpen={isScheduleDialogOpen}
        onClose={() => setIsScheduleDialogOpen(false)}
        versionId={activeVersion.id}
        versionNumber={activeVersion.versionNumber}
      />
    </div>
  );
}

export default function CmsEditorPage() {
  const [pages, setPages] = useState<CmsPageDefinition[]>([]);
  const [isLoadingPages, setIsLoadingPages] = useState(true);

  useEffect(() => {
    loadCmsPages().then(p => {
      setPages(p);
      setIsLoadingPages(false);
    });
  }, []);

  if (isLoadingPages) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F9FAFB]">
        <div className="w-8 h-8 border-2 border-[#FF6B00] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <CmsProvider>
      <CmsEditorContent pages={pages} />
    </CmsProvider>
  );
}
