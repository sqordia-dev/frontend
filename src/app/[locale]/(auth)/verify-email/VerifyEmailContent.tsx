'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle, AlertCircle, Mail, RefreshCw, ArrowLeft } from 'lucide-react';

const content = {
  en: {
    loading: {
      title: 'Verifying your email',
      message: 'Please wait while we verify your email address...',
    },
    success: {
      title: 'Email verified!',
      message: 'Your email has been successfully verified. You can now sign in to your account.',
      redirecting: 'Redirecting to login in',
      seconds: 'seconds',
      second: 'second',
      loginLink: 'Go to login now',
    },
    error: {
      title: 'Verification failed',
      defaultMessage: 'The verification link is invalid or has expired. Please request a new verification email.',
    },
    resend: {
      title: 'Verify your email',
      message: "We've sent a verification email to your inbox. Click the link to verify your email address.",
      button: 'Resend verification email',
      sending: 'Sending...',
      success: 'Verification email sent! Check your inbox.',
    },
    alreadyVerified: 'Already verified?',
    loginLink: 'Sign in',
    helpText: 'Having trouble?',
    contactSupport: 'Contact support',
    backToHome: 'Back to home',
    panel: {
      tagline: 'Create professional business plans in under 60 minutes',
      subtitle: 'AI-powered guidance for entrepreneurs, consultants, and organizations',
    },
    errors: {
      serverError: 'Unable to verify email. Please try again.',
      resendError: 'Unable to send verification email. Please try again.',
    },
  },
  fr: {
    loading: {
      title: 'Vérification de votre courriel',
      message: 'Veuillez patienter pendant que nous vérifions votre adresse courriel...',
    },
    success: {
      title: 'Courriel vérifié!',
      message: 'Votre courriel a été vérifié avec succès. Vous pouvez maintenant vous connecter à votre compte.',
      redirecting: 'Redirection vers la connexion dans',
      seconds: 'secondes',
      second: 'seconde',
      loginLink: 'Aller à la connexion maintenant',
    },
    error: {
      title: 'Échec de la vérification',
      defaultMessage: "Le lien de vérification est invalide ou a expiré. Veuillez demander un nouveau courriel de vérification.",
    },
    resend: {
      title: 'Vérifiez votre courriel',
      message: "Nous avons envoyé un courriel de vérification à votre boîte de réception. Cliquez sur le lien pour vérifier votre adresse courriel.",
      button: 'Renvoyer le courriel de vérification',
      sending: 'Envoi en cours...',
      success: 'Courriel de vérification envoyé! Vérifiez votre boîte de réception.',
    },
    alreadyVerified: 'Déjà vérifié?',
    loginLink: 'Se connecter',
    helpText: 'Vous avez des difficultés?',
    contactSupport: 'Contacter le support',
    backToHome: "Retour à l'accueil",
    panel: {
      tagline: "Créez des plans d'affaires professionnels en moins de 60 minutes",
      subtitle: 'Accompagnement IA pour entrepreneurs, consultants et organisations',
    },
    errors: {
      serverError: 'Impossible de vérifier le courriel. Veuillez réessayer.',
      resendError: "Impossible d'envoyer le courriel de vérification. Veuillez réessayer.",
    },
  },
};

type VerificationStatus = 'loading' | 'success' | 'error' | 'resend';

