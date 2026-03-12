import { useState, useRef } from 'react';
import { Check, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useInView } from 'framer-motion';
import NumberFlow from '@number-flow/react';
import { useTheme } from '../../contexts/ThemeContext';
import { usePublishedContent } from '@/hooks/usePublishedContent';
import { cn } from '@/lib/utils';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../animations/ScrollReveal';

interface PlanTier {
  nameKey: string;
  monthlyPrice: number;
  yearlyPrice: number;
  descriptionKey: string;
  featureKeys: string[];
  ctaKey: string;
  ctaLink: string;
  highlighted?: boolean;
  badgeKey?: string;
}

const plans: PlanTier[] = [
  {
    nameKey: 'landing.pricing.free.name',
    monthlyPrice: 0,
    yearlyPrice: 0,
    descriptionKey: 'landing.pricing.free.desc',
    featureKeys: [
      'landing.pricing.free.f1',
      'landing.pricing.free.f2',
      'landing.pricing.free.f3',
      'landing.pricing.free.f4',
      'landing.pricing.free.f5',
    ],
    ctaKey: 'landing.pricing.free.cta',
    ctaLink: '/signup',
  },
  {
    nameKey: 'landing.pricing.starter.name',
    monthlyPrice: 29,
    yearlyPrice: 24,
    descriptionKey: 'landing.pricing.starter.desc',
    featureKeys: [
      'landing.pricing.starter.f1',
      'landing.pricing.starter.f2',
      'landing.pricing.starter.f3',
      'landing.pricing.starter.f4',
      'landing.pricing.starter.f5',
      'landing.pricing.starter.f6',
    ],
    ctaKey: 'landing.pricing.starter.cta',
    ctaLink: '/signup?plan=starter',
  },
  {
    nameKey: 'landing.pricing.pro.name',
    monthlyPrice: 59,
    yearlyPrice: 49,
    descriptionKey: 'landing.pricing.pro.desc',
    featureKeys: [
      'landing.pricing.pro.f1',
      'landing.pricing.pro.f2',
      'landing.pricing.pro.f3',
      'landing.pricing.pro.f4',
      'landing.pricing.pro.f5',
      'landing.pricing.pro.f6',
    ],
    ctaKey: 'landing.pricing.pro.cta',
    ctaLink: '/signup?plan=professional',
    highlighted: true,
    badgeKey: 'landing.pricing.pro.badge',
  },
  {
    nameKey: 'landing.pricing.enterprise.name',
    monthlyPrice: 149,
    yearlyPrice: 124,
    descriptionKey: 'landing.pricing.enterprise.desc',
    featureKeys: [
      'landing.pricing.enterprise.f1',
      'landing.pricing.enterprise.f2',
      'landing.pricing.enterprise.f3',
      'landing.pricing.enterprise.f4',
      'landing.pricing.enterprise.f5',
      'landing.pricing.enterprise.f6',
    ],
    ctaKey: 'landing.pricing.enterprise.cta',
    ctaLink: '/contact',
  },
];

