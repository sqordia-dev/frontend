import { useRef } from 'react';
import { useInView } from 'framer-motion';
import NumberFlow from '@number-flow/react';
import { useTheme } from '../../contexts/ThemeContext';
import { usePublishedContent } from '@/hooks/usePublishedContent';
import { cn } from '@/lib/utils';

interface StatItem {
  value: number;
  suffix: string;
  prefix?: string;
  labelKey: string;
}

const stats: StatItem[] = [
  { value: 12500, suffix: '+', labelKey: 'landing.statsbar.plans' },
  { value: 3200, suffix: '+', labelKey: 'landing.statsbar.users' },
  { value: 4.9, suffix: '/5', labelKey: 'landing.statsbar.satisfaction' },
  { value: 25, suffix: '+', labelKey: 'landing.statsbar.countries' },
];

export default function StatsBar() {
  const { theme, t } = useTheme();
  const { getBlockContent } = usePublishedContent();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const isDark = theme === 'dark';

  return (
    <section
      ref={ref}
      className={cn(
        'relative py-12 md:py-16',
        isDark ? 'bg-[#0B0C0A]' : 'bg-[#FAFAF8]',
      )}
      aria-label={getBlockContent('landing.statsbar.label', t('landing.statsbar.label'))}
    >
      {/* Noise texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: "url('/noise.svg')", backgroundRepeat: 'repeat' }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={cn(
                'flex flex-col items-center text-center px-6 py-6 rounded-2xl backdrop-blur-sm border transition-all duration-300 hover:-translate-y-0.5',
                isDark
                  ? 'bg-white/[0.03] border-white/[0.06] hover:bg-white/[0.05] hover:border-white/[0.1]'
                  : 'bg-white/60 border-gray-200/50 hover:bg-white/80 hover:border-gray-200 shadow-sm hover:shadow-md',
              )}
            >
              <div
                className={cn(
                  'text-3xl sm:text-4xl font-bold font-heading tabular-nums tracking-tight mb-1.5',
                  isDark ? 'text-white' : 'text-strategy-blue',
                )}
              >
                {stat.prefix && <span>{stat.prefix}</span>}
                <NumberFlow
                  value={isInView ? stat.value : 0}
                  format={
                    stat.value < 10
                      ? { minimumFractionDigits: 1, maximumFractionDigits: 1 }
                      : { useGrouping: true }
                  }
                  transformTiming={{ duration: 1200, easing: 'ease-out' }}
                />
                <span className="text-momentum-orange">{stat.suffix}</span>
              </div>
              <span
                className={cn(
                  'text-sm font-medium',
                  isDark ? 'text-gray-400' : 'text-gray-500',
                )}
              >
                {getBlockContent(`landing.statsbar.${stat.labelKey.split('.').pop()}`, t(stat.labelKey))}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
