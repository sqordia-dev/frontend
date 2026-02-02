import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import AnimatedBackground from './AnimatedBackground';
import IllustrationPanel from './IllustrationPanel';

interface AuthLayoutProps {
  children: ReactNode;
  variant?: 'split' | 'centered';
  illustrationPanel?: {
    tagline?: string;
    subtitle?: string;
    illustrationSrc?: string;
  };
}

/**
 * Auth layout wrapper component
 * Supports split-panel (form LEFT, illustration RIGHT) and centered layouts
 * Split: used by login and signup
 * Centered: used by forgot-password, reset-password, verify-email
 * Responsive: illustration panel hidden on mobile
 */
export default function AuthLayout({
  children,
  variant = 'split',
  illustrationPanel,
}: AuthLayoutProps) {
  const { t } = useTheme();

  if (variant === 'centered') {
    return (
      <div className="relative flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-950">
        {/* Animated gradient orbs */}
        <AnimatedBackground />

        <div className="relative z-10 w-full max-w-md">
          {/* Logo */}
          <div className="mb-8 text-center">
            <Link to="/" className="inline-flex items-center gap-3 group">
              <div className="rounded-xl p-3 transition-transform group-hover:scale-105 bg-[#1A2B47] dark:bg-slate-800">
                <Brain className="h-7 w-7 text-white" aria-hidden="true" />
              </div>
              <span className="text-2xl font-bold font-heading text-foreground">
                Sqordia
              </span>
            </Link>
          </div>

          {/* Glassmorphism content card */}
          <div className="glass-card rounded-2xl p-8 shadow-xl sm:p-10">
            {children}
          </div>

          {/* Copyright */}
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {new Date().getFullYear()} {t('auth.common.copyright')}
          </p>
        </div>
      </div>
    );
  }

  // Split panel layout - Form LEFT, Illustration RIGHT
  return (
    <div className="flex min-h-screen">
      {/* LEFT Panel - Form */}
      <div className="flex flex-1 flex-col items-center justify-center overflow-y-auto bg-background px-4 py-12 sm:px-6 lg:px-12">
        <div className="w-full max-w-[480px]">
          {/* Mobile Logo (shown when illustration panel is hidden) */}
          <div className="mb-8 text-center lg:hidden">
            <Link to="/" className="group inline-flex items-center gap-3">
              <div className="rounded-xl p-3 transition-transform group-hover:scale-105 bg-strategy-blue dark:bg-slate-800">
                <Brain className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <span className="text-2xl font-bold font-heading text-foreground">
                Sqordia
              </span>
            </Link>
          </div>

          {children}

          {/* Copyright - mobile only */}
          <p className="mt-8 text-center text-sm text-muted-foreground lg:hidden">
            &copy; {new Date().getFullYear()} {t('auth.common.copyright')}
          </p>
        </div>
      </div>

      {/* RIGHT Panel - Illustration (desktop only) */}
      <IllustrationPanel
        tagline={illustrationPanel?.tagline}
        subtitle={illustrationPanel?.subtitle}
        illustrationSrc={illustrationPanel?.illustrationSrc}
      />
    </div>
  );
}
