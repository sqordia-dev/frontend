import { X, Download, FileText, Printer, Share2 } from 'lucide-react';
import { useEffect } from 'react';

interface TemplateViewerProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string;
  title: string;
}

export default function TemplateViewer({ isOpen, onClose, pdfUrl, title }: TemplateViewerProps) {
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full h-full max-w-7xl mx-auto p-4 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 bg-white dark:bg-gray-800 rounded-t-2xl px-6 py-4 shadow-xl">
          <div className="flex items-center gap-3">
            <FileText className="text-blue-600" size={24} />
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open(pdfUrl, '_blank')}
              className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Download PDF"
            >
              <Download size={20} />
            </button>
            <button
              className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Print"
            >
              <Printer size={20} />
            </button>
            <button
              className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Share"
            >
              <Share2 size={20} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-700 dark:text-gray-300 hover:bg-red-100 dark:hover:bg-red-900/20 hover:text-red-600 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-b-2xl shadow-xl overflow-hidden">
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
