import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import { Check, Circle, Loader2, AlertCircle, X, User, TrendingUp, CheckCircle2, Eye } from 'lucide-react';
import { GenerationStatusDto, SectionStatusDto } from '../../types/generation';
import { useCmsContent } from '../../hooks/useCmsContent';
import { useTheme } from '../../contexts/ThemeContext';
import { sanitizeHtml } from '../../utils/sanitize';
import { businessPlanService } from '../../lib/business-plan-service';

const LOTTIE_ANIMATION_URL = '/assets/business-plan-with-executives-lightbulb-and-briefcase.json';

// Contextual tips by persona and language
const CONTEXTUAL_TIPS: Record<string, Record<string, string[]>> = {
  en: {
    Entrepreneur: [
      'Tip: Investors spend an average of 3 minutes on a business plan. Make your executive summary count!',
      'Tip: Include specific market size data — TAM, SAM, SOM analysis strengthens your plan.',
      'Tip: Show traction metrics if you have them. Even early metrics demonstrate momentum.',
      'Tip: Your financial projections should cover 3-5 years with monthly detail for year 1.',
      'Tip: Address your competitive advantage clearly — what makes you different?',
    ],
    OBNL: [
      'Tip: Clearly articulate your social impact metrics and measurement methodology.',
      'Tip: Grant reviewers look for sustainability — show how you\'ll fund operations long-term.',
      'Tip: Include a theory of change to strengthen your mission statement.',
      'Tip: Highlight partnerships and community engagement in your plan.',
      'Tip: Budget transparency builds trust with funders and stakeholders.',
    ],
    Consultant: [
      'Tip: Focus on scalable service delivery models in your plan.',
      'Tip: Include case studies or success stories to demonstrate expertise.',
      'Tip: Detail your client acquisition strategy and pipeline.',
      'Tip: Show how your methodology differentiates from competitors.',
      'Tip: Include team expertise and credentials prominently.',
    ],
  },
  fr: {
    Entrepreneur: [
      'Conseil : Les investisseurs passent en moyenne 3 minutes sur un plan. Soignez votre résumé exécutif !',
      'Conseil : Incluez des données précises sur la taille du marché — l\'analyse TAM, SAM, SOM renforce votre plan.',
      'Conseil : Montrez vos indicateurs de traction. Même les premiers résultats démontrent l\'élan.',
      'Conseil : Vos projections financières devraient couvrir 3 à 5 ans avec un détail mensuel pour l\'an 1.',
      'Conseil : Décrivez clairement votre avantage concurrentiel — qu\'est-ce qui vous distingue ?',
    ],
    OBNL: [
      'Conseil : Articulez clairement vos indicateurs d\'impact social et votre méthodologie de mesure.',
      'Conseil : Les évaluateurs de subventions recherchent la durabilité — montrez votre financement à long terme.',
      'Conseil : Incluez une théorie du changement pour renforcer votre énoncé de mission.',
      'Conseil : Mettez en valeur vos partenariats et votre engagement communautaire.',
      'Conseil : La transparence budgétaire renforce la confiance des bailleurs de fonds.',
    ],
    Consultant: [
      'Conseil : Concentrez-vous sur des modèles de prestation de services évolutifs.',
      'Conseil : Incluez des études de cas pour démontrer votre expertise.',
      'Conseil : Détaillez votre stratégie d\'acquisition de clients.',
      'Conseil : Montrez comment votre méthodologie se différencie de la concurrence.',
      'Conseil : Mettez en avant l\'expertise et les qualifications de votre équipe.',
    ],
  },
};

/** Content preview for a completed section */
interface SectionPreview {
  id: string;
  name: string;
  content: string;
}

interface GenerationProgressProps {
  /** Current generation status */
  status: GenerationStatusDto | null;
  /** Progress percentage (0-100) */
  progress: number;
  /** Whether there's an error */
  error: string | null;
  /** Callback when cancel is clicked */
  onCancel?: () => void;
  /** Callback when retry is clicked */
  onRetry?: () => void;
  /** Plan title for display */
  planTitle?: string;
  /** Business plan ID for fetching section content */
  planId?: string;
}

/**
 * Full-screen progress display for AI business plan generation
 * Shows animated progress, section checklist, and rotating tips
 */
