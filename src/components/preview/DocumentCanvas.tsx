import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import ReadingProgressBar from './ReadingProgressBar';

interface DocumentCanvasProps {
  children: React.ReactNode;
  /** Whether to show the reading progress bar */
  showProgressBar?: boolean;
  /** Additional class names */
  className?: string;
  /** Whether sidebar is collapsed (affects margin) */
  sidebarCollapsed?: boolean;
}

/**
 * DocumentCanvas - Centered content wrapper for optimal reading
 *
 * Features:
 * - 680px max-width for optimal line length
 * - Responsive padding and margins
 * - Adjusts for sidebar state
 * - Integrates reading progress bar
 */
export default function DocumentCanvas({
  children,
  showProgressBar = true,
  className,
  sidebarCollapsed = false,
}: DocumentCanvasProps) {
  return (
    <>
      {/* Reading Progress Bar */}
      {showProgressBar && (
        <ReadingProgressBar className="fixed top-0 left-0 right-0 z-50" />
      )}

      {/* Main Content Area */}
      <motion.main
        className={cn(
          'min-h-screen',
          'bg-warm-gray-50 dark:bg-warm-gray-950',
          // Padding for content
          'pt-8 pb-24 px-6',
          'lg:pt-12 lg:pb-32',
          className
        )}
        // Smooth transition when sidebar collapses
        animate={{
          marginLeft: sidebarCollapsed ? 64 : 220,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        // Only apply margin on desktop
        style={{
          marginLeft: 0, // Default for mobile
        }}
      >
        {/* Centered Content Container */}
        <div
          className={cn(
            'mx-auto',
            'w-full max-w-[680px]',
            // Responsive adjustments
            'lg:max-w-[720px]',
            'xl:max-w-[680px]'
          )}
        >
          {children}
        </div>
      </motion.main>
    </>
  );
}

/**
 * DocumentSection - Wrapper for individual content sections
 * Provides consistent spacing and entrance animations
 */
interface DocumentSectionProps {
  children: React.ReactNode;
  id?: string;
  className?: string;
}

export function DocumentSection({
  children,
  id,
  className,
}: DocumentSectionProps) {
  return (
    <motion.div
      id={id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn('mb-12', className)}
    >
      {children}
    </motion.div>
  );
}

/**
 * DocumentDivider - Visual separator between major sections
 */
export function DocumentDivider() {
  return (
    <div className="my-16 h-px bg-gradient-to-r from-transparent via-warm-gray-200 dark:via-warm-gray-800 to-transparent" />
  );
}
