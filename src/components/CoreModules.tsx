import { TrendingUp, Shield, BarChart3, Download, Check, Sparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function CoreModules() {
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

  const modules = [
    {
      icon: TrendingUp,
      titleKey: 'coreModules.strategy.title',
      coreBenefitKey: 'coreModules.strategy.benefit',
      featuresKey: 'coreModules.strategy.features',
      color: 'blue',
      bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20',
      iconGradient: 'from-blue-500 to-cyan-500',
      borderColor: 'border-blue-200 dark:border-blue-800',
      checkColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: Shield,
      titleKey: 'coreModules.risk.title',
      coreBenefitKey: 'coreModules.risk.benefit',
      featuresKey: 'coreModules.risk.features',
      color: 'purple',
      bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20',
      iconGradient: 'from-purple-500 to-pink-500',
      borderColor: 'border-purple-200 dark:border-purple-800',
      checkColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      icon: BarChart3,
      titleKey: 'coreModules.financials.title',
      coreBenefitKey: 'coreModules.financials.benefit',
      featuresKey: 'coreModules.financials.features',
      color: 'green',
      bgGradient: 'from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20',
      iconGradient: 'from-orange-500 to-amber-500',
      borderColor: 'border-orange-200 dark:border-orange-800',
      checkColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      icon: Download,
      titleKey: 'coreModules.export.title',
      coreBenefitKey: 'coreModules.export.benefit',
      featuresKey: 'coreModules.export.features',
      color: 'orange',
      bgGradient: 'from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20',
      iconGradient: 'from-orange-500 to-amber-500',
      borderColor: 'border-orange-200 dark:border-orange-800',
      checkColor: 'text-orange-600 dark:text-orange-400',
    },
  ];

  return (
    <section ref={sectionRef} className="py-16 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-gray-50/50 dark:from-gray-900/50 dark:via-transparent dark:to-gray-900/50 pointer-events-none"></div>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-12 md:mb-16 lg:mb-20">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs md:text-sm font-semibold">
              {t('coreModules.badge') || 'Core Features'}
            </span>
          </div>
          <h2 className="slide-up-element text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 text-gray-900 dark:text-white">
            {t('coreModules.title') || 'Feature-to-Benefit Matrix'}
          </h2>
          <p className="slide-up-element text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
            {t('coreModules.subtitle') || 'Enterprise-grade features that give your plan a competitive edge'}
          </p>
        </div>

        {/* Responsive Grid: 1 column mobile, 2 columns tablet/desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
          {modules.map((module, index) => {
            const features = t(module.featuresKey)?.split(',') || [];
            
            return (
              <div
                key={index}
                className="slide-up-element group relative"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                {/* Feature Card */}
                <div 
                  className={`relative h-full bg-gradient-to-br ${module.bgGradient} border-2 ${module.borderColor} rounded-xl md:rounded-2xl lg:rounded-3xl p-5 sm:p-6 md:p-8 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.02] overflow-hidden`}
                  style={{
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                  onMouseEnter={(e) => {
                    const shadows = {
                      blue: '0 25px 50px -12px rgba(59, 130, 246, 0.25)',
                      purple: '0 25px 50px -12px rgba(168, 85, 247, 0.25)',
                          green: '0 25px 50px -12px rgba(255, 107, 0, 0.25)',
                      orange: '0 25px 50px -12px rgba(249, 115, 22, 0.25)'
                    };
                    e.currentTarget.style.boxShadow = shadows[module.color as keyof typeof shadows];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                  }}
                >
                  {/* Decorative corner accent */}
                  <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${module.iconGradient} opacity-10 rounded-bl-full`}></div>
                  
                  <div className="relative">
                    {/* Icon and Title Row */}
                    <div className="flex items-start gap-4 md:gap-6 mb-4 md:mb-6">
                      {/* Icon */}
                      <div className={`relative w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br ${module.iconGradient} rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 flex-shrink-0`}>
                        <module.icon className="text-white" size={28} strokeWidth={2} />
                        {/* Glow effect */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${module.iconGradient} rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500`}></div>
                      </div>

                      {/* Title */}
                      <div className="flex-1 pt-1">
                        <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors">
                          {t(module.titleKey)}
                        </h3>
                      </div>
                    </div>

                    {/* Core Benefit */}
                    <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 mb-5 md:mb-6 leading-relaxed font-medium">
                      {t(module.coreBenefitKey)}
                    </p>

                    {/* Features List */}
                    <div className="space-y-2.5 md:space-y-3">
                      {features.map((feature, idx) => {
                        const bgColors = {
                          blue: 'bg-blue-100 dark:bg-blue-900/30',
                          purple: 'bg-purple-100 dark:bg-purple-900/30',
                          green: 'bg-orange-100 dark:bg-orange-900/30',
                          orange: 'bg-orange-100 dark:bg-orange-900/30'
                        };
                        
                        return (
                          <div key={idx} className="flex items-center gap-3">
                            <div className={`flex-shrink-0 w-5 h-5 rounded-md ${bgColors[module.color as keyof typeof bgColors]} flex items-center justify-center`}>
                              <Check className={`${module.checkColor}`} size={14} strokeWidth={3} />
                            </div>
                            <span className="text-sm md:text-base text-gray-700 dark:text-gray-300">
                              {feature.trim()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
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
      `}</style>
    </section>
  );
}

