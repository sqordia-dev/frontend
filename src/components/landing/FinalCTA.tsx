import { ArrowRight, Shield, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { usePublishedContent } from '@/hooks/usePublishedContent';
import { cn } from '@/lib/utils';
import { ScrollReveal } from '../animations/ScrollReveal';

export default function FinalCTA() {
  const { theme, t } = useTheme();
  const { getBlockContent } = usePublishedContent();
  const isDark = theme === 'dark';

  const trustBadges = [
    { icon: Shield, textKey: 'landing.finalCta.trust.noCard' },
    { icon: Clock, textKey: 'landing.finalCta.trust.trial' },
    { icon: CheckCircle, textKey: 'landing.finalCta.trust.cancel' },
  ];

  return (
    <section
      className="relative py-16 sm:py-20 md:py-36 lg:py-44 overflow-hidden bg-gradient-to-br from-momentum-orange via-[#E55F00] to-[#CC4A00]"
      aria-labelledby="final-cta-heading"
    >
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute -top-24 -left-24 w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 rounded-full opacity-20 animate-blob"
          style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3), transparent 70%)' }}
        />
        <div
          className="absolute -bottom-20 -right-20 w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] lg:w-[400px] lg:h-[400px] rounded-full opacity-15 animate-blob"
          style={{
            background: 'radial-gradient(circle, rgba(255,255,255,0.25), transparent 70%)',
            animationDelay: '3s',
          }}
        />
        <div
          className="absolute top-1/2 left-1/3 w-56 h-56 rounded-full opacity-10 animate-blob"
          style={{
            background: 'radial-gradient(circle, rgba(245,158,11,0.4), transparent 70%)',
            animationDelay: '5s',
          }}
        />
        <div
          className="absolute top-1/4 right-1/4 w-40 h-40 rounded-full opacity-10 animate-float"
          style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.3), transparent 70%)' }}
        />
      </div>

      {/* Noise texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{ backgroundImage: "url('/noise.svg')", backgroundRepeat: 'repeat' }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <ScrollReveal>
            <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full text-sm font-medium mb-8 border border-white/20">
              {getBlockContent('landing.finalCta.badge', t('landing.finalCta.badge'))}
            </div>
          </ScrollReveal>

          {/* Main Headline */}
          <ScrollReveal delay={0.1}>
            <h2
              id="final-cta-heading"
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold font-heading text-white mb-4 sm:mb-6"
            >
              {getBlockContent('landing.finalCta.headline', t('landing.finalCta.headline'))}
            </h2>
          </ScrollReveal>

          {/* Sub-headline */}
          <ScrollReveal delay={0.15}>
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 sm:mb-10 leading-relaxed text-white/80 max-w-2xl mx-auto">
              {getBlockContent('landing.finalCta.subheadline', t('landing.finalCta.subheadline'))}
            </p>
          </ScrollReveal>

          {/* Primary CTA Button */}
          <ScrollReveal delay={0.2}>
            <div className="mb-4">
              <Link
                to="/signup"
                className={cn(
                  'group inline-flex items-center gap-2 sm:gap-3 px-6 py-4 sm:px-10 sm:py-5 md:px-12 md:py-6 bg-white text-momentum-orange text-base sm:text-lg md:text-xl font-bold rounded-xl transition-all duration-200',
                  'shadow-[0_8px_32px_rgba(0,0,0,0.15)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)] hover:scale-[1.02] hover:-translate-y-0.5',
                  'focus:outline-none focus:ring-4 focus:ring-white/50',
                )}
              >
                {getBlockContent('landing.finalCta.cta', t('landing.finalCta.cta'))}
                <ArrowRight size={24} className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </Link>
            </div>
          </ScrollReveal>

          {/* Secondary pricing link */}
          <ScrollReveal delay={0.22}>
            <div className="mb-10">
              <a
                href="#pricing"
                className="text-white/70 hover:text-white text-sm font-medium underline underline-offset-4 transition-colors duration-200"
              >
                {getBlockContent('landing.finalCta.seePricing', t('landing.finalCta.seePricing'))}
              </a>
            </div>
          </ScrollReveal>

          {/* Trust Badges */}
          <ScrollReveal delay={0.25}>
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 md:gap-8 text-white/90">
              {trustBadges.map((badge, index) => {
                const Icon = badge.icon;
                return (
                  <div key={index} className="flex items-center gap-2">
                    <Icon size={20} className="text-white/70" aria-hidden="true" />
                    <span className="text-sm md:text-base font-medium">{getBlockContent(badge.textKey, t(badge.textKey))}</span>
                  </div>
                );
              })}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
