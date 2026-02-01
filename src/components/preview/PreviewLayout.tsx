import React, { useState, useCallback, createContext, useContext, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Rocket,
  Briefcase,
  Heart
} from 'lucide-react';
import { PlanSection } from '../../types/preview';
import { authService } from '../../lib/auth-service';
import { User as UserType } from '../../lib/types';
import { useTheme } from '../../contexts/ThemeContext';
import MobileHeader from './MobileHeader';
import MobileDrawer from './MobileDrawer';
import BottomTabBar from './BottomTabBar';
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
  className = ''
}: {
  FlagComponent: React.ComponentType<any>;
  size?: number;
  className?: string;
}) => (
  <div style={{ width: size, height: size * 0.67, display: 'inline-block', lineHeight: 0 }}>
    <FlagComponent
      className={className}
      style={{ width: '100%', height: '100%', display: 'block' }}
      title=""
    />
  </div>
);

// Persona Badge Component
const PersonaBadge = ({ persona, compact = false, language = 'en' }: { persona?: string | null; compact?: boolean; language?: string }) => {
  if (!persona) return null;

  const personaConfig: Record<string, { icon: React.ElementType; color: string; label: string; labelFr: string }> = {
    'Entrepreneur': { icon: Rocket, color: '#FF6B00', label: 'Entrepreneur', labelFr: 'Entrepreneur' },
    'Consultant': { icon: Briefcase, color: '#1A2B47', label: 'Consultant', labelFr: 'Consultant' },
    'OBNL': { icon: Heart, color: '#10B981', label: 'NPO', labelFr: 'OBNL' }
  };

  const config = personaConfig[persona];
  if (!config) return null;

  const Icon = config.icon;
  const label = language === 'fr' ? config.labelFr : config.label;

  if (compact) {
    return (
      <div
        className="flex items-center justify-center w-6 h-6 rounded-full"
        style={{ backgroundColor: config.color }}
        title={label}
      >
        <Icon size={12} className="text-white" />
      </div>
    );
  }

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: config.color }}
    >
      <Icon size={10} />
      <span>{label}</span>
    </div>
  );
};

/**
 * Context for sharing layout state and handlers between PreviewLayout and its children
 */
interface PreviewLayoutContextValue {
  /** Currently active section ID */
  activeSectionId: string | null;
  /** All sections data */
  sections: PlanSection[];
  /** Handler to scroll to a specific section */
  scrollToSection: (sectionId: string) => void;
  /** Whether mobile drawer is open */
  isMobileDrawerOpen: boolean;
  /** Toggle mobile drawer */
  setMobileDrawerOpen: (open: boolean) => void;
}

const PreviewLayoutContext = createContext<PreviewLayoutContextValue | null>(null);

/**
 * Hook to access PreviewLayout context
 */
export function usePreviewLayout() {
  const context = useContext(PreviewLayoutContext);
  if (!context) {
    throw new Error('usePreviewLayout must be used within PreviewLayout');
  }
  return context;
}

interface PreviewLayoutProps {
  children: React.ReactNode;
  /** Plan title for mobile header */
  planTitle?: string;
  /** Callback when export is clicked (mobile) */
  onExport?: () => void;
  /** Callback when share is clicked (mobile) */
  onShare?: () => void;
  /** Whether export is in progress */
  isExporting?: boolean;
  /** Sidebar component (for mobile drawer only) */
  sidebar: React.ReactNode;
  /** Sections data to share with children via context */
  sections?: PlanSection[];
  /** Currently active section ID */
  activeSectionId?: string | null;
  /** Callback when section should be scrolled to */
  onSectionScroll?: (sectionId: string) => void;
}


/**
 * PreviewLayout - Main layout wrapper for business plan preview
 *
 * Desktop: Dashboard-style sidebar on left, sticky TOC on right
 * Mobile: Bottom tab bar and drawer for navigation
 */
