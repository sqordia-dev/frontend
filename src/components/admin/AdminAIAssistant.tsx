import { useState, useRef, useEffect, useMemo, FormEvent } from 'react';
import { Bot, X, Send, Trash2, Loader2, Maximize2, Minimize2, Brain, Database, Search } from 'lucide-react';
import { marked } from 'marked';
import { useAdminAIAssistant } from '../../hooks/useAdminAIAssistant';

// Configure marked for GFM tables
marked.setOptions({ gfm: true, breaks: true });

const EXAMPLE_PROMPTS = [
  'How many users signed up this week?',
  'Show me the top 5 organizations by member count',
  'What is the current system health status?',
  'Give me an overview of AI usage this month',
];

/** Tool call display config */
const TOOL_LABELS: Record<string, { label: string; icon: 'search' | 'database' | 'brain' }> = {
  query_system_overview: { label: 'Querying system overview', icon: 'database' },
  query_users: { label: 'Searching users', icon: 'search' },
  query_organizations: { label: 'Searching organizations', icon: 'search' },
  query_business_plans: { label: 'Searching business plans', icon: 'search' },
  query_ai_usage: { label: 'Checking AI usage', icon: 'database' },
  query_system_health: { label: 'Checking system health', icon: 'database' },
};

const ToolIcon = ({ type }: { type: 'search' | 'database' | 'brain' }) => {
  const cls = 'h-3 w-3 shrink-0';
  if (type === 'search') return <Search className={cls} />;
  if (type === 'database') return <Database className={cls} />;
  return <Brain className={cls} />;
};

/** Parse markdown, memoised per content string */
function useRenderedMarkdown(content: string) {
  return useMemo(() => {
    if (!content) return '';
    return marked.parse(content) as string;
  }, [content]);
}

