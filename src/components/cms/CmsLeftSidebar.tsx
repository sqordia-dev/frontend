import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CmsPageDefinition } from '../../lib/cms-page-registry';
import { authService } from '../../lib/auth-service';
import { User } from '../../lib/types';

interface CmsLeftSidebarProps {
  pages: CmsPageDefinition[];
  selectedPageKey: string;
  selectedSectionKey: string;
  expandedPages: Set<string>;
  onPageClick: (pageKey: string) => void;
  onSectionClick: (pageKey: string, sectionKey: string) => void;
}

export function CmsLeftSidebar({
  pages,
  selectedPageKey,
  selectedSectionKey,
  expandedPages,
  onPageClick,
  onSectionClick,
}: CmsLeftSidebarProps) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      }
    };
    fetchUser();
  }, []);

  // Get user initials
  const getUserInitials = (): string => {
    if (!user) return '?';
    const first = user.firstName?.[0] || '';
    const last = user.lastName?.[0] || '';
    return (first + last).toUpperCase() || user.email?.[0]?.toUpperCase() || '?';
  };

  // Get user display name
  const getUserName = (): string => {
    if (!user) return 'Loading...';
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return fullName || user.email || 'Unknown User';
  };

  // Get icon class for Material Symbols
  const getIconName = (pageKey: string): string => {
    const iconMap: Record<string, string> = {
      landing: 'web',
      dashboard: 'dashboard',
      profile: 'person',
      questionnaire: 'assignment',
      question_templates: 'help',
      create_plan: 'edit_note',
      subscription: 'loyalty',
      onboarding: 'rocket_launch',
      auth: 'login',
      legal: 'gavel',
      global: 'public',
    };
    return iconMap[pageKey] || 'article';
  };

  const getSectionIconName = (sectionKey: string): string => {
    const iconMap: Record<string, string> = {
      hero: 'view_agenda',
      features: 'layers',
      faq: 'help',
      testimonials: 'format_quote',
      pricing: 'credit_card',
      labels: 'text_fields',
      empty_states: 'inbox',
      tips: 'lightbulb',
      security: 'shield',
      sessions: 'devices',
      steps: 'format_list_numbered',
      welcome: 'waving_hand',
      completion: 'check_circle',
      branding: 'palette',
      social: 'share',
      contact: 'contact_mail',
      footer: 'article',
      navigation: 'menu',
    };
    const lastPart = sectionKey.split('.').pop() || '';
    return iconMap[lastPart] || 'article';
  };

  return (
    <aside className="hidden lg:flex w-[260px] border-r border-gray-200 bg-white flex-col shrink-0">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto py-6 custom-scrollbar px-3 space-y-1">
        {/* Questionnaire Management Link */}
        <div className="mb-4 px-1">
          <Link
            to="/admin/cms/questionnaire"
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-lg transition-colors bg-orange-50 text-[#FF6B00] hover:bg-orange-100 border border-orange-200"
          >
            <span className="material-symbols-outlined">quiz</span>
            <span>Manage Questions</span>
            <span className="material-symbols-outlined ml-auto text-base">arrow_forward</span>
          </Link>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Content Structure
          </div>

          <div className="space-y-1">
            {pages.map((page) => {
              const isExpanded = expandedPages.has(page.key);
              const isPageSelected = selectedPageKey === page.key;

              return (
                <div key={page.key}>
                  {/* Page button */}
                  <button
                    onClick={() => onPageClick(page.key)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors group ${
                      isPageSelected ? 'text-slate-800 bg-gray-50' : 'text-slate-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-slate-400">
                        {getIconName(page.key)}
                      </span>
                      <span>{page.label}</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-400 text-base">
                      {isExpanded ? 'expand_more' : 'chevron_right'}
                    </span>
                  </button>

                  {/* Sections */}
                  {isExpanded && (
                    <div className="ml-4 pl-3 border-l border-gray-100 space-y-1">
                      {page.sections.map((section) => {
                        const isSectionSelected = selectedSectionKey === section.key;

                        return (
                          <button
                            key={section.key}
                            onClick={() => onSectionClick(page.key, section.key)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold rounded-lg transition-colors ${
                              isSectionSelected
                                ? 'bg-orange-50 text-[#FF6B00] border-l-2 border-[#FF6B00]'
                                : 'text-slate-600 hover:bg-gray-50'
                            }`}
                          >
                            <span
                              className={`material-symbols-outlined text-[18px] ${
                                isSectionSelected ? 'text-[#FF6B00]' : 'text-slate-400'
                              }`}
                            >
                              {getSectionIconName(section.key)}
                            </span>
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
        </div>
      </div>

      {/* User card at bottom */}
      <div className="p-4 border-t border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600 font-bold border border-gray-200 text-xs">
            {getUserInitials()}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-slate-800 truncate">{getUserName()}</span>
            <span className="text-[11px] text-slate-500 font-medium">Administrator</span>
          </div>
          <button className="ml-auto text-slate-400 hover:text-slate-600">
            <span className="material-symbols-outlined text-[18px]">settings</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
