import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Eye, Rocket, ChevronDown, Trash2, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AutoSaveIndicator, SaveStatus } from '@/components/features/questionnaire/AutoSaveIndicator';
import CmsLanguageToggle from './CmsLanguageToggle';
import { CmsVersionDetail } from '@/lib/cms-types';

interface CmsPageHeaderProps {
  version: CmsVersionDetail | null;
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

export default function CmsPageHeader({
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
}: CmsPageHeaderProps) {
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

  const isDraft = version?.status === 'Draft';

  return (
    <header className="sticky top-0 z-30 h-14 flex items-center bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 gap-4">
      {/* Left: Back + Title */}
      <div className="flex items-center gap-3 min-w-0">
        <Link
          to="/admin"
          className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Back to Admin"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white tracking-tight hidden sm:block">
          Content Manager
        </h1>
      </div>

      {/* Center: Version + Save Status */}
      <div className="flex-1 flex items-center justify-center gap-3">
        {version && (
          <Badge variant={isDraft ? 'warning' : 'success'} className="shrink-0">
            {isDraft ? 'Draft' : 'Published'} v{version.versionNumber}
          </Badge>
        )}
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

        {/* Publish split button */}
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
            <div className="absolute right-0 top-full mt-1.5 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  onVersionHistory();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <History className="w-4 h-4" />
                Version History
              </button>
              <div className="my-1 border-t border-gray-100 dark:border-gray-700" />
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  onDiscard();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Discard Draft
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