export default function PreviewLayout({
  children,
  planTitle,
  onExport,
  onShare,
  isExporting = false,
  sidebar,
  sections = [],
  activeSectionId = null,
  onSectionScroll,
}: PreviewLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme, language, setLanguage, t } = useTheme();
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('previewSidebarOpen');
    return saved !== null ? saved === 'true' : true;
  });
  const [user, setUser] = useState<UserType | null>(null);
  const [profileImageError, setProfileImageError] = useState(false);

  // Load user data
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
        setProfileImageError(false);
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };
    loadUser();
  }, []);

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem('previewSidebarOpen', sidebarOpen.toString());
  }, [sidebarOpen]);

  // Close language dropdown on outside click
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

  // Handle scroll to section
  const scrollToSection = useCallback(
    (sectionId: string) => {
      if (onSectionScroll) {
        onSectionScroll(sectionId);
      }
      setIsMobileDrawerOpen(false);
    },
    [onSectionScroll]
  );

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const languages = [
    { code: 'en', label: 'English', displayCode: 'EN', FlagComponent: CA },
    { code: 'fr', label: 'Français', displayCode: 'FR', FlagComponent: QuebecFlag },
  ];

  const currentLang = languages.find(l => l.code === language);

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

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(href);
  };

  // Context value
  const contextValue: PreviewLayoutContextValue = {
    activeSectionId,
    sections,
    scrollToSection,
    isMobileDrawerOpen,
    setMobileDrawerOpen: setIsMobileDrawerOpen,
  };

  return (
    <PreviewLayoutContext.Provider value={contextValue}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Skip Link for Accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-momentum-orange focus:text-white focus:rounded-lg"
        >
          Skip to main content
        </a>

        {/* Mobile Header - Visible only on mobile */}
        <MobileHeader
          title={planTitle || 'Business Plan'}
          onMenuClick={() => setIsMobileDrawerOpen(true)}
          onExportClick={onExport}
          onShareClick={onShare}
          isExporting={isExporting}
          showActions={!!(onExport || onShare)}
        />

        {/* Mobile Drawer - Full-screen overlay navigation */}
        <MobileDrawer
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
          planName={planTitle}
        >
          {sidebar}
        </MobileDrawer>

        {/* Desktop Sidebar */}
        <aside
          className={`hidden lg:flex fixed inset-y-0 left-0 z-40 bg-white dark:bg-gray-800 border-r-2 border-gray-200 dark:border-gray-700 transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'w-64' : 'w-20'
          }`}
        >
          <div className="flex flex-col h-full w-full">
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-4 border-b-2 border-gray-200 dark:border-gray-700">
              {sidebarOpen ? (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 group flex-1"
                >
                  <div className="relative p-2 rounded-lg bg-[#1A2B47]">
                    <Brain className="text-white" size={24} />
                  </div>
                  <span className="text-xl font-bold text-[#1A2B47] dark:text-white">Sqordia</span>
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className="flex items-center justify-center w-full"
                >
                  <div className="relative p-2 rounded-lg bg-[#1A2B47]">
                    <Brain className="text-white" size={24} />
                  </div>
                </Link>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-[#1A2B47] dark:text-gray-300 transition-colors"
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? (
                  <ChevronLeft className="w-5 h-5" />
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* User Info */}
            <div className={`${sidebarOpen ? 'px-6' : 'px-3'} py-4 border-b-2 border-gray-200 dark:border-gray-700`}>
              <div className="flex items-center gap-3">
                {user?.profilePictureUrl && !profileImageError ? (
                  <img
                    src={user.profilePictureUrl}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700 flex-shrink-0"
                    onError={() => setProfileImageError(true)}
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 bg-[#F4F7FA] dark:bg-gray-700">
                    <User size={20} className="text-[#1A2B47] dark:text-gray-300" />
                  </div>
                )}
                {sidebarOpen ? (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                    {user?.persona && (
                      <div className="mt-1.5">
                        <PersonaBadge persona={user.persona} language={language} />
                      </div>
                    )}
                  </div>
                ) : (
                  user?.persona && (
                    <PersonaBadge persona={user.persona} compact language={language} />
                  )
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-2 py-6 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 text-sm font-medium rounded-lg transition-all ${
                      active
                        ? 'font-semibold bg-[#F4F7FA] dark:bg-gray-700 text-[#1A2B47] dark:text-white border-l-4 border-[#FF6B00]'
                        : 'text-[#1A2B47] dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    title={!sidebarOpen ? item.name : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span>{item.name}</span>}
                  </Link>
                );
              })}

              {/* Admin Link - if user is admin */}
              {user?.roles?.includes('Admin') && (
                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                  {adminNavigation.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        className={`flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 text-sm font-medium rounded-lg transition-all ${
                          active
                            ? 'font-semibold bg-[#F4F7FA] dark:bg-gray-700 text-[#1A2B47] dark:text-white border-l-4 border-[#FF6B00]'
                            : 'text-[#1A2B47] dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        title={!sidebarOpen ? item.name : undefined}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        {sidebarOpen && <span>{item.name}</span>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </nav>

            {/* Language Selector, Theme Toggle & Logout */}
            <div className={`${sidebarOpen ? 'p-4' : 'p-2'} border-t-2 border-gray-200 dark:border-gray-700 space-y-2`}>
              {/* Language Selector */}
              <div className="relative language-selector">
                <button
                  onClick={() => setIsLangOpen(!isLangOpen)}
                  className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'} w-full ${sidebarOpen ? 'px-4' : 'px-2'} py-3 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-[#1A2B47] dark:text-gray-200 transition-colors`}
                  title={!sidebarOpen ? currentLang?.label : undefined}
                >
                  <div className="w-6 h-4 rounded overflow-hidden flex items-center justify-center flex-shrink-0">
                    {currentLang?.FlagComponent && (
                      <FlagIcon FlagComponent={currentLang.FlagComponent} size={24} />
                    )}
                  </div>
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-left font-semibold">{currentLang?.label}</span>
                      <ChevronDown size={16} className={`transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
                    </>
                  )}
                </button>

                {isLangOpen && sidebarOpen && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 language-selector">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code as 'en' | 'fr');
                          setIsLangOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                          language === lang.code
                            ? 'font-semibold bg-[#F4F7FA] dark:bg-gray-700 text-[#1A2B47] dark:text-white'
                            : 'text-[#1A2B47] dark:text-gray-200'
                        }`}
                      >
                        <div className="w-8 h-5 rounded overflow-hidden flex items-center justify-center flex-shrink-0">
                          {lang.FlagComponent && (
                            <FlagIcon FlagComponent={lang.FlagComponent} size={32} />
                          )}
                        </div>
                        <span className="font-medium">{lang.label}</span>
                        {language === lang.code && (
                          <div className="ml-auto w-2 h-2 rounded-full bg-[#FF6B00]"></div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={toggleTheme}
                className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'} w-full ${sidebarOpen ? 'px-4' : 'px-2'} py-3 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-[#1A2B47] dark:text-gray-200 transition-colors`}
                aria-label="Toggle theme"
                title={!sidebarOpen ? (theme === 'light' ? t('nav.darkMode') : t('nav.lightMode')) : undefined}
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <Sun className="w-5 h-5 flex-shrink-0" />
                )}
                {sidebarOpen && <span>{theme === 'light' ? t('nav.darkMode') : t('nav.lightMode')}</span>}
              </button>
              <button
                onClick={handleLogout}
                className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'} w-full ${sidebarOpen ? 'px-4' : 'px-2'} py-3 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-[#1A2B47] dark:text-gray-200 transition-colors`}
                title={!sidebarOpen ? t('nav.logout') : undefined}
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{t('nav.logout')}</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area - with left margin for sidebar */}
        <main
          id="main-content"
          className={`min-h-screen pt-16 lg:pt-0 pb-20 lg:pb-0 transition-all duration-300 ${
            sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
          }`}
          role="main"
          aria-label="Business plan content"
        >
          {children}
        </main>

        {/* Bottom Tab Bar - Mobile only */}
        <BottomTabBar
          onSectionsClick={() => setIsMobileDrawerOpen(true)}
          isSectionsOpen={isMobileDrawerOpen}
          className="lg:hidden"
        />
      </div>
    </PreviewLayoutContext.Provider>
  );
}
