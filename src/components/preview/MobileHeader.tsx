import { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Menu, Download, Share2, Loader2 } from 'lucide-react';

interface MobileHeaderProps {
  /** Title to display (current section or plan title) */
  title: string;
  /** Callback when hamburger menu button is clicked */
  onMenuClick: () => void;
  /** Callback when export is clicked */
  onExportClick?: () => void;
  /** Callback when share is clicked */
  onShareClick?: () => void;
  /** Whether export is in progress */
  isExporting?: boolean;
  /** Show action buttons (export/share) */
  showActions?: boolean;
}

/**
 * MobileHeader - Fixed mobile navigation header
 *
 * Features:
 * - Visible only on mobile (lg:hidden)
 * - Dark navy background (#1A2B47) matching sidebar
 * - Hamburger menu button to open drawer
 * - Current section/plan title
 * - Optional action buttons (export, share)
 * - Smooth slide-down animation when scrolling up
 * - Fixed position at top
 */
export default function MobileHeader({
  title,
  onMenuClick,
  onExportClick,
  onShareClick,
  isExporting = false,
  showActions = true,
}: MobileHeaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  // Motion values for smooth animation
  const headerY = useMotionValue(0);
  const headerOpacity = useTransform(headerY, [-64, 0], [0, 1]);

  // Handle scroll direction detection for show/hide behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Clear existing timeout
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      // Determine scroll direction
      if (currentScrollY < lastScrollY.current) {
        // Scrolling up - show header
        setIsVisible(true);
        headerY.set(0);
      } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        // Scrolling down and past threshold - hide header
        setIsVisible(false);
        headerY.set(-64);
      }

      // Always show header when at top
      if (currentScrollY < 50) {
        setIsVisible(true);
        headerY.set(0);
      }

      lastScrollY.current = currentScrollY;

      // Show header after scroll stops
      scrollTimeout.current = setTimeout(() => {
        setIsVisible(true);
        headerY.set(0);
      }, 1500);
    };

    // Add passive event listener for better performance
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [headerY]);

  return (
    <motion.header
      className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-strategy-blue text-white flex items-center justify-between px-4 z-40 shadow-lg"
      style={{ y: headerY, opacity: headerOpacity }}
      initial={{ y: 0, opacity: 1 }}
      animate={{
        y: isVisible ? 0 : -64,
        opacity: isVisible ? 1 : 0
      }}
      transition={{
        duration: 0.2,
        ease: 'easeOut'
      }}
      role="banner"
      aria-label="Mobile navigation header"
    >
      {/* Left section - Menu button and title */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          onClick={onMenuClick}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-inset"
          aria-label="Open navigation menu"
          aria-haspopup="dialog"
        >
          <Menu size={24} aria-hidden="true" />
        </button>
        <h1
          className="text-base font-semibold truncate"
          title={title}
        >
          {title || 'Business Plan'}
        </h1>
      </div>

      {/* Right section - Action buttons */}
      {showActions && (
        <div className="flex items-center gap-1 flex-shrink-0">
          <AnimatePresence mode="wait">
            {onExportClick && (
              <motion.button
                key="export-button"
                onClick={onExportClick}
                disabled={isExporting}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-inset"
                aria-label={isExporting ? 'Exporting...' : 'Export PDF'}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.15 }}
              >
                {isExporting ? (
                  <Loader2
                    size={20}
                    className="animate-spin"
                    aria-hidden="true"
                  />
                ) : (
                  <Download size={20} aria-hidden="true" />
                )}
              </motion.button>
            )}
          </AnimatePresence>
          {onShareClick && (
            <button
              onClick={onShareClick}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-inset"
              aria-label="Share plan"
            >
              <Share2 size={20} aria-hidden="true" />
            </button>
          )}
        </div>
      )}
    </motion.header>
  );
}
