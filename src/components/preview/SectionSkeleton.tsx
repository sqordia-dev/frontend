import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionSkeletonProps {
  /** Additional CSS classes */
  className?: string;
  /** Show action buttons skeleton */
  showActions?: boolean;
}

/**
 * SectionSkeleton - Animated loading skeleton for a section card
 *
 * Displays a pulsing skeleton that matches the SectionCard layout
 */
export function SectionSkeleton({ className = '', showActions = true }: SectionSkeletonProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 rounded-xl p-6 md:p-8',
        'border border-gray-200 dark:border-gray-800',
        'animate-pulse',
        className
      )}
    >
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          {/* Icon skeleton */}
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
          {/* Title skeleton */}
          <div className="h-6 md:h-7 w-48 md:w-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
        {/* Action buttons skeleton */}
        {showActions && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
            <div className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-gray-700" />
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-gray-200 dark:bg-gray-700 mb-6" />

      {/* Content skeleton - multiple paragraphs */}
      <div className="space-y-4">
        {/* First paragraph */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-11/12" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
        </div>

        {/* Second paragraph */}
        <div className="space-y-2 pt-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        </div>

        {/* Third paragraph (shorter) */}
        <div className="space-y-2 pt-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

/**
 * DocumentSkeleton - Full document loading skeleton with multiple sections
 */
interface DocumentSkeletonProps {
  /** Number of section skeletons to show */
  sectionCount?: number;
  /** Additional CSS classes */
  className?: string;
}

export function DocumentSkeleton({
  sectionCount = 3,
  className = ''
}: DocumentSkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className={cn('space-y-6', className)}
    >
      {Array.from({ length: sectionCount }).map((_, index) => (
        <SectionSkeleton key={index} />
      ))}
    </motion.div>
  );
}

/**
 * InlineSkeleton - Small inline skeleton for text placeholders
 */
interface InlineSkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
}

export function InlineSkeleton({
  width = '100%',
  height = '1rem',
  className = ''
}: InlineSkeletonProps) {
  return (
    <span
      className={cn(
        'inline-block bg-gray-200 dark:bg-gray-700 rounded animate-pulse',
        className
      )}
      style={{ width, height }}
    />
  );
}

/**
 * CardSkeleton - Generic card skeleton
 */
interface CardSkeletonProps {
  className?: string;
  lines?: number;
}

export function CardSkeleton({ className = '', lines = 3 }: CardSkeletonProps) {
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 rounded-xl p-6',
        'border border-gray-200 dark:border-gray-800',
        'animate-pulse',
        className
      )}
    >
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className="h-4 bg-gray-200 dark:bg-gray-700 rounded"
            style={{ width: `${100 - index * 15}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export default SectionSkeleton;
