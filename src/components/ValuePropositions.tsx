import { Rocket, Heart, Users, Check, ArrowRight, Sparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function ValuePropositions() {
  const { t, theme } = useTheme();
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

  const personas = [
    {
      icon: Rocket,
      titleKey: 'valuePropositions.entrepreneurs.title',
      focusKey: 'valuePropositions.entrepreneurs.focus',
      benefits: [
        'valuePropositions.entrepreneurs.benefit1',
        'valuePropositions.entrepreneurs.benefit2',
        'valuePropositions.entrepreneurs.benefit3',
        'valuePropositions.entrepreneurs.benefit4',
      ],
      gradient: 'from-orange-500 to-amber-500',
      bgGradient: 'from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
    },
    {
      icon: Heart,
      titleKey: 'valuePropositions.nonprofits.title',
      focusKey: 'valuePropositions.nonprofits.focus',
      benefits: [
        'valuePropositions.nonprofits.benefit1',
        'valuePropositions.nonprofits.benefit2',
        'valuePropositions.nonprofits.benefit3',
        'valuePropositions.nonprofits.benefit4',
      ],
      gradient: 'from-pink-500 to-rose-500',
      bgGradient: 'from-pink-50 to-rose-50 dark:from-pink-950/20 dark:to-rose-950/20',
      borderColor: 'border-pink-200 dark:border-pink-800',
    },
    {
      icon: Users,
      titleKey: 'valuePropositions.consultants.title',
      focusKey: 'valuePropositions.consultants.focus',
      benefits: [
        'valuePropositions.consultants.benefit1',
        'valuePropositions.consultants.benefit2',
        'valuePropositions.consultants.benefit3',
        'valuePropositions.consultants.benefit4',
      ],
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
  ];

  return (
    <section ref={sectionRef} className="py-20 md:py-28 lg:py-32 bg-gray-50 dark:bg-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/50 via-transparent to-gray-50/50 dark:from-gray-900/50 dark:via-transparent dark:to-gray-900/50"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-20">
          <div className="slide-up-element inline-flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <span className="px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs md:text-sm font-semibold">
              {t('valuePropositions.badge')}
            </span>
          </div>
          <h2 className="slide-up-element text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            {t('valuePropositions.title')}
          </h2>
          <p className="slide-up-element text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('valuePropositions.subtitle')}
          </p>
        </div>

        {/* Personas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
          {personas.map((persona, index) => (
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
                  'from-orange-500 to-amber-500': '0 25px 50px -12px rgba(255, 107, 0, 0.25)',
                  'from-pink-500 to-rose-500': '0 25px 50px -12px rgba(244, 63, 94, 0.25)',
                  'from-blue-500 to-cyan-500': '0 25px 50px -12px rgba(59, 130, 246, 0.25)'
                };
                e.currentTarget.style.boxShadow = shadows[persona.gradient as keyof typeof shadows];
                e.currentTarget.style.borderColor = 'transparent';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                e.currentTarget.style.borderColor = theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)';
              }}
            >
              {/* Decorative corner accent */}
              <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${persona.gradient} opacity-10 rounded-bl-full`}></div>

              {/* Large icon at top */}
              <div className={`relative w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br ${persona.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-xl mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                <persona.icon className="text-white" size={36} strokeWidth={2} />
                {/* Glow effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${persona.gradient} rounded-2xl opacity-0 group-hover:opacity-50 blur-xl transition-opacity duration-500`}></div>
              </div>

              {/* Title */}
              <h3 className="text-xl md:text-2xl font-bold mb-2 text-center text-gray-900 dark:text-white">
                {t(persona.titleKey)}
              </h3>

              {/* Focus area */}
              <p className="font-semibold text-center mb-6 text-orange-600 dark:text-orange-400">
                {t(persona.focusKey)}
              </p>

              {/* Benefits list */}
              <ul className="space-y-3 mb-6">
                {persona.benefits.map((benefitKey, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm md:text-base">
                    <Check className="flex-shrink-0 mt-0.5 text-orange-600 dark:text-orange-400" size={18} />
                    <span className="text-gray-700 dark:text-gray-300">{t(benefitKey)}</span>
                  </li>
                ))}
              </ul>

              {/* Learn More button */}
              <button 
                className="w-full px-6 py-4 md:py-3 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 group-hover:shadow-lg hover:bg-orange-600 hover:text-white dark:hover:bg-orange-600 min-h-[44px] text-base md:text-sm"
              >
                {t('valuePropositions.learnMore')}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
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
