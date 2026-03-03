import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { cn } from '../../lib/utils';
import { useAICoach } from '../../hooks/useAICoach';
import { AICoachWidget } from './AICoachWidget';
import { Sparkles, Crown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface AICoachBubbleRef {
  open: () => void;
  close: () => void;
  toggle: () => void;
  isOpen: boolean;
}

interface AICoachBubbleProps {
  /** Business plan ID */
  businessPlanId: string;
  /** Current question ID */
  questionId: string;
  /** Question number */
  questionNumber?: number | null;
  /** Question text for context */
  questionText?: string | null;
  /** Current answer in the editor */
  currentAnswer?: string | null;
  /** Language (en or fr) */
  language?: string;
  /** User persona */
  persona?: string | null;
  /** Callback when user wants to apply a suggestion to the answer */
  onSuggestionApply?: (text: string) => void;
  /** Additional class names */
  className?: string;
  /** Controlled open state */
  isOpenControlled?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (isOpen: boolean) => void;
}

/**
 * AI Coach floating bubble button with integrated chat widget
 * Positioned in bottom-right corner during questionnaire
 */
export const AICoachBubble = forwardRef<AICoachBubbleRef, AICoachBubbleProps>(({
  businessPlanId,
  questionId,
  questionNumber,
  questionText,
  currentAnswer,
  language = 'en',
  persona,
  onSuggestionApply,
  className,
  isOpenControlled,
  onOpenChange,
}, ref) => {
  const [isOpenInternal, setIsOpenInternal] = useState(false);

  // Use controlled state if provided, otherwise use internal state
  const isOpen = isOpenControlled !== undefined ? isOpenControlled : isOpenInternal;
  const setIsOpen = (value: boolean) => {
    if (isOpenControlled === undefined) {
      setIsOpenInternal(value);
    }
    onOpenChange?.(value);
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(!isOpen),
    isOpen,
  }), [isOpen]);

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
  } = useAICoach({
    businessPlanId,
    questionId,
    questionNumber,
    questionText,
    currentAnswer,
    language,
    persona,
    onSuggestionApply,
  });

  const labels = {
    tooltip: 'Sqordia',
    pro: 'Pro',
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleSendMessage = async (message: string) => {
    await sendMessage(message);
  };

  // Don't show if feature is not enabled
  if (access && !access.featureEnabled) {
    return null;
  }

  return (
    <>
      {/* Floating bubble button - hide when chat is open on mobile */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 300 }}
            className={cn(
              'fixed z-40',
              // Mobile: safe area aware positioning
              'bottom-4 right-4 md:bottom-6 md:right-6',
              className
            )}
            style={{ bottom: 'max(env(safe-area-inset-bottom, 16px), 16px)' }}
          >
            <button
              onClick={handleToggle}
              className={cn(
                'group relative',
                // Larger touch target on mobile
                'w-14 h-14 md:w-12 md:h-12 rounded-full',
                'bg-gradient-to-br from-[#FF6B00] to-[#FF8533]',
                'shadow-lg shadow-orange-500/30',
                'hover:shadow-xl hover:shadow-orange-500/40 hover:scale-105 md:hover:scale-110',
                'active:scale-95',
                'transition-all duration-300',
                'flex items-center justify-center'
              )}
              aria-label="Open Sqordia coach"
            >
              {/* Icon */}
              <Sparkles className="w-6 h-6 text-white" />

              {/* Pro badge for non-subscribers */}
              {access && !access.hasAccess && access.featureEnabled && (
                <div className="absolute -top-1 -right-1 flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-amber-400 to-amber-500 text-[10px] font-bold text-white rounded-full shadow-sm">
                  <Crown className="w-2.5 h-2.5" />
                  {labels.pro}
                </div>
              )}

              {/* Conversation indicator */}
              {conversation && conversation.messages.length > 0 && (
                <div className="absolute -top-1 -left-1 w-5 h-5 md:w-4 md:h-4 bg-[#1A2B47] rounded-full flex items-center justify-center text-[10px] text-white font-medium shadow-sm">
                  {Math.min(conversation.messages.length, 9)}
                  {conversation.messages.length > 9 && '+'}
                </div>
              )}

              {/* Pulse animation for attention - only on desktop to save battery */}
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
                {labels.tooltip}
                <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-full">
                  <div className="border-4 border-transparent border-l-slate-800 dark:border-l-slate-700" />
                </div>
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat widget */}
      <AICoachWidget
        isOpen={isOpen}
        onClose={handleClose}
        conversation={conversation}
        tokenUsage={tokenUsage}
        access={access}
        isLoading={isLoading}
        isSending={isSending}
        error={error}
        onSendMessage={handleSendMessage}
        onApplySuggestion={onSuggestionApply}
        onClearError={clearError}
        questionText={questionText}
        language={language}
      />
    </>
  );
});

AICoachBubble.displayName = 'AICoachBubble';

export default AICoachBubble;
