import { ArrowLeft, Monitor, Tablet, Smartphone, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CmsLanguageToggle from '../CmsLanguageToggle';

export type DeviceSize = 'desktop' | 'tablet' | 'mobile';

interface CmsPreviewToolbarProps {
  versionNumber: number;
  deviceSize: DeviceSize;
  onDeviceSizeChange: (size: DeviceSize) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
}

const deviceButtons: { size: DeviceSize; icon: typeof Monitor; label: string }[] = [
  { size: 'desktop', icon: Monitor, label: 'Desktop' },
  { size: 'tablet', icon: Tablet, label: 'Tablet' },
  { size: 'mobile', icon: Smartphone, label: 'Mobile' },
];

export default function CmsPreviewToolbar({
  versionNumber,
  deviceSize,
  onDeviceSizeChange,
  language,
  onLanguageChange,
}: CmsPreviewToolbarProps) {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-2.5">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Back + Version badge */}
        <div className="flex items-center gap-3 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/admin/cms')}
            className="gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Editor</span>
          </Button>

          <Badge variant="warning">
            Preview: Draft v{versionNumber}
          </Badge>
        </div>

        {/* Center: Device size toggles */}
        <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
          {deviceButtons.map(({ size, icon: Icon, label }) => (
            <button
              key={size}
              type="button"
              onClick={() => onDeviceSizeChange(size)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                deviceSize === size
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              aria-label={label}
              title={label}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden md:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Right: Language + Open in New Tab */}
        <div className="flex items-center gap-2">
          <CmsLanguageToggle
            value={language}
            onChange={onLanguageChange}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open('/?preview=draft', '_blank')}
            className="gap-1.5"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="hidden sm:inline">New Tab</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
