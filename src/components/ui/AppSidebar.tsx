import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
  Check,
  PanelLeftClose,
  PanelLeft,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';
import CA from 'country-flag-icons/react/3x2/CA';

// Quebec Flag Component
const QuebecFlag = ({ size = 20 }: { size?: number }) => (
  <img
    src="/quebec-flag.svg"
    alt="Quebec Flag"
    width={size}
    height={size * 0.67}
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

// Types
export interface SidebarNavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: string | number;
  shortcut?: string;
}

export interface SidebarNavGroup {
  title?: string;
  items: SidebarNavItem[];
}

export interface SidebarBackLink {
  label: string;
  href: string;
}

export interface SidebarBrand {
  name: string;
  icon: LucideIcon;
  href: string;
  iconClassName?: string;
}

export interface AppSidebarProps {
  /** Brand configuration */
  brand: SidebarBrand;
  /** Navigation groups */
  navigation: SidebarNavGroup[];
  /** Back link configuration */
  backLink?: SidebarBackLink;
  /** Whether to show language selector */
  showLanguageSelector?: boolean;
  /** Whether to show theme toggle */
  showThemeToggle?: boolean;
  /** Whether to show logout button */
  showLogout?: boolean;
  /** Callback when logout is clicked */
  onLogout?: () => void;
  /** Storage key for collapse state persistence */
  storageKey?: string;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  /** Custom footer content */
  footerContent?: React.ReactNode;
  /** Mobile menu open state (controlled from parent) */
  mobileMenuOpen?: boolean;
  /** Callback to close mobile menu */
  onMobileMenuClose?: () => void;
}

const languages = [
  { code: 'en', label: 'English', displayCode: 'EN', FlagComponent: CA },
  { code: 'fr', label: 'Français', displayCode: 'FR', FlagComponent: QuebecFlag },
];

