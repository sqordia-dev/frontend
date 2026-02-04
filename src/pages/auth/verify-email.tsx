import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, Mail, RefreshCw } from 'lucide-react';
import { authService } from '../../lib/auth-service';
import { useCmsContent } from '../../hooks/useCmsContent';
import SEO from '../../components/SEO';
import { getCanonicalUrl } from '../../utils/seo';
import { AuthLayout } from '../../components/auth';
import { Button } from '@/components/ui/button';

type VerificationStatus = 'loading' | 'success' | 'error' | 'resend';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { getContent: cms } = useCmsContent('auth');

  const token = searchParams.get('token');

  const [status, setStatus] = useState<VerificationStatus>(token ? 'loading' : 'resend');
  const [error, setError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [countdown, setCountdown] = useState(5);

  // Verify email when token is present
  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  // Countdown and redirect on success
  useEffect(() => {
    if (status === 'success' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (status === 'success' && countdown === 0) {
      navigate('/login', { state: { message: cms('auth.verify_email.success_title', 'verifyEmail.success.title') } });
    }
  }, [status, countdown, navigate]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      await authService.verifyEmail(verificationToken);
      setStatus('success');
    } catch (err: any) {
      setError(err.message || 'Email verification failed. The link may have expired.');
      setStatus('error');
    }
  };

  const handleResendEmail = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    setError('');

    try {
      await authService.sendVerificationEmail();
      setResendSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  // Loading state
  if (status === 'loading') {
    return (
      <AuthLayout variant="centered">
        <SEO
          title={cms('auth.verify_email.loading_title', 'verifyEmail.loading.title') + ' | Sqordia'}
          description={cms('auth.verify_email.loading_message', 'verifyEmail.loading.message')}
          url={getCanonicalUrl('/verify-email')}
          noindex={true}
          nofollow={true}
        />

        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-muted border-t-momentum-orange" />
          <h1 className="text-xl font-semibold text-foreground">
            {cms('auth.verify_email.loading_title', 'verifyEmail.loading.title')}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {cms('auth.verify_email.loading_message', 'verifyEmail.loading.message')}
          </p>
        </div>
      </AuthLayout>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <AuthLayout variant="centered">
        <SEO
          title={cms('auth.verify_email.success_title', 'verifyEmail.success.title') + ' | Sqordia'}
          description={cms('auth.verify_email.success_message', 'verifyEmail.success.message')}
          url={getCanonicalUrl('/verify-email')}
          noindex={true}
          nofollow={true}
        />

        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/20">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" aria-hidden="true" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">
            {cms('auth.verify_email.success_title', 'verifyEmail.success.title')}
          </h1>
          <p className="mb-6 text-muted-foreground">
            {cms('auth.verify_email.success_message', 'verifyEmail.success.message')}
          </p>
          <p className="text-sm text-muted-foreground">
            {cms('auth.verify_email.success_redirecting', 'verifyEmail.success.redirecting')} {countdown}{' '}
            {countdown !== 1 ? cms('auth.verify_email.success_seconds', 'verifyEmail.success.seconds') : cms('auth.verify_email.success_second', 'verifyEmail.success.second')}...
          </p>
          <Link
            to="/login"
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-momentum-orange transition-colors hover:underline"
          >
            {cms('auth.verify_email.login_link', 'verifyEmail.success.loginLink')}
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // Error or Resend state
  return (
    <AuthLayout variant="centered">
      <SEO
        title={(status === 'error' ? cms('auth.verify_email.error_title', 'verifyEmail.error.title') : cms('auth.verify_email.resend_title', 'verifyEmail.resend.title')) + ' | Sqordia'}
        description={status === 'error' ? cms('auth.verify_email.error_default_message', 'verifyEmail.error.defaultMessage') : cms('auth.verify_email.resend_message', 'verifyEmail.resend.message')}
        url={getCanonicalUrl('/verify-email')}
        noindex={true}
        nofollow={true}
      />

      <div className="text-center">
        {status === 'error' ? (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-950/20">
              <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" aria-hidden="true" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-foreground">
              {cms('auth.verify_email.error_title', 'verifyEmail.error.title')}
            </h1>
            <p className="mb-6 text-muted-foreground">
              {error || cms('auth.verify_email.error_default_message', 'verifyEmail.error.defaultMessage')}
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-50 dark:bg-orange-950/20">
              <Mail className="h-8 w-8 text-momentum-orange" aria-hidden="true" />
            </div>
            <h1 className="mb-2 text-2xl font-bold text-foreground">
              {cms('auth.verify_email.resend_title', 'verifyEmail.resend.title')}
            </h1>
            <p className="mb-6 text-muted-foreground">
              {cms('auth.verify_email.resend_message', 'verifyEmail.resend.message')}
            </p>
          </>
        )}

        {/* Resend Success Message */}
        {resendSuccess && (
          <div
            className="mb-6 flex items-center justify-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950/20"
            role="status"
          >
            <CheckCircle className="h-5 w-5 flex-shrink-0 text-green-600 dark:text-green-400" aria-hidden="true" />
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              {cms('auth.verify_email.resend_success', 'verifyEmail.resend.success')}
            </p>
          </div>
        )}

        {/* Error Message (for resend failures) */}
        {status === 'resend' && error && (
          <div
            className="mb-6 flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-950/20"
            role="alert"
          >
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600 dark:text-red-400" aria-hidden="true" />
            <p className="text-sm font-medium text-red-600 dark:text-red-400">
              {error}
            </p>
          </div>
        )}

        {/* Resend Button */}
        <Button
          variant="brand"
          size="lg"
          onClick={handleResendEmail}
          disabled={resendLoading}
          className="w-full"
        >
          {resendLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" aria-hidden="true" />
              <span>{cms('auth.verify_email.resend_sending', 'verifyEmail.resend.sending')}</span>
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              <span>{cms('auth.verify_email.resend_button', 'verifyEmail.resend.button')}</span>
            </>
          )}
        </Button>

        {/* Login Link */}
        <div className="mt-6 border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            {cms('auth.verify_email.already_verified', 'verifyEmail.alreadyVerified')}{' '}
            <Link
              to="/login"
              className="font-semibold text-momentum-orange transition-colors hover:underline"
            >
              {cms('auth.verify_email.login_link', 'verifyEmail.loginLink')}
            </Link>
          </p>
        </div>

        {/* Help Text */}
        <p className="mt-4 text-sm text-muted-foreground">
          {cms('auth.verify_email.help_text', 'verifyEmail.helpText')}{' '}
          <Link
            to="/support"
            className="font-medium text-momentum-orange transition-colors hover:underline"
          >
            {cms('auth.verify_email.contact_support', 'verifyEmail.contactSupport')}
          </Link>.
        </p>
      </div>
    </AuthLayout>
  );
}
