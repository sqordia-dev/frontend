import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Plus,
  CreditCard,
  Shield,
  Settings,
  Receipt,
  Brain,
} from 'lucide-react';
import { authService } from '../lib/auth-service';
import { User as UserType } from '../lib/types';
import { useTheme } from '../contexts/ThemeContext';
import { SkipLink } from '@/components/ui/skip-link';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import AppSidebar, {
  SIDEBAR_WIDTH_EXPANDED,
  SIDEBAR_WIDTH_COLLAPSED,
  type SidebarNavGroup,
} from '@/components/ui/AppSidebar';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

// Route -> breadcrumb label mapping
const ROUTE_LABELS: Record<string, string> = {
  '/dashboard': 'nav.dashboard',
  '/create-plan': 'nav.createPlan',
  '/profile': 'nav.settings',
  '/subscription': 'nav.subscription',
  '/invoices': 'nav.invoices',
};

function DashboardBreadcrumb({ pathname, t }: { pathname: string; t: (key: string) => string }) {
  const labelKey = ROUTE_LABELS[pathname];
  if (!labelKey || pathname === '/dashboard') return null;

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/dashboard">{t('nav.dashboard')}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{t(labelKey)}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme, language, setLanguage, t } = useTheme();
  const [user, setUser] = useState<UserType | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('dashboard-sidebar-collapsed');
    return saved === 'true';
  });

  useEffect(() => { loadUser(); }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    const timer = setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior }), 100);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Track sidebar collapse state
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('dashboard-sidebar-collapsed');
      setSidebarCollapsed(saved === 'true');
    };
    const interval = setInterval(handleStorageChange, 100);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const loadUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
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

  const isAdmin = (user as any)?.roles?.includes('Admin');

  const navigation: SidebarNavGroup[] = [
    {
      items: [
        { name: t('nav.dashboard'), href: '/dashboard', icon: LayoutDashboard },
        { name: t('nav.createPlan'), href: '/create-plan', icon: Plus, accent: true },
        { name: t('nav.subscription'), href: '/subscription', icon: CreditCard },
        { name: t('nav.invoices'), href: '/invoices', icon: Receipt },
        { name: t('nav.settings'), href: '/profile', icon: Settings },
      ],
    },
    ...(isAdmin ? [{
      title: language === 'fr' ? 'Administration' : 'Administration',
      items: [
        { name: t('nav.adminPanel'), href: '/admin', icon: Shield },
      ],
    }] : []),
  ];

  const mobileMainNav = [
    { name: t('nav.dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('nav.createPlan'), href: '/create-plan', icon: Plus, accent: true },
    { name: t('nav.settings'), href: '/profile', icon: Settings },
  ];

  const mobileMoreNav = [
    { name: t('nav.subscription'), href: '/subscription', icon: CreditCard },
    { name: t('nav.invoices'), href: '/invoices', icon: Receipt },
    ...(isAdmin ? [{ name: t('nav.adminPanel'), href: '/admin', icon: Shield }] : []),
  ];

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <SkipLink targetId="main-content" />

      {/* Desktop Sidebar - reuses the same component as /admin */}
      <div className="hidden md:block">
        <AppSidebar
          brand={{
            name: 'Sqordia',
            icon: Brain,
            href: '/dashboard',
            iconClassName: 'bg-strategy-blue text-white',
          }}
          navigation={navigation}
          showLanguageSelector={true}
          showThemeToggle={true}
          showLogout={true}
          onLogout={handleLogout}
          storageKey="dashboard-sidebar-collapsed"
        />
      </div>

      {/* Main content area */}
      <main
        id="main-content"
        className="transition-all duration-300 ease-in-out min-h-screen p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 md:ml-[var(--sidebar-width)]"
        style={{ '--sidebar-width': `${sidebarWidth}px` } as React.CSSProperties}
        tabIndex={-1}
      >
        <DashboardBreadcrumb pathname={location.pathname} t={t} />
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        mainNavItems={mobileMainNav}
        moreMenuItems={mobileMoreNav}
        user={user ? {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          profilePictureUrl: user.profilePictureUrl,
          roles: (user as any)?.roles,
        } : undefined}
        onLogout={handleLogout}
        t={t}
        theme={theme}
        onThemeToggle={toggleTheme}
        language={language}
        onLanguageChange={setLanguage}
      />
    </div>
  );
}
