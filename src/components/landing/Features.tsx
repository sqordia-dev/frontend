import { CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { usePublishedContent } from '@/hooks/usePublishedContent';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ScrollReveal } from '../animations/ScrollReveal';

interface Feature {
  titleKey: string;
  subtitleKey: string;
  descriptionKey: string;
  benefitKeys: string[];
  accentColor: string;
  imageAltKey: string;
  screenshot: string;
  screenshotDark: string;
}

const features: Feature[] = [
  {
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
    imageAltKey: 'landing.features.step1.imageAlt',
    screenshot: '/images/screenshots/interview-section.png',
    screenshotDark: '/images/screenshots/interview-section-dark.png',
  },
  {
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
    imageAltKey: 'landing.features.step2.imageAlt',
    screenshot: '/images/screenshots/preview.png',
    screenshotDark: '/images/screenshots/preview-dark.png',
  },
  {
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
    imageAltKey: 'landing.features.step3.imageAlt',
    screenshot: '/images/screenshots/preview-section.png',
    screenshotDark: '/images/screenshots/preview-section-dark.png',
  },
];

export default function Features() {
  const { theme, t } = useTheme();
  const { getBlockContent } = usePublishedContent();
  const isDark = theme === 'dark';

  return (
    <section
      id="features"
      className={cn(
        'relative py-12 sm:py-16 md:py-24 lg:py-32',
        isDark ? 'bg-[#181B22]' : 'bg-gray-50',
      )}
      aria-labelledby="features-heading"
    >
      {/* Noise texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: "url('/noise.svg')", backgroundRepeat: 'repeat' }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16 lg:mb-24">
          <ScrollReveal>
            <p className="text-label-sm uppercase tracking-widest text-momentum-orange mb-4">
              {t('landing.features.badge')}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2
              id="features-heading"
              className={cn(
                'text-2xl sm:text-3xl md:text-display-md lg:text-display-lg font-heading mb-4 sm:mb-6',
                isDark ? 'text-white' : 'text-strategy-blue',
              )}
            >
              {t('landing.features.title')}{' '}
              <span className="bg-gradient-to-r from-momentum-orange to-amber-500 bg-clip-text text-transparent">
                {t('landing.features.title.highlight')}
              </span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <p className={cn('text-body-lg', isDark ? 'text-gray-400' : 'text-gray-500')}>
              {t('landing.features.subtitle')}
            </p>
          </ScrollReveal>
        </div>

        {/* Features */}
        <div className="space-y-12 sm:space-y-16 md:space-y-24 lg:space-y-32">
          {features.map((feature, index) => {
            const isReversed = index % 2 === 1;

            return (
              <ScrollReveal key={index} delay={index * 0.1}>
                <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
                  {/* Content card */}
                  <div className={cn(isReversed && 'lg:order-2')}>
                    <Card
                      className={cn(
                        'overflow-hidden rounded-2xl border flex flex-row backdrop-blur-sm transition-all duration-300 hover:-translate-y-1',
                        isDark
                          ? 'bg-white/[0.03] border-white/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.3)] hover:bg-white/[0.05] hover:border-white/[0.12]'
                          : 'bg-white/80 border-gray-200/60 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.1)]',
                      )}
                    >
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
                            <span className={cn('text-label-sm uppercase tracking-wide', isDark ? 'text-gray-400' : 'text-gray-500')}>
                              {getBlockContent(`landing.features.step${index + 1}.subtitle`, t(feature.subtitleKey))}
                            </span>
                          </div>
                        </CardHeader>
                        <CardTitle
                          className={cn(
                            'text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold font-heading mb-3 sm:mb-4 leading-tight',
                            isDark ? 'text-white' : 'text-strategy-blue',
                          )}
                        >
                          {getBlockContent(`landing.features.step${index + 1}.title`, t(feature.titleKey))}
                        </CardTitle>
                        <CardDescription className={cn('text-body-lg mb-6 leading-relaxed', isDark ? 'text-gray-400' : 'text-gray-500')}>
                          {getBlockContent(`landing.features.step${index + 1}.description`, t(feature.descriptionKey))}
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
                                <span className={cn('text-gray-700', isDark && 'text-gray-300')}>
                                  {getBlockContent(`landing.features.step${index + 1}.benefit${benefitIndex + 1}`, t(benefitKey))}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </div>
                    </Card>
                  </div>

                  {/* Product screenshot */}
                  <div className={cn(isReversed && 'lg:order-1')}>
                    <div
                      className={cn(
                        'rounded-2xl overflow-hidden border transition-all duration-300 hover:-translate-y-1',
                        isDark
                          ? 'border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
                          : 'border-gray-200/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]',
                      )}
                    >
                      <img
                        src={isDark ? feature.screenshotDark : feature.screenshot}
                        alt={t(feature.imageAltKey)}
                        className="w-full h-auto block"
                        loading="lazy"
                        width={1440}
                        height={900}
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
