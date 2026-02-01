import { HelpCircle, ChevronDown, Sparkles } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../animations/ScrollReveal';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  questionKey: string;
  answerKey: string;
}

const faqItems: FAQItem[] = Array.from({ length: 8 }, (_, i) => ({
  questionKey: `landing.faq.q${i + 1}.question`,
  answerKey: `landing.faq.q${i + 1}.answer`,
}));

export default function FAQ() {
  const { theme, t } = useTheme();
  const isDark = theme === 'dark';
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <section
      id="faq"
      className="py-20 md:py-28 lg:py-32 relative overflow-hidden"
      style={{ backgroundColor: isDark ? '#0F172A' : '#F9FAFB' }}
      aria-labelledby="faq-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <ScrollReveal>
            <div className="inline-flex items-center gap-2 mb-6">
              <Sparkles className="w-5 h-5 text-amber-500" aria-hidden="true" />
              <span
                className="px-4 py-1.5 rounded-full text-xs md:text-sm font-semibold"
                style={{
                  backgroundColor: isDark ? 'rgba(245, 158, 11, 0.2)' : 'rgba(245, 158, 11, 0.1)',
                  color: isDark ? '#FCD34D' : '#D97706',
                }}
              >
                {t('landing.faq.badge')}
              </span>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2
              id="faq-heading"
              className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading mb-6"
              style={{ color: isDark ? '#FFFFFF' : '#1A2B47' }}
            >
              {t('landing.faq.title')}{' '}
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                {t('landing.faq.title.highlight')}
              </span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <p
              className="text-lg md:text-xl"
              style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
            >
              {t('landing.faq.subtitle')}
            </p>
          </ScrollReveal>
        </div>

        {/* FAQ Items */}
        <StaggerContainer className="max-w-3xl mx-auto space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <StaggerItem key={index}>
                <div
                  className="rounded-2xl border-2 overflow-hidden transition-all duration-300"
                  style={{
                    backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                    borderColor: isOpen
                      ? '#FF6B00'
                      : isDark
                        ? 'rgba(75, 85, 99, 0.3)'
                        : 'rgba(229, 231, 235, 0.8)',
                    boxShadow: isOpen ? '0 10px 30px rgba(255, 107, 0, 0.1)' : 'none',
                  }}
                >
                  <button
                    onClick={() => toggle(index)}
                    className="w-full text-left px-6 py-5 md:px-8 md:py-6 flex items-center justify-between gap-4 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2 rounded-2xl"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    id={`faq-question-${index}`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-10 h-10 flex-shrink-0 rounded-lg flex items-center justify-center transition-colors"
                        style={{
                          backgroundColor: isOpen
                            ? 'rgba(255, 107, 0, 0.2)'
                            : isDark
                              ? 'rgba(75, 85, 99, 0.3)'
                              : 'rgba(229, 231, 235, 0.8)',
                        }}
                      >
                        <HelpCircle
                          size={20}
                          className="transition-colors"
                          style={{ color: isOpen ? '#FF6B00' : isDark ? '#9CA3AF' : '#6B7280' }}
                          aria-hidden="true"
                        />
                      </div>
                      <span
                        className="text-base md:text-lg font-semibold font-heading"
                        style={{ color: isDark ? '#FFFFFF' : '#1A2B47' }}
                      >
                        {t(item.questionKey)}
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <ChevronDown
                        size={24}
                        className="flex-shrink-0 transition-colors"
                        style={{ color: isOpen ? '#FF6B00' : isDark ? '#9CA3AF' : '#6B7280' }}
                        aria-hidden="true"
                      />
                    </motion.div>
                  </button>

                  {/* Answer */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-answer-${index}`}
                        role="region"
                        aria-labelledby={`faq-question-${index}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <div
                          className="px-6 pb-6 md:px-8 md:pb-8 pl-20 md:pl-[88px]"
                          style={{ color: isDark ? '#D1D5DB' : '#374151' }}
                        >
                          <p className="leading-relaxed text-sm md:text-base">
                            {t(item.answerKey)}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
