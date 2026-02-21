import { Brain, Target, Users, LayoutGrid } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { usePublishedContent } from '@/hooks/usePublishedContent';
import { cn } from '@/lib/utils';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../animations/ScrollReveal';

interface ValueProp {
  icon: React.ElementType;
  titleKey: string;
  descriptionKey: string;
  /** Tailwind gradient class for the icon background */
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

export default function ValueProps() {
  const { t } = useTheme();
  const { getBlockContent } = usePublishedContent();

  return (
    <section
      id="value-props"
      className="py-section-lg bg-white dark:bg-gray-900"
      aria-labelledby="value-props-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header — horizontal rule accent instead of Sparkles pill */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <ScrollReveal>
            <div className="flex items-center justify-center gap-3 mb-5">
              <span className="h-px w-8 bg-momentum-orange" />
              <span className="text-label-sm uppercase tracking-widest text-gray-500 dark:text-gray-400 font-semibold">
                {getBlockContent('landing.valueProps.badge', t('landing.valueProps.badge'))}
              </span>
              <span className="h-px w-8 bg-momentum-orange" />
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2
              id="value-props-heading"
              className="text-display-md sm:text-display-lg font-heading mb-6 text-strategy-blue dark:text-white"
            >
              {getBlockContent('landing.valueProps.title', t('landing.valueProps.title'))}{' '}
              <span className="text-momentum-orange">
                {getBlockContent('landing.valueProps.title.highlight', t('landing.valueProps.title.highlight'))}
              </span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <p className="text-body-lg text-gray-500 dark:text-gray-400">
              {getBlockContent('landing.valueProps.subtitle', t('landing.valueProps.subtitle'))}
            </p>
          </ScrollReveal>
        </div>

        {/* Cards */}
        <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {valueProps.map((prop, index) => (
            <StaggerItem key={index}>
              <article
                className="group rounded-2xl p-6 md:p-8 border border-border bg-white dark:bg-gray-800 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 h-full"
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
                <h3 className="text-xl md:text-2xl font-bold font-heading mb-3 text-strategy-blue dark:text-white group-hover:text-momentum-orange transition-colors duration-200">
                  {getBlockContent(prop.titleKey, t(prop.titleKey))}
                </h3>
                <p className="text-body-sm leading-relaxed text-gray-500 dark:text-gray-400">
                  {getBlockContent(prop.descriptionKey, t(prop.descriptionKey))}
                </p>
              </article>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
