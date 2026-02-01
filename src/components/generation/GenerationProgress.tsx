import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Check, Circle, Loader2, AlertCircle, X } from 'lucide-react';
import { GenerationStatusDto, SectionStatusDto } from '../../types/generation';

// Tips to display during generation
const GENERATION_TIPS = [
  'The best business plans are clear and concise - typically 15-25 pages.',
  'Investors spend an average of 3 minutes reviewing a business plan.',
  'A strong executive summary can make or break your pitch.',
  'Include specific metrics and milestones to show progress potential.',
  'Your financial projections should be realistic and well-researched.',
  'Highlight what makes your team uniquely qualified to execute.',
  'Address potential risks and your strategies for mitigation.',
  'Focus on the problem you solve and why customers will pay for it.',
  'A clear market analysis demonstrates you understand your industry.',
  'Keep your target audience in mind when crafting your message.',
];

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
}: GenerationProgressProps) {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  // Rotate tips every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % GENERATION_TIPS.length);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Get current section name for display
  const currentSectionName = status?.currentSection
    ? formatSectionName(status.currentSection)
    : null;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-orange-50 dark:from-gray-900 dark:to-gray-800 px-4 py-8"
      role="main"
      aria-label="Business plan generation progress"
    >
      <div className="w-full max-w-lg">
        {/* Animated Magic/Sparkle Icon */}
        <motion.div
          className="flex justify-center mb-8"
          animate={{
            y: [0, -10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="relative">
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <Sparkles
                size={64}
                className="text-orange-500"
                aria-hidden="true"
              />
            </motion.div>
            {/* Sparkle particles */}
            <motion.div
              className="absolute -top-2 -right-2 w-3 h-3 bg-orange-400 rounded-full"
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: 0,
              }}
            />
            <motion.div
              className="absolute -bottom-1 -left-1 w-2 h-2 bg-yellow-400 rounded-full"
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: 0.5,
              }}
            />
            <motion.div
              className="absolute top-1/2 -right-3 w-2 h-2 bg-orange-300 rounded-full"
              animate={{
                opacity: [0, 1, 0],
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: 1,
              }}
            />
          </div>
        </motion.div>

        {/* Heading */}
        <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Creating Your Business Plan
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
            aria-label={`Generation progress: ${progress}%`}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-2">
            {progress}% complete
          </p>
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
            Generating: {currentSectionName}
          </motion.p>
        )}

        {/* Section Checklist */}
        {status?.sections && status.sections.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm mb-6">
            <h2 className="sr-only">Section Progress</h2>
            <ul className="space-y-2" aria-label="Section completion status">
              {status.sections.map((section) => (
                <SectionItem key={section.id} section={section} />
              ))}
            </ul>
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
                    Generation Failed
                  </p>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                    {error}
                  </p>
                  {onRetry && (
                    <button
                      onClick={onRetry}
                      className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Retry Generation
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
              Tip
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
                {GENERATION_TIPS[currentTipIndex]}
              </motion.p>
            </AnimatePresence>
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
              Cancel Generation
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
function SectionItem({ section }: { section: SectionStatusDto }) {
  const sectionName = formatSectionName(section.name);

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

/**
 * Format section name for display
 */
function formatSectionName(name: string): string {
  // Handle kebab-case and snake_case
  return name
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
