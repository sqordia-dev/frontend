'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { AlertCircle, Eye, EyeOff, ArrowLeft, Check, X } from 'lucide-react';

const content = {
  en: {
    title: 'Create your account',
    subtitle: 'Start your 14-day free trial. No credit card required.',
    firstName: 'First Name',
    firstNamePlaceholder: 'Enter your first name',
    lastName: 'Last Name',
    lastNamePlaceholder: 'Enter your last name',
    email: 'Email',
    emailPlaceholder: 'Enter your email',
    password: 'Password',
    passwordPlaceholder: 'Create a password',
    confirmPassword: 'Confirm Password',
    confirmPasswordPlaceholder: 'Confirm your password',
    termsPrefix: 'By creating an account, you agree to our',
    terms: 'Terms of Service',
    and: 'and',
    privacy: 'Privacy Policy',
    createAccount: 'Create Account',
    creating: 'Creating account...',
    divider: 'or continue with',
    google: 'Continue with Google',
    microsoft: 'Continue with Microsoft',
    hasAccount: 'Already have an account?',
    signIn: 'Sign in',
    backToHome: 'Back to home',
    panel: {
      tagline: 'Join thousands of entrepreneurs',
      subtitle: 'Create professional business plans with AI-powered guidance',
    },
    passwordRequirements: {
      title: 'Password must contain:',
      length: 'At least 8 characters',
      uppercase: 'One uppercase letter',
      lowercase: 'One lowercase letter',
      number: 'One number',
      special: 'One special character',
    },
    errors: {
      firstNameRequired: 'First name is required',
      lastNameRequired: 'Last name is required',
      emailRequired: 'Email is required',
      emailInvalid: 'Please enter a valid email',
      passwordRequired: 'Password is required',
      passwordWeak: 'Password does not meet requirements',
      confirmPasswordRequired: 'Please confirm your password',
      passwordsMismatch: 'Passwords do not match',
      signupFailed: 'Failed to create account. Please try again.',
    },
  },
  fr: {
    title: 'Créez votre compte',
    subtitle: "Commencez votre essai gratuit de 14 jours. Aucune carte de crédit requise.",
    firstName: 'Prénom',
    firstNamePlaceholder: 'Entrez votre prénom',
    lastName: 'Nom',
    lastNamePlaceholder: 'Entrez votre nom',
    email: 'Courriel',
    emailPlaceholder: 'Entrez votre courriel',
    password: 'Mot de passe',
    passwordPlaceholder: 'Créez un mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    confirmPasswordPlaceholder: 'Confirmez votre mot de passe',
    termsPrefix: 'En créant un compte, vous acceptez nos',
    terms: "Conditions d'utilisation",
    and: 'et notre',
    privacy: 'Politique de confidentialité',
    createAccount: 'Créer un compte',
    creating: 'Création en cours...',
    divider: 'ou continuer avec',
    google: 'Continuer avec Google',
    microsoft: 'Continuer avec Microsoft',
    hasAccount: 'Vous avez déjà un compte?',
    signIn: 'Se connecter',
    backToHome: "Retour à l'accueil",
    panel: {
      tagline: "Rejoignez des milliers d'entrepreneurs",
      subtitle: "Créez des plans d'affaires professionnels avec l'aide de l'IA",
    },
    passwordRequirements: {
      title: 'Le mot de passe doit contenir:',
      length: 'Au moins 8 caractères',
      uppercase: 'Une lettre majuscule',
      lowercase: 'Une lettre minuscule',
      number: 'Un chiffre',
      special: 'Un caractère spécial',
    },
    errors: {
      firstNameRequired: 'Le prénom est requis',
      lastNameRequired: 'Le nom est requis',
      emailRequired: 'Le courriel est requis',
      emailInvalid: 'Veuillez entrer un courriel valide',
      passwordRequired: 'Le mot de passe est requis',
      passwordWeak: 'Le mot de passe ne répond pas aux exigences',
      confirmPasswordRequired: 'Veuillez confirmer votre mot de passe',
      passwordsMismatch: 'Les mots de passe ne correspondent pas',
      signupFailed: 'Échec de la création du compte. Veuillez réessayer.',
    },
  },
};

