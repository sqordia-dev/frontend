import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, MessageSquare, X, Send, Loader2 } from 'lucide-react';
import { apiClient } from '../lib/api-client';

interface AIActionMenuProps {
  text: string;
  context?: string;
  language?: 'en' | 'fr';
  onPolished: (polishedText: string) => void;
  disabled?: boolean;
}

export default function AIActionMenu({
  text,
  context,
  language = 'en',
  onPolished,
  disabled = false
}: AIActionMenuProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  const [customPrompt, setCustomPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleQuickPolish = async () => {
    if (!text.trim() || text.trim().length < 10 || disabled) return;

    setLoading(true);
    setError(null);
    setShowMenu(false);

    try {
      const response = await apiClient.post('/api/v1/ai/polish-answer', {
        questionId: '',
        answer: text.trim(),
        context: context || '',
        persona: 'Entrepreneur',
        location: {},
        language
      });

      const data = (response.data as any)?.value || response.data;
      if (data && typeof data === 'object' && 'polishedText' in data) {
        onPolished(data.polishedText);
      }
    } catch (err: any) {
      console.error('AI polish error:', err);
      setError(err.response?.data?.message || 'Failed to polish text. Please try again.');
      setShowMenu(true); // Reopen menu to show error
    } finally {
      setLoading(false);
    }
  };

  const handleCustomPrompt = async () => {
    if (!customPrompt.trim() || !text.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // Use the polish endpoint with custom instructions
      // If backend supports custom prompts, use that endpoint; otherwise use polish with instructions
      const response = await apiClient.post('/api/v1/ai/polish-text', {
        text: text.trim(),
        context: context || '',
        language,
        tone: 'professional',
        customInstructions: customPrompt.trim() // Add custom instructions
      });

      // Handle the Result wrapper format from backend
      let resultText: string | null = null;
      const responseData: any = response.data;
      
      if (responseData) {
        if (responseData.value?.polishedText) {
          resultText = responseData.value.polishedText;
        } else if (responseData.polishedText) {
          resultText = responseData.polishedText;
        } else if (responseData.result) {
          resultText = responseData.result;
        } else if (typeof responseData === 'string') {
          resultText = responseData;
        }
      }
      
      if (resultText) {
        onPolished(resultText);
        setShowCustomPrompt(false);
        setShowMenu(false);
        setCustomPrompt('');
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err: any) {
      console.error('Custom prompt error:', err);
      setError(err.response?.data?.message || 'Failed to process custom prompt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showCustomPrompt) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [showCustomPrompt]);

  const handleCloseCustomPrompt = () => {
    setShowCustomPrompt(false);
    setCustomPrompt('');
    setError(null);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCloseCustomPrompt();
    }
  };

  if (showCustomPrompt) {
    const modalContent = (
      <div 
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black bg-opacity-50 animate-in fade-in duration-200"
        onClick={handleBackdropClick}
      >
        <div 
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-lg w-full max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare size={20} style={{ color: '#FF6B00' }} />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Custom AI Prompt
              </h3>
            </div>
            <button
              onClick={handleCloseCustomPrompt}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* User's Original Text */}
            <div className="flex justify-end">
              <div className="max-w-[80%] bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-2">
                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {text}
                </p>
              </div>
            </div>

            {/* Instructions */}
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-blue-50 dark:bg-blue-900/20 rounded-2xl px-4 py-2">
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  What would you like me to do with this text? For example:
                </p>
                <ul className="text-xs text-gray-600 dark:text-gray-400 mt-2 list-disc list-inside space-y-1">
                  <li>"Make it more professional"</li>
                  <li>"Expand this section"</li>
                  <li>"Add industry-specific details"</li>
                  <li>"Simplify for clarity"</li>
                </ul>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-end gap-2">
              <textarea
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe what you'd like me to do..."
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                rows={2}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !loading) {
                    e.preventDefault();
                    handleCustomPrompt();
                  }
                }}
              />
              <button
                onClick={handleCustomPrompt}
                disabled={!customPrompt.trim() || loading}
                className="p-3 rounded-xl text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#FF6B00' }}
              >
                {loading ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Send size={20} />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );

    return createPortal(modalContent, document.body);
  }

  if (showMenu) {
    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-40"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(false);
          }}
        />

        {/* Menu */}
        <div 
          className="absolute bottom-full right-0 mb-2 z-50"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden min-w-[200px]">
            {/* Quick Polish Option */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleQuickPolish();
              }}
              disabled={disabled || loading || !text.trim() || text.trim().length < 10}
              className={`
                w-full px-4 py-3 flex items-center gap-3
                text-left transition-colors
                ${disabled || !text.trim() || text.trim().length < 10
                  ? 'opacity-50 cursor-not-allowed text-gray-400'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                }
              `}
            >
              <Sparkles size={18} style={{ color: '#FF6B00' }} />
              <div className="flex-1">
                <div className="font-medium text-sm">Polish Text</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Make it professional
                </div>
              </div>
            </button>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-gray-700" />

            {/* Custom Prompt Option */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(false);
                setShowCustomPrompt(true);
              }}
              disabled={disabled || !text.trim()}
              className={`
                w-full px-4 py-3 flex items-center gap-3
                text-left transition-colors
                ${disabled || !text.trim()
                  ? 'opacity-50 cursor-not-allowed text-gray-400'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100'
                }
              `}
            >
              <MessageSquare size={18} style={{ color: '#FF6B00' }} />
              <div className="flex-1">
                <div className="font-medium text-sm">Custom Prompt</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Specify what to do
                </div>
              </div>
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        setShowMenu(true);
      }}
      disabled={disabled || !text.trim()}
      className={`
        p-2 rounded-full transition-all
        flex items-center justify-center
        ${disabled || !text.trim()
          ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800'
          : 'hover:bg-orange-50 dark:hover:bg-orange-900/20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
        }
      `}
      title="AI Actions"
      style={{ width: '36px', height: '36px' }}
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" style={{ color: '#FF6B00' }} />
      ) : (
        <Sparkles size={18} style={{ color: '#FF6B00' }} />
      )}
    </button>
  );
}
