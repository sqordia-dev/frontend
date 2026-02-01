import { ArrowRight, Shield, Star, Check, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const { t, theme } = useTheme();

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
      className={cn(
        "relative pt-20 pb-24 md:pt-32 md:pb-40 overflow-hidden min-h-[85vh] md:min-h-screen flex items-center",
        isDark ? "bg-strategy-blue" : "bg-light-ai-grey"
      )}
      aria-labelledby="hero-heading"
    >
      {/* Clean geometric background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Subtle dot pattern */}
        <div className={cn(
          "absolute inset-0",
          isDark ? "opacity-[0.04]" : "opacity-[0.06]"
        )} style={{
          backgroundImage: `radial-gradient(circle, ${isDark ? '#FFFFFF' : '#1A2B47'} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }} />

        {/* Geometric accent shapes */}
        <div className={cn(
          "absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full",
          isDark ? "bg-white/[0.03]" : "bg-strategy-blue/[0.03]"
        )} />
        <div className={cn(
          "absolute -bottom-48 -left-24 w-[400px] h-[400px] rounded-full",
          isDark ? "bg-white/[0.02]" : "bg-strategy-blue/[0.02]"
        )} />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Badge */}
          <div className="fade-in-element mb-8">
            <Badge
              variant="outline"
              className={cn(
                "px-5 py-2.5 text-sm font-semibold rounded-full",
                "border-2",
                isDark
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-white border-strategy-blue/15 text-strategy-blue",
                "shadow-sm"
              )}
            >
              <Sparkles
                size={16}
                className="mr-2 text-momentum-orange"
              />
              {t('hero.badge')}
            </Badge>
          </div>

          {/* Main Headline */}
          <h1
            id="hero-heading"
            className={cn(
              "fade-in-element font-heading mb-8",
              "text-display-lg md:text-display-xl lg:text-display-2xl",
              isDark ? "text-white" : "text-strategy-blue"
            )}
          >
            <span className="block">{t('hero.headline.part1')}</span>
            <span className="block mt-2">
              {t('hero.headline.part2')}{' '}
              <span className="relative inline-block">
                <span className="text-momentum-orange">{t('hero.headline.part3')}</span>
                <span
                  className="absolute -bottom-2 left-0 right-0 h-1.5 rounded-full bg-momentum-orange/40"
                />
              </span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className={cn(
            "fade-in-element text-body-lg md:text-xl max-w-3xl mx-auto mb-12 px-4",
            isDark ? "text-gray-300" : "text-gray-600"
          )}>
            {t('hero.subtitle')}
          </p>

          {/* CTA Buttons */}
          <nav className="fade-in-element flex flex-col sm:flex-row gap-4 justify-center mb-16 px-4" aria-label="Primary actions">
            <Button
              asChild
              variant="brand"
              size="xl"
              className="group shadow-lg shadow-momentum-orange/25 hover:shadow-xl hover:shadow-momentum-orange/30 transition-shadow"
            >
              <Link to="/register">
                {t('hero.cta.businessPlan')}
                <ArrowRight
                  size={20}
                  className={cn(
                    !prefersReducedMotion && "transition-transform duration-300 group-hover:translate-x-1"
                  )}
                />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="xl"
              className={cn(
                "group border-2",
                isDark
                  ? "bg-white text-strategy-blue hover:bg-gray-50 border-white"
                  : "bg-white text-strategy-blue hover:bg-gray-50 border-strategy-blue/20"
              )}
            >
              <Link to="/register">
                {t('hero.cta.strategicPlan')}
                <ArrowRight
                  size={20}
                  className={cn(
                    !prefersReducedMotion && "transition-transform duration-300 group-hover:translate-x-1"
                  )}
                />
              </Link>
            </Button>
          </nav>

          {/* Trust Signal */}
          <div className="fade-in-element flex items-center justify-center gap-3 mb-12">
            <div className="p-2.5 rounded-xl bg-momentum-orange/10">
              <Shield className="text-momentum-orange" size={24} />
            </div>
            <span className={cn(
              "font-medium text-lg",
              isDark ? "text-gray-300" : "text-gray-600"
            )}>
              {t('hero.trustSignal')}
            </span>
          </div>

          {/* Social Proof Cards */}
          <div className="fade-in-element grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {/* Plans Created */}
            <div className={cn(
              "group relative p-6 rounded-2xl border-2",
              "transition-all duration-300",
              isDark
                ? "bg-white/5 border-white/10 hover:bg-white/[0.08] hover:border-white/20"
                : "bg-white border-gray-200 hover:border-strategy-blue/20 hover:shadow-lg"
            )}>
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={cn(
                        "w-10 h-10 rounded-full border-2 flex items-center justify-center",
                        "text-xs font-bold bg-strategy-blue text-white shadow-sm",
                        isDark ? "border-white/30" : "border-white"
                      )}
                      style={{ zIndex: 5 - i }}
                    >
                      {i}
                    </div>
                  ))}
                </div>
              </div>
              <h2 className={cn(
                "text-3xl font-bold mb-1",
                isDark ? "text-white" : "text-strategy-blue"
              )}>
                2,500+
              </h2>
              <p className={cn(
                "text-sm",
                isDark ? "text-gray-400" : "text-gray-500"
              )}>
                {t('hero.socialProof.plansCreated')}
              </p>
            </div>

            {/* Rating */}
            <div className={cn(
              "group relative p-6 rounded-2xl border-2",
              "transition-all duration-300",
              isDark
                ? "bg-white/5 border-white/10 hover:bg-white/[0.08] hover:border-white/20"
                : "bg-white border-gray-200 hover:border-strategy-blue/20 hover:shadow-lg"
            )}>
              <div className="flex items-center justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="text-yellow-400 fill-yellow-400"
                    size={22}
                  />
                ))}
              </div>
              <h2 className={cn(
                "text-3xl font-bold mb-1",
                isDark ? "text-white" : "text-strategy-blue"
              )}>
                4.9/5
              </h2>
              <p className={cn(
                "text-sm",
                isDark ? "text-gray-400" : "text-gray-500"
              )}>
                {t('hero.socialProof.averageRating')}
              </p>
            </div>

            {/* Free Trial */}
            <div className={cn(
              "group relative p-6 rounded-2xl border-2",
              "transition-all duration-300",
              isDark
                ? "bg-white/5 border-white/10 hover:bg-white/[0.08] hover:border-white/20"
                : "bg-white border-gray-200 hover:border-strategy-blue/20 hover:shadow-lg"
            )}>
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-momentum-orange shadow-sm">
                  <Check className="text-white" size={24} />
                </div>
              </div>
              <h2 className={cn(
                "text-3xl font-bold mb-1",
                isDark ? "text-white" : "text-strategy-blue"
              )}>
                {t('hero.socialProof.free')}
              </h2>
              <p className={cn(
                "text-sm",
                isDark ? "text-gray-400" : "text-gray-500"
              )}>
                {t('hero.socialProof.noCreditCard')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .fade-in-element {
          opacity: 0;
        }

        @media (prefers-reduced-motion: reduce) {
          .fade-in-element {
            opacity: 1 !important;
          }
        }
      `}</style>
    </section>
  );
}
