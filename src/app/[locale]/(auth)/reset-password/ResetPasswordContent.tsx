'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle, AlertCircle, Check, X } from 'lucide-react';

const content = {
  en: {
    title: 'Reset your password',
    subtitle: 'Create a new secure password for your account.',
    newPassword: 'New Password',
    newPasswordPlaceholder: 'Enter your new password',
    confirmPassword: 'Confirm Password',
    confirmPasswordPlaceholder: 'Confirm your new password',
    resetPassword: 'Reset Password',
    resetting: 'Resetting...',
    backToLogin: 'Back to login',
    tokenError: 'Invalid or expired reset link.',
    tokenErrorAction: 'Request a new link',
    passwordStrength: {
      weak: 'Weak',
      fair: 'Fair',
      good: 'Good',
      strong: 'Strong',
    },
    requirements: {
      length: 'At least 8 characters',
      uppercase: 'One uppercase letter',
      lowercase: 'One lowercase letter',
      number: 'One number',
      special: 'One special character',
    },
    success: {
      title: 'Password reset successful!',
      message: 'Your password has been updated. You can now sign in with your new password.',
      redirecting: 'Redirecting to login in',
      seconds: 'seconds',
      second: 'second',
    },
    errors: {
      passwordRequired: 'Password is required',
      passwordWeak: 'Password is too weak',
      confirmRequired: 'Please confirm your password',
      passwordMismatch: 'Passwords do not match',
      serverError: 'Unable to reset password. Please try again.',
    },
    panel: {
      tagline: 'Create professional business plans in under 60 minutes',
      subtitle: 'AI-powered guidance for entrepreneurs, consultants, and organizations',
    },
  },
  fr: {
    title: 'Réinitialisez votre mot de passe',
    subtitle: 'Créez un nouveau mot de passe sécurisé pour votre compte.',
    newPassword: 'Nouveau mot de passe',
    newPasswordPlaceholder: 'Entrez votre nouveau mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    confirmPasswordPlaceholder: 'Confirmez votre nouveau mot de passe',
    resetPassword: 'Réinitialiser',
    resetting: 'Réinitialisation...',
    backToLogin: 'Retour à la connexion',
    tokenError: 'Lien de réinitialisation invalide ou expiré.',
    tokenErrorAction: 'Demander un nouveau lien',
    passwordStrength: {
      weak: 'Faible',
      fair: 'Passable',
      good: 'Bon',
      strong: 'Fort',
    },
    requirements: {
      length: 'Au moins 8 caractères',
      uppercase: 'Une lettre majuscule',
      lowercase: 'Une lettre minuscule',
      number: 'Un chiffre',
      special: 'Un caractère spécial',
    },
    success: {
      title: 'Mot de passe réinitialisé!',
      message: 'Votre mot de passe a été mis à jour. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.',
      redirecting: 'Redirection vers la connexion dans',
      seconds: 'secondes',
      second: 'seconde',
    },
    errors: {
      passwordRequired: 'Le mot de passe est requis',
      passwordWeak: 'Le mot de passe est trop faible',
      confirmRequired: 'Veuillez confirmer votre mot de passe',
      passwordMismatch: 'Les mots de passe ne correspondent pas',
      serverError: 'Impossible de réinitialiser le mot de passe. Veuillez réessayer.',
    },
    panel: {
      tagline: "Créez des plans d'affaires professionnels en moins de 60 minutes",
      subtitle: 'Accompagnement IA pour entrepreneurs, consultants et organisations',
    },
  },
};

