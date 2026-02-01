import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Edit2,
  Download,
  Share2,
  X,
  Sparkles,
  ArrowUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip';

interface FloatingAction {
  id: string;
  icon: typeof Edit2;
  label: string;
  onClick?: () => void;
  color: string;
  disabled?: boolean;
}

interface FloatingActionsProps {
  /** Callback when edit is clicked */
  onEdit?: () => void;
  /** Callback when export is clicked */
  onExport?: () => void;
  /** Callback when share is clicked */
  onShare?: () => void;
  /** Callback when AI assist is clicked */
  onAIAssist?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Show scroll-to-top button */
  showScrollTop?: boolean;
}

/**
 * FloatingActions - Expandable floating action button menu
 *
 * Features:
 * - Main FAB that expands to show action buttons
 * - Staggered spring animations on open/close
 * - Scroll-to-top button (optional)
 * - Tooltips for each action
 * - Momentum Orange accent color
 *
 * @example
 * <FloatingActions
 *   onEdit={() => console.log('edit')}
 *   onExport={() => console.log('export')}
 *   onShare={() => console.log('share')}
 *   onAIAssist={() => console.log('ai')}
 * />
 */
export function FloatingActions({
  onEdit,
  onExport,
  onShare,
  onAIAssist,
  className = '',
  showScrollTop = true
}: FloatingActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Track scroll position for back-to-top button
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', () => {
      setShowBackToTop(window.scrollY > 500);
    }, { passive: true });
  }

  // Define available actions
  const actions: FloatingAction[] = [
    {
      id: 'edit',
      icon: Edit2,
      label: 'Edit Section',
      onClick: onEdit,
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      id: 'ai',
      icon: Sparkles,
      label: 'AI Assist',
      onClick: onAIAssist,
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'export',
      icon: Download,
      label: 'Export',
      onClick: onExport,
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      id: 'share',
      icon: Share2,
      label: 'Share',
      onClick: onShare,
      color: 'bg-cyan-500 hover:bg-cyan-600'
    }
  ].filter(action => action.onClick);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <TooltipProvider delayDuration={100}>
      <div className={cn('fixed bottom-6 right-6 z-40 flex flex-col-reverse items-end gap-3', className)}>
        {/* Back to top button */}
        <AnimatePresence>
          {showScrollTop && showBackToTop && !isOpen && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              onClick={scrollToTop}
              className={cn(
                'w-10 h-10 rounded-full shadow-lg',
                'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
                'text-gray-600 dark:text-gray-300',
                'flex items-center justify-center',
                'hover:bg-gray-50 dark:hover:bg-gray-700',
                'focus:outline-none focus:ring-2 focus:ring-momentum-orange/50'
              )}
              aria-label="Scroll to top"
            >
              <ArrowUp size={18} />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Action buttons (expanded state) */}
        <AnimatePresence>
          {isOpen && actions.map((action, index) => (
            <Tooltip key={action.id}>
              <TooltipTrigger asChild>
                <motion.button
                  initial={{ opacity: 0, scale: 0.3, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.3, y: 20 }}
                  transition={{
                    delay: index * 0.05,
                    type: 'spring',
                    stiffness: 500,
                    damping: 25
                  }}
                  onClick={() => {
                    action.onClick?.();
                    setIsOpen(false);
                  }}
                  disabled={action.disabled}
                  className={cn(
                    'w-12 h-12 rounded-full shadow-lg',
                    'text-white flex items-center justify-center',
                    'focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2',
                    'disabled:opacity-50 disabled:cursor-not-allowed',
                    action.color
                  )}
                  aria-label={action.label}
                >
                  <action.icon size={20} />
                </motion.button>
              </TooltipTrigger>
              <TooltipContent side="left" sideOffset={8}>
                {action.label}
              </TooltipContent>
            </Tooltip>
          ))}
        </AnimatePresence>

        {/* Main FAB button */}
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'w-14 h-14 rounded-full shadow-lg',
            'bg-momentum-orange hover:bg-orange-600',
            'text-white flex items-center justify-center',
            'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
            'transition-colors'
          )}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          aria-label={isOpen ? 'Close actions menu' : 'Open actions menu'}
          aria-expanded={isOpen}
          aria-haspopup="true"
        >
          <motion.div
            animate={{ rotate: isOpen ? 45 : 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {isOpen ? <X size={24} /> : <Plus size={24} />}
          </motion.div>
        </motion.button>
      </div>
    </TooltipProvider>
  );
}

/**
 * SimpleFAB - Single floating action button without expansion
 */
interface SimpleFABProps {
  icon: typeof Edit2;
  label: string;
  onClick: () => void;
  className?: string;
}

export function SimpleFAB({ icon: Icon, label, onClick, className = '' }: SimpleFABProps) {
  return (
    <motion.button
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 z-40',
        'w-14 h-14 rounded-full shadow-lg',
        'bg-momentum-orange hover:bg-orange-600',
        'text-white flex items-center justify-center',
        'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
        className
      )}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label={label}
    >
      <Icon size={24} />
    </motion.button>
  );
}

export default FloatingActions;
