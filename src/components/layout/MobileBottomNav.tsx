import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
  Menu,
  X,
  LogOut,
  Sun,
  Moon,
  User,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NavItemConfig {
  name: string;
  href: string;
  icon: React.ElementType;
  accent?: boolean;
}

export interface MobileBottomNavProps {
  /** Main items shown in the bottom bar (max 3-4 recommended) */
  mainNavItems: NavItemConfig[];
  /** Items shown in the "More" menu */
  moreMenuItems?: NavItemConfig[];
  /** Optional back link (e.g., for admin to go back to dashboard) */
  backLink?: {
    label: string;
    href: string;
  };
  /** User info for profile display */
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    profilePictureUrl?: string | null;
    roles?: string[];
  } | null;
  /** Logout handler */
  onLogout?: () => void;
  /** Translation function */
  t: (key: string) => string;
  /** Current theme */
  theme?: 'light' | 'dark';
  /** Theme toggle handler */
  onThemeToggle?: () => void;
  /** Current language */
  language?: 'en' | 'fr';
  /** Language change handler */
  onLanguageChange?: (lang: 'en' | 'fr') => void;
  /** Whether to show user profile in menu */
  showUserProfile?: boolean;
}

export function MobileBottomNav({
  mainNavItems,
  moreMenuItems = [],
  backLink,
  user,
  onLogout,
  t,
  theme = 'light',
  onThemeToggle,
  language = 'en',
  onLanguageChange,
  showUserProfile = true,
}: MobileBottomNavProps) {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (href: string) => {
    // Exact match for root paths
    if (href === '/dashboard' || href === '/admin') {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const isMoreActive = moreMenuItems.some(item => isActive(item.href));

  const hasMoreMenu = moreMenuItems.length > 0 || backLink || onThemeToggle || onLanguageChange || onLogout;

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        <div className="bg-background border-t border-border shadow-lg">
          <div className="flex items-center justify-around px-2 h-16 max-w-lg mx-auto">
            {mainNavItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex flex-col items-center justify-center flex-1 h-full px-2 py-1 rounded-xl transition-all duration-200',
                    active && 'text-primary',
                    !active && 'text-muted-foreground hover:text-foreground',
                    item.accent && !active && 'text-momentum-orange'
                  )}
                >
                  <div
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200',
                      active && 'bg-primary/10 scale-105',
                      item.accent && !active && 'bg-momentum-orange/10'
                    )}
                  >
                    <Icon className={cn('h-5 w-5', item.accent && !active && 'text-momentum-orange')} />
                  </div>
                  <span className={cn('text-[10px] font-medium mt-0.5', active && 'font-semibold')}>
                    {item.name}
                  </span>
                </Link>
              );
            })}

            {/* More Menu Button */}
            {hasMoreMenu && (
              <button
                onClick={() => setIsMenuOpen(true)}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full px-2 py-1 rounded-xl transition-all duration-200',
                  isMoreActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <div
                  className={cn(
                    'flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200',
                    isMoreActive && 'bg-primary/10'
                  )}
                >
                  <Menu className="h-5 w-5" />
                </div>
                <span className={cn('text-[10px] font-medium mt-0.5', isMoreActive && 'font-semibold')}>
                  {language === 'fr' ? 'Plus' : 'More'}
                </span>
              </button>
            )}
          </div>
          {/* iOS safe area padding */}
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      </nav>

      {/* Full Screen Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu Panel */}
          <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85vh] overflow-hidden flex flex-col">
            {/* Handle bar */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 rounded-full bg-muted-foreground/20" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-border">
              <h2 className="text-lg font-semibold">{language === 'fr' ? 'Menu' : 'Menu'}</h2>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 -mr-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {/* Back Link */}
              {backLink && (
                <div className="p-4 pb-2">
                  <Link
                    to={backLink.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl bg-muted/50 hover:bg-muted transition-all duration-150"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10">
                      <ArrowLeft className="h-5 w-5 text-primary" />
                    </div>
                    <span className="flex-1 font-medium">{backLink.label}</span>
                  </Link>
                </div>
              )}

              {/* User Profile Card */}
              {showUserProfile && user && (
                <div className="p-4 mx-4 mt-2 rounded-2xl bg-muted/50">
                  <div className="flex items-center gap-3">
                    {user.profilePictureUrl ? (
                      <img
                        src={user.profilePictureUrl}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="h-12 w-12 rounded-xl object-cover ring-2 ring-background"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-strategy-blue/20 to-strategy-blue/5 text-strategy-blue">
                        <User className="h-6 w-6" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Links */}
              {moreMenuItems.length > 0 && (
                <div className="p-4 space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                    {language === 'fr' ? 'Navigation' : 'Navigation'}
                  </p>
                  {moreMenuItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setIsMenuOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-150',
                          active ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-muted text-foreground'
                        )}
                      >
                        <div
                          className={cn(
                            'flex items-center justify-center w-10 h-10 rounded-xl',
                            active ? 'bg-primary/10' : 'bg-muted'
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="flex-1">{item.name}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Preferences Section */}
              {(onThemeToggle || onLanguageChange) && (
                <div className="p-4 pt-0 space-y-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-2">
                    {language === 'fr' ? 'Préférences' : 'Preferences'}
                  </p>

                  {/* Theme Toggle */}
                  {onThemeToggle && (
                    <button
                      onClick={onThemeToggle}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted transition-all duration-150 w-full text-left"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted">
                        {theme === 'light' ? (
                          <Moon className="h-5 w-5" />
                        ) : (
                          <Sun className="h-5 w-5 text-amber-500" />
                        )}
                      </div>
                      <span className="flex-1">
                        {theme === 'light' ? t('nav.darkMode') : t('nav.lightMode')}
                      </span>
                    </button>
                  )}

                  {/* Language Toggle */}
                  {onLanguageChange && (
                    <button
                      onClick={() => onLanguageChange(language === 'en' ? 'fr' : 'en')}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-muted transition-all duration-150 w-full text-left"
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-muted text-lg">
                        {language === 'en' ? '🇨🇦' : '⚜️'}
                      </div>
                      <span className="flex-1">
                        {language === 'en' ? 'Français' : 'English'}
                      </span>
                    </button>
                  )}
                </div>
              )}

              {/* Logout */}
              {onLogout && (
                <div className="p-4 pt-0">
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      onLogout();
                    }}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-destructive/10 transition-all duration-150 w-full text-left text-destructive"
                  >
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-destructive/10">
                      <LogOut className="h-5 w-5" />
                    </div>
                    <span className="flex-1 font-medium">{t('nav.logout')}</span>
                  </button>
                </div>
              )}
            </div>

            {/* iOS safe area */}
            <div className="h-[env(safe-area-inset-bottom)]" />
          </div>
        </div>
      )}
    </>
  );
}

export default MobileBottomNav;
