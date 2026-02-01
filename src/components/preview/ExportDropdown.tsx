import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, FileText, FileType, Loader2, Download } from 'lucide-react';
import { ExportFormat } from '../../types/preview';

interface ExportDropdownProps {
  /** Callback when export is triggered */
  onExport: (format: ExportFormat) => Promise<void>;
  /** Whether export is in progress */
  isExporting?: boolean;
  /** Currently exporting format */
  exportingFormat?: ExportFormat | null;
  /** Button variant */
  variant?: 'default' | 'primary';
  /** Size variant */
  size?: 'sm' | 'md';
}

const EXPORT_OPTIONS: { format: ExportFormat; label: string; icon: React.ReactNode }[] = [
  { format: 'pdf', label: 'Export as PDF', icon: <FileText size={16} /> },
  { format: 'docx', label: 'Export as Word', icon: <FileType size={16} /> },
];

/**
 * Dropdown menu for exporting business plan
 * Supports PDF and DOCX formats with loading states
 */
export default function ExportDropdown({
  onExport,
  isExporting = false,
  exportingFormat = null,
  variant = 'default',
  size = 'md',
}: ExportDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle export selection
  const handleExport = async (format: ExportFormat) => {
    setIsOpen(false);
    await onExport(format);
  };

  // Button styles based on variant and size
  const buttonStyles =
    variant === 'primary'
      ? 'bg-orange-500 hover:bg-orange-600 text-white'
      : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600';

  const sizeStyles = size === 'sm' ? 'px-3 py-1.5 text-sm' : 'px-4 py-2';

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isExporting}
        className={`flex items-center gap-2 ${buttonStyles} ${sizeStyles} rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2`}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Export options"
      >
        {isExporting ? (
          <Loader2 size={size === 'sm' ? 14 : 16} className="animate-spin" aria-hidden="true" />
        ) : (
          <Download size={size === 'sm' ? 14 : 16} aria-hidden="true" />
        )}
        {isExporting ? 'Exporting...' : 'Export'}
        <ChevronDown
          size={size === 'sm' ? 12 : 14}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
            role="menu"
            aria-orientation="vertical"
          >
            {EXPORT_OPTIONS.map((option) => (
              <button
                key={option.format}
                onClick={() => handleExport(option.format)}
                disabled={isExporting}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                role="menuitem"
              >
                {isExporting && exportingFormat === option.format ? (
                  <Loader2 size={16} className="animate-spin text-orange-500" />
                ) : (
                  <span className="text-gray-400 dark:text-gray-500">{option.icon}</span>
                )}
                <span className="text-sm font-medium">{option.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
