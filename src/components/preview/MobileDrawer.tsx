import { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, BookOpen, List } from 'lucide-react';
import { PlanSection } from '../../types/preview';

interface MobileDrawerProps {
  /** Whether the drawer is open */
  isOpen: boolean;
  /** Callback when drawer should close */
  onClose: () => void;
  /** Sidebar content to render */
  children: React.ReactNode;
  /** Plan name for header */
  planName?: string;
}

/**
 * MobileDrawer - Modern slide-up drawer for mobile navigation
 *
 * Features:
 * - Glassmorphism design matching desktop TOC
 * - Slide-up from bottom with spring animation
 * - Progress tracking with visual indicators
 * - Smooth scroll to section on click
 */
export default function MobileDrawer({
  isOpen,
  onClose,
  children,
  planName,
}: MobileDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle ESC key to close
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  // Focus trap implementation
  const handleFocusTrap = useCallback((event: KeyboardEvent) => {
    if (event.key !== 'Tab' || !drawerRef.current) return;

    const focusableElements = drawerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement?.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement?.focus();
      }
    }
  }, []);

  // Body scroll lock and focus management
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;

      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';

      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keydown', handleFocusTrap);

      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);

      return () => {
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);

        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keydown', handleFocusTrap);

        previousActiveElement.current?.focus();
      };
    }
  }, [isOpen, handleKeyDown, handleFocusTrap]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer Panel - Slide up from bottom */}
          <motion.aside
            ref={drawerRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            className="lg:hidden fixed left-0 right-0 bottom-0 max-h-[85vh] z-50 overflow-hidden flex flex-col"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation drawer"
          >
            {/* Solid container with subtle shadow */}
            <div className="relative bg-white dark:bg-gray-900 rounded-t-3xl border-t border-x border-gray-200 dark:border-gray-700 shadow-[0_-8px_32px_rgba(0,0,0,0.15)] dark:shadow-[0_-8px_32px_rgba(0,0,0,0.5)] flex flex-col h-full">
              {/* Gradient accent line at top */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-momentum-orange via-orange-400 to-amber-400 rounded-t-3xl" />

              {/* Drag handle */}
              <div className="flex justify-center pt-3 pb-2">
                <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-5 pb-4 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <h2 className="text-[11px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    On this page
                  </h2>
                  {planName && (
                    <p className="text-base font-semibold text-gray-900 dark:text-white mt-1 truncate max-w-[220px]" title={planName}>
                      {planName}
                    </p>
                  )}
                </div>
                <button
                  ref={closeButtonRef}
                  onClick={onClose}
                  className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-momentum-orange"
                  aria-label="Close navigation menu"
                >
                  <X size={22} className="text-gray-600 dark:text-gray-300" aria-hidden="true" />
                </button>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
                {children}
              </div>

              {/* Footer hint */}
              <div className="px-5 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                <p className="text-xs text-center text-gray-500 dark:text-gray-400 font-medium">
                  Tap a section to navigate
                </p>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// Standalone navigation item component for use within drawer
export interface DrawerNavigationItemProps {
  /** Section data */
  section: PlanSection;
  /** Index for numbering */
  index: number;
  /** Whether this section is currently active */
  isActive: boolean;
  /** Whether this section has been read/passed */
  isPast?: boolean;
  /** Callback when section is clicked */
  onClick: () => void;
  /** Icon component to display */
  icon?: React.ReactNode;
}

/**
 * DrawerNavigationItem - Individual navigation item for the mobile drawer
 * Matches the modern styling of the desktop TOC
 */
export function DrawerNavigationItem({
  section,
  index,
  isActive,
  isPast = false,
  onClick,
  icon,
}: DrawerNavigationItemProps) {
  const hasContent = section.content && section.content.trim().length > 0;

  return (
    <motion.button
      onClick={onClick}
      className={`group w-full text-left px-4 py-3.5 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-momentum-orange ${
        isActive
          ? 'bg-orange-50 dark:bg-orange-900/30 border-l-4 border-momentum-orange'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700'
      }`}
      whileTap={{ scale: 0.98 }}
      aria-current={isActive ? 'page' : undefined}
    >
      <div className="flex items-center gap-3">
        {/* Status indicator */}
        <div className="relative flex-shrink-0">
          {hasContent || isPast ? (
            <CheckCircle2 size={20} className="text-emerald-500" />
          ) : isActive ? (
            <div className="w-5 h-5 rounded-full bg-momentum-orange flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500 transition-colors" />
          )}
        </div>

        {/* Icon (if provided) */}
        {icon && (
          <span className={`flex-shrink-0 ${
            isActive
              ? 'text-momentum-orange'
              : hasContent || isPast
                ? 'text-emerald-500'
                : 'text-gray-400 dark:text-gray-500'
          }`}>
            {icon}
          </span>
        )}

        {/* Section title */}
        <span className={`text-[15px] leading-tight truncate ${
          isActive
            ? 'font-bold text-momentum-orange'
            : hasContent || isPast
              ? 'font-medium text-gray-600 dark:text-gray-300'
              : 'font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
        }`}>
          {index + 1}. {section.title}
        </span>
      </div>
    </motion.button>
  );
}

// Section label component for grouping
export interface DrawerSectionLabelProps {
  /** Label text */
  label: string;
}

/**
 * DrawerSectionLabel - Section label/heading for grouping items
 */
export function DrawerSectionLabel({ label }: DrawerSectionLabelProps) {
  return (
    <p className="text-[11px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-semibold mb-2 px-4 py-2">
      {label}
    </p>
  );
}

/**
 * MobileTocItem - Simplified TOC item for mobile drawer
 * Used when rendering TOC directly without full section data
 */
interface MobileTocItemProps {
  id: string;
  title: string;
  icon?: React.ReactNode;
  isActive: boolean;
  isPast?: boolean;
  onClick: () => void;
}

export function MobileTocItem({
  id,
  title,
  icon,
  isActive,
  isPast = false,
  onClick,
}: MobileTocItemProps) {
  return (
    <motion.button
      onClick={onClick}
      className={`group w-full text-left px-4 py-3.5 rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-momentum-orange ${
        isActive
          ? 'bg-orange-50 dark:bg-orange-900/30 border-l-4 border-momentum-orange'
          : 'hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700'
      }`}
      whileTap={{ scale: 0.98 }}
      aria-current={isActive ? 'location' : undefined}
    >
      <div className="flex items-center gap-3">
        {/* Status indicator */}
        <div className="relative flex-shrink-0">
          {isPast ? (
            <CheckCircle2 size={20} className="text-emerald-500" />
          ) : isActive ? (
            <div className="w-5 h-5 rounded-full bg-momentum-orange flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500 transition-colors" />
          )}
        </div>

        {/* Icon (if provided) */}
        {icon && (
          <span className={`flex-shrink-0 ${
            isActive
              ? 'text-momentum-orange'
              : isPast
                ? 'text-emerald-500'
                : 'text-gray-400 dark:text-gray-500'
          }`}>
            {icon}
          </span>
        )}

        {/* Title */}
        <span className={`text-[15px] leading-tight truncate ${
          isActive
            ? 'font-bold text-momentum-orange'
            : isPast
              ? 'font-medium text-gray-600 dark:text-gray-300'
              : 'font-medium text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
        }`}>
          {title}
        </span>
      </div>
    </motion.button>
  );
}
