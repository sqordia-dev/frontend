import { useState, useRef, useEffect } from 'react';
import { Eye, Rocket, ChevronDown, Trash2, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AutoSaveIndicator, SaveStatus } from '@/components/features/questionnaire/AutoSaveIndicator';
import CmsLanguageToggle from './CmsLanguageToggle';
import { CmsVersionDetail } from '@/lib/cms-types';

interface CmsVersionStatusBarProps {
  version: CmsVersionDetail;
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  language: string;
  onLanguageChange: (lang: string) => void;
  onPreview: () => void;
  onPublish: () => void;
  onDiscard: () => void;
  onVersionHistory: () => void;
  disabled?: boolean;
}

export default function CmsVersionStatusBar({
  version,
  saveStatus,
  lastSaved,
  language,
  onLanguageChange,
  onPreview,
  onPublish,
  onDiscard,
  onVersionHistory,
  disabled = false,
}: CmsVersionStatusBarProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isDraft = version.status === 'Draft';

  return (
    <div className="sticky top-0 z-20 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-2.5">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Version Badge */}
        <div className="flex items-center gap-3 min-w-0">
          <Badge variant={isDraft ? 'warning' : 'success'}>
            {isDraft ? 'Draft' : 'Published'} v{version.versionNumber}
          </Badge>
          <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:inline truncate">
            {version.contentBlockCount} block{version.contentBlockCount !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Center: Auto-save Indicator */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <AutoSaveIndicator
            status={saveStatus}
            lastSaved={lastSaved ?? undefined}
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <CmsLanguageToggle
            value={language}
            onChange={onLanguageChange}
            disabled={disabled}
          />

          <Button
            variant="outline"
            size="sm"
            onClick={onPreview}
            disabled={disabled}
            className="hidden sm:inline-flex"
          >
            <Eye className="w-4 h-4 mr-1.5" />
            Preview
          </Button>

          {/* Publish Split Button Group */}
          <div className="relative flex items-center" ref={dropdownRef}>
            <Button
              variant="brand"
              size="sm"
              onClick={onPublish}
              disabled={disabled}
              className="rounded-r-none"
            >
              <Rocket className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline">Publish</span>
            </Button>
            <Button
              variant="brand"
              size="sm"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              disabled={disabled}
              className="rounded-l-none border-l border-white/20 px-2"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onDiscard();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Discard Draft
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDropdownOpen(false);
                    onVersionHistory();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <History className="w-4 h-4" />
                  Version History
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Auto-save indicator */}
      <div className="md:hidden mt-2">
        <AutoSaveIndicator
          status={saveStatus}
          lastSaved={lastSaved ?? undefined}
        />
      </div>
    </div>
  );
}
