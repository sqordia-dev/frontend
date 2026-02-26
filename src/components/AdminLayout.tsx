import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  ChevronDown,
  Palette,
  Database,
  Bug,
  ArrowLeft,
  Brain,
  PanelLeftClose,
  PanelLeft,
  Check,
} from 'lucide-react';
import { authService } from '../lib/auth-service';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '@/lib/utils';
import CA from 'country-flag-icons/react/3x2/CA';

// Quebec Flag Component
const QuebecFlag = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <img
    src="/quebec-flag.svg"
    alt="Quebec Flag"
    width={size}
    height={size * 0.67}
    className={className}
    style={{ objectFit: 'contain', display: 'block' }}
  />
);

// Flag Icon Wrapper Component
const FlagIcon = ({
  FlagComponent,
  size = 20,
}: {
  FlagComponent: React.ComponentType<any>;
  size?: number;
}) => (
  <div style={{ width: size, height: size * 0.67, display: 'inline-block', lineHeight: 0 }}>
    <FlagComponent
      style={{ width: '100%', height: '100%', display: 'block' }}
      title=""
    />
  </div>
);

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme, language, setLanguage, t } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('adminSidebarOpen');
    return saved !== null ? saved === 'true' : true;
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English', displayCode: 'EN', FlagComponent: CA },
    { code: 'fr', label: 'Français', displayCode: 'FR', FlagComponent: QuebecFlag },
  ];

  const currentLang = languages.find(l => l.code === language);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isLangOpen && !target.closest('.language-selector')) {
        setIsLangOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLangOpen]);

  useEffect(() => {
    localStorage.setItem('adminSidebarOpen', sidebarOpen.toString());
  }, [sidebarOpen]);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const navigation = [
    { name: t('admin.nav.overview'), href: '/admin', icon: LayoutDashboard },
    { name: t('admin.nav.users'), href: '/admin/users', icon: Users },
    { name: 'Content Manager', href: '/admin/cms', icon: Palette },
    { name: 'Prompt Registry', href: '/admin/prompt-registry', icon: Database },
    { name: 'Bug Report', href: '/admin/bug-report', icon: Bug },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-card border-r border-border/50 transition-all duration-300 ease-in-out flex flex-col",
          sidebarOpen ? 'w-64' : 'w-[72px]',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo/Header */}
        <div className="flex items-center h-16 px-4 border-b border-border/50">
          <Link to="/admin" className="flex items-center gap-3 group flex-1 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-strategy-blue text-white shadow-md transition-transform duration-200 group-hover:scale-105 shrink-0">
              <Brain className="h-4 w-4" />
            </div>
            {sidebarOpen && (
              <span className="text-base font-bold tracking-tight font-heading truncate">
                Sqordia
              </span>
            )}
          </Link>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Back to Dashboard */}
        <div className="px-3 pt-4 pb-2">
          <Link
            to="/dashboard"
            className={cn(
              "flex items-center gap-3 h-10 px-3 text-sm font-medium rounded-lg transition-all duration-150",
              "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground",
              !sidebarOpen && "justify-center px-0"
            )}
            title={!sidebarOpen ? 'Back to Dashboard' : undefined}
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            {sidebarOpen && <span>Back to Dashboard</span>}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 h-10 px-3 text-sm font-medium rounded-lg transition-all duration-150",
                  isActive
                    ? "bg-momentum-orange text-white shadow-sm"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                  !sidebarOpen && "justify-center px-0"
                )}
                title={!sidebarOpen ? item.name : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {sidebarOpen && <span className="truncate">{item.name}</span>}
                {isActive && sidebarOpen && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-white/70" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-3 border-t border-border/50 space-y-1">
          {/* Language Selector */}
          <div className="relative language-selector">
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className={cn(
                "flex items-center gap-3 w-full h-10 px-3 text-sm font-medium rounded-lg transition-colors",
                "text-foreground hover:bg-muted/80",
                !sidebarOpen && "justify-center px-0"
              )}
              title={!sidebarOpen ? currentLang?.label : undefined}
            >
              <div className="flex h-5 w-7 items-center justify-center rounded overflow-hidden border border-border/50 shrink-0">
                {currentLang?.FlagComponent && (
                  <FlagIcon FlagComponent={currentLang.FlagComponent} size={28} />
                )}
              </div>
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left">{currentLang?.label}</span>
                  <ChevronDown className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform duration-200",
                    isLangOpen && "rotate-180"
                  )} />
                </>
              )}
            </button>

            {isLangOpen && sidebarOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-1.5 bg-popover border border-border rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-200">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code as 'en' | 'fr');
                      setIsLangOpen(false);
                    }}
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

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={cn(
              "flex items-center gap-3 w-full h-10 px-3 text-sm font-medium rounded-lg transition-colors",
              "text-foreground hover:bg-muted/80",
              !sidebarOpen && "justify-center px-0"
            )}
            title={!sidebarOpen ? (theme === 'light' ? 'Dark Mode' : 'Light Mode') : undefined}
          >
            <div className={cn(
              "flex h-5 w-5 items-center justify-center rounded-md transition-colors",
              theme === 'light' ? "bg-slate-900/10 text-slate-700" : "bg-amber-500/10 text-amber-500"
            )}>
              {theme === 'light' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
            </div>
            {sidebarOpen && <span>{theme === 'light' ? t('admin.theme.dark') : t('admin.theme.light')}</span>}
          </button>

          <div className="h-px bg-border/50 my-1" />

          {/* Collapse Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={cn(
              "flex items-center gap-3 w-full h-10 px-3 text-sm font-medium rounded-lg transition-colors",
              "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              !sidebarOpen && "justify-center px-0"
            )}
            title={!sidebarOpen ? 'Expand' : 'Collapse'}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-4 w-4 shrink-0" />
            ) : (
              <PanelLeft className="h-4 w-4 shrink-0" />
            )}
            {sidebarOpen && <span>{sidebarOpen ? 'Collapse' : 'Expand'}</span>}
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 w-full h-10 px-3 text-sm font-medium rounded-lg transition-colors",
              "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
              !sidebarOpen && "justify-center px-0"
            )}
            title={!sidebarOpen ? t('admin.logout') : undefined}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {sidebarOpen && <span>{t('admin.logout')}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "transition-all duration-300 ease-in-out min-h-screen",
        sidebarOpen ? 'lg:ml-64' : 'lg:ml-[72px]'
      )}>
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 lg:hidden flex items-center h-14 px-4 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
