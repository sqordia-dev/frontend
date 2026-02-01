import { FileText, DollarSign, Globe, Star } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../animations/ScrollReveal';

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
  const isDark = theme === 'dark';

  return (
    <section
      className="py-12 md:py-16 relative overflow-hidden"
      style={{ backgroundColor: isDark ? '#0F172A' : '#F9FAFB' }}
      aria-labelledby="stats-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <ScrollReveal>
          <h2
            id="stats-heading"
            className="text-center text-sm md:text-base font-medium mb-8 md:mb-12"
            style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
          >
            {t('landing.stats.heading')}
          </h2>
        </ScrollReveal>

        {/* Stats Grid */}
        <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 items-center justify-items-center max-w-4xl mx-auto">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <StaggerItem key={index}>
                <div className="group flex flex-col items-center text-center transition-all duration-300">
                  <Icon
                    size={24}
                    className={`${stat.iconColor} mb-2 group-hover:scale-110 transition-transform`}
                    aria-hidden="true"
                  />
                  <span
                    className="text-3xl md:text-4xl font-bold font-heading mb-1"
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
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
