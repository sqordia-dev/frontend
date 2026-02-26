import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Plus,
  User,
  CreditCard,
  Shield,
  LogOut,
  Settings,
  Receipt,
  Sun,
  Moon,
  ChevronDown,
  Rocket,
  Briefcase,
  Heart,
  Check,
  Sparkles,
  PanelLeftClose,
  PanelLeft,
} from 'lucide-react';
import { Logo } from './ui/Logo';
import { authService } from '../lib/auth-service';
import { User as UserType } from '../lib/types';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '@/lib/utils';
import CA from 'country-flag-icons/react/3x2/CA';

// shadcn/ui components
import { SkipLink } from '@/components/ui/skip-link';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';

// ── Flag components ─────────────────────────────────────────────────────────
const QuebecFlag = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <img src="/quebec-flag.svg" alt="Quebec Flag" width={size} height={size * 0.67}
    className={className} style={{ objectFit: 'contain', display: 'block' }} />
);

const FlagIcon = ({ FlagComponent, size = 20 }: { FlagComponent: React.ComponentType<any>; size?: number }) => (
  <div className="inline-block leading-[0]" style={{ width: size, height: size * 0.67 }}>
    <FlagComponent className="block w-full h-full" title="" />
  </div>
);

// ── Persona badge ───────────────────────────────────────────────────────────
const PERSONA_CONFIG: Record<string, { icon: React.ElementType; colorCls: string; bgCls: string; label: string; labelFr: string }> = {
  Entrepreneur: { icon: Rocket, colorCls: 'text-momentum-orange', bgCls: 'bg-momentum-orange/10', label: 'Entrepreneur', labelFr: 'Entrepreneur' },
  Consultant:   { icon: Briefcase, colorCls: 'text-strategy-blue', bgCls: 'bg-strategy-blue/10', label: 'Consultant', labelFr: 'Consultant' },
  OBNL:         { icon: Heart, colorCls: 'text-emerald-600 dark:text-emerald-400', bgCls: 'bg-emerald-500/10', label: 'NPO', labelFr: 'OBNL' },
};

const PersonaBadge = ({ persona, compact, language = 'en' }: { persona?: string | null; compact?: boolean; language?: string }) => {
  if (!persona) return null;
  const cfg = PERSONA_CONFIG[persona];
  if (!cfg) return null;
  const Icon = cfg.icon;
  const label = language === 'fr' ? cfg.labelFr : cfg.label;

  if (compact) {
    return (
      <div className={cn('flex items-center justify-center w-6 h-6 rounded-md', cfg.bgCls, cfg.colorCls)} title={label}>
        <Icon size={12} />
      </div>
    );
  }
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium', cfg.bgCls, cfg.colorCls)}>
      <Icon size={10} />
      {label}
    </span>
  );
};

// ── Constants ───────────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'en' as const, label: 'English', displayCode: 'EN', FlagComponent: CA },
  { code: 'fr' as const, label: 'Français', displayCode: 'FR', FlagComponent: QuebecFlag },
];

