import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Brain, Star, Clock, Zap, Shield, Users, CheckCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import AnimatedBackground from './AnimatedBackground';

interface AuthLayoutProps {
  children: ReactNode;
  variant?: 'split' | 'centered';
  leftPanel?: {
    headlineKey?: string;
    subheadlineKey?: string;
    testimonial?: {
      quoteKey: string;
      authorKey: string;
      roleKey: string;
      rating?: number;
    };
    showTrustIndicators?: boolean;
  };
}

/**
 * Auth layout wrapper component
 * Supports split-panel (for signup) and centered (for login) layouts
 * Features animated gradient background and glassmorphism card
 * Responsive: split panel becomes single panel on mobile
 */
export default function AuthLayout({
  children,
  variant = 'split',
  leftPanel,
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

  // Split panel layout
  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Desktop only */}
      <div className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex lg:w-[45%] bg-[#1A2B47] dark:bg-slate-950">
        {/* Gradient mesh overlay */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div
            className="absolute top-0 right-0 h-[400px] w-[400px] rounded-full opacity-30 blur-[120px]"
            style={{ backgroundColor: 'rgba(255, 107, 0, 0.25)' }}
          />
          <div
            className="absolute bottom-0 left-0 h-[350px] w-[350px] rounded-full opacity-25 blur-[100px]"
            style={{ backgroundColor: 'rgba(99, 102, 241, 0.2)' }}
          />
        </div>

        <div className="relative z-10">
          {/* Logo */}
          <Link to="/" className="group mb-12 inline-flex items-center gap-3">
            <div className="rounded-xl p-3 transition-transform group-hover:scale-105 bg-white/10">
              <Brain className="h-7 w-7 text-white" aria-hidden="true" />
            </div>
            <span className="text-2xl font-bold font-heading text-white">
              Sqordia
            </span>
          </Link>

          {/* Headline */}
          <h2 className="mb-4 text-4xl font-bold font-heading leading-tight text-white">
            {leftPanel?.headlineKey ? t(leftPanel.headlineKey) : t('register.panel.subtitle')}
          </h2>
          <p className="mb-12 text-lg text-gray-300">
            {leftPanel?.subheadlineKey ? t(leftPanel.subheadlineKey) : t('register.panel.tagline')}
          </p>

          {/* Benefits */}
          <div className="mb-12 space-y-6">
            <BenefitItem
              icon={Clock}
              title={t('register.panel.benefit1.title')}
              description={t('register.panel.benefit1.desc')}
            />
            <BenefitItem
              icon={Zap}
              title={t('register.panel.benefit2.title')}
              description={t('register.panel.benefit2.desc')}
            />
            <BenefitItem
              icon={Shield}
              title={t('register.panel.benefit3.title')}
              description={t('register.panel.benefit3.desc')}
            />
          </div>

          {/* Testimonial */}
          {leftPanel?.testimonial && (
            <div className="rounded-xl p-6 bg-white/5 backdrop-blur-sm border border-white/10">
              {leftPanel.testimonial.rating && (
                <div className="mb-3 flex gap-1" aria-label={`${leftPanel.testimonial.rating} out of 5 stars`}>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < leftPanel.testimonial!.rating!
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-500'
                      }`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
              )}
              <p className="mb-4 text-white/90 italic">
                &ldquo;{t(leftPanel.testimonial.quoteKey)}&rdquo;
              </p>
              <div>
                <p className="font-semibold text-white">
                  {t(leftPanel.testimonial.authorKey)}
                </p>
                <p className="text-sm text-gray-400">
                  {t(leftPanel.testimonial.roleKey)}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Trust Indicators */}
        <div className="relative z-10">
          {leftPanel?.showTrustIndicators !== false && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-momentum-orange" aria-hidden="true" />
                <span className="font-semibold text-white">{t('register.panel.trust.plans')}</span>
              </div>
              <div className="flex items-center gap-3">
                <Star className="h-5 w-5 fill-current text-momentum-orange" aria-hidden="true" />
                <span className="font-semibold text-white">{t('register.panel.trust.rating')}</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-momentum-orange" aria-hidden="true" />
                <span className="font-semibold text-white">{t('register.panel.trust.nocard')}</span>
              </div>
            </div>
          )}

          {/* Copyright */}
          <p className="mt-8 text-sm text-gray-500">
            {new Date().getFullYear()} {t('auth.common.copyright')}
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-1 items-center justify-center overflow-y-auto bg-background px-4 py-12 sm:px-6 lg:px-12">
        <div className="w-full max-w-[520px]">
          {/* Mobile Logo */}
          <div className="mb-8 text-center lg:hidden">
            <Link to="/" className="group mb-6 inline-flex items-center gap-3">
              <div className="rounded-xl p-3 transition-transform group-hover:scale-105 bg-[#1A2B47] dark:bg-slate-800">
                <Brain className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <span className="text-2xl font-bold font-heading text-foreground">
                Sqordia
              </span>
            </Link>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}

interface BenefitItemProps {
  icon: typeof Clock;
  title: string;
  description: string;
}

function BenefitItem({ icon: Icon, title, description }: BenefitItemProps) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 rounded-lg p-2.5 bg-momentum-orange/15">
        <Icon className="h-5 w-5 text-momentum-orange" aria-hidden="true" />
      </div>
      <div>
        <h3 className="mb-1 font-semibold text-white">{title}</h3>
        <p className="text-sm text-gray-400">
          {description}
        </p>
      </div>
    </div>
  );
}
