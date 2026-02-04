import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { authService } from '../../lib/auth-service';
import { useCmsContent } from '../../hooks/useCmsContent';
import SEO from '../../components/SEO';
import { getCanonicalUrl } from '../../utils/seo';
import { AuthLayout } from '../../components/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  validateForgotPasswordForm,
  getFieldError,
  type ForgotPasswordFormData,
  type ValidationError,
} from '../../utils/auth-validation';

export default function ForgotPasswordPage() {
  const { getContent: cms } = useCmsContent('auth');

  const [formData, setFormData] = useState<ForgotPasswordFormData>({
    email: '',
  });

  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

    const validationErrors = validateForgotPasswordForm(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      await authService.forgotPassword(formData.email);
      setSuccess(true);
    } catch (err: any) {
      setServerError(err.message || 'Failed to send password reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (success) {
    return (
      <AuthLayout variant="centered">
        <SEO
          title={cms('auth.forgot_password.success_title', 'forgotPassword.success.title') + ' | Sqordia'}
          description={cms('auth.forgot_password.success_instructions', 'forgotPassword.success.instructions')}
          url={getCanonicalUrl('/forgot-password')}
        />

        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/20">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" aria-hidden="true" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            {cms('auth.forgot_password.success_title', 'forgotPassword.success.title')}
          </h1>
          <p className="mb-6 text-muted-foreground">
            {cms('auth.forgot_password.success_message', 'forgotPassword.success.message')}{' '}
            <strong className="text-foreground">{formData.email}</strong>.
            {' '}{cms('auth.forgot_password.success_instructions', 'forgotPassword.success.instructions')}
          </p>

          <div className="space-y-4">
            <Button variant="brand" size="lg" className="w-full" asChild>
              <Link to="/login">
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {cms('auth.forgot_password.success_back_to_login', 'forgotPassword.success.backToLogin')}
              </Link>
            </Button>

            <p className="text-sm text-muted-foreground">
              {cms('auth.forgot_password.success_no_email', 'forgotPassword.success.noEmail')}{' '}
              <button
                onClick={() => setSuccess(false)}
                className="font-semibold text-momentum-orange transition-colors hover:underline"
              >
                {cms('auth.forgot_password.success_try_again', 'forgotPassword.success.tryAgain')}
              </button>
            </p>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout variant="centered">
      <SEO
        title={cms('auth.forgot_password.title', 'forgotPassword.title') + ' | Sqordia'}
        description={cms('auth.forgot_password.subtitle', 'forgotPassword.subtitle')}
        url={getCanonicalUrl('/forgot-password')}
      />

      {/* Title */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-3xl font-bold font-heading text-foreground">
          {cms('auth.forgot_password.title', 'forgotPassword.title')}
        </h1>
        <p className="text-base text-muted-foreground">
          {cms('auth.forgot_password.subtitle', 'forgotPassword.subtitle')}
        </p>
      </div>

      {/* Server Error */}
      {serverError && (
        <div
          className="mb-6 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20"
          role="alert"
        >
          <p className="text-sm font-medium text-red-600 dark:text-red-400">
            {serverError}
          </p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Email */}
        <div>
          <Label htmlFor="email" className="mb-2 block text-sm font-semibold">
            {cms('auth.forgot_password.email_label', 'forgotPassword.email')}
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
              placeholder={cms('auth.forgot_password.email_placeholder', 'forgotPassword.email.placeholder')}
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

        {/* Submit Button */}
        <Button
          type="submit"
          variant="brand"
          size="lg"
          disabled={loading}
          className="group w-full min-h-[44px]"
        >
          {loading ? (
            <span>{cms('auth.forgot_password.sending', 'forgotPassword.sending')}</span>
          ) : (
            <>
              <span>{cms('auth.forgot_password.button', 'forgotPassword.button')}</span>
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
          {cms('auth.forgot_password.back_to_login', 'forgotPassword.backToLogin')}
        </Link>
      </div>
    </AuthLayout>
  );
}