export default function AppSidebar({
  brand,
  navigation,
  backLink,
  showLanguageSelector = true,
  showThemeToggle = true,
  showLogout = true,
  onLogout,
  storageKey = 'app-sidebar-collapsed',
  defaultCollapsed = false,
  footerContent,
  mobileMenuOpen = false,
  onMobileMenuClose,
}: AppSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme, language, setLanguage, t } = useTheme();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return defaultCollapsed;
    const saved = localStorage.getItem(storageKey);
    return saved !== null ? saved === 'true' : defaultCollapsed;
  });

  const [isLangOpen, setIsLangOpen] = useState(false);

  const currentLang = languages.find(l => l.code === language);

  // Persist collapse state
  useEffect(() => {
    localStorage.setItem(storageKey, isCollapsed.toString());
  }, [isCollapsed, storageKey]);

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

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle sidebar with Cmd/Ctrl + B
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        setIsCollapsed(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = useCallback(() => {
    onLogout?.();
  }, [onLogout]);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  const BrandIcon = brand.icon;

  // Check if path is active (exact match or starts with for nested routes)
  const isPathActive = (href: string) => {
    if (href === location.pathname) return true;
    // For nested routes, check if current path starts with href (but not for root paths)
    if (href !== '/' && href.length > 1 && location.pathname.startsWith(href + '/')) return true;
    return false;
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onMobileMenuClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          width: isCollapsed ? 72 : 260,
          x: mobileMenuOpen ? 0 : undefined,
        }}
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col",
          "bg-white dark:bg-gray-900",
          "border-r border-gray-200/80 dark:border-gray-800/80",
          "transition-transform duration-300 ease-in-out",
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className={cn(
          "flex items-center h-16 border-b border-gray-100 dark:border-gray-800",
          isCollapsed ? "px-3 justify-center" : "px-4"
        )}>
          <Link
            to={brand.href}
            className="flex items-center gap-3 group flex-1 min-w-0"
            onClick={onMobileMenuClose}
          >
            <div className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl shadow-sm transition-transform duration-200 group-hover:scale-105 shrink-0",
              brand.iconClassName || "bg-momentum-orange text-white"
            )}>
              <BrandIcon className="h-5 w-5" />
            </div>
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="text-base font-bold tracking-tight text-gray-900 dark:text-white truncate"
                >
                  {brand.name}
                </motion.span>
              )}
            </AnimatePresence>
          </Link>

          {/* Mobile close button - only visible in mobile when menu is open */}
          {mobileMenuOpen && (
            <button
              onClick={onMobileMenuClose}
              className="lg:hidden flex items-center justify-center h-8 w-8 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors ml-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Back Link */}
        {backLink && (
          <div className={cn("px-3 pt-4 pb-2", isCollapsed && "px-2")}>
            <Link
              to={backLink.href}
              onClick={onMobileMenuClose}
              className={cn(
                "flex items-center gap-3 h-10 rounded-lg transition-all duration-150",
                "text-gray-500 dark:text-gray-400",
                "hover:text-gray-700 dark:hover:text-gray-200",
                "hover:bg-gray-100 dark:hover:bg-gray-800",
                isCollapsed ? "justify-center px-2" : "px-3"
              )}
              title={isCollapsed ? backLink.label : undefined}
            >
              <ChevronLeft className="h-4 w-4 shrink-0" />
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium"
                  >
                    {backLink.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          </div>
        )}

        {/* Navigation */}
        <nav className={cn(
          "flex-1 overflow-y-auto overflow-x-hidden py-3",
          isCollapsed ? "px-2" : "px-3"
        )}>
          {navigation.map((group, groupIndex) => (
            <div key={groupIndex} className={cn(groupIndex > 0 && "mt-6")}>
              {/* Group title */}
              {group.title && !isCollapsed && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500"
                >
                  {group.title}
                </motion.p>
              )}

              {/* Navigation items */}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isPathActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={onMobileMenuClose}
                      className={cn(
                        "group relative flex items-center gap-3 h-10 rounded-lg transition-all duration-150",
                        isCollapsed ? "justify-center px-2" : "px-3",
                        isActive
                          ? "bg-momentum-orange text-white shadow-sm shadow-orange-500/20"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white"
                      )}
                      title={isCollapsed ? item.name : undefined}
                    >
                      <Icon className={cn(
                        "h-[18px] w-[18px] shrink-0 transition-transform",
                        !isActive && "group-hover:scale-110"
                      )} />

                      <AnimatePresence mode="wait">
                        {!isCollapsed && (
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 text-sm font-medium truncate"
                          >
                            {item.name}
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {/* Active indicator dot */}
                      {isActive && !isCollapsed && (
                        <motion.div
                          layoutId="active-indicator"
                          className="h-1.5 w-1.5 rounded-full bg-white/70"
                        />
                      )}

                      {/* Badge */}
                      {item.badge && !isCollapsed && (
                        <span className={cn(
                          "px-1.5 py-0.5 text-[10px] font-semibold rounded-full",
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                        )}>
                          {item.badge}
                        </span>
                      )}

                      {/* Keyboard shortcut hint (shown on hover in expanded mode) */}
                      {item.shortcut && !isCollapsed && (
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono text-gray-400 dark:text-gray-500">
                          {item.shortcut}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className={cn(
          "border-t border-gray-100 dark:border-gray-800 py-3",
          isCollapsed ? "px-2" : "px-3"
        )}>
          {/* Custom footer content */}
          {footerContent}

          {/* Language Selector */}
          {showLanguageSelector && (
            <div className="relative language-selector mb-1">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className={cn(
                  "flex items-center gap-3 w-full h-10 rounded-lg transition-all duration-150",
                  "text-gray-600 dark:text-gray-400",
                  "hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
                  isCollapsed ? "justify-center px-2" : "px-3"
                )}
                title={isCollapsed ? currentLang?.label : undefined}
              >
                <div className="flex h-5 w-7 items-center justify-center rounded overflow-hidden border border-gray-200 dark:border-gray-700 shrink-0">
                  {currentLang?.FlagComponent && (
                    <FlagIcon FlagComponent={currentLang.FlagComponent} size={28} />
                  )}
                </div>
                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex-1 flex items-center justify-between"
                    >
                      <span className="text-sm font-medium">{currentLang?.label}</span>
                      <ChevronDown className={cn(
                        "h-4 w-4 text-gray-400 transition-transform duration-200",
                        isLangOpen && "rotate-180"
                      )} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>

              {/* Language dropdown */}
              <AnimatePresence>
                {isLangOpen && !isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-full left-0 right-0 mb-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50"
                  >
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
                            ? 'bg-momentum-orange/10 text-momentum-orange font-medium'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        )}
                      >
                        <div className="flex h-4 w-6 items-center justify-center rounded-sm overflow-hidden border border-gray-200/50 dark:border-gray-700/50 shrink-0">
                          <FlagIcon FlagComponent={lang.FlagComponent} size={24} />
                        </div>
                        <span className="flex-1 text-left">{lang.label}</span>
                        {language === lang.code && (
                          <Check className="h-4 w-4 text-momentum-orange" />
                        )}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Theme Toggle */}
          {showThemeToggle && (
            <button
              onClick={toggleTheme}
              className={cn(
                "flex items-center gap-3 w-full h-10 rounded-lg transition-all duration-150 mb-1",
                "text-gray-600 dark:text-gray-400",
                "hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white",
                isCollapsed ? "justify-center px-2" : "px-3"
              )}
              title={isCollapsed ? (theme === 'light' ? t('admin.theme.dark') : t('admin.theme.light')) : undefined}
            >
              <div className={cn(
                "flex h-5 w-5 items-center justify-center rounded-md transition-colors",
                theme === 'light'
                  ? "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  : "bg-amber-500/10 text-amber-500"
              )}>
                {theme === 'light' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
              </div>
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium"
                  >
                    {theme === 'light' ? t('admin.theme.dark') : t('admin.theme.light')}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          )}

          {/* Divider */}
          <div className="h-px bg-gray-100 dark:bg-gray-800 my-2" />

          {/* Collapse Toggle */}
          <button
            onClick={toggleCollapse}
            className={cn(
              "hidden lg:flex items-center gap-3 w-full h-10 rounded-lg transition-all duration-150 mb-1",
              "text-gray-500 dark:text-gray-500",
              "hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300",
              isCollapsed ? "justify-center px-2" : "px-3"
            )}
            title={isCollapsed ? (language === 'fr' ? 'Développer' : 'Expand') : undefined}
          >
            {isCollapsed ? (
              <PanelLeft className="h-4 w-4 shrink-0" />
            ) : (
              <PanelLeftClose className="h-4 w-4 shrink-0" />
            )}
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 flex items-center justify-between"
                >
                  <span className="text-sm font-medium">
                    {language === 'fr' ? 'Réduire' : 'Collapse'}
                  </span>
                  <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-gray-100 dark:bg-gray-800 rounded text-gray-500">
                    ⌘B
                  </kbd>
                </motion.div>
              )}
            </AnimatePresence>
          </button>

          {/* Logout */}
          {showLogout && onLogout && (
            <button
              onClick={handleLogout}
              className={cn(
                "flex items-center gap-3 w-full h-10 rounded-lg transition-all duration-150",
                "text-gray-500 dark:text-gray-500",
                "hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400",
                isCollapsed ? "justify-center px-2" : "px-3"
              )}
              title={isCollapsed ? t('admin.logout') : undefined}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <AnimatePresence mode="wait">
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium"
                  >
                    {t('admin.logout')}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          )}
        </div>
      </motion.aside>
    </>
  );
}

// Export sidebar width constants for layouts to use
export const SIDEBAR_WIDTH_EXPANDED = 260;
export const SIDEBAR_WIDTH_COLLAPSED = 72;
