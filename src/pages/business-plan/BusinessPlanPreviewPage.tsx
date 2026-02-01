import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, ArrowLeft, Edit3 } from 'lucide-react';
import {
  PreviewLayout,
  PreviewSidebar,
  PreviewContent,
  SectionCard,
  SectionEditorModal,
  ShareModal,
  MobileHeader,
  MobileDrawer,
  DocumentSkeleton,
} from '../../components/preview';
import { ScrollReveal } from '../../components/animations';
import { CoverPagePreview, CoverPageEditor } from '../../components/cover-page';
import { TableOfContents, TOCStyleSelector } from '../../components/table-of-contents';
import { previewService } from '../../lib/preview-service';
import { coverPageService } from '../../lib/cover-page-service';
import { tocSettingsService } from '../../lib/toc-settings-service';
import { TOCSettings, TOCStyle } from '../../types/toc-settings';
import {
  BusinessPlanPreview,
  PlanSection,
  AIAssistAction,
} from '../../types/preview';
import { CoverPageSettings } from '../../types/cover-page';
import { useToast } from '../../contexts/ToastContext';
import { useTheme } from '../../contexts/ThemeContext';
import SEO from '../../components/SEO';
import { exportService, type ExportFormat } from '../../lib/export-service';

/**
 * Business Plan Preview Page (Redesigned)
 * Full-height layout with dark sidebar navigation and white section cards
 * Supports editing, regenerating, exporting, and sharing
 */
