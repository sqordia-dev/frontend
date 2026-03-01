import { motion } from 'framer-motion';
import { Edit2, RefreshCw, Sparkles, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface HoverActionsProps {
  onEdit: () => void;
  onRegenerate: () => void;
  onAIAssist?: () => void;
  isRegenerating?: boolean;
  showAIAssist?: boolean;
  className?: string;
  /** Force visible (for mobile/touch) */
  alwaysVisible?: boolean;
}

const buttonVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

/**
 * Hover-reveal action buttons for sections
 * Shows Edit, Regenerate, and optionally AI Assist actions
 */
export default function HoverActions({
  onEdit,
  onRegenerate,
  onAIAssist,
  isRegenerating = false,
  showAIAssist = true,
  className,
  alwaysVisible = false,
}: HoverActionsProps) {
  return (
    <motion.div
      className={cn(
        'flex items-center gap-1',
        !alwaysVisible && 'opacity-0 group-hover:opacity-100',
        'transition-opacity duration-150',
        className
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Edit Button */}
      <motion.button
        variants={buttonVariants}
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className={cn(
          'p-2 rounded-lg',
          'text-warm-gray-500 hover:text-warm-gray-900',
          'hover:bg-warm-gray-100',
          'dark:text-warm-gray-400 dark:hover:text-white',
          'dark:hover:bg-warm-gray-800',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-momentum-orange/50'
        )}
        title="Edit section"
        aria-label="Edit section"
      >
        <Edit2 size={18} />
      </motion.button>

      {/* Regenerate Button */}
      <motion.button
        variants={buttonVariants}
        onClick={(e) => {
          e.stopPropagation();
          onRegenerate();
        }}
        disabled={isRegenerating}
        className={cn(
          'p-2 rounded-lg',
          'text-warm-gray-500 hover:text-momentum-orange',
          'hover:bg-orange-50',
          'dark:text-warm-gray-400 dark:hover:text-momentum-orange',
          'dark:hover:bg-orange-900/20',
          'transition-colors duration-150',
          'focus:outline-none focus:ring-2 focus:ring-momentum-orange/50',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
        title={isRegenerating ? 'Regenerating...' : 'Regenerate with AI'}
        aria-label={isRegenerating ? 'Regenerating...' : 'Regenerate with AI'}
      >
        {isRegenerating ? (
          <Loader2 size={18} className="animate-spin" />
        ) : (
          <RefreshCw size={18} />
        )}
      </motion.button>

      {/* AI Assist Button */}
      {showAIAssist && onAIAssist && (
        <motion.button
          variants={buttonVariants}
          onClick={(e) => {
            e.stopPropagation();
            onAIAssist();
          }}
          className={cn(
            'p-2 rounded-lg',
            'text-warm-gray-500 hover:text-purple-600',
            'hover:bg-purple-50',
            'dark:text-warm-gray-400 dark:hover:text-purple-400',
            'dark:hover:bg-purple-900/20',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-purple-500/50'
          )}
          title="AI Assist"
          aria-label="AI Assist"
        >
          <Sparkles size={18} />
        </motion.button>
      )}
    </motion.div>
  );
}
