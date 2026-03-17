import { useState, useEffect, useRef } from 'react';
import { Menu, X, Brain, Sun, Moon, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { usePublishedContent } from '@/hooks/usePublishedContent';
import { cn } from '@/lib/utils';
import LanguageDropdown from './LanguageDropdown';

interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

type NavEntry = NavItem | NavGroup;

function isNavGroup(entry: NavEntry): entry is NavGroup {
  return 'items' in entry;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { theme, toggleTheme, t, language } = useTheme();
  const { getBlockContent } = usePublishedContent();
  const location = useLocation();

  const cmsLogoUrl = getBlockContent('global.branding.logo_url');

  const navEntries: NavEntry[] = [
    {
      label: t('nav.product'),
      items: [
        { label: t('nav.features'), href: '#features' },
        { label: t('nav.howItWorks'), href: '#personas' },
        { label: t('nav.comparison'), href: '#comparison' },
      ],
    },
    { label: t('nav.pricing'), href: '#pricing' },
    {
      label: t('nav.resources'),
      items: [
        { label: t('nav.faq'), href: '#faq' },
        { label: t('nav.blog'), href: '/blog' },
        { label: t('nav.help'), href: '/help' },
      ],
    },
    { label: t('nav.testimonials'), href: '#testimonials' },
  ];

  const isLandingPage = location.pathname === '/' || location.pathname === '/fr';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    setIsMenuOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  const isDark = theme === 'dark';
  const isFloating = isScrolled || !isLandingPage;

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      if (!isLandingPage) {
        const base = language === 'fr' ? '/fr' : '/';
        window.location.href = `${base}${href}`;
        return;
      }
      const element = document.querySelector(href);
      if (element) {
        const headerHeight = headerRef.current?.offsetHeight || 80;
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - headerHeight - 20;
        window.scrollTo({
          top: Math.max(0, offsetPosition),
          behavior: 'smooth',
        });
      }
      setIsMenuOpen(false);
      setOpenDropdown(null);
    }
  };

  const handleDropdownEnter = (label: string) => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setOpenDropdown(label);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  const textColor = isDark ? '#F3F4F6' : '#181B22';

  return (
    <header ref={headerRef} className="fixed top-0 left-0 right-0 z-50">
      {/* Floating glass pill nav */}
      <nav
        className={cn(
          'transition-all duration-500 ease-out',
          isFloating
            ? cn(
                'mx-3 sm:mx-4 lg:mx-auto mt-3 max-w-[1100px] rounded-2xl backdrop-blur-xl border',
                isDark
                  ? 'bg-[#181B22]/80 border-white/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.25)]'
                  : 'bg-white/80 border-gray-200/40 shadow-[0_8px_30px_rgba(0,0,0,0.06)]',
              )
            : '',
        )}
      >
        <div
          className={cn(
            'flex items-center justify-between transition-all duration-500',
            isFloating ? 'h-14 px-4 sm:px-5' : 'h-20 container mx-auto px-4 sm:px-6 lg:px-8',
          )}
        >
          {/* Logo */}
          <Link
            to={language === 'fr' ? '/fr' : '/'}
            className="flex items-center gap-2.5 group"
            aria-label="Sqordia - Home"
          >
            {cmsLogoUrl ? (
              <img
                src={cmsLogoUrl}
                alt="Sqordia logo"
                className={cn(
                  'rounded-xl object-contain transition-all duration-300 group-hover:scale-105',
                  isFloating ? 'w-8 h-8' : 'w-10 h-10',
                )}
              />
            ) : (
              <div
                className={cn(
                  'rounded-xl bg-momentum-orange flex items-center justify-center transition-all duration-300 group-hover:scale-105 shadow-sm',
                  isFloating ? 'w-8 h-8' : 'w-10 h-10',
                )}
              >
                <Brain className="text-white" size={isFloating ? 18 : 22} aria-hidden="true" />
              </div>
            )}
            <span
              className={cn(
                'font-bold font-heading tracking-tight transition-all duration-300',
                isFloating ? 'text-xl' : 'text-2xl',
              )}
              style={{ color: textColor }}
            >
              Sqordia
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-0.5">
            {navEntries.map((entry) =>
              isNavGroup(entry) ? (
                <div
                  key={entry.label}
                  className="relative"
                  onMouseEnter={() => handleDropdownEnter(entry.label)}
                  onMouseLeave={handleDropdownLeave}
                  onFocus={() => handleDropdownEnter(entry.label)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      handleDropdownLeave();
                    }
                  }}
                >
                  <button
                    className={cn(
                      'flex items-center gap-1 px-3.5 py-2 rounded-lg transition-all duration-200 font-medium text-sm',
                      'hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
                      'focus:outline-none focus:ring-2 focus:ring-momentum-orange/40',
                    )}
                    style={{ color: textColor }}
                    aria-expanded={openDropdown === entry.label}
                    aria-haspopup="true"
                    onClick={() => setOpenDropdown(openDropdown === entry.label ? null : entry.label)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') {
                        setOpenDropdown(null);
                        e.currentTarget.focus();
                      }
                    }}
                  >
                    {entry.label}
                    <ChevronDown
                      size={14}
                      className={cn(
                        'transition-transform duration-200 opacity-50',
                        openDropdown === entry.label && 'rotate-180',
                      )}
                    />
                  </button>

                  {/* Dropdown */}
                  {openDropdown === entry.label && (
                    <div
                      className={cn(
                        'absolute top-full left-0 mt-2 py-2 min-w-[200px] rounded-xl backdrop-blur-xl border shadow-lg animate-slide-down',
                        isDark
                          ? 'bg-[#181B22]/90 border-white/[0.08]'
                          : 'bg-white/90 border-gray-200/50',
                      )}
                    >
                      {entry.items.map((item) => (
                        <a
                          key={item.href}
                          href={item.href}
                          onClick={(e) => handleNavClick(e, item.href)}
                          className={cn(
                            'block px-4 py-2.5 text-sm font-medium transition-colors duration-150',
                            isDark
                              ? 'text-gray-300 hover:text-white hover:bg-white/[0.06]'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-black/[0.04]',
                          )}
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <a
                  key={entry.href}
                  href={entry.href}
                  onClick={(e) => handleNavClick(e, entry.href)}
                  className={cn(
                    'px-3.5 py-2 rounded-lg transition-all duration-200 font-medium text-sm',
                    'hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
                    'focus:outline-none focus:ring-2 focus:ring-momentum-orange/40',
                  )}
                  style={{ color: textColor }}
                >
                  {entry.label}
                </a>
              ),
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <LanguageDropdown variant="toggle" />
            <button
              onClick={toggleTheme}
              className={cn(
                'p-2 rounded-lg transition-all duration-200',
                'hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
                'focus:outline-none focus:ring-2 focus:ring-momentum-orange/40',
              )}
              style={{ color: textColor }}
              aria-label={isDark ? t('nav.switchToLight') : t('nav.switchToDark')}
            >
              {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
            </button>
            <Link
              to="/login"
              className={cn(
                'px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm',
                'hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
                'focus:outline-none focus:ring-2 focus:ring-momentum-orange/40',
              )}
              style={{ color: textColor }}
            >
              {t('nav.login')}
            </Link>
            <Link
              to="/register"
              className="px-5 py-2 rounded-xl font-semibold text-sm text-white bg-momentum-orange hover:bg-[#E55F00] transition-all duration-200 shadow-[0_2px_8px_rgba(255,107,0,0.3)] hover:shadow-[0_4px_16px_rgba(255,107,0,0.4)] hover:-translate-y-px focus:outline-none focus:ring-2 focus:ring-momentum-orange/50"
            >
              {t('nav.getstarted')}
            </Link>
          </div>

          {/* Mobile Controls */}
          <div className="flex lg:hidden items-center gap-1.5">
            <LanguageDropdown variant="toggle" onSelect={() => setIsMenuOpen(false)} />
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-momentum-orange/40"
              style={{ color: textColor }}
              aria-label={isDark ? t('nav.switchToLight') : t('nav.switchToDark')}
            >
              {isDark ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
            </button>
            <button
              className="p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-momentum-orange/40"
              style={{ color: textColor }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu — glass card */}
      {isMenuOpen && (
        <div
          className={cn(
            'lg:hidden mt-2 mx-3 sm:mx-4 rounded-2xl backdrop-blur-xl border animate-slide-down',
            isDark
              ? 'bg-[#181B22]/95 border-white/[0.06] shadow-[0_8px_30px_rgba(0,0,0,0.3)]'
              : 'bg-white/95 border-gray-200/40 shadow-[0_8px_30px_rgba(0,0,0,0.08)]',
          )}
        >
          <div className="p-4 flex flex-col gap-1">
            {navEntries.map((entry) =>
              isNavGroup(entry) ? (
                <div key={entry.label}>
                  <button
                    onClick={() => setOpenDropdown(openDropdown === entry.label ? null : entry.label)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-3 rounded-xl transition-all duration-200 font-medium min-h-[44px]',
                      'hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
                      'focus:outline-none focus:ring-2 focus:ring-momentum-orange/40',
                    )}
                    style={{ color: isDark ? '#F3F4F6' : '#181B22' }}
                  >
                    {entry.label}
                    <ChevronDown
                      size={16}
                      className={cn(
                        'transition-transform duration-200 opacity-50',
                        openDropdown === entry.label && 'rotate-180',
                      )}
                    />
                  </button>
                  {openDropdown === entry.label && (
                    <div className="pl-3 space-y-0.5">
                      {entry.items.map((item) => (
                        <a
                          key={item.href}
                          href={item.href}
                          onClick={(e) => handleNavClick(e, item.href)}
                          className={cn(
                            'block px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium',
                            isDark
                              ? 'text-gray-400 hover:text-white hover:bg-white/[0.06]'
                              : 'text-gray-500 hover:text-gray-900 hover:bg-black/[0.04]',
                          )}
                        >
                          {item.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <a
                  key={entry.href}
                  href={entry.href}
                  onClick={(e) => handleNavClick(e, entry.href)}
                  className={cn(
                    'px-3 py-3 rounded-xl transition-all duration-200 font-medium min-h-[44px] flex items-center',
                    'hover:bg-black/[0.04] dark:hover:bg-white/[0.06]',
                    'focus:outline-none focus:ring-2 focus:ring-momentum-orange/40',
                  )}
                  style={{ color: isDark ? '#F3F4F6' : '#181B22' }}
                >
                  {entry.label}
                </a>
              ),
            )}

            {/* Mobile Language */}
            <div className={cn('pt-3 mt-2 border-t', isDark ? 'border-white/[0.06]' : 'border-gray-200/50')}>
              <span className={cn('text-xs font-medium block mb-2 px-3', isDark ? 'text-gray-500' : 'text-gray-400')}>
                {t('nav.language')}
              </span>
              <div className="px-3">
                <LanguageDropdown variant="toggle" onSelect={() => setIsMenuOpen(false)} />
              </div>
            </div>

            {/* Mobile Actions */}
            <div className={cn('pt-3 mt-2 space-y-2 border-t', isDark ? 'border-white/[0.06]' : 'border-gray-200/50')}>
              <Link
                to="/login"
                className={cn(
                  'block w-full px-4 py-3 text-center rounded-xl font-medium border transition-all duration-200',
                  isDark
                    ? 'text-white border-white/[0.1] hover:bg-white/[0.06]'
                    : 'text-gray-800 border-gray-200 hover:bg-gray-50',
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="block w-full px-4 py-3 text-center rounded-xl font-semibold text-white bg-momentum-orange hover:bg-[#E55F00] transition-all duration-200 shadow-[0_2px_8px_rgba(255,107,0,0.3)]"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.getstarted')}
              </Link>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-down {
          animation: slide-down 0.25s ease-out;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-slide-down { animation: none !important; }
        }
      `}</style>
    </header>
  );
}
