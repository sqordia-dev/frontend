import { useState, useCallback, useRef } from 'react';
import { useSSEStream } from './useSSEStream';
import type { AdminAIMessage, AdminAIStreamEvent, AdminAIAssistantState } from '../types/admin-ai-assistant';

export function useAdminAIAssistant() {
  const [state, setState] = useState<AdminAIAssistantState>({
    messages: [],
    isStreaming: false,
    activeToolCalls: [],
    error: null,
  });

  const streamingContentRef = useRef('');
  const { startStream, stopStream } = useSSEStream();

  const sendMessage = useCallback(async (userMessage: string) => {
    const userMsg: AdminAIMessage = { role: 'user', content: userMessage };
    streamingContentRef.current = '';

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMsg, { role: 'assistant', content: '' }],
      isStreaming: true,
      activeToolCalls: [],
      error: null,
    }));

    const allMessages = [...state.messages, userMsg];

    await startStream<AdminAIStreamEvent>({
      url: '/api/v1/admin/ai-assistant/stream',
      body: { messages: allMessages },
      onChunk: (event) => {
        switch (event.type) {
          case 'token':
            streamingContentRef.current += event.content || '';
            setState(prev => {
              const msgs = [...prev.messages];
              msgs[msgs.length - 1] = { role: 'assistant', content: streamingContentRef.current };
              return { ...prev, messages: msgs };
            });
            break;
          case 'tool_start':
            setState(prev => ({
              ...prev,
              activeToolCalls: [...prev.activeToolCalls, event.toolName || ''],
            }));
            break;
          case 'tool_end':
            setState(prev => ({
              ...prev,
              activeToolCalls: prev.activeToolCalls.filter(t => t !== event.toolName),
            }));
            break;
          case 'error':
            setState(prev => ({ ...prev, error: event.error || 'Unknown error', isStreaming: false }));
            break;
          case 'done':
            setState(prev => ({ ...prev, isStreaming: false, activeToolCalls: [] }));
            break;
        }
      },
      onDone: () => {
        setState(prev => ({ ...prev, isStreaming: false, activeToolCalls: [] }));
      },
      onError: (error) => {
        setState(prev => ({ ...prev, error, isStreaming: false }));
      },
    });
  }, [state.messages, startStream]);

  const clearConversation = useCallback(() => {
    stopStream();
    setState({ messages: [], isStreaming: false, activeToolCalls: [], error: null });
  }, [stopStream]);

  return {
    ...state,
    sendMessage,
    clearConversation,
    stopStream,
  };
}
