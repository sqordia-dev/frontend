import { ArrowRight, Shield, Clock, CheckCircle, Star, X as XIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { motion } from 'framer-motion';

// Orchestrated hero entrance: staggered children with smooth easing
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const smoothEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: smoothEase },
  },
};

const imageVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.7, delay: 0.3, ease: smoothEase },
  },
};

export default function Hero() {
  const { theme, t } = useTheme();
  const isDark = theme === 'dark';

  return (
    <section
      className="relative pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32 overflow-hidden min-h-[90vh] flex items-center"
      style={{
        background: isDark
          ? 'linear-gradient(180deg, #1A2B47 0%, #0F172A 100%)'
          : 'linear-gradient(180deg, #EEF2FF 0%, #FFFFFF 100%)',
      }}
      aria-labelledby="hero-heading"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute top-20 right-10 w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full filter blur-[80px] md:blur-[120px] animate-blob"
          style={{ backgroundColor: isDark ? 'rgba(255, 107, 0, 0.12)' : 'rgba(255, 107, 0, 0.08)' }}
        />
        <div
          className="absolute top-40 left-10 w-[250px] h-[250px] md:w-[400px] md:h-[400px] rounded-full filter blur-[60px] md:blur-[100px] animate-blob"
          style={{ backgroundColor: isDark ? 'rgba(255, 107, 0, 0.08)' : 'rgba(255, 107, 0, 0.06)', animationDelay: '2s' }}
        />
        <div
          className="absolute -bottom-20 left-1/2 w-[350px] h-[350px] md:w-[600px] md:h-[600px] rounded-full filter blur-[90px] md:blur-[140px] animate-blob"
          style={{ backgroundColor: isDark ? 'rgba(20, 184, 166, 0.08)' : 'rgba(20, 184, 166, 0.06)', animationDelay: '4s' }}
        />

        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px), linear-gradient(90deg, ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'} 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left column - Content */}
          <motion.div
            className="text-center lg:text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Social proof badge */}
            <motion.div variants={itemVariants}>
              <div
                className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full text-sm font-medium border backdrop-blur-sm"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.8)',
                  borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                  color: isDark ? '#E5E7EB' : '#374151',
                }}
              >
                <span className="flex items-center gap-1">
                  <CheckCircle size={16} className="text-green-500" aria-hidden="true" />
                  <span>{t('landing.hero.badge.trusted')}</span>
                </span>
                <span className="w-1 h-1 rounded-full bg-gray-400" aria-hidden="true" />
                <span className="flex items-center gap-1">
                  <Star size={14} className="text-amber-500 fill-amber-500" aria-hidden="true" />
                  <span>{t('landing.hero.badge.rating')}</span>
                </span>
              </div>
            </motion.div>

            {/* Main Headline */}
            <motion.h1
              id="hero-heading"
              variants={itemVariants}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 font-heading"
              style={{ color: isDark ? '#FFFFFF' : '#1A2B47' }}
            >
              <span className="block">{t('landing.hero.headline.line1')}</span>
              <span className="block" style={{ color: '#FF6B00' }}>
                {t('landing.hero.headline.highlight')}
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl mb-8 max-w-xl mx-auto lg:mx-0"
              style={{ color: isDark ? '#D1D5DB' : '#6B7280' }}
            >
              {t('landing.hero.subheadline')}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Link
                to="/signup"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#FF6B00] hover:bg-[#E55F00] text-white text-lg font-semibold rounded-xl transition-all duration-300 hover:-translate-y-0.5 shadow-glow-orange focus:outline-none focus:ring-4 focus:ring-[#FF6B00]/50 focus:ring-offset-2"
              >
                {t('landing.hero.cta.primary')}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>

              <Link
                to="/example-plans"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold rounded-xl border-2 transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-offset-2"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'transparent',
                  borderColor: isDark ? 'rgba(255,255,255,0.2)' : '#E5E7EB',
                  color: isDark ? '#FFFFFF' : '#374151',
                }}
              >
                {t('landing.hero.cta.secondary')}
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm"
              style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}
            >
              <div className="flex items-center gap-2">
                <Shield size={18} className="text-green-500" aria-hidden="true" />
                <span>{t('landing.hero.trust.noCard')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-[#FF6B00]" aria-hidden="true" />
                <span>{t('landing.hero.trust.trial')}</span>
              </div>
              <div className="flex items-center gap-2">
                <XIcon size={18} className="text-rose-500" aria-hidden="true" />
                <span>{t('landing.hero.trust.cancel')}</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right column - Product screenshot placeholder */}
          <motion.div
            className="relative"
            variants={imageVariants}
            initial="hidden"
            animate="visible"
          >
            <div
              className="relative rounded-2xl overflow-hidden shadow-2xl border"
              style={{
                backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              }}
            >
              {/* Screenshot placeholder */}
              <div className="aspect-[4/3] flex items-center justify-center p-8">
                <div className="text-center">
                  <div
                    className="w-24 h-24 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)' }}
                  >
                    <svg
                      className="w-12 h-12"
                      style={{ color: '#6366F1' }}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                      />
                    </svg>
                  </div>
                  <p className="text-lg font-medium" style={{ color: isDark ? '#E5E7EB' : '#374151' }}>
                    {t('landing.hero.screenshot.alt')}
                  </p>
                  <p className="text-sm mt-1" style={{ color: isDark ? '#9CA3AF' : '#6B7280' }}>
                    {t('landing.hero.screenshot.placeholder')}
                  </p>
                </div>
              </div>

              {/* Decorative gradient overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: 'linear-gradient(180deg, transparent 60%, rgba(79, 70, 229, 0.05) 100%)' }}
                aria-hidden="true"
              />
            </div>

            {/* Floating elements */}
            <div
              className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl animate-float"
              style={{
                backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                backdropFilter: 'blur(10px)',
              }}
              aria-hidden="true"
            />
            <div
              className="absolute -bottom-6 -left-6 w-16 h-16 rounded-xl animate-float"
              style={{
                backgroundColor: isDark ? 'rgba(236, 72, 153, 0.2)' : 'rgba(236, 72, 153, 0.15)',
                backdropFilter: 'blur(10px)',
                animationDelay: '2s',
              }}
              aria-hidden="true"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
