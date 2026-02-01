import { ChevronDown, Sparkles, HelpCircle } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

const FAQ_COUNT = 8;

export default function FAQ() {
  const { theme, t } = useTheme();
  const sectionRef = useRef<HTMLElement>(null);
  const [openIndex, setOpenIndex] = useState<number>(0);

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

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="py-20 md:py-28 lg:py-32 relative overflow-hidden"
      style={{ backgroundColor: isDark ? '#0F172A' : '#F9FAFB' }}
      aria-labelledby="faq-heading"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full filter blur-[120px] opacity-30"
          style={{ backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full filter blur-[120px] opacity-30"
          style={{ backgroundColor: isDark ? 'rgba(139, 92, 246, 0.1)' : 'rgba(139, 92, 246, 0.05)' }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12 md:mb-16">
            <div className="slide-up-element inline-flex items-center gap-2 mb-6">
              <HelpCircle className="w-5 h-5 text-purple-500" aria-hidden="true" />
              <span
                className="px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold"
                style={{
                  backgroundColor: isDark ? 'rgba(139, 92, 246, 0.2)' : 'rgba(139, 92, 246, 0.1)',
                  color: isDark ? '#C4B5FD' : '#7C3AED',
                }}
              >
                {t('landing.faq.badge')}
              </span>
            </div>
            <h2
              id="faq-heading"
              className="slide-up-element text-3xl sm:text-4xl md:text-5xl font-bold mb-6"
              style={{ color: isDark ? '#FFFFFF' : '#1A2B47' }}
            >
              {t('landing.faq.title')}{' '}
              <span className="bg-gradient-to-r from-[#FF6B00] to-[#E55F00] bg-clip-text text-transparent">
                {t('landing.faq.title.highlight')}
              </span>
            </h2>
            <p
              className="slide-up-element text-lg md:text-xl"
              style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
            >
              {t('landing.faq.subtitle')}
            </p>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {Array.from({ length: FAQ_COUNT }, (_, index) => (
              <div
                key={index}
                className="slide-up-element rounded-2xl border-2 overflow-hidden transition-all duration-300"
                style={{
                  backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                  borderColor: openIndex === index
                    ? (isDark ? 'rgba(99, 102, 241, 0.5)' : 'rgba(99, 102, 241, 0.3)')
                    : (isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)'),
                  animationDelay: `${index * 50}ms`,
                  boxShadow: openIndex === index
                    ? '0 10px 40px -10px rgba(99, 102, 241, 0.2)'
                    : '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 md:py-6 flex items-center justify-between text-left transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:ring-inset"
                  aria-expanded={openIndex === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span
                    className="text-base md:text-lg font-semibold pr-4"
                    style={{ color: isDark ? '#FFFFFF' : '#1A2B47' }}
                  >
                    {t(`landing.faq.q${index + 1}.question`)}
                  </span>
                  <ChevronDown
                    className={`flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                    size={20}
                    style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
                    aria-hidden="true"
                  />
                </button>
                <div
                  id={`faq-answer-${index}`}
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                >
                  <div
                    className="px-6 pb-6 leading-relaxed text-sm md:text-base"
                    style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
                  >
                    {t(`landing.faq.q${index + 1}.answer`)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div
            className="slide-up-element mt-12 text-center p-6 md:p-8 rounded-2xl border"
            style={{
              backgroundColor: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
              borderColor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)',
            }}
          >
            <Sparkles className="w-8 h-8 mx-auto mb-4 text-indigo-500" aria-hidden="true" />
            <p
              className="text-lg md:text-xl font-semibold mb-2"
              style={{ color: isDark ? '#FFFFFF' : '#1A2B47' }}
            >
              {t('landing.faq.contact.title')}
            </p>
            <p
              className="mb-4"
              style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
            >
              {t('landing.faq.contact.subtitle')}
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF6B00] text-white font-semibold rounded-xl transition-all duration-300 hover:bg-[#E55F00] focus:outline-none focus:ring-4 focus:ring-[#FF6B00]/50 focus:ring-offset-2"
            >
              {t('landing.faq.contact.cta')}
            </a>
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
