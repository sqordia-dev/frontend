import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import SEO from '../components/SEO';

export default function CheckoutCancelPage() {
  const navigate = useNavigate();
  const { t } = useTheme();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SEO
        title="Checkout Cancelled | Sqordia"
        description="Your payment was cancelled"
        noindex={true}
        nofollow={true}
      />
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-orange-100 dark:bg-orange-900 mb-4">
            <XCircle className="w-10 h-10 text-orange-600 dark:text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('checkout.cancelled') || 'Payment Cancelled'}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {t('checkout.cancelledMessage') || 'Your payment was cancelled. No charges were made. You can try again anytime.'}
          </p>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate('/subscription-plans')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('checkout.backToPlans') || 'Back to Plans'}
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

