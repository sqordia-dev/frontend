import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertCircle,
  Edit3,
  X,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  FileType,
  Download,
  BookOpen,
  Eye,
  Presentation,
  Loader2,
} from 'lucide-react';
import { Skeleton, SkeletonText } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import {
  PreviewLayout,
  SectionCard,
  SectionEditorModal,
  ShareModal,
  ExportSuccessModal,
  PlanReadinessBar,
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
import { CoverPageSettings, DEFAULT_COVER_PAGE } from '../../types/cover-page';
import { useToast } from '../../contexts/ToastContext';
import { useTheme } from '../../contexts/ThemeContext';
import SEO from '../../components/SEO';
import { exportService, type ExportFormat } from '../../lib/export-service';
import { translateSectionTitle } from '../../utils/section-title-translations';
import { AIPreviewCoach } from '../../components/preview/ai-preview-coach';
import { cn } from '../../lib/utils';
import TemplateSelector, { FALLBACK_THEMES } from '../../components/export/TemplateSelector';
import TemplatePreviewModal from '../../components/export/TemplatePreviewModal';
import type { ExportTheme } from '../../types/export-theme';

// ---------------------------------------------------------------------------
// Helpers for the export pre-flight checklist
// ---------------------------------------------------------------------------

/** Count words in a plain-text / HTML string (strips tags first). */
function countWords(text: string | null | undefined): number {
  if (!text) return 0;
  const plain = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (plain.length === 0) return 0;
  return plain.split(' ').length;
}

type SectionStatus = 'good' | 'warning' | 'empty';

function getSectionStatus(wordCount: number): SectionStatus {
  if (wordCount >= 150) return 'good';
  if (wordCount >= 50) return 'warning';
  return 'empty';
}

// ---------------------------------------------------------------------------
// Pre-flight checklist modal translations (bilingual EN/FR)
// ---------------------------------------------------------------------------

const preFlightI18n = {
  en: {
    title: 'Export Your Business Plan',
    wordsLabel: 'words',
    totalSections: 'Total sections',
    totalWords: 'Total words',
    estimatedPages: 'Estimated pages',
    formatLabel: 'Export format',
    pdfTitle: 'PDF Document',
    pdfDesc: 'Best for printing and sharing',
    wordTitle: 'Word Document',
    wordDesc: 'Best for editing and collaboration',
    pptxTitle: 'PowerPoint',
    pptxDesc: 'Slide deck for presentations',
    exportNow: 'Export Now',
    cancel: 'Cancel',
    page: 'page',
    pages: 'pages',
    previewTemplate: 'Preview',
  },
  fr: {
    title: "Exporter votre plan d\u2019affaires",
    wordsLabel: 'mots',
    totalSections: 'Sections totales',
    totalWords: 'Mots totaux',
    estimatedPages: "Pages estim\u00e9es",
    formatLabel: "Format d\u2019exportation",
    pdfTitle: 'Document PDF',
    pdfDesc: "Id\u00e9al pour imprimer et partager",
    wordTitle: 'Document Word',
    wordDesc: "Id\u00e9al pour modifier et collaborer",
    pptxTitle: 'PowerPoint',
    pptxDesc: "Diaporama pour pr\u00e9sentations",
    exportNow: 'Exporter maintenant',
    cancel: 'Annuler',
    page: 'page',
    pages: 'pages',
    previewTemplate: 'Aperçu',
  },
} as const;

// ---------------------------------------------------------------------------
// ExportProgressOverlay — full-screen feedback while export is in progress
// ---------------------------------------------------------------------------

const EXPORT_STEPS_EN: Record<ExportFormat, string[]> = {
  pdf: [
    'Preparing document layout...',
    'Rendering sections with theme...',
    'Generating selectable text...',
    'Building table of contents...',
    'Finalizing PDF...',
  ],
  word: [
    'Preparing document structure...',
    'Formatting sections...',
    'Building tables and lists...',
    'Generating Word file...',
    'Finalizing document...',
  ],
  powerpoint: [
    'Analyzing business plan content...',
    'Generating slide summaries with AI...',
    'Creating presentation slides...',
    'Adding charts and visuals...',
    'Building SWOT and risk slides...',
    'Finalizing presentation...',
  ],
};

const EXPORT_STEPS_FR: Record<ExportFormat, string[]> = {
  pdf: [
    'Préparation de la mise en page...',
    'Rendu des sections avec le thème...',
    'Génération du texte sélectionnable...',
    'Construction de la table des matières...',
    'Finalisation du PDF...',
  ],
  word: [
    'Préparation de la structure...',
    'Mise en forme des sections...',
    'Construction des tableaux et listes...',
    'Génération du fichier Word...',
    'Finalisation du document...',
  ],
  powerpoint: [
    'Analyse du contenu du plan d\u2019affaires...',
    'Génération des résumés de diapositives par IA...',
    'Création des diapositives...',
    'Ajout des graphiques et visuels...',
    'Construction des diapositives SWOT et risques...',
    'Finalisation de la présentation...',
  ],
};

const FORMAT_LABELS: Record<ExportFormat, { en: string; fr: string }> = {
  pdf: { en: 'PDF Document', fr: 'Document PDF' },
  word: { en: 'Word Document', fr: 'Document Word' },
  powerpoint: { en: 'PowerPoint Presentation', fr: 'Présentation PowerPoint' },
};

const FORMAT_ICONS: Record<ExportFormat, React.ReactNode> = {
  pdf: <FileText className="w-6 h-6 text-red-500" />,
  word: <FileType className="w-6 h-6 text-blue-500" />,
  powerpoint: <Presentation className="w-6 h-6 text-orange-500" />,
};

function ExportProgressOverlay({
  format,
  language,
}: {
  format: ExportFormat;
  language: 'en' | 'fr';
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [fakeProgress, setFakeProgress] = useState(0);
  const isFr = language === 'fr';
  const steps = isFr ? EXPORT_STEPS_FR[format] : EXPORT_STEPS_EN[format];

  // Advance steps every ~8s (PowerPoint) or ~4s (PDF/Word)
  useEffect(() => {
    const interval = format === 'powerpoint' ? 8000 : 4000;
    const timer = setInterval(() => {
      setStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
    }, interval);
    return () => clearInterval(timer);
  }, [format, steps.length]);

  // Simulate progress bar (asymptotic — never reaches 100%)
  useEffect(() => {
    const timer = setInterval(() => {
      setFakeProgress((prev) => {
        if (prev >= 92) return prev; // Cap at 92%
        const increment = prev < 30 ? 3 : prev < 60 ? 2 : prev < 80 ? 1 : 0.3;
        return Math.min(prev + increment, 92);
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8"
      >
        {/* Animated icon */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center">
              {FORMAT_ICONS[format]}
            </div>
            <motion.div
              className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-white dark:bg-gray-700 shadow-md flex items-center justify-center"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Loader2 className="w-5 h-5 text-momentum-orange" />
            </motion.div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-center text-gray-900 dark:text-white mb-1">
          {isFr ? 'Exportation en cours...' : 'Exporting your plan...'}
        </h3>
        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">
          {FORMAT_LABELS[format][language]}
        </p>

        {/* Progress bar */}
        <div className="mb-4">
          <div
            className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={Math.round(fakeProgress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <motion.div
              className="h-full bg-momentum-orange rounded-full"
              animate={{ width: `${fakeProgress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Current step */}
        <AnimatePresence mode="wait">
          <motion.p
            key={stepIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="text-sm text-center text-orange-600 dark:text-orange-400 font-medium"
          >
            {steps[stepIndex]}
          </motion.p>
        </AnimatePresence>

        {/* Hint for long exports */}
        {format === 'powerpoint' && (
          <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-4">
            {isFr
              ? 'La génération PowerPoint utilise l\u2019IA pour créer des diapositives adaptées. Cela peut prendre jusqu\u2019à 2 minutes.'
              : 'PowerPoint generation uses AI to create tailored slides. This may take up to 2 minutes.'}
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// ExportPreFlightModal component
// ---------------------------------------------------------------------------

interface ExportPreFlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat, themeId?: string) => void;
  planId: string;
  planTitle: string;
  companyName: string;
  sections: PlanSection[];
  language: 'en' | 'fr';
}

function ExportPreFlightModal({
  isOpen,
  onClose,
  onExport,
  planId,
  planTitle,
  companyName,
  sections,
  language,
}: ExportPreFlightModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('pdf');
  const [selectedTheme, setSelectedTheme] = useState<ExportTheme | null>(null);
  const [showTemplatePreview, setShowTemplatePreview] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<ExportTheme | null>(null);
  const strings = preFlightI18n[language];

  const isFr = language === 'fr';

  // Stats derived from sections
  const sectionStats = useMemo(() => {
    return sections.map((s) => {
      const wc = countWords(s.content);
      return { id: s.id, title: s.title, wordCount: wc, status: getSectionStatus(wc) };
    });
  }, [sections]);

  const totalWords = useMemo(
    () => sectionStats.reduce((sum, s) => sum + s.wordCount, 0),
    [sectionStats],
  );
  const estimatedPages = Math.max(1, Math.round(totalWords / 300));

  const emptySectionCount = useMemo(
    () => sectionStats.filter((s) => s.status === 'empty').length,
    [sectionStats],
  );

  // Escape key handler
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="export-preflight-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-preflight-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            key="export-preflight-panel"
            initial={{ opacity: 0, scale: 0.95, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 24 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                  <Download
                    className="w-5 h-5 text-orange-600 dark:text-orange-400"
                    aria-hidden="true"
                  />
                </div>
                <h2
                  id="export-preflight-title"
                  className="text-lg font-semibold text-gray-900 dark:text-white"
                >
                  {strings.title}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
              {/* Plan title */}
              <div className="flex items-center gap-3">
                <BookOpen
                  className="w-5 h-5 text-momentum-orange shrink-0"
                  aria-hidden="true"
                />
                <p className="text-base font-semibold text-gray-900 dark:text-white truncate">
                  {planTitle}
                </p>
              </div>

              {/* Section checklist */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
                {sectionStats.map((s, idx) => (
                  <div key={s.id} className="flex items-center gap-3 px-4 py-3 text-sm">
                    {/* Status icon */}
                    <span className="shrink-0" aria-hidden="true">
                      {s.status === 'good' && (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      )}
                      {s.status === 'warning' && (
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                      )}
                      {s.status === 'empty' && (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                    </span>

                    {/* Section name */}
                    <span className="flex-1 truncate text-gray-700 dark:text-gray-300">
                      {idx + 1}. {s.title}
                    </span>

                    {/* Word count */}
                    <span
                      className={cn(
                        'text-xs font-medium tabular-nums',
                        s.status === 'good' && 'text-green-600 dark:text-green-400',
                        s.status === 'warning' && 'text-yellow-600 dark:text-yellow-400',
                        s.status === 'empty' && 'text-red-500 dark:text-red-400',
                      )}
                    >
                      {s.wordCount} {strings.wordsLabel}
                    </span>
                  </div>
                ))}
              </div>

              {/* Quality legend */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                  {isFr ? '150+ mots (bon)' : '150+ words (good)'}
                </span>
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
                  {isFr ? '50-149 mots (court)' : '50-149 words (thin)'}
                </span>
                <span className="flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                  {isFr ? '< 50 mots (vide)' : '< 50 words (empty)'}
                </span>
              </div>

              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: strings.totalSections, value: String(sectionStats.length) },
                  { label: strings.totalWords, value: totalWords.toLocaleString() },
                  {
                    label: strings.estimatedPages,
                    value: `${estimatedPages} ${estimatedPages === 1 ? strings.page : strings.pages}`,
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-lg bg-gray-50 dark:bg-gray-900 p-3 text-center"
                  >
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* Template selector */}
              <TemplateSelector
                planId={planId}
                selectedThemeId={selectedTheme?.id ?? 'classic'}
                onSelect={setSelectedTheme}
                onPreview={(theme) => {
                  setPreviewTheme(theme);
                  setShowTemplatePreview(true);
                }}
                language={language}
              />

              {/* Format selector */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                  {strings.formatLabel}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  {/* PDF option */}
                  <button
                    type="button"
                    onClick={() => setSelectedFormat('pdf')}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                      selectedFormat === 'pdf'
                        ? 'border-momentum-orange bg-orange-50 dark:bg-orange-900/20 ring-1 ring-momentum-orange/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
                    )}
                  >
                    <FileText
                      className={cn(
                        'w-8 h-8',
                        selectedFormat === 'pdf'
                          ? 'text-red-500'
                          : 'text-gray-400 dark:text-gray-500',
                      )}
                    />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {strings.pdfTitle}
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 text-center leading-tight">
                      {strings.pdfDesc}
                    </span>
                  </button>

                  {/* Word option */}
                  <button
                    type="button"
                    onClick={() => setSelectedFormat('word')}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                      selectedFormat === 'word'
                        ? 'border-momentum-orange bg-orange-50 dark:bg-orange-900/20 ring-1 ring-momentum-orange/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
                    )}
                  >
                    <FileType
                      className={cn(
                        'w-8 h-8',
                        selectedFormat === 'word'
                          ? 'text-blue-500'
                          : 'text-gray-400 dark:text-gray-500',
                      )}
                    />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {strings.wordTitle}
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 text-center leading-tight">
                      {strings.wordDesc}
                    </span>
                  </button>

                  {/* PowerPoint option */}
                  <button
                    type="button"
                    onClick={() => setSelectedFormat('powerpoint')}
                    className={cn(
                      'flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all',
                      selectedFormat === 'powerpoint'
                        ? 'border-momentum-orange bg-orange-50 dark:bg-orange-900/20 ring-1 ring-momentum-orange/30'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
                    )}
                  >
                    <Presentation
                      className={cn(
                        'w-8 h-8',
                        selectedFormat === 'powerpoint'
                          ? 'text-orange-500'
                          : 'text-gray-400 dark:text-gray-500',
                      )}
                    />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {strings.pptxTitle}
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 text-center leading-tight">
                      {strings.pptxDesc}
                    </span>
                  </button>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 shrink-0">
              {emptySectionCount > 0 && (
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                        {isFr
                          ? `${emptySectionCount} section${emptySectionCount > 1 ? 's' : ''} sans contenu`
                          : `${emptySectionCount} empty section${emptySectionCount > 1 ? 's' : ''}`}
                      </p>
                      <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                        {isFr
                          ? 'Votre plan export\u00e9 contiendra des sections vides. Envisagez d\'ajouter du contenu.'
                          : 'Your exported plan will contain empty sections. Consider adding content first.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  {strings.cancel}
                </button>
                <button
                  onClick={() => onExport(selectedFormat, selectedTheme?.id)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition-all',
                    'bg-momentum-orange text-white',
                    'hover:bg-[#E56000]',
                    'focus:outline-none focus:ring-2 focus:ring-momentum-orange/50 focus:ring-offset-2',
                    'shadow-sm hover:shadow-md',
                  )}
                >
                  <Download size={16} />
                  {emptySectionCount > 0
                    ? (isFr ? 'Exporter quand m\u00eame' : 'Export Anyway')
                    : strings.exportNow}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Full-page template preview */}
    {previewTheme && (
      <TemplatePreviewModal
        isOpen={showTemplatePreview}
        onClose={() => setShowTemplatePreview(false)}
        onExport={() => {
          setSelectedTheme(previewTheme);
          setShowTemplatePreview(false);
          onExport(selectedFormat, previewTheme.id);
        }}
        theme={previewTheme}
        sections={sections}
        planTitle={planTitle}
        companyName={companyName}
        language={language}
        allThemes={FALLBACK_THEMES}
        onThemeChange={setPreviewTheme}
      />
    )}
    </>
  );
}

/**
 * Business Plan Preview Page (Redesigned)
 * Full-height layout with dark sidebar navigation and white section cards
 * Supports editing, regenerating, exporting, and sharing
 */
export default function BusinessPlanPreviewPage() {
  const { id: planId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { language, t } = useTheme();

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

  // Export pre-flight checklist modal state
  const [showExportPreFlight, setShowExportPreFlight] = useState(false);

  // Export success celebration state
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [exportedFormat, setExportedFormat] = useState<ExportFormat>('pdf');

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

  // Undo state for section edits
  const [sectionHistory, setSectionHistory] = useState<Map<string, string>>(new Map());
  const [lastEditedSectionId, setLastEditedSectionId] = useState<string | null>(null);

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
        toast.error(
          language === 'fr' ? 'Erreur de chargement' : 'Loading Error',
          language === 'fr' ? 'Impossible de charger le plan d\'affaires. Veuillez réessayer.' : 'Failed to load business plan. Please try again.'
        );
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

  // Sections with titles translated for the selected language
  const sectionsForDisplay = useMemo(() => {
    if (!preview?.sections) return [];
    return preview.sections.map((s) => ({
      ...s,
      title: translateSectionTitle(s.title, language),
    }));
  }, [preview?.sections, language]);

  // Derive active section for AI Preview Coach
  const activeSection = useMemo(() => {
    if (!activeSectionId || !sectionsForDisplay.length) return null;
    return sectionsForDisplay.find(s => s.id === activeSectionId) || null;
  }, [activeSectionId, sectionsForDisplay]);

  // Undo a section edit – restores the previous content from history
  const handleUndoSectionEdit = useCallback(() => {
    if (!lastEditedSectionId || !sectionHistory.has(lastEditedSectionId)) return;
    const previousContent = sectionHistory.get(lastEditedSectionId)!;
    // Update the section back to previous content
    setPreview(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: prev.sections.map(s =>
          s.id === lastEditedSectionId ? { ...s, content: previousContent } : s
        ),
      };
    });
    // Also save to backend
    const section = preview?.sections.find(s => s.id === lastEditedSectionId);
    if (planId && section) {
      const sectionKey = section.name || section.id;
      previewService.updateSection(planId, sectionKey, previousContent).catch(console.error);
    }
    // Clear undo state
    setSectionHistory(prev => {
      const next = new Map(prev);
      next.delete(lastEditedSectionId);
      return next;
    });
    setLastEditedSectionId(null);
    toast.success(language === 'fr' ? 'Modification annul\u00e9e' : 'Change undone');
  }, [lastEditedSectionId, sectionHistory, planId, preview?.sections, language, toast]);

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

  // Close all modals to prevent stacking
  const closeAllModals = useCallback(() => {
    setIsEditorOpen(false);
    setEditingSection(null);
    setIsShareModalOpen(false);
    setShowExportPreFlight(false);
    setShowExportSuccess(false);
    setIsCoverPageEditorOpen(false);
    setIsTOCStyleSelectorOpen(false);
  }, []);

  // Handle section edit
  const handleEditSection = useCallback((section: PlanSection) => {
    closeAllModals();
    setEditingSection(section);
    setIsEditorOpen(true);
  }, [closeAllModals]);

  // Handle save section (from modal editor)
  const handleSaveSection = useCallback(
    async (content: string) => {
      if (!planId || !editingSection) return;

      try {
        // Store previous content for undo
        const currentSection = sectionsForDisplay.find(s => s.id === editingSection.id);
        const prevContent = currentSection?.content;
        if (currentSection && prevContent) {
          setSectionHistory(prev => {
            const next = new Map(prev);
            next.set(currentSection.id, prevContent);
            return next;
          });
          setLastEditedSectionId(currentSection.id);
        }

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

        toast.addToast({
          type: 'success',
          title: language === 'fr' ? 'Section sauvegard\u00e9e' : 'Section saved',
          message: language === 'fr' ? 'Vos modifications ont \u00e9t\u00e9 enregistr\u00e9es.' : 'Your changes have been saved successfully.',
          duration: 8000,
          action: {
            label: language === 'fr' ? 'Annuler' : 'Undo',
            onClick: handleUndoSectionEdit,
          },
        });
      } catch (err) {
        console.error('Failed to save section:', err);
        toast.error('Failed to save section', 'Please try again.');
      }
    },
    [planId, editingSection, sectionsForDisplay, language, toast, handleUndoSectionEdit]
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

  // Handle AI assist on selected text (inline selection toolbar)
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
        const message = err instanceof Error ? err.message : 'AI assist failed';
        toast.error('AI assist failed', message);
        throw err;
      }
    },
    [planId, preview, language, toast]
  );

  // Handle AI assist (modal editor)
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

      // Store previous content for undo before regenerating
      const currentSection = preview?.sections.find(
        (s) => s.id === sectionId || s.name === sectionId
      );
      const prevContent = currentSection?.content;
      if (currentSection && prevContent) {
        setSectionHistory(prev => {
          const next = new Map(prev);
          next.set(currentSection.id, prevContent);
          return next;
        });
        setLastEditedSectionId(currentSection.id);
      }

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

        toast.addToast({
          type: 'success',
          title: language === 'fr' ? 'Section reg\u00e9n\u00e9r\u00e9e' : 'Section regenerated',
          message: language === 'fr' ? 'La section a \u00e9t\u00e9 reg\u00e9n\u00e9r\u00e9e avec l\'IA.' : 'The section has been regenerated with AI.',
          duration: 8000,
          action: {
            label: language === 'fr' ? 'Annuler' : 'Undo',
            onClick: handleUndoSectionEdit,
          },
        });
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
    [planId, preview?.sections, language, toast, handleUndoSectionEdit]
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
    async (format: ExportFormat = 'pdf', theme?: ExportTheme) => {
      if (!planId || !preview || !coverPageSettings) return;

      setIsExporting(true);
      setExportingFormat(format);

      try {
        await exportService.export(format, {
          coverSettings: coverPageSettings,
          sections: sectionsForDisplay,
          companyName: coverPageSettings.companyName || preview.title,
          planTitle: coverPageSettings.documentTitle || preview.title,
          language,
          exportTheme: theme,
          planId,
        });

        // Show celebration modal instead of just a toast
        setExportedFormat(format);
        setShowExportSuccess(true);
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
    [planId, preview, coverPageSettings, sectionsForDisplay, language, toast]
  );

  // Show export pre-flight checklist modal instead of exporting immediately
  const handleExportPreFlight = useCallback(
    (_format?: ExportFormat) => {
      closeAllModals();
      // Open the pre-flight modal; user will pick format inside the modal
      setShowExportPreFlight(true);
    },
    [closeAllModals],
  );

  // Called from the pre-flight modal when user clicks "Export Now"
  // Uses client-side rendering to ensure the export matches the template preview exactly.
  const handleConfirmExport = useCallback(
    async (format: ExportFormat, themeId?: string) => {
      setShowExportPreFlight(false);

      const resolvedTheme = themeId
        ? FALLBACK_THEMES.find((t) => t.id === themeId)
        : undefined;

      handleExport(format, resolvedTheme);
    },
    [handleExport],
  );

  // Handle share
  const handleOpenShareModal = useCallback(async () => {
    if (!planId) return;

    closeAllModals();
    setIsShareModalOpen(true);
    setIsCreatingShare(true);
    setShareError(null);
    setShareUrl(null);

    try {
      const result = await previewService.sharePlan(planId);
      setShareUrl(result.shareUrl);
    } catch (err) {
      console.error('Failed to create share link:', err);
      const shareErrMsg = err instanceof Error ? err.message : 'Failed to create share link';
      setShareError(shareErrMsg);
      toast.error(
        language === 'fr' ? 'Erreur de partage' : 'Share Error',
        shareErrMsg
      );
    } finally {
      setIsCreatingShare(false);
    }
  }, [planId, closeAllModals]);

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
        <div className="min-h-screen bg-warm-gray-50 dark:bg-background">
          {/* Desktop: sidebar skeleton */}
          <div className="hidden lg:block fixed left-0 top-0 h-full w-[260px] bg-white dark:bg-card border-r border-warm-gray-100 dark:border-border p-4 space-y-4">
            <Skeleton className="h-6 w-3/4 bg-warm-gray-200 dark:bg-border" />
            <Skeleton className="h-4 w-16 rounded bg-warm-gray-200 dark:bg-border" />
            <div className="mt-6 space-y-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-full rounded-lg bg-warm-gray-200 dark:bg-border" />
              ))}
            </div>
          </div>
          {/* Mobile: header skeleton */}
          <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white/95 dark:bg-card/95 backdrop-blur-xl border-b border-warm-gray-200/50 dark:border-border/50 z-40 flex items-center px-4">
            <Skeleton className="h-5 w-32 bg-warm-gray-200 dark:bg-border" />
          </div>
          {/* Main content skeleton */}
          <div className="lg:ml-[260px] pt-16 lg:pt-6 px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-[720px] py-4">
              {/* Cover page skeleton */}
              <Skeleton className="h-64 w-full rounded-xl mb-12 bg-warm-gray-200 dark:bg-border" />
              {/* Section skeletons */}
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="mb-12 space-y-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-5 bg-warm-gray-200 dark:bg-border" />
                    <Skeleton className="h-5 w-5 bg-warm-gray-200 dark:bg-border" />
                    <Skeleton className="h-7 w-48 bg-warm-gray-200 dark:bg-border" />
                  </div>
                  <SkeletonText lines={4} />
                  <div className="h-px bg-gradient-to-r from-transparent via-warm-gray-200 dark:via-secondary to-transparent" />
                </div>
              ))}
            </div>
          </div>
          <p className="sr-only">{t('preview.loading')}</p>
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
        <div className="min-h-screen flex items-center justify-center bg-warm-gray-50 dark:bg-background px-4">
          <div className="text-center max-w-md">
            <AlertCircle
              size={48}
              className="mx-auto mb-4 text-red-500"
              aria-hidden="true"
            />
            <h1 className="text-xl font-bold text-warm-gray-900 dark:text-white mb-2">
              {error || t('preview.error.title')}
            </h1>
            <p className="text-warm-gray-600 dark:text-warm-gray-400 mb-6">
              {error
                ? t('preview.error.checkUrl')
                : t('preview.error.notFound')}
            </p>
            <Button
              variant="brand"
              onClick={() => navigate('/dashboard')}
            >
              {t('preview.error.backToDashboard')}
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title={`${preview.title} - Preview | Sqordia`}
        description="Preview and edit your business plan"
        noindex={true}
        nofollow={true}
      />

      <PreviewLayout
        planTitle={preview.title}
        planStatus={preview.status || 'Draft'}
        sections={sectionsForDisplay}
        activeSectionId={activeSectionId}
        onSectionClick={handleSectionClick}
        onExportClick={handleExportPreFlight}
        onShareClick={handleOpenShareModal}
        isCoverPageActive={isCoverPageActive}
        onCoverPageClick={handleCoverPageClick}
        isTOCActive={isTOCActive}
        onTOCClick={handleTOCClick}
        isExporting={isExporting}
        exportingFormat={exportingFormat}
      >
        {/* Back to Interview Link */}
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="text-muted-foreground hover:text-foreground"
          >
            <a href={`/interview/${planId}`}>
              <Edit3 size={14} className="mr-1.5" />
              {t('preview.backToInterview')}
            </a>
          </Button>
        </div>

        {/* Plan Readiness Score Bar */}
        <PlanReadinessBar
          sections={sectionsForDisplay}
          coverPageSettings={coverPageSettings}
        />

        {/* Cover Page Section */}
        {coverPageSettings && (
          <ScrollReveal direction="none" delay={0}>
            <div id="cover-page-section" className="mb-12">
              <div className="relative rounded-xl overflow-hidden">
                <CoverPagePreview
                  settings={coverPageSettings}
                  className="border border-warm-gray-200 dark:border-border"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { closeAllModals(); setIsCoverPageEditorOpen(true); }}
                  className="absolute top-4 right-4 bg-white/90 dark:bg-secondary/90 hover:bg-white dark:hover:bg-secondary shadow-sm"
                >
                  <Edit3 size={14} />
                  {t('preview.section.editCover')}
                </Button>
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
              <Button
                variant="outline"
                size="sm"
                onClick={() => { closeAllModals(); setIsTOCStyleSelectorOpen(true); }}
                className="absolute top-4 right-4 bg-white/90 dark:bg-secondary/90 hover:bg-white dark:hover:bg-secondary shadow-sm"
              >
                <Edit3 size={14} />
                {t('preview.section.changeStyle')}
              </Button>
            </div>
          </div>
        </ScrollReveal>

        {/* Divider before sections */}
        <div className="mb-12 h-px bg-gradient-to-r from-transparent via-warm-gray-200 dark:via-secondary to-transparent" />

        {/* Business Plan Sections - Minimal Notion-style */}
        {sectionsForDisplay.map((section, index) => (
          <SectionCard
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

      {/* Export Pre-Flight Checklist Modal */}
      <ExportPreFlightModal
        isOpen={showExportPreFlight}
        onClose={() => setShowExportPreFlight(false)}
        onExport={handleConfirmExport}
        planId={planId!}
        planTitle={preview.title}
        companyName={coverPageSettings?.companyName || preview.title}
        sections={sectionsForDisplay}
        language={language}
      />

      {/* Export Progress Overlay */}
      <AnimatePresence>
        {isExporting && exportingFormat && (
          <ExportProgressOverlay format={exportingFormat} language={language} />
        )}
      </AnimatePresence>

      {/* Export Success Celebration Modal */}
      <ExportSuccessModal
        isOpen={showExportSuccess}
        exportedFormat={exportedFormat}
        onClose={() => setShowExportSuccess(false)}
        onShare={() => {
          setShowExportSuccess(false);
          handleOpenShareModal();
        }}
        onGoToFinancials={() => {
          setShowExportSuccess(false);
          navigate(`/business-plan/${planId}/financials`);
        }}
        onDownloadAgain={() => {
          setShowExportSuccess(false);
          handleExport(exportedFormat);
        }}
        onGoToDashboard={() => {
          setShowExportSuccess(false);
          navigate('/dashboard');
        }}
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

      {/* AI Preview Coach */}
      {planId && !isLoading && preview && (
        <AIPreviewCoach
          businessPlanId={planId}
          activeSection={activeSection}
          language={language}
        />
      )}
    </>
  );
}
