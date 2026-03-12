import {
  ChevronDown,
  Clock,
  UserCheck,
  FileOutput,
  TrendingUp,
  Share2,
  HelpCircle,
  Cpu,
  Award,
  type LucideIcon,
} from 'lucide-react';
import { useState, useCallback, useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { usePublishedContent } from '@/hooks/usePublishedContent';
import { cn } from '@/lib/utils';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../animations/ScrollReveal';
import { motion, AnimatePresence } from 'framer-motion';

interface FAQItem {
  questionKey: string;
  answerKey: string;
  icon: LucideIcon;
}

const faqItems: FAQItem[] = [
  { questionKey: 'landing.faq.q1.question', answerKey: 'landing.faq.q1.answer', icon: Clock },
  { questionKey: 'landing.faq.q2.question', answerKey: 'landing.faq.q2.answer', icon: UserCheck },
  { questionKey: 'landing.faq.q3.question', answerKey: 'landing.faq.q3.answer', icon: FileOutput },
  { questionKey: 'landing.faq.q4.question', answerKey: 'landing.faq.q4.answer', icon: TrendingUp },
  { questionKey: 'landing.faq.q5.question', answerKey: 'landing.faq.q5.answer', icon: Share2 },
  { questionKey: 'landing.faq.q6.question', answerKey: 'landing.faq.q6.answer', icon: HelpCircle },
  { questionKey: 'landing.faq.q7.question', answerKey: 'landing.faq.q7.answer', icon: Cpu },
  { questionKey: 'landing.faq.q8.question', answerKey: 'landing.faq.q8.answer', icon: Award },
];

export default function FAQ() {
  const { t } = useTheme();
  const { getBlock, getBlockContent } = usePublishedContent();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  // Try to load FAQ items from CMS JSON block, falling back to hardcoded items
  const cmsFaqItems = useMemo(() => {
    const block = getBlock('landing.faq.items');
    if (block?.content) {
      try {
        const parsed = JSON.parse(block.content) as { question: string; answer: string }[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch { /* fall through to null */ }
    }
    return null;
  }, [getBlock]);

  return (
    <section
      id="faq"
      className="relative py-12 sm:py-16 md:py-24 lg:py-32 bg-gray-50 dark:bg-[#0B0C0A]"
      aria-labelledby="faq-heading"
    >
      {/* Noise texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: "url('/noise.svg')", backgroundRepeat: 'repeat' }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16 lg:mb-20">
          <ScrollReveal>
            <p className="text-label-sm uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-4 font-semibold">
              {getBlockContent('landing.faq.badge', t('landing.faq.badge'))}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2
              id="faq-heading"
              className="text-2xl sm:text-3xl md:text-display-md lg:text-display-lg font-heading mb-4 sm:mb-6 text-strategy-blue dark:text-white"
            >
              {getBlockContent('landing.faq.title', t('landing.faq.title'))}{' '}
              <span className="bg-gradient-to-r from-momentum-orange to-amber-500 bg-clip-text text-transparent">
                {getBlockContent('landing.faq.title_highlight', t('landing.faq.title.highlight'))}
              </span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <p className="text-body-lg text-gray-500 dark:text-gray-400">
              {getBlockContent('landing.faq.subtitle', t('landing.faq.subtitle'))}
            </p>
          </ScrollReveal>
        </div>

        {/* FAQ items */}
        <StaggerContainer className="max-w-3xl mx-auto space-y-3">
          {cmsFaqItems
            ? /* CMS-driven FAQ items */
              cmsFaqItems.map((cmsItem, index) => {
                const isOpen = openIndex === index;
                const IconComponent = faqItems[index]?.icon || HelpCircle;
                return (
                  <StaggerItem key={index}>
                    <div
                      className={cn(
                        'rounded-xl border overflow-hidden transition-all duration-200 backdrop-blur-sm bg-white/80 dark:bg-white/[0.03]',
                        isOpen
                          ? 'border-momentum-orange/50 shadow-[0_2px_12px_rgba(255,107,0,0.08)]'
                          : 'border-gray-200/50 dark:border-white/[0.06]',
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
                            <IconComponent
                              size={18}
                              className={cn('transition-colors', isOpen ? 'text-momentum-orange' : 'text-gray-400 dark:text-gray-500')}
                              aria-hidden="true"
                            />
                          </div>
                          <span className="text-body-md font-semibold font-heading text-strategy-blue dark:text-white">
                            {cmsItem.question}
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
                            <div className="px-5 pb-5 md:px-7 md:pb-6 pl-5 sm:pl-[68px] md:pl-[76px] text-body-sm leading-relaxed text-gray-600 dark:text-gray-300">
                              <p>{cmsItem.answer}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </StaggerItem>
                );
              })
            : /* Hardcoded fallback FAQ items */
              faqItems.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                  <StaggerItem key={index}>
                    <div
                      className={cn(
                        'rounded-xl border overflow-hidden transition-all duration-200 backdrop-blur-sm bg-white/80 dark:bg-white/[0.03]',
                        isOpen
                          ? 'border-momentum-orange/50 shadow-[0_2px_12px_rgba(255,107,0,0.08)]'
                          : 'border-gray-200/50 dark:border-white/[0.06]',
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
                            <item.icon
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
                            <div className="px-5 pb-5 md:px-7 md:pb-6 pl-5 sm:pl-[68px] md:pl-[76px] text-body-sm leading-relaxed text-gray-600 dark:text-gray-300">
                              <p>{t(item.answerKey)}</p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </StaggerItem>
                );
              })
          }
        </StaggerContainer>
      </div>
    </section>
  );
}
