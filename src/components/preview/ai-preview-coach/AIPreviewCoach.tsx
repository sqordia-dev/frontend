import React, { useState, useMemo } from 'react';
import { cn } from '../../../lib/utils';
import { useAIPreviewCoach } from '../../../hooks/useAIPreviewCoach';
import { AIPreviewCoachPanel } from './AIPreviewCoachPanel';
import { Sparkles, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../contexts/ThemeContext';
import { PlanSection } from '../../../types/preview';

interface AIPreviewCoachProps {
  businessPlanId: string;
  activeSection: PlanSection | null;
  language?: string;
  persona?: string | null;
  className?: string;
}

export function AIPreviewCoach({
  businessPlanId,
  activeSection,
  language = 'en',
  persona,
  className,
}: AIPreviewCoachProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTheme();

  const {
    conversation,
    isLoading,
    isSending,
    error,
    access,
    tokenUsage,
    sendMessage,
    clearError,
    canUse,
    sendQuickAction,
    activeSection: currentSection,
  } = useAIPreviewCoach({
    businessPlanId,
    activeSection,
    language,
    persona,
  });

  const handleToggle = () => setIsOpen(!isOpen);
  const handleClose = () => setIsOpen(false);

  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };

  // Don't show if feature is not enabled
  if (access && !access.featureEnabled) {
    return null;
  }

  return (
    <>
      {/* Floating bubble button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            className={cn(
              'fixed z-40',
              'bottom-4 right-4 md:bottom-6 md:right-6',
              className
            )}
            style={{ bottom: 'max(env(safe-area-inset-bottom, 16px), 16px)' }}
          >
            <button
              onClick={handleToggle}
              className={cn(
                'group relative',
                'w-14 h-14 md:w-12 md:h-12 rounded-full',
                'bg-gradient-to-br from-[#FF6B00] to-[#FF8533]',
                'shadow-lg shadow-orange-500/30',
                'hover:shadow-xl hover:shadow-orange-500/40 hover:scale-105 md:hover:scale-110',
                'active:scale-95',
                'transition-all duration-300',
                'flex items-center justify-center'
              )}
              aria-label={t('previewCoach.open')}
            >
              <Sparkles className="w-6 h-6 text-white" />

              {/* Pro badge */}
              {access && !access.hasAccess && access.featureEnabled && (
                <div className="absolute -top-1 -right-1 flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-[10px] font-bold text-white rounded-full shadow-sm">
                  <Crown className="w-2.5 h-2.5" />
                  Pro
                </div>
              )}

              {/* Conversation indicator */}
              {conversation && conversation.messages.length > 0 && (
                <div className="absolute -top-1 -left-1 w-5 h-5 md:w-4 md:h-4 bg-[#181B22] rounded-full flex items-center justify-center text-[10px] text-white font-medium shadow-sm">
                  {Math.min(conversation.messages.length, 9)}
                  {conversation.messages.length > 9 && '+'}
                </div>
              )}

              {/* Pulse animation - desktop only */}
              <motion.div
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 rounded-full bg-[#FF6B00] hidden md:block"
              />

              {/* Tooltip - desktop only */}
              <div className={cn(
                'absolute right-full mr-3 px-3 py-1.5',
                'bg-slate-800 dark:bg-slate-700 text-white text-sm font-medium rounded-lg',
                'opacity-0 group-hover:opacity-100 pointer-events-none',
                'transition-opacity duration-200',
                'whitespace-nowrap',
                'hidden md:block'
              )}>
                {t('previewCoach.open')}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-full">
                  <div className="border-4 border-transparent border-l-slate-800 dark:border-l-slate-700" />
                </div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AIPreviewCoachPanel
        isOpen={isOpen}
        onClose={handleClose}
        conversation={conversation}
        tokenUsage={tokenUsage}
        access={access}
        isLoading={isLoading}
        isSending={isSending}
        error={error}
        onSendMessage={handleSendMessage}
        onClearError={clearError}
        onQuickAction={sendQuickAction}
        activeSection={activeSection}
        language={language}
      />
    </>
  );
}

export default AIPreviewCoach;
