'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AlertCircle, CheckCircle, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const content = {
  en: {
    title: 'Welcome back',
    subtitle: 'Sign in to continue to Sqordia',
    email: 'Email',
    emailPlaceholder: 'Enter your email',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    rememberMe: 'Remember me',
    forgotPassword: 'Forgot password?',
    signIn: 'Sign In',
    signingIn: 'Signing in...',
    divider: 'or continue with',
    google: 'Continue with Google',
    microsoft: 'Continue with Microsoft',
    noAccount: "Don't have an account?",
    createAccount: 'Create account',
    backToHome: 'Back to home',
    panel: {
      tagline: 'Create professional business plans in under 60 minutes',
      subtitle: 'AI-powered guidance for entrepreneurs, consultants, and organizations',
    },
    errors: {
      emailRequired: 'Email is required',
      emailInvalid: 'Please enter a valid email',
      passwordRequired: 'Password is required',
      loginFailed: 'Invalid email or password. Please try again.',
    },
  },
  fr: {
    title: 'Bon retour',
    subtitle: 'Connectez-vous pour continuer sur Sqordia',
    email: 'Courriel',
    emailPlaceholder: 'Entrez votre courriel',
    password: 'Mot de passe',
    passwordPlaceholder: 'Entrez votre mot de passe',
    rememberMe: 'Se souvenir de moi',
    forgotPassword: 'Mot de passe oublié?',
    signIn: 'Se connecter',
    signingIn: 'Connexion en cours...',
    divider: 'ou continuer avec',
    google: 'Continuer avec Google',
    microsoft: 'Continuer avec Microsoft',
    noAccount: "Vous n'avez pas de compte?",
    createAccount: 'Créer un compte',
    backToHome: "Retour à l'accueil",
    panel: {
      tagline: "Créez des plans d'affaires professionnels en moins de 60 minutes",
      subtitle: "Accompagnement IA pour entrepreneurs, consultants et organisations",
    },
    errors: {
      emailRequired: 'Le courriel est requis',
      emailInvalid: 'Veuillez entrer un courriel valide',
      passwordRequired: 'Le mot de passe est requis',
      loginFailed: 'Courriel ou mot de passe invalide. Veuillez réessayer.',
    },
  },
};

export default function LoginContent({ locale }: { locale: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = content[locale as keyof typeof content] || content.en;

  const successMessage = searchParams.get('message');
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const homeUrl = locale === 'fr' ? '/fr' : '/';
  const signupUrl = locale === 'fr' ? '/fr/signup' : '/signup';
  const forgotPasswordUrl = locale === 'fr' ? '/fr/forgot-password' : '/forgot-password';

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = t.errors.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.errors.emailInvalid;
    }

    if (!formData.password) {
      newErrors.password = t.errors.passwordRequired;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear field error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setServerError('');

    try {
      // Call the login API route
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t.errors.loginFailed);
      }

      // Redirect to dashboard or specified redirect URL
      router.push(redirectTo);
      router.refresh();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t.errors.loginFailed;
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'microsoft') => {
    // For now, redirect to the existing OAuth flow
    // This will be enhanced in later phases
    window.location.href = `/api/auth/${provider}?redirect=${encodeURIComponent(redirectTo)}`;
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Illustration (hidden on mobile) */}
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
          {/* Decorative elements */}
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
            <span className="text-sm font-medium">{t.backToHome}</span>
          </Link>

          {/* Title */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1A2B47] dark:text-white mb-2">
              {t.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{t.subtitle}</p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20">
              <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                {decodeURIComponent(successMessage)}
              </p>
            </div>
          )}

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
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full h-12 px-4 rounded-lg border ${
                  errors.email
                    ? 'border-red-300 dark:border-red-500'
                    : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition-all`}
                placeholder={t.emailPlaceholder}
                autoComplete="email"
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                {t.password}
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full h-12 px-4 pr-12 rounded-lg border ${
                    errors.password
                      ? 'border-red-300 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition-all`}
                  placeholder={t.passwordPlaceholder}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me / Forgot Password */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]"
                />
                <span className="ml-2.5 text-gray-600 dark:text-gray-400">
                  {t.rememberMe}
                </span>
              </label>
              <Link
                href={forgotPasswordUrl}
                className="font-semibold text-[#FF6B00] hover:underline"
              >
                {t.forgotPassword}
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#FF6B00] hover:bg-[#E55F00] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t.signingIn : t.signIn}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white dark:bg-gray-900 px-4 text-gray-500">
                {t.divider}
              </span>
            </div>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="w-full h-12 flex items-center justify-center gap-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {t.google}
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('microsoft')}
              className="w-full h-12 flex items-center justify-center gap-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#f25022" d="M1 1h10v10H1z" />
                <path fill="#00a4ef" d="M1 13h10v10H1z" />
                <path fill="#7fba00" d="M13 1h10v10H13z" />
                <path fill="#ffb900" d="M13 13h10v10H13z" />
              </svg>
              {t.microsoft}
            </button>
          </div>

          {/* Sign Up Link */}
          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            {t.noAccount}{' '}
            <Link href={signupUrl} className="font-semibold text-[#FF6B00] hover:underline">
              {t.createAccount}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
