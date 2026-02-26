import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  LayoutDashboard,
  User,
  FileQuestion,
  CreditCard,
  Rocket,
  LogIn,
  Scale,
  ChevronRight,
  ChevronDown,
  Settings,
  ArrowRight,
  Layers,
  HelpCircle,
  Quote,
  CreditCardIcon,
  Type,
  Inbox,
  Lightbulb,
  Shield,
  Monitor,
  ListOrdered,
  Hand,
  CheckCircle,
  Palette,
  Share2,
  Mail,
  FileText,
  Menu,
  ClipboardList,
} from 'lucide-react';
import { CmsPageDefinition } from '../../lib/cms-page-registry';
import { authService } from '../../lib/auth-service';
import { User as UserType } from '../../lib/types';
import { cn } from '@/lib/utils';

interface CmsLeftSidebarProps {
  pages: CmsPageDefinition[];
  selectedPageKey: string;
  selectedSectionKey: string;
  expandedPages: Set<string>;
  onPageClick: (pageKey: string) => void;
  onSectionClick: (pageKey: string, sectionKey: string) => void;
}

// Icon mapping for pages
const pageIconMap: Record<string, React.ElementType> = {
  landing: Globe,
  dashboard: LayoutDashboard,
  profile: User,
  questionnaire: FileQuestion,
  question_templates: HelpCircle,
  create_plan: FileText,
  subscription: CreditCard,
  onboarding: Rocket,
  auth: LogIn,
  legal: Scale,
  global: Globe,
};

// Icon mapping for sections
const sectionIconMap: Record<string, React.ElementType> = {
  hero: Layers,
  features: Layers,
  faq: HelpCircle,
  testimonials: Quote,
  pricing: CreditCardIcon,
  labels: Type,
  empty_states: Inbox,
  tips: Lightbulb,
  security: Shield,
  sessions: Monitor,
  steps: ListOrdered,
  welcome: Hand,
  completion: CheckCircle,
  branding: Palette,
  social: Share2,
  contact: Mail,
  footer: FileText,
  navigation: Menu,
};

export function CmsLeftSidebar({
  pages,
  selectedPageKey,
  selectedSectionKey,
  expandedPages,
  onPageClick,
  onSectionClick,
}: CmsLeftSidebarProps) {
  const [user, setUser] = useState<UserType | null>(null);

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

  const getUserInitials = (): string => {
    if (!user) return '?';
    const first = user.firstName?.[0] || '';
    const last = user.lastName?.[0] || '';
    return (first + last).toUpperCase() || user.email?.[0]?.toUpperCase() || '?';
  };

  const getUserName = (): string => {
    if (!user) return 'Loading...';
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return fullName || user.email || 'Unknown User';
  };

  const getPageIcon = (pageKey: string) => {
    return pageIconMap[pageKey] || FileText;
  };

  const getSectionIcon = (sectionKey: string) => {
    const lastPart = sectionKey.split('.').pop() || '';
    return sectionIconMap[lastPart] || FileText;
  };

  return (
    <aside className="hidden lg:flex w-[280px] border-r border-border/50 bg-card flex-col shrink-0">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-4">
        {/* Questionnaire Management CTA */}
        <Link
          to="/admin/cms/questionnaire"
          className={cn(
            "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
            "bg-momentum-orange/10 text-momentum-orange border border-momentum-orange/20",
            "hover:bg-momentum-orange/15 hover:border-momentum-orange/30",
            "font-semibold text-sm group"
          )}
        >
          <ClipboardList className="h-4 w-4 shrink-0" />
          <span>Manage Questions</span>
          <ArrowRight className="h-4 w-4 ml-auto transition-transform group-hover:translate-x-0.5" />
        </Link>

        {/* Content Structure Section */}
        <div className="space-y-2">
          <div className="px-3 py-2">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Content Structure
            </span>
          </div>

          <div className="space-y-1">
            {pages.map((page) => {
              const isExpanded = expandedPages.has(page.key);
              const isPageSelected = selectedPageKey === page.key;
              const PageIcon = getPageIcon(page.key);

              return (
                <div key={page.key}>
                  {/* Page button */}
                  <button
                    onClick={() => onPageClick(page.key)}
                    className={cn(
                      "w-full flex items-center gap-3 h-10 px-3 text-sm font-medium rounded-lg transition-all duration-150",
                      isPageSelected
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <PageIcon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left truncate">{page.label}</span>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground/60" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground/60" />
                    )}
                  </button>

                  {/* Sections */}
                  {isExpanded && (
                    <div className="ml-3 pl-3 border-l border-border/50 space-y-0.5 mt-1">
                      {page.sections.map((section) => {
                        const isSectionSelected = selectedSectionKey === section.key;
                        const SectionIcon = getSectionIcon(section.key);

                        return (
                          <button
                            key={section.key}
                            onClick={() => onSectionClick(page.key, section.key)}
                            className={cn(
                              "w-full flex items-center gap-3 h-9 px-3 text-sm rounded-lg transition-all duration-150",
                              isSectionSelected
                                ? "bg-momentum-orange/10 text-momentum-orange font-medium"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                          >
                            <SectionIcon className={cn(
                              "h-3.5 w-3.5 shrink-0",
                              isSectionSelected && "text-momentum-orange"
                            )} />
                            <span className="truncate">{section.label}</span>
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
      <div className="p-3 border-t border-border/50">
        <div className={cn(
          "flex items-center gap-3 p-3 rounded-xl transition-colors",
          "bg-muted/50 hover:bg-muted/70"
        )}>
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-strategy-blue/10 text-strategy-blue font-bold text-xs shrink-0">
            {getUserInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">
              {getUserName()}
            </p>
            <p className="text-xs text-muted-foreground">
              Administrator
            </p>
          </div>
          <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
