import { useMemo, useEffect, useCallback } from 'react';
import { X, Eye, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PlanSection } from '../../types/preview';
import type { ExportTheme } from '../../types/export-theme';
import { cn } from '../../lib/utils';
import { markdownToHtmlForEditor } from '../../utils/markdown-to-html';
import { sanitizeHtml } from '../../utils/sanitize';

interface TemplatePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: () => void;
  theme: ExportTheme;
  sections: PlanSection[];
  planTitle: string;
  companyName: string;
  language: 'en' | 'fr';
  /** All available themes for prev/next navigation */
  allThemes?: ExportTheme[];
  /** Called when user navigates to a different theme */
  onThemeChange?: (theme: ExportTheme) => void;
}

const T = {
  en: {
    preview: 'Template Preview',
    export: 'Export with this template',
    close: 'Close preview',
    tableOfContents: 'Table of Contents',
    page: 'Page',
    prev: 'Previous template',
    next: 'Next template',
    selectAndExport: 'Select & Export',
  },
  fr: {
    preview: 'Aperçu du modèle',
    export: 'Exporter avec ce modèle',
    close: 'Fermer l\u2019aperçu',
    tableOfContents: 'Table des matières',
    page: 'Page',
    prev: 'Modèle précédent',
    next: 'Modèle suivant',
    selectAndExport: 'Sélectionner et exporter',
  },
};

