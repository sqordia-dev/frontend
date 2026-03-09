import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  BarChart3,
} from 'lucide-react';
import { PlanSection } from '../../types/preview';
import { CoverPageSettings } from '../../types/cover-page';
import { cn } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';

/** Minimum word count for a section to be considered "complete" */
const TARGET_WORD_COUNT = 200;

/** Score weight distribution */
const WEIGHT_SECTION_COVERAGE = 0.6;
const WEIGHT_WORD_COUNT = 0.3;
const WEIGHT_COVER_PAGE = 0.1;

interface SectionReadiness {
  id: string;
  title: string;
  wordCount: number;
  status: 'complete' | 'partial' | 'missing';
}

interface ReadinessResult {
  totalScore: number;
  sectionCoverageScore: number;
  wordCountScore: number;
  coverPageScore: number;
  sections: SectionReadiness[];
  weakestSection: SectionReadiness | null;
}

function countWords(text: string | null | undefined): number {
  if (!text) return 0;
  // Strip HTML tags for accurate word count
  const stripped = text.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ');
  const words = stripped.trim().split(/\s+/).filter(Boolean);
  return words.length;
}

function calculateReadiness(
  sections: PlanSection[],
  coverPageSettings: CoverPageSettings | null
): ReadinessResult {
  const totalSections = sections.length;

  const sectionDetails: SectionReadiness[] = sections.map((s) => {
    const wc = countWords(s.content);
    let status: SectionReadiness['status'] = 'missing';
    if (wc >= TARGET_WORD_COUNT) {
      status = 'complete';
    } else if (wc > 0) {
      status = 'partial';
    }
    return {
      id: s.id,
      title: s.title,
      wordCount: wc,
      status,
    };
  });

  // 1. Section coverage: % of sections that have any content
  const sectionsWithContent = sectionDetails.filter((s) => s.wordCount > 0).length;
  const sectionCoverageScore =
    totalSections > 0 ? (sectionsWithContent / totalSections) * 100 : 0;

  // 2. Average word count score: avg word count vs target, capped at 100
  const avgWordCount =
    totalSections > 0
      ? sectionDetails.reduce((sum, s) => sum + s.wordCount, 0) / totalSections
      : 0;
  const wordCountScore = Math.min((avgWordCount / TARGET_WORD_COUNT) * 100, 100);

  // 3. Cover page score: 100 if settings exist and have company name, 0 otherwise
  const hasCoverPage =
    coverPageSettings != null &&
    coverPageSettings.companyName != null &&
    coverPageSettings.companyName.trim().length > 0;
  const coverPageScore = hasCoverPage ? 100 : 0;

  // Weighted total
  const totalScore = Math.round(
    sectionCoverageScore * WEIGHT_SECTION_COVERAGE +
      wordCountScore * WEIGHT_WORD_COUNT +
      coverPageScore * WEIGHT_COVER_PAGE
  );

  // Find weakest section (lowest word count among non-zero, or first empty)
  const sorted = [...sectionDetails].sort((a, b) => a.wordCount - b.wordCount);
  const weakestSection = sorted.length > 0 ? sorted[0] : null;

  return {
    totalScore: Math.min(totalScore, 100),
    sectionCoverageScore: Math.round(sectionCoverageScore),
    wordCountScore: Math.round(wordCountScore),
    coverPageScore: Math.round(coverPageScore),
    sections: sectionDetails,
    weakestSection,
  };
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600 dark:text-green-400';
  if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
}

function getBarColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 50) return 'bg-yellow-500';
  return 'bg-red-500';
}

function getBarTrackColor(score: number): string {
  if (score >= 80) return 'bg-green-100 dark:bg-green-900/30';
  if (score >= 50) return 'bg-yellow-100 dark:bg-yellow-900/30';
  return 'bg-red-100 dark:bg-red-900/30';
}

function getSectionStatusIcon(status: SectionReadiness['status']) {
  switch (status) {
    case 'complete':
      return <CheckCircle2 size={16} className="text-green-500 shrink-0" />;
    case 'partial':
      return <AlertTriangle size={16} className="text-yellow-500 shrink-0" />;
    case 'missing':
      return <XCircle size={16} className="text-red-400 shrink-0" />;
  }
}

interface PlanReadinessBarProps {
  sections: PlanSection[];
  coverPageSettings: CoverPageSettings | null;
  className?: string;
}

