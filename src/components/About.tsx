import { Users, Target, Award, Heart, Sparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { cn } from '@/lib/utils';

export default function About() {
  const { t, theme } = useTheme();
  const sectionRef = useRef<HTMLElement>(null);
  const isDark = theme === 'dark';

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

  const stats = [
    { icon: Users, value: '50,000+', label: t('about.stats.users') },
    { icon: Target, value: '74', label: t('about.stats.industries') },
    { icon: Award, value: '22', label: t('about.stats.countries') },
  ];

  const values = [
    {
      icon: Heart,
      title: t('about.values.innovation.title'),
      description: t('about.values.innovation.desc'),
      iconBg: 'bg-momentum-orange',
    },
    {
      icon: Target,
      title: t('about.values.excellence.title'),
      description: t('about.values.excellence.desc'),
      iconBg: 'bg-strategy-blue',
    },
    {
      icon: Users,
      title: t('about.values.collaboration.title'),
      description: t('about.values.collaboration.desc'),
      iconBg: 'bg-momentum-orange',
    },
  ];

  return (
    <section
      ref={sectionRef}
      id="about"
      className={cn(
        "py-20 md:py-28 lg:py-32 relative overflow-hidden",
        isDark ? "bg-gray-900" : "bg-white"
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-20">
          <div className="slide-up-element inline-flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-momentum-orange" />
            <span className={cn(
              "px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold",
              isDark
                ? "bg-momentum-orange/10 text-momentum-orange"
                : "bg-momentum-orange/10 text-momentum-orange"
            )}>
              {t('about.badge')}
            </span>
          </div>
          <h2 className={cn(
            "slide-up-element text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6",
            isDark ? "text-white" : "text-gray-900"
          )}>
            {t('about.title')}
          </h2>
          <p className={cn(
            "slide-up-element text-base sm:text-lg md:text-xl max-w-2xl mx-auto",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>
            {t('about.subtitle')}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16 md:mb-20">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={cn(
                "slide-up-element rounded-xl md:rounded-2xl p-5 sm:p-6 md:p-8 border-2 text-center transition-all duration-300 hover:-translate-y-1",
                isDark
                  ? "bg-gray-800 border-gray-700 hover:border-gray-600 hover:shadow-lg"
                  : "bg-light-ai-grey border-gray-200 hover:border-strategy-blue/20 hover:shadow-lg"
              )}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={cn(
                "inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4",
                isDark ? "bg-momentum-orange/10" : "bg-momentum-orange/10"
              )}>
                <stat.icon className="text-momentum-orange" size={32} />
              </div>
              <div className={cn(
                "text-3xl md:text-4xl font-bold mb-2",
                isDark ? "text-white" : "text-strategy-blue"
              )}>
                {stat.value}
              </div>
              <div className={cn(
                "text-sm md:text-base",
                isDark ? "text-gray-400" : "text-gray-600"
              )}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Mission */}
        <div className="slide-up-element max-w-4xl mx-auto mb-12 sm:mb-16 md:mb-20">
          <div className={cn(
            "rounded-2xl md:rounded-3xl p-6 sm:p-8 md:p-12 border-2",
            isDark
              ? "bg-gray-800 border-gray-700"
              : "bg-light-ai-grey border-gray-200"
          )}>
            <h3 className={cn(
              "text-2xl md:text-3xl font-bold mb-4",
              isDark ? "text-white" : "text-gray-900"
            )}>
              {t('about.mission.title')}
            </h3>
            <p className={cn(
              "text-base md:text-lg leading-relaxed",
              isDark ? "text-gray-300" : "text-gray-700"
            )}>
              {t('about.mission.description')}
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-12">
          <h3 className={cn(
            "text-2xl md:text-3xl font-bold text-center mb-12",
            isDark ? "text-white" : "text-gray-900"
          )}>
            {t('about.values.title')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className={cn(
                  "slide-up-element rounded-xl md:rounded-2xl p-5 sm:p-6 md:p-8 border-2 transition-all duration-300 hover:-translate-y-1",
                  isDark
                    ? "bg-gray-800 border-gray-700 hover:border-gray-600 hover:shadow-lg"
                    : "bg-light-ai-grey border-gray-200 hover:border-strategy-blue/20 hover:shadow-lg"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm",
                  value.iconBg
                )}>
                  <value.icon className="text-white" size={32} />
                </div>
                <h4 className={cn(
                  "text-xl font-bold mb-3",
                  isDark ? "text-white" : "text-gray-900"
                )}>
                  {value.title}
                </h4>
                <p className={cn(
                  "leading-relaxed",
                  isDark ? "text-gray-400" : "text-gray-600"
                )}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
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
      `}</style>
    </section>
  );
}
