import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { X, Download, Calendar, CreditCard, AlertCircle, ExternalLink, ArrowLeft, Sparkles, Zap, Shield, Crown, XCircle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { apiClient } from '../lib/api-client';
import { subscriptionService } from '../lib/subscription-service';
import { useTheme } from '../contexts/ThemeContext';
import SEO from '../components/SEO';
import { getCanonicalUrl } from '../utils/seo';
import { getUserFriendlyError } from '../utils/error-messages';

interface Subscription {
  id: string;
  userId: string;
  organizationId: string;
  subscriptionPlanId: string;
  plan: {
    id: string;
    planType: string;
    name: string;
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
  };
  status: string;
  startDate: string;
  endDate: string;
  cancelledAt?: string;
  cancelledEffectiveDate?: string;
  isYearly: boolean;
  amount: number;
  currency: string;
  isTrial: boolean;
  trialEndDate?: string;
  isActive: boolean;
}

interface SubscriptionPlan {
  id: string;
  planType: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  currency: string;
  maxBusinessPlans: number;
  maxOrganizations: number;
  maxTeamMembers: number;
  hasAdvancedAI: boolean;
  hasExportPDF: boolean;
  hasExportWord: boolean;
  hasExportExcel: boolean;
  hasPrioritySupport: boolean;
  hasCustomBranding: boolean;
  hasAPIAccess: boolean;
}

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { t, theme, language } = useTheme();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [openingPortal, setOpeningPortal] = useState(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [changingPlanId, setChangingPlanId] = useState<string | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  // Theme colors
  const strategyBlue = '#1A2B47';
  const momentumOrange = '#FF6B00';
  const momentumOrangeHover = '#E55F00';
  const lightAIGrey = '#F4F7FA';

  useEffect(() => {
    loadSubscription();
  }, []);

  // Refresh subscription when page becomes visible (user returns from Stripe)
  useEffect(() => {
    let lastCheck = Date.now();
    const minInterval = 3000;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        if (now - lastCheck > minInterval) {
          console.log('Page became visible, refreshing subscription...');
          lastCheck = now;
          loadSubscription(true);
        }
      }
    };

    const handleFocus = () => {
      const now = Date.now();
      if (now - lastCheck > minInterval) {
        console.log('Window regained focus, refreshing subscription...');
        lastCheck = now;
        loadSubscription(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Check if we're coming from checkout success page and poll for updates
  useEffect(() => {
    const fromCheckout = searchParams.get('from') === 'checkout' || 
                         location.state?.fromCheckout === true ||
                         document.referrer.includes('/checkout/success');
    
    if (fromCheckout) {
      console.log('Detected checkout return, starting subscription polling...');
      
      const originalPlanId = subscription?.subscriptionPlanId || subscription?.plan?.id;
      let lastSeenPlanId = originalPlanId;
      
      let attempts = 0;
      const maxAttempts = 15;
      const pollInterval = 2000;

      const pollSubscription = async () => {
        try {
          attempts++;
          console.log(`Polling subscription update (attempt ${attempts}/${maxAttempts})...`);
          
          const sub = await subscriptionService.getCurrent();
          
          if (sub) {
            const newPlanId = sub.subscriptionPlanId || sub.plan?.id;
            const newPlanName = sub.plan?.name;
            
            console.log('Subscription data:', {
              subscriptionId: sub.id,
              planId: newPlanId,
              planName: newPlanName,
              status: sub.status,
              lastSeenPlanId,
              originalPlanId
            });
            
            setSubscription(sub);
            setError(null);
            
            if (newPlanId && newPlanId !== lastSeenPlanId && newPlanId !== originalPlanId) {
              console.log('✅ Plan changed detected! New plan:', newPlanName);
              return;
            }
            
            lastSeenPlanId = newPlanId;
          } else {
            console.log('No subscription found yet...');
          }
          
          if (attempts < maxAttempts) {
            setTimeout(pollSubscription, pollInterval);
          } else {
            console.log('Max polling attempts reached. Forcing final refresh...');
            await loadSubscription(true);
          }
        } catch (err) {
          console.error('Error polling subscription:', err);
          if (attempts < maxAttempts) {
            setTimeout(pollSubscription, pollInterval);
          } else {
            loadSubscription(true);
          }
        }
      };

      setTimeout(pollSubscription, 2000);
      
      if (searchParams.get('from') === 'checkout') {
        navigate('/subscription', { replace: true });
      }
    }
  }, [searchParams, location.state, navigate]);

  useEffect(() => {
    if (subscription) {
      setBillingCycle(subscription.isYearly ? 'yearly' : 'monthly');
    }
  }, [subscription]);

  const loadSubscription = async (force = false) => {
    try {
      if (force || loading) {
        setLoading(true);
      }
      setError(null);
      
      console.log('Loading subscription...');
      const sub = await subscriptionService.getCurrent();
      console.log('Subscription loaded:', sub ? {
        id: sub.id,
        planId: sub.subscriptionPlanId,
        planName: sub.plan?.name,
        status: sub.status
      } : 'No subscription');
      
      if (sub) {
        const currentPlanId = subscription?.subscriptionPlanId || subscription?.plan?.id;
        const newPlanId = sub.subscriptionPlanId || sub.plan?.id;
        
        if (currentPlanId !== newPlanId || !subscription) {
          console.log('Subscription plan changed or new subscription:', {
            from: currentPlanId,
            to: newPlanId,
            planName: sub.plan?.name
          });
          setSubscription(sub);
        } else {
          console.log('Subscription unchanged, skipping update');
        }
      } else {
        setSubscription(null);
      }
    } catch (err: any) {
      console.error('Failed to load subscription:', err);
      if (err.response?.status === 400 || err.response?.status === 404) {
        setSubscription(null);
        setError(null);
      } else {
        const errorMessage = err.response?.data?.message || err.message || '';
        if (errorMessage.includes('already has an active subscription') || 
            errorMessage.includes('Organization already has')) {
          setError('Organization already has an active subscription. Please change plan instead.');
        } else {
          setError(getUserFriendlyError(err, 'subscription'));
        }
      }
    } finally {
      if (force || loading) {
        setLoading(false);
      }
    }
  };

  const handleOpenBillingPortal = async () => {
    try {
      setOpeningPortal(true);
      const returnUrl = `${window.location.origin}/subscription`;
      const portalUrl = await subscriptionService.createBillingPortalSession(returnUrl);
      window.location.href = portalUrl;
    } catch (err: any) {
      console.error('Failed to open billing portal:', err);
      alert(err.message || t('subscription.billingPortalError') || 'Failed to open billing portal');
    } finally {
      setOpeningPortal(false);
    }
  };

  const handleCancel = async () => {
    if (!subscription) return;
    
    if (!confirm('Are you sure you want to cancel your subscription? Your subscription will remain active until the end of the current billing period.')) {
      return;
    }

    try {
      setCancelling(true);
      await apiClient.post('/api/v1/subscriptions/cancel');
      await loadSubscription();
      alert('Subscription cancelled successfully. It will remain active until the end of the billing period.');
    } catch (err: any) {
      console.error('Failed to cancel subscription:', err);
      alert(getUserFriendlyError(err, 'subscription'));
    } finally {
      setCancelling(false);
    }
  };

  const loadPlans = async () => {
    try {
      setLoadingPlans(true);
      const response = await apiClient.get('/api/v1/subscriptions/plans');
      
      let plansData: SubscriptionPlan[] = [];
      const data = response.data as any;
      
      if (data?.isSuccess && data.value) {
        plansData = Array.isArray(data.value) ? data.value : [];
      } else if (Array.isArray(data)) {
        plansData = data;
      } else if (data?.value && Array.isArray(data.value)) {
        plansData = data.value;
      }
      
      setPlans(plansData);
    } catch (err: any) {
      console.error('Failed to load plans:', err);
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleOpenChangePlanModal = async () => {
    setShowChangePlanModal(true);
    if (plans.length === 0) {
      await loadPlans();
    }
  };

  const handleChangePlan = async (newPlanId: string) => {
    if (!subscription) return;

    try {
      setChangingPlanId(newPlanId);
      setError(null);

      const newPlan = plans.find(p => p.id === newPlanId);
      if (!newPlan) {
        throw new Error('Plan not found');
      }

      const isActiveSubscription = subscription.status === 'Active' && subscription.isActive;

      if (newPlan.planType === 'Free') {
        if (isActiveSubscription) {
          try {
            await subscriptionService.changePlan(newPlanId, billingCycle === 'yearly');
            alert(t('subscription.planChanged') || `Successfully changed to ${newPlan.name}!`);
            setShowChangePlanModal(false);
            await loadSubscription();
            return;
          } catch (changeErr: any) {
            throw changeErr;
          }
        } else {
          try {
            await subscriptionService.changePlan(newPlanId, billingCycle === 'yearly');
            alert(t('subscription.planChanged') || `Successfully changed to ${newPlan.name}!`);
            setShowChangePlanModal(false);
            await loadSubscription();
            return;
          } catch (changeErr: any) {
            try {
              await subscriptionService.subscribe(newPlanId, subscription.organizationId, billingCycle === 'yearly');
              alert(t('subscription.subscribed') || `Successfully subscribed to ${newPlan.name}!`);
              setShowChangePlanModal(false);
              await loadSubscription();
              return;
            } catch (subscribeErr: any) {
              if (subscribeErr.message?.includes('already has an active subscription') || 
                  subscribeErr.message?.includes('Organization already has')) {
                setError('You already have an active subscription. Please use the change plan option instead.');
                return;
              }
              throw subscribeErr;
            }
          }
        }
      }

      const checkoutUrl = await subscriptionService.createCheckoutSession(
        newPlanId,
        subscription.organizationId,
        billingCycle === 'yearly'
      );

      window.location.href = checkoutUrl;
    } catch (err: any) {
      console.error('Failed to change plan:', err);
      if (err.message?.includes('already has an active subscription') || 
          err.message?.includes('Organization already has')) {
        setError('You already have an active subscription. Please use the change plan option instead.');
      } else {
        setError(getUserFriendlyError(err, 'subscription'));
      }
    } finally {
      setChangingPlanId(null);
    }
  };

  const getPrice = (plan: SubscriptionPlan) => {
    return billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
  };

  const formatPrice = (price: number, currency: string = 'CAD') => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getPlanIcon = (planType: string) => {
    switch (planType.toLowerCase()) {
      case 'pro':
        return <Crown className="w-6 h-6" style={{ color: momentumOrange }} />;
      case 'enterprise':
        return <Sparkles className="w-6 h-6" style={{ color: momentumOrange }} />;
      default:
        return <Zap className="w-6 h-6" style={{ color: momentumOrange }} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme === 'dark' ? '#111827' : lightAIGrey }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 mx-auto mb-4" style={{ borderColor: lightAIGrey, borderTopColor: momentumOrange }}></div>
          <p className="text-gray-600 dark:text-gray-400">Loading subscription...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: theme === 'dark' ? '#111827' : lightAIGrey }}>
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: theme === 'dark' ? '#7F1D1D' : '#FEE2E2' }}>
            <AlertCircle className="w-8 h-8" style={{ color: theme === 'dark' ? '#FCA5A5' : '#DC2626' }} />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {t('subscription.errorLoading') || 'Error Loading Subscription'}
          </h2>
          <p className="mb-6" style={{ color: theme === 'dark' ? '#FCA5A5' : '#DC2626' }}>
            {error === 'Network Error' || error?.includes('Network Error') || error?.includes('CORS')
              ? (t('subscription.networkError') || 'Network error: Unable to connect to the server. Please check your connection and try again.')
              : error}
          </p>
          <button
            onClick={() => loadSubscription(true)}
            className="px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl font-semibold text-white"
            style={{ backgroundColor: momentumOrange }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = momentumOrangeHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = momentumOrange}
          >
            {t('subscription.tryAgain') || 'Try Again'}
          </button>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: theme === 'dark' ? '#111827' : lightAIGrey }}>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 p-12 text-center" style={{ borderColor: theme === 'dark' ? '#374151' : strategyBlue }}>
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: strategyBlue }}>
              <CreditCard className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {t('subscription.noActiveSubscription')}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">
              {t('subscription.noActiveSubscriptionDesc')}
            </p>
            <button
              onClick={() => navigate('/subscription-plans')}
              className="px-8 py-4 rounded-xl transition-all shadow-lg hover:shadow-xl font-semibold text-lg text-white"
              style={{ backgroundColor: momentumOrange }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = momentumOrangeHover}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = momentumOrange}
            >
              {t('subscription.viewPlans')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCancelled = subscription.status === 'Cancelled';
  const isActive = subscription.status === 'Active';

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme === 'dark' ? '#111827' : lightAIGrey }}>
      <SEO
        title={language === 'fr' 
          ? "Abonnement | Sqordia"
          : "Subscription | Sqordia"}
        description={language === 'fr'
          ? "Gérez votre abonnement Sqordia."
          : "Manage your Sqordia subscription."}
        url={getCanonicalUrl('/subscription')}
        noindex={true}
        nofollow={true}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center gap-2 mb-6 transition-colors group"
            style={{ color: theme === 'dark' ? '#D1D5DB' : strategyBlue }}
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">{t('subscription.backToDashboard') || 'Back to Dashboard'}</span>
          </button>
          <h1 className="text-4xl font-bold mb-2" style={{ color: theme === 'dark' ? '#FFFFFF' : strategyBlue }}>
            {t('subscription.title') || 'My Subscription'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">{t('subscription.subtitle') || 'Manage your subscription and billing details'}</p>
        </div>

        {/* Main Layout: Split Screen */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Key Info */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 p-6 sticky top-8" style={{ borderColor: theme === 'dark' ? '#374151' : strategyBlue }}>
              {/* Plan Icon & Name */}
              <div className="text-center mb-6 pb-6 border-b-2" style={{ borderColor: theme === 'dark' ? '#374151' : lightAIGrey }}>
                <div className="w-16 h-16 mx-auto mb-4 rounded-xl flex items-center justify-center" style={{ backgroundColor: lightAIGrey }}>
                  {getPlanIcon(subscription.plan.planType)}
                </div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: theme === 'dark' ? '#FFFFFF' : strategyBlue }}>
                  {subscription.plan.name}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">{subscription.plan.description}</p>
              </div>

              {/* Price */}
              <div className="text-center mb-6 pb-6 border-b-2" style={{ borderColor: theme === 'dark' ? '#374151' : lightAIGrey }}>
                <div className="text-4xl font-bold mb-1" style={{ color: momentumOrange }}>
                  {formatPrice(subscription.amount, subscription.currency)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  /{subscription.isYearly ? 'year' : 'month'}
                </div>
              </div>

              {/* Status Badge */}
              <div className="mb-6">
                <div className="text-xs font-semibold uppercase tracking-wider mb-2 text-gray-500 dark:text-gray-400">Status</div>
                {isActive ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold" style={{ backgroundColor: theme === 'dark' ? '#CC4A00' : '#FFE4CC', color: theme === 'dark' ? '#FF8C42' : '#CC4A00' }}>
                    <CheckCircle2 size={16} />
                    Active
                  </div>
                ) : isCancelled ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold" style={{ backgroundColor: theme === 'dark' ? '#78350F' : '#FEF3C7', color: theme === 'dark' ? '#FCD34D' : '#92400E' }}>
                    <XCircle size={16} />
                    Cancelled
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                    {subscription.status}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <button
                  onClick={handleOpenChangePlanModal}
                  className="w-full px-4 py-3 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  style={{ backgroundColor: momentumOrange }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = momentumOrangeHover}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = momentumOrange}
                >
                  <Sparkles size={18} />
                  {t('subscription.changePlan') || 'Change Plan'}
                </button>
                
                {isActive && subscription.plan.planType !== 'Free' && (
                  <button
                    onClick={handleOpenBillingPortal}
                    disabled={openingPortal}
                    className="w-full px-4 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-2"
                    style={{ 
                      borderColor: strategyBlue,
                      color: theme === 'dark' ? '#FFFFFF' : strategyBlue,
                      backgroundColor: 'transparent'
                    }}
                  >
                    {openingPortal ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
                        <span>{t('subscription.openingPortal') || 'Opening...'}</span>
                      </>
                    ) : (
                      <>
                        <ExternalLink size={18} />
                        <span>{t('subscription.manageBilling') || 'Manage Billing'}</span>
                      </>
                    )}
                  </button>
                )}
                
                <button
                  onClick={() => navigate('/invoices')}
                  className="w-full px-4 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 border-2"
                  style={{ 
                    borderColor: strategyBlue,
                    color: theme === 'dark' ? '#FFFFFF' : strategyBlue,
                    backgroundColor: 'transparent'
                  }}
                >
                  <Download size={18} />
                  {t('subscription.viewInvoices') || 'View Invoices'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Content - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cancellation Alert */}
            {isCancelled && subscription.cancelledAt && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-l-4 p-6" style={{ borderLeftColor: momentumOrange }}>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: theme === 'dark' ? '#78350F' : '#FEF3C7' }}>
                    <AlertCircle className="w-5 h-5" style={{ color: theme === 'dark' ? '#FCD34D' : '#92400E' }} />
                  </div>
                  <div className="flex-1">
                    <div className="font-bold mb-2 text-lg" style={{ color: theme === 'dark' ? '#FCD34D' : '#92400E' }}>
                      Subscription Cancelled
                    </div>
                    <div className="text-gray-700 dark:text-gray-300">
                      Your subscription was cancelled on <span className="font-semibold">{formatDate(subscription.cancelledAt)}</span>. 
                      You will continue to have access until <span className="font-semibold">{formatDate(subscription.cancelledEffectiveDate || subscription.endDate)}</span>.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Details Grid */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 p-6" style={{ borderColor: theme === 'dark' ? '#374151' : strategyBlue }}>
              <h3 className="text-xl font-bold mb-6" style={{ color: theme === 'dark' ? '#FFFFFF' : strategyBlue }}>
                Subscription Details
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Billing Cycle */}
                <div className="p-4 rounded-xl border-2" style={{ borderColor: theme === 'dark' ? '#374151' : lightAIGrey, backgroundColor: theme === 'dark' ? '#1F2937' : lightAIGrey }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme === 'dark' ? '#374151' : '#FFFFFF' }}>
                      <CreditCard className="w-5 h-5" style={{ color: momentumOrange }} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Billing Cycle</div>
                      <div className="text-lg font-bold" style={{ color: theme === 'dark' ? '#FFFFFF' : strategyBlue }}>
                        {subscription.isYearly ? 'Yearly' : 'Monthly'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Start Date */}
                <div className="p-4 rounded-xl border-2" style={{ borderColor: theme === 'dark' ? '#374151' : lightAIGrey, backgroundColor: theme === 'dark' ? '#1F2937' : lightAIGrey }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme === 'dark' ? '#374151' : '#FFFFFF' }}>
                      <Calendar className="w-5 h-5" style={{ color: momentumOrange }} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Start Date</div>
                      <div className="text-lg font-bold" style={{ color: theme === 'dark' ? '#FFFFFF' : strategyBlue }}>
                        {formatDate(subscription.startDate)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* End/Renewal Date */}
                <div className="p-4 rounded-xl border-2" style={{ borderColor: theme === 'dark' ? '#374151' : lightAIGrey, backgroundColor: theme === 'dark' ? '#1F2937' : lightAIGrey }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme === 'dark' ? '#374151' : '#FFFFFF' }}>
                      <Clock className="w-5 h-5" style={{ color: momentumOrange }} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        {isCancelled ? 'Expires On' : 'Renews On'}
                      </div>
                      <div className="text-lg font-bold" style={{ color: theme === 'dark' ? '#FFFFFF' : strategyBlue }}>
                        {formatDate(subscription.cancelledEffectiveDate || subscription.endDate)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Plan Type */}
                <div className="p-4 rounded-xl border-2" style={{ borderColor: theme === 'dark' ? '#374151' : lightAIGrey, backgroundColor: theme === 'dark' ? '#1F2937' : lightAIGrey }}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: theme === 'dark' ? '#374151' : '#FFFFFF' }}>
                      <TrendingUp className="w-5 h-5" style={{ color: momentumOrange }} />
                    </div>
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Plan Type</div>
                      <div className="text-lg font-bold" style={{ color: theme === 'dark' ? '#FFFFFF' : strategyBlue }}>
                        {subscription.plan.planType}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cancel Button */}
            {isActive && (
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 p-6" style={{ borderColor: theme === 'dark' ? '#374151' : strategyBlue }}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold mb-1" style={{ color: theme === 'dark' ? '#FFFFFF' : strategyBlue }}>
                      Cancel Subscription
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Your subscription will remain active until the end of the billing period.
                    </p>
                  </div>
                  <button
                    onClick={handleCancel}
                    disabled={cancelling}
                    className="px-6 py-3 rounded-xl font-semibold transition-all border-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ 
                      borderColor: theme === 'dark' ? '#6B7280' : '#9CA3AF',
                      color: theme === 'dark' ? '#D1D5DB' : '#6B7280',
                      backgroundColor: 'transparent'
                    }}
                  >
                    {cancelling 
                      ? (t('subscription.cancelling') || 'Cancelling...') 
                      : (t('subscription.cancel') || 'Cancel Subscription')
                    }
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Change Plan Modal */}
      {showChangePlanModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto"
            style={{
              boxShadow: theme === 'dark'
                ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
                : '0 25px 50px -12px rgba(26, 43, 71, 0.25)'
            }}
          >
            {/* Header */}
            <div
              className="sticky top-0 z-10 px-8 py-6 flex items-center justify-between"
              style={{
                background: theme === 'dark'
                  ? 'linear-gradient(135deg, #1F2937 0%, #111827 100%)'
                  : `linear-gradient(135deg, ${strategyBlue} 0%, #0F1A2B 100%)`
              }}
            >
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">Change Subscription Plan</h2>
                <p className="text-white/70 text-sm">Select the plan that best fits your needs</p>
              </div>
              <button
                onClick={() => setShowChangePlanModal(false)}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-8">
              {error && (
                <div className="mb-6 border-2 rounded-xl p-4 flex items-center gap-3" style={{ borderColor: theme === 'dark' ? '#7F1D1D' : '#FECACA', backgroundColor: theme === 'dark' ? 'rgba(127, 29, 29, 0.3)' : '#FEF2F2' }}>
                  <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: theme === 'dark' ? '#FCA5A5' : '#DC2626' }} />
                  <span className="font-medium" style={{ color: theme === 'dark' ? '#FCA5A5' : '#DC2626' }}>{error}</span>
                </div>
              )}

              {/* Billing Cycle Toggle */}
              <div className="flex items-center justify-center mb-10">
                <div
                  className="inline-flex items-center gap-1 p-1.5 rounded-full"
                  style={{ backgroundColor: theme === 'dark' ? '#1F2937' : lightAIGrey }}
                >
                  <button
                    onClick={() => setBillingCycle('monthly')}
                    className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
                    style={{
                      backgroundColor: billingCycle === 'monthly' ? (theme === 'dark' ? strategyBlue : '#FFFFFF') : 'transparent',
                      color: billingCycle === 'monthly' ? (theme === 'dark' ? '#FFFFFF' : strategyBlue) : (theme === 'dark' ? '#9CA3AF' : '#6B7280'),
                      boxShadow: billingCycle === 'monthly' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    Monthly
                  </button>
                  <button
                    onClick={() => setBillingCycle('yearly')}
                    className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2"
                    style={{
                      backgroundColor: billingCycle === 'yearly' ? (theme === 'dark' ? strategyBlue : '#FFFFFF') : 'transparent',
                      color: billingCycle === 'yearly' ? (theme === 'dark' ? '#FFFFFF' : strategyBlue) : (theme === 'dark' ? '#9CA3AF' : '#6B7280'),
                      boxShadow: billingCycle === 'yearly' ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    Yearly
                    <span
                      className="px-2 py-0.5 rounded-full text-xs font-bold"
                      style={{
                        backgroundColor: billingCycle === 'yearly' ? momentumOrange : (theme === 'dark' ? '#374151' : '#E5E7EB'),
                        color: billingCycle === 'yearly' ? '#FFFFFF' : (theme === 'dark' ? '#9CA3AF' : '#6B7280')
                      }}
                    >
                      -17%
                    </span>
                  </button>
                </div>
              </div>

              {loadingPlans ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative w-16 h-16 mb-4">
                    <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: theme === 'dark' ? '#374151' : '#E5E7EB' }} />
                    <div className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: `${momentumOrange} transparent transparent transparent` }} />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">Loading plans...</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Sort plans: Free, Pro, Enterprise */}
                  {[...plans].sort((a, b) => {
                    const order: Record<string, number> = { 'Free': 0, 'Pro': 1, 'Enterprise': 2 };
                    return (order[a.planType] ?? 99) - (order[b.planType] ?? 99);
                  }).map((plan) => {
                    const price = getPrice(plan);
                    const isCurrentPlan = subscription?.subscriptionPlanId === plan.id;
                    const isCurrentBilling = subscription?.isYearly === (billingCycle === 'yearly');
                    const isPro = plan.planType === 'Pro';

                    return (
                      <div
                        key={plan.id}
                        className={`relative rounded-2xl transition-all duration-300 ${
                          (isCurrentPlan && isCurrentBilling) || changingPlanId
                            ? ''
                            : 'hover:scale-[1.02] hover:shadow-xl cursor-pointer'
                        }`}
                        style={{
                          border: isCurrentPlan && isCurrentBilling
                            ? `3px solid ${momentumOrange}`
                            : isPro
                              ? `2px solid ${momentumOrange}`
                              : `2px solid ${theme === 'dark' ? '#374151' : '#E5E7EB'}`,
                          backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                          boxShadow: isPro && !(isCurrentPlan && isCurrentBilling)
                            ? `0 8px 32px ${theme === 'dark' ? 'rgba(255, 107, 0, 0.15)' : 'rgba(255, 107, 0, 0.2)'}`
                            : undefined
                        }}
                        onClick={() => !(isCurrentPlan && isCurrentBilling) && !changingPlanId && handleChangePlan(plan.id)}
                      >
                        {/* Popular Badge for Pro */}
                        {isPro && !(isCurrentPlan && isCurrentBilling) && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span
                              className="px-4 py-1 rounded-full text-xs font-bold text-white shadow-lg"
                              style={{ backgroundColor: momentumOrange }}
                            >
                              MOST POPULAR
                            </span>
                          </div>
                        )}

                        {/* Current Badge */}
                        {isCurrentPlan && isCurrentBilling && (
                          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                            <span
                              className="px-4 py-1 rounded-full text-xs font-bold text-white shadow-lg flex items-center gap-1.5"
                              style={{ backgroundColor: momentumOrange }}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              CURRENT PLAN
                            </span>
                          </div>
                        )}

                        <div className="p-6 pt-8">
                          {/* Plan Icon & Name */}
                          <div className="flex items-center gap-3 mb-4">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center"
                              style={{ backgroundColor: theme === 'dark' ? '#374151' : lightAIGrey }}
                            >
                              {plan.planType === 'Free' && <Zap className="w-6 h-6" style={{ color: momentumOrange }} />}
                              {plan.planType === 'Pro' && <Crown className="w-6 h-6" style={{ color: momentumOrange }} />}
                              {plan.planType === 'Enterprise' && <Shield className="w-6 h-6" style={{ color: momentumOrange }} />}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold" style={{ color: theme === 'dark' ? '#FFFFFF' : strategyBlue }}>
                                {plan.name}
                              </h3>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {plan.description}
                              </p>
                            </div>
                          </div>

                          {/* Price */}
                          <div className="mb-6 pb-6 border-b-2" style={{ borderColor: theme === 'dark' ? '#374151' : lightAIGrey }}>
                            <div className="flex items-baseline gap-1">
                              <span className="text-4xl font-bold" style={{ color: momentumOrange }}>
                                {formatPrice(price, plan.currency).replace(/\.00$/, '')}
                              </span>
                              <span className="text-gray-500 dark:text-gray-400 text-sm">
                                /{billingCycle === 'yearly' ? 'year' : 'month'}
                              </span>
                            </div>
                            {billingCycle === 'yearly' && plan.planType !== 'Free' && (
                              <p className="text-xs mt-1" style={{ color: momentumOrange }}>
                                Save {formatPrice(plan.monthlyPrice * 12 - plan.yearlyPrice, plan.currency)} annually
                              </p>
                            )}
                          </div>

                          {/* Features Preview */}
                          <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: momentumOrange }} />
                              <span style={{ color: theme === 'dark' ? '#D1D5DB' : '#374151' }}>
                                {plan.maxBusinessPlans === -1 ? 'Unlimited' : plan.maxBusinessPlans} business plans
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: momentumOrange }} />
                              <span style={{ color: theme === 'dark' ? '#D1D5DB' : '#374151' }}>
                                {plan.maxTeamMembers === -1 ? 'Unlimited' : plan.maxTeamMembers} team members
                              </span>
                            </div>
                            {plan.hasAdvancedAI && (
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: momentumOrange }} />
                                <span style={{ color: theme === 'dark' ? '#D1D5DB' : '#374151' }}>Advanced AI features</span>
                              </div>
                            )}
                            {plan.hasPrioritySupport && (
                              <div className="flex items-center gap-2 text-sm">
                                <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: momentumOrange }} />
                                <span style={{ color: theme === 'dark' ? '#D1D5DB' : '#374151' }}>Priority support</span>
                              </div>
                            )}
                          </div>

                          {/* Action Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleChangePlan(plan.id);
                            }}
                            disabled={(isCurrentPlan && isCurrentBilling) || !!changingPlanId}
                            className="w-full py-3.5 rounded-xl font-semibold transition-all disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{
                              backgroundColor: isCurrentPlan && isCurrentBilling
                                ? (theme === 'dark' ? '#374151' : '#E5E7EB')
                                : momentumOrange,
                              color: isCurrentPlan && isCurrentBilling
                                ? (theme === 'dark' ? '#9CA3AF' : '#6B7280')
                                : '#FFFFFF',
                              boxShadow: !(isCurrentPlan && isCurrentBilling) ? '0 4px 14px rgba(255, 107, 0, 0.4)' : 'none'
                            }}
                            onMouseEnter={(e) => {
                              if (!(isCurrentPlan && isCurrentBilling) && !changingPlanId) {
                                e.currentTarget.style.backgroundColor = momentumOrangeHover;
                                e.currentTarget.style.transform = 'translateY(-1px)';
                              }
                            }}
                            onMouseLeave={(e) => {
                              if (!(isCurrentPlan && isCurrentBilling) && !changingPlanId) {
                                e.currentTarget.style.backgroundColor = momentumOrange;
                                e.currentTarget.style.transform = 'translateY(0)';
                              }
                            }}
                          >
                            {changingPlanId === plan.id ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Processing...
                              </>
                            ) : isCurrentPlan && isCurrentBilling ? (
                              <>
                                <CheckCircle2 className="w-5 h-5" />
                                Current Plan
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-5 h-5" />
                                Select Plan
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
