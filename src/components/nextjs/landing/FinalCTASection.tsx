'use client';

import Link from 'next/link';
import { ArrowRight, Shield, Clock, CheckCircle } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';

export default function FinalCTASection() {
  const t = useTranslations('landing.finalCta');
  const locale = useLocale();

  const trustBadges = [
    { icon: Shield, textKey: 'trust.noCard' },
    { icon: Clock, textKey: 'trust.trial' },
    { icon: CheckCircle, textKey: 'trust.cancel' },
  ];

  return (
    <section
      className="relative py-24 md:py-32 lg:py-40 overflow-hidden bg-gradient-to-br from-[#FF6B00] via-[#E55F00] to-[#CC4A00]"
      aria-labelledby="final-cta-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-block px-4 py-2 bg-white/10 text-white rounded-full text-sm font-medium mb-8 border border-white/20">
            {t('badge')}
          </div>

          {/* Main Headline */}
          <h2
            id="final-cta-heading"
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-white mb-6"
          >
            {t('headline')}
          </h2>

          {/* Sub-headline */}
          <p className="text-lg md:text-xl lg:text-2xl mb-10 leading-relaxed text-white/80 max-w-2xl mx-auto">
            {t('subheadline')}
          </p>

          {/* Primary CTA Button */}
          <div className="mb-10">
            <Link
              href={`/${locale}/signup`}
              className="group inline-flex items-center gap-3 px-10 py-5 md:px-12 md:py-6 bg-white text-[#FF6B00] text-lg md:text-xl font-bold rounded-xl shadow-2xl transition-all duration-200 hover:shadow-3xl hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-white/50"
            >
              {t('cta')}
              <ArrowRight size={24} className="group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-8 text-white/90">
            {trustBadges.map((badge, index) => {
              const Icon = badge.icon;
              return (
                <div key={index} className="flex items-center gap-2">
                  <Icon size={20} className="text-white/70" aria-hidden="true" />
                  <span className="text-sm md:text-base font-medium">{t(badge.textKey)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
