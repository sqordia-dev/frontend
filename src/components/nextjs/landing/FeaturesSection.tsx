'use client';

import Image from 'next/image';
import { CheckCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

const features = [
  {
    stepKey: 'step1',
    accentColor: '#FF6B00',
    screenshot: '/images/screenshots/questionnaire.png',
  },
  {
    stepKey: 'step2',
    accentColor: '#14B8A6',
    screenshot: '/images/screenshots/preview.png',
  },
  {
    stepKey: 'step3',
    accentColor: '#F59E0B',
    screenshot: '/images/screenshots/dashboard.png',
  },
];

export default function FeaturesSection() {
  const t = useTranslations('landing.features');

  return (
    <section
      id="features"
      className="py-20 lg:py-32 bg-gray-50 dark:bg-slate-900"
      aria-labelledby="features-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <p className="text-xs uppercase tracking-widest text-[#FF6B00] mb-4 font-semibold">
            {t('badge')}
          </p>
          <h2
            id="features-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading mb-6 text-[#1A2B47] dark:text-white"
          >
            {t('title')}{' '}
            <span className="text-[#FF6B00]">{t('titleHighlight')}</span>
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            {t('subtitle')}
          </p>
        </div>

        {/* Features */}
        <div className="space-y-24 md:space-y-32">
          {features.map((feature, index) => {
            const isReversed = index % 2 === 1;
            const stepKey = feature.stepKey;

            return (
              <div key={index} className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                {/* Content card */}
                <div className={cn(isReversed && 'lg:order-2')}>
                  <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm flex flex-row bg-white dark:bg-gray-800">
                    {/* Left accent bar */}
                    <div
                      className="w-1 min-h-full flex-shrink-0 rounded-l-full"
                      style={{ backgroundColor: feature.accentColor }}
                      aria-hidden
                    />
                    <div className="flex-1 p-6 sm:p-8 md:p-10 text-left">
                      <div className="flex items-center gap-3 mb-4">
                        <span
                          className="text-white font-bold text-sm w-9 h-9 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: feature.accentColor }}
                        >
                          {index + 1}
                        </span>
                        <span className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                          {t(`${stepKey}.subtitle`)}
                        </span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading mb-4 leading-tight text-[#1A2B47] dark:text-white">
                        {t(`${stepKey}.title`)}
                      </h3>
                      <p className="text-lg mb-6 leading-relaxed text-gray-500 dark:text-gray-400">
                        {t(`${stepKey}.description`)}
                      </p>
                      <ul className="space-y-3">
                        {[1, 2, 3, 4].map((benefitIndex) => (
                          <li key={benefitIndex} className="flex items-start gap-3">
                            <CheckCircle
                              size={20}
                              className="flex-shrink-0 mt-0.5 text-green-500"
                              aria-hidden="true"
                            />
                            <span className="text-gray-700 dark:text-gray-300">
                              {t(`${stepKey}.benefit${benefitIndex}`)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Product visual */}
                <div className={cn(isReversed && 'lg:order-1')}>
                  <div className="rounded-2xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
                    <Image
                      src={feature.screenshot}
                      alt={t(`${stepKey}.imageAlt`)}
                      width={1440}
                      height={900}
                      className="w-full h-auto block"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
