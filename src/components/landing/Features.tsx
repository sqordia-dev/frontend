import { MessageSquare, BarChart3, Share2, Sparkles, CheckCircle } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Feature {
  icon: React.ElementType;
  titleKey: string;
  subtitleKey: string;
  descriptionKey: string;
  benefitKeys: string[];
  /** Solid accent color (no gradient). */
  accentColor: string;
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
    imageAltKey: 'landing.features.step3.imageAlt',
  },
];

export default function Features() {
  const { theme, t } = useTheme();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-slide-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll('.slide-up-element');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const isDark = theme === 'dark';

  return (
    <section
      ref={sectionRef}
      id="features"
      className="py-20 md:py-28 lg:py-32 relative overflow-hidden"
      style={{ backgroundColor: isDark ? '#0F172A' : '#F9FAFB' }}
      aria-labelledby="features-heading"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24">
          <div className="slide-up-element inline-flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-[#FF6B00]" aria-hidden="true" />
            <span
              className="px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold"
              style={{
                backgroundColor: isDark ? 'rgba(255, 107, 0, 0.2)' : 'rgba(255, 107, 0, 0.1)',
                color: isDark ? '#FDBA74' : '#FF6B00',
              }}
            >
              {t('landing.features.badge')}
            </span>
          </div>
          <h2
            id="features-heading"
            className="slide-up-element text-3xl sm:text-4xl md:text-5xl font-bold mb-6"
            style={{ color: isDark ? '#FFFFFF' : '#1A2B47' }}
          >
            {t('landing.features.title')}{' '}
            <span style={{ color: '#FF6B00' }}>
              {t('landing.features.title.highlight')}
            </span>
          </h2>
          <p
            className="slide-up-element text-lg md:text-xl"
            style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
          >
            {t('landing.features.subtitle')}
          </p>
        </div>

        {/* Features */}
        <div className="space-y-24 md:space-y-32">
          {features.map((feature, index) => {
            const isReversed = index % 2 === 1;
            const Icon = feature.icon;

            return (
              <div
                key={index}
                className={`slide-up-element grid lg:grid-cols-2 gap-12 lg:gap-16 items-center ${isReversed ? 'lg:flex-row-reverse' : ''}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Content - Option A: Card with left accent bar, Shadcn components, left-aligned */}
                <div className={cn(isReversed && 'lg:order-2')}>
                  <Card
                    className={cn(
                      'overflow-hidden rounded-2xl border shadow-sm flex flex-row',
                      isDark ? 'bg-[#1E293B] border-white/10' : 'bg-white border-gray-200/80'
                    )}
                  >
                    {/* Left vertical accent bar (solid color) */}
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
                          <span
                            className="text-sm font-semibold uppercase tracking-wide"
                            style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
                          >
                            {t(feature.subtitleKey)}
                          </span>
                        </div>
                      </CardHeader>
                      <CardTitle
                        className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 leading-tight"
                        style={{ color: isDark ? '#FFFFFF' : '#1A2B47' }}
                      >
                        {t(feature.titleKey)}
                      </CardTitle>
                      <CardDescription
                        className="text-lg mb-6 leading-relaxed"
                        style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
                      >
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
                              <span style={{ color: isDark ? '#D1D5DB' : '#374151' }}>
                                {t(benefitKey)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </div>
                  </Card>
                </div>

                {/* Image/Screenshot placeholder */}
                <div className={`${isReversed ? 'lg:order-1' : ''}`}>
                  <div
                    className="relative rounded-2xl overflow-hidden shadow-2xl border"
                    style={{
                      backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                      borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    }}
                  >
                    {/* Screenshot placeholder */}
                    <div className="aspect-[4/3] flex items-center justify-center p-8">
                      <div className="text-center">
                        <div
                          className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center opacity-20"
                          style={{ backgroundColor: feature.accentColor }}
                        >
                          <Icon className="w-10 h-10" style={{ color: isDark ? '#FFFFFF' : '#1A2B47' }} aria-hidden="true" />
                        </div>
                        <p
                          className="text-lg font-medium"
                          style={{ color: isDark ? '#E5E7EB' : '#374151' }}
                        >
                          {t(feature.subtitleKey)}
                        </p>
                        <p
                          className="text-sm mt-1"
                          style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
                        >
                          {t('landing.features.screenshot.placeholder')}
                        </p>
                      </div>
                    </div>

                    {/* Solid tint overlay */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-5"
                      style={{ backgroundColor: feature.accentColor }}
                      aria-hidden="true"
                    />
                  </div>

                  {/* Decorative element - solid color */}
                  <div
                    className={cn('absolute -z-10 w-full h-full rounded-2xl -bottom-4 opacity-10', isReversed ? '-left-4' : '-right-4')}
                    style={{ backgroundColor: feature.accentColor }}
                    aria-hidden="true"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-up {
          animation: slide-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .slide-up-element {
          opacity: 0;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-slide-up {
            animation: none !important;
          }
          .slide-up-element {
            opacity: 1 !important;
          }
        }
      `}</style>
    </section>
  );
}
