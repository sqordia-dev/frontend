import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../lib/auth-service';
import { signInWithGoogle } from '../lib/google-auth';
import { Mail, Lock, User, Building2, ArrowRight, Eye, EyeOff, CheckCircle, Brain, Clock, Zap, Shield, Star, Users } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import SEO from '../components/SEO';
import { getCanonicalUrl } from '../utils/seo';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { t } = useTheme();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    organizationName: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const passwordRequirements = [
    { label: 'At least 8 characters', met: formData.password.length >= 8 },
    { label: 'Contains uppercase letter', met: /[A-Z]/.test(formData.password) },
    { label: 'Contains lowercase letter', met: /[a-z]/.test(formData.password) },
    { label: 'Contains number', met: /\d/.test(formData.password) }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await authService.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        organizationName: formData.organizationName || undefined
      });
      navigate('/login', { state: { message: 'Registration successful! Please sign in.' } });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      const googleUser = await signInWithGoogle();
      const tokens = {
        idToken: googleUser.idToken,
        accessToken: googleUser.accessToken
      };
      await authService.googleAuth(tokens);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google sign-up failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen flex">
      <SEO
        title={t('register.title') || 'Sign Up | Sqordia'}
        description={t('register.description') || 'Create your free Sqordia account and start building professional business plans in under 60 minutes'}
        url={getCanonicalUrl('/register')}
      />
      {/* Left Panel - Branding */}
      <div 
        className="hidden lg:flex lg:w-[40%] flex-col justify-between p-12"
        style={{ backgroundColor: '#1A2B47' }}
      >
        <div>
          {/* Logo */}
          <Link to="/" className="inline-flex items-center gap-3 mb-12 group">
            <div 
              className="p-3 rounded-xl transition-transform group-hover:scale-105"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
            >
              <Brain className="text-white w-7 h-7" />
            </div>
            <span className="text-2xl font-bold font-heading text-white">
              Sqordia
            </span>
          </Link>

          {/* Tagline */}
          <h2 className="text-4xl font-bold font-heading text-white mb-4 leading-tight">
            {t('register.panel.tagline')}
          </h2>
          <p className="text-lg mb-12" style={{ color: '#D1D5DB' }}>
            {t('register.panel.subtitle')}
          </p>

          {/* Key Benefits */}
          <div className="space-y-6 mb-12">
            <div className="flex items-start gap-4">
              <div 
                className="p-2.5 rounded-lg flex-shrink-0"
                style={{ backgroundColor: 'rgba(255, 107, 0, 0.15)' }}
              >
                <Clock className="w-5 h-5" style={{ color: '#FF6B00' }} />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">{t('register.panel.benefit1.title')}</h3>
                <p className="text-sm" style={{ color: '#9CA3AF' }}>
                  {t('register.panel.benefit1.desc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div 
                className="p-2.5 rounded-lg flex-shrink-0"
                style={{ backgroundColor: 'rgba(255, 107, 0, 0.15)' }}
              >
                <Zap className="w-5 h-5" style={{ color: '#FF6B00' }} />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">{t('register.panel.benefit2.title')}</h3>
                <p className="text-sm" style={{ color: '#9CA3AF' }}>
                  {t('register.panel.benefit2.desc')}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div 
                className="p-2.5 rounded-lg flex-shrink-0"
                style={{ backgroundColor: 'rgba(255, 107, 0, 0.15)' }}
              >
                <Shield className="w-5 h-5" style={{ color: '#FF6B00' }} />
              </div>
              <div>
                <h3 className="text-white font-semibold mb-1">{t('register.panel.benefit3.title')}</h3>
                <p className="text-sm" style={{ color: '#9CA3AF' }}>
                  {t('register.panel.benefit3.desc')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5" style={{ color: '#FF6B00' }} />
            <span className="text-white font-semibold">{t('register.panel.trust.plans')}</span>
          </div>
          <div className="flex items-center gap-3">
            <Star className="w-5 h-5 fill-current" style={{ color: '#FF6B00' }} />
            <span className="text-white font-semibold">{t('register.panel.trust.rating')}</span>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5" style={{ color: '#FF6B00' }} />
            <span className="text-white font-semibold">{t('register.panel.trust.nocard')}</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div 
        className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-12 py-12 overflow-y-auto"
        style={{ backgroundColor: '#FFFFFF' }}
      >
        <div className="w-full max-w-[520px]">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-3 mb-6 group">
              <div 
                className="p-3 rounded-xl transition-transform group-hover:scale-105"
                style={{ backgroundColor: '#1A2B47' }}
              >
                <Brain className="text-white w-6 h-6" />
              </div>
              <span className="text-2xl font-bold font-heading" style={{ color: '#1A2B47' }}>
                Sqordia
              </span>
            </Link>
            <h1 className="text-3xl font-bold font-heading mb-2" style={{ color: '#1A2B47' }}>
              {t('register.title')}
            </h1>
            <p className="text-base" style={{ color: '#6B7280' }}>
              {t('register.subtitle')}
            </p>
          </div>

          {/* Desktop Title */}
          <div className="hidden lg:block mb-8">
            <h1 className="text-3xl font-bold font-heading mb-2" style={{ color: '#1A2B47' }}>
              {t('register.title')}
            </h1>
            <p className="text-base" style={{ color: '#6B7280' }}>
              {t('register.subtitle')}
            </p>
          </div>

          {/* Register Form */}
          <div>
          {error && (
            <div 
              className="mb-6 p-4 rounded-lg border"
              style={{
                backgroundColor: '#FEF2F2',
                borderColor: '#FECACA',
              }}
            >
              <p className="text-sm font-medium" style={{ color: '#DC2626' }}>{error}</p>
            </div>
          )}

          {/* Google Sign-Up Button */}
          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={googleLoading || loading}
            className="w-full mb-6 py-3.5 px-4 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-3 border disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: '#FFFFFF',
              borderColor: '#E5E7EB',
              color: '#374151',
            }}
            onMouseEnter={(e) => {
              if (!googleLoading && !loading) {
                e.currentTarget.style.borderColor = '#D1D5DB';
                e.currentTarget.style.backgroundColor = '#F9FAFB';
              }
            }}
            onMouseLeave={(e) => {
              if (!googleLoading && !loading) {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.backgroundColor = '#FFFFFF';
              }
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span>{googleLoading ? t('register.google.loading') : t('register.google.button')}</span>
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: '#E5E7EB' }}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3" style={{ color: '#6B7280', backgroundColor: '#FFFFFF' }}>
                {t('register.divider')}
              </span>
            </div>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold mb-2.5" style={{ color: '#1A2B47' }}>
                  {t('register.firstname')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-4 w-4" style={{ color: '#9CA3AF' }} />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-4 md:py-3.5 rounded-lg border text-base md:text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 min-h-[44px]"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E5E7EB',
                      color: '#111827',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#FF6B00';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 0, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    placeholder={t('register.firstname.placeholder')}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold mb-2.5" style={{ color: '#1A2B47' }}>
                  {t('register.lastname')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-4 w-4" style={{ color: '#9CA3AF' }} />
                  </div>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full pl-11 pr-4 py-4 md:py-3.5 rounded-lg border text-base md:text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 min-h-[44px]"
                    style={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E5E7EB',
                      color: '#111827',
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = '#FF6B00';
                      e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 0, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                    placeholder={t('register.lastname.placeholder')}
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2.5" style={{ color: '#1A2B47' }}>
                {t('register.email')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5" style={{ color: '#9CA3AF' }} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-12 pr-4 py-4 md:py-3.5 rounded-lg border text-base md:text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 min-h-[44px]"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E7EB',
                    color: '#111827',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#FF6B00';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 0, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder={t('register.email.placeholder')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="organizationName" className="block text-sm font-semibold mb-2.5" style={{ color: '#1A2B47' }}>
                {t('register.organization')} <span style={{ color: '#9CA3AF', fontWeight: 'normal' }}>{t('register.optional')}</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5" style={{ color: '#9CA3AF' }} />
                </div>
                <input
                  id="organizationName"
                  name="organizationName"
                  type="text"
                  value={formData.organizationName}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 md:py-3.5 rounded-lg border text-base md:text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 min-h-[44px]"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E7EB',
                    color: '#111827',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#FF6B00';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 0, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder={t('register.organization.placeholder')}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-2.5" style={{ color: '#1A2B47' }}>
                {t('register.password')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5" style={{ color: '#9CA3AF' }} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full pl-12 pr-12 py-4 md:py-3.5 rounded-lg border text-base md:text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 min-h-[44px]"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E7EB',
                    color: '#111827',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#FF6B00';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 0, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder={t('register.password.placeholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors"
                  style={{ color: '#9CA3AF' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#6B7280'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {formData.password && (
                <div className="mt-3 space-y-2">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2.5 text-xs">
                      <div 
                        className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0`}
                        style={{
                          backgroundColor: req.met ? '#FFF4E6' : '#F3F4F6',
                          border: `1px solid ${req.met ? '#FF6B00' : '#E5E7EB'}`,
                        }}
                      >
                        {req.met && <CheckCircle size={10} style={{ color: '#FF6B00' }} />}
                      </div>
                      <span style={{ color: req.met ? '#1A2B47' : '#6B7280' }}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold mb-2.5" style={{ color: '#1A2B47' }}>
                {t('register.confirm')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5" style={{ color: '#9CA3AF' }} />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="w-full pl-12 pr-12 py-4 md:py-3.5 rounded-lg border text-base md:text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 min-h-[44px]"
                  style={{
                    backgroundColor: '#FFFFFF',
                    borderColor: '#E5E7EB',
                    color: '#111827',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#FF6B00';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(255, 107, 0, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#E5E7EB';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  placeholder={t('register.confirm.placeholder')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center transition-colors"
                  style={{ color: '#9CA3AF' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#6B7280'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="pt-1">
              <label className="flex items-start gap-3">
                <input 
                  type="checkbox" 
                  required 
                  className="w-4 h-4 mt-1 rounded border-gray-300 focus:ring-2 focus:ring-offset-0 focus:ring-orange-500"
                  style={{ accentColor: '#FF6B00' }}
                />
                <span className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>
                  {t('register.terms')} <a href="#" className="font-semibold transition-colors" style={{ color: '#FF6B00' }} onMouseEnter={(e) => e.currentTarget.style.color = '#E55F00'} onMouseLeave={(e) => e.currentTarget.style.color = '#FF6B00'}>{t('register.termslink')}</a> {t('register.and')}{' '}
                  <a href="#" className="font-semibold transition-colors" style={{ color: '#FF6B00' }} onMouseEnter={(e) => e.currentTarget.style.color = '#E55F00'} onMouseLeave={(e) => e.currentTarget.style.color = '#FF6B00'}>{t('register.privacy')}</a>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full py-4 md:py-3.5 rounded-lg font-semibold text-white text-base md:text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group min-h-[44px]"
              style={{ 
                backgroundColor: '#FF6B00',
              }}
              onMouseEnter={(e) => {
                if (!loading && !googleLoading) {
                  e.currentTarget.style.backgroundColor = '#E55F00';
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && !googleLoading) {
                  e.currentTarget.style.backgroundColor = '#FF6B00';
                }
              }}
            >
              {loading ? (
                <span>{t('register.creating')}</span>
              ) : (
                <>
                  <span>{t('register.button')}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t" style={{ borderColor: '#E5E7EB' }}>
            <p className="text-center text-sm" style={{ color: '#6B7280' }}>
              {t('register.hasaccount')}{' '}
              <Link 
                to="/login" 
                className="font-semibold transition-colors"
                style={{ color: '#FF6B00' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#E55F00'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#FF6B00'}
              >
                {t('register.signin')}
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-sm" style={{ color: '#9CA3AF' }}>
            <Link 
              to="/" 
              className="transition-colors hover:underline"
              style={{ color: '#6B7280' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#374151'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
            >
              {t('register.back')}
            </Link>
          </p>
          </div>
        </div>
      </div>
    </div>
  );
}
