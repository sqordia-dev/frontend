import { Link } from 'react-router-dom';

type Language = 'en' | 'fr';

interface CmsHeaderProps {
  versionNumber: number;
  lastSaved: string | null;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onPublish: () => void;
  isPublishing: boolean;
  isDirty: boolean;
  onOpenVersionHistory: () => void;
  onOpenSchedule: () => void;
  onOpenMobileMenu: () => void;
}

export function CmsHeader({
  versionNumber,
  lastSaved,
  language,
  onLanguageChange,
  onPublish,
  isPublishing,
  isDirty,
  onOpenVersionHistory,
  onOpenSchedule,
  onOpenMobileMenu,
}: CmsHeaderProps) {
  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 shrink-0 z-20">
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Back to Dashboard */}
        <Link
          to="/dashboard"
          className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors hidden lg:flex"
          title="Back to Dashboard"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>

        {/* Mobile menu button */}
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#FF6B00] rounded-lg flex items-center justify-center shadow-sm shadow-orange-200">
            <span className="text-white font-bold text-lg">S</span>
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-800 hidden sm:block">Sqordia</span>
        </div>

        <div className="hidden md:block h-6 w-px bg-gray-200" />

        {/* Search and status */}
        <div className="hidden md:flex items-center gap-4">
          <div className="relative group">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">search</span>
            <input
              type="text"
              placeholder="Search content..."
              className="w-64 bg-gray-50 border border-gray-100 rounded-lg text-sm pl-10 pr-4 h-9 focus:ring-2 focus:ring-orange-100 focus:border-[#FF6B00] transition-all outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="bg-orange-50 text-[#FF6B00] text-xs font-semibold px-2.5 py-1 rounded-md border border-orange-100">
              Draft v{versionNumber}
            </span>
            {lastSaved && (
              <span className="text-slate-400 text-xs">{lastSaved}</span>
            )}
            {isDirty && (
              <span className="text-amber-500 text-xs font-medium">Unsaved changes</span>
            )}
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-5">
        {/* Version History button */}
        <button
          onClick={onOpenVersionHistory}
          className="p-2 text-slate-400 hover:text-slate-600 transition-colors hidden sm:block"
          title="Version History"
        >
          <span className="material-symbols-outlined">history</span>
        </button>

        {/* Schedule button */}
        <button
          onClick={onOpenSchedule}
          className="p-2 text-slate-400 hover:text-slate-600 transition-colors hidden sm:block"
          title="Schedule Publication"
        >
          <span className="material-symbols-outlined">schedule</span>
        </button>

        {/* Language toggle */}
        <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg p-0.5">
          <button
            onClick={() => onLanguageChange('en')}
            className={`px-3.5 py-1 text-[11px] font-bold rounded-md transition-all ${
              language === 'en'
                ? 'bg-white shadow-sm text-[#FF6B00] border border-orange-100'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => onLanguageChange('fr')}
            className={`px-3.5 py-1 text-[11px] font-semibold rounded-md transition-all ${
              language === 'fr'
                ? 'bg-white shadow-sm text-[#FF6B00] border border-orange-100'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            FR
          </button>
        </div>

        {/* Publish button */}
        <button
          onClick={onPublish}
          disabled={isPublishing}
          className="bg-[#FF6B00] hover:bg-orange-600 text-white px-5 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPublishing ? 'Publishing...' : 'Publish Changes'}
        </button>
      </div>
    </header>
  );
}
