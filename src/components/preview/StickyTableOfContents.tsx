import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useScrollSpy } from '@/hooks/useScrollSpy';
import { CheckCircle2, List } from 'lucide-react';

interface TocItem {
  id: string;
  title: string;
  icon?: React.ReactNode;
}

interface StickyTableOfContentsProps {
  /** List of sections for the TOC */
  items: TocItem[];
  /** Additional CSS classes */
  className?: string;
  /** Title for the TOC */
  title?: string;
  /** Offset from top when scrolling to section */
  scrollOffset?: number;
  /** Auto-hide after this many ms of no hover (0 = disabled). Default 2000 */
  autoHideDelay?: number;
}

/**
 * StickyTableOfContents - Modern right-side fixed navigation
 *
 * Features:
 * - Glassmorphism design
 * - Smooth animations with Framer Motion
 * - Active section highlighting with scroll spy
 * - Progress tracking with visual indicators
 * - Smooth scroll on click
 */
const TOC_WIDTH = 280;
const TAB_WIDTH = 32;
const WRAPPER_WIDTH_EXPANDED = TOC_WIDTH + TAB_WIDTH;

export function StickyTableOfContents({
  items,
  className = '',
  title = 'On this page',
  scrollOffset = 100,
  autoHideDelay = 2000
}: StickyTableOfContentsProps) {
  const [isVisible, setIsVisible] = useState(true);
  const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sectionIds = items.map(item => item.id);
  const activeId = useScrollSpy({ sectionIds });

  const handleMouseEnter = useCallback(() => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setIsVisible(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (autoHideDelay <= 0) return;
    hideTimeoutRef.current = setTimeout(() => {
      hideTimeoutRef.current = null;
      setIsVisible(false);
    }, autoHideDelay);
  }, [autoHideDelay]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY - scrollOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const activeIndex = items.findIndex(item => item.id === activeId);
  const progressPercentage = activeIndex >= 0 ? ((activeIndex + 1) / items.length) * 100 : 0;

  return (
    <motion.div
      className={cn('hidden lg:flex fixed top-8 right-0 overflow-hidden z-20 flex-row-reverse', className)}
      style={{ height: 'calc(100vh - 4rem)' }}
      initial={false}
      animate={{ width: isVisible ? WRAPPER_WIDTH_EXPANDED : TAB_WIDTH }}
      transition={{ type: 'tween', duration: 0.25, ease: 'easeInOut' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label="Table of contents"
    >
      {/* Tab: always visible when collapsed, hover to expand */}
      <div
        className="flex-shrink-0 w-8 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 border border-l-0 border-white/20 dark:border-gray-700/50 rounded-l-2xl shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] cursor-pointer"
        style={{ width: TAB_WIDTH }}
        title={title}
      >
        <List className="w-4 h-4 text-momentum-orange" aria-hidden />
      </div>

      {/* TOC panel */}
      <nav className="flex-shrink-0 w-[280px] h-full overflow-hidden" aria-label="Table of contents">
      <div className="relative h-full mr-2 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 rounded-l-2xl border border-white/20 dark:border-gray-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] overflow-hidden">
        {/* Gradient accent line at top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-momentum-orange via-orange-400 to-amber-400" />

        {/* Header */}
        <div className="px-5 pt-5 pb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              {title}
            </h3>
            {/* Circular progress indicator */}
            <div className="relative w-8 h-8">
              <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
                <circle
                  cx="16"
                  cy="16"
                  r="12"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="text-gray-100 dark:text-gray-800"
                />
                <motion.circle
                  cx="16"
                  cy="16"
                  r="12"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeDasharray={75.4}
                  initial={{ strokeDashoffset: 75.4 }}
                  animate={{ strokeDashoffset: 75.4 - (75.4 * progressPercentage) / 100 }}
                  transition={{ duration: 0.4, ease: 'easeOut' }}
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF6B00" />
                    <stop offset="100%" stopColor="#F59E0B" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-gray-600 dark:text-gray-300">
                {activeIndex >= 0 ? activeIndex + 1 : 0}
              </span>
            </div>
          </div>
        </div>

        {/* TOC Items */}
        <div className="max-h-[calc(100vh-220px)] overflow-y-auto px-3 pb-4 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-700">
          <ul className="space-y-1">
            {items.map((item, index) => {
              const isActive = activeId === item.id;
              const isPast = activeIndex > index;

              return (
                <li key={item.id}>
                  <motion.button
                    onClick={() => handleClick(item.id)}
                    className={cn(
                      'group w-full text-left px-3 py-2.5 rounded-xl',
                      'transition-all duration-200',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-momentum-orange/50',
                      isActive
                        ? 'bg-gradient-to-r from-momentum-orange/10 to-orange-400/5 dark:from-momentum-orange/20 dark:to-orange-400/10'
                        : 'hover:bg-gray-100/80 dark:hover:bg-gray-800/50'
                    )}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    aria-current={isActive ? 'location' : undefined}
                  >
                    <div className="flex items-start gap-3">
                      {/* Status indicator */}
                      <div className="relative mt-0.5 flex-shrink-0">
                        <AnimatePresence mode="wait">
                          {isPast ? (
                            <motion.div
                              key="check"
                              initial={{ scale: 0, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <CheckCircle2 size={16} className="text-emerald-500" />
                            </motion.div>
                          ) : isActive ? (
                            <motion.div
                              key="active"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-4 h-4 rounded-full bg-gradient-to-br from-momentum-orange to-orange-400 flex items-center justify-center"
                            >
                              <motion.div
                                className="w-1.5 h-1.5 rounded-full bg-white"
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                              />
                            </motion.div>
                          ) : (
                            <motion.div
                              key="pending"
                              className={cn(
                                'w-4 h-4 rounded-full border-2 transition-colors duration-200',
                                'border-gray-200 dark:border-gray-700',
                                'group-hover:border-gray-300 dark:group-hover:border-gray-600'
                              )}
                            />
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {item.icon && (
                            <span className={cn(
                              'flex-shrink-0 transition-colors duration-200',
                              isActive
                                ? 'text-momentum-orange'
                                : isPast
                                  ? 'text-emerald-500'
                                  : 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400'
                            )}>
                              {item.icon}
                            </span>
                          )}
                          <span className={cn(
                            'text-[13px] leading-tight truncate transition-colors duration-200',
                            isActive
                              ? 'font-semibold text-gray-900 dark:text-white'
                              : isPast
                                ? 'font-medium text-gray-500 dark:text-gray-400'
                                : 'font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-200'
                          )}>
                            {item.title}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer with keyboard hint */}
        <div className="px-5 py-3 border-t border-gray-100/80 dark:border-gray-800/80 bg-gray-50/50 dark:bg-gray-800/30">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400 dark:text-gray-500">
              {activeIndex >= 0 ? activeIndex + 1 : 0} of {items.length} sections
            </span>
            <div className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 dark:text-gray-500 rounded border border-gray-200 dark:border-gray-700">
                ↑
              </kbd>
              <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-gray-400 bg-gray-100 dark:bg-gray-800 dark:text-gray-500 rounded border border-gray-200 dark:border-gray-700">
                ↓
              </kbd>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 ml-1">navigate</span>
            </div>
          </div>
        </div>
      </div>
      </nav>
    </motion.div>
  );
}

/**
 * MiniTableOfContents - Compact variant for smaller spaces
 */
interface MiniTocProps {
  items: TocItem[];
  activeId: string | null;
  onItemClick: (id: string) => void;
  className?: string;
}

export function MiniTableOfContents({
  items,
  activeId,
  onItemClick,
  className = ''
}: MiniTocProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {items.map((item, index) => {
        const isActive = activeId === item.id;

        return (
          <motion.button
            key={item.id}
            onClick={() => onItemClick(item.id)}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-full',
              'transition-all duration-200',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-momentum-orange/50',
              isActive
                ? 'bg-gradient-to-r from-momentum-orange to-orange-400 text-white shadow-lg shadow-orange-500/25'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {index + 1}. {item.title}
          </motion.button>
        );
      })}
    </div>
  );
}

/**
 * VerticalDotIndicator - Minimal dot-based progress indicator
 */
interface DotIndicatorProps {
  items: TocItem[];
  activeId: string | null;
  onItemClick: (id: string) => void;
  className?: string;
}

export function VerticalDotIndicator({
  items,
  activeId,
  onItemClick,
  className = ''
}: DotIndicatorProps) {
  const activeIndex = items.findIndex(item => item.id === activeId);

  return (
    <div className={cn('flex flex-col items-center gap-2 py-2', className)}>
      {items.map((item, index) => {
        const isActive = activeId === item.id;
        const isPast = activeIndex > index;

        return (
          <motion.button
            key={item.id}
            onClick={() => onItemClick(item.id)}
            className={cn(
              'relative transition-all duration-300',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-momentum-orange/50 focus-visible:ring-offset-2 rounded-full'
            )}
            whileHover={{ scale: 1.3 }}
            whileTap={{ scale: 0.9 }}
            aria-label={`Go to ${item.title}`}
            title={item.title}
          >
            <motion.div
              className={cn(
                'w-2.5 h-2.5 rounded-full transition-colors duration-300',
                isActive
                  ? 'bg-gradient-to-br from-momentum-orange to-orange-400'
                  : isPast
                    ? 'bg-emerald-400'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500'
              )}
              animate={isActive ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 1.5, repeat: isActive ? Infinity : 0 }}
            />
            {isActive && (
              <motion.div
                className="absolute inset-0 rounded-full bg-momentum-orange/30"
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 2, opacity: 0 }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

export default StickyTableOfContents;
