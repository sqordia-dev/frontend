import { X, ChevronDown, ArrowLeft } from 'lucide-react';
import { CmsPageDefinition } from '../../lib/cms-page-registry';

type Language = 'en' | 'fr';

interface CmsMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  pages: CmsPageDefinition[];
  selectedPageKey: string;
  selectedSectionKey: string;
  expandedPages: Set<string>;
  onPageClick: (pageKey: string) => void;
  onSectionClick: (pageKey: string, sectionKey: string) => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export function CmsMobileDrawer({
  isOpen,
  onClose,
  pages,
  selectedPageKey,
  selectedSectionKey,
  expandedPages,
  onPageClick,
  onSectionClick,
  language,
  onLanguageChange,
}: CmsMobileDrawerProps) {
  // Get icon class for Material Symbols
  const getIconName = (pageKey: string): string => {
    const iconMap: Record<string, string> = {
      landing: 'browser_updated',
      dashboard: 'grid_view',
      profile: 'person',
      questionnaire: 'assignment',
      question_templates: 'help',
      create_plan: 'edit_note',
      subscription: 'credit_card',
      onboarding: 'rocket_launch',
      auth: 'login',
      legal: 'gavel',
      global: 'public',
    };
    return iconMap[pageKey] || 'article';
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-[2px] z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="fixed inset-y-0 left-0 w-full max-w-[300px] bg-white z-50 flex flex-col shadow-xl lg:hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-[19px] tracking-tight text-slate-800">Sqordia</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User card */}
        <div className="px-6 py-4 flex items-center gap-3 border-b border-gray-100">
          <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-gray-200">
            JD
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-medium text-slate-800 truncate">admin@sqordia.com</span>
            <span className="text-[11px] text-slate-500 font-medium uppercase tracking-wider">
              Administrator
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar">
          <div className="space-y-1 px-3">
            {pages.map((page) => {
              const isExpanded = expandedPages.has(page.key);
              const isPageSelected = selectedPageKey === page.key;

              return (
                <div key={page.key}>
                  <button
                    onClick={() => onPageClick(page.key)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-colors ${
                      isPageSelected
                        ? 'bg-orange-50/80 text-[#FF6B00] font-medium'
                        : 'text-slate-500 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-xl">{getIconName(page.key)}</span>
                      <span className="text-sm">{page.label}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : null}
                  </button>

                  {/* Sections */}
                  {isExpanded && (
                    <div className="ml-5 mt-1 border-l border-gray-100 pl-4 space-y-1">
                      {page.sections.map((section) => {
                        const isSectionSelected = selectedSectionKey === section.key;

                        return (
                          <button
                            key={section.key}
                            onClick={() => onSectionClick(page.key, section.key)}
                            className={`w-full text-left py-2 text-sm transition-colors ${
                              isSectionSelected
                                ? 'text-[#FF6B00] font-medium'
                                : 'text-slate-500 hover:text-[#FF6B00]'
                            }`}
                          >
                            {section.label}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 space-y-6">
          {/* Language toggle */}
          <div className="flex p-1 bg-gray-100 rounded-lg">
            <button
              onClick={() => onLanguageChange('en')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                language === 'en'
                  ? 'bg-white text-[#FF6B00] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('fr')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                language === 'fr'
                  ? 'bg-white text-[#FF6B00] shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              FR
            </button>
          </div>

          {/* Back to admin */}
          <div className="space-y-4">
            <a
              href="/admin"
              className="flex items-center gap-2.5 text-sm font-medium text-slate-500 hover:text-[#FF6B00] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Admin Dashboard
            </a>
            <div className="pt-2 text-center">
              <p className="text-[10px] text-slate-500 uppercase tracking-[0.15em] font-semibold opacity-60">
                Sqordia CMS v2.4.0
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
