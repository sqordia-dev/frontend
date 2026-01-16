import { Users, MessageSquare, Brain, FileCheck, ArrowRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function HowItWorks() {
  const { t } = useTheme();
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

  const steps = [
    {
      icon: Users,
      badgeKey: 'howItWorks.step1.badge',
      badgeExtraKey: 'howItWorks.step1.badgeExtra' as string,
      titleKey: 'howItWorks.step1.title',
      descriptionKey: 'howItWorks.step1.description',
      color: 'blue',
      bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20',
      iconGradient: 'from-blue-500 to-cyan-500',
      borderColor: 'border-blue-200 dark:border-blue-800',
      badgeColor: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    },
    {
      icon: MessageSquare,
      badgeKey: 'howItWorks.step2.badge',
      badgeExtraKey: 'howItWorks.step2.badgeExtra' as string,
      titleKey: 'howItWorks.step2.title',
      descriptionKey: 'howItWorks.step2.description',
      color: 'purple',
      bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20',
      iconGradient: 'from-purple-500 to-pink-500',
      borderColor: 'border-purple-200 dark:border-purple-800',
      badgeColor: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    },
    {
      icon: Brain,
      badgeKey: 'howItWorks.step3.badge',
      badgeExtraKey: undefined as string | undefined,
      titleKey: 'howItWorks.step3.title',
      descriptionKey: 'howItWorks.step3.description',
      color: 'orange',
      bgGradient: 'from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20',
      iconGradient: 'from-orange-500 to-amber-500',
      borderColor: 'border-orange-200 dark:border-orange-800',
      badgeColor: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    },
    {
      icon: FileCheck,
      badgeKey: 'howItWorks.step4.badge',
      badgeExtraKey: undefined as string | undefined,
      titleKey: 'howItWorks.step4.title',
      descriptionKey: 'howItWorks.step4.description',
      color: 'green',
      bgGradient: 'from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20',
      iconGradient: 'from-orange-500 to-amber-500',
      borderColor: 'border-orange-200 dark:border-orange-800',
      badgeColor: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    },
  ];

  return (
    <section ref={sectionRef} className="py-16 md:py-24 lg:py-32 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/30 via-transparent to-gray-50/30 dark:from-gray-900/30 dark:via-transparent dark:to-gray-900/30 pointer-events-none"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-12 md:mb-16 lg:mb-20">
          <div className="inline-block mb-4">
            <span className="px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs md:text-sm font-semibold">
              {t('howItWorks.badge')}
            </span>
          </div>
          <h2 className="slide-up-element text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-gray-900 dark:text-white">
            {t('howItWorks.title')}
          </h2>
          <p className="slide-up-element text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
            {t('howItWorks.subtitle')}
          </p>
        </div>

        {/* Responsive Layout: Vertical Timeline on Mobile, Horizontal on Desktop */}
        <div className="max-w-7xl mx-auto">
          {/* Mobile/Tablet: Vertical Timeline */}
          <div className="lg:hidden space-y-8 md:space-y-12">
            {steps.map((step, index) => (
              <div
                key={index}
                className="slide-up-element relative pl-12 md:pl-16"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Timeline Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-6 md:left-8 top-20 bottom-0 w-0.5 bg-gradient-to-b from-blue-200 via-purple-200 via-orange-200 to-orange-200 dark:from-blue-800 dark:via-purple-800 dark:via-orange-800 dark:to-orange-800"></div>
                )}

                {/* Timeline Dot */}
                <div className={`absolute left-0 top-6 md:top-8 w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br ${step.iconGradient} rounded-full flex items-center justify-center shadow-xl z-10 border-4 border-white dark:border-gray-900`}>
                  <step.icon className="text-white" size={24} strokeWidth={2} />
                </div>

                {/* Step Card */}
                <div 
                  className={`relative bg-gradient-to-br ${step.bgGradient} border-2 ${step.borderColor} rounded-2xl md:rounded-3xl p-6 md:p-8 transition-all duration-300 hover:shadow-xl`}
                >
                  {/* Step Number Badge */}
                  <div className="inline-block mb-4">
                    <div className={`${step.badgeColor} px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs font-bold tracking-wider shadow-sm`}>
                      {t(step.badgeKey)}
                    </div>
                  </div>

                  {/* Extra Badge */}
                  {step.badgeExtraKey !== undefined && (
                    <div className="inline-block ml-2 mb-4">
                      <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-semibold">
                        {t(step.badgeExtraKey)}
                      </span>
                    </div>
                  )}

                  {/* Title */}
                  <h3 className="text-xl md:text-2xl font-bold mb-3 md:mb-4 text-gray-900 dark:text-white">
                    {t(step.titleKey)}
                  </h3>

                  {/* Description */}
                  <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                    {t(step.descriptionKey)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: Horizontal Cards with Zigzag Layout */}
          <div className="hidden lg:grid lg:grid-cols-2 gap-8 xl:gap-12 relative">
            {/* Alternating layout for visual interest */}
            {steps.map((step, index) => {
              const isEven = index % 2 === 0;
              return (
                <div
                  key={index}
                  className={`slide-up-element relative group ${isEven ? 'lg:mt-0' : 'lg:mt-16 xl:mt-20'}`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  {/* Step Card */}
                  <div 
                    className={`relative h-full bg-gradient-to-br ${step.bgGradient} border-2 ${step.borderColor} rounded-3xl p-8 xl:p-10 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02]`}
                    style={{
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                    }}
                    onMouseEnter={(e) => {
                      const shadows = {
                        blue: '0 25px 50px -12px rgba(59, 130, 246, 0.25)',
                        purple: '0 25px 50px -12px rgba(168, 85, 247, 0.25)',
                        orange: '0 25px 50px -12px rgba(249, 115, 22, 0.25)',
                        green: '0 25px 50px -12px rgba(255, 107, 0, 0.25)'
                      };
                      e.currentTarget.style.boxShadow = shadows[step.color as keyof typeof shadows];
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                    }}
                  >
                    {/* Step Number Badge */}
                    <div className="absolute -top-4 left-8">
                      <div className={`${step.badgeColor} px-4 py-1.5 rounded-full text-xs font-bold tracking-wider shadow-lg`}>
                        {t(step.badgeKey)}
                      </div>
                    </div>

                    {/* Icon Container */}
                    <div className="mb-6 flex justify-center">
                      <div className={`relative w-20 h-20 xl:w-24 xl:h-24 bg-gradient-to-br ${step.iconGradient} rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                        <step.icon className="text-white" size={40} strokeWidth={2} />
                        {/* Glow effect */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${step.iconGradient} rounded-2xl opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500`}></div>
                      </div>
                    </div>

                    {/* Extra Badge */}
                    {step.badgeExtraKey !== undefined && (
                      <div className="flex justify-center mb-4">
                        <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-xs font-semibold shadow-sm">
                          {t(step.badgeExtraKey)}
                        </span>
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="text-xl xl:text-2xl font-bold mb-4 text-center text-gray-900 dark:text-white group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors">
                      {t(step.titleKey)}
                    </h3>

                    {/* Description */}
                    <p className="text-gray-600 dark:text-gray-400 text-center leading-relaxed text-sm xl:text-base">
                      {t(step.descriptionKey)}
                    </p>
                  </div>

                  {/* Connector Arrow (only between cards) */}
                  {index < steps.length - 1 && (
                    <div className={`hidden xl:block absolute ${isEven ? 'top-1/2 -right-6' : 'top-1/2 -right-6'} transform -translate-y-1/2 z-20`}>
                      <div className={`w-12 h-12 bg-gradient-to-br ${step.iconGradient} rounded-full flex items-center justify-center shadow-lg`}>
                        <ArrowRight className="text-white" size={20} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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

        @media (max-width: 1024px) {
          .lg\\:mt-16 {
            margin-top: 0;
          }
        }
      `}</style>
    </section>
  );
}

