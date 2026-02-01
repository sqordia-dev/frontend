import { motion } from 'framer-motion';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { cn } from '@/lib/utils';

interface ReadingProgressBarProps {
  /** Position of the progress bar */
  position?: 'top' | 'bottom';
  /** Target element ID to track (optional, defaults to full page) */
  targetId?: string;
  /** Additional CSS classes */
  className?: string;
  /** Height of the progress bar */
  height?: number;
  /** Show percentage text */
  showPercentage?: boolean;
  /** Custom gradient colors */
  gradientFrom?: string;
  gradientTo?: string;
}

/**
 * ReadingProgressBar - Shows reading/scroll progress as a gradient bar
 *
 * Features:
 * - Fixed position at top or bottom of viewport
 * - Smooth animated progress updates
 * - Gradient color from momentum-orange to orange-400
 * - Optional percentage display
 *
 * @example
 * <ReadingProgressBar position="top" />
 *
 * @example
 * <ReadingProgressBar
 *   targetId="main-content"
 *   showPercentage
 * />
 */
export function ReadingProgressBar({
  position = 'top',
  targetId,
  className = '',
  height = 3,
  showPercentage = false,
  gradientFrom = '#FF6B00',
  gradientTo = '#FB923C'
}: ReadingProgressBarProps) {
  const progress = useReadingProgress({ targetId });

  return (
    <div
      className={cn(
        'fixed left-0 right-0 z-50',
        position === 'top' ? 'top-0' : 'bottom-0',
        className
      )}
      role="progressbar"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Reading progress: ${progress}%`}
    >
      {/* Background track */}
      <div
        className="w-full bg-gray-200/50 dark:bg-gray-800/50 backdrop-blur-sm"
        style={{ height: `${height}px` }}
      >
        {/* Progress fill */}
        <motion.div
          className="h-full"
          style={{
            background: `linear-gradient(90deg, ${gradientFrom} 0%, ${gradientTo} 100%)`
          }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{
            duration: 0.15,
            ease: 'linear'
          }}
        />
      </div>

      {/* Optional percentage display */}
      {showPercentage && progress > 0 && progress < 100 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={cn(
            'absolute right-4 px-2 py-0.5 text-xs font-medium rounded-full',
            'bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700',
            'text-gray-700 dark:text-gray-300',
            position === 'top' ? 'top-2' : 'bottom-2'
          )}
        >
          {progress}%
        </motion.div>
      )}
    </div>
  );
}

/**
 * CircularProgress - Circular progress indicator variant
 */
interface CircularProgressProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export function CircularProgress({
  progress,
  size = 40,
  strokeWidth = 3,
  className = ''
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn('relative', className)} style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          className="text-gray-200 dark:text-gray-700"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <motion.circle
          className="text-momentum-orange"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference
          }}
        />
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          {progress}%
        </span>
      </div>
    </div>
  );
}

export default ReadingProgressBar;
