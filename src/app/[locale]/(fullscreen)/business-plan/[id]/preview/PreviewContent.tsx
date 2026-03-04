'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertCircle, ArrowLeft, Edit3 } from 'lucide-react';
import {
  PreviewLayoutV2,
  SectionCardV2,
  SectionEditorModal,
  ShareModal,
} from '@/components/preview';
import { ScrollReveal } from '@/components/animations';
import { CoverPagePreview, CoverPageEditor } from '@/components/cover-page';
import { TableOfContents, TOCStyleSelector } from '@/components/table-of-contents';
import { previewService } from '@/lib/preview-service';
import { coverPageService } from '@/lib/cover-page-service';
import { tocSettingsService } from '@/lib/toc-settings-service';
import { TOCSettings, TOCStyle } from '@/types/toc-settings';
import {
  BusinessPlanPreview,
  PlanSection,
  AIAssistAction,
} from '@/types/preview';
import { CoverPageSettings, DEFAULT_COVER_PAGE } from '@/types/cover-page';
import { useToast } from '@/contexts/ToastContext';
import { useTheme } from '@/contexts/ThemeContext';
import { exportService, type ExportFormat } from '@/lib/export-service';
import { translateSectionTitle } from '@/utils/section-title-translations';

const translations = {
  en: {
    loading: 'Loading your business plan...',
    planNotFound: 'Plan Not Found',
    error: 'Error',
    checkUrl: 'Please check the URL and try again.',
    planNotFoundDesc: 'The business plan could not be found.',
    backToDashboard: 'Back to Dashboard',
    editCover: 'Edit Cover',
    changeStyle: 'Change Style',
    sectionSaved: 'Section saved',
    sectionSavedDesc: 'Your changes have been saved successfully.',
    sectionRegenerated: 'Section regenerated',
    sectionRegeneratedDesc: 'The section has been regenerated with AI.',
    regenerationFailed: 'Regeneration failed',
    regenerationFailedDesc: 'Failed to regenerate section. Please try again.',
    exportComplete: 'Export complete',
    exportFailed: 'Export failed',
    exportFailedDesc: 'Failed to export business plan. Please try again.',
    aiAssistFailed: 'AI assist failed',
  },
  fr: {
    loading: "Chargement de votre plan d'affaires...",
    planNotFound: 'Plan introuvable',
    error: 'Erreur',
    checkUrl: "Veuillez verifier l'URL et reessayer.",
    planNotFoundDesc: "Le plan d'affaires n'a pas pu etre trouve.",
    backToDashboard: 'Retour au tableau de bord',
    editCover: 'Modifier',
    changeStyle: 'Style',
    sectionSaved: 'Section sauvegardee',
    sectionSavedDesc: 'Vos modifications ont ete enregistrees avec succes.',
    sectionRegenerated: 'Section regeneree',
    sectionRegeneratedDesc: "La section a ete regeneree avec l'IA.",
    regenerationFailed: 'Echec de la regeneration',
    regenerationFailedDesc: 'Impossible de regenerer la section. Veuillez reessayer.',
    exportComplete: 'Export termine',
    exportFailed: "Echec de l'export",
    exportFailedDesc: "Impossible d'exporter le plan d'affaires. Veuillez reessayer.",
    aiAssistFailed: "Echec de l'assistance IA",
  },
};

interface PreviewContentProps {
  locale: string;
  planId: string;
}

