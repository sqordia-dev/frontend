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
  const doneRef = useRef(false);
  const messagesRef = useRef<AdminAIMessage[]>([]);
  const streamingRef = useRef(false);
  const { startStream, stopStream } = useSSEStream();

  // Keep ref in sync with state
  messagesRef.current = state.messages;

  const sendMessage = useCallback(async (userMessage: string) => {
    // Prevent double invocations
    if (streamingRef.current) return;
    streamingRef.current = true;

    const userMsg: AdminAIMessage = { role: 'user', content: userMessage };
    const allMessages = [...messagesRef.current, userMsg];
    streamingContentRef.current = '';
    doneRef.current = false;

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMsg, { role: 'assistant', content: '' }],
      isStreaming: true,
      activeToolCalls: [],
      error: null,
    }));

    await startStream<AdminAIStreamEvent>({
      url: '/api/v1/admin/ai-assistant/stream',
      body: { messages: allMessages },
      onChunk: (event) => {
        if (doneRef.current) return;

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
            doneRef.current = true;
            streamingRef.current = false;
            setState(prev => ({ ...prev, error: event.error || 'Unknown error', isStreaming: false }));
            stopStream();
            break;
          case 'done':
            doneRef.current = true;
            streamingRef.current = false;
            setState(prev => ({ ...prev, isStreaming: false, activeToolCalls: [] }));
            stopStream();
            break;
        }
      },
      onDone: () => {
        if (!doneRef.current) {
          doneRef.current = true;
          streamingRef.current = false;
          setState(prev => ({ ...prev, isStreaming: false, activeToolCalls: [] }));
        }
      },
      onError: (error) => {
        if (!doneRef.current) {
          doneRef.current = true;
          streamingRef.current = false;
          setState(prev => ({ ...prev, error, isStreaming: false }));
        }
      },
    });

    streamingRef.current = false;
  }, [startStream, stopStream]);

  const clearConversation = useCallback(() => {
    stopStream();
    streamingRef.current = false;
    setState({ messages: [], isStreaming: false, activeToolCalls: [], error: null });
  }, [stopStream]);

  return {
    ...state,
    sendMessage,
    clearConversation,
    stopStream,
  };
}
