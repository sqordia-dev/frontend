import { useState, useEffect, useRef } from 'react';
import { Menu, X, Brain, Sun, Moon, ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
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

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const { theme, language, toggleTheme, setLanguage, t } = useTheme();
  const headerRef = useRef<HTMLElement>(null);
  const location = useLocation();
  
  // Pages without dark hero sections should use dark text
  const pagesWithoutHero = ['/example-plans', '/login', '/register', '/forgot-password', '/reset-password'];
  const hasDarkHero = !pagesWithoutHero.some(path => location.pathname.startsWith(path));

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      // Track active section based on scroll position
      const sections = ['features', 'pricing', 'example-plans', 'about', 'blog', 'contact'];
      const scrollPosition = window.scrollY + 150;
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section);
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close language dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isLangOpen && !(event.target as Element).closest('.language-selector')) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isLangOpen]);

  const languages = [
    { code: 'en', label: 'English', displayCode: 'EN', FlagComponent: CA },
    { code: 'fr', label: 'Français', displayCode: 'FR', FlagComponent: QuebecFlag }
  ];

  const currentLang = languages.find(l => l.code === language);

  // Color values
  const strategyBlue = '#1A2B47';
  const momentumOrange = '#FF6B00';
  const momentumOrangeHover = '#E55F00';
  const lightAIGrey = '#F4F7FA';

  // Dynamic colors based on theme and scroll state
  const getHeaderBg = () => {
    if (isScrolled || !hasDarkHero) {
      return theme === 'dark' 
        ? 'rgba(17, 24, 39, 0.85)' 
        : 'rgba(255, 255, 255, 0.85)';
    }
    return 'transparent';
  };

  const getTextColor = () => {
    // If header is scrolled or we're on a page without dark hero
    if (isScrolled || !hasDarkHero) {
      return theme === 'dark' ? '#F3F4F6' : strategyBlue;
    }
    
    // Header is transparent (not scrolled, on landing page with hero)
    // Check theme: in light mode, hero is light, so use dark text
    if (theme === 'light') {
      return strategyBlue;
    }
    
    // Dark mode with transparent header over dark hero - use white
    return '#FFFFFF';
  };

  const getLogoColor = () => {
    const headerBg = getHeaderBg();
    
    // If header background is transparent, check theme
    if (headerBg === 'transparent') {
      // In light mode, hero is light, so use dark text
      if (theme === 'light') {
        return strategyBlue;
      }
      // In dark mode, hero is dark, so use white
      return '#FFFFFF';
    }
    
    // If we have a dark hero section, use white text (even when scrolled if background is still dark)
    if (hasDarkHero) {
      // Only use dark text if scrolled AND header has white background
      if (isScrolled && headerBg.includes('255, 255, 255')) {
        return theme === 'dark' ? '#F3F4F6' : strategyBlue;
      }
      // Otherwise use white for visibility on dark backgrounds
      return '#FFFFFF';
    }
    
    // If header background is dark (dark theme), use white text
    if (headerBg.includes('17, 24, 39') || headerBg.includes('rgba(17')) {
      return '#FFFFFF';
    }
    
    // If header background is white/light, use dark text
    if (headerBg.includes('255, 255, 255') || headerBg.includes('rgba(255')) {
      return theme === 'dark' ? '#F3F4F6' : strategyBlue;
    }
    
    // Default: use white for safety (better to be visible than invisible)
    return '#FFFFFF';
  };

  const navItems = ['features', 'pricing', 'example-plans', 'about', 'blog', 'contact'];

  // Map nav items to translation keys
  const getNavTranslationKey = (item: string): string => {
    const translationMap: Record<string, string> = {
      'example-plans': 'examplePlans',
    };
    return translationMap[item] || item;
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, section: string) => {
    e.preventDefault();
    
    // Handle example-plans as a route
    if (section === 'example-plans') {
      window.location.href = '/example-plans';
      return;
    }
    
    // If we're not on the landing page, navigate to landing page first, then scroll
    if (location.pathname !== '/') {
      // Store the section to scroll to in sessionStorage
      sessionStorage.setItem('scrollToSection', section);
      // Navigate to landing page
      window.location.href = '/';
      return;
    }
    
    // We're on the landing page, scroll to the section
    const element = document.getElementById(section);
    if (element) {
      const headerHeight = headerRef.current?.offsetHeight || 80;
      const elementPosition = element.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = elementPosition - headerHeight - 20;

      // Smooth scroll to the section
      window.scrollTo({
        top: Math.max(0, offsetPosition),
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
  };

  return (
    <header
      ref={headerRef}
      className="fixed top-0 w-full z-50 transition-all duration-500 ease-out"
      style={{
        backgroundColor: getHeaderBg(),
        backdropFilter: isScrolled ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: isScrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: isScrolled 
          ? `1px solid ${theme === 'dark' ? 'rgba(75, 85, 99, 0.2)' : 'rgba(229, 231, 235, 0.3)'}`
          : 'none',
        boxShadow: isScrolled 
          ? (theme === 'dark' 
              ? '0 4px 20px rgba(0, 0, 0, 0.3)' 
              : '0 4px 20px rgba(0, 0, 0, 0.08)')
          : 'none',
      }}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo with enhanced hover effect */}
          <Link 
            to="/" 
            className="flex items-center gap-3 group relative"
            onMouseEnter={(e) => {
              const logo = e.currentTarget.querySelector('.logo-icon');
              if (logo) {
                logo.style.transform = 'scale(1.1) rotate(5deg)';
              }
            }}
            onMouseLeave={(e) => {
              const logo = e.currentTarget.querySelector('.logo-icon');
              if (logo) {
                logo.style.transform = 'scale(1) rotate(0deg)';
              }
            }}
          >
            <div className="relative">
              {/* Glow effect */}
              <div 
                className="absolute inset-0 rounded-xl blur-xl opacity-0 group-hover:opacity-60 transition-opacity duration-300"
                style={{ 
                  backgroundColor: isScrolled ? strategyBlue : '#FFFFFF',
                }}
              ></div>
              <div 
                className="relative logo-icon p-2.5 rounded-xl transition-all duration-300 shadow-lg"
                style={{ 
                  backgroundColor: isScrolled ? strategyBlue : '#FFFFFF',
                  boxShadow: isScrolled 
                    ? '0 4px 12px rgba(26, 43, 71, 0.2)' 
                    : '0 4px 12px rgba(0, 0, 0, 0.1)',
                }}
              >
                <Brain 
                  className="transition-colors duration-300" 
                  size={26}
                  style={{ 
                    color: isScrolled ? '#FFFFFF' : strategyBlue,
                  }}
                />
              </div>
            </div>
            <span 
              className="text-2xl font-bold font-heading transition-all duration-300 tracking-tight"
              style={{
                color: getLogoColor(),
              }}
            >
              Sqordia
            </span>
          </Link>

          {/* Desktop Navigation with active indicator */}
          <div className="hidden lg:flex items-center space-x-1">
            {navItems.map((item) => {
              const isActive = activeSection === item;
              return (
                <a
                  key={item}
                  href={`#${item}`}
                  onClick={(e) => handleNavClick(e, item)}
                  className="relative px-4 py-2.5 rounded-lg transition-all duration-300 font-medium font-heading text-sm group"
                  style={{
                    color: isActive ? momentumOrange : getTextColor(),
                  }}
                  onMouseEnter={(e) => {
                    if (!isScrolled) {
                      e.currentTarget.style.opacity = '0.9';
                    } else {
                      e.currentTarget.style.color = momentumOrange;
                      e.currentTarget.style.backgroundColor = theme === 'dark' 
                        ? 'rgba(31, 41, 55, 0.4)' 
                        : lightAIGrey;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isScrolled) {
                      e.currentTarget.style.opacity = '1';
                    } else {
                      e.currentTarget.style.color = isActive ? momentumOrange : getTextColor();
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  {t(`nav.${getNavTranslationKey(item)}`)}
                  {/* Active indicator underline */}
                  {isActive && (
                    <span 
                      className="absolute bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 rounded-full transition-all duration-300"
                      style={{
                        width: '60%',
                        backgroundColor: momentumOrange,
                      }}
                    />
                  )}
                  {/* Hover underline animation */}
                  <span 
                    className="absolute bottom-1 left-1/2 transform -translate-x-1/2 h-0.5 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
                    style={{
                      width: isActive ? '60%' : '0%',
                      backgroundColor: momentumOrange,
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.width = '60%';
                      }
                    }}
                  />
                </a>
              );
            })}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Language Selector with improved styling */}
            <div className="relative language-selector">
              <button
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg transition-all duration-300 group"
                style={{
                  color: getTextColor(),
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isScrolled 
                    ? (theme === 'dark' ? 'rgba(31, 41, 55, 0.4)' : lightAIGrey)
                    : 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <div 
                  className="w-7 h-7 rounded-lg flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 overflow-hidden"
                  style={{
                    backgroundColor: isScrolled 
                      ? (theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(26, 43, 71, 0.05)')
                      : 'rgba(255, 255, 255, 0.2)',
                  }}
                >
                  {currentLang?.FlagComponent && (
                    <FlagIcon FlagComponent={currentLang.FlagComponent} size={20} />
                  )}
                </div>
                <span className="text-sm font-semibold font-heading">{currentLang?.displayCode}</span>
                <ChevronDown 
                  size={14} 
                  className={`transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`} 
                />
              </button>

              {isLangOpen && (
                <div 
                  className="absolute right-0 mt-2 w-52 rounded-2xl shadow-2xl overflow-hidden animate-fade-in-dropdown border"
                  style={{
                    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                    borderColor: theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)',
                    boxShadow: theme === 'dark'
                      ? '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
                      : '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as 'en' | 'fr');
                        setIsLangOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-200 group"
                      style={{
                        backgroundColor: language === lang.code 
                          ? (theme === 'dark' ? 'rgba(26, 43, 71, 0.4)' : lightAIGrey)
                          : 'transparent',
                        color: language === lang.code 
                          ? strategyBlue 
                          : (theme === 'dark' ? '#F3F4F6' : '#374151'),
                      }}
                      onMouseEnter={(e) => {
                        if (language !== lang.code) {
                          e.currentTarget.style.backgroundColor = theme === 'dark' 
                            ? 'rgba(31, 41, 55, 0.5)' 
                            : lightAIGrey;
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (language !== lang.code) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }
                      }}
                    >
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-110 overflow-hidden"
                        style={{
                          backgroundColor: theme === 'dark' 
                            ? 'rgba(255, 255, 255, 0.1)' 
                            : 'rgba(26, 43, 71, 0.05)',
                        }}
                      >
                        {lang.FlagComponent && (
                          <FlagIcon FlagComponent={lang.FlagComponent} size={28} />
                        )}
                      </div>
                      <span className="font-medium flex-1">{lang.label}</span>
                      {language === lang.code && (
                        <div 
                          className="w-2 h-2 rounded-full transition-all"
                          style={{ backgroundColor: momentumOrange }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle with smooth animation */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg transition-all duration-300 group relative"
              style={{
                color: getTextColor(),
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isScrolled 
                  ? (theme === 'dark' ? 'rgba(31, 41, 55, 0.4)' : lightAIGrey)
                  : 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.transform = 'rotate(15deg) scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.transform = 'rotate(0deg) scale(1)';
              }}
              aria-label={theme === 'light' ? t('header.switchToDark') || 'Switch to dark mode' : t('header.switchToLight') || 'Switch to light mode'}
            >
              {theme === 'light' ? (
                <Moon size={20} className="animate-fade-in transition-transform group-hover:rotate-12" aria-hidden="true" />
              ) : (
                <Sun size={20} className="animate-fade-in transition-transform group-hover:rotate-90" aria-hidden="true" />
              )}
            </button>

            {/* Sign In with subtle styling */}
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-lg transition-all duration-300 font-medium font-heading text-sm"
              style={{
                color: getTextColor(),
              }}
              onMouseEnter={(e) => {
                if (isScrolled) {
                  e.currentTarget.style.color = momentumOrange;
                  e.currentTarget.style.backgroundColor = theme === 'dark' 
                    ? 'rgba(31, 41, 55, 0.4)' 
                    : lightAIGrey;
                } else {
                  e.currentTarget.style.opacity = '0.85';
                }
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                if (isScrolled) {
                  e.currentTarget.style.color = getTextColor();
                  e.currentTarget.style.backgroundColor = 'transparent';
                } else {
                  e.currentTarget.style.opacity = '1';
                }
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {t('nav.signin')}
            </Link>

            {/* Get Started CTA with enhanced styling */}
            <Link
              to="/register"
              className="px-6 py-2.5 rounded-xl font-semibold font-heading text-sm transition-all duration-300 relative overflow-hidden group"
              style={{
                backgroundColor: momentumOrange,
                color: '#FFFFFF',
                boxShadow: '0 4px 14px rgba(255, 107, 0, 0.3)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = momentumOrangeHover;
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 107, 0, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = momentumOrange;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(255, 107, 0, 0.3)';
              }}
            >
              <span className="relative z-10">{t('nav.getstarted')}</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
              style={{
                color: getTextColor(),
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isScrolled 
                  ? (theme === 'dark' ? 'rgba(31, 41, 55, 0.4)' : lightAIGrey)
                  : 'rgba(255, 255, 255, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label={theme === 'light' ? t('header.switchToDark') || 'Switch to dark mode' : t('header.switchToLight') || 'Switch to light mode'}
            >
              {theme === 'light' ? <Moon size={20} aria-hidden="true" /> : <Sun size={20} aria-hidden="true" />}
            </button>

            <button
              className="p-2.5 rounded-lg transition-all duration-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
              style={{
                color: getTextColor(),
              }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isScrolled 
                  ? (theme === 'dark' ? 'rgba(31, 41, 55, 0.4)' : lightAIGrey)
                  : 'rgba(255, 255, 255, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              aria-label={isMenuOpen ? t('header.closeMenu') || 'Close menu' : t('header.openMenu') || 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X size={24} className="transition-transform rotate-90" aria-hidden="true" />
              ) : (
                <Menu size={24} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Enhanced Mobile Menu */}
      {isMenuOpen && (
        <div 
          className="lg:hidden animate-slide-down backdrop-blur-xl border-t"
          style={{
            backgroundColor: theme === 'dark' 
              ? 'rgba(17, 24, 39, 0.95)' 
              : 'rgba(255, 255, 255, 0.95)',
            borderColor: theme === 'dark' 
              ? 'rgba(75, 85, 99, 0.3)' 
              : 'rgba(229, 231, 235, 0.5)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div className="container mx-auto px-6 py-6 flex flex-col space-y-1">
            {navItems.map((item, index) => {
              const isActive = activeSection === item;
              return (
                <a
                  key={item}
                  href={`#${item}`}
                  onClick={(e) => handleNavClick(e, item)}
                  className="px-4 py-4 md:py-3.5 rounded-xl transition-all duration-300 font-medium font-heading relative group min-h-[44px] flex items-center"
                  style={{
                    color: isActive ? momentumOrange : (theme === 'dark' ? '#F3F4F6' : strategyBlue),
                    backgroundColor: isActive 
                      ? (theme === 'dark' ? 'rgba(26, 43, 71, 0.3)' : lightAIGrey)
                      : 'transparent',
                    animationDelay: `${index * 50}ms`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = momentumOrange;
                    e.currentTarget.style.backgroundColor = theme === 'dark' 
                      ? 'rgba(31, 41, 55, 0.5)' 
                      : lightAIGrey;
                    e.currentTarget.style.transform = 'translateX(8px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = isActive ? momentumOrange : (theme === 'dark' ? '#F3F4F6' : strategyBlue);
                    e.currentTarget.style.backgroundColor = isActive 
                      ? (theme === 'dark' ? 'rgba(26, 43, 71, 0.3)' : lightAIGrey)
                      : 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  {t(`nav.${getNavTranslationKey(item)}`)}
                  {isActive && (
                    <span 
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 h-6 w-1 rounded-r-full"
                      style={{ backgroundColor: momentumOrange }}
                    />
                  )}
                </a>
              );
            })}

            {/* Language Selector Mobile */}
            <div 
              className="pt-4 mt-2 border-t"
              style={{
                borderColor: theme === 'dark' 
                  ? 'rgba(75, 85, 99, 0.3)' 
                  : 'rgba(229, 231, 235, 0.5)',
              }}
            >
              <div 
                className="text-xs font-semibold uppercase tracking-wide px-4 mb-3"
                style={{
                  color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
                }}
              >
                Language
              </div>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code as 'en' | 'fr');
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
                  style={{
                    backgroundColor: language === lang.code 
                      ? (theme === 'dark' ? 'rgba(26, 43, 71, 0.3)' : lightAIGrey)
                      : 'transparent',
                    color: language === lang.code 
                      ? strategyBlue 
                      : (theme === 'dark' ? '#F3F4F6' : '#374151'),
                  }}
                  onMouseEnter={(e) => {
                    if (language !== lang.code) {
                      e.currentTarget.style.backgroundColor = theme === 'dark' 
                        ? 'rgba(31, 41, 55, 0.5)' 
                        : lightAIGrey;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (language !== lang.code) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md overflow-hidden"
                    style={{
                      backgroundColor: theme === 'dark' 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : 'rgba(26, 43, 71, 0.05)',
                    }}
                  >
                    {lang.FlagComponent && (
                      <FlagIcon FlagComponent={lang.FlagComponent} size={32} />
                    )}
                  </div>
                  <span className="font-medium flex-1">{lang.label}</span>
                  {language === lang.code && (
                    <div 
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: momentumOrange }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Mobile Actions */}
            <div 
              className="pt-4 mt-2 space-y-2 border-t"
              style={{
                borderColor: theme === 'dark' 
                  ? 'rgba(75, 85, 99, 0.3)' 
                  : 'rgba(229, 231, 235, 0.5)',
              }}
            >
              <Link
                to="/login"
                className="block w-full px-4 py-3.5 text-center rounded-xl transition-all duration-300 font-medium font-heading"
                style={{
                  color: theme === 'dark' ? '#F3F4F6' : strategyBlue,
                  border: `1px solid ${theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)'}`,
                }}
                onClick={() => setIsMenuOpen(false)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = momentumOrange;
                  e.currentTarget.style.borderColor = momentumOrange;
                  e.currentTarget.style.backgroundColor = theme === 'dark' 
                    ? 'rgba(31, 41, 55, 0.3)' 
                    : lightAIGrey;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = theme === 'dark' ? '#F3F4F6' : strategyBlue;
                  e.currentTarget.style.borderColor = theme === 'dark' 
                    ? 'rgba(75, 85, 99, 0.3)' 
                    : 'rgba(229, 231, 235, 0.8)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {t('nav.signin')}
              </Link>
              <Link
                to="/register"
                className="block w-full px-6 py-3.5 text-center rounded-xl font-semibold font-heading transition-all duration-300"
                style={{
                  backgroundColor: momentumOrange,
                  color: '#FFFFFF',
                  boxShadow: '0 4px 14px rgba(255, 107, 0, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = momentumOrangeHover;
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 107, 0, 0.4)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = momentumOrange;
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(255, 107, 0, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
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

        @keyframes fade-in-dropdown {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        .animate-fade-in-dropdown {
          animation: fade-in-dropdown 0.2s ease-out;
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
    </header>
  );
}
