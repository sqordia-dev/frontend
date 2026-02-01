import { useState, useEffect, useRef } from 'react';
import { Menu, X, Brain, Sun, Moon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import LanguageDropdown, { THEME_ORANGE } from './LanguageDropdown';

interface NavItem {
  label: string;
  href: string;
  isExternal?: boolean;
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const { theme, toggleTheme, t, language } = useTheme();
  const location = useLocation();

  const navItems: NavItem[] = [
    { label: t('nav.features'), href: '#features' },
    { label: t('nav.howItWorks'), href: '#value-props' },
    { label: t('nav.testimonials'), href: '#testimonials' },
    { label: t('nav.faq'), href: '#faq' },
  ];

  // Determine if we're on the landing page (including /fr)
  const isLandingPage = location.pathname === '/' || location.pathname === '/fr';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isMenuOpen && headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const isDark = theme === 'dark';

  // Dynamic styling based on scroll and theme
  const getHeaderStyles = () => {
    if (isScrolled || !isLandingPage) {
      return {
        backgroundColor: isDark ? 'rgba(17, 24, 39, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${isDark ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.5)'}`,
        boxShadow: isDark ? '0 4px 20px rgba(0, 0, 0, 0.3)' : '0 4px 20px rgba(0, 0, 0, 0.08)',
      };
    }
    return {
      backgroundColor: 'transparent',
      backdropFilter: 'none',
      borderBottom: 'none',
      boxShadow: 'none',
    };
  };

  const getTextColor = () => {
    if (isScrolled || !isLandingPage) {
      return isDark ? '#F3F4F6' : '#1A2B47';
    }
    return isDark ? '#FFFFFF' : '#1A2B47';
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();

      // If not on landing page, navigate to landing page with hash (preserve locale)
      if (!isLandingPage) {
        const base = language === 'fr' ? '/fr' : '/';
        window.location.href = `${base}${href}`;
        return;
      }

      // Smooth scroll to section
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
    }
  };

  const headerStyles = getHeaderStyles();
  const textColor = getTextColor();

  return (
    <header
      ref={headerRef}
      className="fixed top-0 w-full z-50 transition-all duration-500 ease-out"
      style={headerStyles}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to={language === 'fr' ? '/fr' : '/'}
            className="flex items-center gap-3 group"
            aria-label="Sqordia - Home"
          >
            <div
              className="relative p-2.5 rounded-xl transition-all duration-300 shadow-lg group-hover:scale-110"
              style={{
                backgroundColor: isScrolled ? THEME_ORANGE : (isDark ? '#FFFFFF' : THEME_ORANGE),
              }}
            >
              <Brain
                className="transition-colors duration-300"
                size={26}
                style={{
                  color: isScrolled ? '#FFFFFF' : (isDark ? THEME_ORANGE : '#FFFFFF'),
                }}
                aria-hidden="true"
              />
            </div>
            <span
              className="text-2xl font-bold font-heading transition-all duration-300 tracking-tight"
              style={{ color: textColor }}
            >
              Sqordia
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="px-4 py-2.5 rounded-lg transition-all duration-300 font-medium text-sm hover:bg-white/10 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:ring-offset-2 focus:ring-offset-transparent"
                style={{ color: textColor }}
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Language dropdown: flag + EN/FR + chevron */}
            <LanguageDropdown
              textColor={textColor}
              isDark={isDark}
              variant="default"
            />
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:ring-offset-2"
              style={{ color: textColor }}
              aria-label={isDark ? t('nav.switchToLight') : t('nav.switchToDark')}
            >
              {isDark ? (
                <Sun size={20} aria-hidden="true" />
              ) : (
                <Moon size={20} aria-hidden="true" />
              )}
            </button>

            {/* Login Link */}
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-lg transition-all duration-300 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:ring-offset-2"
              style={{ color: textColor }}
            >
              {t('nav.login')}
            </Link>

            {/* Get Started CTA */}
            <Link
              to="/register"
              className="px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 text-white focus:outline-none focus:ring-4 focus:ring-[#FF6B00]/50 focus:ring-offset-2"
              style={{
                backgroundColor: THEME_ORANGE,
                boxShadow: '0 4px 14px rgba(255, 107, 0, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E55F00';
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 107, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = THEME_ORANGE;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(255, 107, 0, 0.3)';
              }}
            >
              {t('nav.getstarted')}
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <LanguageDropdown
              textColor={textColor}
              isDark={isDark}
              variant="compact"
              onSelect={() => setIsMenuOpen(false)}
            />
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              style={{ color: textColor }}
              aria-label={isDark ? t('nav.switchToLight') : t('nav.switchToDark')}
            >
              {isDark ? <Sun size={20} aria-hidden="true" /> : <Moon size={20} aria-hidden="true" />}
            </button>

            <button
              className="p-2.5 rounded-lg transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
              style={{ color: textColor }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X size={24} aria-hidden="true" />
              ) : (
                <Menu size={24} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          className="lg:hidden animate-slide-down border-t"
          style={{
            backgroundColor: isDark ? 'rgba(17, 24, 39, 0.98)' : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            borderColor: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)',
          }}
        >
          <div className="container mx-auto px-6 py-6 flex flex-col space-y-1">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className="px-4 py-4 rounded-xl transition-all duration-300 font-medium min-h-[44px] flex items-center focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
                style={{
                  color: isDark ? '#F3F4F6' : '#1A2B47',
                }}
              >
                {item.label}
              </a>
            ))}

            {/* Mobile Language - same dropdown design */}
            <div className="pt-4 mt-2 border-t" style={{ borderColor: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)' }}>
              <span className="text-sm font-medium block mb-2" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                Language
              </span>
              <LanguageDropdown
                textColor={isDark ? '#F3F4F6' : '#1A2B47'}
                isDark={isDark}
                variant="default"
                onSelect={() => setIsMenuOpen(false)}
              />
            </div>
            {/* Mobile Actions */}
            <div className="pt-4 mt-2 space-y-2 border-t" style={{ borderColor: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)' }}>
              <Link
                to="/login"
                className="block w-full px-4 py-3.5 text-center rounded-xl transition-all duration-300 font-medium border"
                style={{
                  color: isDark ? '#F3F4F6' : '#1A2B47',
                  borderColor: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)',
                }}
                onClick={() => setIsMenuOpen(false)}
              >
                {t('nav.login')}
              </Link>
              <Link
                to="/register"
                className="block w-full px-6 py-3.5 text-center rounded-xl font-semibold transition-all duration-300 text-white"
                style={{
                  backgroundColor: THEME_ORANGE,
                  boxShadow: '0 4px 14px rgba(255, 107, 0, 0.3)',
                }}
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
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-slide-down {
            animation: none !important;
          }
        }
      `}</style>
    </header>
  );
}
