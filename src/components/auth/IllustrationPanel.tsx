import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import AuthLoginSvg from '../../assets/illustrations/auth-login.svg?react';

interface IllustrationPanelProps {
  tagline?: string;
  subtitle?: string;
  illustrationSrc?: string;
}

/**
 * Right-side branding panel for split-screen auth layout.
 * Shows branded illustration placeholder, tagline, and decorative elements.
 * Hidden on mobile, visible on lg+ breakpoints.
 * Respects prefers-reduced-motion for illustration animations.
 */
export default function IllustrationPanel({
  tagline,
  subtitle,
  illustrationSrc,
}: IllustrationPanelProps) {
  const { t } = useTheme();
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <div className="relative hidden lg:flex lg:w-[50%] flex-col items-center justify-center overflow-hidden bg-light-ai-grey dark:bg-gray-950">
      {/* Subtle dot grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04] pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />
      {/* Faint warm glow top-right */}
      <div className="absolute -top-24 -right-24 h-[350px] w-[350px] rounded-full bg-momentum-orange/[0.06] blur-[100px]" aria-hidden="true" />
      {/* Faint cool glow bottom-left */}
      <div className="absolute -bottom-16 -left-16 h-[300px] w-[300px] rounded-full bg-strategy-blue/[0.08] blur-[100px] dark:bg-white/[0.04]" aria-hidden="true" />

      <div className="relative z-10 flex flex-col items-center text-center max-w-md px-8">
        {/* Logo */}
        <Link
          to="/"
          className="group mb-10 inline-flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <div className="rounded-xl p-2.5 bg-strategy-blue dark:bg-white/10 transition-transform group-hover:scale-105">
            <Brain className="h-6 w-6 text-white" aria-hidden="true" />
          </div>
          <span className="text-xl font-bold font-heading text-strategy-blue dark:text-white tracking-tight">
            Sqordia
          </span>
        </Link>

        {/* Tagline */}
        <h2 className="mb-3 text-2xl font-bold font-heading text-strategy-blue dark:text-white leading-snug tracking-tight">
          {tagline || t('auth.panel.tagline')}
        </h2>
        <p className="mb-10 text-sm text-strategy-blue/60 dark:text-gray-400 leading-relaxed max-w-[320px]">
          {subtitle || t('auth.panel.subtitle')}
        </p>

        {/* Illustration area */}
        <motion.div
          className={`w-full max-w-[380px] rounded-2xl overflow-hidden ${!prefersReducedMotion ? 'illus-animate' : ''}`}
          initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={prefersReducedMotion ? { duration: 0 } : { duration: 0.5, ease: 'easeOut' }}
        >
          {illustrationSrc ? (
            <img
              src={illustrationSrc}
              alt=""
              className="w-full h-auto object-contain"
              aria-hidden="true"
            />
          ) : (
            <AuthLoginSvg
              className="w-full h-auto object-contain"
              aria-hidden="true"
            />
          )}
        </motion.div>

        {/* Accent bar */}
        <div className="mt-8 h-1 w-12 rounded-full bg-momentum-orange/60" aria-hidden="true" />
      </div>

      {/* Copyright */}
      <p className="absolute bottom-6 left-0 right-0 text-center text-xs text-strategy-blue/30 dark:text-white/20">
        &copy; {new Date().getFullYear()} {t('auth.common.copyright')}
      </p>
    </div>
  );
}
