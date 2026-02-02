import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Users,
  FileText,
  Brain,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
  ChevronDown,
  Activity,
  HeartPulse
} from 'lucide-react';
import { authService } from '../lib/auth-service';
import { useTheme } from '../contexts/ThemeContext';
import CA from 'country-flag-icons/react/3x2/CA';

// Quebec Flag Component - using local SVG file
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
    { name: t('admin.nav.businessPlans'), href: '/admin/business-plans', icon: FileText },
    { name: t('admin.nav.templates'), href: '/admin/templates', icon: FileText },
    { name: 'Prompts Studio', href: '/admin/prompts-studio', icon: Brain },
    { name: 'AI Configuration', href: '/admin/ai-config', icon: Brain },
    { name: t('admin.nav.activityLogs') || 'Activity Logs', href: '/admin/activity-logs', icon: Activity },
    { name: t('admin.nav.systemHealth') || 'System Health', href: '/admin/system-health', icon: HeartPulse },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
  ];

  const getPageTitle = () => {
    const current = navigation.find(item => item.href === location.pathname);
    return current?.name || t('admin.nav.overview');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out ${
          sidebarOpen ? 'w-64' : 'w-20'
        } ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-800">
            {sidebarOpen && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#FF6B00]">
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t('admin.title')}
                </h1>
              </div>
            )}
            {!sidebarOpen && (
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mx-auto bg-[#FF6B00]">
                <Brain className="w-6 h-6 text-white" />
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 transition-colors"
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden text-gray-600 dark:text-gray-400"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'text-white shadow-sm bg-[#FF6B00]'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  } ${!sidebarOpen ? 'justify-center' : ''}`}
                  title={!sidebarOpen ? item.name : undefined}
                >
                  <Icon className={`w-5 h-5 ${sidebarOpen ? 'mr-3' : ''} flex-shrink-0`} />
                  {sidebarOpen && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="p-3 border-t border-gray-200 dark:border-gray-800 space-y-1">
            {/* Language Selector */}
            <div className="relative language-selector">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  sidebarOpen ? '' : 'justify-center'
                } text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`}
                title={!sidebarOpen ? currentLang?.label : undefined}
              >
                <div className="w-6 h-4 rounded overflow-hidden flex items-center justify-center flex-shrink-0">
                  {currentLang?.FlagComponent && (
                    <FlagIcon FlagComponent={currentLang.FlagComponent} size={24} />
                  )}
                </div>
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left font-semibold ml-3">{currentLang?.label}</span>
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
                          ? 'font-semibold bg-gray-50 dark:bg-gray-700' 
                          : ''
                      }`}
                    >
                      <div className="w-8 h-5 rounded overflow-hidden flex items-center justify-center flex-shrink-0">
                        {lang.FlagComponent && (
                          <FlagIcon FlagComponent={lang.FlagComponent} size={32} />
                        )}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white">{lang.label}</span>
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
              className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                sidebarOpen ? '' : 'justify-center'
              } text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`}
              title={!sidebarOpen ? (theme === 'light' ? 'Dark Mode' : 'Light Mode') : undefined}
            >
              {theme === 'light' ? (
                <Moon className={`w-5 h-5 ${sidebarOpen ? 'mr-3' : ''}`} />
              ) : (
                <Sun className={`w-5 h-5 ${sidebarOpen ? 'mr-3' : ''}`} />
              )}
              {sidebarOpen && <span>{theme === 'light' ? t('admin.theme.dark') : t('admin.theme.light')}</span>}
            </button>
            <button
              onClick={handleLogout}
              className={`flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                sidebarOpen ? '' : 'justify-center'
              } text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`}
              title={!sidebarOpen ? t('admin.logout') : undefined}
            >
              <LogOut className={`w-5 h-5 ${sidebarOpen ? 'mr-3' : ''}`} />
              {sidebarOpen && <span>{t('admin.logout')}</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
      }`}>
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 backdrop-blur-sm bg-white/95 dark:bg-gray-900/95">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {getPageTitle()}
              </h2>
            </div>
            <div className="flex items-center gap-3">
              {/* Add search or other header actions here if needed */}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
