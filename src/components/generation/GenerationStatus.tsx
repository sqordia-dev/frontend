import { motion } from 'framer-motion';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { GenerationStatusDto } from '../../types/generation';

interface GenerationStatusProps {
  /** Current generation status */
  status: GenerationStatusDto | null;
  /** Progress percentage (0-100) */
  progress: number;
  /** Whether there's an error */
  error?: string | null;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Show section text */
  showSectionText?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * Smaller inline status component for use in other contexts
 * Shows compact progress bar and current section text
 */
export default function GenerationStatus({
  status,
  progress,
  error,
  size = 'md',
  showSectionText = true,
  className = '',
}: GenerationStatusProps) {
  const currentSectionName = status?.currentSection
    ? formatSectionName(status.currentSection)
    : null;

  const isComplete = status?.status === 'completed';
  const isFailed = status?.status === 'failed' || !!error;
  const isGenerating = status?.status === 'generating';

  const barHeight = size === 'sm' ? 'h-1.5' : 'h-2';
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';

  return (
    <div className={`${className}`} role="status" aria-live="polite">
      {/* Progress Bar */}
      <div className="flex items-center gap-2">
        {/* Status Icon */}
        {isComplete && (
          <Check
            size={size === 'sm' ? 14 : 16}
            className="text-green-500 flex-shrink-0"
            aria-hidden="true"
          />
        )}
        {isFailed && (
          <AlertCircle
            size={size === 'sm' ? 14 : 16}
            className="text-red-500 flex-shrink-0"
            aria-hidden="true"
          />
        )}
        {isGenerating && (
          <Loader2
            size={size === 'sm' ? 14 : 16}
            className="text-orange-500 animate-spin flex-shrink-0"
            aria-hidden="true"
          />
        )}

        {/* Progress Bar */}
        <div
          className={`flex-1 ${barHeight} bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden`}
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Generation progress: ${progress}%`}
        >
          <motion.div
            className={`h-full rounded-full ${
              isFailed
                ? 'bg-red-500'
                : isComplete
                ? 'bg-green-500'
                : 'bg-gradient-to-r from-orange-400 to-orange-600'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </div>

        {/* Percentage */}
        <span
          className={`${textSize} font-medium ${
            isFailed
              ? 'text-red-600 dark:text-red-400'
              : isComplete
              ? 'text-green-600 dark:text-green-400'
              : 'text-gray-600 dark:text-gray-400'
          } min-w-[40px] text-right`}
        >
          {progress}%
        </span>
      </div>

      {/* Current Section Text */}
      {showSectionText && (
        <div className={`mt-1 ${textSize}`}>
          {isFailed && (
            <span className="text-red-600 dark:text-red-400">
              {error || 'Generation failed'}
            </span>
          )}
          {isComplete && (
            <span className="text-green-600 dark:text-green-400">
              Generation complete
            </span>
          )}
          {isGenerating && currentSectionName && (
            <span className="text-orange-600 dark:text-orange-400">
              Generating: {currentSectionName}
            </span>
          )}
          {!isGenerating && !isComplete && !isFailed && (
            <span className="text-gray-500 dark:text-gray-400">
              Waiting to start...
            </span>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Format section name for display
 */
function formatSectionName(name: string): string {
  return name
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
