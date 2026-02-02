import { Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

interface IllustrationPanelProps {
  tagline?: string;
  subtitle?: string;
  illustrationSrc?: string;
}

/**
 * Right-side branding panel for split-screen auth layout.
 * Shows branded illustration placeholder, tagline, and decorative elements.
 * Hidden on mobile, visible on lg+ breakpoints.
 */
export default function IllustrationPanel({
  tagline,
  subtitle,
  illustrationSrc,
}: IllustrationPanelProps) {
  const { t } = useTheme();

  return (
    <div className="relative hidden lg:flex lg:w-[50%] flex-col items-center justify-center overflow-hidden bg-light-ai-grey dark:bg-[#0F1A2D]">
      {/* Ambient gradient blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div
          className="absolute -top-24 -right-24 h-[420px] w-[420px] rounded-full blur-[120px] opacity-60"
          style={{ background: 'radial-gradient(circle, rgba(255,107,0,0.18) 0%, transparent 70%)' }}
        />
        <div
          className="absolute -bottom-16 -left-16 h-[360px] w-[360px] rounded-full blur-[100px] opacity-40"
          style={{ background: 'radial-gradient(circle, rgba(26,43,71,0.22) 0%, transparent 70%)' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full blur-[140px] opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(255,107,0,0.1) 0%, transparent 60%)' }}
        />
      </div>

      {/* Subtle dot grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.04] pointer-events-none"
        aria-hidden="true"
        style={{
          backgroundImage: 'radial-gradient(circle, #1A2B47 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

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
        <div className="w-full max-w-[380px] rounded-2xl overflow-hidden">
          <img
            src={illustrationSrc || '/illustrations/auth-login.svg'}
            alt=""
            className="w-full h-auto object-contain"
            aria-hidden="true"
          />
        </div>

        {/* Carousel dots */}
        <div className="mt-8 flex items-center gap-2" aria-hidden="true">
          <div className="h-2 w-2 rounded-full bg-gray-300/80 dark:bg-white/15 transition-colors" />
          <div className="h-2 w-2 rounded-full bg-gray-300/80 dark:bg-white/15 transition-colors" />
          <div className="h-2 w-7 rounded-full bg-momentum-orange transition-colors" />
        </div>
      </div>

      {/* Copyright */}
      <p className="absolute bottom-6 left-0 right-0 text-center text-xs text-strategy-blue/30 dark:text-white/20">
        &copy; {new Date().getFullYear()} {t('auth.common.copyright')}
      </p>
    </div>
  );
}
