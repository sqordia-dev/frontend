import { useState } from 'react';
import { CheckCircle, Briefcase, Users, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { usePublishedContent } from '@/hooks/usePublishedContent';
import { cn } from '@/lib/utils';
import { ScrollReveal } from '../animations/ScrollReveal';

type PersonaKey = 'entrepreneur' | 'consultant' | 'obnl';

interface Persona {
  key: PersonaKey;
  icon: React.ElementType;
  titleKey: string;
  taglineKey: string;
  benefitKeys: string[];
  screenshot: string;
  screenshotDark: string;
  ctaKey: string;
  ctaLink: string;
}

const personas: Persona[] = [
  {
    key: 'entrepreneur',
    icon: Briefcase,
    titleKey: 'landing.personas.entrepreneur.title',
    taglineKey: 'landing.personas.entrepreneur.tagline',
    benefitKeys: [
      'landing.personas.entrepreneur.benefit1',
      'landing.personas.entrepreneur.benefit2',
      'landing.personas.entrepreneur.benefit3',
      'landing.personas.entrepreneur.benefit4',
    ],
    screenshot: '/images/screenshots/questionnaire.png',
    screenshotDark: '/images/screenshots/questionnaire-dark.png',
    ctaKey: 'landing.personas.entrepreneur.cta',
    ctaLink: '/signup?persona=entrepreneur',
  },
  {
    key: 'consultant',
    icon: Users,
    titleKey: 'landing.personas.consultant.title',
    taglineKey: 'landing.personas.consultant.tagline',
    benefitKeys: [
      'landing.personas.consultant.benefit1',
      'landing.personas.consultant.benefit2',
      'landing.personas.consultant.benefit3',
      'landing.personas.consultant.benefit4',
    ],
    screenshot: '/images/screenshots/interview-section.png',
    screenshotDark: '/images/screenshots/interview-section-dark.png',
    ctaKey: 'landing.personas.consultant.cta',
    ctaLink: '/signup?persona=consultant',
  },
  {
    key: 'obnl',
    icon: Heart,
    titleKey: 'landing.personas.obnl.title',
    taglineKey: 'landing.personas.obnl.tagline',
    benefitKeys: [
      'landing.personas.obnl.benefit1',
      'landing.personas.obnl.benefit2',
      'landing.personas.obnl.benefit3',
      'landing.personas.obnl.benefit4',
    ],
    screenshot: '/images/screenshots/preview.png',
    screenshotDark: '/images/screenshots/preview-dark.png',
    ctaKey: 'landing.personas.obnl.cta',
    ctaLink: '/signup?persona=obnl',
  },
];

export default function Personas() {
  const { theme, t } = useTheme();
  const { getBlockContent } = usePublishedContent();
  const [activeTab, setActiveTab] = useState<PersonaKey>('entrepreneur');
  const isDark = theme === 'dark';

  const activePersona = personas.find((p) => p.key === activeTab)!;

  return (
    <section
      id="personas"
      className={cn(
        'relative py-12 sm:py-16 md:py-24 lg:py-32',
        isDark ? 'bg-[#0B0C0A]' : 'bg-white',
      )}
      aria-labelledby="personas-heading"
    >
      {/* Noise texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: "url('/noise.svg')", backgroundRepeat: 'repeat' }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16">
          <ScrollReveal>
            <p className="text-label-sm uppercase tracking-widest text-momentum-orange mb-3 sm:mb-4">
              {getBlockContent('landing.personas.badge', t('landing.personas.badge'))}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2
              id="personas-heading"
              className={cn(
                'text-2xl sm:text-3xl md:text-display-md lg:text-display-lg font-heading mb-4 sm:mb-6',
                isDark ? 'text-white' : 'text-strategy-blue',
              )}
            >
              {getBlockContent('landing.personas.title', t('landing.personas.title'))}{' '}
              <span className="bg-gradient-to-r from-momentum-orange to-amber-500 bg-clip-text text-transparent">
                {getBlockContent('landing.personas.title.highlight', t('landing.personas.title.highlight'))}
              </span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <p className={cn('text-body-lg', isDark ? 'text-gray-400' : 'text-gray-500')}>
              {getBlockContent('landing.personas.subtitle', t('landing.personas.subtitle'))}
            </p>
          </ScrollReveal>
        </div>

        {/* Tabs */}
        <ScrollReveal delay={0.2}>
          <div className="flex justify-center mb-8 sm:mb-12">
            <div
              className={cn(
                'inline-flex rounded-2xl p-1.5 border backdrop-blur-sm',
                isDark
                  ? 'bg-white/[0.04] border-white/[0.08]'
                  : 'bg-gray-100/80 border-gray-200/50',
              )}
              role="tablist"
              aria-label={t('landing.personas.tabsLabel')}
            >
              {personas.map((persona) => {
                const Icon = persona.icon;
                const isActive = activeTab === persona.key;
                return (
                  <button
                    key={persona.key}
                    id={`persona-tab-${persona.key}`}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`persona-panel-${persona.key}`}
                    onClick={() => setActiveTab(persona.key)}
                    className={cn(
                      'flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-momentum-orange/50',
                      isActive
                        ? 'bg-momentum-orange text-white shadow-[0_2px_8px_rgba(255,107,0,0.3)]'
                        : isDark
                          ? 'text-gray-400 hover:text-white hover:bg-white/[0.06]'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/80',
                    )}
                  >
                    <Icon size={18} />
                    <span className="hidden sm:inline">
                      {getBlockContent(`landing.personas.${persona.key}.tab`, t(`landing.personas.${persona.key}.tab`))}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </ScrollReveal>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            id={`persona-panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`persona-tab-${activeTab}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center max-w-6xl mx-auto"
          >
            {/* Content */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                {(() => {
                  const Icon = activePersona.icon;
                  return (
                    <div className="w-12 h-12 rounded-xl bg-momentum-orange/10 flex items-center justify-center">
                      <Icon size={24} className="text-momentum-orange" />
                    </div>
                  );
                })()}
                <div>
                  <h3
                    className={cn(
                      'text-xl sm:text-2xl font-bold font-heading',
                      isDark ? 'text-white' : 'text-strategy-blue',
                    )}
                  >
                    {getBlockContent(`landing.personas.${activeTab}.title`, t(activePersona.titleKey))}
                  </h3>
                  <p className={cn('text-sm', isDark ? 'text-gray-400' : 'text-gray-500')}>
                    {getBlockContent(`landing.personas.${activeTab}.tagline`, t(activePersona.taglineKey))}
                  </p>
                </div>
              </div>

              <ul className="space-y-4 mt-8 mb-8">
                {activePersona.benefitKeys.map((key, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle
                      size={20}
                      className="flex-shrink-0 mt-0.5 text-green-500"
                      aria-hidden="true"
                    />
                    <span className={cn('text-body-md', isDark ? 'text-gray-300' : 'text-gray-700')}>
                      {getBlockContent(`landing.personas.${activeTab}.benefit${i + 1}`, t(key))}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                to={activePersona.ctaLink}
                className="group inline-flex items-center gap-2 px-6 py-3 bg-momentum-orange hover:bg-[#E55F00] text-white font-semibold rounded-xl transition-all duration-200 shadow-[0_2px_8px_rgba(255,107,0,0.3)] hover:shadow-[0_4px_16px_rgba(255,107,0,0.4)] hover:-translate-y-px focus:outline-none focus:ring-4 focus:ring-momentum-orange/30"
              >
                {getBlockContent(`landing.personas.${activeTab}.cta`, t(activePersona.ctaKey))}
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {/* Screenshot */}
            <div
              className={cn(
                'rounded-2xl overflow-hidden border transition-all duration-300',
                isDark
                  ? 'border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
                  : 'border-gray-200/60 shadow-[0_8px_32px_rgba(0,0,0,0.08)]',
              )}
            >
              <img
                src={isDark ? activePersona.screenshotDark : activePersona.screenshot}
                alt={t(`landing.personas.${activeTab}.screenshotAlt`)}
                className="w-full h-auto block"
                loading="lazy"
                width={1440}
                height={900}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
