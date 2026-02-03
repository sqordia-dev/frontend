import { HelpCircle, ChevronDown } from 'lucide-react';
import { useState, useCallback } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '@/lib/utils';
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
  const { t } = useTheme();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  return (
    <section
      id="faq"
      className="py-section-lg bg-gray-50 dark:bg-slate-900"
      aria-labelledby="faq-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <ScrollReveal>
            <p className="text-label-sm uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-4 font-semibold">
              {t('landing.faq.badge')}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2
              id="faq-heading"
              className="text-display-md sm:text-display-lg font-heading mb-6 text-strategy-blue dark:text-white"
            >
              {t('landing.faq.title')}{' '}
              <span className="text-momentum-orange">
                {t('landing.faq.title.highlight')}
              </span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <p className="text-body-lg text-gray-500 dark:text-gray-400">
              {t('landing.faq.subtitle')}
            </p>
          </ScrollReveal>
        </div>

        {/* FAQ items */}
        <StaggerContainer className="max-w-3xl mx-auto space-y-3">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <StaggerItem key={index}>
                <div
                  className={cn(
                    'rounded-xl border overflow-hidden transition-all duration-200 bg-white dark:bg-gray-800',
                    isOpen
                      ? 'border-momentum-orange shadow-sm'
                      : 'border-border',
                  )}
                >
                  <button
                    onClick={() => toggle(index)}
                    className="w-full text-left px-5 py-4 md:px-7 md:py-5 flex items-center justify-between gap-4 group focus:outline-none focus-visible:ring-2 focus-visible:ring-momentum-orange focus-visible:ring-offset-2 rounded-xl"
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${index}`}
                    id={`faq-question-${index}`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          'w-9 h-9 flex-shrink-0 rounded-lg flex items-center justify-center transition-colors',
                          isOpen
                            ? 'bg-momentum-orange/15'
                            : 'bg-gray-100 dark:bg-gray-700',
                        )}
                      >
                        <HelpCircle
                          size={18}
                          className={cn('transition-colors', isOpen ? 'text-momentum-orange' : 'text-gray-400 dark:text-gray-500')}
                          aria-hidden="true"
                        />
                      </div>
                      <span className="text-body-md font-semibold font-heading text-strategy-blue dark:text-white">
                        {t(item.questionKey)}
                      </span>
                    </div>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2, ease: 'easeInOut' }}
                    >
                      <ChevronDown
                        size={20}
                        className={cn('flex-shrink-0 transition-colors', isOpen ? 'text-momentum-orange' : 'text-gray-400 dark:text-gray-500')}
                        aria-hidden="true"
                      />
                    </motion.div>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-answer-${index}`}
                        role="region"
                        aria-labelledby={`faq-question-${index}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 md:px-7 md:pb-6 pl-[68px] md:pl-[76px] text-body-sm leading-relaxed text-gray-600 dark:text-gray-300">
                          <p>{t(item.answerKey)}</p>
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
