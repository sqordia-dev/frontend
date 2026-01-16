import { Users, Target, Award, Heart, Sparkles } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function About() {
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
      color: 'from-red-500 to-pink-500',
    },
    {
      icon: Target,
      title: t('about.values.excellence.title'),
      description: t('about.values.excellence.desc'),
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Users,
      title: t('about.values.collaboration.title'),
      description: t('about.values.collaboration.desc'),
      color: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <section ref={sectionRef} id="about" className="py-20 md:py-28 lg:py-32 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-transparent to-white/50 dark:from-gray-900/50 dark:via-transparent dark:to-gray-900/50"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-4xl mx-auto mb-16 md:mb-20">
          <div className="slide-up-element inline-flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span className="px-4 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs md:text-sm font-semibold">
              {t('about.badge')}
            </span>
          </div>
          <h2 className="slide-up-element text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
            {t('about.title')}
          </h2>
          <p className="slide-up-element text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('about.subtitle')}
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16 md:mb-20">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="slide-up-element bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 border-2 shadow-lg text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              style={{
                borderColor: theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)',
                animationDelay: `${index * 100}ms`,
              }}
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl mb-4">
                <stat.icon className="text-green-600 dark:text-green-400" size={32} />
              </div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                {stat.value}
              </div>
              <div className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Mission */}
        <div className="slide-up-element max-w-4xl mx-auto mb-16 md:mb-20">
          <div className="bg-gradient-to-br from-green-50 to-amber-50 dark:from-green-950/20 dark:to-amber-950/20 rounded-3xl p-8 md:p-12 border-2 border-green-200 dark:border-green-800">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {t('about.mission.title')}
            </h3>
            <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              {t('about.mission.description')}
            </p>
          </div>
        </div>

        {/* Values */}
        <div className="mb-12">
          <h3 className="text-2xl md:text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            {t('about.values.title')}
          </h3>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="slide-up-element bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 border-2 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                style={{
                  borderColor: theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)',
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${value.color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                  <value.icon className="text-white" size={32} />
                </div>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {value.title}
                </h4>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
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

