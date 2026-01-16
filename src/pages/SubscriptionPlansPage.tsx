import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';
import { apiClient } from '../lib/api-client';
import { useNavigate } from 'react-router-dom';
import { organizationService } from '../lib/organization-service';
import { subscriptionService } from '../lib/subscription-service';
import { useTheme } from '../contexts/ThemeContext';

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

export default function SubscriptionPlansPage() {
  const navigate = useNavigate();
  const { t } = useTheme();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [error, setError] = useState<string | null>(null);
  const [orgName, setOrgName] = useState('');
  const [orgDescription, setOrgDescription] = useState('');
  const [creatingOrg, setCreatingOrg] = useState(false);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);
  const [needsOrganization, setNeedsOrganization] = useState(false);
  const [subscribingPlanId, setSubscribingPlanId] = useState<string | null>(null);

  useEffect(() => {
    checkOrganizations();
    loadPlans();
  }, []);

  const checkOrganizations = async () => {
    try {
      setLoadingOrgs(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
        // No token means user is not logged in - don't check organizations
        // Don't show organization creation screen for unauthenticated users
        setLoadingOrgs(false);
        setNeedsOrganization(false);
        setOrganizations([]);
        return;
      }

      try {
        const orgsResponse = await apiClient.get('/api/v1/organizations');
        const orgs = orgsResponse.data?.isSuccess 
          ? orgsResponse.data.value 
          : (Array.isArray(orgsResponse.data) ? orgsResponse.data : []);
        setOrganizations(orgs);
        setNeedsOrganization(orgs.length === 0);
      } catch (e: any) {
        // Handle errors gracefully - don't show alerts, just log
        const status = e.response?.status;
        console.log('Error fetching organizations:', status, e.message);
        
        if (status === 401 || status === 400) {
          // 401 = Unauthorized, 400 = Bad Request (often means invalid/missing auth)
          // User is not properly authenticated - don't show organization creation
          // The API client interceptor should handle redirecting to login
          setNeedsOrganization(false);
          setOrganizations([]);
        } else if (status === 404) {
          // Endpoint not found or no organizations - treat as no organizations
          const errorData = e.response?.data;
          if (errorData?.isSuccess && Array.isArray(errorData.value)) {
            setOrganizations(errorData.value);
            setNeedsOrganization(errorData.value.length === 0);
          } else if (Array.isArray(errorData)) {
            setOrganizations(errorData);
            setNeedsOrganization(errorData.length === 0);
          } else {
            setOrganizations([]);
            setNeedsOrganization(true);
          }
        } else {
          // Server errors (500, etc.) or network errors - silently treat as no organizations
          // User can still create one if needed (if they're authenticated)
          console.warn('Server error when fetching organizations, assuming none exist:', status || 'network error');
          setOrganizations([]);
          // Only show organization creation if we have a token (user is logged in)
          setNeedsOrganization(!!token);
        }
      }
    } catch (err) {
      // Catch any unexpected errors
      console.error('Unexpected error checking organizations:', err);
      const token = localStorage.getItem('accessToken');
      setOrganizations([]);
      // Only show organization creation if user is logged in
      setNeedsOrganization(!!token);
    } finally {
      setLoadingOrgs(false);
    }
  };

  const handleCreateOrganization = async () => {
    if (!orgName.trim()) {
      setError('Organization name is required');
      return;
    }

    setCreatingOrg(true);
    setError(null);
    try {
      const newOrg = await organizationService.createOrganization({
        name: orgName,
        organizationType: 'Startup',
        description: orgDescription || undefined
      });
      
      // Update organizations list
      setOrganizations([...organizations, newOrg]);
      setNeedsOrganization(false);
      
      // Clear form
      setOrgName('');
      setOrgDescription('');
    } catch (err: any) {
      console.error('Failed to create organization:', err);
      setError(err.message || 'Failed to create organization. Please try again.');
    } finally {
      setCreatingOrg(false);
    }
  };


  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/api/v1/subscriptions/plans');
      
      // Handle different response formats
      let plansData: SubscriptionPlan[] = [];
      
      if (response.data?.isSuccess && response.data.value) {
        plansData = Array.isArray(response.data.value) ? response.data.value : [];
      } else if (Array.isArray(response.data)) {
        plansData = response.data;
      } else if (response.data?.value && Array.isArray(response.data.value)) {
        plansData = response.data.value;
      }
      
      // Sort plans by displayOrder if available, otherwise by planType
      plansData.sort((a, b) => {
        const orderA = (a as any).displayOrder ?? getPlanOrder(a.planType);
        const orderB = (b as any).displayOrder ?? getPlanOrder(b.planType);
        return orderA - orderB;
      });
      
      setPlans(plansData);
      
      if (plansData.length === 0) {
        setError('No subscription plans available. Please contact support.');
      }
    } catch (err: any) {
      console.error('Failed to load plans:', err);
      // Handle 400/404 as "endpoint not available" - use default plans
      if (err.response?.status === 400 || err.response?.status === 404) {
        // Provide default plans when endpoint doesn't exist
        const defaultPlans: SubscriptionPlan[] = [
          {
            id: 'free',
            planType: 'Free',
            name: 'Free Plan',
            description: 'Perfect for getting started',
            monthlyPrice: 0,
            yearlyPrice: 0,
            currency: 'CAD',
            maxBusinessPlans: 3,
            maxOrganizations: 1,
            maxTeamMembers: 1,
            hasAdvancedAI: false,
            hasExportPDF: false,
            hasExportWord: false,
            hasExportExcel: false,
            hasPrioritySupport: false,
            hasCustomBranding: false,
            hasAPIAccess: false
          },
          {
            id: 'pro',
            planType: 'Pro',
            name: 'Pro Plan',
            description: 'For growing businesses',
            monthlyPrice: 29.99,
            yearlyPrice: 299.99,
            currency: 'CAD',
            maxBusinessPlans: 50,
            maxOrganizations: 5,
            maxTeamMembers: 10,
            hasAdvancedAI: true,
            hasExportPDF: true,
            hasExportWord: true,
            hasExportExcel: true,
            hasPrioritySupport: true,
            hasCustomBranding: false,
            hasAPIAccess: false
          },
          {
            id: 'enterprise',
            planType: 'Enterprise',
            name: 'Enterprise Plan',
            description: 'For large organizations',
            monthlyPrice: 99.99,
            yearlyPrice: 999.99,
            currency: 'CAD',
            maxBusinessPlans: 999999,
            maxOrganizations: 999999,
            maxTeamMembers: 999999,
            hasAdvancedAI: true,
            hasExportPDF: true,
            hasExportWord: true,
            hasExportExcel: true,
            hasPrioritySupport: true,
            hasCustomBranding: true,
            hasAPIAccess: true
          }
        ];
        setPlans(defaultPlans);
        setError(null);
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to load subscription plans');
      }
    } finally {
      setLoading(false);
    }
  };

  const getPlanOrder = (planType: string): number => {
    switch (planType) {
      case 'Free': return 0;
      case 'Pro': return 1;
      case 'Enterprise': return 2;
      default: return 999;
    }
  };

  const formatPrice = (price: number, currency: string = 'CAD') => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const getPrice = (plan: SubscriptionPlan) => {
    return billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
  };

  const getYearlySavings = (plan: SubscriptionPlan) => {
    if (plan.monthlyPrice === 0) return 0;
    const yearlyFromMonthly = plan.monthlyPrice * 12;
    return yearlyFromMonthly - plan.yearlyPrice;
  };

  if (loading || loadingOrgs) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show organization creation step first if needed
  if (needsOrganization) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
                <svg className="h-8 w-8 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Create an Organization First
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                You need to create an organization before you can subscribe to a plan. This helps us organize your business plans and team members.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 text-red-700 dark:text-red-300 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Organization Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="orgName"
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter your organization name"
                  disabled={creatingOrg}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && orgName.trim() && !creatingOrg) {
                      handleCreateOrganization();
                    }
                  }}
                />
              </div>

              <div>
                <label htmlFor="orgDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="orgDescription"
                  value={orgDescription}
                  onChange={(e) => setOrgDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Tell us about your organization"
                  rows={4}
                  disabled={creatingOrg}
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  disabled={creatingOrg}
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={handleCreateOrganization}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                  disabled={creatingOrg || !orgName.trim()}
                >
                  {creatingOrg ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Organization</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">Error: {error}</p>
          <button
            onClick={loadPlans}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
            Select the perfect plan for your business needs
          </p>

          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
              Yearly
            </span>
            {billingCycle === 'yearly' && (
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded-full">
                Save up to 17%
              </span>
            )}
          </div>
        </div>

        {plans.length === 0 && !loading && !error ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No subscription plans available at this time.
            </p>
            <button
              onClick={loadPlans}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => {
            const price = getPrice(plan);
            const savings = getYearlySavings(plan);
            const isPopular = plan.planType === 'Pro';

            return (
              <div
                key={plan.id}
                className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 ${
                  isPopular
                    ? 'border-blue-500 scale-105'
                    : 'border-gray-200 dark:border-gray-700'
                } overflow-hidden`}
              >
                {isPopular && (
                  <div className="absolute top-0 left-0 right-0 bg-blue-600 text-white text-center py-1 text-sm font-semibold">
                    Most Popular
                  </div>
                )}

                <div className={`p-8 ${isPopular ? 'pt-12' : ''}`}>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {plan.description}
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900 dark:text-white">
                        {formatPrice(price, plan.currency)}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 ml-2">
                        /{billingCycle === 'yearly' ? 'year' : 'month'}
                      </span>
                    </div>
                    {billingCycle === 'yearly' && savings > 0 && (
                      <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Save {formatPrice(savings, plan.currency)} per year
                      </p>
                    )}
                  </div>

                  <button
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors mb-6 ${
                      isPopular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    onClick={async () => {
                      try {
                        setSubscribingPlanId(plan.id);
                        
                        // Check if user is logged in
                        const token = localStorage.getItem('accessToken');
                        if (!token) {
                          alert(t('subscription.loginRequired') || 'Please log in to subscribe to a plan.');
                          navigate('/login');
                          return;
                        }

                        // Use the organizations we already have from page load
                        if (organizations.length === 0) {
                          alert(t('subscription.orgRequired') || 'Please create an organization first. Refreshing page...');
                          window.location.reload();
                          return;
                        }

                        const organizationId = organizations[0].id;
                        
                        // Check if user already has a subscription
                        let existingSubscription = null;
                        try {
                          existingSubscription = await subscriptionService.getCurrent();
                        } catch (e) {
                          console.log('No existing subscription found');
                        }

                        // For Free plan, use direct subscription (no Stripe)
                        if (plan.planType === 'Free') {
                          if (existingSubscription) {
                            // Change plan
                            await subscriptionService.changePlan(plan.id, billingCycle === 'yearly');
                            alert(t('subscription.planChanged') || `Successfully changed to ${plan.name}!`);
                            navigate('/subscription');
                          } else {
                            // Subscribe directly
                            await subscriptionService.subscribe(plan.id, organizationId, billingCycle === 'yearly');
                            alert(t('subscription.subscribed') || `Successfully subscribed to ${plan.name}!`);
                            navigate('/subscription');
                          }
                          return;
                        }

                        // For paid plans, use Stripe checkout
                        const successUrl = `${window.location.origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
                        const cancelUrl = `${window.location.origin}/checkout/cancel`;

                        const checkoutUrl = await subscriptionService.createCheckoutSession(
                          plan.id,
                          organizationId,
                          billingCycle === 'yearly'
                        );

                        // Redirect to Stripe Checkout
                        window.location.href = checkoutUrl;
                      } catch (err: any) {
                        console.error('Failed to subscribe:', err);
                        const errorMessage = err.message || 
                                           err.response?.data?.message || 
                                           err.response?.data?.errorMessage || 
                                           'Failed to subscribe';
                        alert(t('subscription.error') || `Failed to subscribe: ${errorMessage}`);
                      } finally {
                        setSubscribingPlanId(null);
                      }
                    }}
                    disabled={subscribingPlanId === plan.id}
                  >
                    {subscribingPlanId === plan.id 
                      ? (t('subscription.processing') || 'Processing...')
                      : plan.planType === 'Free' 
                        ? (t('subscription.getStarted') || 'Get Started')
                        : (t('subscription.subscribe') || 'Subscribe')
                    }
                  </button>

                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {plan.maxBusinessPlans === 999999 ? 'Unlimited' : plan.maxBusinessPlans} Business Plans
                      </span>
                    </div>
                    <div className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {plan.maxOrganizations === 999999 ? 'Unlimited' : plan.maxOrganizations} Organizations
                      </span>
                    </div>
                    <div className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {plan.maxTeamMembers === 999999 ? 'Unlimited' : plan.maxTeamMembers} Team Members
                      </span>
                    </div>
                    <div className="flex items-start">
                      {plan.hasAdvancedAI ? (
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${plan.hasAdvancedAI ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>
                        Advanced AI Features
                      </span>
                    </div>
                    <div className="flex items-start">
                      {plan.hasExportPDF ? (
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${plan.hasExportPDF ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>
                        Export to PDF
                      </span>
                    </div>
                    <div className="flex items-start">
                      {plan.hasExportWord ? (
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${plan.hasExportWord ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>
                        Export to Word
                      </span>
                    </div>
                    <div className="flex items-start">
                      {plan.hasExportExcel ? (
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${plan.hasExportExcel ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>
                        Export to Excel
                      </span>
                    </div>
                    <div className="flex items-start">
                      {plan.hasPrioritySupport ? (
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${plan.hasPrioritySupport ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>
                        Priority Support
                      </span>
                    </div>
                    <div className="flex items-start">
                      {plan.hasCustomBranding ? (
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${plan.hasCustomBranding ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>
                        Custom Branding
                      </span>
                    </div>
                    <div className="flex items-start">
                      {plan.hasAPIAccess ? (
                        <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={`text-sm ${plan.hasAPIAccess ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400'}`}>
                        API Access
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>

    </div>
  );
}

