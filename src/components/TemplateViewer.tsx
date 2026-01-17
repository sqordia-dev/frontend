import { X, Download, FileText, Printer, Share2 } from 'lucide-react';
import { useEffect } from 'react';

interface TemplateViewerProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title: string;
}

export default function TemplateViewer({ isOpen, onClose, pdfUrl, title }: TemplateViewerProps) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in p-0 sm:p-4">
      <div className="relative w-full h-full sm:max-w-7xl sm:mx-auto sm:rounded-2xl sm:overflow-hidden flex flex-col bg-white dark:bg-gray-800 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 bg-white dark:bg-gray-800 px-3 sm:px-6 py-3 sm:py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <FileText className="text-blue-600 flex-shrink-0" size={isMobile ? 20 : 24} />
            <h3 className="text-base sm:text-xl font-bold text-gray-900 dark:text-white truncate">{title}</h3>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button
              onClick={() => window.open(pdfUrl, '_blank')}
              className="p-1.5 sm:p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Download PDF"
            >
              <Download size={isMobile ? 18 : 20} />
            </button>
            <button
              className="p-1.5 sm:p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors hidden sm:inline-flex"
              title="Print"
            >
              <Printer size={20} />
            </button>
            <button
              className="p-1.5 sm:p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors hidden sm:inline-flex"
              title="Share"
            >
              <Share2 size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={isMobile ? 18 : 20} />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 bg-white dark:bg-gray-800 overflow-hidden min-h-0">
          <iframe
            src={pdfUrl}
            className="w-full h-full"
            title={title}
          />
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
