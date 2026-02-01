import { Brain, Target, Users, LayoutGrid, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../animations/ScrollReveal';

interface ValueProp {
  icon: React.ElementType;
  titleKey: string;
  descriptionKey: string;
  gradient: string;
}

const valueProps: ValueProp[] = [
  {
    icon: Brain,
    titleKey: 'landing.valueProps.1.title',
    descriptionKey: 'landing.valueProps.1.description',
    gradient: 'from-[#FF6B00] to-[#E55F00]',
  },
  {
    icon: Target,
    titleKey: 'landing.valueProps.2.title',
    descriptionKey: 'landing.valueProps.2.description',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: Users,
    titleKey: 'landing.valueProps.3.title',
    descriptionKey: 'landing.valueProps.3.description',
    gradient: 'from-orange-500 to-amber-500',
  },
  {
    icon: LayoutGrid,
    titleKey: 'landing.valueProps.4.title',
    descriptionKey: 'landing.valueProps.4.description',
    gradient: 'from-pink-500 to-rose-500',
  },
];

const shadowColors: Record<string, string> = {
  'from-[#FF6B00] to-[#E55F00]': 'rgba(255, 107, 0, 0.25)',
  'from-emerald-500 to-teal-500': 'rgba(16, 185, 129, 0.25)',
  'from-orange-500 to-amber-500': 'rgba(245, 158, 11, 0.25)',
  'from-pink-500 to-rose-500': 'rgba(236, 72, 153, 0.25)',
};

export default function ValueProps() {
  const { theme, t } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section
      id="value-props"
      className="py-20 md:py-28 lg:py-32 relative overflow-hidden"
      style={{ backgroundColor: isDark ? '#111827' : '#FFFFFF' }}
      aria-labelledby="value-props-heading"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-0 left-1/4 w-[400px] h-[400px] rounded-full filter blur-[100px] opacity-30"
          style={{ backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full filter blur-[100px] opacity-30"
          style={{ backgroundColor: isDark ? 'rgba(236, 72, 153, 0.1)' : 'rgba(236, 72, 153, 0.05)' }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-[#FF6B00]" aria-hidden="true" />
              <span
                className="px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold"
                style={{
                  backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)',
                  color: isDark ? '#A5B4FC' : '#4F46E5',
                }}
              >
                {t('landing.valueProps.badge')}
              </span>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2
              id="value-props-heading"
              className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading mb-6"
              style={{ color: isDark ? '#FFFFFF' : '#1A2B47' }}
            >
              {t('landing.valueProps.title')}{' '}
              <span className="bg-gradient-to-r from-[#FF6B00] to-[#E55F00] bg-clip-text text-transparent">
                {t('landing.valueProps.title.highlight')}
              </span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <p
              className="text-lg md:text-xl"
              style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
            >
              {t('landing.valueProps.subtitle')}
            </p>
          </ScrollReveal>
        </div>

        {/* Value Props Grid */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {valueProps.map((prop, index) => (
            <StaggerItem key={index}>
              <article
                className="group relative rounded-2xl p-6 md:p-8 border-2 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 h-full"
                style={{
                  backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                  borderColor: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 25px 50px -12px ${shadowColors[prop.gradient]}`;
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                  e.currentTarget.style.borderColor = isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)';
                }}
              >
                {/* Decorative corner accent */}
                <div
                  className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${prop.gradient} opacity-10 rounded-bl-full`}
                  aria-hidden="true"
                />

                {/* Icon */}
                <div
                  className={`relative w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br ${prop.gradient} rounded-xl md:rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}
                >
                  <prop.icon className="text-white" size={28} strokeWidth={2} aria-hidden="true" />
                  {/* Glow effect */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${prop.gradient} rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500`}
                    aria-hidden="true"
                  />
                </div>

                {/* Content */}
                <h3
                  className="text-xl md:text-2xl font-bold font-heading mb-3 group-hover:text-[#FF6B00] dark:group-hover:text-[#FDBA74] transition-colors"
                  style={{ color: isDark ? '#FFFFFF' : '#1A2B47' }}
                >
                  {t(prop.titleKey)}
                </h3>
                <p
                  className="text-sm md:text-base leading-relaxed"
                  style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
                >
                  {t(prop.descriptionKey)}
                </p>
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
