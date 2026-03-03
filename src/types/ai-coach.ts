/**
 * AI Coach Types
 * Types for the multi-turn conversational AI Coach feature
 */

// Message role in conversation
export type AICoachMessageRole = 'user' | 'assistant';

// Individual message in conversation
export interface AICoachMessage {
  id: string;
  role: AICoachMessageRole;
  content: string;
  tokenCount: number;
  sequence: number;
  createdAt: string;
}

// Full conversation response
export interface AICoachConversation {
  id: string;
  businessPlanId: string;
  questionId: string;
  questionNumber: number | null;
  questionText: string | null;
  language: string;
  persona: string | null;
  totalTokensUsed: number;
  lastMessageAt: string | null;
  isActive: boolean;
  createdAt: string;
  messages: AICoachMessage[];
}

// Token usage tracking
export interface AICoachTokenUsage {
  tokensUsed: number;
  tokenLimit: number;
  usagePercent: number;
  isNearLimit: boolean;
  warningMessage: string | null;
  tokensRemaining: number;
  currentMonth: number;
}

// Access check response
export interface AICoachAccess {
  hasAccess: boolean;
  featureEnabled: boolean;
  subscriptionTier: string | null;
  denialReason: string | null;
  upgradeUrl: string | null;
}

// Request to start a new conversation
export interface StartCoachConversationRequest {
  businessPlanId: string;
  questionId: string;
  questionNumber?: number | null;
  questionText?: string | null;
  currentAnswer?: string | null;
  language: string;
  persona?: string | null;
  initialMessage: string;
}

// Request to send a message in existing conversation
export interface SendCoachMessageRequest {
  conversationId: string;
  message: string;
}

// State for the AI Coach widget
export interface AICoachState {
  conversation: AICoachConversation | null;
  isLoading: boolean;
  isSending: boolean;
  error: string | null;
  access: AICoachAccess | null;
  tokenUsage: AICoachTokenUsage | null;
}
