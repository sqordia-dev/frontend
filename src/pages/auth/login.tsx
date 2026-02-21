import { useState, FormEvent } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { authService } from '../../lib/auth-service';
import { signInWithGoogle } from '../../lib/google-auth';
import { useTheme } from '../../contexts/ThemeContext';
import { useCmsContent } from '../../hooks/useCmsContent';
import { getUserFriendlyError } from '../../utils/error-messages';
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
  const { getContent: cms } = useCmsContent('auth');

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
      setServerError(getUserFriendlyError(err, 'login'));
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
      setServerError(getUserFriendlyError(err, 'login'));
    }
  };

  const handleMicrosoftSignIn = async () => {
    setServerError('');
    try {
      await authService.signInWithMicrosoft();
      navigate('/onboarding');
    } catch (err: any) {
      setServerError(getUserFriendlyError(err, 'login'));
    }
  };

  return (
    <AuthLayout
      variant="split"
      illustrationPanel={{
        tagline: cms('auth.login.panel_tagline', 'login.panel.tagline'),
        subtitle: cms('auth.login.panel_subtitle', 'login.panel.subtitle'),
      }}
    >
      <SEO
        title={cms('auth.login.title', 'login.title') || 'Login | Sqordia'}
        description={cms('auth.login.subtitle', 'login.subtitle') || 'Sign in to your Sqordia account'}
        url={getCanonicalUrl('/login')}
      />

      {/* Title */}
      <div className="mb-8 animate-fade-in-up">
        <h1 className="mb-2 text-3xl font-bold font-heading text-foreground">
          {cms('auth.login.title', 'login.title')}
        </h1>
        <p className="text-base text-muted-foreground">
          {cms('auth.login.subtitle', 'login.subtitle')}
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

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in-up animation-delay-100" noValidate>
        {/* Email */}
        <div>
          <Label htmlFor="email" className="mb-2 block text-sm font-semibold">
            {cms('auth.login.email_label', 'login.email')}
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
            className={`h-12 ${getFieldError(errors, 'email') ? 'border-red-300 focus-visible:ring-red-500 dark:border-red-500' : ''}`}
            placeholder={cms('auth.login.email_placeholder', 'login.email.placeholder')}
            aria-invalid={!!getFieldError(errors, 'email')}
            aria-describedby={getFieldError(errors, 'email') ? 'email-error' : undefined}
          />
          {getFieldError(errors, 'email') && (
            <p id="email-error" className="mt-1.5 text-xs text-red-600 dark:text-red-400" role="alert">
              {getFieldError(errors, 'email')}
            </p>
          )}
        </div>

        {/* Password */}
        <PasswordInput
          label={cms('auth.login.password_label', 'login.password')}
          name="password"
          value={formData.password}
          onChange={handleChange}
          required
          showIcon={false}
          autoComplete="current-password"
          placeholder={cms('auth.login.password_placeholder', 'login.password.placeholder')}
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
              {cms('auth.login.remember', 'login.remember')}
            </span>
          </label>
          <Link
            to="/forgot-password"
            className="font-semibold text-momentum-orange transition-colors hover:underline"
          >
            {cms('auth.login.forgot_password', 'login.forgot')}
          </Link>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          variant="brand"
          size="lg"
          disabled={loading}
          className="w-full min-h-[44px]"
        >
          {loading ? cms('auth.login.signing_in', 'login.signing') : cms('auth.login.button', 'login.button')}
        </Button>
      </form>

      {/* Divider */}
      <div className="animate-fade-in-up animation-delay-200">
        <Divider text={cms('auth.login.divider', 'login.divider')} className="my-6" />
      </div>

      {/* Social Login Buttons */}
      <div className="animate-fade-in-up animation-delay-300">
        <SocialLoginButtons
          onGoogleClick={handleGoogleSignIn}
          onMicrosoftClick={handleMicrosoftSignIn}
          disabled={loading}
          mode="signin"
        />
      </div>

      {/* Sign Up Link */}
      <div className="mt-8 pt-6 animate-fade-in-up animation-delay-400">
        <p className="text-center text-sm text-muted-foreground">
          {cms('auth.login.no_account', 'login.noaccount')}{' '}
          <Link
            to="/signup"
            className="font-semibold text-momentum-orange transition-colors hover:underline"
          >
            {cms('auth.login.create_account', 'login.create')}
          </Link>
        </p>
      </div>

      {/* Back to Home */}
      <p className="mt-4 text-center text-sm animate-fade-in-up animation-delay-400">
        <Link
          to="/"
          className="text-muted-foreground transition-colors hover:text-foreground hover:underline"
        >
          {cms('auth.login.back_to_home', 'login.back')}
        </Link>
      </p>
    </AuthLayout>
  );
}
