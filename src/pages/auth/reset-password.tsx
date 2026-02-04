import { useState, useEffect, FormEvent } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { authService } from '../../lib/auth-service';
import { useCmsContent } from '../../hooks/useCmsContent';
import SEO from '../../components/SEO';
import { getCanonicalUrl } from '../../utils/seo';
import { AuthLayout, PasswordInput, PasswordStrengthMeter } from '../../components/auth';
import { Button } from '@/components/ui/button';
import {
  validateResetPasswordForm,
  getFieldError,
  type ResetPasswordFormData,
  type ValidationError,
} from '../../utils/auth-validation';
import { calculatePasswordStrength } from '../../utils/password-strength';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getContent: cms } = useCmsContent('auth');

  const token = searchParams.get('token') || '';

  const [formData, setFormData] = useState<ResetPasswordFormData>({
    password: '',
    confirmPassword: '',
    token,
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  // Update token in form data when URL changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, token }));
  }, [token]);

  // Countdown and redirect on success
  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (success && countdown === 0) {
      navigate('/login', { state: { message: cms('auth.reset_password.success_title', 'resetPassword.success.title') } });
    }
  }, [success, countdown, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setErrors(prev => prev.filter(err => err.field !== name));
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');

    const validationErrors = validateResetPasswordForm(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Check password strength
    const strengthResult = calculatePasswordStrength(formData.password);
    if (strengthResult.strength === 'weak') {
      setErrors([{ field: 'password', message: 'Password is too weak. Please choose a stronger password.' }]);
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword(token, formData.password);
      setSuccess(true);
    } catch (err: any) {
      setServerError(err.message || 'Failed to reset password. The link may have expired. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <AuthLayout variant="centered">
        <SEO
          title={cms('auth.reset_password.success_title', 'resetPassword.success.title') + ' | Sqordia'}
          description={cms('auth.reset_password.success_message', 'resetPassword.success.message')}
          url={getCanonicalUrl('/reset-password')}
          noindex={true}
          nofollow={true}
        />

        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/20">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" aria-hidden="true" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            {cms('auth.reset_password.success_title', 'resetPassword.success.title')}
          </h1>
          <p className="mb-6 text-muted-foreground">
            {cms('auth.reset_password.success_message', 'resetPassword.success.message')}
          </p>
          <p className="text-sm text-muted-foreground">
            {cms('auth.reset_password.success_redirecting', 'resetPassword.success.redirecting')} {countdown}{' '}
            {countdown !== 1 ? cms('auth.reset_password.success_seconds', 'resetPassword.success.seconds') : cms('auth.reset_password.success_second', 'resetPassword.success.second')}...
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout variant="centered">
      <SEO
        title={cms('auth.reset_password.title', 'resetPassword.title') + ' | Sqordia'}
        description={cms('auth.reset_password.subtitle', 'resetPassword.subtitle')}
        url={getCanonicalUrl('/reset-password')}
        noindex={true}
        nofollow={true}
      />

      {/* Title */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold font-heading text-foreground">
          {cms('auth.reset_password.title', 'resetPassword.title')}
        </h1>
        <p className="text-base text-muted-foreground">
          {cms('auth.reset_password.subtitle', 'resetPassword.subtitle')}
        </p>
      </div>

      {/* Token Error */}
      {!token && (
        <div
          className="mb-6 flex items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-950/20"
          role="alert"
        >
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600 dark:text-yellow-400" aria-hidden="true" />
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
            {cms('auth.reset_password.token_error', 'resetPassword.tokenError')}{' '}
            <Link to="/forgot-password" className="underline text-momentum-orange">
              {cms('auth.reset_password.token_error_request_new', 'resetPassword.tokenError.requestNew')}
            </Link>.
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* New Password */}
        <div>
          <PasswordInput
            label={cms('auth.reset_password.new_password_label', 'resetPassword.newPassword')}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
            placeholder={cms('auth.reset_password.new_password_placeholder', 'resetPassword.newPassword.placeholder')}
            error={getFieldError(errors, 'password')}
          />
          {formData.password && (
            <PasswordStrengthMeter
              password={formData.password}
              showLabel={true}
              showRequirements={true}
              className="mt-2"
            />
          )}
        </div>

        {/* Confirm Password */}
        <PasswordInput
          label={cms('auth.reset_password.confirm_password_label', 'resetPassword.confirmPassword')}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
          autoComplete="new-password"
          placeholder={cms('auth.reset_password.confirm_password_placeholder', 'resetPassword.confirmPassword.placeholder')}
          error={getFieldError(errors, 'confirmPassword')}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="brand"
          size="lg"
          disabled={loading || !token}
          className="group w-full min-h-[44px]"
        >
          {loading ? (
            <span>{cms('auth.reset_password.resetting', 'resetPassword.resetting')}</span>
          ) : (
            <>
              <span>{cms('auth.reset_password.button', 'resetPassword.button')}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </>
          )}
        </Button>
      </form>

      {/* Back to Login */}
      <div className="mt-8 text-center">
        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-sm font-medium text-momentum-orange transition-colors hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          {cms('auth.reset_password.back_to_login', 'resetPassword.backToLogin')}
        </Link>
      </div>
    </AuthLayout>
  );
}
