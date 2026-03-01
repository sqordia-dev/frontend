import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Plus,
  CreditCard,
  Shield,
  Settings,
  Receipt,
} from 'lucide-react';
import { authService } from '../lib/auth-service';
import { User as UserType } from '../lib/types';
import { useTheme } from '../contexts/ThemeContext';

// shadcn/ui components
import { SkipLink } from '@/components/ui/skip-link';
import { TooltipProvider } from '@/components/ui/tooltip';
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';

// Reusable sidebar component (desktop only)
import { AppSidebar, type NavItem, type AppSidebarUser } from '@/components/layout/AppSidebar';

// Mobile bottom navigation
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';

// ── Main layout ─────────────────────────────────────────────────────────────
export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme, language, setLanguage, t } = useTheme();
  const [user, setUser] = useState<UserType | null>(null);
  const [profileImageError, setProfileImageError] = useState(false);

  useEffect(() => { loadUser(); }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    const timer = setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior }), 100);
    return () => clearTimeout(timer);
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

  // Navigation items with translations
  const navigation: NavItem[] = [
    { name: t('nav.dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('nav.createPlan'), href: '/create-plan', icon: Plus, accent: true },
    { name: t('nav.subscription'), href: '/subscription', icon: CreditCard },
    { name: t('nav.invoices'), href: '/invoices', icon: Receipt },
    { name: t('nav.settings'), href: '/profile', icon: Settings },
  ];

  const adminNavigation: NavItem[] = [
    { name: t('nav.adminPanel'), href: '/admin', icon: Shield },
  ];

  // Map user to AppSidebarUser interface
  const sidebarUser: AppSidebarUser | null = user ? {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    profilePictureUrl: user.profilePictureUrl,
    persona: user.persona,
    roles: (user as any)?.roles,
  } : null;

  // Mobile nav items
  const mobileMainNav = [
    { name: t('nav.dashboard'), href: '/dashboard', icon: LayoutDashboard },
    { name: t('nav.createPlan'), href: '/create-plan', icon: Plus, accent: true },
    { name: t('nav.settings'), href: '/profile', icon: Settings },
  ];

  const mobileMoreNav = [
    { name: t('nav.subscription'), href: '/subscription', icon: CreditCard },
    { name: t('nav.invoices'), href: '/invoices', icon: Receipt },
    ...(sidebarUser?.roles?.includes('Admin') ? [{ name: t('nav.adminPanel'), href: '/admin', icon: Shield }] : []),
  ];

  return (
    <TooltipProvider>
      <SidebarProvider defaultOpen={true}>
        <div className="min-h-screen flex w-full bg-background text-foreground">
          <SkipLink targetId="main-content" />

          {/* Desktop Sidebar - hidden on mobile */}
          <div className="hidden md:block">
            <AppSidebar
              navigation={navigation}
              adminNavigation={adminNavigation}
              user={sidebarUser}
              profileImageError={profileImageError}
              onProfileImageError={() => setProfileImageError(true)}
              onLogout={handleLogout}
              t={t}
              language={language}
              onLanguageChange={setLanguage}
              theme={theme}
              onThemeToggle={toggleTheme}
            />
          </div>

          {/* Main content area */}
          <SidebarInset className="flex flex-col w-full">
            <main 
              id="main-content" 
              className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8" 
              tabIndex={-1}
            >
              <Outlet />
            </main>
          </SidebarInset>

          {/* Mobile Bottom Navigation */}
          <MobileBottomNav
            mainNavItems={mobileMainNav}
            moreMenuItems={mobileMoreNav}
            user={sidebarUser}
            onLogout={handleLogout}
            t={t}
            theme={theme}
            onThemeToggle={toggleTheme}
            language={language}
            onLanguageChange={setLanguage}
          />
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
