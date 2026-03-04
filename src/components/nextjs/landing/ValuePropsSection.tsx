'use client';

import { Brain, Target, Users, LayoutGrid } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

const valueProps = [
  {
    icon: Brain,
    titleKey: '1.title',
    descriptionKey: '1.description',
    gradient: 'from-[#FF6B00] to-[#E55F00]',
  },
  {
    icon: Target,
    titleKey: '2.title',
    descriptionKey: '2.description',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Users,
    titleKey: '3.title',
    descriptionKey: '3.description',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    icon: LayoutGrid,
    titleKey: '4.title',
    descriptionKey: '4.description',
    gradient: 'from-pink-500 to-rose-500',
  },
];

export default function ValuePropsSection() {
  const t = useTranslations('landing.valueProps');

  return (
    <section
      id="value-props"
      className="py-20 lg:py-32 bg-white dark:bg-gray-900"
      aria-labelledby="value-props-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="h-px w-8 bg-[#FF6B00]" />
            <span className="text-xs uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold">
              {t('badge')}
            </span>
            <span className="h-px w-8 bg-[#FF6B00]" />
          </div>
          <h2
            id="value-props-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading mb-6 text-[#1A2B47] dark:text-white"
          >
            {t('title')}{' '}
            <span className="text-[#FF6B00]">{t('titleHighlight')}</span>
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            {t('subtitle')}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {valueProps.map((prop, index) => (
            <article
              key={index}
              className="group rounded-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 h-full"
            >
              {/* Icon */}
              <div
                className={cn(
                  'w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br rounded-xl md:rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-105 transition-transform duration-300',
                  prop.gradient,
                )}
              >
                <prop.icon className="text-white" size={28} strokeWidth={2} aria-hidden="true" />
              </div>

              {/* Content */}
              <h3 className="text-xl md:text-2xl font-bold font-heading mb-3 text-[#1A2B47] dark:text-white group-hover:text-[#FF6B00] transition-colors duration-200">
                {t(prop.titleKey)}
              </h3>
              <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                {t(prop.descriptionKey)}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
