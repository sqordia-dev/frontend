import { Brain, BarChart3, Users, FileText, Download, MessageSquare, Sparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function Features() {
  const { t, theme } = useTheme();
  const isDark = theme === 'dark';

  const features = [
    {
      icon: Brain,
      titleKey: 'features.feature1.title',
      descKey: 'features.feature1.desc',
      iconBg: 'bg-strategy-blue',
    },
    {
      icon: BarChart3,
      titleKey: 'features.feature2.title',
      descKey: 'features.feature2.desc',
      iconBg: 'bg-momentum-orange',
    },
    {
      icon: MessageSquare,
      titleKey: 'features.feature3.title',
      descKey: 'features.feature3.desc',
      iconBg: 'bg-strategy-blue',
    },
    {
      icon: Download,
      titleKey: 'features.feature4.title',
      descKey: 'features.feature4.desc',
      iconBg: 'bg-momentum-orange',
    },
    {
      icon: Users,
      titleKey: 'features.feature5.title',
      descKey: 'features.feature5.desc',
      iconBg: 'bg-strategy-blue',
    },
    {
      icon: FileText,
      titleKey: 'features.feature6.title',
      descKey: 'features.feature6.desc',
      iconBg: 'bg-momentum-orange',
    }
  ];

  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll('.slide-up-element');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="features"
      className={cn(
        "py-section-md lg:py-section-lg relative overflow-hidden",
        isDark ? "bg-gray-900" : "bg-white"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-20">
          <div className="slide-up-element mb-6">
            <Badge
              variant="secondary"
              className={cn(
                "px-4 py-2 text-sm font-semibold",
                isDark
                  ? "bg-white/10 text-white border-white/20"
                  : "bg-strategy-blue/5 text-strategy-blue border-strategy-blue/15"
              )}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {t('features.badge') || 'Features'}
            </Badge>
          </div>

          <h2 className={cn(
            "slide-up-element text-display-md md:text-display-lg lg:text-display-xl mb-6",
            isDark ? "text-white" : "text-gray-900"
          )}>
            {t('features.title')}{' '}
            <span className="text-momentum-orange">
              {t('features.title.highlight')}
            </span>
          </h2>

          <p className={cn(
            "slide-up-element text-body-lg md:text-xl max-w-2xl mx-auto",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>
            {t('features.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className={cn(
                "slide-up-element group relative rounded-2xl lg:rounded-3xl p-6 md:p-8",
                "border-2 overflow-hidden",
                "transition-all duration-300",
                "hover:-translate-y-1 hover:shadow-xl",
                isDark
                  ? "bg-gray-800/50 border-gray-700/50 hover:border-gray-600"
                  : "bg-light-ai-grey border-gray-200 hover:border-strategy-blue/20"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div
                className={cn(
                  "relative w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-6",
                  "shadow-sm transition-transform duration-300",
                  "group-hover:scale-105",
                  feature.iconBg
                )}
              >
                <feature.icon className="text-white" size={28} strokeWidth={2} />
              </div>

              {/* Content */}
              <h3 className={cn(
                "text-heading-lg md:text-heading-xl font-bold mb-3",
                "transition-colors duration-300",
                isDark
                  ? "text-white"
                  : "text-gray-900"
              )}>
                {t(feature.titleKey)}
              </h3>

              <p className={cn(
                "text-body-md leading-relaxed",
                isDark ? "text-gray-400" : "text-gray-600"
              )}>
                {t(feature.descKey)}
              </p>

              {/* Bottom accent line */}
              <div
                className={cn(
                  "absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100",
                  "transition-opacity duration-300",
                  index % 2 === 0 ? "bg-strategy-blue" : "bg-momentum-orange"
                )}
              />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .slide-up-element {
          opacity: 0;
        }

        @media (prefers-reduced-motion: reduce) {
          .slide-up-element {
            opacity: 1 !important;
          }
        }
      `}</style>
    </section>
  );
}
