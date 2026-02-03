import { MessageSquare, BarChart3, Share2, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScrollReveal } from '../animations/ScrollReveal';

interface Feature {
  icon: React.ElementType;
  titleKey: string;
  subtitleKey: string;
  descriptionKey: string;
  benefitKeys: string[];
  accentColor: string;
  /** Tailwind bg class for the accent */
  accentCls: string;
  imageAltKey: string;
}

const features: Feature[] = [
  {
    icon: MessageSquare,
    titleKey: 'landing.features.step1.title',
    subtitleKey: 'landing.features.step1.subtitle',
    descriptionKey: 'landing.features.step1.description',
    benefitKeys: [
      'landing.features.step1.benefit1',
      'landing.features.step1.benefit2',
      'landing.features.step1.benefit3',
      'landing.features.step1.benefit4',
    ],
    accentColor: '#FF6B00',
    accentCls: 'bg-momentum-orange',
    imageAltKey: 'landing.features.step1.imageAlt',
  },
  {
    icon: BarChart3,
    titleKey: 'landing.features.step2.title',
    subtitleKey: 'landing.features.step2.subtitle',
    descriptionKey: 'landing.features.step2.description',
    benefitKeys: [
      'landing.features.step2.benefit1',
      'landing.features.step2.benefit2',
      'landing.features.step2.benefit3',
      'landing.features.step2.benefit4',
    ],
    accentColor: '#14B8A6',
    accentCls: 'bg-teal-500',
    imageAltKey: 'landing.features.step2.imageAlt',
  },
  {
    icon: Share2,
    titleKey: 'landing.features.step3.title',
    subtitleKey: 'landing.features.step3.subtitle',
    descriptionKey: 'landing.features.step3.description',
    benefitKeys: [
      'landing.features.step3.benefit1',
      'landing.features.step3.benefit2',
      'landing.features.step3.benefit3',
      'landing.features.step3.benefit4',
    ],
    accentColor: '#F59E0B',
    accentCls: 'bg-amber-500',
    imageAltKey: 'landing.features.step3.imageAlt',
  },
];

export default function Features() {
  const { t } = useTheme();

  return (
    <section
      id="features"
      className="py-section-lg bg-gray-50 dark:bg-slate-900"
      aria-labelledby="features-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <ScrollReveal>
            <p className="text-label-sm uppercase tracking-widest text-momentum-orange mb-4">
              {t('landing.features.badge')}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2
              id="features-heading"
              className="text-display-md sm:text-display-lg font-heading mb-6 text-strategy-blue dark:text-white"
            >
              {t('landing.features.title')}{' '}
              <span className="text-momentum-orange">
                {t('landing.features.title.highlight')}
              </span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <p className="text-body-lg text-gray-500 dark:text-gray-400">
              {t('landing.features.subtitle')}
            </p>
          </ScrollReveal>
        </div>

        {/* Features */}
        <div className="space-y-24 md:space-y-32">
          {features.map((feature, index) => {
            const isReversed = index % 2 === 1;
            const Icon = feature.icon;

            return (
              <ScrollReveal key={index} delay={index * 0.1}>
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                  {/* Content card */}
                  <div className={cn(isReversed && 'lg:order-2')}>
                    <Card className="overflow-hidden rounded-2xl border border-border shadow-card flex flex-row bg-white dark:bg-gray-800">
                      {/* Left accent bar */}
                      <div
                        className="w-1 min-h-full flex-shrink-0 rounded-l-full"
                        style={{ backgroundColor: feature.accentColor }}
                        aria-hidden
                      />
                      <div className="flex-1 p-6 sm:p-8 md:p-10 text-left">
                        <CardHeader className="p-0 mb-4">
                          <div className="flex items-center gap-3">
                            <Badge
                              variant="secondary"
                              className="text-white font-bold text-sm w-9 h-9 rounded-full p-0 flex items-center justify-center"
                              style={{ backgroundColor: feature.accentColor }}
                            >
                              {index + 1}
                            </Badge>
                            <span className="text-label-sm uppercase tracking-wide text-gray-500 dark:text-gray-400">
                              {t(feature.subtitleKey)}
                            </span>
                          </div>
                        </CardHeader>
                        <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold font-heading mb-4 leading-tight text-strategy-blue dark:text-white">
                          {t(feature.titleKey)}
                        </CardTitle>
                        <CardDescription className="text-body-lg mb-6 leading-relaxed text-gray-500 dark:text-gray-400">
                          {t(feature.descriptionKey)}
                        </CardDescription>
                        <CardContent className="p-0">
                          <ul className="space-y-3">
                            {feature.benefitKeys.map((benefitKey, benefitIndex) => (
                              <li key={benefitIndex} className="flex items-start gap-3">
                                <CheckCircle
                                  size={20}
                                  className="flex-shrink-0 mt-0.5 text-green-500"
                                  aria-hidden="true"
                                />
                                <span className="text-gray-700 dark:text-gray-300">
                                  {t(benefitKey)}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </div>
                    </Card>
                  </div>

                  {/* Visual — prominent icon card instead of empty placeholder */}
                  <div className={cn(isReversed && 'lg:order-1')}>
                    <div className="relative rounded-2xl overflow-hidden shadow-card border border-border bg-white dark:bg-gray-800">
                      <div className="aspect-[4/3] flex items-center justify-center p-8">
                        <div
                          className={cn('w-24 h-24 rounded-2xl flex items-center justify-center', feature.accentCls)}
                        >
                          <Icon className="w-12 h-12 text-white" aria-hidden="true" />
                        </div>
                      </div>
                      {/* Subtle tint */}
                      <div
                        className="absolute inset-0 pointer-events-none opacity-[0.03]"
                        style={{ backgroundColor: feature.accentColor }}
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
