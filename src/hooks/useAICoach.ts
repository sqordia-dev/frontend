import { useState, useEffect, useCallback, useRef } from 'react';
import {
  AICoachConversation,
  AICoachMessage,
  AICoachTokenUsage,
  AICoachAccess,
  AICoachState,
  StartCoachConversationRequest,
} from '../types/ai-coach';
import { aiCoachService } from '../lib/ai-coach-service';

interface UseAICoachOptions {
  /** Business plan ID for the conversation */
  businessPlanId: string;
  /** Question ID to scope the conversation */
  questionId: string;
  /** Question number (optional) */
  questionNumber?: number | null;
  /** Question text for context */
  questionText?: string | null;
  /** Current answer (if any) */
  currentAnswer?: string | null;
  /** Language (en or fr) */
  language?: string;
  /** User persona */
  persona?: string | null;
  /** Callback when a suggestion is ready to apply */
  onSuggestionApply?: (text: string) => void;
}

interface UseAICoachReturn extends AICoachState {
  /** Start or resume a conversation */
  startConversation: (initialMessage: string) => Promise<void>;
  /** Send a message to the conversation */
  sendMessage: (message: string) => Promise<void>;
  /** Refresh token usage */
  refreshTokenUsage: () => Promise<void>;
  /** Refresh access status */
  refreshAccess: () => Promise<void>;
  /** Clear error state */
  clearError: () => void;
  /** Whether the user can use AI Coach */
  canUse: boolean;
  /** Message indicating why access is denied */
  accessDeniedReason: string | null;
  /** URL to upgrade subscription */
  upgradeUrl: string | null;
}

/**
 * Hook for managing AI Coach conversations
 * Handles access checking, conversation state, and messaging
 */
export function useAICoach(options: UseAICoachOptions): UseAICoachReturn {
  const {
    businessPlanId,
    questionId,
    questionNumber,
    questionText,
    currentAnswer,
    language = 'en',
    persona,
  } = options;

  const [conversation, setConversation] = useState<AICoachConversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [access, setAccess] = useState<AICoachAccess | null>(null);
  const [tokenUsage, setTokenUsage] = useState<AICoachTokenUsage | null>(null);

  const isMountedRef = useRef(true);

  // Check access on mount
  const refreshAccess = useCallback(async () => {
    try {
      const accessResult = await aiCoachService.checkAccess();
      if (isMountedRef.current) {
        setAccess(accessResult);
      }
    } catch (err) {
      console.error('Failed to check AI Coach access:', err);
      if (isMountedRef.current) {
        setAccess({
          hasAccess: false,
          featureEnabled: false,
          subscriptionTier: null,
          denialReason: 'Unable to verify access. Please try again.',
          upgradeUrl: null,
        });
      }
    }
  }, []);

  // Refresh token usage
  const refreshTokenUsage = useCallback(async () => {
    try {
      const usage = await aiCoachService.getTokenUsage();
      if (isMountedRef.current) {
        setTokenUsage(usage);
      }
    } catch (err) {
      console.error('Failed to fetch token usage:', err);
    }
  }, []);

  // Load existing conversation for the question
  const loadExistingConversation = useCallback(async () => {
    if (!businessPlanId || !questionId) return;

    try {
      const existingConversation = await aiCoachService.getConversationByQuestion(
        businessPlanId,
        questionId
      );
      if (isMountedRef.current && existingConversation) {
        setConversation(existingConversation);
      }
    } catch (err) {
      console.error('Failed to load existing conversation:', err);
    }
  }, [businessPlanId, questionId]);

  // Start or resume a conversation
  const startConversation = useCallback(
    async (initialMessage: string) => {
      if (!businessPlanId || !questionId) {
        setError('Missing business plan or question ID');
        return;
      }

      setIsSending(true);
      setError(null);

      try {
        const request: StartCoachConversationRequest = {
          businessPlanId,
          questionId,
          questionNumber,
          questionText,
          currentAnswer,
          language,
          persona,
          initialMessage,
        };

        const result = await aiCoachService.startConversation(request);

        if (isMountedRef.current) {
          setConversation(result);
          // Refresh token usage after conversation
          refreshTokenUsage();
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to start conversation';
        if (isMountedRef.current) {
          setError(errorMessage);
        }
        throw err;
      } finally {
        if (isMountedRef.current) {
          setIsSending(false);
        }
      }
    },
    [
      businessPlanId,
      questionId,
      questionNumber,
      questionText,
      currentAnswer,
      language,
      persona,
      refreshTokenUsage,
    ]
  );

  // Send a message to existing conversation
  const sendMessage = useCallback(
    async (message: string) => {
      if (!conversation) {
        // If no conversation exists, start one
        await startConversation(message);
        return;
      }

      setIsSending(true);
      setError(null);

      try {
        const response = await aiCoachService.sendMessage({
          conversationId: conversation.id,
          message,
        });

        if (isMountedRef.current) {
          // Add user message and assistant response to conversation
          setConversation((prev) => {
            if (!prev) return prev;

            const userMessage: AICoachMessage = {
              id: `temp-${Date.now()}`,
              role: 'user',
              content: message,
              tokenCount: 0,
              sequence: prev.messages.length + 1,
              createdAt: new Date().toISOString(),
            };

            return {
              ...prev,
              messages: [...prev.messages, userMessage, response],
              totalTokensUsed: prev.totalTokensUsed + response.tokenCount,
              lastMessageAt: response.createdAt,
            };
          });

          // Refresh token usage after message
          refreshTokenUsage();
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to send message';
        if (isMountedRef.current) {
          setError(errorMessage);
        }
        throw err;
      } finally {
        if (isMountedRef.current) {
          setIsSending(false);
        }
      }
    },
    [conversation, startConversation, refreshTokenUsage]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Initialize on mount
  useEffect(() => {
    isMountedRef.current = true;

    const initialize = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          refreshAccess(),
          refreshTokenUsage(),
          loadExistingConversation(),
        ]);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      }
    };

    initialize();

    return () => {
      isMountedRef.current = false;
    };
  }, [refreshAccess, refreshTokenUsage, loadExistingConversation]);

  // Reload conversation when question changes
  useEffect(() => {
    if (!isLoading) {
      setConversation(null);
      loadExistingConversation();
    }
  }, [questionId, isLoading, loadExistingConversation]);

  // Derived state
  const canUse = access?.hasAccess ?? false;
  const accessDeniedReason = access?.denialReason ?? null;
  const upgradeUrl = access?.upgradeUrl ?? null;

  return {
    conversation,
    isLoading,
    isSending,
    error,
    access,
    tokenUsage,
    startConversation,
    sendMessage,
    refreshTokenUsage,
    refreshAccess,
    clearError,
    canUse,
    accessDeniedReason,
    upgradeUrl,
  };
}

export default useAICoach;