export default function TemplatePreviewModal({
  isOpen,
  onClose,
  onExport,
  theme,
  sections,
  planTitle,
  companyName,
  language,
  allThemes,
  onThemeChange,
}: TemplatePreviewModalProps) {
  const t = T[language] ?? T.en;

  const currentIndex = allThemes?.findIndex((th) => th.id === theme.id) ?? -1;
  const hasPrev = allThemes && currentIndex > 0;
  const hasNext = allThemes && currentIndex >= 0 && currentIndex < allThemes.length - 1;

  const goToPrev = useCallback(() => {
    if (hasPrev && onThemeChange) onThemeChange(allThemes![currentIndex - 1]);
  }, [hasPrev, onThemeChange, allThemes, currentIndex]);

  const goToNext = useCallback(() => {
    if (hasNext && onThemeChange) onThemeChange(allThemes![currentIndex + 1]);
  }, [hasNext, onThemeChange, allThemes, currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrev();
      else if (e.key === 'ArrowRight') goToNext();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, goToPrev, goToNext, onClose]);

  // Convert markdown content to HTML for all sections once
  const processedSections = useMemo(
    () =>
      sections.map((s) => ({
        ...s,
        htmlContent: s.content ? markdownToHtmlForEditor(s.content) : null,
      })),
    [sections],
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="template-preview-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex flex-col bg-black/70 backdrop-blur-sm"
        >
          {/* Top bar */}
          <div className="flex items-center justify-between px-6 py-3 bg-gray-900/90 border-b border-gray-700 shrink-0">
            <div className="flex items-center gap-3">
              <Eye size={18} className="text-gray-400" />
              <span className="text-sm font-semibold text-white">{t.preview}</span>
              {/* Theme navigation */}
              {allThemes && allThemes.length > 1 && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={goToPrev}
                    disabled={!hasPrev}
                    className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label={t.prev}
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs text-gray-400 px-2 py-0.5 rounded-full bg-gray-800 min-w-[80px] text-center">
                    {theme.name}
                  </span>
                  <button
                    onClick={goToNext}
                    disabled={!hasNext}
                    className="p-1 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label={t.next}
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
              {(!allThemes || allThemes.length <= 1) && (
                <span className="text-xs text-gray-400 px-2 py-0.5 rounded-full bg-gray-800">
                  {theme.name}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onExport}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-momentum-orange text-white hover:bg-orange-600 transition-colors shadow-sm"
              >
                <Download size={14} />
                {t.export}
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                aria-label={t.close}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Scrollable preview area */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 relative">
            <div className="max-w-[800px] mx-auto space-y-1">
              {/* Cover Page */}
              <div
                className="rounded-t-xl overflow-hidden shadow-2xl"
                style={{ backgroundColor: theme.pageBackgroundColor }}
              >
                {/* Cover color band */}
                <div
                  className="px-10 pt-16 pb-12"
                  style={{ backgroundColor: theme.primaryColor }}
                >
                  <h1
                    className="text-3xl md:text-4xl font-bold leading-tight mb-3"
                    style={{ color: '#FFFFFF' }}
                  >
                    {planTitle}
                  </h1>
                  <p className="text-lg opacity-80" style={{ color: '#FFFFFF' }}>
                    {companyName}
                  </p>
                  <div className="mt-6 flex gap-2">
                    {theme.chartColorPalette.slice(0, 4).map((color, i) => (
                      <div
                        key={i}
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: color, opacity: 0.8 }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Table of Contents */}
              <div
                className="px-10 py-8 shadow-2xl"
                style={{ backgroundColor: theme.tocBackgroundColor }}
              >
                <h2
                  className="text-xl font-bold mb-4"
                  style={{ color: theme.headingColor }}
                >
                  {t.tableOfContents}
                </h2>
                <div className="space-y-2">
                  {processedSections.map((section, idx) => (
                    <div
                      key={section.id}
                      className="flex items-center justify-between py-1.5 border-b"
                      style={{ borderColor: theme.separatorColor }}
                    >
                      <span className="text-sm" style={{ color: theme.textColor }}>
                        {idx + 1}. {section.title}
                      </span>
                      <span className="text-xs" style={{ color: theme.mutedTextColor }}>
                        {t.page} {idx + 2}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sections */}
              {processedSections.map((section, idx) => (
                <div
                  key={section.id}
                  className="px-10 py-8 shadow-2xl"
                  style={{ backgroundColor: theme.pageBackgroundColor }}
                >
                  {/* Section heading */}
                  <div
                    className="pb-3 mb-4 border-b-2"
                    style={{ borderColor: theme.accentColor }}
                  >
                    <h2
                      className="text-xl font-bold"
                      style={{ color: theme.headingColor }}
                    >
                      {idx + 1}. {section.title}
                    </h2>
                  </div>

                  {/* Section content preview */}
                  {section.htmlContent ? (
                    <div
                      className="prose prose-sm max-w-none text-sm leading-relaxed [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2 [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1.5 [&_h4]:text-sm [&_h4]:font-semibold [&_h4]:mt-3 [&_h4]:mb-1.5 [&_p]:mb-2 [&_ul]:pl-5 [&_ul]:mb-2 [&_ol]:pl-5 [&_ol]:mb-2 [&_li]:mb-0.5 [&_strong]:font-semibold [&_a]:underline"
                      style={{
                        color: theme.textColor,
                        ['--tw-prose-headings' as string]: theme.heading2Color,
                      }}
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(
                          section.htmlContent.length > 1200
                            ? section.htmlContent.slice(0, 1200) + '…'
                            : section.htmlContent
                        ),
                      }}
                    />
                  ) : (
                    <p className="italic text-sm" style={{ color: theme.mutedTextColor }}>
                      {language === 'fr' ? 'Section vide' : 'Empty section'}
                    </p>
                  )}
                </div>
              ))}

              {/* Bottom rounded corners */}
              <div
                className="h-4 rounded-b-xl shadow-2xl"
                style={{ backgroundColor: theme.pageBackgroundColor }}
              />
            </div>

            {/* Side navigation arrows */}
            {allThemes && allThemes.length > 1 && (
              <>
                {hasPrev && (
                  <button
                    onClick={goToPrev}
                    className="fixed left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-colors shadow-lg"
                    aria-label={t.prev}
                  >
                    <ChevronLeft size={20} />
                  </button>
                )}
                {hasNext && (
                  <button
                    onClick={goToNext}
                    className="fixed right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center text-white transition-colors shadow-lg"
                    aria-label={t.next}
                  >
                    <ChevronRight size={20} />
                  </button>
                )}
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
