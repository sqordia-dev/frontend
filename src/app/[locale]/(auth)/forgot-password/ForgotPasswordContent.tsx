'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, ArrowRight, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

const content = {
  en: {
    title: 'Forgot password?',
    subtitle: "No worries, we'll send you reset instructions.",
    email: 'Email',
    emailPlaceholder: 'Enter your email',
    sendLink: 'Send Reset Link',
    sending: 'Sending...',
    backToLogin: 'Back to login',
    success: {
      title: 'Check your email',
      message: "We've sent a password reset link to",
      instructions: 'Check your inbox and click the link to reset your password.',
      backToLogin: 'Back to login',
      noEmail: "Didn't receive the email?",
      tryAgain: 'Click to resend',
    },
    errors: {
      emailRequired: 'Email is required',
      emailInvalid: 'Please enter a valid email address',
      serverError: 'Unable to send reset email. Please try again.',
    },
    panel: {
      tagline: 'Create professional business plans in under 60 minutes',
      subtitle: 'AI-powered guidance for entrepreneurs, consultants, and organizations',
    },
  },
  fr: {
    title: 'Mot de passe oublié?',
    subtitle: 'Pas de souci, nous vous enverrons les instructions de réinitialisation.',
    email: 'Courriel',
    emailPlaceholder: 'Entrez votre courriel',
    sendLink: 'Envoyer le lien',
    sending: 'Envoi en cours...',
    backToLogin: 'Retour à la connexion',
    success: {
      title: 'Vérifiez votre courriel',
      message: 'Nous avons envoyé un lien de réinitialisation à',
      instructions: 'Consultez votre boîte de réception et cliquez sur le lien pour réinitialiser votre mot de passe.',
      backToLogin: 'Retour à la connexion',
      noEmail: "Vous n'avez pas reçu le courriel?",
      tryAgain: 'Cliquez pour renvoyer',
    },
    errors: {
      emailRequired: 'Le courriel est requis',
      emailInvalid: 'Veuillez entrer une adresse courriel valide',
      serverError: "Impossible d'envoyer le courriel de réinitialisation. Veuillez réessayer.",
    },
    panel: {
      tagline: "Créez des plans d'affaires professionnels en moins de 60 minutes",
      subtitle: 'Accompagnement IA pour entrepreneurs, consultants et organisations',
    },
  },
};

export default function ForgotPasswordContent({ locale }: { locale: string }) {
  const t = content[locale as keyof typeof content] || content.en;

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const loginUrl = locale === 'fr' ? '/fr/login' : '/login';
  const homeUrl = locale === 'fr' ? '/fr' : '/';

  const validateEmail = (email: string) => {
    if (!email) return t.errors.emailRequired;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return t.errors.emailInvalid;
    return '';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');

    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || t.errors.serverError);
      }

      setSuccess(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t.errors.serverError;
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleTryAgain = () => {
    setSuccess(false);
    setEmail('');
  };

  if (success) {
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

            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {t.success.message}{' '}
              <strong className="text-[#1A2B47] dark:text-white">{email}</strong>.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {t.success.instructions}
            </p>

            <Link
              href={loginUrl}
              className="inline-flex items-center justify-center gap-2 w-full h-12 bg-[#FF6B00] hover:bg-[#E55F00] text-white font-semibold rounded-lg transition-colors mb-4"
            >
              <ArrowLeft size={18} />
              {t.success.backToLogin}
            </Link>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t.success.noEmail}{' '}
              <button
                onClick={handleTryAgain}
                className="font-semibold text-[#FF6B00] hover:underline"
              >
                {t.success.tryAgain}
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

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

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-8">
        <div className="w-full max-w-md">
          {/* Back to home */}
          <Link
            href={homeUrl}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#FF6B00] mb-8 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">
              {locale === 'fr' ? "Retour à l'accueil" : 'Back to home'}
            </span>
          </Link>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1A2B47] dark:text-white mb-2">
              {t.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{t.subtitle}</p>
          </div>

          {/* Server Error */}
          {serverError && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                {serverError}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                {t.email}
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                    if (serverError) setServerError('');
                  }}
                  className={`w-full h-12 pl-12 pr-4 rounded-lg border ${
                    error
                      ? 'border-red-300 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition-all`}
                  placeholder={t.emailPlaceholder}
                  autoComplete="email"
                />
              </div>
              {error && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#FF6B00] hover:bg-[#E55F00] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                t.sending
              ) : (
                <>
                  {t.sendLink}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-8 text-center">
            <Link
              href={loginUrl}
              className="inline-flex items-center gap-1 text-sm font-medium text-[#FF6B00] hover:underline"
            >
              <ArrowLeft size={16} />
              {t.backToLogin}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
