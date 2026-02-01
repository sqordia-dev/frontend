import { useState, FormEvent } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '../../lib/auth-service';
import { signInWithGoogle } from '../../lib/google-auth';
import { useTheme } from '../../contexts/ThemeContext';
import SEO from '../../components/SEO';
import { getCanonicalUrl } from '../../utils/seo';
import { AuthLayout } from '../../components/auth';
import {
  PasswordInput,
  SocialLoginButtons,
  Divider,
} from '../../components/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  validateLoginForm,
  getFieldError,
  type LoginFormData,
  type ValidationError,
} from '../../utils/auth-validation';

interface LocationState {
  message?: string;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTheme();

  // Check for success message from registration
  const successMessage = (location.state as LocationState)?.message;

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear field error when user starts typing
    setErrors(prev => prev.filter(err => err.field !== name));
    // Clear server error when user modifies form
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');

    // Validate form
    const validationErrors = validateLoginForm(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
      });

      // Check if user has persona set - redirect to onboarding if not
      const userPersona = response.user?.persona || localStorage.getItem('userPersona');
      if (!userPersona) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setServerError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setServerError('');
    try {
      const googleUser = await signInWithGoogle();
      const tokens = {
        idToken: googleUser.idToken,
        accessToken: googleUser.accessToken,
      };
      const response = await authService.googleAuth(tokens);

      const userPersona = response.user?.persona || localStorage.getItem('userPersona');
      if (!userPersona) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setServerError(err.message || 'Google sign-in failed. Please try again.');
    }
  };

  const handleMicrosoftSignIn = async () => {
    setServerError('');
    try {
      await authService.signInWithMicrosoft();
      navigate('/onboarding');
    } catch (err: any) {
      setServerError(err.message || 'Microsoft sign-in failed. Please try again.');
    }
  };

  return (
    <AuthLayout variant="centered">
      <SEO
        title={t('login.title') || 'Login | Sqordia'}
        description={t('login.subtitle') || 'Sign in to your Sqordia account'}
        url={getCanonicalUrl('/login')}
      />

      {/* Title */}
      <div className="mb-8 text-center animate-fade-in-up">
        <h1 className="mb-2 text-3xl font-bold font-heading text-foreground">
          {t('login.title')}
        </h1>
        <p className="text-base text-muted-foreground">
          {t('login.subtitle')}
        </p>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div
          className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20"
          role="status"
        >
          <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" aria-hidden="true" />
          <p className="text-sm font-medium text-green-800 dark:text-green-300">
            {successMessage}
          </p>
        </div>
      )}

      {/* Server Error */}
      {serverError && (
        <div
          className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20"
          role="alert"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            {serverError}
          </p>
        </div>
      )}

      {/* Social Login Buttons */}
      <div className="animate-fade-in-up animation-delay-100">
        <SocialLoginButtons
          onGoogleClick={handleGoogleSignIn}
          onMicrosoftClick={handleMicrosoftSignIn}
          disabled={loading}
          mode="signin"
          className="mb-6"
        />
      </div>

      {/* Divider */}
      <div className="animate-fade-in-up animation-delay-200">
        <Divider text={t('login.divider')} className="mb-6" />
      </div>

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in-up animation-delay-300" noValidate>
        {/* Email */}
        <div>
          <Label htmlFor="email" className="mb-2 block text-sm font-semibold">
            {t('login.email')}
          </Label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Mail className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
              className={`h-12 pl-12 ${getFieldError(errors, 'email') ? 'border-red-300 focus-visible:ring-red-500 dark:border-red-500' : ''}`}
              placeholder={t('login.email.placeholder')}
              aria-invalid={!!getFieldError(errors, 'email')}
              aria-describedby={getFieldError(errors, 'email') ? 'email-error' : undefined}
            />
          </div>
          {getFieldError(errors, 'email') && (
            <p id="email-error" className="mt-1.5 text-xs text-red-600 dark:text-red-400" role="alert">
              {getFieldError(errors, 'email')}
            </p>
          )}
        </div>

        {/* Password */}
        <PasswordInput
          label={t('login.password')}
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          autoComplete="current-password"
          placeholder={t('login.password.placeholder')}
          error={getFieldError(errors, 'password')}
        />

        {/* Remember Me / Forgot Password */}
        <div className="flex items-center justify-between text-sm">
          <label className="flex cursor-pointer items-center">
            <input
              type="checkbox"
              name="rememberMe"
              checked={formData.rememberMe}
              onChange={handleChange}
              className="h-4 w-4 rounded border-gray-300 text-momentum-orange focus:ring-2 focus:ring-momentum-orange focus:ring-offset-0"
            />
            <span className="ml-2.5 text-muted-foreground">
              {t('login.remember')}
            </span>
          </label>
          <Link
            to="/forgot-password"
            className="font-semibold text-momentum-orange transition-colors hover:underline"
          >
            {t('login.forgot')}
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="brand"
          size="lg"
          disabled={loading}
          className="group w-full min-h-[44px]"
        >
          {loading ? (
            <span>{t('login.signing')}</span>
          ) : (
            <>
              <span>{t('login.button')}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </>
          )}
        </Button>
      </form>

      {/* Sign Up Link */}
      <div className="mt-8 border-t border-border pt-6 animate-fade-in-up animation-delay-400">
        <p className="text-center text-sm text-muted-foreground">
          {t('login.noaccount')}{' '}
          <Link
            to="/signup"
            className="font-semibold text-momentum-orange transition-colors hover:underline"
          >
            {t('login.create')}
          </Link>
        </p>
      </div>

      {/* Back to Home */}
      <p className="mt-6 text-center text-sm animate-fade-in-up animation-delay-500">
        <Link
          to="/"
          className="text-muted-foreground transition-colors hover:text-foreground hover:underline"
        >
          {t('login.back')}
        </Link>
      </p>
    </AuthLayout>
  );
}
