import { ArrowLeft, Check, Loader2, AlertCircle, CloudOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionnaireHeaderProps } from '../../types/questionnaire';
import { Logo } from '../ui/Logo';
import { cn } from '@/lib/utils';

/**
 * QuestionnaireHeader Component
 * Refined header with back link, save status indicator, and branding
 */
export default function QuestionnaireHeader({
  planTitle,
  saveStatus,
  onBack,
}: QuestionnaireHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/dashboard');
    }
  };

  // Save status configurations
  const statusConfig: Record<string, {
    icon: typeof Check;
    text: string;
    bgClass: string;
    textClass: string;
    iconClass: string;
    animate?: boolean;
  }> = {
    saved: {
      icon: Check,
      text: 'Saved',
      bgClass: 'bg-emerald-500/10 border-emerald-500/20',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      iconClass: 'text-emerald-500',
    },
    saving: {
      icon: Loader2,
      text: 'Saving...',
      bgClass: 'bg-blue-500/10 border-blue-500/20',
      textClass: 'text-blue-600 dark:text-blue-400',
      iconClass: 'text-blue-500',
      animate: true,
    },
    unsaved: {
      icon: CloudOff,
      text: 'Unsaved',
      bgClass: 'bg-amber-500/10 border-amber-500/20',
      textClass: 'text-amber-600 dark:text-amber-400',
      iconClass: 'text-amber-500',
    },
    error: {
      icon: AlertCircle,
      text: 'Save failed',
      bgClass: 'bg-red-500/10 border-red-500/20',
      textClass: 'text-red-600 dark:text-red-400',
      iconClass: 'text-red-500',
    },
  };

  const currentStatus = statusConfig[saveStatus] || statusConfig.saved;
  const StatusIcon = currentStatus.icon;

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Back Button */}
          <motion.button
            onClick={handleBack}
            whileHover={{ x: -2 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 -ml-2",
              "rounded-xl text-muted-foreground",
              "hover:text-foreground hover:bg-muted/50",
              "transition-colors duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-momentum-orange focus-visible:ring-offset-2"
            )}
            aria-label="Back to Dashboard"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
            <span className="text-sm font-medium hidden sm:inline">
              Dashboard
            </span>
          </motion.button>

          {/* Center: Logo or Plan Title */}
          <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
            {planTitle ? (
              <h1 className="text-sm font-semibold text-foreground truncate max-w-[280px]">
                {planTitle}
              </h1>
            ) : (
              <Logo showText={false} size="sm" />
            )}
          </div>

          {/* Right: Save Status */}
          <AnimatePresence mode="wait">
            <motion.div
              key={saveStatus}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5",
                "rounded-full border",
                currentStatus.bgClass
              )}
              role="status"
              aria-live="polite"
              aria-label={`Save status: ${currentStatus.text}`}
            >
              <StatusIcon
                className={cn(
                  "w-3.5 h-3.5",
                  currentStatus.iconClass,
                  currentStatus.animate && "animate-spin"
                )}
              />
              <span className={cn(
                "text-xs font-medium hidden sm:inline",
                currentStatus.textClass
              )}>
                {currentStatus.text}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
