import { useState } from 'react';
import { Rocket, Loader2, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CmsPublishDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (notes: string) => void;
  versionNumber: number;
  blockCount: number;
  isPublishing?: boolean;
}

export default function CmsPublishDialog({
  open,
  onClose,
  onConfirm,
  versionNumber,
  blockCount,
  isPublishing = false,
}: CmsPublishDialogProps) {
  const [notes, setNotes] = useState('');

  if (!open) return null;

  const handleConfirm = () => {
    onConfirm(notes);
    setNotes('');
  };

  const handleClose = () => {
    if (!isPublishing) {
      setNotes('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Dialog */}
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-md mx-4 p-6">
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          disabled={isPublishing}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4">
          <Rocket className="w-6 h-6 text-[#FF6B00]" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Publish Version {versionNumber}?
        </h3>

        {/* Warning */}
        <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg mb-4">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-700 dark:text-amber-300">
            <p>This will replace all live content on the website.</p>
            {versionNumber > 1 && (
              <p className="mt-1">The current published version will be archived.</p>
            )}
          </div>
        </div>

        {/* Block count */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          <span className="font-medium">{blockCount}</span> content block{blockCount !== 1 ? 's' : ''} will be published.
        </p>

        {/* Notes textarea */}
        <div className="mb-6">
          <label
            htmlFor="publish-notes"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
          >
            Version notes (optional)
          </label>
          <textarea
            id="publish-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Describe what changed in this version..."
            disabled={isPublishing}
            rows={3}
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent disabled:opacity-50 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isPublishing}
          >
            Cancel
          </Button>
          <Button
            variant="brand"
            onClick={handleConfirm}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Publishing...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4 mr-1.5" />
                Publish Now
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
