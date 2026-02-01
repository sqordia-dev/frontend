import React from 'react';
import { Check, Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { InlineEditSaveState } from '../../../hooks/useInlineEdit';

interface SaveIndicatorProps {
  /** Current save state */
  state: InlineEditSaveState;
  /** Error message to display (only shown in error state) */
  error?: string | null;
  /** Callback to retry save on error */
  onRetry?: () => void;
  /** Position of the indicator */
  position?: 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
  /** Size variant */
  size?: 'sm' | 'md';
}

/**
 * Configuration for each save state
 */
const stateConfig = {
  idle: null, // Don't show anything in idle state
  saving: {
    icon: Loader2,
    text: 'Saving...',
    className: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
    animate: true,
  },
  saved: {
    icon: Check,
    text: 'Saved',
    className: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800',
    animate: false,
  },
  error: {
    icon: AlertCircle,
    text: 'Failed to save',
    className: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800',
    animate: false,
  },
};

/**
 * Position classes for the indicator
 */
const positionClasses = {
  'top-right': 'top-2 right-2',
  'bottom-right': 'bottom-2 right-2',
  'top-left': 'top-2 left-2',
  'bottom-left': 'bottom-2 left-2',
};

/**
 * SaveIndicator Component
 * Displays the current save state with visual feedback
 */
export function SaveIndicator({
  state,
  error,
  onRetry,
  position = 'top-right',
  size = 'sm',
}: SaveIndicatorProps) {
  const config = stateConfig[state];

  // Don't render anything for idle state
  if (!config) return null;

  const { icon: Icon, text, className, animate } = config;
  const iconSize = size === 'sm' ? 14 : 16;
  const textSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const padding = size === 'sm' ? 'px-2 py-1' : 'px-3 py-1.5';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`absolute ${positionClasses[position]} z-20`}
      >
        <div
          className={`flex items-center gap-1.5 ${padding} ${textSize} font-medium rounded-lg border shadow-sm ${className}`}
          role="status"
          aria-live="polite"
        >
          <Icon
            size={iconSize}
            className={animate ? 'animate-spin' : ''}
            aria-hidden="true"
          />
          <span>{state === 'error' && error ? error : text}</span>

          {/* Retry button for error state */}
          {state === 'error' && onRetry && (
            <button
              onClick={onRetry}
              className="ml-1 p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
              title="Retry save"
              aria-label="Retry save"
            >
              <RotateCcw size={iconSize - 2} />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export default SaveIndicator;
