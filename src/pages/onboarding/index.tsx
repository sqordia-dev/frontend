import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import OnboardingWizard from '../../components/onboarding/OnboardingWizard';
import { useOnboarding } from '../../hooks/useOnboarding';
import { useTheme } from '../../contexts/ThemeContext';
import { authService } from '../../lib/auth-service';
import SEO from '../../components/SEO';
import { getCanonicalUrl } from '../../utils/seo';
import { LoadingSpinner } from '../../components/ui/loading-spinner';

/**
 * Onboarding page
 * Checks if user needs onboarding, redirects if complete
 * Renders the OnboardingWizard component
 */
export default function OnboardingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resumeMode = searchParams.get('resume') === 'true';
  const { progress, isLoading, isComplete } = useOnboarding();
  const { language } = useTheme();
  const [userName, setUserName] = useState<string>('');

  // Fetch user name from localStorage, fall back to API
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(user.firstName || user.name || '');
        return;
      } catch {
        // Fall through to API call
      }
    }
    // Fallback: fetch from API (e.g., page refresh cleared localStorage)
    authService.getCurrentUser()
      .then(user => {
        setUserName(user.firstName || '');
        localStorage.setItem('user', JSON.stringify(user));
      })
      .catch(() => {});
  }, []);

  // Redirect to dashboard if onboarding is complete (unless resuming)
  useEffect(() => {
    if (!isLoading && isComplete && !resumeMode) {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoading, isComplete, resumeMode, navigate]);

  // Show loading state
  if (isLoading) {
    return (
      <>
        <SEO
          title="Loading... | Sqordia"
          description="Setting up your Sqordia experience"
          url={getCanonicalUrl('/onboarding')}
          noindex={true}
        />
        <LoadingSpinner
          size="lg"
          text={language === 'fr' ? 'Chargement...' : 'Loading...'}
          fullPage
        />
      </>
    );
  }

  // Don't render if already complete and not resuming (will redirect)
  if (isComplete && !resumeMode) {
    return null;
  }

  return (
    <>
      <SEO
        title="Welcome to Sqordia | Get Started"
        description="Set up your Sqordia account and create your first business plan in just a few minutes."
        url={getCanonicalUrl('/onboarding')}
        noindex={true}
      />
      <OnboardingWizard
        userName={userName}
        initialStep={resumeMode ? 0 : (progress?.currentStep || 0)}
        initialData={progress?.data || {}}
      />
    </>
  );
}
