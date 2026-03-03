import { apiClient } from './api-client';
import {
  AICoachConversation,
  AICoachMessage,
  AICoachTokenUsage,
  AICoachAccess,
  StartCoachConversationRequest,
  SendCoachMessageRequest,
} from '../types/ai-coach';

/**
 * AI Coach Service
 * API functions for the multi-turn conversational AI Coach feature
 */
export const aiCoachService = {
  /**
   * Start a new AI Coach conversation or continue existing one for a question
   * @param request The conversation start request
   * @returns The conversation with initial messages
   */
  async startConversation(request: StartCoachConversationRequest): Promise<AICoachConversation> {
    const response = await apiClient.post<any>('/api/v1/ai-coach/conversations', request, {
      timeout: 60000, // 1 minute for AI response
    });

    // Handle wrapped response format (isSuccess/value)
    if (response.data?.isSuccess && response.data.value) {
      return response.data.value;
    }

    return response.data;
  },

  /**
   * Send a message to an existing conversation
   * @param request The message request
   * @returns The assistant's response message
   */
  async sendMessage(request: SendCoachMessageRequest): Promise<AICoachMessage> {
    const response = await apiClient.post<any>(
      `/api/v1/ai-coach/conversations/${request.conversationId}/messages`,
      { message: request.message },
      {
        timeout: 60000, // 1 minute for AI response
      }
    );

    // Handle wrapped response format (isSuccess/value)
    if (response.data?.isSuccess && response.data.value) {
      return response.data.value;
    }

    return response.data;
  },

  /**
   * Get a conversation by ID
   * @param conversationId The conversation ID
   * @returns The full conversation with messages
   */
  async getConversation(conversationId: string): Promise<AICoachConversation> {
    const response = await apiClient.get<any>(`/api/v1/ai-coach/conversations/${conversationId}`);

    // Handle wrapped response format (isSuccess/value)
    if (response.data?.isSuccess && response.data.value) {
      return response.data.value;
    }

    return response.data;
  },

  /**
   * Get existing conversation for a specific question
   * @param businessPlanId The business plan ID
   * @param questionId The question ID
   * @returns The conversation if exists, null otherwise
   */
  async getConversationByQuestion(
    businessPlanId: string,
    questionId: string
  ): Promise<AICoachConversation | null> {
    try {
      const response = await apiClient.get<any>('/api/v1/ai-coach/conversations/by-question',
        { businessPlanId, questionId }
      );

      // Handle wrapped response format (isSuccess/value)
      if (response.data?.isSuccess) {
        return response.data.value || null;
      }

      return response.data || null;
    } catch (error: any) {
      // 404 means no conversation exists - that's expected
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * Get current token usage for the user
   * @returns Token usage stats
   */
  async getTokenUsage(): Promise<AICoachTokenUsage> {
    const response = await apiClient.get<any>('/api/v1/ai-coach/usage');

    // Handle wrapped response format (isSuccess/value)
    if (response.data?.isSuccess && response.data.value) {
      return response.data.value;
    }

    return response.data;
  },

  /**
   * Check if user has access to AI Coach
   * @returns Access check result
   */
  async checkAccess(): Promise<AICoachAccess> {
    const response = await apiClient.get<any>('/api/v1/ai-coach/access');

    // Handle wrapped response format (isSuccess/value)
    if (response.data?.isSuccess && response.data.value) {
      return response.data.value;
    }

    return response.data;
  },
};

export default aiCoachService;
