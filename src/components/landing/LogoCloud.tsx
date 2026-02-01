import { useEffect, useRef } from 'react';
import { FileText, DollarSign, Globe, Star } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface Stat {
  icon: React.ElementType;
  valueKey: string;
  labelKey: string;
  iconColor: string;
}

const stats: Stat[] = [
  { icon: FileText, valueKey: 'landing.stats.plans.value', labelKey: 'landing.stats.plans.label', iconColor: 'text-[#FF6B00]' },
  { icon: DollarSign, valueKey: 'landing.stats.funding.value', labelKey: 'landing.stats.funding.label', iconColor: 'text-emerald-500' },
  { icon: Globe, valueKey: 'landing.stats.countries.value', labelKey: 'landing.stats.countries.label', iconColor: 'text-blue-500' },
  { icon: Star, valueKey: 'landing.stats.rating.value', labelKey: 'landing.stats.rating.label', iconColor: 'text-amber-500' },
];

export default function LogoCloud() {
  const { theme, t } = useTheme();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll('.fade-in-element');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const isDark = theme === 'dark';

  return (
    <section
      ref={sectionRef}
      className="py-12 md:py-16 relative overflow-hidden"
      style={{ backgroundColor: isDark ? '#0F172A' : '#F9FAFB' }}
      aria-labelledby="stats-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <p
          id="stats-heading"
          className="fade-in-element text-center text-sm md:text-base font-medium mb-8 md:mb-12"
          style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
        >
          {t('landing.stats.heading')}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 items-center justify-items-center max-w-4xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="fade-in-element group flex flex-col items-center text-center transition-all duration-300"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <Icon
                  size={24}
                  className={`${stat.iconColor} mb-2 group-hover:scale-110 transition-transform`}
                  aria-hidden="true"
                />
                <span
                  className="text-3xl md:text-4xl font-bold mb-1"
                  style={{ color: isDark ? '#FFFFFF' : '#1A2B47' }}
                >
                  {t(stat.valueKey)}
                </span>
                <span
                  className="text-sm md:text-base"
                  style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
                >
                  {t(stat.labelKey)}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .fade-in-element {
          opacity: 0;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-fade-in {
            animation: none !important;
          }
          .fade-in-element {
            opacity: 1 !important;
          }
        }
      `}</style>
    </section>
  );
}
