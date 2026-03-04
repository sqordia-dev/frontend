import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingWizard } from '../../components/onboarding';
import { useOnboarding } from '../../hooks/useOnboarding';
import SEO from '../../components/SEO';
import { getCanonicalUrl } from '../../utils/seo';

/**
 * Onboarding page
 * Checks if user needs onboarding, redirects if complete
 * Renders the OnboardingWizard component
 */
export default function OnboardingPage() {
  const navigate = useNavigate();
  const { progress, isLoading, isComplete } = useOnboarding();
  const [userName, setUserName] = useState<string>('');

  // Fetch user name from localStorage or API
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserName(user.firstName || user.name || '');
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Redirect to dashboard if onboarding is complete
  useEffect(() => {
    if (!isLoading && isComplete) {
      navigate('/dashboard', { replace: true });
    }
  }, [isLoading, isComplete, navigate]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 dark:bg-gray-900">
        <SEO
          title="Loading... | Sqordia"
          description="Setting up your Sqordia experience"
          url={getCanonicalUrl('/onboarding')}
          noindex={true}
        />
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin"
            style={{ borderColor: '#FF6B00', borderTopColor: 'transparent' }}
            aria-label="Loading"
          />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if already complete (will redirect)
  if (isComplete) {
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
        initialStep={progress?.currentStep || 0}
        initialData={progress?.data || {}}
      />
    </>
  );
}