/** Thinking / processing indicator shown before tokens arrive */
function ThinkingIndicator({ toolCalls }: { toolCalls: string[] }) {
  const activeTool = toolCalls.length > 0 ? toolCalls[toolCalls.length - 1] : null;
  const toolInfo = activeTool ? TOOL_LABELS[activeTool] : null;

  return (
    <div className="flex justify-start">
      <div className="rounded-lg px-3 py-2.5 text-sm bg-gray-100 dark:bg-gray-700 max-w-[92%]">
        <div className="flex items-center gap-2.5">
          {/* Animated dots */}
          <div className="flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-momentum-orange animate-[ai-thinking-dot_1.4s_ease-in-out_infinite]" />
            <span className="h-1.5 w-1.5 rounded-full bg-momentum-orange animate-[ai-thinking-dot_1.4s_ease-in-out_0.2s_infinite]" />
            <span className="h-1.5 w-1.5 rounded-full bg-momentum-orange animate-[ai-thinking-dot_1.4s_ease-in-out_0.4s_infinite]" />
          </div>
          {/* Status text */}
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {toolInfo ? (
              <span className="flex items-center gap-1.5">
                <ToolIcon type={toolInfo.icon} />
                {toolInfo.label}...
              </span>
            ) : (
              'Analyzing your request...'
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Single assistant message bubble with rich rendering */
function AssistantBubble({
  content,
  isLast,
  isStreaming,
  isFullScreen,
  toolCalls,
}: {
  content: string;
  isLast: boolean;
  isStreaming: boolean;
  isFullScreen: boolean;
  toolCalls: string[];
}) {
  const html = useRenderedMarkdown(content);
  const isEmpty = !content.trim();

  // Show thinking indicator if this is the last message, streaming, and no content yet
  if (isEmpty && isLast && isStreaming) {
    return <ThinkingIndicator toolCalls={toolCalls} />;
  }

  // Don't render empty non-streaming bubbles
  if (isEmpty && !isStreaming) return null;

  return (
    <div className="flex justify-start w-full">
      <div className="w-full rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 overflow-hidden">
        <div
          className="ai-chat-content prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
          dangerouslySetInnerHTML={{ __html: html }}
        />
        {isStreaming && isLast && (
          <span className="inline-block animate-pulse text-momentum-orange ml-0.5">&#9646;</span>
        )}
      </div>
    </div>
  );
}

export function AdminAIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { messages, isStreaming, activeToolCalls, error, sendMessage, clearConversation } = useAdminAIAssistant();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeToolCalls]);

  // Focus input when opening or toggling fullscreen
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen, isFullScreen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const msg = input.trim();
    if (!msg || isStreaming) return;
    setInput('');
    await sendMessage(msg);
  };

  const handleExampleClick = async (prompt: string) => {
    if (isStreaming) return;
    await sendMessage(prompt);
  };

  const toolCallLabel = (name: string) => {
    const info = TOOL_LABELS[name];
    return info ? `${info.label}...` : `Running ${name}...`;
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsFullScreen(false);
  };

  // Panel size classes
  const panelClasses = isFullScreen
    ? 'fixed inset-4 z-50 flex flex-col rounded-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800'
    : 'fixed bottom-6 right-6 z-50 flex w-[420px] flex-col rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-800';

  const panelStyle = isFullScreen ? undefined : { height: '580px' };

  return (
    <>
      {/* Floating trigger button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-momentum-orange text-white shadow-lg transition-transform hover:scale-110 hover:bg-[#e55f00] hover:shadow-xl"
          aria-label="Open AI Assistant"
        >
          <Bot className="h-6 w-6" />
        </button>
      )}

      {/* Backdrop for fullscreen */}
      {isOpen && isFullScreen && (
        <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={handleClose} />
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className={panelClasses} style={panelStyle}>
          {/* Header */}
          <div className={`flex items-center justify-between border-b border-orange-600 bg-momentum-orange px-4 py-3 ${isFullScreen ? 'rounded-t-2xl' : 'rounded-t-xl'}`}>
            <div className="flex items-center gap-2 text-white">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
                <Bot className="h-4 w-4" />
              </div>
              <span className="font-semibold">Admin AI Assistant</span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={clearConversation} className="rounded p-1 text-white/70 hover:bg-white/10 hover:text-white" title="Clear conversation">
                <Trash2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsFullScreen(prev => !prev)}
                className="rounded p-1 text-white/70 hover:bg-white/10 hover:text-white"
                title={isFullScreen ? 'Exit full screen' : 'Full screen'}
              >
                {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
              <button onClick={handleClose} className="rounded p-1 text-white/70 hover:bg-white/10 hover:text-white" title="Close">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages area */}
          <div className={`flex-1 overflow-y-auto px-4 py-3 space-y-3 ${isFullScreen ? 'px-8 py-6 space-y-4' : ''}`}>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-momentum-orange text-white mb-3">
                  <Bot className="h-6 w-6" />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Ask me about your system data</p>
                <div className={`space-y-2 ${isFullScreen ? 'grid grid-cols-2 gap-3 space-y-0 max-w-2xl' : 'w-full'}`}>
                  {EXAMPLE_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      onClick={() => handleExampleClick(prompt)}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-left text-xs text-gray-600 transition-colors hover:border-momentum-orange/40 hover:bg-orange-50 dark:border-gray-600 dark:text-gray-300 dark:hover:border-momentum-orange/40 dark:hover:bg-orange-900/10"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) =>
              msg.role === 'user' ? (
                <div key={i} className="flex justify-end">
                  <div className="max-w-[85%] rounded-lg px-3 py-2 text-sm bg-momentum-orange text-white">
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ) : (
                <AssistantBubble
                  key={i}
                  content={msg.content}
                  isLast={i === messages.length - 1}
                  isStreaming={isStreaming}
                  isFullScreen={isFullScreen}
                  toolCalls={activeToolCalls}
                />
              ),
            )}

            {/* Tool call indicator — shown when content is already streaming but a new tool call fires */}
            {activeToolCalls.length > 0 && messages.length > 0 && messages[messages.length - 1].content.trim() !== '' && (
              <div className="flex items-center gap-2 rounded-lg bg-orange-50 dark:bg-orange-900/10 px-3 py-2 text-xs text-momentum-orange">
                <Loader2 className="h-3 w-3 animate-spin shrink-0" />
                <span className="font-medium">{toolCallLabel(activeToolCalls[activeToolCalls.length - 1])}</span>
              </div>
            )}

            {error && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {error}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <form onSubmit={handleSubmit} className={`flex items-center gap-2 border-t border-gray-200 px-4 py-3 dark:border-gray-700 ${isFullScreen ? 'px-8 py-4' : ''}`}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about system data..."
              className={`flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-momentum-orange focus:ring-1 focus:ring-momentum-orange dark:border-gray-600 dark:bg-gray-700 dark:text-white ${isFullScreen ? 'py-3 text-base' : ''}`}
              disabled={isStreaming}
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className={`flex items-center justify-center rounded-lg bg-momentum-orange text-white transition-colors hover:bg-[#e55f00] disabled:opacity-50 ${isFullScreen ? 'h-11 w-11' : 'h-9 w-9'}`}
            >
              {isStreaming ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
