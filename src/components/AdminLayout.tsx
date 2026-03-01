import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  Palette,
  Database,
  ListTodo,
  Brain,
} from 'lucide-react';
import { authService } from '../lib/auth-service';
import { useTheme } from '../contexts/ThemeContext';
import AppSidebar, {
  SIDEBAR_WIDTH_EXPANDED,
  SIDEBAR_WIDTH_COLLAPSED,
  type SidebarNavGroup,
} from './ui/AppSidebar';
import { MobileBottomNav, type NavItemConfig } from '@/components/layout/MobileBottomNav';

// Page title mapping
const PAGE_TITLES: Record<string, { en: string; fr: string }> = {
  '/admin': { en: 'Overview', fr: 'Aperçu' },
  '/admin/users': { en: 'Users', fr: 'Utilisateurs' },
  '/admin/cms': { en: 'Content Manager', fr: 'Gestionnaire de contenu' },
  '/admin/prompt-registry': { en: 'Prompt Registry', fr: 'Registre de prompts' },
  '/admin/bug-report': { en: 'Issue Tracker', fr: 'Suivi des problèmes' },
  '/admin/business-plans': { en: 'Business Plans', fr: "Plans d'affaires" },
  '/admin/organizations': { en: 'Organizations', fr: 'Organisations' },
  '/admin/activity-logs': { en: 'Activity Logs', fr: "Journal d'activité" },
  '/admin/settings': { en: 'Settings', fr: 'Paramètres' },
};

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language, theme, toggleTheme, setLanguage } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed');
    return saved === 'true';
  });

  // Get current page title
  const currentPath = location.pathname;
  const pageTitle = PAGE_TITLES[currentPath]?.[language === 'fr' ? 'fr' : 'en'] || 'Admin';

  // Listen for sidebar collapse changes via storage
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('admin-sidebar-collapsed');
      setSidebarCollapsed(saved === 'true');
    };

    const interval = setInterval(handleStorageChange, 100);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  // Navigation configuration for desktop sidebar
  const navigation: SidebarNavGroup[] = [
    {
      items: [
        {
          name: t('admin.nav.overview'),
          href: '/admin',
          icon: LayoutDashboard,
          shortcut: '⌘1',
        },
        {
          name: t('admin.nav.users'),
          href: '/admin/users',
          icon: Users,
          shortcut: '⌘2',
        },
        {
          name: 'Content Manager',
          href: '/admin/cms',
          icon: Palette,
          shortcut: '⌘3',
        },
        {
          name: 'Prompt Registry',
          href: '/admin/prompt-registry',
          icon: Database,
          shortcut: '⌘4',
        },
        {
          name: 'Issue Tracker',
          href: '/admin/bug-report',
          icon: ListTodo,
          shortcut: '⌘5',
        },
      ],
    },
  ];

  // Mobile navigation items
  const mobileMainNav: NavItemConfig[] = [
    { name: language === 'fr' ? 'Aperçu' : 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: language === 'fr' ? 'Utilisateurs' : 'Users', href: '/admin/users', icon: Users },
    { name: 'CMS', href: '/admin/cms', icon: Palette },
  ];

  const mobileMoreNav: NavItemConfig[] = [
    { name: language === 'fr' ? 'Prompts' : 'Prompts', href: '/admin/prompt-registry', icon: Database },
    { name: language === 'fr' ? 'Problèmes' : 'Issues', href: '/admin/bug-report', icon: ListTodo },
  ];

  const sidebarWidth = sidebarCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH_EXPANDED;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <AppSidebar
          brand={{
            name: 'Sqordia',
            icon: Brain,
            href: '/admin',
            iconClassName: 'bg-gradient-to-br from-blue-600 to-blue-700 text-white',
          }}
          navigation={navigation}
          backLink={{
            label: language === 'fr' ? 'Retour au tableau de bord' : 'Back to Dashboard',
            href: '/dashboard',
          }}
          showLanguageSelector={true}
          showThemeToggle={true}
          showLogout={true}
          onLogout={handleLogout}
          storageKey="admin-sidebar-collapsed"
          mobileMenuOpen={mobileMenuOpen}
          onMobileMenuClose={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Main Content */}
      <main
        className="transition-all duration-300 ease-in-out min-h-screen md:ml-[var(--sidebar-width)]"
        style={{ '--sidebar-width': `${sidebarWidth}px` } as React.CSSProperties}
      >
        {/* Page Content */}
        <div className="p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        mainNavItems={mobileMainNav}
        moreMenuItems={mobileMoreNav}
        backLink={{
          label: language === 'fr' ? 'Retour au tableau de bord' : 'Back to Dashboard',
          href: '/dashboard',
        }}
        onLogout={handleLogout}
        t={t}
        theme={theme}
        onThemeToggle={toggleTheme}
        language={language}
        onLanguageChange={setLanguage}
        showUserProfile={false}
      />
    </div>
  );
}
