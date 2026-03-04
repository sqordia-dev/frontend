import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Loader } from 'lucide-react';
import { subscriptionService } from '../lib/subscription-service';
import { useTheme } from '../contexts/ThemeContext';
import SEO from '../components/SEO';

export default function CheckoutSuccessPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      setError(t('checkout.noSessionId') || 'No session ID found');
      setLoading(false);
      return;
    }

    // Poll for subscription update (webhook may take a few seconds)
    let attempts = 0;
    const maxAttempts = 10;
    const pollInterval = 2000; // 2 seconds

    const checkSubscription = async () => {
      try {
        const subscription = await subscriptionService.getCurrent();
        
        if (subscription) {
          // Subscription found! Wait a moment then navigate to subscription page
          setTimeout(() => {
            navigate('/subscription', { 
              replace: true,
              state: { fromCheckout: true }
            });
          }, 1000);
          return;
        }
        
        attempts++;
        
        if (attempts < maxAttempts) {
          // Try again after interval
          setTimeout(checkSubscription, pollInterval);
        } else {
          // Max attempts reached, show success but let user navigate manually
          setLoading(false);
        }
      } catch (err) {
        console.error('Error checking subscription:', err);
        attempts++;
        
        if (attempts < maxAttempts) {
          setTimeout(checkSubscription, pollInterval);
        } else {
          setLoading(false);
        }
      }
    };

    // Start polling after initial delay
    setTimeout(checkSubscription, 1000);
  }, [searchParams, t, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-16 h-16 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            {t('checkout.processing') || 'Processing your subscription...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Checkout Success | Sqordia"
        description="Your subscription has been successfully activated"
        noindex={true}
        nofollow={true}
      />
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          {error ? (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 dark:bg-red-900 mb-4">
                <span className="text-2xl">⚠️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('checkout.error') || 'Error'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            </>
          ) : (
            <>
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
                <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {t('checkout.success') || 'Payment Successful!'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {t('checkout.successMessage') || 'Your subscription has been activated. You can now access all premium features.'}
              </p>
            </>
          )}
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/subscription')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('checkout.viewSubscription') || 'View Subscription'}
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {t('checkout.goToDashboard') || 'Go to Dashboard'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