export default function BusinessPlanPreviewPage() {
  const { id: planId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { language } = useTheme();

  // State
  const [preview, setPreview] = useState<BusinessPlanPreview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [regeneratingSectionId, setRegeneratingSectionId] = useState<string | null>(null);

  // Editor modal state
  const [editingSection, setEditingSection] = useState<PlanSection | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Export state
  const [isExporting, setIsExporting] = useState(false);
  const [exportingFormat, setExportingFormat] = useState<ExportFormat | null>(null);

  // Share modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isCreatingShare, setIsCreatingShare] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  // Cover page state
  const [coverPageSettings, setCoverPageSettings] = useState<CoverPageSettings | null>(null);
  const [isCoverPageEditorOpen, setIsCoverPageEditorOpen] = useState(false);
  const [isCoverPageActive, setIsCoverPageActive] = useState(true);

  // Table of Contents state
  const [isTOCActive, setIsTOCActive] = useState(false);
  const [tocSettings, setTocSettings] = useState<TOCSettings | null>(null);
  const [isTOCStyleSelectorOpen, setIsTOCStyleSelectorOpen] = useState(false);

  // Section refs for scrolling and intersection observer
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Load preview data
  useEffect(() => {
    const loadPreview = async () => {
      if (!planId) {
        setError('No plan ID provided');
        setIsLoading(false);
        return;
      }

      try {
        const data = await previewService.loadPlanPreview(planId);
        setPreview(data);

        // Load cover page settings
        try {
          const coverPage = await coverPageService.getCoverPage(planId);
          setCoverPageSettings(coverPage);
        } catch (coverError) {
          console.warn('Failed to load cover page, using defaults:', coverError);
          // Use default cover page settings
          setCoverPageSettings({
            id: '',
            businessPlanId: planId,
            companyName: data.title,
            documentTitle: 'Business Plan',
            primaryColor: '#2563EB',
            layoutStyle: 'classic',
            preparedDate: new Date().toISOString(),
          });
        }

        // Load TOC settings
        try {
          const toc = await tocSettingsService.getSettings(planId);
          setTocSettings(toc);
        } catch (tocError) {
          console.warn('Failed to load TOC settings, using defaults:', tocError);
          setTocSettings({
            id: '',
            businessPlanId: planId,
            style: 'classic',
            showPageNumbers: true,
            showIcons: true,
            showCategoryHeaders: true,
          });
        }

        // Set cover page as active by default
        setIsCoverPageActive(true);
        setActiveSectionId(null);
      } catch (err) {
        console.error('Failed to load preview:', err);
        setError('Failed to load business plan. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadPreview();
  }, [planId]);

  // Set up IntersectionObserver for active section tracking
  useEffect(() => {
    if (!preview || preview.sections.length === 0) return;

    // Clean up previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Extract section ID from element ID (format: section-{id})
            const sectionId = entry.target.id.replace('section-', '');
            setActiveSectionId(sectionId);
          }
        });
      },
      {
        rootMargin: '-20% 0px -80% 0px', // Trigger when section is 20% from top
        threshold: 0,
      }
    );

    // Observe all sections
    preview.sections.forEach((section) => {
      const element = document.getElementById(`section-${section.id}`);
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [preview]);

  // Handle section click - scroll to section
  const handleSectionClick = useCallback((sectionId: string) => {
    setActiveSectionId(sectionId);
    setIsCoverPageActive(false);
    setIsTOCActive(false);

    // Scroll to section with smooth behavior
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Handle cover page click - scroll to top
  const handleCoverPageClick = useCallback(() => {
    setIsCoverPageActive(true);
    setActiveSectionId(null);
    setIsTOCActive(false);

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle TOC click - scroll to TOC
  const handleTOCClick = useCallback(() => {
    setIsTOCActive(true);
    setIsCoverPageActive(false);
    setActiveSectionId(null);

    // Scroll to TOC section
    const element = document.getElementById('table-of-contents-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Handle cover page save
  const handleCoverPageSave = useCallback((settings: CoverPageSettings) => {
    setCoverPageSettings(settings);
  }, []);

  // Handle TOC settings save
  const handleTOCSettingsSave = useCallback((settings: TOCSettings) => {
    setTocSettings(settings);
  }, []);

  // Handle section edit
  const handleEditSection = useCallback((section: PlanSection) => {
    setEditingSection(section);
    setIsEditorOpen(true);
  }, []);

  // Handle save section (from modal editor)
  const handleSaveSection = useCallback(
    async (content: string) => {
      if (!planId || !editingSection) return;

      // Use section name for API (backend expects name, not generated id)
      const sectionKey = editingSection.name || editingSection.id;
      await previewService.updateSection(planId, sectionKey, content);

      // Update local state
      setPreview((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          sections: prev.sections.map((s) =>
            s.id === editingSection.id ? { ...s, content } : s
          ),
        };
      });

      toast.success('Section saved', 'Your changes have been saved successfully.');
    },
    [planId, editingSection, toast]
  );

  // Handle inline save section (direct editing on page)
  const handleInlineSaveSection = useCallback(
    async (sectionId: string, content: string) => {
      if (!planId) return;

      // Find the section to get the correct API key
      const section = preview?.sections.find((s) => s.id === sectionId);
      if (!section) return;

      const sectionKey = section.name || section.id;
      await previewService.updateSection(planId, sectionKey, content);

      // Update local state with optimistic update (already done before API call in EditableSection)
      setPreview((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          sections: prev.sections.map((s) =>
            s.id === sectionId ? { ...s, content } : s
          ),
        };
      });
    },
    [planId, preview?.sections]
  );

  // Handle AI assist
  const handleAIAssist = useCallback(
    async (action: AIAssistAction, content: string, customPrompt?: string) => {
      if (!planId || !editingSection) return '';

      // Use section name for API (backend expects name, not generated id)
      const sectionKey = editingSection.name || editingSection.id;
      const improvedContent = await previewService.aiAssistSection(
        planId,
        sectionKey,
        action,
        content,
        preview?.planType || 'BusinessPlan',
        language,
        customPrompt
      );

      return improvedContent;
    },
    [planId, editingSection, preview?.planType, language]
  );

  // Handle regenerate section
  const handleRegenerateSection = useCallback(
    async (sectionId: string) => {
      if (!planId) return;

      setRegeneratingSectionId(sectionId);

      try {
        await previewService.regenerateSection(planId, sectionId);

        // Reload section content
        const updatedSection = await previewService.loadSection(planId, sectionId);

        // Update local state (match by id or name)
        setPreview((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            sections: prev.sections.map((s) =>
              (s.id === sectionId || s.name === sectionId) ? updatedSection : s
            ),
          };
        });

        toast.success(
          'Section regenerated',
          'The section has been regenerated with AI.'
        );
      } catch (err) {
        console.error('Failed to regenerate section:', err);
        toast.error(
          'Regeneration failed',
          'Failed to regenerate section. Please try again.'
        );
      } finally {
        setRegeneratingSectionId(null);
      }
    },
    [planId, toast]
  );

  // Handle generate (for empty sections)
  const handleGenerateSection = useCallback(
    async (sectionId: string) => {
      // Same as regenerate for empty sections
      await handleRegenerateSection(sectionId);
    },
    [handleRegenerateSection]
  );

  // Handle export using client-side generation
  const handleExport = useCallback(
    async (format: ExportFormat = 'pdf') => {
      if (!planId || !preview || !coverPageSettings) return;

      setIsExporting(true);
      setExportingFormat(format);

      try {
        // Use client-side export service
        await exportService.export(format, {
          coverSettings: coverPageSettings,
          sections: preview.sections,
          companyName: coverPageSettings.companyName || preview.title,
        });

        toast.success(
          'Export complete',
          `Your business plan has been exported as ${format.toUpperCase()}.`
        );
      } catch (err) {
        console.error('Export failed:', err);
        toast.error(
          'Export failed',
          'Failed to export business plan. Please try again.'
        );
      } finally {
        setIsExporting(false);
        setExportingFormat(null);
      }
    },
    [planId, preview, coverPageSettings, toast]
  );

  // Handle share
  const handleOpenShareModal = useCallback(async () => {
    if (!planId) return;

    setIsShareModalOpen(true);
    setIsCreatingShare(true);
    setShareError(null);
    setShareUrl(null);

    try {
      const result = await previewService.sharePlan(planId);
      setShareUrl(result.shareUrl);
    } catch (err) {
      console.error('Failed to create share link:', err);
      setShareError(
        err instanceof Error ? err.message : 'Failed to create share link'
      );
    } finally {
      setIsCreatingShare(false);
    }
  }, [planId]);

  // Loading state
  if (isLoading) {
    return (
      <>
        <SEO
          title="Loading Preview | Sqordia"
          description="Loading your business plan preview"
          noindex={true}
          nofollow={true}
        />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <Loader2
              size={48}
              className="animate-spin mx-auto mb-4 text-momentum-orange"
              aria-hidden="true"
            />
            <p className="text-gray-600 dark:text-gray-400">
              Loading your business plan...
            </p>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error || !planId || !preview) {
    return (
      <>
        <SEO
          title="Error | Sqordia"
          description="An error occurred"
          noindex={true}
          nofollow={true}
        />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="text-center max-w-md">
            <AlertCircle
              size={48}
              className="mx-auto mb-4 text-red-500"
              aria-hidden="true"
            />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {error || 'Plan Not Found'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error
                ? 'Please check the URL and try again.'
                : 'The business plan could not be found.'}
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-momentum-orange hover:bg-orange-600 text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-momentum-orange focus:ring-offset-2"
            >
              <ArrowLeft size={18} aria-hidden="true" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </>
    );
  }

  // Sidebar component to pass to layout
  const sidebarContent = (
    <PreviewSidebar
      planName={preview.title}
      planStatus={preview.status || 'Draft'}
      sections={preview.sections}
      activeSectionId={activeSectionId}
      onSectionClick={handleSectionClick}
      onExportClick={(format) => handleExport(format || 'pdf')}
      onShareClick={handleOpenShareModal}
      onEditCoverPage={() => setIsCoverPageEditorOpen(true)}
      isCoverPageActive={isCoverPageActive}
      onCoverPageClick={handleCoverPageClick}
      isExporting={isExporting}
      exportingFormat={exportingFormat}
      isTOCActive={isTOCActive}
      onTOCClick={handleTOCClick}
    />
  );

  return (
    <>
      <SEO
        title={`${preview.title} - Preview | Sqordia`}
        description="Preview and edit your business plan"
        noindex={true}
        nofollow={true}
      />

      <PreviewLayout
        sidebar={sidebarContent}
        planTitle={preview.title}
        onExport={() => handleExport('pdf')}
        onShare={handleOpenShareModal}
        isExporting={isExporting}
        sections={preview.sections}
        activeSectionId={activeSectionId}
        onSectionScroll={handleSectionClick}
      >
        <PreviewContent
          sections={preview.sections}
          onSectionClick={handleSectionClick}
          onExport={() => handleExport('pdf')}
          onShare={handleOpenShareModal}
          showProgressBar={true}
          showStickyTOC={true}
          showFloatingActions={true}
        >
          {/* Cover Page Section */}
          {coverPageSettings && (
            <ScrollReveal direction="none" delay={0}>
              <div id="cover-page-section" className="mb-8">
                <div className="relative">
                  <CoverPagePreview
                    settings={coverPageSettings}
                    className="border border-gray-200 dark:border-gray-700"
                  />
                  <button
                    onClick={() => setIsCoverPageEditorOpen(true)}
                    className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm transition-colors"
                  >
                    <Edit3 size={14} />
                    Edit Cover
                  </button>
                </div>
              </div>
            </ScrollReveal>
          )}

          {/* Table of Contents Section */}
          <ScrollReveal direction="up" delay={0.1}>
            <div id="table-of-contents-section" className="mb-8 scroll-mt-6">
              <div className="relative">
                <TableOfContents
                  sections={preview.sections}
                  onSectionClick={handleSectionClick}
                  activeSectionId={activeSectionId}
                  style={tocSettings?.style as TOCStyle || 'classic'}
                />
                <button
                  onClick={() => setIsTOCStyleSelectorOpen(true)}
                  className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-sm transition-colors"
                >
                  <Edit3 size={14} />
                  Change Style
                </button>
              </div>
            </div>
          </ScrollReveal>

          {/* Business Plan Sections with scroll-triggered animations */}
          {preview.sections.map((section, index) => (
            <ScrollReveal
              key={section.id}
              direction="up"
              delay={index < 3 ? index * 0.1 : 0}
              distance={20}
            >
              <SectionCard
                section={section}
                sectionNumber={index + 1}
                onEdit={() => handleEditSection(section)}
                onRegenerate={() => handleRegenerateSection(section.name || section.id)}
                onGenerate={() => handleGenerateSection(section.name || section.id)}
                onInlineSave={(content) => handleInlineSaveSection(section.id, content)}
                isRegenerating={regeneratingSectionId === (section.name || section.id)}
                enableInlineEdit={false}
                sectionRef={{
                  current: sectionRefs.current.get(section.id) || null,
                } as React.RefObject<HTMLElement>}
              />
            </ScrollReveal>
          ))}
        </PreviewContent>
      </PreviewLayout>

      {/* Editor Modal */}
      <SectionEditorModal
        isOpen={isEditorOpen}
        section={editingSection}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingSection(null);
        }}
        onSave={handleSaveSection}
        onAIAssist={handleAIAssist}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        shareUrl={shareUrl}
        isLoading={isCreatingShare}
        error={shareError}
      />

      {/* Cover Page Editor Modal */}
      {planId && (
        <CoverPageEditor
          isOpen={isCoverPageEditorOpen}
          planId={planId}
          planTitle={preview.title}
          onClose={() => setIsCoverPageEditorOpen(false)}
          onSave={handleCoverPageSave}
        />
      )}

      {/* TOC Style Selector Modal */}
      {planId && (
        <TOCStyleSelector
          isOpen={isTOCStyleSelectorOpen}
          planId={planId}
          onClose={() => setIsTOCStyleSelectorOpen(false)}
          onSave={handleTOCSettingsSave}
        />
      )}
    </>
  );
}