export default function Pricing() {
  const { theme, t } = useTheme();
  const { getBlockContent } = usePublishedContent();
  const [isYearly, setIsYearly] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const isDark = theme === 'dark';

  const highlightedPlan = plans.find((p) => p.highlighted);
  const yearlySavings = highlightedPlan
    ? Math.round(((highlightedPlan.monthlyPrice - highlightedPlan.yearlyPrice) / highlightedPlan.monthlyPrice) * 100)
    : 0;

  return (
    <section
      id="pricing"
      ref={ref}
      className={cn(
        'relative py-12 sm:py-16 md:py-24 lg:py-32',
        isDark ? 'bg-[#0B0C0A]' : 'bg-white',
      )}
      aria-labelledby="pricing-heading"
    >
      {/* Noise texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: "url('/noise.svg')", backgroundRepeat: 'repeat' }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16">
          <ScrollReveal>
            <p className="text-label-sm uppercase tracking-widest text-momentum-orange mb-3 sm:mb-4">
              {getBlockContent('landing.pricing.badge', t('landing.pricing.badge'))}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2
              id="pricing-heading"
              className={cn(
                'text-2xl sm:text-3xl md:text-display-md lg:text-display-lg font-heading mb-4 sm:mb-6',
                isDark ? 'text-white' : 'text-strategy-blue',
              )}
            >
              {getBlockContent('landing.pricing.title', t('landing.pricing.title'))}{' '}
              <span className="bg-gradient-to-r from-momentum-orange to-amber-500 bg-clip-text text-transparent">
                {getBlockContent('landing.pricing.title.highlight', t('landing.pricing.title.highlight'))}
              </span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <p className={cn('text-body-lg', isDark ? 'text-gray-400' : 'text-gray-500')}>
              {getBlockContent('landing.pricing.subtitle', t('landing.pricing.subtitle'))}
            </p>
          </ScrollReveal>

          {/* Toggle */}
          <ScrollReveal delay={0.2}>
            <div className="flex items-center justify-center gap-4 mt-8">
              <span
                className={cn(
                  'text-sm font-medium transition-colors',
                  !isYearly
                    ? isDark ? 'text-white' : 'text-gray-900'
                    : isDark ? 'text-gray-500' : 'text-gray-400',
                )}
              >
                {t('landing.pricing.monthly')}
              </span>
              <button
                onClick={() => setIsYearly(!isYearly)}
                className={cn(
                  'relative w-14 h-7 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-momentum-orange/50 focus:ring-offset-2',
                  isYearly ? 'bg-momentum-orange' : isDark ? 'bg-gray-600' : 'bg-gray-300',
                )}
                role="switch"
                aria-checked={isYearly}
                aria-label={t('landing.pricing.toggleLabel')}
              >
                <span
                  className={cn(
                    'absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200',
                    isYearly && 'translate-x-7',
                  )}
                />
              </button>
              <span
                className={cn(
                  'text-sm font-medium transition-colors',
                  isYearly
                    ? isDark ? 'text-white' : 'text-gray-900'
                    : isDark ? 'text-gray-500' : 'text-gray-400',
                )}
              >
                {t('landing.pricing.yearly')}
              </span>
              {isYearly && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  {t('landing.pricing.save').replace('{percent}', String(yearlySavings))}
                </span>
              )}
            </div>
          </ScrollReveal>
        </div>

        {/* Plan Cards */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-5 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
            return (
              <StaggerItem key={plan.nameKey}>
                <div
                  className={cn(
                    'relative rounded-2xl border p-6 md:p-7 flex flex-col h-full backdrop-blur-sm transition-all duration-300 hover:-translate-y-1',
                    plan.highlighted
                      ? cn(
                          'border-momentum-orange md:scale-[1.02] z-10',
                          isDark
                            ? 'bg-white/[0.04] shadow-[0_0_40px_rgba(255,107,0,0.15),0_4px_24px_rgba(0,0,0,0.3)]'
                            : 'bg-white shadow-[0_0_40px_rgba(255,107,0,0.1),0_4px_24px_rgba(0,0,0,0.08)]',
                        )
                      : isDark
                        ? 'border-white/[0.08] bg-white/[0.02] hover:border-white/[0.15] hover:bg-white/[0.04] shadow-[0_4px_24px_rgba(0,0,0,0.2)]'
                        : 'border-gray-200/60 bg-white/70 hover:border-gray-300 hover:bg-white shadow-[0_4px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.08)]',
                  )}
                >
                  {plan.badgeKey && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-momentum-orange text-white shadow-[0_2px_8px_rgba(255,107,0,0.3)]">
                        <Sparkles size={12} />
                        {t(plan.badgeKey)}
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3
                      className={cn(
                        'text-lg font-bold font-heading mb-1',
                        isDark ? 'text-white' : 'text-strategy-blue',
                      )}
                    >
                      {t(plan.nameKey)}
                    </h3>
                    <p className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-500')}>
                      {t(plan.descriptionKey)}
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      {price === 0 ? (
                        <span className={cn('text-4xl font-bold font-heading', isDark ? 'text-white' : 'text-strategy-blue')}>
                          {t('landing.pricing.freeLabel')}
                        </span>
                      ) : (
                        <>
                          <span className={cn('text-4xl font-bold font-heading tabular-nums', isDark ? 'text-white' : 'text-strategy-blue')}>
                            <NumberFlow
                              value={isInView ? price : 0}
                              format={{ style: 'currency', currency: 'CAD', maximumFractionDigits: 0 }}
                              transformTiming={{ duration: 500, easing: 'ease-out' }}
                            />
                          </span>
                          <span className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-500')}>
                            /{t('landing.pricing.perMonth')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.featureKeys.map((key, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Check
                          size={16}
                          className={cn(
                            'flex-shrink-0 mt-0.5',
                            plan.highlighted ? 'text-momentum-orange' : 'text-green-500',
                          )}
                          aria-hidden="true"
                        />
                        <span className={cn('text-sm', isDark ? 'text-gray-300' : 'text-gray-600')}>
                          {t(key)}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    to={plan.ctaLink}
                    className={cn(
                      'group flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-4',
                      plan.highlighted
                        ? 'bg-momentum-orange hover:bg-[#E55F00] text-white shadow-[0_2px_8px_rgba(255,107,0,0.3)] hover:shadow-[0_4px_16px_rgba(255,107,0,0.4)] focus:ring-momentum-orange/30'
                        : isDark
                          ? 'bg-white/[0.08] hover:bg-white/[0.12] text-white border border-white/[0.1] focus:ring-white/20'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800 focus:ring-gray-300/50',
                    )}
                  >
                    {t(plan.ctaKey)}
                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
