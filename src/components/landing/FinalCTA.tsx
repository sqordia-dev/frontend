import { ArrowRight, Shield, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { usePublishedContent } from '@/hooks/usePublishedContent';
import { ScrollReveal } from '../animations/ScrollReveal';

export default function FinalCTA() {
  const { t } = useTheme();
  const { getBlockContent } = usePublishedContent();

  const trustBadges = [
    { icon: Shield, textKey: 'landing.finalCta.trust.noCard' },
    { icon: Clock, textKey: 'landing.finalCta.trust.trial' },
    { icon: CheckCircle, textKey: 'landing.finalCta.trust.cancel' },
  ];

  return (
    <section
      className="relative py-24 md:py-32 lg:py-40 overflow-hidden bg-gradient-to-br from-momentum-orange via-[#E55F00] to-[#CC4A00]"
      aria-labelledby="final-cta-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <ScrollReveal>
            <div className="inline-block px-4 py-2 bg-white/10 text-white rounded-full text-sm font-medium mb-8 border border-white/20">
              {getBlockContent('landing.finalCta.badge', t('landing.finalCta.badge'))}
            </div>
          </ScrollReveal>

          {/* Main Headline */}
          <ScrollReveal delay={0.1}>
            <h2
              id="final-cta-heading"
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-white mb-6"
            >
              {getBlockContent('landing.finalCta.headline', t('landing.finalCta.headline'))}
            </h2>
          </ScrollReveal>

          {/* Sub-headline */}
          <ScrollReveal delay={0.15}>
            <p className="text-lg md:text-xl lg:text-2xl mb-10 leading-relaxed text-white/80 max-w-2xl mx-auto">
              {getBlockContent('landing.finalCta.subheadline', t('landing.finalCta.subheadline'))}
            </p>
          </ScrollReveal>

          {/* Primary CTA Button */}
          <ScrollReveal delay={0.2}>
            <div className="mb-10">
              <Link
                to="/signup"
                className="group inline-flex items-center gap-3 px-10 py-5 md:px-12 md:py-6 bg-white text-momentum-orange text-lg md:text-xl font-bold rounded-xl shadow-elevated transition-all duration-200 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/50"
              >
                {getBlockContent('landing.finalCta.cta', t('landing.finalCta.cta'))}
                <ArrowRight size={24} className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
              </Link>
            </div>
          </ScrollReveal>

          {/* Trust Badges */}
          <ScrollReveal delay={0.25}>
            <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-white/90">
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
