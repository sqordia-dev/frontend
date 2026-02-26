import { useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, SkipForward, CheckCircle2, Command } from 'lucide-react';
import { motion } from 'framer-motion';
import { QuestionnaireNavigationProps } from '../../types/questionnaire';
import { cn } from '@/lib/utils';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * QuestionnaireNavigation Component
 * Refined bottom navigation with keyboard shortcuts
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
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40",
        "bg-background/80 backdrop-blur-xl",
        "border-t border-border/50"
      )}
      role="navigation"
      aria-label="Question navigation"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          {/* Previous Button */}
          <motion.button
            whileHover={{ scale: canGoPrevious ? 1.02 : 1 }}
            whileTap={{ scale: canGoPrevious ? 0.98 : 1 }}
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className={cn(
              "flex items-center gap-2",
              "px-4 py-2.5 rounded-xl",
              "text-sm font-medium",
              "transition-all duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-momentum-orange focus-visible:ring-offset-2",
              canGoPrevious
                ? "bg-muted/80 text-foreground hover:bg-muted"
                : "bg-muted/30 text-muted-foreground/50 cursor-not-allowed"
            )}
            aria-label={t('questionnaire.previous')}
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t('questionnaire.previous')}</span>
          </motion.button>

          {/* Center: Skip + Keyboard Hint */}
          <div className="flex-1 flex items-center justify-center gap-4">
            {/* Skip Button */}
            {!isRequired && !isLastQuestion && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSkip}
                className={cn(
                  "flex items-center gap-1.5",
                  "px-3 py-1.5 rounded-lg",
                  "text-sm text-muted-foreground",
                  "hover:text-foreground hover:bg-muted/50",
                  "transition-all duration-200",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-momentum-orange focus-visible:ring-offset-2"
                )}
                aria-label={t('questionnaire.skip')}
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>{t('questionnaire.skip')}</span>
              </motion.button>
            )}

            {/* Keyboard Hint - Desktop */}
            <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground/60">
              <kbd className={cn(
                "inline-flex items-center gap-1 px-2 py-1",
                "rounded-md bg-muted/60 border border-border/50",
                "font-mono text-[10px]"
              )}>
                {isMac ? <Command className="w-3 h-3" /> : 'Ctrl'}
                <span>+</span>
                <span>Enter</span>
              </kbd>
              <span>{t('questionnaire.toContinue')}</span>
            </div>
          </div>

          {/* Next/Complete Button */}
          {isLastQuestion ? (
            <motion.button
              whileHover={{ scale: canGoNext ? 1.03 : 1 }}
              whileTap={{ scale: canGoNext ? 0.97 : 1 }}
              onClick={onComplete}
              disabled={!canGoNext}
              className={cn(
                "flex items-center gap-2",
                "px-5 py-2.5 rounded-xl",
                "text-sm font-semibold",
                "transition-all duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                canGoNext
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20"
                  : "bg-muted text-muted-foreground/50 cursor-not-allowed"
              )}
              aria-label={t('questionnaire.complete')}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('questionnaire.complete')}</span>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: canGoNext ? 1.03 : 1 }}
              whileTap={{ scale: canGoNext ? 0.97 : 1 }}
              onClick={onNext}
              disabled={!canGoNext}
              className={cn(
                "flex items-center gap-2",
                "px-5 py-2.5 rounded-xl",
                "text-sm font-semibold",
                "transition-all duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-momentum-orange focus-visible:ring-offset-2",
                canGoNext
                  ? "bg-momentum-orange hover:bg-momentum-orange/90 text-white shadow-lg shadow-momentum-orange/20"
                  : "bg-muted text-muted-foreground/50 cursor-not-allowed"
              )}
              aria-label={t('questionnaire.next')}
            >
              <span>{t('questionnaire.next')}</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          )}
        </div>

        {/* Mobile Keyboard Hint */}
        <div className="md:hidden flex justify-center mt-3">
          <span className="text-[10px] text-muted-foreground/50">
            {isMac ? '⌘' : 'Ctrl'}+Enter {t('questionnaire.toContinue')}
          </span>
        </div>
      </div>
    </nav>
  );
}
