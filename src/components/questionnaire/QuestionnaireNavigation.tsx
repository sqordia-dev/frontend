import { useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, SkipForward, CheckCircle2, CornerDownLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionnaireNavigationProps } from '../../types/questionnaire';
import { cn } from '@/lib/utils';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * QuestionnaireNavigation Component
 * Modern bottom navigation with touch-friendly buttons and keyboard hints
 */
export default function QuestionnaireNavigation({
  canGoNext,
  canGoPrevious,
  isLastQuestion,
  isRequired,
  onNext,
  onPrevious,
  onSkip,
  onComplete,
}: QuestionnaireNavigationProps) {
  const { t } = useTheme();

  // Detect OS for keyboard shortcut display
  const isMac =
    typeof window !== 'undefined' && navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      // Enter to continue (no modifier needed for better UX)
      if (e.key === 'Enter' && !e.shiftKey) {
        // Don't trigger if user is typing in a textarea
        const target = e.target as HTMLElement;
        if (target.tagName === 'TEXTAREA') return;

        e.preventDefault();
        if (isLastQuestion && canGoNext) {
          onComplete();
        } else if (canGoNext) {
          onNext();
        } else if (!isRequired) {
          onSkip();
        }
      }

      // Arrow keys for navigation
      if (e.key === 'ArrowLeft' && e.altKey && canGoPrevious) {
        e.preventDefault();
        onPrevious();
      }
    },
    [canGoNext, canGoPrevious, isLastQuestion, isRequired, onComplete, onNext, onPrevious, onSkip]
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
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40",
        "bg-background/90 backdrop-blur-2xl",
        "border-t border-border/30",
        "safe-area-inset-bottom"
      )}
      role="navigation"
      aria-label="Question navigation"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex items-center justify-between gap-4">
          {/* Previous Button */}
          <motion.button
            whileHover={{ scale: canGoPrevious ? 1.02 : 1 }}
            whileTap={{ scale: canGoPrevious ? 0.98 : 1 }}
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className={cn(
              "flex items-center gap-2",
              "px-4 sm:px-5 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl",
              "text-sm font-medium",
              "transition-all duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-momentum-orange/50 focus-visible:ring-offset-2",
              canGoPrevious
                ? "bg-muted/60 hover:bg-muted text-foreground border border-border/50 hover:border-border"
                : "bg-transparent text-muted-foreground/40 cursor-not-allowed"
            )}
            aria-label={t('questionnaire.previous')}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t('questionnaire.previous')}</span>
          </motion.button>

          {/* Center Section: Skip + Keyboard Hint */}
          <div className="flex-1 flex items-center justify-center gap-6">
            {/* Skip Button */}
            <AnimatePresence>
              {!isRequired && !isLastQuestion && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onSkip}
                  className={cn(
                    "flex items-center gap-2",
                    "px-4 py-2.5 rounded-xl",
                    "text-sm font-medium text-muted-foreground",
                    "hover:text-foreground hover:bg-muted/50",
                    "transition-all duration-200",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-momentum-orange/50"
                  )}
                  aria-label={t('questionnaire.skip')}
                >
                  <SkipForward className="w-4 h-4" />
                  <span>{t('questionnaire.skip')}</span>
                </motion.button>
              )}
            </AnimatePresence>

            {/* Keyboard Hint - Desktop */}
            <div className="hidden lg:flex items-center gap-2.5 text-muted-foreground/50">
              <kbd className={cn(
                "inline-flex items-center gap-1.5 px-2.5 py-1.5",
                "rounded-lg bg-muted/50 border border-border/40",
                "font-mono text-[11px] font-medium",
                "shadow-sm"
              )}>
                <CornerDownLeft className="w-3.5 h-3.5" />
                <span>Enter</span>
              </kbd>
              <span className="text-xs">{t('questionnaire.toContinue')}</span>
            </div>
          </div>

          {/* Next/Complete Button */}
          <AnimatePresence mode="wait">
            {isLastQuestion ? (
              <motion.button
                key="complete"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: canGoNext ? 1.03 : 1 }}
                whileTap={{ scale: canGoNext ? 0.97 : 1 }}
                onClick={onComplete}
                disabled={!canGoNext}
                className={cn(
                  "group flex items-center gap-2.5",
                  "px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl",
                  "text-sm font-semibold",
                  "transition-all duration-300",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2",
                  canGoNext
                    ? [
                        "bg-gradient-to-r from-emerald-600 to-emerald-500",
                        "hover:from-emerald-500 hover:to-emerald-400",
                        "text-white",
                        "shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/35"
                      ]
                    : "bg-muted text-muted-foreground/50 cursor-not-allowed"
                )}
                aria-label={t('questionnaire.complete')}
              >
                <CheckCircle2 className={cn(
                  "w-5 h-5 transition-transform duration-300",
                  canGoNext && "group-hover:scale-110"
                )} />
                <span>{t('questionnaire.complete')}</span>
              </motion.button>
            ) : (
              <motion.button
                key="next"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                whileHover={{ scale: canGoNext ? 1.03 : 1 }}
                whileTap={{ scale: canGoNext ? 0.97 : 1 }}
                onClick={onNext}
                disabled={!canGoNext}
                className={cn(
                  "group flex items-center gap-2.5",
                  "px-5 sm:px-7 py-3 sm:py-3.5 rounded-xl sm:rounded-2xl",
                  "text-sm font-semibold",
                  "transition-all duration-300",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-momentum-orange/50 focus-visible:ring-offset-2",
                  canGoNext
                    ? [
                        "bg-gradient-to-r from-momentum-orange to-[#FF8533]",
                        "hover:from-[#FF8533] hover:to-momentum-orange",
                        "text-white",
                        "shadow-lg shadow-momentum-orange/25 hover:shadow-momentum-orange/35"
                      ]
                    : "bg-muted text-muted-foreground/50 cursor-not-allowed"
                )}
                aria-label={t('questionnaire.next')}
              >
                <span>{t('questionnaire.next')}</span>
                <ArrowRight className={cn(
                  "w-4 h-4 transition-transform duration-300",
                  canGoNext && "group-hover:translate-x-0.5"
                )} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Mobile Keyboard Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="lg:hidden flex justify-center mt-3 pb-safe"
        >
          <span className="text-[11px] text-muted-foreground/40 font-medium">
            {isMac ? '⏎' : 'Enter'} {t('questionnaire.toContinue')}
          </span>
        </motion.div>
      </div>
    </nav>
  );
}