export default function SignupContent({ locale }: { locale: string }) {
  const router = useRouter();
  const t = content[locale as keyof typeof content] || content.en;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const homeUrl = locale === 'fr' ? '/fr' : '/';
  const loginUrl = locale === 'fr' ? '/fr/login' : '/login';
  const termsUrl = locale === 'fr' ? '/fr/terms' : '/terms';
  const privacyUrl = locale === 'fr' ? '/fr/privacy' : '/privacy';

  // Password strength checks
  const passwordChecks = {
    length: formData.password.length >= 8,
    uppercase: /[A-Z]/.test(formData.password),
    lowercase: /[a-z]/.test(formData.password),
    number: /\d/.test(formData.password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
  };

  const isPasswordStrong = Object.values(passwordChecks).every(Boolean);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t.errors.firstNameRequired;
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = t.errors.lastNameRequired;
    }
    if (!formData.email) {
      newErrors.email = t.errors.emailRequired;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t.errors.emailInvalid;
    }
    if (!formData.password) {
      newErrors.password = t.errors.passwordRequired;
    } else if (!isPasswordStrong) {
      newErrors.password = t.errors.passwordWeak;
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t.errors.confirmPasswordRequired;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t.errors.passwordsMismatch;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t.errors.signupFailed);
      }

      // Redirect to login with success message
      const successMessage = encodeURIComponent(
        locale === 'fr'
          ? 'Compte créé avec succès! Veuillez vous connecter.'
          : 'Account created successfully! Please sign in.'
      );
      router.push(`${loginUrl}?message=${successMessage}`);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t.errors.signupFailed;
      setServerError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'microsoft') => {
    window.location.href = `/api/auth/${provider}?redirect=/onboarding`;
  };

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

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-8">
        <div className="w-full max-w-md">
          <Link
            href={homeUrl}
            className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-[#FF6B00] mb-8 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm font-medium">{t.backToHome}</span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1A2B47] dark:text-white mb-2">
              {t.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">{t.subtitle}</p>
          </div>

          {serverError && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
              <p className="text-sm font-medium text-red-600 dark:text-red-400">
                {serverError}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Name Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t.firstName}
                </label>
                <input
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full h-11 px-4 rounded-lg border ${
                    errors.firstName ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]`}
                  placeholder={t.firstNamePlaceholder}
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  {t.lastName}
                </label>
                <input
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full h-11 px-4 rounded-lg border ${
                    errors.lastName ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]`}
                  placeholder={t.lastNamePlaceholder}
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t.email}
              </label>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full h-11 px-4 rounded-lg border ${
                  errors.email ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]`}
                placeholder={t.emailPlaceholder}
                autoComplete="email"
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t.password}
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full h-11 px-4 pr-12 rounded-lg border ${
                    errors.password ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]`}
                  placeholder={t.passwordPlaceholder}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}

              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">
                    {t.passwordRequirements.title}
                  </p>
                  <div className="grid grid-cols-2 gap-1">
                    {Object.entries(passwordChecks).map(([key, valid]) => (
                      <div key={key} className="flex items-center gap-1.5 text-xs">
                        {valid ? (
                          <Check size={14} className="text-green-500" />
                        ) : (
                          <X size={14} className="text-gray-400" />
                        )}
                        <span className={valid ? 'text-green-600' : 'text-gray-500'}>
                          {t.passwordRequirements[key as keyof typeof t.passwordRequirements]}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {t.confirmPassword}
              </label>
              <div className="relative">
                <input
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full h-11 px-4 pr-12 rounded-lg border ${
                    errors.confirmPassword ? 'border-red-300' : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00]`}
                  placeholder={t.confirmPasswordPlaceholder}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Terms */}
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {t.termsPrefix}{' '}
              <Link href={termsUrl} className="text-[#FF6B00] hover:underline">
                {t.terms}
              </Link>{' '}
              {t.and}{' '}
              <Link href={privacyUrl} className="text-[#FF6B00] hover:underline">
                {t.privacy}
              </Link>
              .
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#FF6B00] hover:bg-[#E55F00] text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? t.creating : t.createAccount}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white dark:bg-gray-900 px-4 text-gray-500">{t.divider}</span>
            </div>
          </div>

          {/* Social */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="w-full h-11 flex items-center justify-center gap-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              {t.google}
            </button>
            <button
              type="button"
              onClick={() => handleSocialLogin('microsoft')}
              className="w-full h-11 flex items-center justify-center gap-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
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

          <p className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            {t.hasAccount}{' '}
            <Link href={loginUrl} className="font-semibold text-[#FF6B00] hover:underline">
              {t.signIn}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