export default function GenerationProgress({
  status,
  progress,
  error,
  onCancel,
  onRetry,
  planTitle,
  planId,
}: GenerationProgressProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [lottieData, setLottieData] = useState<object | null>(null);
  const [sectionPreviews, setSectionPreviews] = useState<SectionPreview[]>([]);
  const [generationStartTime] = useState<number>(Date.now());
  const [estimatedTimeRemaining, setEstimatedTimeRemaining] = useState<string | null>(null);
  const fetchedSectionsRef = useRef<Set<string>>(new Set());
  const { getContent: cms } = useCmsContent('generation');
  const { language: themeLanguage, t } = useTheme();
  const language = themeLanguage || 'fr';

  // Select tips based on language and persona
  const storedPersona = localStorage.getItem('userPersona') || 'Entrepreneur';
  const langTips = CONTEXTUAL_TIPS[language] || CONTEXTUAL_TIPS['en'];
  const tips = langTips[storedPersona] || langTips['Entrepreneur'];

  // Load Lottie animation data
  useEffect(() => {
    fetch(LOTTIE_ANIMATION_URL)
      .then((res) => res.json())
      .then((data) => setLottieData(data))
      .catch(() => setLottieData(null));
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Notify when generation completes
  useEffect(() => {
    const currentStatus = status?.status as string;
    if (currentStatus === 'completed' || currentStatus === 'generated') {
      if ('Notification' in window && Notification.permission === 'granted' && document.hidden) {
        new Notification('Sqordia', {
          body: t('generation.notificationReady'),
          icon: '/favicon.ico',
        });
      }
    }
  }, [status?.status, language]);

  // Rotate tips every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [tips.length]);

  // Strip HTML tags for plain text preview
  const stripHtml = useCallback((html: string): string => {
    if (!html) return '';
    try {
      if (typeof document !== 'undefined') {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = sanitizeHtml(html);
        return tmp.textContent || tmp.innerText || '';
      }
    } catch {
      // fallback
    }
    return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }, []);

  // Fetch section content when sections complete
  useEffect(() => {
    if (!planId || !status?.sections) return;

    const completedSections = status.sections.filter(
      (s) => s.status === 'completed' && !fetchedSectionsRef.current.has(s.id)
    );

    completedSections.forEach(async (section) => {
      // Mark as fetched immediately to avoid duplicate requests
      fetchedSectionsRef.current.add(section.id);

      try {
        const sectionData = await businessPlanService.getSection(planId, section.name);
        const rawContent = sectionData?.content || sectionData?.value?.content || '';
        const plainText = stripHtml(rawContent).trim();

        if (plainText.length > 0) {
          const truncated = plainText.length > 150
            ? plainText.substring(0, 150) + '...'
            : plainText;

          setSectionPreviews((prev) => [
            ...prev,
            { id: section.id, name: section.name, content: truncated },
          ]);
        }
      } catch (err) {
        // Silently fail — preview is a nice-to-have
        console.warn(`Failed to fetch section preview for ${section.name}:`, err);
      }
    });
  }, [planId, status?.sections, stripHtml]);

  // Calculate estimated time remaining
  useEffect(() => {
    if (!status || status.totalSections === 0) {
      setEstimatedTimeRemaining(null);
      return;
    }

    const completedCount = status.completedSections?.length ?? 0;
    const remainingCount = status.totalSections - completedCount;

    if (completedCount === 0 || remainingCount <= 0) {
      setEstimatedTimeRemaining(null);
      return;
    }

    const elapsedMs = Date.now() - generationStartTime;
    const msPerSection = elapsedMs / completedCount;
    const remainingMs = msPerSection * remainingCount;
    const remainingMinutes = Math.ceil(remainingMs / 60000);

    if (remainingMinutes <= 0) {
      setEstimatedTimeRemaining(null);
    } else if (remainingMinutes === 1) {
      setEstimatedTimeRemaining(t('generation.timeOneMinute'));
    } else {
      setEstimatedTimeRemaining(
        t('generation.timeMinutes').replace('{minutes}', String(remainingMinutes))
      );
    }
  }, [status, generationStartTime, language]);

  // Get current section name for display
  const currentSectionName = status?.currentSection
    ? formatSectionName(status.currentSection, language)
    : null;

  return (
    <div
      className="min-h-screen flex flex-col items-center bg-gray-50 dark:bg-gray-900 px-4 py-8 overflow-y-auto"
      role="main"
      aria-label={t('generation.progressAriaLabel')}
    >
      <div className="w-full max-w-lg mt-auto mb-auto">
        {/* Lottie animation while progress is moving */}
        <motion.div
          className="flex justify-center mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-40 h-40 md:w-48 md:h-48 flex items-center justify-center" aria-hidden="true">
            {lottieData && !error && status?.status === 'generating' ? (
              <Lottie
                animationData={lottieData}
                loop
                style={{ width: '100%', height: '100%' }}
              />
            ) : lottieData && !error ? (
              <Lottie
                animationData={lottieData}
                loop={false}
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" aria-hidden="true" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Heading */}
        <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
          {cms('generation.creatingYourPlan', 'generation.creatingYourPlan')}
        </h1>
        {planTitle && (
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            {planTitle}
          </p>
        )}

        {/* Progress Bar */}
        <div className="mb-4">
          <div
            className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={t('generation.progressLabel').replace('{percent}', String(progress))}
          >
            <motion.div
              className="h-full bg-momentum-orange rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
            {progress}% {cms('generation.complete', 'generation.complete')}
          </p>
          {/* Estimated Time Remaining */}
          <AnimatePresence>
            {estimatedTimeRemaining && !error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-center text-xs text-gray-500 dark:text-gray-400 mt-1"
              >
                {estimatedTimeRemaining}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Current Section */}
        {currentSectionName && !error && (
          <motion.p
            key={currentSectionName}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center text-orange-600 dark:text-orange-400 font-medium mb-6"
          >
            {cms('generation.generating', 'generation.generatingLabel')} {currentSectionName}
          </motion.p>
        )}

        {/* View Live Preview Link */}
        {status?.status === 'generating' && planId && (
          <div className="text-center mt-4 mb-6">
            <Link
              to={`/business-plan/${planId}/preview`}
              className="inline-flex items-center gap-2 text-sm text-momentum-orange hover:underline"
            >
              <Eye className="h-4 w-4" />
              {t('generation.viewPreview')}
            </Link>
          </div>
        )}

        {/* Section Checklist */}
        {status?.sections && status.sections.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-6">
            <h2 className="sr-only">{t('generation.sectionProgressTitle')}</h2>
            <ul className="space-y-2" aria-label={t('generation.sectionCompletionAriaLabel')}>
              {status.sections.map((section) => (
                <SectionItem key={section.id} section={section} language={language} />
              ))}
            </ul>
          </div>
        )}

        {/* Section Preview Cards */}
        {sectionPreviews.length > 0 && !error && (
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              {t('generation.sectionPreviews')}
            </h2>
            <div className="space-y-3">
              <AnimatePresence>
                {sectionPreviews.map((preview) => (
                  <motion.div
                    key={preview.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-green-100 dark:border-green-900/30"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-green-500 flex-shrink-0" aria-hidden="true">
                        <CheckCircle2 size={18} />
                      </span>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatSectionName(preview.name, language)}
                      </h3>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed pl-[26px]">
                      {preview.content}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Error Alert */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6"
              role="alert"
            >
              <div className="flex items-start gap-3">
                <AlertCircle
                  className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                />
                <div className="flex-1">
                  <p className="font-semibold text-red-800 dark:text-red-200">
                    {cms('generation.failed', 'generation.failed')}
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {error}
                  </p>
                  {onRetry && (
                    <button
                      onClick={onRetry}
                      className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      {cms('generation.retry', 'generation.retry')}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips Carousel */}
        {!error && (
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 mb-6">
            <p className="text-xs font-semibold text-orange-600 dark:text-orange-400 uppercase tracking-wide mb-2">
              {cms('generation.tip', 'generation.tip')}
            </p>
            <AnimatePresence mode="wait">
              <motion.p
                key={currentTipIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-gray-700 dark:text-gray-300 text-sm"
              >
                {tips[currentTipIndex]}
              </motion.p>
            </AnimatePresence>
          </div>
        )}

        {/* While You Wait - Quick Action Cards */}
        {!error && status?.status === 'generating' && planId && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
              {t('generation.whileYouWait')}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Link
                to="/profile"
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-blue-500" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {t('generation.completeProfile')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {t('generation.addDetails')}
                  </p>
                </div>
              </Link>
              <Link
                to={`/business-plan/${planId}/financials`}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-orange-300 dark:hover:border-orange-600 hover:shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={16} className="text-green-500" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {t('generation.financialTools')}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {t('generation.projectionsAnalysis')}
                  </p>
                </div>
              </Link>
            </div>
          </div>
        )}

        {/* Cancel Button */}
        {onCancel && !error && status?.status === 'generating' && (
          <div className="flex justify-center">
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-lg"
            >
              <X size={18} aria-hidden="true" />
              {cms('generation.cancel', 'generation.cancelGeneration')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Individual section item in the checklist
 */
function SectionItem({ section, language }: { section: SectionStatusDto; language: string }) {
  const sectionName = formatSectionName(section.name, language);

  return (
    <li className="flex items-center gap-3">
      <SectionStatusIcon status={section.status} />
      <span
        className={`text-sm ${
          section.status === 'completed'
            ? 'text-green-700 dark:text-green-400'
            : section.status === 'generating'
            ? 'text-orange-600 dark:text-orange-400 font-medium'
            : section.status === 'failed'
            ? 'text-red-600 dark:text-red-400'
            : 'text-gray-500 dark:text-gray-400'
        }`}
      >
        {sectionName}
      </span>
    </li>
  );
}

/**
 * Status icon for a section
 */
function SectionStatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'completed':
      return (
        <span className="text-green-500" aria-label="Completed">
          <Check size={18} />
        </span>
      );
    case 'generating':
      return (
        <span className="text-orange-500" aria-label="Generating">
          <Loader2 size={18} className="animate-spin" />
        </span>
      );
    case 'failed':
      return (
        <span className="text-red-500" aria-label="Failed">
          <AlertCircle size={18} />
        </span>
      );
    default:
      return (
        <span className="text-gray-400 dark:text-gray-500" aria-label="Pending">
          <Circle size={18} />
        </span>
      );
  }
}

// Section name translations
const SECTION_NAMES: Record<string, { en: string; fr: string }> = {
  ExecutiveSummary: { en: 'Executive Summary', fr: 'Résumé exécutif' },
  ProblemStatement: { en: 'Problem Statement', fr: 'Problématique' },
  Solution: { en: 'Solution', fr: 'Solution' },
  MarketAnalysis: { en: 'Market Analysis', fr: 'Analyse de marché' },
  CompetitiveAnalysis: { en: 'Competitive Analysis', fr: 'Analyse concurrentielle' },
  SwotAnalysis: { en: 'SWOT Analysis', fr: 'Analyse SWOT' },
  BusinessModel: { en: 'Business Model', fr: 'Modèle d\'affaires' },
  MarketingStrategy: { en: 'Marketing Strategy', fr: 'Stratégie marketing' },
  BrandingStrategy: { en: 'Branding Strategy', fr: 'Stratégie de marque' },
  OperationsPlan: { en: 'Operations Plan', fr: 'Plan opérationnel' },
  ManagementTeam: { en: 'Management Team', fr: 'Équipe de direction' },
  FinancialProjections: { en: 'Financial Projections', fr: 'Projections financières' },
  FundingRequirements: { en: 'Funding Requirements', fr: 'Besoins de financement' },
  RiskAnalysis: { en: 'Risk Analysis', fr: 'Analyse des risques' },
  ExitStrategy: { en: 'Exit Strategy', fr: 'Stratégie de sortie' },
  MissionStatement: { en: 'Mission Statement', fr: 'Énoncé de mission' },
  SocialImpact: { en: 'Social Impact', fr: 'Impact social' },
  BeneficiaryProfile: { en: 'Beneficiary Profile', fr: 'Profil des bénéficiaires' },
  GrantStrategy: { en: 'Grant Strategy', fr: 'Stratégie de subventions' },
  SustainabilityPlan: { en: 'Sustainability Plan', fr: 'Plan de durabilité' },
};

/**
 * Format section name for display with translation support
 */
function formatSectionName(name: string, language: string = 'en'): string {
  // First, normalize to PascalCase for lookup
  const normalizedName = name
    .replace(/[-_]/g, '')
    .replace(/\s+/g, '');

  // Check for translation
  const translation = SECTION_NAMES[normalizedName];
  if (translation) {
    return language === 'fr' ? translation.fr : translation.en;
  }

  // Fallback: Handle kebab-case and snake_case
  return name
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
