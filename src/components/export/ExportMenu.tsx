import { Download, FileText, FileType, Loader2, Lock, Presentation } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useCurrentOrganizationId } from '../../hooks/useCurrentOrganizationId';
import { usePlanFeatures } from '../../hooks/usePlanFeatures';
import { PlanFeatures } from '../../lib/plan-features-service';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export type ExportFormat = 'pdf' | 'word' | 'powerpoint';

interface ExportMenuProps {
  onExport: (format: ExportFormat) => Promise<void>;
  isExporting?: boolean;
  exportingFormat?: ExportFormat | null;
  className?: string;
  variant?: 'primary' | 'secondary';
}

const FORMAT_FEATURE_MAP: Record<ExportFormat, string> = {
  pdf: PlanFeatures.ExportPdf,
  word: PlanFeatures.ExportWord,
  powerpoint: PlanFeatures.ExportPowerpoint,
};

export function ExportMenu({
  onExport,
  isExporting = false,
  exportingFormat = null,
  className = '',
  variant = 'primary',
}: ExportMenuProps) {
  const { t, language } = useTheme();
  const orgId = useCurrentOrganizationId();
  const { isEnabled, isLoading: featuresLoading } = usePlanFeatures(orgId);

  const handleExport = async (format: ExportFormat) => {
    await onExport(format);
  };

  const upgradeLabel = language === 'fr' ? 'Passez au niveau supérieur' : 'Upgrade to unlock';

  const renderItem = (
    format: ExportFormat,
    icon: React.ReactNode,
    label: string,
    description: string,
  ) => {
    const featureKey = FORMAT_FEATURE_MAP[format];
    const locked = !featuresLoading && orgId && !isEnabled(featureKey);

    return (
      <DropdownMenuItem
        key={format}
        onClick={() => !locked && handleExport(format)}
        disabled={isExporting || !!locked}
        className={`flex items-center gap-3 py-3 cursor-pointer ${locked ? 'opacity-60' : ''}`}
      >
        {exportingFormat === format ? (
          <Loader2 size={18} className="animate-spin text-slate-400" />
        ) : locked ? (
          <Lock size={18} className="text-slate-400" />
        ) : (
          icon
        )}
        <div className="flex-1">
          <p className="font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">
            {locked ? upgradeLabel : description}
          </p>
        </div>
      </DropdownMenuItem>
    );
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
        {renderItem(
          'pdf',
          <FileText size={18} className="text-red-500" />,
          t('export.exportAsPdf'),
          t('export.pdfDescription'),
        )}
        {renderItem(
          'word',
          <FileType size={18} className="text-blue-500" />,
          t('export.exportAsWord'),
          t('export.wordDescription'),
        )}
        {renderItem(
          'powerpoint',
          <Presentation size={18} className="text-orange-500" />,
          t('export.exportAsPowerpoint') || 'Export as PowerPoint',
          t('export.powerpointDescription') || 'Presentation slides',
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
