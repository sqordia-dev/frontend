import React, { useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, SkipForward, CheckCircle2, Command } from 'lucide-react';
import { motion } from 'framer-motion';
import { QuestionnaireNavigationProps } from '../../types/questionnaire';

/**
 * QuestionnaireNavigation Component
 * Bottom navigation with previous, skip, and next/complete buttons
 * Supports keyboard shortcuts
 */
export default function QuestionnaireNavigation({
  currentIndex,
  totalQuestions,
  canGoNext,
  canGoPrevious,
  isLastQuestion,
  isRequired,
  onNext,
  onPrevious,
  onSkip,
  onComplete,
}: QuestionnaireNavigationProps) {
  // Detect OS for keyboard shortcut display
  const isMac =
    typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const modifierKey = isMac ? 'Cmd' : 'Ctrl';

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Cmd/Ctrl + Enter to continue
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (isLastQuestion && canGoNext) {
          onComplete();
        } else if (canGoNext) {
          onNext();
        } else if (!isRequired) {
          onSkip();
        }
      }

      // Tab navigation is handled by browser
    },
    [canGoNext, isLastQuestion, isRequired, onComplete, onNext, onSkip]
  );

  // Register keyboard listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0
        bg-white dark:bg-gray-900
        border-t border-gray-200 dark:border-gray-800
        shadow-lg
        z-40
      "
      role="navigation"
      aria-label="Question navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Previous Button */}
          <motion.button
            whileHover={{ scale: canGoPrevious ? 1.02 : 1 }}
            whileTap={{ scale: canGoPrevious ? 0.98 : 1 }}
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className={`
              flex items-center gap-2
              px-4 py-3
              rounded-xl
              font-medium text-sm
              min-h-[48px] min-w-[120px]
              transition-all duration-200
              focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
              ${
                canGoPrevious
                  ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                  : 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600 cursor-not-allowed'
              }
            `}
            aria-label="Go to previous question"
          >
            <ArrowLeft size={18} />
            <span className="hidden sm:inline">Previous</span>
          </motion.button>

          {/* Center: Skip Button (for non-required questions) */}
          <div className="flex-1 flex justify-center">
            {!isRequired && !isLastQuestion && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSkip}
                className="
                  flex items-center gap-2
                  px-4 py-2
                  rounded-lg
                  text-gray-500 dark:text-gray-400
                  hover:text-gray-700 dark:hover:text-gray-300
                  hover:bg-gray-100 dark:hover:bg-gray-800
                  font-medium text-sm
                  transition-all duration-200
                  focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                "
                aria-label="Skip this question"
              >
                <SkipForward size={16} />
                <span>Skip</span>
              </motion.button>
            )}

            {/* Keyboard hint */}
            <div className="hidden md:flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 ml-4">
              <span>Press</span>
              <kbd
                className="
                  inline-flex items-center gap-1
                  px-2 py-1
                  rounded
                  bg-gray-100 dark:bg-gray-800
                  border border-gray-200 dark:border-gray-700
                  font-mono text-xs
                "
              >
                {isMac ? (
                  <Command size={12} />
                ) : (
                  <span>{modifierKey}</span>
                )}
                <span>+</span>
                <span>Enter</span>
              </kbd>
              <span>to continue</span>
            </div>
          </div>

          {/* Next/Complete Button */}
          {isLastQuestion ? (
            <motion.button
              whileHover={{ scale: canGoNext ? 1.02 : 1 }}
              whileTap={{ scale: canGoNext ? 0.98 : 1 }}
              onClick={onComplete}
              disabled={!canGoNext}
              className={`
                flex items-center gap-2
                px-6 py-3
                rounded-xl
                font-semibold text-sm
                min-h-[48px] min-w-[140px]
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                ${
                  canGoNext
                    ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/25'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                }
              `}
              aria-label="Complete questionnaire"
            >
              <CheckCircle2 size={18} />
              <span>Complete</span>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: canGoNext ? 1.02 : 1 }}
              whileTap={{ scale: canGoNext ? 0.98 : 1 }}
              onClick={onNext}
              disabled={!canGoNext}
              className={`
                flex items-center gap-2
                px-6 py-3
                rounded-xl
                font-semibold text-sm
                min-h-[48px] min-w-[120px]
                transition-all duration-200
                focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
                ${
                  canGoNext
                    ? 'text-white shadow-lg shadow-orange-500/25 bg-[#FF6B00]'
                    : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                }
              `}
              aria-label="Go to next question"
            >
              <span>Next</span>
              <ArrowRight size={18} />
            </motion.button>
          )}
        </div>

        {/* Mobile keyboard hint */}
        <div className="md:hidden flex justify-center mt-2">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            Press {modifierKey}+Enter to continue
          </span>
        </div>
      </div>
    </nav>
  );
}
