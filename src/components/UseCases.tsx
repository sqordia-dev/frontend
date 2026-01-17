import { Briefcase, Heart, Rocket, Building2, Sparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function UseCases() {
  const { t, theme } = useTheme();
  
  const useCases = [
    {
      icon: Rocket,
      titleKey: 'usecases.case1.title',
      descKey: 'usecases.case1.desc',
      color: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      image: 'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      icon: Building2,
      titleKey: 'usecases.case2.title',
      descKey: 'usecases.case2.desc',
      color: 'from-orange-500 to-amber-500',
      bgGradient: 'from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      image: 'https://images.pexels.com/photos/2041627/pexels-photo-2041627.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      icon: Heart,
      titleKey: 'usecases.case3.title',
      descKey: 'usecases.case3.desc',
      color: 'from-orange-500 to-rose-500',
      bgGradient: 'from-orange-50 to-rose-50 dark:from-orange-950/20 dark:to-rose-950/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      image: 'https://images.pexels.com/photos/6646918/pexels-photo-6646918.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      icon: Briefcase,
      titleKey: 'usecases.case4.title',
      descKey: 'usecases.case4.desc',
      color: 'from-slate-500 to-gray-600',
      bgGradient: 'from-slate-50 to-gray-50 dark:from-slate-950/20 dark:to-gray-950/20',
      borderColor: 'border-slate-200 dark:border-slate-800',
      image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  ];
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-zoom-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = sectionRef.current?.querySelectorAll('.zoom-in-element');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} id="solutions" className="py-20 md:py-28 lg:py-32 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-transparent to-white/50 dark:from-gray-900/50 dark:via-transparent dark:to-gray-900/50"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-20">
          <div className="zoom-in-element inline-flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            <span className="px-4 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full text-xs md:text-sm font-semibold">
              {t('usecases.badge') || 'Use Cases'}
            </span>
          </div>
          <h2 className="zoom-in-element text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            {t('usecases.title') || 'Perfect for'}{' '}
            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
              {t('usecases.titleHighlight') || 'every journey'}
            </span>
          </h2>
          <p className="zoom-in-element text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('usecases.subtitle') || 'Whether you need a business plan or strategic plan, Sqordia adapts to your specific needs'}
          </p>
        </div>

        {/* Use Cases Grid */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className="zoom-in-element group relative bg-white dark:bg-gray-800 rounded-2xl md:rounded-3xl overflow-hidden border-2 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2"
              style={{
                borderColor: theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)',
                animationDelay: `${index * 150}ms`,
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
              }}
              onMouseEnter={(e) => {
                const shadows = {
                  'from-blue-500 to-cyan-500': '0 25px 50px -12px rgba(59, 130, 246, 0.25)',
                  'from-orange-500 to-amber-500': '0 25px 50px -12px rgba(255, 107, 0, 0.25)',
                  'from-green-500 to-rose-500': '0 25px 50px -12px rgba(249, 115, 22, 0.25)',
                  'from-slate-500 to-gray-600': '0 25px 50px -12px rgba(71, 85, 105, 0.25)'
                };
                e.currentTarget.style.boxShadow = shadows[useCase.color as keyof typeof shadows];
                e.currentTarget.style.borderColor = 'transparent';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)';
              }}
            >
              {/* Image background with overlay */}
              <div className="absolute inset-0 overflow-hidden opacity-0 group-hover:opacity-10 transition-opacity duration-500">
                <img
                  src={useCase.image}
                  alt={t(useCase.titleKey)}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  width={800}
                  height={400}
                />
              </div>

              {/* Decorative corner accent */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${useCase.color} opacity-10 rounded-bl-full`}></div>

              <div className="relative p-6 md:p-8">
                {/* Icon */}
                <div className={`w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br ${useCase.color} rounded-xl md:rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                  <useCase.icon className="text-white" size={28} strokeWidth={2} />
                  {/* Glow effect */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${useCase.color} rounded-xl md:rounded-2xl opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500`}></div>
                </div>

                {/* Content */}
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors">
                  {t(useCase.titleKey)}
                </h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  {t(useCase.descKey)}
                </p>
                <div className={`h-1 w-16 bg-gradient-to-r ${useCase.color} rounded-full group-hover:w-full transition-all duration-500`}></div>
              </div>

              {/* Shine effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes zoom-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-zoom-in {
          animation: zoom-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .zoom-in-element {
          opacity: 0;
        }
      `}</style>
    </section>
  );
}
