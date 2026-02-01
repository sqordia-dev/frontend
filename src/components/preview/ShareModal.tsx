import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Link, Globe, Loader2 } from 'lucide-react';

interface ShareModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Callback to close modal */
  onClose: () => void;
  /** Share URL */
  shareUrl: string | null;
  /** Whether share is being created */
  isLoading?: boolean;
  /** Error message */
  error?: string | null;
}

/**
 * Modal for sharing business plan
 * Shows share link with copy button and success feedback
 */
export default function ShareModal({
  isOpen,
  onClose,
  shareUrl,
  isLoading = false,
  error = null,
}: ShareModalProps) {
  const [isCopied, setIsCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset copied state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setIsCopied(false);
    }
  }, [isOpen]);

  // Handle copy to clipboard
  const handleCopy = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setIsCopied(true);

      // Select the input text
      if (inputRef.current) {
        inputRef.current.select();
      }

      // Reset copied state after 3 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback: select the text
      if (inputRef.current) {
        inputRef.current.select();
        document.execCommand('copy');
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
      }
    }
  };

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-modal-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                <Link className="w-5 h-5 text-orange-600 dark:text-orange-400" aria-hidden="true" />
              </div>
              <h2
                id="share-modal-title"
                className="text-lg font-semibold text-gray-900 dark:text-white"
              >
                Share Business Plan
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-5">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2
                  size={32}
                  className="animate-spin text-orange-500 mb-3"
                  aria-hidden="true"
                />
                <p className="text-gray-600 dark:text-gray-400">
                  Creating share link...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-3">
                  <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-red-600 dark:text-red-400 font-medium mb-2">
                  Failed to create share link
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{error}</p>
              </div>
            ) : shareUrl ? (
              <>
                {/* Share Link Input */}
                <div className="mb-4">
                  <label
                    htmlFor="share-url"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Share link
                  </label>
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      id="share-url"
                      value={shareUrl}
                      readOnly
                      className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
                      onClick={() => inputRef.current?.select()}
                    />
                    <button
                      onClick={handleCopy}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        isCopied
                          ? 'bg-green-500 text-white focus:ring-green-500'
                          : 'bg-orange-500 hover:bg-orange-600 text-white focus:ring-orange-500'
                      }`}
                      aria-label={isCopied ? 'Copied!' : 'Copy link'}
                    >
                      {isCopied ? (
                        <>
                          <Check size={16} aria-hidden="true" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy size={16} aria-hidden="true" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Info Note */}
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <Globe
                    size={18}
                    className="text-gray-400 dark:text-gray-500 flex-shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Anyone with this link can view your business plan. The link provides
                    read-only access.
                  </p>
                </div>

                {/* Copy Success Toast */}
                <AnimatePresence>
                  {isCopied && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-4 flex items-center justify-center gap-2 text-green-600 dark:text-green-400"
                    >
                      <Check size={16} aria-hidden="true" />
                      <span className="text-sm font-medium">Link copied to clipboard!</span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            ) : null}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <button
              onClick={onClose}
              className="w-full px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