export default function PreviewContent({ locale, planId }: PreviewContentProps) {
  const router = useRouter();
  const toast = useToast();
  const { language } = useTheme();
  const basePath = locale === 'fr' ? '/fr' : '';
  const t = translations[locale as keyof typeof translations] || translations.en;

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
        } catch {
          setCoverPageSettings({
            ...DEFAULT_COVER_PAGE,
            id: '',
            businessPlanId: planId,
            companyName: data.title,
            documentTitle: 'Business Plan',
            preparedDate: new Date().toISOString(),
          } as CoverPageSettings);
        }

        // Load TOC settings
        try {
          const toc = await tocSettingsService.getSettings(planId);
          setTocSettings(toc);
        } catch {
          setTocSettings({
            id: '',
            businessPlanId: planId,
            style: 'classic',
            showPageNumbers: true,
            showIcons: true,
            showCategoryHeaders: true,
          });
        }

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

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const sectionId = entry.target.id.replace('section-', '');
            setActiveSectionId(sectionId);
          }
        });
      },
      {
        rootMargin: '-20% 0px -80% 0px',
        threshold: 0,
      }
    );

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

  // Sections with titles translated for the selected language
  const sectionsForDisplay = useMemo(() => {
    if (!preview?.sections) return [];
    return preview.sections.map((s) => ({
      ...s,
      title: translateSectionTitle(s.title, language),
    }));
  }, [preview?.sections, language]);

  // Handle section click - scroll to section
  const handleSectionClick = useCallback((sectionId: string) => {
    setActiveSectionId(sectionId);
    setIsCoverPageActive(false);
    setIsTOCActive(false);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle TOC click - scroll to TOC
  const handleTOCClick = useCallback(() => {
    setIsTOCActive(true);
    setIsCoverPageActive(false);
    setActiveSectionId(null);

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

      const sectionKey = editingSection.name || editingSection.id;
      await previewService.updateSection(planId, sectionKey, content);

      setPreview((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          sections: prev.sections.map((s) =>
            s.id === editingSection.id ? { ...s, content } : s
          ),
        };
      });

      toast.success(t.sectionSaved, t.sectionSavedDesc);
    },
    [planId, editingSection, toast, t]
  );

  // Handle inline save section
  const handleInlineSaveSection = useCallback(
    async (sectionId: string, content: string) => {
      if (!planId) return;

      const section = preview?.sections.find((s) => s.id === sectionId);
      if (!section) return;

      const sectionKey = section.name || section.id;
      await previewService.updateSection(planId, sectionKey, content);

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

  // Handle AI assist on selected text
  const handleAIAssistSelection = useCallback(
    async (sectionId: string, selectedText: string): Promise<string> => {
      if (!planId || !preview) {
        throw new Error('Plan not loaded');
      }
      try {
        const improved = await previewService.aiAssistSection(
          planId,
          sectionId,
          'improve',
          selectedText,
          preview.planType || 'BusinessPlan',
          language
        );
        return improved;
      } catch (err) {
        console.error('AI assist selection failed:', err);
        const message = err instanceof Error ? err.message : t.aiAssistFailed;
        toast.error(t.aiAssistFailed, message);
        throw err;
      }
    },
    [planId, preview, language, toast, t]
  );

  // Handle AI assist (modal editor)
  const handleAIAssist = useCallback(
    async (action: AIAssistAction, content: string, customPrompt?: string) => {
      if (!planId || !editingSection) return '';

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
        const updatedSection = await previewService.loadSection(planId, sectionId);

        setPreview((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            sections: prev.sections.map((s) =>
              (s.id === sectionId || s.name === sectionId) ? updatedSection : s
            ),
          };
        });

        toast.success(t.sectionRegenerated, t.sectionRegeneratedDesc);
      } catch (err) {
        console.error('Failed to regenerate section:', err);
        toast.error(t.regenerationFailed, t.regenerationFailedDesc);
      } finally {
        setRegeneratingSectionId(null);
      }
    },
    [planId, toast, t]
  );

  // Handle generate (for empty sections)
  const handleGenerateSection = useCallback(
    async (sectionId: string) => {
      await handleRegenerateSection(sectionId);
    },
    [handleRegenerateSection]
  );

  // Handle export
  const handleExport = useCallback(
    async (format: ExportFormat = 'pdf') => {
      if (!planId || !preview || !coverPageSettings) return;

      setIsExporting(true);
      setExportingFormat(format);

      try {
        await exportService.export(format, {
          coverSettings: coverPageSettings,
          sections: sectionsForDisplay,
          companyName: coverPageSettings.companyName || preview.title,
        });

        toast.success(
          t.exportComplete,
          `Your business plan has been exported as ${format.toUpperCase()}.`
        );
      } catch (err) {
        console.error('Export failed:', err);
        toast.error(t.exportFailed, t.exportFailedDesc);
      } finally {
        setIsExporting(false);
        setExportingFormat(null);
      }
    },
    [planId, preview, coverPageSettings, sectionsForDisplay, toast, t]
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2
            size={48}
            className="animate-spin mx-auto mb-4 text-orange-500"
            aria-hidden="true"
          />
          <p className="text-gray-600 dark:text-gray-400">
            {t.loading}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !planId || !preview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center max-w-md">
          <AlertCircle
            size={48}
            className="mx-auto mb-4 text-red-500"
            aria-hidden="true"
          />
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {error || t.planNotFound}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error ? t.checkUrl : t.planNotFoundDesc}
          </p>
          <button
            onClick={() => router.push(`${basePath}/dashboard`)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            {t.backToDashboard}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <PreviewLayoutV2
        planTitle={preview.title}
        planStatus={preview.status || 'Draft'}
        sections={sectionsForDisplay}
        activeSectionId={activeSectionId}
        onSectionClick={handleSectionClick}
        onExportClick={(format) => handleExport(format || 'pdf')}
        onShareClick={handleOpenShareModal}
        isCoverPageActive={isCoverPageActive}
        onCoverPageClick={handleCoverPageClick}
        isTOCActive={isTOCActive}
        onTOCClick={handleTOCClick}
        isExporting={isExporting}
        exportingFormat={exportingFormat}
      >
        {/* Cover Page Section */}
        {coverPageSettings && (
          <ScrollReveal direction="none" delay={0}>
            <div id="cover-page-section" className="mb-12">
              <div className="relative rounded-xl overflow-hidden">
                <CoverPagePreview
                  settings={coverPageSettings}
                  className="border border-warm-gray-200 dark:border-warm-gray-800"
                />
                <button
                  onClick={() => setIsCoverPageEditorOpen(true)}
                  className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-warm-gray-700 dark:text-warm-gray-300 bg-white/90 dark:bg-warm-gray-800/90 hover:bg-white dark:hover:bg-warm-gray-700 border border-warm-gray-200 dark:border-warm-gray-700 rounded-lg shadow-sm transition-colors"
                >
                  <Edit3 size={14} />
                  {t.editCover}
                </button>
              </div>
            </div>
          </ScrollReveal>
        )}

        {/* Table of Contents Section */}
        <ScrollReveal direction="up" delay={0.1}>
          <div id="table-of-contents-section" className="mb-12 scroll-mt-6">
            <div className="relative">
              <TableOfContents
                sections={sectionsForDisplay}
                onSectionClick={handleSectionClick}
                activeSectionId={activeSectionId}
                style={tocSettings?.style as TOCStyle || 'classic'}
              />
              <button
                onClick={() => setIsTOCStyleSelectorOpen(true)}
                className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-warm-gray-700 dark:text-warm-gray-300 bg-white/90 dark:bg-warm-gray-800/90 hover:bg-white dark:hover:bg-warm-gray-700 border border-warm-gray-200 dark:border-warm-gray-700 rounded-lg shadow-sm transition-colors"
              >
                <Edit3 size={14} />
                {t.changeStyle}
              </button>
            </div>
          </div>
        </ScrollReveal>

        {/* Divider before sections */}
        <div className="mb-12 h-px bg-gradient-to-r from-transparent via-warm-gray-200 dark:via-warm-gray-800 to-transparent" />

        {/* Business Plan Sections */}
        {sectionsForDisplay.map((section, index) => (
          <SectionCardV2
            key={section.id}
            section={section}
            sectionNumber={index + 1}
            onEdit={() => handleEditSection(section)}
            onRegenerate={() => handleRegenerateSection(section.name || section.id)}
            onGenerate={() => handleGenerateSection(section.name || section.id)}
            onInlineSave={(content) => handleInlineSaveSection(section.id, content)}
            onAIAssistSelection={handleAIAssistSelection}
            isRegenerating={regeneratingSectionId === (section.name || section.id)}
            enableInlineEdit={true}
            sectionRef={{
              current: sectionRefs.current.get(section.id) || null,
            } as React.RefObject<HTMLElement>}
          />
        ))}
      </PreviewLayoutV2>

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
