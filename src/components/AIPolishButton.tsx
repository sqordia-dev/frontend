import { useState } from 'react';
import { Sparkles, Loader2, Check, X } from 'lucide-react';
import { apiClient } from '../lib/api-client';

interface AIPolishButtonProps {
  text: string;
  onPolished: (polishedText: string) => void;
  context?: string;
  disabled?: boolean;
}

export default function AIPolishButton({ 
  text, 
  onPolished, 
  context,
  disabled = false 
}: AIPolishButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [polishedText, setPolishedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePolish = async () => {
    const trimmedText = text.trim();
    
    // Validate minimum length (backend requires at least 10 characters)
    if (!trimmedText || trimmedText.length < 10) {
      setError('Text must be at least 10 characters long to polish.');
      return;
    }

    if (loading || disabled) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.post('/api/v1/ai/polish-text', {
        text: trimmedText,  // camelCase to match JSON serialization policy
        context: context || undefined,
        language: 'en',  // Default to English, can be made configurable
        tone: 'professional'  // Default tone
      });

      // Handle the Result wrapper format from backend
      let polishedTextValue: string | null = null;
      
      if (response.data) {
        // Check if it's wrapped in a Result object (backend returns Result<PolishedTextResponse>)
        if (response.data.value && response.data.value.polishedText) {
          polishedTextValue = response.data.value.polishedText;
        } 
        // Check if it's a direct PolishedTextResponse
        else if (response.data.polishedText) {
          polishedTextValue = response.data.polishedText;
        }
        // Check if it's just a string (fallback)
        else if (typeof response.data === 'string') {
          polishedTextValue = response.data;
        }
      }
      
      if (polishedTextValue) {
        setPolishedText(polishedTextValue);
        setShowPreview(true);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err: any) {
      console.error('AI polish error:', err);
      
      // Extract error message from various possible formats
      let errorMessage = 'Failed to polish text. Please try again.';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        errorMessage = errorData.message || 
                      errorData.errorMessage || 
                      (errorData.errors && Object.values(errorData.errors).flat().join(', ')) ||
                      errorMessage;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = () => {
    if (polishedText) {
      onPolished(polishedText);
      setShowPreview(false);
      setPolishedText(null);
    }
  };

  const handleReject = () => {
    setShowPreview(false);
    setPolishedText(null);
  };

  return (
    <>
      <button
        onClick={handlePolish}
        disabled={loading || disabled || !text.trim() || text.trim().length < 10}
        className={`
          p-2 rounded-lg transition-all
          ${loading || disabled || !text.trim() || text.trim().length < 10
            ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800'
            : 'hover:bg-orange-50 dark:hover:bg-orange-900/20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
          }
        `}
        title={text.trim().length < 10 ? "Text must be at least 10 characters" : "Polish with AI"}
      >
        {loading ? (
          <Loader2 size={18} className="animate-spin" style={{ color: '#FF6B00' }} />
        ) : (
          <Sparkles size={18} style={{ color: '#FF6B00' }} />
        )}
      </button>

      {/* Preview Modal */}
      {showPreview && polishedText && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-bold mb-2">AI Polished Text</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Review the polished version below. Click "Accept" to use it or "Reject" to keep your original.
              </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-2 gap-6">
              {/* Original */}
              <div>
                <h4 className="text-sm font-semibold mb-2 text-gray-500 dark:text-gray-400">Original</h4>
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-sm whitespace-pre-wrap">{text}</p>
                </div>
              </div>

              {/* Polished */}
              <div>
                <h4 className="text-sm font-semibold mb-2" style={{ color: '#FF6B00' }}>Polished</h4>
                <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border-2" style={{ borderColor: '#FF6B00' }}>
                  <p className="text-sm whitespace-pre-wrap">{polishedText}</p>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="px-6 py-3 bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
              <button
                onClick={handleReject}
                className="px-6 py-2 rounded-lg font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
              >
                <X size={18} className="inline mr-2" />
                Reject
              </button>
              <button
                onClick={handleAccept}
                className="px-6 py-2 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
                style={{ backgroundColor: '#FF6B00' }}
              >
                <Check size={18} className="inline mr-2" />
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
