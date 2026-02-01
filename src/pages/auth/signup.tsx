import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, User, Building2, ArrowRight, AlertCircle } from 'lucide-react';
import { authService } from '../../lib/auth-service';
import { signInWithGoogle } from '../../lib/google-auth';
import { useTheme } from '../../contexts/ThemeContext';
import SEO from '../../components/SEO';
import { getCanonicalUrl } from '../../utils/seo';
import {
  AuthLayout,
  PasswordInput,
  PasswordStrengthMeter,
  SocialLoginButtons,
  Divider,
} from '../../components/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  validateSignupForm,
  getFieldError,
  type SignupFormData,
  type ValidationError,
} from '../../utils/auth-validation';

export default function SignupPage() {
  const navigate = useNavigate();
  const { t } = useTheme();

  const [formData, setFormData] = useState<SignupFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: '',
    acceptTerms: false,
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
    setErrors(prev => prev.filter(err => err.field !== name));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');

    const validationErrors = validateSignupForm(formData);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        organizationName: formData.organizationName || undefined,
      });
      navigate('/login', { state: { message: t('register.success') } });
    } catch (err: any) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setServerError('');
    try {
      const googleUser = await signInWithGoogle();
      const tokens = {
        idToken: googleUser.idToken,
        accessToken: googleUser.accessToken,
      };
      await authService.googleAuth(tokens);
      navigate('/onboarding');
    } catch (err: any) {
      setServerError(err.message || 'Google sign-up failed. Please try again.');
    }
  };

  const handleMicrosoftSignUp = async () => {
    setServerError('');
    try {
      await authService.signInWithMicrosoft();
      navigate('/onboarding');
    } catch (err: any) {
      setServerError(err.message || 'Microsoft sign-up failed. Please try again.');
    }
  };

  return (
    <AuthLayout
      variant="split"
      leftPanel={{
        headlineKey: 'register.panel.subtitle',
        subheadlineKey: 'register.panel.tagline',
        testimonial: {
          quoteKey: 'register.panel.testimonial.quote',
          authorKey: 'register.panel.testimonial.author',
          roleKey: 'register.panel.testimonial.role',
          rating: 5,
        },
        showTrustIndicators: true,
      }}
    >
      <SEO
        title={t('register.title') + ' | Sqordia'}
        description={t('register.description')}
        url={getCanonicalUrl('/signup')}
      />

      {/* Title */}
      <div className="mb-8 animate-fade-in-up">
        <h2 className="mb-2 text-3xl font-bold font-heading text-foreground">
          {t('register.title')}
        </h2>
        <p className="text-base text-muted-foreground">
          {t('register.subtitle')}
        </p>
      </div>

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
          onGoogleClick={handleGoogleSignUp}
          onMicrosoftClick={handleMicrosoftSignUp}
          disabled={loading}
          mode="signup"
          className="mb-6"
        />
      </div>

      {/* Divider */}
      <div className="animate-fade-in-up animation-delay-200">
        <Divider text={t('register.divider')} className="mb-6" />
      </div>

      {/* Signup Form */}
      <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in-up animation-delay-300" noValidate>
        {/* Name fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName" className="mb-2 block text-sm font-semibold">
              {t('register.firstname')}
            </Label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </div>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                required
                autoComplete="given-name"
                className={`h-12 pl-12 ${getFieldError(errors, 'firstName') ? 'border-red-300 focus-visible:ring-red-500 dark:border-red-500' : ''}`}
                placeholder={t('register.firstname.placeholder')}
                aria-invalid={!!getFieldError(errors, 'firstName')}
                aria-describedby={getFieldError(errors, 'firstName') ? 'firstName-error' : undefined}
              />
            </div>
            {getFieldError(errors, 'firstName') && (
              <p id="firstName-error" className="mt-1.5 text-xs text-red-600 dark:text-red-400" role="alert">
                {getFieldError(errors, 'firstName')}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="lastName" className="mb-2 block text-sm font-semibold">
              {t('register.lastname')}
            </Label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <User className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </div>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                required
                autoComplete="family-name"
                className={`h-12 pl-12 ${getFieldError(errors, 'lastName') ? 'border-red-300 focus-visible:ring-red-500 dark:border-red-500' : ''}`}
                placeholder={t('register.lastname.placeholder')}
                aria-invalid={!!getFieldError(errors, 'lastName')}
                aria-describedby={getFieldError(errors, 'lastName') ? 'lastName-error' : undefined}
              />
            </div>
            {getFieldError(errors, 'lastName') && (
              <p id="lastName-error" className="mt-1.5 text-xs text-red-600 dark:text-red-400" role="alert">
                {getFieldError(errors, 'lastName')}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" className="mb-2 block text-sm font-semibold">
            {t('register.email')}
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
              placeholder={t('register.email.placeholder')}
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

        {/* Organization (Optional) */}
        <div>
          <Label htmlFor="organizationName" className="mb-2 block text-sm font-semibold">
            {t('register.organization')}{' '}
            <span className="font-normal text-muted-foreground">{t('register.optional')}</span>
          </Label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <Building2 className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
            </div>
            <Input
              id="organizationName"
              name="organizationName"
              type="text"
              value={formData.organizationName}
              onChange={handleChange}
              autoComplete="organization"
              className="h-12 pl-12"
              placeholder={t('register.organization.placeholder')}
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <PasswordInput
            label={t('register.password')}
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="new-password"
            placeholder={t('register.password.placeholder')}
            error={getFieldError(errors, 'password')}
          />
          {formData.password && (
            <PasswordStrengthMeter
              password={formData.password}
              showLabel={true}
              className="mt-2"
            />
          )}
        </div>

        {/* Confirm Password */}
        <PasswordInput
          label={t('register.confirm')}
          name="confirmPassword"
          value={formData.confirmPassword || ''}
          onChange={handleChange}
          required
          autoComplete="new-password"
          placeholder={t('register.confirm.placeholder')}
          error={getFieldError(errors, 'confirmPassword')}
        />

        {/* Terms Checkbox */}
        <div className="pt-1">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleChange}
              required
              className="mt-1 h-4 w-4 rounded border-gray-300 text-momentum-orange focus:ring-2 focus:ring-momentum-orange focus:ring-offset-0"
              aria-describedby={getFieldError(errors, 'acceptTerms') ? 'terms-error' : undefined}
            />
            <span className="text-sm leading-relaxed text-muted-foreground">
              {t('register.terms')}{' '}
              <Link
                to="/terms"
                className="font-semibold text-momentum-orange transition-colors hover:underline"
              >
                {t('register.termslink')}
              </Link>{' '}
              {t('register.and')}{' '}
              <Link
                to="/privacy"
                className="font-semibold text-momentum-orange transition-colors hover:underline"
              >
                {t('register.privacy')}
              </Link>
            </span>
          </label>
          {getFieldError(errors, 'acceptTerms') && (
            <p id="terms-error" className="mt-1.5 text-xs text-red-600 dark:text-red-400" role="alert">
              {getFieldError(errors, 'acceptTerms')}
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
            <span>{t('register.creating')}</span>
          ) : (
            <>
              <span>{t('register.button')}</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </>
          )}
        </Button>
      </form>

      {/* Login Link */}
      <div className="mt-8 border-t border-border pt-6 animate-fade-in-up animation-delay-400">
        <p className="text-center text-sm text-muted-foreground">
          {t('register.hasaccount')}{' '}
          <Link
            to="/login"
            className="font-semibold text-momentum-orange transition-colors hover:underline"
          >
            {t('register.signin')}
          </Link>
        </p>
      </div>

      {/* Back to Home */}
      <p className="mt-6 text-center text-sm animate-fade-in-up animation-delay-500">
        <Link
          to="/"
          className="text-muted-foreground transition-colors hover:text-foreground hover:underline"
        >
          {t('register.back')}
        </Link>
      </p>
    </AuthLayout>
  );
}
