'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Palette,
  Flag,
  Sparkles,
  Settings,
  Activity,
  Building2,
  Bug,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  LogOut,
  Home,
  Menu,
  X,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

interface AdminLayoutClientProps {
  children: React.ReactNode;
  locale: string;
}

const translations = {
  en: {
    admin: 'Admin',
    overview: 'Overview',
    users: 'Users',
    cms: 'Content Manager',
    aiStudio: 'AI Studio',
    featureFlags: 'Feature Flags',
    issueTracker: 'Issue Tracker',
    organizations: 'Organizations',
    activityLogs: 'Activity Logs',
    settings: 'Settings',
    backToApp: 'Back to App',
    logout: 'Logout',
    collapse: 'Collapse',
    expand: 'Expand',
  },
  fr: {
    admin: 'Admin',
    overview: 'Apercu',
    users: 'Utilisateurs',
    cms: 'Gestionnaire de contenu',
    aiStudio: 'AI Studio',
    featureFlags: 'Indicateurs',
    issueTracker: 'Suivi des problemes',
    organizations: 'Organisations',
    activityLogs: "Journal d'activite",
    settings: 'Parametres',
    backToApp: "Retour a l'application",
    logout: 'Deconnexion',
    collapse: 'Reduire',
    expand: 'Developper',
  },
};

export default function AdminLayoutClient({ children, locale }: AdminLayoutClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const t = translations[locale as keyof typeof translations] || translations.en;
  const basePath = locale === 'fr' ? '/fr' : '';

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('admin-sidebar-collapsed');
    if (saved === 'true') {
      setSidebarCollapsed(true);
    }
  }, []);

  const toggleSidebar = () => {
    const newValue = !sidebarCollapsed;
    setSidebarCollapsed(newValue);
    localStorage.setItem('admin-sidebar-collapsed', String(newValue));
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push(`${basePath}/login`);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const navItems = [
    { name: t.overview, href: `${basePath}/admin`, icon: LayoutDashboard },
    { name: t.users, href: `${basePath}/admin/users`, icon: Users },
    { name: t.cms, href: `${basePath}/admin/cms`, icon: Palette },
    { name: t.aiStudio, href: `${basePath}/admin/ai-studio`, icon: Sparkles },
    { name: t.featureFlags, href: `${basePath}/admin/feature-flags`, icon: Flag },
    { name: t.issueTracker, href: `${basePath}/admin/bug-report`, icon: Bug },
    { name: t.organizations, href: `${basePath}/admin/organizations`, icon: Building2 },
    { name: t.activityLogs, href: `${basePath}/admin/activity-logs`, icon: Activity },
    { name: t.settings, href: `${basePath}/admin/settings`, icon: Settings },
  ];

  const isActive = (href: string) => {
    if (href === `${basePath}/admin`) {
      return pathname === href || pathname === `${basePath}/admin/`;
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between px-4 h-14">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <Menu size={20} />
          </button>
          <span className="font-semibold text-gray-900 dark:text-white">{t.admin}</span>
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed left-0 top-0 bottom-0 w-72 bg-white dark:bg-gray-800 p-4">
            <div className="flex items-center justify-between mb-6">
              <span className="text-xl font-bold text-gray-900 dark:text-white">{t.admin}</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      active
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="absolute bottom-4 left-4 right-4 space-y-2">
              <Link
                href={`${basePath}/dashboard`}
                className="flex items-center gap-3 px-3 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <Home size={20} />
                <span className="font-medium">{t.backToApp}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              >
                <LogOut size={20} />
                <span className="font-medium">{t.logout}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col fixed left-0 top-0 bottom-0 z-30 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 px-4 border-b border-gray-200 dark:border-gray-700 ${sidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!sidebarCollapsed && (
            <span className="text-xl font-bold text-gray-900 dark:text-white">{t.admin}</span>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={sidebarCollapsed ? t.expand : t.collapse}
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  active
                    ? 'bg-orange-500 text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                } ${sidebarCollapsed ? 'justify-center' : ''}`}
                title={sidebarCollapsed ? item.name : undefined}
              >
                <Icon size={20} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="font-medium">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom actions */}
        <div className="p-2 border-t border-gray-200 dark:border-gray-700 space-y-1">
          <Link
            href={`${basePath}/dashboard`}
            className={`flex items-center gap-3 px-3 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}
            title={sidebarCollapsed ? t.backToApp : undefined}
          >
            <Home size={20} className="flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">{t.backToApp}</span>}
          </Link>
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}
          >
            {theme === 'dark' ? <Sun size={20} className="flex-shrink-0" /> : <Moon size={20} className="flex-shrink-0" />}
            {!sidebarCollapsed && <span className="font-medium">{theme === 'dark' ? 'Light' : 'Dark'}</span>}
          </button>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors ${sidebarCollapsed ? 'justify-center' : ''}`}
            title={sidebarCollapsed ? t.logout : undefined}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!sidebarCollapsed && <span className="font-medium">{t.logout}</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`lg:transition-all lg:duration-300 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
