import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, List, X, Check } from 'lucide-react';
import { PlanSection } from '../../types/preview';
import { cn } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';
import { useIsDesktop } from '../../hooks';

interface QuickNavPillProps {
  sections: PlanSection[];
  activeSectionId: string | null;
  currentSectionIndex: number;
  onSectionClick: (sectionId: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  /** Scroll threshold to show the pill (in px) */
  showThreshold?: number;
  /** Desktop sidebar width in px, used to center pill relative to content area */
  sidebarWidth?: number;
}

/**
 * QuickNavPill - Floating mini table-of-contents pill
 *
 * Features:
 * - Appears after scrolling past hero/cover
 * - Shows current section with prev/next arrows
 * - Click to expand full section list
 * - Glassmorphism design
 */
export default function QuickNavPill({
  sections,
  activeSectionId,
  currentSectionIndex,
  onSectionClick,
  onPrevious,
  onNext,
  showThreshold = 400,
  sidebarWidth = 0,
}: QuickNavPillProps) {
  const { t } = useTheme();
  const isDesktop = useIsDesktop();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Track scroll position to show/hide pill
  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > showThreshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, [showThreshold]);

  // Get current section name
  const currentSection = sections[currentSectionIndex];
  const currentSectionName = currentSection?.title || t('preview.quicknav.sections');

  // Navigation handlers
  const hasPrevious = currentSectionIndex > 0;
  const hasNext = currentSectionIndex < sections.length - 1;

  const handlePrevious = () => {
    if (hasPrevious) onPrevious();
  };

  const handleNext = () => {
    if (hasNext) onNext();
  };

  const handleSectionSelect = (sectionId: string) => {
    onSectionClick(sectionId);
    setIsExpanded(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'fixed bottom-6 left-0 right-0 z-50',
            'flex justify-center pointer-events-none',
            'lg:bottom-8'
          )}
          style={{ paddingLeft: isDesktop && sidebarWidth > 0 ? `${sidebarWidth}px` : undefined }}
        >
          {/* Main Pill */}
          <div
            className={cn(
              'relative flex items-center gap-1 pointer-events-auto',
              'px-2 py-2 rounded-full',
              'bg-white/95 dark:bg-card/95',
              'backdrop-blur-xl',
              'border border-warm-gray-200/50 dark:border-border/50',
              'shadow-lg shadow-warm-gray-900/10 dark:shadow-black/20'
            )}
          >
            {/* Previous Button */}
            <button
              onClick={handlePrevious}
              disabled={!hasPrevious}
              className={cn(
                'p-2 rounded-full transition-colors',
                hasPrevious
                  ? 'text-warm-gray-600 hover:bg-warm-gray-100 dark:text-warm-gray-300 dark:hover:bg-secondary'
                  : 'text-warm-gray-300 dark:text-warm-gray-600 cursor-not-allowed'
              )}
              aria-label={t('preview.quicknav.previous')}
            >
              <ChevronUp size={18} />
            </button>

            {/* Section Name / Expand Button */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full',
                'text-sm font-medium',
                'text-warm-gray-700 dark:text-warm-gray-200',
                'hover:bg-warm-gray-100 dark:hover:bg-secondary',
                'transition-colors',
                'sm:min-w-[120px] sm:max-w-[200px]'
              )}
            >
              <List size={16} className="flex-shrink-0 text-warm-gray-400" />
              <span className="hidden sm:inline truncate">{currentSectionName}</span>
              <span className="text-xs text-warm-gray-400 dark:text-warm-gray-500 flex-shrink-0 tabular-nums">
                {currentSectionIndex + 1}/{sections.length}
              </span>
            </button>

            {/* Next Button */}
            <button
              onClick={handleNext}
              disabled={!hasNext}
              className={cn(
                'p-2 rounded-full transition-colors',
                hasNext
                  ? 'text-warm-gray-600 hover:bg-warm-gray-100 dark:text-warm-gray-300 dark:hover:bg-secondary'
                  : 'text-warm-gray-300 dark:text-warm-gray-600 cursor-not-allowed'
              )}
              aria-label={t('preview.quicknav.next')}
            >
              <ChevronDown size={18} />
            </button>

            {/* Expanded Section List */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className={cn(
                    'absolute bottom-full left-1/2 -translate-x-1/2 mb-2',
                    'w-[min(18rem,calc(100vw-2rem))] max-h-80 overflow-y-auto',
                    'bg-white/95 dark:bg-card/95',
                    'backdrop-blur-xl',
                    'border border-warm-gray-200/50 dark:border-border/50',
                    'rounded-xl shadow-xl shadow-warm-gray-900/10 dark:shadow-black/30',
                    'scrollbar-thin'
                  )}
                >
                  {/* Header */}
                  <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b border-warm-gray-100 dark:border-border bg-white/95 dark:bg-card/95 backdrop-blur-xl">
                    <span className="text-sm font-medium text-warm-gray-900 dark:text-white">
                      {t('preview.quicknav.sections')}
                    </span>
                    <button
                      onClick={() => setIsExpanded(false)}
                      className="p-1 rounded-lg text-warm-gray-400 hover:text-warm-gray-600 hover:bg-warm-gray-100 dark:hover:text-warm-gray-300 dark:hover:bg-secondary transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Section List */}
                  <div className="p-2">
                    {sections.map((section, index) => {
                      const isActive = section.id === activeSectionId;
                      const hasContent = section.content && section.content.trim().length > 0;

                      return (
                        <button
                          key={section.id}
                          onClick={() => handleSectionSelect(section.id)}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left',
                            'transition-colors',
                            isActive
                              ? 'bg-momentum-orange/10 text-momentum-orange'
                              : 'text-warm-gray-600 dark:text-warm-gray-300 hover:bg-warm-gray-50 dark:hover:bg-secondary'
                          )}
                        >
                          {/* Number */}
                          <span className={cn(
                            'text-xs font-medium min-w-[20px]',
                            isActive ? 'text-momentum-orange' : 'text-warm-gray-400 dark:text-warm-gray-500'
                          )}>
                            {index + 1}.
                          </span>

                          {/* Title */}
                          <span className="flex-1 text-sm truncate">{section.title}</span>

                          {/* Completion indicator */}
                          {hasContent && (
                            <Check size={14} className="text-green-500 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
