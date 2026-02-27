import { ArrowLeft, Check, Loader2, AlertCircle, CloudOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionnaireHeaderProps } from '../../types/questionnaire';
import { Logo } from '../ui/Logo';
import { cn } from '@/lib/utils';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * QuestionnaireHeader Component
 * Clean header with elegant back button and animated save status
 */
export default function QuestionnaireHeader({
  planTitle,
  saveStatus,
  onBack,
}: QuestionnaireHeaderProps) {
  const navigate = useNavigate();
  const { t } = useTheme();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/dashboard');
    }
  };

  // Save status configurations with translations
  const statusConfig: Record<string, {
    icon: typeof Check;
    textKey: string;
    bgClass: string;
    textClass: string;
    iconClass: string;
    animate?: boolean;
  }> = {
    saved: {
      icon: Check,
      textKey: 'questionnaire.statusSaved',
      bgClass: 'bg-emerald-500/10 border-emerald-500/20',
      textClass: 'text-emerald-600 dark:text-emerald-400',
      iconClass: 'text-emerald-500',
    },
    saving: {
      icon: Loader2,
      textKey: 'questionnaire.statusSaving',
      bgClass: 'bg-blue-500/10 border-blue-500/20',
      textClass: 'text-blue-600 dark:text-blue-400',
      iconClass: 'text-blue-500',
      animate: true,
    },
    unsaved: {
      icon: CloudOff,
      textKey: 'questionnaire.statusUnsaved',
      bgClass: 'bg-amber-500/10 border-amber-500/20',
      textClass: 'text-amber-600 dark:text-amber-400',
      iconClass: 'text-amber-500',
    },
    error: {
      icon: AlertCircle,
      textKey: 'questionnaire.statusError',
      bgClass: 'bg-red-500/10 border-red-500/20',
      textClass: 'text-red-600 dark:text-red-400',
      iconClass: 'text-red-500',
    },
  };

  const currentStatus = statusConfig[saveStatus] || statusConfig.saved;
  const StatusIcon = currentStatus.icon;

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full",
      "bg-background/90 backdrop-blur-2xl",
      "border-b border-border/30"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-[72px]">
          {/* Left: Back Button */}
          <motion.button
            onClick={handleBack}
            whileHover={{ x: -3 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "group flex items-center gap-2.5 px-3 py-2 -ml-2",
              "rounded-xl text-muted-foreground",
              "hover:text-foreground hover:bg-muted/50",
              "transition-all duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-momentum-orange/50 focus-visible:ring-offset-2"
            )}
            aria-label={t('questionnaire.backToDashboard')}
          >
            <ArrowLeft className="w-5 h-5 transition-transform duration-200 group-hover:-translate-x-0.5" />
            <span className="text-sm font-medium hidden sm:inline">
              {t('questionnaire.dashboard')}
            </span>
          </motion.button>

          {/* Center: Logo or Plan Title */}
          <div className="absolute left-1/2 transform -translate-x-1/2 hidden md:block">
            {planTitle ? (
              <motion.h1
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-semibold text-foreground truncate max-w-[300px]"
              >
                {planTitle}
              </motion.h1>
            ) : (
              <Logo showText={false} size="sm" />
            )}
          </div>

          {/* Right: Save Status */}
          <AnimatePresence mode="wait">
            <motion.div
              key={saveStatus}
              initial={{ opacity: 0, scale: 0.9, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 5 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2",
                "rounded-xl border",
                currentStatus.bgClass
              )}
              role="status"
              aria-live="polite"
              aria-label={`${t('questionnaire.saveStatus')}: ${t(currentStatus.textKey)}`}
            >
              <motion.div
                animate={currentStatus.animate ? { rotate: 360 } : {}}
                transition={currentStatus.animate ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
              >
                <StatusIcon
                  className={cn(
                    "w-4 h-4",
                    currentStatus.iconClass
                  )}
                />
              </motion.div>
              <span className={cn(
                "text-xs font-semibold hidden sm:inline",
                currentStatus.textClass
              )}>
                {t(currentStatus.textKey)}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
