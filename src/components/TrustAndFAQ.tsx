import { Lock, Lightbulb, Edit, ChevronDown, Sparkles } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../contexts/ThemeContext';

export default function TrustAndFAQ() {
  const { t, theme } = useTheme();
  const sectionRef = useRef<HTMLElement>(null);
  const [openFAQ, setOpenFAQ] = useState<number>(0);

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

  const trustFactors = [
    {
      icon: Lock,
      titleKey: 'trust.security.title',
      descriptionKey: 'trust.security.desc',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Lightbulb,
      titleKey: 'trust.transparency.title',
      descriptionKey: 'trust.transparency.desc',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Edit,
      titleKey: 'trust.editable.title',
      descriptionKey: 'trust.editable.desc',
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  const faqs = [
    {
      questionKey: 'faq.q1.question',
      answerKey: 'faq.q1.answer',
    },
    {
      questionKey: 'faq.q2.question',
      answerKey: 'faq.q2.answer',
    },
    {
      questionKey: 'faq.q3.question',
      answerKey: 'faq.q3.answer',
    },
    {
      questionKey: 'faq.q4.question',
      answerKey: 'faq.q4.answer',
    },
    {
      questionKey: 'faq.q5.question',
      answerKey: 'faq.q5.answer',
    },
    {
      questionKey: 'faq.q6.question',
      answerKey: 'faq.q6.answer',
    },
  ];

  return (
    <section ref={sectionRef} className="py-20 md:py-28 lg:py-32 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50/50 via-transparent to-white/50 dark:from-gray-900/50 dark:via-transparent dark:to-gray-900/50"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 max-w-7xl mx-auto">
          {/* Left Column: Trust & Transparency */}
          <div>
            <div className="mb-8">
              <div className="slide-up-element inline-flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs md:text-sm font-semibold">
                  {t('trust.badge')}
                </span>
              </div>
              <h2 className="slide-up-element text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                {t('trust.title')}
              </h2>
              <p className="slide-up-element text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400">
                {t('trust.subtitle')}
              </p>
            </div>

            <div className="space-y-4 md:space-y-6">
              {trustFactors.map((factor, index) => (
                <div
                  key={index}
                  className="slide-up-element bg-white dark:bg-gray-800 rounded-2xl p-6 md:p-8 border-2 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                  style={{
                    borderColor: theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)',
                    animationDelay: `${index * 100}ms`,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                >
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br ${factor.gradient} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <factor.icon className="text-white" size={24} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="text-lg md:text-xl font-bold mb-2 text-gray-900 dark:text-white">
                        {t(factor.titleKey)}
                      </h3>
                      <p className="text-sm md:text-base leading-relaxed text-gray-600 dark:text-gray-400">
                        {t(factor.descriptionKey)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: FAQ */}
          <div>
            <div className="mb-8">
              <div className="slide-up-element inline-flex items-center gap-2 mb-6">
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span className="px-4 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs md:text-sm font-semibold">
                  {t('faq.badge')}
                </span>
              </div>
              <h2 className="slide-up-element text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900 dark:text-white">
                {t('faq.title')}
              </h2>
              <p className="slide-up-element text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400">
                {t('faq.subtitle')}
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="slide-up-element bg-white dark:bg-gray-800 rounded-2xl border-2 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
                  style={{
                    borderColor: theme === 'dark' ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)',
                    animationDelay: `${index * 100}ms`,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                >
                  <button
                    onClick={() => setOpenFAQ(openFAQ === index ? -1 : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <span className="text-base md:text-lg font-semibold pr-4 text-gray-900 dark:text-white">
                      {t(faq.questionKey)}
                    </span>
                    <ChevronDown
                      className={`flex-shrink-0 transition-transform duration-300 text-gray-600 dark:text-gray-400 ${
                        openFAQ === index ? 'rotate-180' : ''
                      }`}
                      size={20}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openFAQ === index ? 'max-h-96' : 'max-h-0'
                    }`}
                  >
                    <div className="px-6 pb-5 leading-relaxed text-sm md:text-base text-gray-600 dark:text-gray-400">
                      {t(faq.answerKey)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
