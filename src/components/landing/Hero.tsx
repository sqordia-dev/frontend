import { ArrowRight, Shield, Clock, XCircle, FileText, BarChart3, Brain, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const smoothEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: smoothEase } },
};

const mockupVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.25, ease: smoothEase } },
};

// ── Product mockup built with CSS (replaces empty placeholder) ──────────────
function ProductMockup({ isDark }: { isDark: boolean }) {
  return (
    <div className={cn(
      'rounded-xl border overflow-hidden shadow-card',
      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    )}>
      {/* Fake browser chrome */}
      <div className={cn(
        'flex items-center gap-2 px-4 py-2.5 border-b',
        isDark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200',
      )}>
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        </div>
        <div className={cn(
          'flex-1 h-5 rounded-md mx-8',
          isDark ? 'bg-gray-700' : 'bg-gray-200',
        )} />
      </div>

      {/* App content mockup */}
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-strategy-blue flex items-center justify-center">
              <Brain size={14} className="text-white" />
            </div>
            <div className={cn('h-3 w-20 rounded', isDark ? 'bg-gray-600' : 'bg-gray-300')} />
          </div>
          <div className="flex gap-2">
            <div className={cn('h-7 w-16 rounded-md', isDark ? 'bg-gray-700' : 'bg-gray-100')} />
            <div className="h-7 w-24 rounded-md bg-momentum-orange/90" />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { icon: FileText, label: '12', sublabel: 'Plans' },
            { icon: BarChart3, label: '87%', sublabel: 'Score' },
            { icon: Sparkles, label: '24', sublabel: 'Sections' },
          ].map(({ icon: Icon, label, sublabel }) => (
            <div key={sublabel} className={cn(
              'rounded-lg p-3 border',
              isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-100',
            )}>
              <Icon size={14} className="text-momentum-orange mb-1.5" />
              <div className={cn('text-base font-bold', isDark ? 'text-white' : 'text-strategy-blue')}>{label}</div>
              <div className={cn('text-[10px]', isDark ? 'text-gray-400' : 'text-gray-500')}>{sublabel}</div>
            </div>
          ))}
        </div>

        {/* Content rows */}
        <div className="space-y-2.5">
          {[85, 60, 72].map((w, i) => (
            <div key={i} className={cn(
              'flex items-center gap-3 p-3 rounded-lg border',
              isDark ? 'bg-gray-700/30 border-gray-600/50' : 'bg-white border-gray-100',
            )}>
              <div className={cn(
                'w-8 h-8 rounded-md shrink-0',
                i === 0 ? 'bg-momentum-orange/15' : isDark ? 'bg-gray-600' : 'bg-gray-100',
              )} />
              <div className="flex-1 space-y-1.5">
                <div className={cn('h-2.5 rounded', isDark ? 'bg-gray-600' : 'bg-gray-200')} style={{ width: `${w}%` }} />
                <div className={cn('h-2 rounded', isDark ? 'bg-gray-700' : 'bg-gray-100')} style={{ width: `${w - 20}%` }} />
              </div>
              {i === 0 && (
                <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  Active
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
export default function Hero() {
  const { theme, t } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section
      className={cn(
        'relative pt-28 pb-16 md:pt-36 md:pb-24 lg:pt-44 lg:pb-32 overflow-hidden min-h-[90vh] flex items-center',
        isDark
          ? 'bg-gradient-to-b from-strategy-blue to-[#0F172A]'
          : 'bg-gradient-to-b from-light-ai-grey to-white',
      )}
      aria-labelledby="hero-heading"
    >
      {/* Subtle dot pattern instead of blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className={cn('absolute inset-0', isDark ? 'opacity-[0.04]' : 'opacity-[0.5]')}
          style={{
            backgroundImage: isDark
              ? 'radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)'
              : 'radial-gradient(circle, rgba(26,43,71,0.06) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left column */}
          <motion.div
            className="text-center lg:text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Social proof badge */}
            <motion.div variants={itemVariants}>
              <div className={cn(
                'inline-flex items-center gap-2.5 px-4 py-2 mb-7 rounded-full text-body-sm font-medium border',
                isDark
                  ? 'bg-white/5 border-white/10 text-gray-300'
                  : 'bg-white border-gray-200 text-gray-600 shadow-sm',
              )}>
                <span className="flex items-center gap-1.5 text-green-500 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  {t('landing.hero.badge.trusted')}
                </span>
                <span className="w-px h-3.5 bg-gray-300 dark:bg-gray-600" />
                <span>{t('landing.hero.badge.rating')}</span>
              </div>
            </motion.div>

            {/* Headline */}
            <motion.h1
              id="hero-heading"
              variants={itemVariants}
              className={cn(
                'text-display-lg sm:text-display-xl lg:text-display-2xl mb-6 font-heading',
                isDark ? 'text-white' : 'text-strategy-blue',
              )}
            >
              <span className="block">{t('landing.hero.headline.line1')}</span>
              <span className="block text-momentum-orange">{t('landing.hero.headline.highlight')}</span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              className={cn(
                'text-body-lg md:text-xl mb-8 max-w-xl mx-auto lg:mx-0',
                isDark ? 'text-gray-300' : 'text-gray-500',
              )}
            >
              {t('landing.hero.subheadline')}
            </motion.p>

            {/* CTA */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-10">
              <Link
                to="/signup"
                className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-momentum-orange hover:bg-[#E55F00] text-white text-base font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-4 focus:ring-momentum-orange/30"
              >
                {t('landing.hero.cta.primary')}
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/example-plans"
                className={cn(
                  'inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-semibold rounded-lg border transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-gray-400/30',
                  isDark
                    ? 'bg-white/5 border-white/15 text-white hover:bg-white/10'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm',
                )}
              >
                {t('landing.hero.cta.secondary')}
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              variants={itemVariants}
              className={cn('flex flex-wrap items-center justify-center lg:justify-start gap-5 text-body-sm', isDark ? 'text-gray-400' : 'text-gray-500')}
            >
              <div className="flex items-center gap-1.5">
                <Shield size={16} className="text-green-500" />
                <span>{t('landing.hero.trust.noCard')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={16} className="text-momentum-orange" />
                <span>{t('landing.hero.trust.trial')}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <XCircle size={16} className="text-gray-400" />
                <span>{t('landing.hero.trust.cancel')}</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right column - Product mockup */}
          <motion.div
            className="relative lg:pl-4"
            variants={mockupVariants}
            initial="hidden"
            animate="visible"
          >
            <ProductMockup isDark={isDark} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