// ── Inner sidebar (needs useSidebar context) ────────────────────────────────
function DashboardSidebar({
  user,
  profileImageError,
  onProfileImageError,
  onLogout,
}: {
  user: UserType | null;
  profileImageError: boolean;
  onProfileImageError: () => void;
  onLogout: () => void;
}) {
  const location = useLocation();
  const { theme, toggleTheme, language, setLanguage, t } = useTheme();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const [isLangOpen, setIsLangOpen] = useState(false);

  useEffect(() => {
    if (!isLangOpen) return;
    const close = (e: MouseEvent) => { if (!(e.target as Element).closest('.lang-sel')) setIsLangOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [isLangOpen]);

  const currentLang = LANGUAGES.find((l) => l.code === language);

  const navigation = [
    { name: t('nav.dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('nav.createPlan'), href: '/create-plan', icon: Plus, accent: true },
    { name: t('nav.subscription'), href: '/subscription', icon: CreditCard },
    { name: t('nav.invoices'), href: '/invoices', icon: Receipt },
    { name: t('nav.settings'), href: '/profile', icon: Settings },
  ];

  const adminNavigation = [
    { name: t('nav.adminPanel'), href: '/admin', icon: Shield },
  ];

  const isActive = (href: string, index: number, items: { href: string }[]) => {
    if (href === '/dashboard') return location.pathname === '/dashboard';
    if (!location.pathname.startsWith(href)) return false;
    return items.findIndex((n) => n.href === href) === index;
  };

  return (
    <Sidebar collapsible="icon" className="border-r-0">
      {/* Header / Logo */}
      <SidebarHeader className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg" className="hover:bg-transparent group" tooltip="Sqordia">
              <Link to="/dashboard" className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-strategy-blue to-[#0f1a2e] text-white shadow-md transition-transform duration-200 group-hover:scale-105 shrink-0">
                  <Sparkles className="h-4 w-4" />
                </div>
                {!isCollapsed && (
                  <span className="text-base font-bold tracking-tight font-heading">Sqordia</span>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2">
        {/* User Profile Card */}
        {!isCollapsed && (
          <SidebarGroup className="py-0">
            <SidebarGroupContent>
              <div className={cn(
                "rounded-xl p-3 mb-2 transition-colors",
                "bg-muted/50 hover:bg-muted/70"
              )}>
                <div className="flex items-center gap-3">
                  {user?.profilePictureUrl && !profileImageError ? (
                    <img
                      src={user.profilePictureUrl}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="h-10 w-10 rounded-lg object-cover ring-2 ring-background shrink-0"
                      onError={onProfileImageError}
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-strategy-blue/20 to-strategy-blue/5 text-strategy-blue shrink-0">
                      <User className="h-5 w-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                {user?.persona && (
                  <div className="mt-3 pt-3 border-t border-border/50">
                    <PersonaBadge persona={user.persona} language={language} />
                  </div>
                )}
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Main nav */}
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-3">
              {t('nav.mainMenu') || 'Main Menu'}
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navigation.map((item, idx) => {
                const Icon = item.icon;
                const active = isActive(item.href, idx, navigation);
                const isAccent = (item as any).accent;
                return (
                  <SidebarMenuItem key={`${item.href}-${idx}`}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.name}
                      className={cn(
                        "h-10 rounded-lg font-medium transition-all duration-150",
                        active && "bg-primary/10 text-primary font-semibold",
                        !active && "hover:bg-muted/80",
                        isAccent && !active && "text-momentum-orange hover:bg-momentum-orange/10"
                      )}
                    >
                      <Link to={item.href} className="flex items-center gap-3">
                        <Icon className={cn(
                          "h-4 w-4 shrink-0",
                          active && "text-primary",
                          isAccent && !active && "text-momentum-orange"
                        )} />
                        <span>{item.name}</span>
                        {active && (
                          <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Admin */}
        {(user as any)?.roles?.includes('Admin') && (
          <SidebarGroup>
            {!isCollapsed && (
              <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-3">
                {t('nav.admin') || 'Administration'}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {adminNavigation.map((item, idx) => {
                  const Icon = item.icon;
                  const active = isActive(item.href, idx, adminNavigation);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        tooltip={item.name}
                        className={cn(
                          "h-10 rounded-lg font-medium transition-all duration-150",
                          active && "bg-primary/10 text-primary font-semibold",
                          !active && "hover:bg-muted/80"
                        )}
                      >
                        <Link to={item.href} className="flex items-center gap-3">
                          <Icon className={cn("h-4 w-4 shrink-0", active && "text-primary")} />
                          <span>{item.name}</span>
                          {active && (
                            <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* Footer: Language, Theme, Logout */}
      <SidebarFooter className="p-2 border-t border-border/50">
        <SidebarMenu className="gap-1">
          {/* Language selector */}
          <SidebarMenuItem>
            <div className="relative lang-sel">
              <SidebarMenuButton
                onClick={() => setIsLangOpen(!isLangOpen)}
                tooltip={currentLang?.label || 'Language'}
                className="h-10 rounded-lg hover:bg-muted/80 transition-colors"
              >
                <div className="flex h-5 w-7 items-center justify-center rounded overflow-hidden border border-border/50 shrink-0">
                  {currentLang?.FlagComponent && <FlagIcon FlagComponent={currentLang.FlagComponent} size={28} />}
                </div>
                <span className="flex-1 text-left text-sm">{currentLang?.label}</span>
                <ChevronDown className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  isLangOpen && "rotate-180"
                )} />
              </SidebarMenuButton>

              {isLangOpen && !isCollapsed && (
                <div className="absolute bottom-full left-0 right-0 mb-1.5 bg-popover border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code); setIsLangOpen(false); }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors',
                        language === lang.code
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-foreground hover:bg-muted',
                      )}
                    >
                      <div className="flex h-4 w-6 items-center justify-center rounded-sm overflow-hidden border border-border/30 shrink-0">
                        <FlagIcon FlagComponent={lang.FlagComponent} size={24} />
                      </div>
                      <span className="flex-1 text-left">{lang.label}</span>
                      {language === lang.code && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </SidebarMenuItem>

          {/* Theme toggle */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleTheme}
              tooltip={theme === 'light' ? t('nav.darkMode') : t('nav.lightMode')}
              className="h-10 rounded-lg hover:bg-muted/80 transition-colors"
            >
              <div className={cn(
                "flex h-5 w-5 items-center justify-center rounded-md transition-colors",
                theme === 'light' ? "bg-slate-900/10 text-slate-700" : "bg-amber-500/10 text-amber-500"
              )}>
                {theme === 'light' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
              </div>
              <span className="text-sm">{theme === 'light' ? t('nav.darkMode') : t('nav.lightMode')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarSeparator className="my-1" />

          {/* Collapse Toggle */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleSidebar}
              tooltip={isCollapsed ? 'Expand' : 'Collapse'}
              className="h-10 rounded-lg hover:bg-muted/80 transition-colors"
            >
              {isCollapsed ? (
                <PanelLeft className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
              <span className="text-sm">{isCollapsed ? 'Expand' : 'Collapse'}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Logout */}
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onLogout}
              tooltip={t('nav.logout')}
              className="h-10 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-sm">{t('nav.logout')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

// ── Main layout ─────────────────────────────────────────────────────────────
export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<UserType | null>(null);
  const [profileImageError, setProfileImageError] = useState(false);

  useEffect(() => { loadUser(); }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    const t = setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior }), 100);
    return () => clearTimeout(t);
  }, [location.pathname]);

  const loadUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setProfileImageError(false);
      const userPersona = userData.persona || localStorage.getItem('userPersona');
      if (!userPersona && location.pathname !== '/persona-selection') {
        navigate('/persona-selection');
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-background text-foreground">
          <SkipLink targetId="main-content" />

          <DashboardSidebar
            user={user}
            profileImageError={profileImageError}
            onProfileImageError={() => setProfileImageError(true)}
            onLogout={handleLogout}
          />

          <SidebarInset className="flex flex-col">
            <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8" tabIndex={-1}>
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
