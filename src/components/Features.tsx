import { Brain, BarChart3, Users, FileText, Download, MessageSquare, Sparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function Features() {
  const { t, theme } = useTheme();
  
  const features = [
    {
      icon: Brain,
      titleKey: 'features.feature1.title',
      descKey: 'features.feature1.desc',
      gradient: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    {
      icon: BarChart3,
      titleKey: 'features.feature2.title',
      descKey: 'features.feature2.desc',
      gradient: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
    },
    {
      icon: MessageSquare,
      titleKey: 'features.feature3.title',
      descKey: 'features.feature3.desc',
      gradient: 'from-orange-500 to-amber-500',
      bgColor: 'bg-orange-50 dark:bg-orange-950/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
    },
    {
      icon: Download,
      titleKey: 'features.feature4.title',
      descKey: 'features.feature4.desc',
      gradient: 'from-violet-500 to-purple-500',
      bgColor: 'bg-violet-50 dark:bg-violet-950/20',
      borderColor: 'border-violet-200 dark:border-violet-800',
    },
    {
      icon: Users,
      titleKey: 'features.feature5.title',
      descKey: 'features.feature5.desc',
      gradient: 'from-pink-500 to-rose-500',
      bgColor: 'bg-pink-50 dark:bg-pink-950/20',
      borderColor: 'border-pink-200 dark:border-pink-800',
    },
    {
      icon: FileText,
      titleKey: 'features.feature6.title',
      descKey: 'features.feature6.desc',
      gradient: 'from-slate-500 to-gray-600',
      bgColor: 'bg-slate-50 dark:bg-slate-950/20',
      borderColor: 'border-slate-200 dark:border-slate-800',
    }
  ];
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

  return (
    <section ref={sectionRef} id="features" className="py-20 md:py-28 lg:py-32 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-gray-50/50 dark:from-gray-900/50 dark:via-transparent dark:to-gray-900/50"></div>
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{
        backgroundImage: `linear-gradient(rgba(26, 43, 71, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(26, 43, 71, 0.1) 1px, transparent 1px)`,
        backgroundSize: '40px 40px',
      }}></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-20">
          <div className="slide-up-element inline-flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs md:text-sm font-semibold">
              {t('features.badge') || 'Features'}
            </span>
          </div>
          <h2 className="slide-up-element text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            {t('features.title')}{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
              {t('features.title.highlight')}
            </span>
          </h2>
          <p className="slide-up-element text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('features.subtitle')}
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <div
              key={index}
              className="slide-up-element group relative bg-white dark:bg-gray-800 rounded-xl md:rounded-2xl lg:rounded-3xl p-5 sm:p-6 md:p-8 border-2 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
              style={{
                borderColor: theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)',
                animationDelay: `${index * 100}ms`,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
              onMouseEnter={(e) => {
                const shadows = {
                  'from-blue-500 to-cyan-500': '0 25px 50px -12px rgba(59, 130, 246, 0.25)',
                  'from-orange-500 to-amber-500': '0 25px 50px -12px rgba(255, 107, 0, 0.25)',
                  'from-violet-500 to-purple-500': '0 25px 50px -12px rgba(139, 92, 246, 0.25)',
                  'from-pink-500 to-rose-500': '0 25px 50px -12px rgba(244, 63, 94, 0.25)',
                  'from-slate-500 to-gray-600': '0 25px 50px -12px rgba(71, 85, 105, 0.25)'
                };
                e.currentTarget.style.boxShadow = shadows[feature.gradient as keyof typeof shadows];
                e.currentTarget.style.borderColor = 'transparent';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)';
              }}
            >
              {/* Decorative corner accent */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${feature.gradient} opacity-10 rounded-bl-full`}></div>
              
              {/* Icon */}
              <div className={`relative w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br ${feature.gradient} rounded-xl md:rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                <feature.icon className="text-white" size={28} strokeWidth={2} />
                {/* Glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500`}></div>
              </div>

              {/* Content */}
              <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors">
                {t(feature.titleKey)}
              </h3>
              <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                {t(feature.descKey)}
              </p>
            </div>
          ))}
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