interface PasswordRequirement {
  key: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { key: 'length', test: (p) => p.length >= 8 },
  { key: 'uppercase', test: (p) => /[A-Z]/.test(p) },
  { key: 'lowercase', test: (p) => /[a-z]/.test(p) },
  { key: 'number', test: (p) => /[0-9]/.test(p) },
  { key: 'special', test: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
];

function calculateStrength(password: string): 'weak' | 'fair' | 'good' | 'strong' {
  const passed = passwordRequirements.filter((req) => req.test(password)).length;
  if (passed <= 2) return 'weak';
  if (passed === 3) return 'fair';
  if (passed === 4) return 'good';
  return 'strong';
}

export default function ResetPasswordContent({ locale }: { locale: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = content[locale as keyof typeof content] || content.en;

  const token = searchParams.get('token') || '';

  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const loginUrl = locale === 'fr' ? '/fr/login' : '/login';
  const forgotPasswordUrl = locale === 'fr' ? '/fr/forgot-password' : '/forgot-password';
  const homeUrl = locale === 'fr' ? '/fr' : '/';

  const strength = formData.password ? calculateStrength(formData.password) : null;

  // Countdown and redirect on success
  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (success && countdown === 0) {
      router.push(loginUrl);
    }
  }, [success, countdown, router, loginUrl]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (serverError) setServerError('');
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.password) {
      newErrors.password = t.errors.passwordRequired;
    } else if (strength === 'weak') {
      newErrors.password = t.errors.passwordWeak;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t.errors.confirmRequired;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t.errors.passwordMismatch;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: formData.password,
        }),
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

  const strengthColors = {
    weak: 'bg-red-500',
    fair: 'bg-yellow-500',
    good: 'bg-blue-500',
    strong: 'bg-green-500',
  };

  const strengthWidths = {
    weak: 'w-1/4',
    fair: 'w-2/4',
    good: 'w-3/4',
    strong: 'w-full',
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

            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {t.success.message}
            </p>

            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t.success.redirecting} {countdown}{' '}
              {countdown !== 1 ? t.success.seconds : t.success.second}...
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

          {/* Token Error */}
          {!token && (
            <div className="mb-6 flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/20">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" />
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                {t.tokenError}{' '}
                <Link href={forgotPasswordUrl} className="underline text-[#FF6B00]">
                  {t.tokenErrorAction}
                </Link>
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
            {/* New Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                {t.newPassword}
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
                  placeholder={t.newPasswordPlaceholder}
                  autoComplete="new-password"
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

              {/* Password Strength Meter */}
              {formData.password && strength && (
                <div className="mt-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {locale === 'fr' ? 'Force du mot de passe' : 'Password strength'}
                    </span>
                    <span
                      className={`text-xs font-medium ${
                        strength === 'weak'
                          ? 'text-red-600'
                          : strength === 'fair'
                            ? 'text-yellow-600'
                            : strength === 'good'
                              ? 'text-blue-600'
                              : 'text-green-600'
                      }`}
                    >
                      {t.passwordStrength[strength]}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strengthColors[strength]} ${strengthWidths[strength]} transition-all duration-300`}
                    />
                  </div>

                  {/* Requirements */}
                  <ul className="mt-3 space-y-1">
                    {passwordRequirements.map((req) => {
                      const passed = req.test(formData.password);
                      return (
                        <li
                          key={req.key}
                          className={`flex items-center gap-2 text-xs ${
                            passed
                              ? 'text-green-600 dark:text-green-400'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                        >
                          {passed ? (
                            <Check size={14} className="flex-shrink-0" />
                          ) : (
                            <X size={14} className="flex-shrink-0" />
                          )}
                          {t.requirements[req.key as keyof typeof t.requirements]}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
              >
                {t.confirmPassword}
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full h-12 px-4 pr-12 rounded-lg border ${
                    errors.confirmPassword
                      ? 'border-red-300 dark:border-red-500'
                      : 'border-gray-300 dark:border-gray-600'
                  } bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-transparent transition-all`}
                  placeholder={t.confirmPasswordPlaceholder}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !token}
              className="w-full h-12 bg-[#FF6B00] hover:bg-[#E55F00] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                t.resetting
              ) : (
                <>
                  {t.resetPassword}
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
