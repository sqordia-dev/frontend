import React, { useRef, useEffect, useState } from 'react';
import { cn } from '../../lib/utils';
import { AICoachConversation, AICoachTokenUsage, AICoachAccess } from '../../types/ai-coach';
import { AICoachMessageBubble } from './AICoachMessageBubble';
import { AICoachTokenIndicator } from './AICoachTokenIndicator';
import { X, Loader2, Sparkles, ArrowUp, Lock, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AICoachWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: AICoachConversation | null;
  tokenUsage: AICoachTokenUsage | null;
  access: AICoachAccess | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  onSendMessage: (message: string) => Promise<void>;
  onApplySuggestion?: (text: string) => void;
  onClearError?: () => void;
  questionText?: string | null;
  language?: string;
}

/**
 * AI Coach chat widget - slide-out panel for conversations
 */
export function AICoachWidget({
  isOpen,
  onClose,
  conversation,
  tokenUsage,
  access,
  isLoading,
  isSending,
  error,
  onSendMessage,
  onApplySuggestion,
  onClearError,
  questionText,
  language = 'en',
}: AICoachWidgetProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const labels = {
    title: 'Sqordia',
    subtitle: language === 'fr' ? 'Votre coach personnel' : 'Your personal coach',
    placeholder: language === 'fr'
      ? 'Posez votre question...'
      : 'Ask your question...',
    send: language === 'fr' ? 'Envoyer' : 'Send',
    loading: language === 'fr' ? 'Chargement...' : 'Loading...',
    thinking: language === 'fr' ? 'Réflexion...' : 'Thinking...',
    noAccess: language === 'fr' ? 'Accès requis' : 'Access Required',
    upgrade: language === 'fr' ? 'Passer au Pro' : 'Upgrade to Pro',
    startChat: language === 'fr'
      ? 'Bonjour! Je suis Sqordia, votre coach. Comment puis-je vous aider avec cette question?'
      : "Hello! I'm Sqordia, your coach. How can I help you with this question?",
    errorTitle: language === 'fr' ? 'Erreur' : 'Error',
    tryAgain: language === 'fr' ? 'Réessayer' : 'Try again',
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [conversation?.messages]);

  // Focus input when widget opens
  useEffect(() => {
    if (isOpen && inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  }, [isOpen, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isSending) return;

    const message = inputValue.trim();
    setInputValue('');
    await onSendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - visible on all screens */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40"
            onClick={onClose}
          />

          {/* Widget panel */}
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 400 }}
            className={cn(
              'fixed z-50 flex flex-col bg-white dark:bg-slate-900 shadow-2xl overflow-hidden',
              // Mobile: full width bottom sheet with rounded top
              'inset-x-0 bottom-0 rounded-t-3xl',
              'h-[85vh] max-h-[600px]',
              // Desktop: positioned card on the right
              'md:inset-auto md:bottom-20 md:right-4',
              'md:w-[360px] md:h-[480px] md:rounded-2xl',
              'md:border md:border-slate-200 md:dark:border-slate-700'
            )}
          >
            {/* Mobile drag handle */}
            <div className="md:hidden flex justify-center pt-2 pb-1 bg-gradient-to-r from-[#FF6B00] to-[#FF8533]">
              <div className="w-10 h-1 bg-white/40 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2.5 md:py-3 bg-gradient-to-r from-[#FF6B00] to-[#FF8533] text-white">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-7 md:h-7 rounded-full bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-base md:text-sm leading-tight">{labels.title}</h3>
                  <p className="text-xs md:text-[10px] text-white/80">{labels.subtitle}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 md:w-7 md:h-7 rounded-full hover:bg-white/20 active:bg-white/30 flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 md:w-4 md:h-4" />
              </button>
            </div>

            {/* Question context */}
            {questionText && (
              <div className="px-4 md:px-3 py-2.5 md:py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
                <p className="text-xs md:text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {questionText}
                </p>
              </div>
            )}

            {/* Access denied state */}
            {access && !access.hasAccess && (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <Lock className="w-8 h-8 text-slate-400" />
                </div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">
                  {labels.noAccess}
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-xs">
                  {access.denialReason}
                </p>
                {access.upgradeUrl && (
                  <a
                    href={access.upgradeUrl}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF6B00] to-[#FF8533] text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                  >
                    <Sparkles className="w-4 h-4" />
                    {labels.upgrade}
                  </a>
                )}
              </div>
            )}

            {/* Loading state */}
            {isLoading && access?.hasAccess && (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
                  <span className="text-sm text-slate-500 dark:text-slate-400">
                    {labels.loading}
                  </span>
                </div>
              </div>
            )}

            {/* Messages area */}
            {!isLoading && access?.hasAccess && (
              <div className="flex-1 overflow-y-auto p-4 md:p-3 space-y-2 md:space-y-1">
                {/* Empty state - first message prompt */}
                {(!conversation || conversation.messages.length === 0) && (
                  <div className="flex items-start gap-3 md:gap-2 mb-4 md:mb-3">
                    <div className="w-8 h-8 md:w-6 md:h-6 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8533] flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-4 h-4 md:w-3 md:h-3 text-white" />
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-sm px-4 md:px-3 py-3 md:py-2 text-sm md:text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                      {labels.startChat}
                    </div>
                  </div>
                )}

                {/* Messages */}
                {conversation?.messages.map((message) => (
                  <AICoachMessageBubble
                    key={message.id}
                    message={message}
                    onApplySuggestion={message.role === 'assistant' ? onApplySuggestion : undefined}
                    language={language}
                  />
                ))}

                {/* Thinking indicator */}
                {isSending && (
                  <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 ml-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {labels.thinking}
                  </div>
                )}

                {/* Error message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-sm">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-800/50 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-red-700 dark:text-red-300 mb-1">
                          {language === 'fr' ? 'Un problème est survenu' : 'Something went wrong'}
                        </p>
                        <p className="text-red-600 dark:text-red-400 text-xs leading-relaxed">
                          {error}
                        </p>
                        {onClearError && (
                          <button
                            onClick={onClearError}
                            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-800/50 hover:bg-red-200 dark:hover:bg-red-800 rounded-lg transition-colors"
                          >
                            <RefreshCw className="w-3 h-3" />
                            {language === 'fr' ? 'Réessayer' : 'Try again'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}

            {/* Token usage - compact inline */}
            {access?.hasAccess && tokenUsage && (
              <div className="px-4 md:px-3 py-2 md:py-1.5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                <AICoachTokenIndicator tokenUsage={tokenUsage} language={language} compact />
              </div>
            )}

            {/* Input area - safe area padding on mobile for iOS */}
            {access?.hasAccess && !isLoading && (
              <form
                onSubmit={handleSubmit}
                className="p-3 md:p-2.5 pb-6 md:pb-2.5 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)' }}
              >
                <div className="flex items-end gap-2">
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={labels.placeholder}
                    disabled={isSending}
                    rows={1}
                    className={cn(
                      'flex-1 resize-none rounded-2xl md:rounded-full border border-slate-200 dark:border-slate-700',
                      'bg-slate-50 dark:bg-slate-800 px-4 py-3 md:py-2 text-base md:text-sm',
                      'text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500',
                      'focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00]',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      'transition-all duration-200'
                    )}
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isSending}
                    className={cn(
                      'flex-shrink-0 w-11 h-11 md:w-9 md:h-9 rounded-full flex items-center justify-center',
                      'bg-gradient-to-r from-[#FF6B00] to-[#FF8533] text-white',
                      'hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
                      'transition-all duration-200'
                    )}
                  >
                    {isSending ? (
                      <Loader2 className="w-5 h-5 md:w-4 md:h-4 animate-spin" />
                    ) : (
                      <ArrowUp className="w-5 h-5 md:w-4 md:h-4" />
                    )}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default AICoachWidget;
