'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Shield, Clock, XCircle } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import { cn } from '@/lib/utils';

const THEME_ORANGE = '#FF6B00';

export default function HeroSection() {
  const t = useTranslations('landing.hero');
  const locale = useLocale();

  return (
    <section
      className={cn(
        'relative pt-28 pb-16 md:pt-36 md:pb-24 lg:pt-44 lg:pb-32 overflow-hidden min-h-[90vh] flex items-center',
        'bg-gradient-to-b from-gray-50 to-white dark:from-[#1A2B47] dark:to-[#0F172A]',
      )}
      aria-labelledby="hero-heading"
    >
      {/* Subtle dot pattern */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-50 dark:opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(26,43,71,0.06) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left column */}
          <div className="text-center lg:text-left">
            {/* Social proof badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 mb-7 rounded-full text-sm font-medium border bg-white dark:bg-white/5 border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300 shadow-sm">
              <span className="flex items-center gap-1.5 text-green-500 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                {t('badge.trusted')}
              </span>
              <span className="w-px h-3.5 bg-gray-300 dark:bg-gray-600" />
              <span>{t('badge.rating')}</span>
            </div>

            {/* Headline */}
            <h1
              id="hero-heading"
              className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 font-heading text-[#1A2B47] dark:text-white"
            >
              <span className="block">{t('headline.line1')}</span>
              <span className="block" style={{ color: THEME_ORANGE }}>{t('headline.highlight')}</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl mb-8 max-w-xl mx-auto lg:mx-0 text-gray-500 dark:text-gray-300">
              {t('subheadline')}
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10">
              <Link
                href={`/${locale}/signup`}
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#FF6B00] hover:bg-[#E55F00] text-white text-base font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-4 focus:ring-[#FF6B00]/30"
              >
                {t('cta.primary')}
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                href={`/${locale}/example-plans`}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold rounded-lg border transition-all duration-200 bg-white dark:bg-white/5 border-gray-200 dark:border-white/15 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 shadow-sm focus:outline-none focus:ring-4 focus:ring-gray-400/30"
              >
                {t('cta.secondary')}
              </Link>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <Shield size={16} className="text-green-500" />
                <span>{t('trust.noCard')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={16} style={{ color: THEME_ORANGE }} />
                <span>{t('trust.trial')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <XCircle size={16} className="text-gray-400" />
                <span>{t('trust.cancel')}</span>
              </div>
            </div>
          </div>

          {/* Right column - Dashboard preview */}
          <div className="relative lg:pl-4">
            <div className="rounded-2xl border overflow-hidden shadow-2xl border-gray-200 dark:border-gray-700">
              <Image
                src="/images/screenshots/dashboard.png"
                alt={t('productDemo')}
                width={1440}
                height={900}
                className="w-full h-auto block"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
