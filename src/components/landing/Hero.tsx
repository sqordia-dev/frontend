import { ArrowRight, Shield, Clock, CheckCircle, Star, X as XIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { theme, t } = useTheme();

  // Check for prefers-reduced-motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      const elements = heroRef.current?.querySelectorAll('.fade-in-element');
      elements?.forEach((el) => {
        (el as HTMLElement).style.opacity = '1';
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animate-fade-in-up');
            }, index * 100);
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = heroRef.current?.querySelectorAll('.fade-in-element');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [prefersReducedMotion]);

  const isDark = theme === 'dark';

  return (
    <section
      ref={heroRef}
      className="relative pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32 overflow-hidden min-h-[90vh] flex items-center"
      style={{
        background: isDark
          ? 'linear-gradient(180deg, #1A2B47 0%, #0F172A 100%)'
          : 'linear-gradient(180deg, #EEF2FF 0%, #FFFFFF 100%)',
      }}
      aria-labelledby="hero-heading"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Gradient orbs */}
        <div
          className={`absolute top-20 right-10 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full filter blur-[80px] md:blur-[120px] ${!prefersReducedMotion ? 'animate-blob' : ''}`}
          style={{
            backgroundColor: isDark ? 'rgba(255, 107, 0, 0.12)' : 'rgba(255, 107, 0, 0.08)',
          }}
        />
        <div
          className={`absolute top-40 left-10 w-[250px] h-[250px] md:w-[400px] md:h-[400px] rounded-full filter blur-[60px] md:blur-[100px] ${!prefersReducedMotion ? 'animate-blob animation-delay-2000' : ''}`}
          style={{
            backgroundColor: isDark ? 'rgba(255, 107, 0, 0.08)' : 'rgba(255, 107, 0, 0.06)',
          }}
        />
        <div
          className={`absolute -bottom-20 left-1/2 w-[350px] h-[350px] md:w-[600px] md:h-[600px] rounded-full filter blur-[90px] md:blur-[140px] ${!prefersReducedMotion ? 'animate-blob animation-delay-4000' : ''}`}
          style={{
            backgroundColor: isDark ? 'rgba(20, 184, 166, 0.08)' : 'rgba(20, 184, 166, 0.06)',
          }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px),
              linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column - Content */}
          <div className="text-center lg:text-left">
            {/* Social proof badge */}
            <div className="fade-in-element inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full text-sm font-medium border backdrop-blur-sm"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                color: isDark ? '#E5E7EB' : '#374151',
              }}
            >
              <span className="flex items-center gap-1">
                <CheckCircle size={16} className="text-green-500" aria-hidden="true" />
                <span>{t('landing.hero.badge.trusted')}</span>
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-400" aria-hidden="true" />
              <span className="flex items-center gap-1">
                <Star size={14} className="text-amber-500 fill-amber-500" aria-hidden="true" />
                <span>{t('landing.hero.badge.rating')}</span>
              </span>
            </div>

            {/* Main Headline */}
            <h1
              id="hero-heading"
              className="fade-in-element text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6"
              style={{ color: isDark ? '#FFFFFF' : '#1A2B47' }}
            >
              <span className="block">{t('landing.hero.headline.line1')}</span>
              <span className="block" style={{ color: '#FF6B00' }}>
                {t('landing.hero.headline.highlight')}
              </span>
            </h1>

            {/* Subheadline */}
            <p
              className="fade-in-element text-lg md:text-xl mb-8 max-w-xl mx-auto lg:mx-0"
              style={{ color: isDark ? '#D1D5DB' : '#6B7280' }}
            >
              {t('landing.hero.subheadline')}
            </p>

            {/* CTA Buttons */}
            <div className="fade-in-element flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Link
                to="/signup"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-white text-lg font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-[#FF6B00]/50 focus:ring-offset-2"
                style={{
                  backgroundColor: '#FF6B00',
                  boxShadow: '0 10px 40px rgba(255, 107, 0, 0.3)',
                }}
                onMouseEnter={(e) => {
                  if (prefersReducedMotion) return;
                  e.currentTarget.style.backgroundColor = '#E55F00';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 15px 50px rgba(255, 107, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  if (prefersReducedMotion) return;
                  e.currentTarget.style.backgroundColor = '#FF6B00';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 40px rgba(255, 107, 0, 0.3)';
                }}
              >
                {t('landing.hero.cta.primary')}
                <ArrowRight size={20} className={!prefersReducedMotion ? 'group-hover:translate-x-1 transition-transform' : ''} aria-hidden="true" />
              </Link>

              <Link
                to="/example-plans"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-xl border-2 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-offset-2"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'transparent',
                  borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#E5E7EB',
                  color: isDark ? '#FFFFFF' : '#374151',
                }}
                onMouseEnter={(e) => {
                  if (prefersReducedMotion) return;
                  e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.1)' : '#F9FAFB';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  if (prefersReducedMotion) return;
                  e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.05)' : 'transparent';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {t('landing.hero.cta.secondary')}
              </Link>
            </div>

            {/* Trust badges */}
            <div className="fade-in-element flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-green-500" aria-hidden="true" />
                <span>{t('landing.hero.trust.noCard')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-[#FF6B00]" aria-hidden="true" />
                <span>{t('landing.hero.trust.trial')}</span>
              </div>
              <div className="flex items-center gap-2">
                <XIcon size={18} className="text-rose-500" aria-hidden="true" />
                <span>{t('landing.hero.trust.cancel')}</span>
              </div>
            </div>
          </div>

          {/* Right column - Product screenshot placeholder */}
          <div className="fade-in-element relative">
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl border"
              style={{
                backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              }}
            >
              {/* Screenshot placeholder */}
              <div className="aspect-[4/3] flex items-center justify-center p-8">
                <div className="text-center">
                  <div
                    className="w-24 h-24 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)' }}
                  >
                    <svg
                      className="w-12 h-12"
                      style={{ color: '#6366F1' }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                      />
                    </svg>
                  </div>
                  <p className="text-lg font-medium" style={{ color: isDark ? '#E5E7EB' : '#374151' }}>
                    {t('landing.hero.screenshot.alt')}
                  </p>
                  <p className="text-sm mt-1" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                    {t('landing.hero.screenshot.placeholder')}
                  </p>
                </div>
              </div>

              {/* Decorative gradient overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(180deg, transparent 60%, rgba(79, 70, 229, 0.05) 100%)',
                }}
                aria-hidden="true"
              />
            </div>

            {/* Floating elements for visual interest */}
            <div
              className={`absolute -top-4 -right-4 w-20 h-20 rounded-2xl ${!prefersReducedMotion ? 'animate-float' : ''}`}
              style={{
                backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                backdropFilter: 'blur(10px)',
              }}
              aria-hidden="true"
            />
            <div
              className={`absolute -bottom-6 -left-6 w-16 h-16 rounded-xl ${!prefersReducedMotion ? 'animate-float animation-delay-2000' : ''}`}
              style={{
                backgroundColor: isDark ? 'rgba(236, 72, 153, 0.2)' : 'rgba(236, 72, 153, 0.15)',
                backdropFilter: 'blur(10px)',
              }}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .fade-in-element {
          opacity: 0;
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-blob {
          animation: blob 8s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float {
          animation: float 4s ease-in-out infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in-up,
          .animate-blob,
          .animate-float {
            animation: none !important;
          }
          .fade-in-element {
            opacity: 1 !important;
          }
        }

        a:focus-visible,
        button:focus-visible {
          outline: 3px solid #6366F1;
          outline-offset: 2px;
        }
      `}</style>
    </section>
  );
}
