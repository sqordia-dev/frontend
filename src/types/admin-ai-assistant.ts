export interface AdminAIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AdminAIStreamEvent {
  type: 'token' | 'tool_start' | 'tool_end' | 'done' | 'error';
  content?: string;
  toolName?: string;
  error?: string;
}

export interface AdminAIAssistantState {
  messages: AdminAIMessage[];
  isStreaming: boolean;
  activeToolCalls: string[];
  error: string | null;
}
