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
  const [changingPlan, setChangingPlan] = useState(false);
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
      setChangingPlan(true);
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
      setChangingPlan(false);
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border-2" style={{ borderColor: theme === 'dark' ? '#374151' : strategyBlue }}>
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b-2 px-6 py-4 flex items-center justify-between" style={{ borderColor: theme === 'dark' ? '#374151' : lightAIGrey }}>
              <h2 className="text-2xl font-bold" style={{ color: theme === 'dark' ? '#FFFFFF' : strategyBlue }}>Change Subscription Plan</h2>
              <button
                onClick={() => setShowChangePlanModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {error && (
                <div className="mb-6 border-2 rounded-xl p-4" style={{ borderColor: theme === 'dark' ? '#7F1D1D' : '#FEE2E2', backgroundColor: theme === 'dark' ? '#7F1D1D' : '#FEE2E2' }}>
                  <div className="flex items-center gap-2" style={{ color: theme === 'dark' ? '#FCA5A5' : '#DC2626' }}>
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-semibold">{error}</span>
                  </div>
                </div>
              )}

              {/* Billing Cycle Toggle */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'font-bold' : 'text-gray-500 dark:text-gray-400'}`} style={billingCycle === 'monthly' ? { color: momentumOrange } : {}}>
                  Monthly
                </span>
                <button
                  onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
                  className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ backgroundColor: momentumOrange, focusRingColor: momentumOrange }}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
                <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'font-bold' : 'text-gray-500 dark:text-gray-400'}`} style={billingCycle === 'yearly' ? { color: momentumOrange } : {}}>
                  Yearly
                </span>
                {billingCycle === 'yearly' && (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: theme === 'dark' ? '#CC4A00' : '#FFE4CC', color: theme === 'dark' ? '#FF8C42' : '#CC4A00' }}>
                    Save up to 17%
                  </span>
                )}
              </div>

              {loadingPlans ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-4" style={{ borderColor: lightAIGrey, borderTopColor: momentumOrange }}></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {plans.map((plan) => {
                    const price = getPrice(plan);
                    const isCurrentPlan = subscription?.subscriptionPlanId === plan.id;
                    const isCurrentBilling = subscription?.isYearly === (billingCycle === 'yearly');

                    return (
                      <div
                        key={plan.id}
                        className={`relative rounded-xl border-2 p-6 transition-all ${
                          isCurrentPlan && isCurrentBilling
                            ? 'cursor-default'
                            : 'cursor-pointer hover:shadow-lg'
                        }`}
                        style={{
                          borderColor: isCurrentPlan && isCurrentBilling 
                            ? momentumOrange 
                            : (theme === 'dark' ? '#374151' : '#E5E7EB'),
                          backgroundColor: isCurrentPlan && isCurrentBilling
                            ? (theme === 'dark' ? '#1F2937' : lightAIGrey)
                            : 'transparent'
                        }}
                        onClick={() => !isCurrentPlan && handleChangePlan(plan.id)}
                      >
                        {isCurrentPlan && isCurrentBilling && (
                          <div className="absolute top-4 right-4">
                            <span className="px-2 py-1 rounded-full text-xs font-semibold text-white" style={{ backgroundColor: momentumOrange }}>
                              Current
                            </span>
                          </div>
                        )}

                        <div className="mb-4">
                          <h3 className="text-xl font-bold mb-1" style={{ color: theme === 'dark' ? '#FFFFFF' : strategyBlue }}>
                            {plan.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {plan.description}
                          </p>
                        </div>

                        <div className="mb-4">
                          <div className="text-3xl font-bold" style={{ color: momentumOrange }}>
                            {formatPrice(price, plan.currency)}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            /{billingCycle === 'yearly' ? 'year' : 'month'}
                          </div>
                        </div>

                        <button
                          onClick={() => handleChangePlan(plan.id)}
                          disabled={isCurrentPlan && isCurrentBilling || changingPlan}
                          className={`w-full py-2.5 rounded-lg font-semibold transition-all ${
                            isCurrentPlan && isCurrentBilling
                              ? 'cursor-not-allowed opacity-50'
                              : ''
                          } disabled:opacity-50 disabled:cursor-not-allowed text-white`}
                          style={{ 
                            backgroundColor: isCurrentPlan && isCurrentBilling 
                              ? '#9CA3AF' 
                              : momentumOrange 
                          }}
                          onMouseEnter={(e) => {
                            if (!isCurrentPlan || !isCurrentBilling) {
                              e.currentTarget.style.backgroundColor = momentumOrangeHover;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isCurrentPlan || !isCurrentBilling) {
                              e.currentTarget.style.backgroundColor = momentumOrange;
                            }
                          }}
                        >
                          {changingPlan ? (
                            <span className="flex items-center justify-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              Processing...
                            </span>
                          ) : isCurrentPlan && isCurrentBilling ? (
                            'Current Plan'
                          ) : (
                            'Select Plan'
                          )}
                        </button>
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
