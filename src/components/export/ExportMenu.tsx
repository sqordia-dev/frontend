import { Download, FileText, FileType, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export type ExportFormat = 'pdf' | 'word' | 'powerpoint';

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
 * ExportMenu - Dropdown menu for export options using Radix UI
 */
export function ExportMenu({
  onExport,
  isExporting = false,
  exportingFormat = null,
  className = '',
  variant = 'primary',
}: ExportMenuProps) {
  const { t } = useTheme();

  const handleExport = async (format: ExportFormat) => {
    await onExport(format);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          disabled={isExporting}
          className={`
            gap-2 font-medium
            ${variant === 'primary'
              ? 'bg-momentum-orange hover:bg-orange-600 text-white'
              : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600'
            }
            ${className}
          `}
        >
          {isExporting ? (
            <Loader2 size={18} className="animate-spin" aria-hidden="true" />
          ) : (
            <Download size={18} aria-hidden="true" />
          )}
          <span>{isExporting ? t('export.exporting') : t('export.button')}</span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* PDF Option */}
        <DropdownMenuItem
          onClick={() => handleExport('pdf')}
          disabled={isExporting}
          className="flex items-center gap-3 py-3 cursor-pointer"
        >
          {exportingFormat === 'pdf' ? (
            <Loader2 size={18} className="animate-spin text-red-500" />
          ) : (
            <FileText size={18} className="text-red-500" aria-hidden="true" />
          )}
          <div>
            <p className="font-medium">{t('export.exportAsPdf')}</p>
            <p className="text-xs text-muted-foreground">
              {t('export.pdfDescription')}
            </p>
          </div>
        </DropdownMenuItem>

        {/* Word Option */}
        <DropdownMenuItem
          onClick={() => handleExport('word')}
          disabled={isExporting}
          className="flex items-center gap-3 py-3 cursor-pointer"
        >
          {exportingFormat === 'word' ? (
            <Loader2 size={18} className="animate-spin text-blue-500" />
          ) : (
            <FileType size={18} className="text-blue-500" aria-hidden="true" />
          )}
          <div>
            <p className="font-medium">{t('export.exportAsWord')}</p>
            <p className="text-xs text-muted-foreground">
              {t('export.wordDescription')}
            </p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