export default function VerifyEmailContent({ locale }: { locale: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = content[locale as keyof typeof content] || content.en;

  const token = searchParams.get('token');

  const [status, setStatus] = useState<VerificationStatus>(token ? 'loading' : 'resend');
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const loginUrl = locale === 'fr' ? '/fr/login' : '/login';
  const homeUrl = locale === 'fr' ? '/fr' : '/';

  const verifyEmail = useCallback(async (verificationToken: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationToken }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t.errors.serverError);
      }

      setStatus('success');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t.errors.serverError;
      setError(message);
      setStatus('error');
    }
  }, [t.errors.serverError]);

  // Verify email when token is present
  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token, verifyEmail]);

  // Countdown and redirect on success
  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (status === 'success' && countdown === 0) {
      router.push(loginUrl);
    }
  }, [status, countdown, router, loginUrl]);

  const handleResendEmail = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    setError('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t.errors.resendError);
      }

      setResendSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t.errors.resendError;
      setError(message);
    } finally {
      setResendLoading(false);
    }
  };

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen">
        {/* Left Panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#1A2B47] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1A2B47] via-[#2A3B57] to-[#1A2B47]" />
          <div className="relative z-10 flex flex-col justify-center px-16">
            <div className="mb-8">
              <Image
                src="/images/logo-white.svg"
                alt="Sqordia"
                width={150}
                height={40}
                className="h-10 w-auto"
              />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              {t.panel.tagline}
            </h2>
            <p className="text-xl text-gray-300">{t.panel.subtitle}</p>
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#FF6B00]/20 to-transparent" />
          </div>
        </div>

        {/* Right Panel - Loading */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-8">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto mb-6 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-[#FF6B00]" />
            <h1 className="text-xl font-semibold text-[#1A2B47] dark:text-white">
              {t.loading.title}
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              {t.loading.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="flex min-h-screen">
        {/* Left Panel */}
        <div className="hidden lg:flex lg:w-1/2 bg-[#1A2B47] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-[#1A2B47] via-[#2A3B57] to-[#1A2B47]" />
          <div className="relative z-10 flex flex-col justify-center px-16">
            <div className="mb-8">
              <Image
                src="/images/logo-white.svg"
                alt="Sqordia"
                width={150}
                height={40}
                className="h-10 w-auto"
              />
            </div>
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
              {t.panel.tagline}
            </h2>
            <p className="text-xl text-gray-300">{t.panel.subtitle}</p>
            <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#FF6B00]/20 to-transparent" />
          </div>
        </div>

        {/* Right Panel - Success */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-8">
          <div className="w-full max-w-md text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/20">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>

            <h1 className="text-3xl font-bold text-[#1A2B47] dark:text-white mb-4">
              {t.success.title}
            </h1>

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t.success.message}
            </p>

            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {t.success.redirecting} {countdown}{' '}
              {countdown !== 1 ? t.success.seconds : t.success.second}...
            </p>

            <Link
              href={loginUrl}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#FF6B00] hover:underline"
            >
              {t.success.loginLink}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Error or Resend state
  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1A2B47] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A2B47] via-[#2A3B57] to-[#1A2B47]" />
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="mb-8">
            <Image
              src="/images/logo-white.svg"
              alt="Sqordia"
              width={150}
              height={40}
              className="h-10 w-auto"
            />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            {t.panel.tagline}
          </h2>
          <p className="text-xl text-gray-300">{t.panel.subtitle}</p>
          <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-[#FF6B00]/20 to-transparent" />
        </div>
      </div>

      {/* Right Panel - Error/Resend */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-8">
        <div className="w-full max-w-md">
          {/* Back to home */}
          <Link
            href={homeUrl}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#FF6B00] mb-8 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">{t.backToHome}</span>
          </Link>

          <div className="text-center">
            {status === 'error' ? (
              <>
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/20">
                  <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
                <h1 className="text-3xl font-bold text-[#1A2B47] dark:text-white mb-4">
                  {t.error.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {error || t.error.defaultMessage}
                </p>
              </>
            ) : (
              <>
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-950/20">
                  <Mail className="h-8 w-8 text-[#FF6B00]" />
                </div>
                <h1 className="text-3xl font-bold text-[#1A2B47] dark:text-white mb-4">
                  {t.resend.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {t.resend.message}
                </p>
              </>
            )}

            {/* Resend Success Message */}
            {resendSuccess && (
              <div className="mb-6 flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20">
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" />
                <p className="text-sm font-medium text-green-800 dark:text-green-300">
                  {t.resend.success}
                </p>
              </div>
            )}

            {/* Error Message (for resend failures) */}
            {status === 'resend' && error && (
              <div className="mb-6 flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" />
                <p className="text-sm font-medium text-red-600 dark:text-red-400">
                  {error}
                </p>
              </div>
            )}

            {/* Resend Button */}
            <button
              onClick={handleResendEmail}
              disabled={resendLoading}
              className="w-full h-12 bg-[#FF6B00] hover:bg-[#E55F00] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {resendLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  {t.resend.sending}
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  {t.resend.button}
                </>
              )}
            </button>

            {/* Login Link */}
            <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t.alreadyVerified}{' '}
                <Link
                  href={loginUrl}
                  className="font-semibold text-[#FF6B00] hover:underline"
                >
                  {t.loginLink}
                </Link>
              </p>
            </div>

            {/* Help Text */}
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
              {t.helpText}{' '}
              <Link
                href={`${homeUrl}#contact`}
                className="font-medium text-[#FF6B00] hover:underline"
              >
                {t.contactSupport}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
