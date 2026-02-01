import { useState, useRef, useEffect } from 'react';
import { Download, FileText, FileType, ChevronDown, Loader2 } from 'lucide-react';

export type ExportFormat = 'pdf' | 'word';

interface ExportMenuProps {
  /** Callback when export is requested */
  onExport: (format: ExportFormat) => Promise<void>;
  /** Whether export is currently in progress */
  isExporting?: boolean;
  /** Current export format being processed */
  exportingFormat?: ExportFormat | null;
  /** Optional className */
  className?: string;
  /** Button variant */
  variant?: 'primary' | 'secondary';
}

/**
 * ExportMenu - Dropdown menu for export options
 */
export function ExportMenu({
  onExport,
  isExporting = false,
  exportingFormat = null,
  className = '',
  variant = 'primary',
}: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleExport = async (format: ExportFormat) => {
    setIsOpen(false);
    await onExport(format);
  };

  const buttonBaseClasses = variant === 'primary'
    ? 'bg-momentum-orange hover:bg-orange-600 text-white'
    : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600';

  return (
    <div ref={menuRef} className={`relative inline-block ${className}`}>
      {/* Export Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className={`
          flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors
          disabled:opacity-50 disabled:cursor-not-allowed
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-momentum-orange
          ${buttonBaseClasses}
        `}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {isExporting ? (
          <Loader2 size={18} className="animate-spin" aria-hidden="true" />
        ) : (
          <Download size={18} aria-hidden="true" />
        )}
        <span>{isExporting ? 'Exporting...' : 'Export'}</span>
        <ChevronDown
          size={16}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
          role="menu"
          aria-orientation="vertical"
        >
          {/* PDF Option */}
          <button
            onClick={() => handleExport('pdf')}
            disabled={isExporting}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            role="menuitem"
          >
            {exportingFormat === 'pdf' ? (
              <Loader2 size={18} className="animate-spin text-red-500" />
            ) : (
              <FileText size={18} className="text-red-500" aria-hidden="true" />
            )}
            <div>
              <p className="font-medium">Export as PDF</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Professional document format
              </p>
            </div>
          </button>

          {/* Word Option */}
          <button
            onClick={() => handleExport('word')}
            disabled={isExporting}
            className="w-full flex items-center gap-3 px-4 py-3 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            role="menuitem"
          >
            {exportingFormat === 'word' ? (
              <Loader2 size={18} className="animate-spin text-blue-500" />
            ) : (
              <FileType size={18} className="text-blue-500" aria-hidden="true" />
            )}
            <div>
              <p className="font-medium">Export as Word</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Editable .docx format
              </p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
