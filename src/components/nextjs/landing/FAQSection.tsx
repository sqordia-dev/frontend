'use client';

import { useState, useCallback } from 'react';
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
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

const faqIcons = [Clock, UserCheck, FileOutput, TrendingUp, Share2, HelpCircle, Cpu, Award];

export default function FAQSection() {
  const t = useTranslations('landing.faq');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = useCallback((index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  }, []);

  // Get FAQ items from translations (8 items)
  const faqItems = [0, 1, 2, 3, 4, 5, 6, 7].map((index) => ({
    question: t(`items.${index}.question`),
    answer: t(`items.${index}.answer`),
    icon: faqIcons[index] || HelpCircle,
  }));

  return (
    <section
      id="faq"
      className="py-20 lg:py-32 bg-gray-50 dark:bg-slate-900"
      aria-labelledby="faq-heading"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-20">
          <p className="text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-4 font-semibold">
            {t('badge')}
          </p>
          <h2
            id="faq-heading"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading mb-6 text-[#1A2B47] dark:text-white"
          >
            {t('title')}{' '}
            <span className="text-[#FF6B00]">{t('titleHighlight')}</span>
          </h2>
          <p className="text-lg text-gray-500 dark:text-gray-400">
            {t('subtitle')}
          </p>
        </div>

        {/* FAQ items */}
        <div className="max-w-3xl mx-auto space-y-3">
          {faqItems.map((item, index) => {
            const isOpen = openIndex === index;
            const IconComponent = item.icon;

            return (
              <div
                key={index}
                className={cn(
                  'rounded-xl border overflow-hidden transition-all duration-200 bg-white dark:bg-gray-800',
                  isOpen
                    ? 'border-[#FF6B00] shadow-sm'
                    : 'border-gray-200 dark:border-gray-700',
                )}
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full text-left px-5 py-4 md:px-7 md:py-5 flex items-center justify-between gap-4 group focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2 rounded-xl"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${index}`}
                  id={`faq-question-${index}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-9 h-9 flex-shrink-0 rounded-lg flex items-center justify-center transition-colors',
                        isOpen
                          ? 'bg-[#FF6B00]/15'
                          : 'bg-gray-100 dark:bg-gray-700',
                      )}
                    >
                      <IconComponent
                        size={18}
                        className={cn('transition-colors', isOpen ? 'text-[#FF6B00]' : 'text-gray-400 dark:text-gray-500')}
                        aria-hidden="true"
                      />
                    </div>
                    <span className="text-base font-semibold font-heading text-[#1A2B47] dark:text-white">
                      {item.question}
                    </span>
                  </div>
                  <div
                    className={cn(
                      'transition-transform duration-200',
                      isOpen && 'rotate-180'
                    )}
                  >
                    <ChevronDown
                      size={20}
                      className={cn('flex-shrink-0 transition-colors', isOpen ? 'text-[#FF6B00]' : 'text-gray-400 dark:text-gray-500')}
                      aria-hidden="true"
                    />
                  </div>
                </button>

                <div
                  id={`faq-answer-${index}`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                  className={cn(
                    'overflow-hidden transition-all duration-200',
                    isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  )}
                >
                  <div className="px-5 pb-5 md:px-7 md:pb-6 pl-[68px] md:pl-[76px] text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                    <p>{item.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
