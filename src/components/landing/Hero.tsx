import { ArrowRight, Shield, Clock, XCircle } from 'lucide-react';
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

          {/* Right column - Dashboard demo video (light/dark) */}
          <motion.div
            className="relative lg:pl-4"
            variants={mockupVariants}
            initial="hidden"
            animate="visible"
          >
            <div className={cn(
              'rounded-2xl border overflow-hidden shadow-elevated',
              isDark ? 'border-gray-700' : 'border-gray-200/80',
            )}>
              <video
                key={isDark ? 'dark' : 'light'}
                autoPlay
                loop
                muted
                playsInline
                poster="/images/screenshots/dashboard.png"
                className="w-full h-auto block"
                width={1440}
                height={900}
                aria-label={t('landing.hero.productDemo') || 'Sqordia dashboard demo'}
              >
                <source
                  src={isDark
                    ? '/images/screenshots/hero-dashboard-dark.webm'
                    : '/images/screenshots/hero-dashboard-light.webm'
                  }
                  type="video/webm"
                />
                <img
                  src="/images/screenshots/dashboard.png"
                  alt="Sqordia dashboard"
                  className="w-full h-auto block"
                  width={1440}
                  height={900}
                />
              </video>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
