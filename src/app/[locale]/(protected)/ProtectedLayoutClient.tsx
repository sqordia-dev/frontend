'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Plus,
  CreditCard,
  Shield,
  Settings,
  Receipt,
  Menu,
  X,
  LogOut,
  User,
  Moon,
  Sun,
  Languages,
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: boolean;
}

interface UserData {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  profilePictureUrl?: string;
  persona?: string;
  roles?: string[];
}

const translations = {
  en: {
    nav: {
      dashboard: 'Dashboard',
      createPlan: 'New Plan',
      subscription: 'Subscription',
      invoices: 'Invoices',
      settings: 'Settings',
      adminPanel: 'Admin',
      logout: 'Sign Out',
      profile: 'Profile',
    },
    menu: 'Menu',
    close: 'Close',
  },
  fr: {
    nav: {
      dashboard: 'Tableau de bord',
      createPlan: 'Nouveau plan',
      subscription: 'Abonnement',
      invoices: 'Factures',
      settings: 'Paramètres',
      adminPanel: 'Admin',
      logout: 'Déconnexion',
      profile: 'Profil',
    },
    menu: 'Menu',
    close: 'Fermer',
  },
};

export default function ProtectedLayoutClient({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const t = translations[locale as keyof typeof translations] || translations.en;

  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const basePath = locale === 'fr' ? '/fr' : '';

  useEffect(() => {
    loadUser();
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  const loadUser = async () => {
    try {
      const response = await fetch('/api/auth/session');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);

        // Check if user has selected a persona
        if (!data.user?.persona && !pathname.includes('persona-selection')) {
          router.push(`${basePath}/persona-selection`);
        }
      } else {
        router.push(`${basePath}/login`);
      }
    } catch (error) {
      console.error('Failed to load user:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push(`${basePath}/login`);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const switchLanguage = () => {
    const newLocale = locale === 'en' ? 'fr' : 'en';
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath || `/${newLocale}/dashboard`);
  };

  const navigation: NavItem[] = [
    { name: t.nav.dashboard, href: `${basePath}/dashboard`, icon: LayoutDashboard },
    { name: t.nav.createPlan, href: `${basePath}/create-plan`, icon: Plus, accent: true },
    { name: t.nav.subscription, href: `${basePath}/subscription`, icon: CreditCard },
    { name: t.nav.invoices, href: `${basePath}/invoices`, icon: Receipt },
    { name: t.nav.settings, href: `${basePath}/profile`, icon: Settings },
  ];

  const isAdmin = user?.roles?.includes('Admin');

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#FF6B00]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        {/* Logo */}
        <div className="flex h-16 items-center px-6 border-b border-gray-200 dark:border-gray-700">
          <Link href={`${basePath}/dashboard`} className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#FF6B00] flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-xl font-bold text-[#1A2B47] dark:text-white">Sqordia</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  item.accent
                    ? 'bg-[#FF6B00] text-white hover:bg-[#E55F00]'
                    : isActive
                      ? 'bg-gray-100 dark:bg-gray-700 text-[#1A2B47] dark:text-white'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#1A2B47] dark:hover:text-white'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}

          {isAdmin && (
            <Link
              href={`${basePath}/admin`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith(`${basePath}/admin`)
                  ? 'bg-gray-100 dark:bg-gray-700 text-[#1A2B47] dark:text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#1A2B47] dark:hover:text-white'
              }`}
            >
              <Shield className="h-5 w-5" />
              {t.nav.adminPanel}
            </Link>
          )}
        </nav>

        {/* User section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              {user?.profilePictureUrl ? (
                <img src={user.profilePictureUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <button
              onClick={switchLanguage}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <Languages className="h-4 w-4" />
              {locale === 'en' ? 'FR' : 'EN'}
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href={`${basePath}/dashboard`} className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#FF6B00] flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="text-lg font-bold text-[#1A2B47] dark:text-white">Sqordia</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-gray-800 transform transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full pt-14">
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    item.accent
                      ? 'bg-[#FF6B00] text-white hover:bg-[#E55F00]'
                      : isActive
                        ? 'bg-gray-100 dark:bg-gray-700 text-[#1A2B47] dark:text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}

            {isAdmin && (
              <Link
                href={`${basePath}/admin`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  pathname.startsWith(`${basePath}/admin`)
                    ? 'bg-gray-100 dark:bg-gray-700 text-[#1A2B47] dark:text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Shield className="h-5 w-5" />
                {t.nav.adminPanel}
              </Link>
            )}
          </nav>

          {/* Mobile user section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                {user?.profilePictureUrl ? (
                  <img src={user.profilePictureUrl} alt="" className="h-full w-full object-cover rounded-full" />
                ) : (
                  <User className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              </button>
              <button
                onClick={switchLanguage}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Languages className="h-4 w-4" />
                {locale === 'en' ? 'FR' : 'EN'}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pt-14 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
