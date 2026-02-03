import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileText,
  Plus,
  User,
  CreditCard,
  Shield,
  LogOut,
  Settings,
  Receipt,
  Brain,
  Sun,
  Moon,
  ChevronDown,
  Rocket,
  Briefcase,
  Heart,
} from 'lucide-react';
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
const PERSONA_CONFIG: Record<string, { icon: React.ElementType; colorCls: string; label: string; labelFr: string }> = {
  Entrepreneur: { icon: Rocket, colorCls: 'bg-momentum-orange', label: 'Entrepreneur', labelFr: 'Entrepreneur' },
  Consultant:   { icon: Briefcase, colorCls: 'bg-strategy-blue', label: 'Consultant', labelFr: 'Consultant' },
  OBNL:         { icon: Heart, colorCls: 'bg-emerald-500', label: 'NPO', labelFr: 'OBNL' },
};

const PersonaBadge = ({ persona, compact, language = 'en' }: { persona?: string | null; compact?: boolean; language?: string }) => {
  if (!persona) return null;
  const cfg = PERSONA_CONFIG[persona];
  if (!cfg) return null;
  const Icon = cfg.icon;
  const label = language === 'fr' ? cfg.labelFr : cfg.label;

  if (compact) {
    return (
      <div className={cn('flex items-center justify-center w-6 h-6 rounded-full text-white', cfg.colorCls)} title={label}>
        <Icon size={12} />
      </div>
    );
  }
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium text-white', cfg.colorCls)}>
      <Icon size={10} />
      {label}
    </span>
  );
};

// ── Constants ───────────────────────────────────────────────────────────────
const LANGUAGES = [
  { code: 'en' as const, label: 'English', displayCode: 'EN', FlagComponent: CA },
  { code: 'fr' as const, label: 'Fran\u00e7ais', displayCode: 'FR', FlagComponent: QuebecFlag },
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
  const { state } = useSidebar();
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
    { name: t('nav.createPlan'), href: '/create-plan', icon: Plus },
    { name: t('nav.myPlans'), href: '/dashboard', icon: FileText },
    { name: t('nav.subscription'), href: '/subscription', icon: CreditCard },
    { name: t('nav.invoices'), href: '/invoices', icon: Receipt },
    { name: t('nav.profile'), href: '/profile', icon: User },
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
    <Sidebar collapsible="icon">
      {/* Header / Logo */}
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="lg">
              <Link to="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-strategy-blue text-white">
                  <Brain className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold font-heading">Sqordia</span>
                  {user?.persona && (
                    <span className="truncate text-xs text-muted-foreground">{user.persona}</span>
                  )}
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* User info */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild size="lg" className="cursor-default hover:bg-transparent">
                  <div className="flex items-center gap-3">
                    {user?.profilePictureUrl && !profileImageError ? (
                      <img
                        src={user.profilePictureUrl}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="size-8 rounded-lg object-cover border border-border shrink-0"
                        onError={onProfileImageError}
                      />
                    ) : (
                      <div className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0">
                        <User size={16} />
                      </div>
                    )}
                    {!isCollapsed && (
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">{user?.firstName} {user?.lastName}</span>
                        <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
                        {user?.persona && <div className="mt-1"><PersonaBadge persona={user.persona} language={language} /></div>}
                      </div>
                    )}
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Main nav */}
        <SidebarGroup>
          <SidebarGroupLabel>{t('nav.mainMenu') || 'Main Menu'}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item, idx) => {
                const Icon = item.icon;
                const active = isActive(item.href, idx, navigation);
                return (
                  <SidebarMenuItem key={`${item.href}-${idx}`}>
                    <SidebarMenuButton asChild isActive={active} tooltip={item.name}>
                      <Link to={item.href}>
                        <Icon className="size-4" />
                        <span>{item.name}</span>
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
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>{t('nav.admin') || 'Administration'}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminNavigation.map((item, idx) => {
                    const Icon = item.icon;
                    const active = isActive(item.href, idx, adminNavigation);
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={active} tooltip={item.name}>
                          <Link to={item.href}>
                            <Icon className="size-4" />
                            <span>{item.name}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
      </SidebarContent>

      {/* Footer: Language, Theme, Logout */}
      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          {/* Language selector */}
          <SidebarMenuItem>
            <div className="relative lang-sel">
              <SidebarMenuButton onClick={() => setIsLangOpen(!isLangOpen)} tooltip={currentLang?.label || 'Language'}>
                <div className="w-5 h-3.5 rounded-[2px] overflow-hidden shrink-0">
                  {currentLang?.FlagComponent && <FlagIcon FlagComponent={currentLang.FlagComponent} size={20} />}
                </div>
                <span className="flex-1 text-left">{currentLang?.label}</span>
                <ChevronDown size={14} className={cn('transition-transform duration-200', isLangOpen && 'rotate-180')} />
              </SidebarMenuButton>

              {isLangOpen && !isCollapsed && (
                <div className="absolute bottom-full left-0 right-0 mb-1 bg-popover border border-border rounded-lg shadow-elevated overflow-hidden z-50 animate-scale-in origin-bottom-left">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code); setIsLangOpen(false); }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3.5 py-2.5 text-sm transition-colors',
                        language === lang.code
                          ? 'bg-accent text-accent-foreground font-semibold'
                          : 'text-popover-foreground hover:bg-accent/50',
                      )}
                    >
                      <div className="w-6 h-4 rounded-[2px] overflow-hidden shrink-0">
                        <FlagIcon FlagComponent={lang.FlagComponent} size={24} />
                      </div>
                      <span className="flex-1 text-left">{lang.label}</span>
                      {language === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-momentum-orange" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </SidebarMenuItem>

          {/* Theme toggle */}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={toggleTheme} tooltip={theme === 'light' ? t('nav.darkMode') : t('nav.lightMode')}>
              {theme === 'light' ? <Moon className="size-4" /> : <Sun className="size-4" />}
              <span>{theme === 'light' ? t('nav.darkMode') : t('nav.lightMode')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          {/* Logout */}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={onLogout} tooltip={t('nav.logout')}>
              <LogOut className="size-4" />
              <span>{t('nav.logout')}</span>
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

          <SidebarInset>
            {/* Top bar with sidebar trigger */}
            <header className="flex h-14 items-center gap-2 border-b border-border px-4 lg:px-6">
              <SidebarTrigger className="-ml-1" />
              <div className="h-4 w-px bg-border" />
              <span className="text-sm text-muted-foreground font-medium truncate">
                {user?.firstName ? `${user.firstName} ${user.lastName}` : ''}
              </span>
            </header>

            <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8" tabIndex={-1}>
              <Outlet />
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
