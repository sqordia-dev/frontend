import { useRef } from 'react';
import { ArrowRight, Shield, Clock, XCircle, Sparkles, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { usePublishedContent } from '@/hooks/usePublishedContent';
import { cn } from '@/lib/utils';
import { motion, useScroll, useTransform } from 'framer-motion';

const smoothEase: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: smoothEase } },
};

const wordVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: smoothEase } },
};

const mockupVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.25, ease: smoothEase } },
};

const socialAvatars = [
  { initials: 'SC', from: '#FF6B00', to: '#E55F00' },
  { initials: 'MR', from: '#F59E0B', to: '#D97706' },
  { initials: 'ET', from: '#14B8A6', to: '#0D9488' },
  { initials: 'JL', from: '#3B82F6', to: '#2563EB' },
  { initials: 'AB', from: '#FF6B00', to: '#F59E0B' },
];

export default function Hero() {
  const { theme, t } = useTheme();
  const { getBlockContent } = usePublishedContent();
  const isDark = theme === 'dark';
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  const screenshotY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const screenshotScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.97]);

  // CMS content with i18n fallbacks
  const badgeTrusted = getBlockContent('landing.hero.badge_trusted', t('landing.hero.badge.trusted'));
  const badgeRating = getBlockContent('landing.hero.badge_rating', t('landing.hero.badge.rating'));
  const headlineLine1 = getBlockContent('landing.hero.headline_line1', t('landing.hero.headline.line1'));
  const headlineHighlight = getBlockContent('landing.hero.headline_highlight', t('landing.hero.headline.highlight'));
  const subheadline = getBlockContent('landing.hero.subheadline', t('landing.hero.subheadline'));
  const ctaPrimary = getBlockContent('landing.hero.cta_primary', t('landing.hero.cta.primary'));
  const ctaSecondary = getBlockContent('landing.hero.cta_secondary', t('landing.hero.cta.secondary'));
  const trustNoCard = getBlockContent('landing.hero.trust_nocard', t('landing.hero.trust.noCard'));
  const trustTrial = getBlockContent('landing.hero.trust_trial', t('landing.hero.trust.trial'));
  const trustCancel = getBlockContent('landing.hero.trust_cancel', t('landing.hero.trust.cancel'));
  const announcementBadge = getBlockContent('landing.hero.announcement', t('landing.hero.announcement'));

  const line1Words = headlineLine1.split(' ');
  const highlightWords = headlineHighlight.split(' ');

  return (
    <section
      ref={sectionRef}
      className={cn(
        'relative pt-24 pb-12 sm:pt-28 sm:pb-16 md:pt-44 md:pb-32 lg:pt-48 lg:pb-40 overflow-hidden min-h-[80vh] sm:min-h-[90vh] flex items-center',
        isDark ? 'bg-[#0B0C0A]' : 'bg-[#FAFAF8]',
      )}
      aria-labelledby="hero-heading"
    >
      {/* Gradient mesh blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div
          className="absolute -top-32 -left-32 w-[300px] h-[300px] sm:w-[450px] sm:h-[450px] lg:w-[600px] lg:h-[600px] rounded-full animate-blob"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(255,107,0,0.15), transparent 70%)'
              : 'radial-gradient(circle, rgba(255,107,0,0.12), transparent 70%)',
          }}
        />
        <div
          className="absolute -top-20 -right-20 w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] lg:w-[500px] lg:h-[500px] rounded-full animate-blob"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(245,158,11,0.12), transparent 70%)'
              : 'radial-gradient(circle, rgba(245,158,11,0.1), transparent 70%)',
            animationDelay: '2s',
          }}
        />
        <div
          className="absolute -bottom-40 left-1/3 w-[250px] h-[250px] sm:w-[350px] sm:h-[350px] lg:w-[500px] lg:h-[500px] rounded-full animate-blob"
          style={{
            background: isDark
              ? 'radial-gradient(circle, rgba(20,184,166,0.1), transparent 70%)'
              : 'radial-gradient(circle, rgba(20,184,166,0.08), transparent 70%)',
            animationDelay: '4s',
          }}
        />
      </div>

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.04]"
        style={{ backgroundImage: "url('/noise.svg')", backgroundRepeat: 'repeat' }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left column */}
          <motion.div
            className="text-center lg:text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Announcement badge */}
            <motion.div variants={itemVariants}>
              <div
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full text-body-xs font-medium',
                  'backdrop-blur-sm border',
                  isDark
                    ? 'bg-momentum-orange/10 border-momentum-orange/20 text-momentum-orange'
                    : 'bg-momentum-orange/5 border-momentum-orange/15 text-momentum-orange',
                )}
              >
                <Sparkles size={14} className="animate-pulse" />
                <span>{announcementBadge}</span>
              </div>
            </motion.div>

            {/* Social proof with overlapping avatars */}
            <motion.div variants={itemVariants}>
              <div className="flex items-center gap-3 mb-8 justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  {socialAvatars.map((avatar, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ring-2',
                        isDark ? 'ring-[#0B0C0A]' : 'ring-[#FAFAF8]',
                      )}
                      style={{ background: `linear-gradient(135deg, ${avatar.from}, ${avatar.to})` }}
                    >
                      {avatar.initials}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className={cn('text-xs', isDark ? 'text-gray-400' : 'text-gray-500')}>
                    {badgeTrusted} · {badgeRating}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Headline — word stagger with gradient highlight */}
            <motion.h1
              id="hero-heading"
              className={cn(
                'text-3xl sm:text-4xl md:text-display-lg lg:text-display-xl xl:text-display-2xl mb-4 sm:mb-6 font-heading',
                isDark ? 'text-white' : 'text-strategy-blue',
              )}
              variants={containerVariants}
            >
              <span className="block">
                {line1Words.map((word, i) => (
                  <motion.span key={i} variants={wordVariants} className="inline-block mr-[0.3em]">
                    {word}
                  </motion.span>
                ))}
              </span>
              <span className="block bg-gradient-to-r from-momentum-orange to-amber-500 bg-clip-text text-transparent">
                {highlightWords.map((word, i) => (
                  <motion.span key={i} variants={wordVariants} className="inline-block mr-[0.3em]">
                    {word}
                  </motion.span>
                ))}
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              className={cn(
                'text-base sm:text-body-lg md:text-xl mb-6 sm:mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed',
                isDark ? 'text-gray-300' : 'text-gray-500',
              )}
            >
              {subheadline}
            </motion.p>

            {/* CTA */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start mb-8 sm:mb-12"
            >
              <Link
                to="/signup"
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-momentum-orange hover:bg-[#E55F00] text-white text-base font-semibold rounded-xl transition-all duration-200 shadow-[0_4px_16px_rgba(255,107,0,0.3)] hover:shadow-[0_6px_24px_rgba(255,107,0,0.4)] hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-momentum-orange/30"
              >
                {ctaPrimary}
                <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <Link
                to="/example-plans"
                className={cn(
                  'inline-flex items-center justify-center gap-2 px-8 py-4 text-base font-semibold rounded-xl border transition-all duration-200 focus:outline-none focus:ring-4',
                  isDark
                    ? 'bg-white/[0.04] border-white/[0.1] text-white hover:bg-white/[0.08] focus:ring-white/20'
                    : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm focus:ring-gray-200/50',
                )}
              >
                {ctaSecondary}
              </Link>
            </motion.div>

            {/* Trust badges */}
            <motion.div
              variants={itemVariants}
              className={cn(
                'flex flex-wrap items-center justify-center lg:justify-start gap-6 text-body-sm',
                isDark ? 'text-gray-400' : 'text-gray-500',
              )}
            >
              <div className="flex items-center gap-1.5">
                <Shield size={16} className="text-green-500" />
                <span>{trustNoCard}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={16} className="text-momentum-orange" />
                <span>{trustTrial}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <XCircle size={16} className="text-gray-400" />
                <span>{trustCancel}</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right column — Parallax screenshot frame */}
          <motion.div
            className="relative lg:pl-4"
            variants={mockupVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div style={{ y: screenshotY, scale: screenshotScale }}>
              <div
                className={cn(
                  'rounded-2xl border overflow-hidden',
                  isDark
                    ? 'border-white/[0.08] shadow-[0_20px_60px_rgba(0,0,0,0.5)]'
                    : 'border-gray-200/60 shadow-[0_20px_60px_rgba(0,0,0,0.12)]',
                )}
              >
                {/* Browser toolbar */}
                <div
                  className={cn(
                    'flex items-center gap-2 px-4 py-3 border-b',
                    isDark ? 'bg-[#1C1D1A] border-white/[0.06]' : 'bg-gray-100 border-gray-200',
                  )}
                >
                  <div className="flex gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-400/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-400/80" />
                    <span className="w-3 h-3 rounded-full bg-green-400/80" />
                  </div>
                  <div
                    className={cn(
                      'flex-1 mx-4 h-6 rounded-md text-xs flex items-center justify-center',
                      isDark
                        ? 'bg-white/[0.06] text-gray-500'
                        : 'bg-white text-gray-400 border border-gray-200',
                    )}
                  >
                    sqordia.com
                  </div>
                </div>
                {/* Screenshot — crop tall full-page capture to 16:10 viewport */}
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={isDark ? '/images/screenshots/dashboard-full-dark.png' : '/images/screenshots/dashboard-full.png'}
                    alt={t('landing.hero.screenshot.alt')}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