export default function PlanReadinessBar({
  sections,
  coverPageSettings,
  className,
}: PlanReadinessBarProps) {
  const { language } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);

  const readiness = useMemo(
    () => calculateReadiness(sections, coverPageSettings),
    [sections, coverPageSettings]
  );

  const labels = useMemo(() => {
    const isFr = language === 'fr';
    return {
      title: isFr ? 'Progression du plan' : 'Plan Readiness',
      ready: isFr ? 'Votre plan est prêt à' : 'Your plan is',
      readySuffix: isFr ? '' : 'ready',
      recommendation: getRecommendation(readiness, isFr),
      breakdown: isFr ? 'Détails par section' : 'Section Breakdown',
      sectionCoverage: isFr ? 'Couverture des sections' : 'Section Coverage',
      contentDepth: isFr ? 'Profondeur du contenu' : 'Content Depth',
      coverPage: isFr ? 'Page couverture' : 'Cover Page',
      words: isFr ? 'mots' : 'words',
      complete: isFr ? 'Complet' : 'Complete',
      partial: isFr ? 'Partiel' : 'Partial',
      missing: isFr ? 'Manquant' : 'Missing',
      showDetails: isFr ? 'Voir les détails' : 'Show details',
      hideDetails: isFr ? 'Masquer les détails' : 'Hide details',
      tipMissing: isFr ? 'Ajoutez du contenu pour améliorer votre plan' : 'Add content to improve your plan',
      tipShort: isFr ? 'Envisagez de développer cette section' : 'Consider expanding this section',
    };
  }, [language, readiness]);

  const { totalScore } = readiness;

  return (
    <div
      className={cn(
        'sticky top-[2px] lg:top-[2px] z-30',
        'mb-8',
        className
      )}
    >
      <div
        className={cn(
          'rounded-xl border',
          'bg-white/95 dark:bg-card/95 backdrop-blur-lg',
          'border-warm-gray-200/60 dark:border-border/60',
          'shadow-sm',
          'transition-all duration-200'
        )}
      >
        {/* Main bar */}
        <button
          onClick={() => setIsExpanded((prev) => !prev)}
          className="w-full px-4 py-3 flex items-center gap-3 cursor-pointer select-none hover:bg-warm-gray-50/50 dark:hover:bg-secondary/30 transition-colors rounded-xl"
          aria-expanded={isExpanded}
          aria-controls="readiness-breakdown"
        >
          {/* Icon */}
          <div
            className={cn(
              'shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
              totalScore >= 80
                ? 'bg-green-50 dark:bg-green-900/30'
                : totalScore >= 50
                  ? 'bg-yellow-50 dark:bg-yellow-900/30'
                  : 'bg-red-50 dark:bg-red-900/30'
            )}
          >
            <BarChart3
              size={18}
              className={cn(
                totalScore >= 80
                  ? 'text-green-600 dark:text-green-400'
                  : totalScore >= 50
                    ? 'text-yellow-600 dark:text-yellow-400'
                    : 'text-red-600 dark:text-red-400'
              )}
            />
          </div>

          {/* Score + recommendation */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-medium text-warm-gray-500 dark:text-warm-gray-400 uppercase tracking-wide">
                {labels.title}
              </span>
              <span className={cn('text-sm font-bold', getScoreColor(totalScore))}>
                {totalScore}%
              </span>
            </div>

            {/* Progress bar */}
            <div className={cn('h-1.5 rounded-full w-full', getBarTrackColor(totalScore))}>
              <motion.div
                className={cn('h-full rounded-full', getBarColor(totalScore))}
                initial={{ width: 0 }}
                animate={{ width: `${totalScore}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>

            {/* Recommendation text */}
            <p className="mt-1 text-xs text-warm-gray-500 dark:text-warm-gray-400 truncate">
              {labels.recommendation}
            </p>
          </div>

          {/* Expand/collapse indicator */}
          <div className="shrink-0 text-warm-gray-400 dark:text-warm-gray-500">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </button>

        {/* Collapsible breakdown */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              id="readiness-breakdown"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 pt-1 border-t border-warm-gray-100 dark:border-border/50">
                {/* Score breakdown badges */}
                <div className="flex flex-wrap gap-3 mt-3 mb-4">
                  <ScoreBadge
                    label={labels.sectionCoverage}
                    score={readiness.sectionCoverageScore}
                  />
                  <ScoreBadge
                    label={labels.contentDepth}
                    score={readiness.wordCountScore}
                  />
                  <ScoreBadge
                    label={labels.coverPage}
                    score={readiness.coverPageScore}
                  />
                </div>

                {/* Per-section list */}
                <p className="text-xs font-semibold text-warm-gray-600 dark:text-warm-gray-300 mb-2 uppercase tracking-wide">
                  {labels.breakdown}
                </p>
                <div className="space-y-1.5 max-h-[260px] overflow-y-auto pr-1">
                  {readiness.sections.map((section) => (
                    <div
                      key={section.id}
                      className={cn(
                        'px-3 py-2 rounded-lg text-sm',
                        'bg-warm-gray-50/50 dark:bg-secondary/30'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        {getSectionStatusIcon(section.status)}
                        <span className="flex-1 truncate text-warm-gray-700 dark:text-warm-gray-300 font-medium text-[13px]">
                          {section.title}
                        </span>
                        <span
                          className={cn(
                            'text-xs tabular-nums shrink-0',
                            section.status === 'complete'
                              ? 'text-green-600 dark:text-green-400'
                              : section.status === 'partial'
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-warm-gray-400 dark:text-warm-gray-500'
                          )}
                        >
                          {section.wordCount} {labels.words}
                        </span>
                        <span
                          className={cn(
                            'text-[11px] font-medium px-1.5 py-0.5 rounded shrink-0',
                            section.status === 'complete'
                              ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                              : section.status === 'partial'
                                ? 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300'
                                : 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300'
                          )}
                        >
                          {section.status === 'complete'
                            ? labels.complete
                            : section.status === 'partial'
                              ? labels.partial
                              : labels.missing}
                        </span>
                      </div>
                      {/* Quick tip for sections needing improvement */}
                      {section.status === 'missing' && (
                        <p className="mt-1 ml-[26px] text-[11px] text-red-500/80 dark:text-red-400/70 italic">
                          {labels.tipMissing}
                        </p>
                      )}
                      {section.status === 'partial' && section.wordCount < 150 && (
                        <p className="mt-1 ml-[26px] text-[11px] text-yellow-600/80 dark:text-yellow-400/70 italic">
                          {labels.tipShort}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Small badge displaying a sub-score */
function ScoreBadge({ label, score }: { label: string; score: number }) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs',
        'bg-warm-gray-50 dark:bg-secondary/40',
        'border border-warm-gray-100 dark:border-border/40'
      )}
    >
      <span className="text-warm-gray-500 dark:text-warm-gray-400 font-medium">
        {label}
      </span>
      <span className={cn('font-bold', getScoreColor(score))}>{score}%</span>
    </div>
  );
}

/** Build a context-aware recommendation string */
function getRecommendation(result: ReadinessResult, isFr: boolean): string {
  const { totalScore, weakestSection, sections } = result;

  if (totalScore >= 90) {
    return isFr
      ? 'Votre plan est pratiquement complet !'
      : 'Your plan is nearly complete!';
  }

  if (totalScore >= 80) {
    return isFr
      ? `Votre plan est prêt à ${totalScore}%. Peaufinez les derniers détails.`
      : `Your plan is ${totalScore}% ready. Polish the final details.`;
  }

  // For lower scores, suggest the weakest section
  if (weakestSection) {
    if (weakestSection.wordCount === 0) {
      return isFr
        ? `Ajoutez du contenu à "${weakestSection.title}" pour améliorer votre score.`
        : `Add content to "${weakestSection.title}" to improve your score.`;
    }

    const emptySections = sections.filter((s) => s.wordCount === 0);
    if (emptySections.length > 0) {
      return isFr
        ? `${emptySections.length} section${emptySections.length > 1 ? 's' : ''} sans contenu. Commencez par "${emptySections[0].title}".`
        : `${emptySections.length} section${emptySections.length > 1 ? 's' : ''} without content. Start with "${emptySections[0].title}".`;
    }

    return isFr
      ? `Ajoutez plus de détails à "${weakestSection.title}" pour améliorer votre score.`
      : `Add more detail to "${weakestSection.title}" to improve your score.`;
  }

  return isFr
    ? `Votre plan est à ${totalScore}%. Continuez à ajouter du contenu.`
    : `Your plan is ${totalScore}% ready. Keep adding content.`;
}
