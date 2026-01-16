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
  Menu,
  X,
  Settings,
  Receipt,
  Brain,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Globe,
  ChevronDown
} from 'lucide-react';
import { authService } from '../lib/auth-service';
import { User as UserType } from '../lib/types';
import { useTheme } from '../contexts/ThemeContext';

// UK Flag Icon Component
const UKFlag = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size * 0.6}
    viewBox="0 0 60 36"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="60" height="36" fill="#012169" />
    <path d="M0 0 L60 36 M60 0 L0 36" stroke="#FFFFFF" strokeWidth="4" />
    <path d="M0 0 L60 36 M60 0 L0 36" stroke="#C8102E" strokeWidth="2.4" />
    <path d="M30 0 L30 36 M0 18 L60 18" stroke="#FFFFFF" strokeWidth="6" />
    <path d="M30 0 L30 36 M0 18 L60 18" stroke="#C8102E" strokeWidth="4" />
    <path d="M0 0 L60 0 L60 36 L0 36 Z" stroke="#FFFFFF" strokeWidth="2" fill="none" />
  </svg>
);

// France Flag Icon Component
const FranceFlag = ({ size = 20, className = '' }: { size?: number; className?: string }) => (
  <svg
    width={size}
    height={size * 0.6}
    viewBox="0 0 60 40"
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="20" height="40" x="0" y="0" fill="#002654" />
    <rect width="20" height="40" x="20" y="0" fill="#FFFFFF" />
    <rect width="20" height="40" x="40" y="0" fill="#ED2939" />
  </svg>
);

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme, language, setLanguage, t } = useTheme();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem('dashboardSidebarOpen');
    return saved !== null ? saved === 'true' : true;
  });
  const [user, setUser] = useState<UserType | null>(null);
  const [profileImageError, setProfileImageError] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    localStorage.setItem('dashboardSidebarOpen', sidebarOpen.toString());
  }, [sidebarOpen]);

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

  const loadUser = async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
      setProfileImageError(false); // Reset error when user changes
    } catch (error) {
      console.error('Failed to load user:', error);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login');
  };

  const languages = [
    { code: 'en', label: 'English', displayCode: 'EN', FlagIcon: UKFlag },
    { code: 'fr', label: 'Français', displayCode: 'FR', FlagIcon: FranceFlag },
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

  // Landing page color theme
  const strategyBlue = '#1A2B47';
  const momentumOrange = '#FF6B00';
  const momentumOrangeHover = '#E55F00';
  const lightAIGrey = '#F4F7FA';

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b-2 border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between px-4 h-16">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="relative p-1.5 rounded-lg" style={{ backgroundColor: strategyBlue }}>
              <Brain className="text-white" size={20} />
            </div>
            <span className="text-lg font-bold dark:text-white" style={{ color: strategyBlue }}>Sqordia</span>
          </Link>
          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="relative language-selector">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2 px-3 py-2 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
              >
                <div className="w-6 h-4 rounded overflow-hidden flex items-center justify-center">
                  {currentLang?.FlagIcon && <currentLang.FlagIcon size={24} />}
                </div>
                <span className="text-sm font-semibold">{currentLang?.displayCode}</span>
                <ChevronDown size={16} className={`transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 language-selector">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as 'en' | 'fr');
                        setIsLangOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                        language === lang.code 
                          ? 'bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-200 font-semibold' 
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      <div className="w-8 h-5 rounded overflow-hidden flex items-center justify-center flex-shrink-0">
                        {lang.FlagIcon && <lang.FlagIcon size={32} />}
                      </div>
                      <span className={`font-medium ${language === lang.code ? '' : 'dark:text-gray-100'}`}>{lang.label}</span>
                      {language === lang.code && (
                        <div className="ml-auto w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <div className="flex pt-16 lg:pt-0">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 bg-white dark:bg-gray-800 border-r-2 border-gray-200 dark:border-gray-700 transform transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'w-64' : 'w-20'
          } lg:translate-x-0 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Logo - Desktop */}
            <div className="hidden lg:flex items-center justify-between h-16 px-4 border-b-2 border-gray-200 dark:border-gray-700">
              {sidebarOpen ? (
                <Link
                  to="/dashboard"
                  className="flex items-center gap-3 group flex-1"
                >
                  <div className="relative p-2 rounded-lg" style={{ backgroundColor: strategyBlue }}>
                    <Brain className="text-white" size={24} />
                  </div>
                  <span className="text-xl font-bold dark:text-white" style={{ color: strategyBlue }}>Sqordia</span>
                </Link>
              ) : (
                <Link
                  to="/dashboard"
                  className="flex items-center justify-center w-full"
                >
                  <div className="relative p-2 rounded-lg" style={{ backgroundColor: strategyBlue }}>
                    <Brain className="text-white" size={24} />
                  </div>
                </Link>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-300 transition-colors"
                style={{ color: strategyBlue }}
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
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 dark:bg-gray-700" style={{ backgroundColor: lightAIGrey }}>
                    <User size={20} className="dark:text-gray-300" style={{ color: strategyBlue }} />
                  </div>
                )}
                {sidebarOpen && (
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {user?.email}
                    </p>
                  </div>
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
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 text-sm font-medium rounded-lg transition-all ${
                      active
                        ? 'font-semibold dark:bg-gray-700 dark:text-white'
                        : 'dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    style={active ? {
                      backgroundColor: theme === 'dark' ? undefined : lightAIGrey,
                      color: theme === 'dark' ? undefined : strategyBlue,
                      borderLeft: `4px solid ${momentumOrange}`
                    } : {
                      color: theme === 'dark' ? undefined : strategyBlue
                    }}
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
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center ${sidebarOpen ? 'gap-3 px-4' : 'justify-center px-2'} py-3 text-sm font-medium rounded-lg transition-all ${
                          active
                            ? 'font-semibold dark:bg-gray-700 dark:text-white'
                            : 'dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        style={active ? {
                          backgroundColor: theme === 'dark' ? undefined : lightAIGrey,
                          color: theme === 'dark' ? undefined : strategyBlue,
                          borderLeft: `4px solid ${momentumOrange}`
                        } : {
                          color: theme === 'dark' ? undefined : strategyBlue
                        }}
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
                  className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'} w-full ${sidebarOpen ? 'px-4' : 'px-2'} py-3 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 transition-colors`}
                  style={{ color: theme === 'dark' ? undefined : strategyBlue }}
                  title={!sidebarOpen ? currentLang?.label : undefined}
                >
                  <div className="w-6 h-4 rounded overflow-hidden flex items-center justify-center flex-shrink-0">
                    {currentLang?.FlagIcon && <currentLang.FlagIcon size={24} />}
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
                            ? 'font-semibold dark:bg-gray-700 dark:text-white' 
                            : 'dark:text-gray-200'
                        }`}
                        style={language === lang.code ? {
                          backgroundColor: theme === 'dark' ? undefined : lightAIGrey,
                          color: theme === 'dark' ? undefined : strategyBlue
                        } : {
                          color: theme === 'dark' ? undefined : strategyBlue
                        }}
                      >
                        <div className="w-8 h-5 rounded overflow-hidden flex items-center justify-center flex-shrink-0">
                          {lang.FlagIcon && <lang.FlagIcon size={32} />}
                        </div>
                        <span className="font-medium">{lang.label}</span>
                        {language === lang.code && (
                          <div className="ml-auto w-2 h-2 rounded-full" style={{ backgroundColor: momentumOrange }}></div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={toggleTheme}
                className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'} w-full ${sidebarOpen ? 'px-4' : 'px-2'} py-3 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 transition-colors`}
                style={{ color: theme === 'dark' ? undefined : strategyBlue }}
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
                className={`flex items-center ${sidebarOpen ? 'gap-3' : 'justify-center'} w-full ${sidebarOpen ? 'px-4' : 'px-2'} py-3 text-sm font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-gray-200 transition-colors`}
                style={{ color: theme === 'dark' ? undefined : strategyBlue }}
                title={!sidebarOpen ? t('nav.logout') : undefined}
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{t('nav.logout')}</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* Mobile Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className={`flex-1 min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
          <div className="p-4 sm:p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

