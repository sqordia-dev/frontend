import { useState, useEffect, useRef } from 'react';
import { Menu, X, Brain, Sun, Moon, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '@/lib/utils';
import CA from 'country-flag-icons/react/3x2/CA';

// ── Shared flag components ──────────────────────────────────────────────────
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

const FlagIcon = ({
  FlagComponent,
  size = 20,
  className = '',
}: {
  FlagComponent: React.ComponentType<any>;
  size?: number;
  className?: string;
}) => (
  <div className={cn('inline-block leading-[0]', className)} style={{ width: size, height: size * 0.67 }}>
    <FlagComponent className="block w-full h-full" title="" />
  </div>
);

// ── Constants ───────────────────────────────────────────────────────────────
const NAV_ITEMS = ['features', 'pricing', 'example-plans', 'about', 'blog', 'contact'] as const;
const NAV_KEY_MAP: Record<string, string> = { 'example-plans': 'examplePlans' };
const LANGUAGES = [
  { code: 'en' as const, label: 'English', displayCode: 'EN', FlagComponent: CA },
  { code: 'fr' as const, label: 'Fran\u00e7ais', displayCode: 'FR', FlagComponent: QuebecFlag },
];
const NO_HERO_PAGES = ['/example-plans', '/login', '/register', '/forgot-password', '/reset-password'];

// ── Header ──────────────────────────────────────────────────────────────────
export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const { theme, language, toggleTheme, setLanguage, t } = useTheme();
  const headerRef = useRef<HTMLElement>(null);
  const location = useLocation();

  const hasDarkHero = !NO_HERO_PAGES.some((p) => location.pathname.startsWith(p));
  // Text should be light when floating over a dark hero in dark mode
  const isLightText = !isScrolled && hasDarkHero && theme === 'dark';
  // Header has a solid (blurred) background
  const hasBg = isScrolled || !hasDarkHero;

  // Scroll tracking
  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 20);
      const y = window.scrollY + 150;
      for (const id of NAV_ITEMS) {
        const el = document.getElementById(id);
        if (el && y >= el.offsetTop && y < el.offsetTop + el.offsetHeight) {
          setActiveSection(id);
          return;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close language dropdown on outside click
  useEffect(() => {
    if (!isLangOpen) return;
    const close = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.lang-sel')) setIsLangOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [isLangOpen]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, section: string) => {
    e.preventDefault();
    if (section === 'example-plans') { window.location.href = '/example-plans'; return; }
    if (location.pathname !== '/') {
      sessionStorage.setItem('scrollToSection', section);
      window.location.href = '/';
      return;
    }
    const el = document.getElementById(section);
    if (el) {
      const offset = (headerRef.current?.offsetHeight || 80) + 20;
      window.scrollTo({
        top: Math.max(0, el.getBoundingClientRect().top + window.scrollY - offset),
        behavior: 'smooth',
      });
    }
    setIsMenuOpen(false);
  };

  const currentLang = LANGUAGES.find((l) => l.code === language);

  // Reusable text color class based on header state
  const textCls = isLightText
    ? 'text-white'
    : 'text-strategy-blue dark:text-gray-100';

  return (
    <header
      ref={headerRef}
      className={cn(
        'fixed top-0 w-full z-50 transition-all duration-300 ease-smooth',
        hasBg
          ? 'bg-white/85 dark:bg-gray-900/85 backdrop-blur-xl border-b border-gray-200/30 dark:border-gray-700/20 shadow-soft'
          : 'bg-transparent border-b border-transparent',
      )}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px]">

          {/* ── Logo ── */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className={cn(
              'p-2 rounded-lg transition-colors duration-200',
              hasBg ? 'bg-strategy-blue' : 'bg-white dark:bg-white/10',
            )}>
              <Brain
                size={22}
                className={cn('transition-colors duration-200', hasBg ? 'text-white' : 'text-strategy-blue dark:text-white')}
              />
            </div>
            <span className={cn('text-xl font-bold font-heading tracking-tight transition-colors duration-200', textCls)}>
              Sqordia
            </span>
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden lg:flex items-center gap-0.5">
            {NAV_ITEMS.map((item) => {
              const active = activeSection === item;
              return (
                <a
                  key={item}
                  href={`#${item}`}
                  onClick={(e) => handleNavClick(e, item)}
                  className={cn(
                    'relative px-3.5 py-2 rounded-md text-label-md font-heading transition-colors duration-150',
                    active
                      ? 'text-momentum-orange'
                      : cn(textCls, 'hover:text-momentum-orange'),
                    hasBg && !active && 'hover:bg-light-ai-grey dark:hover:bg-gray-800',
                  )}
                >
                  {t(`nav.${NAV_KEY_MAP[item] || item}`)}
                  {active && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full bg-momentum-orange" />
                  )}
                </a>
              );
            })}
          </div>

          {/* ── Desktop Actions ── */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Language selector */}
            <div className="relative lang-sel">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md text-label-md transition-colors duration-150',
                  textCls,
                  hasBg ? 'hover:bg-light-ai-grey dark:hover:bg-gray-800' : 'hover:bg-white/10',
                )}
              >
                <div className="w-5 h-3.5 rounded-[2px] overflow-hidden">
                  {currentLang?.FlagComponent && <FlagIcon FlagComponent={currentLang.FlagComponent} size={20} />}
                </div>
                <span className="font-semibold font-heading text-xs">{currentLang?.displayCode}</span>
                <ChevronDown size={13} className={cn('transition-transform duration-200', isLangOpen && 'rotate-180')} />
              </button>

              {isLangOpen && (
                <div className="absolute right-0 mt-1.5 w-44 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-elevated overflow-hidden animate-scale-in origin-top-right">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code); setIsLangOpen(false); }}
                      className={cn(
                        'w-full flex items-center gap-3 px-3.5 py-2.5 text-sm transition-colors duration-100',
                        language === lang.code
                          ? 'bg-light-ai-grey dark:bg-gray-700 text-strategy-blue dark:text-white font-semibold'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60',
                      )}
                    >
                      <div className="w-6 h-4 rounded-[2px] overflow-hidden shrink-0">
                        <FlagIcon FlagComponent={lang.FlagComponent} size={24} />
                      </div>
                      <span className="flex-1 text-left">{lang.label}</span>
                      {language === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-momentum-orange" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className={cn(
                'p-2.5 rounded-md transition-colors duration-150',
                textCls,
                hasBg ? 'hover:bg-light-ai-grey dark:hover:bg-gray-800' : 'hover:bg-white/10',
              )}
              aria-label={theme === 'light' ? t('header.switchToDark') || 'Switch to dark mode' : t('header.switchToLight') || 'Switch to light mode'}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            {/* Sign In */}
            <Link
              to="/login"
              className={cn(
                'px-4 py-2 rounded-md text-label-md font-heading font-medium transition-colors duration-150',
                textCls,
                hasBg ? 'hover:bg-light-ai-grey dark:hover:bg-gray-800' : 'hover:opacity-80',
              )}
            >
              {t('nav.signin')}
            </Link>

            {/* Get Started CTA */}
            <Link
              to="/register"
              className="ml-1 px-5 py-2.5 rounded-lg bg-momentum-orange text-white text-label-md font-heading font-semibold transition-all duration-150 hover:bg-[#E55F00] shadow-sm hover:shadow-md"
            >
              {t('nav.getstarted')}
            </Link>
          </div>

          {/* ── Mobile buttons ── */}
          <div className="flex lg:hidden items-center gap-1">
            <button
              onClick={toggleTheme}
              className={cn(
                'p-2.5 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors',
                textCls, 'hover:bg-black/5 dark:hover:bg-white/10',
              )}
              aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={cn(
                'p-2.5 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors',
                textCls, 'hover:bg-black/5 dark:hover:bg-white/10',
              )}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile Menu ── */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/30 shadow-elevated animate-fade-in-down">
          <div className="container mx-auto px-5 py-5 space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = activeSection === item;
              return (
                <a
                  key={item}
                  href={`#${item}`}
                  onClick={(e) => handleNavClick(e, item)}
                  className={cn(
                    'relative block px-4 py-3 rounded-lg font-medium font-heading text-sm min-h-[44px] flex items-center transition-colors duration-100',
                    active
                      ? 'text-momentum-orange bg-light-ai-grey dark:bg-gray-800'
                      : 'text-strategy-blue dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800',
                  )}
                >
                  {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full bg-momentum-orange" />}
                  {t(`nav.${NAV_KEY_MAP[item] || item}`)}
                </a>
              );
            })}

            {/* Language (mobile) */}
            <div className="pt-3 mt-3 border-t border-gray-200/60 dark:border-gray-700/40">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 px-4 mb-2">
                Language
              </p>
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { setLanguage(lang.code); setIsMenuOpen(false); }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors',
                    language === lang.code
                      ? 'bg-light-ai-grey dark:bg-gray-800 text-strategy-blue dark:text-white font-semibold'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800',
                  )}
                >
                  <div className="w-7 h-5 rounded-[2px] overflow-hidden shrink-0">
                    <FlagIcon FlagComponent={lang.FlagComponent} size={28} />
                  </div>
                  <span className="flex-1 text-left">{lang.label}</span>
                  {language === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-momentum-orange" />}
                </button>
              ))}
            </div>

            {/* Actions (mobile) */}
            <div className="pt-3 mt-3 border-t border-gray-200/60 dark:border-gray-700/40 space-y-2">
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full px-4 py-3 text-center rounded-lg font-medium font-heading text-sm border border-gray-200 dark:border-gray-700 text-strategy-blue dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {t('nav.signin')}
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full px-4 py-3 text-center rounded-lg font-semibold font-heading text-sm bg-momentum-orange text-white hover:bg-[#E55F00] transition-colors shadow-sm"
              >
                {t('nav.getstarted')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
