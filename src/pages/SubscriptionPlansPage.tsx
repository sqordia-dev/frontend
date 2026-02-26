import { useState, useEffect } from 'react';
import { Check, X, Sparkles, Zap, Crown, Building2, ArrowLeft } from 'lucide-react';
import { apiClient } from '../lib/api-client';
import { useNavigate } from 'react-router-dom';
import { organizationService } from '../lib/organization-service';
import { subscriptionService } from '../lib/subscription-service';
import { useTheme } from '../contexts/ThemeContext';
import { useCmsContent } from '../hooks/useCmsContent';
import SEO from '../components/SEO';
import { getCanonicalUrl } from '../utils/seo';
import { getUserFriendlyError } from '../utils/error-messages';

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
  const { language, theme } = useTheme();
  const { getContent: cms } = useCmsContent('subscription');
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

  // Brand colors
  const strategyBlue = '#1A2B47';
  const momentumOrange = '#FF6B00';
  const momentumOrangeHover = '#E55F00';
  const lightAIGrey = '#F4F7FA';

  useEffect(() => {
    checkOrganizations();
    loadPlans();
  }, []);

  const checkOrganizations = async () => {
    try {
      setLoadingOrgs(true);
      const token = localStorage.getItem('accessToken');
      if (!token) {
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
        const status = e.response?.status;
        console.log('Error fetching organizations:', status, e.message);

        if (status === 401 || status === 400) {
          setNeedsOrganization(false);
          setOrganizations([]);
        } else if (status === 404) {
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
          console.warn('Server error when fetching organizations, assuming none exist:', status || 'network error');
          setOrganizations([]);
          setNeedsOrganization(!!token);
        }
      }
    } catch (err) {
      console.error('Unexpected error checking organizations:', err);
      const token = localStorage.getItem('accessToken');
      setOrganizations([]);
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

      setOrganizations([...organizations, newOrg]);
      setNeedsOrganization(false);
      setOrgName('');
      setOrgDescription('');
    } catch (err: any) {
      console.error('Failed to create organization:', err);
      setError(getUserFriendlyError(err, 'save'));
    } finally {
      setCreatingOrg(false);
    }
  };

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get('/api/v1/subscriptions/plans');

      let plansData: SubscriptionPlan[] = [];

      if (response.data?.isSuccess && response.data.value) {
        plansData = Array.isArray(response.data.value) ? response.data.value : [];
      } else if (Array.isArray(response.data)) {
        plansData = response.data;
      } else if (response.data?.value && Array.isArray(response.data.value)) {
        plansData = response.data.value;
      }

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
      if (err.response?.status === 400 || err.response?.status === 404) {
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
        setError(getUserFriendlyError(err, 'load'));
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

  const getPlanIcon = (planType: string) => {
    switch (planType.toLowerCase()) {
      case 'pro':
        return <Crown className="w-8 h-8" />;
      case 'enterprise':
        return <Sparkles className="w-8 h-8" />;
      default:
        return <Zap className="w-8 h-8" />;
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

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    try {
      setSubscribingPlanId(plan.id);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        alert(cms('subscription.login_required', 'subscription.loginRequired') || 'Please log in to subscribe to a plan.');
        navigate('/login');
        return;
      }

      if (organizations.length === 0) {
        alert(cms('subscription.org_required', 'subscription.orgRequired') || 'Please create an organization first. Refreshing page...');
        window.location.reload();
        return;
      }

      const organizationId = organizations[0].id;

      let existingSubscription = null;
      try {
        existingSubscription = await subscriptionService.getCurrent();
      } catch (e) {
        console.log('No existing subscription found');
      }

      if (plan.planType === 'Free') {
        if (existingSubscription) {
          await subscriptionService.changePlan(plan.id, billingCycle === 'yearly');
          alert(cms('subscription.plan_changed', 'subscription.planChanged') || `Successfully changed to ${plan.name}!`);
          navigate('/subscription');
        } else {
          await subscriptionService.subscribe(plan.id, organizationId, billingCycle === 'yearly');
          alert(cms('subscription.subscribed', 'subscription.subscribed') || `Successfully subscribed to ${plan.name}!`);
          navigate('/subscription');
        }
        return;
      }

      const checkoutUrl = await subscriptionService.createCheckoutSession(
        plan.id,
        organizationId,
        billingCycle === 'yearly'
      );

      window.location.href = checkoutUrl;
    } catch (err: any) {
      console.error('Failed to subscribe:', err);
      const errorMessage = err.message ||
                         err.response?.data?.message ||
                         err.response?.data?.errorMessage ||
                         'Failed to subscribe';
      alert(cms('subscription.error', 'subscription.error') || `Failed to subscribe: ${errorMessage}`);
    } finally {
      setSubscribingPlanId(null);
    }
  };

  if (loading || loadingOrgs) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme === 'dark' ? '#111827' : lightAIGrey }}>
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div
              className="absolute inset-0 rounded-full border-4"
              style={{ borderColor: theme === 'dark' ? '#374151' : '#E5E7EB' }}
            />
            <div
              className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
              style={{ borderColor: `${momentumOrange} transparent transparent transparent` }}
            />
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Loading plans...</p>
        </div>
      </div>
    );
  }

  // Organization Creation Screen
  if (needsOrganization) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: theme === 'dark' ? '#111827' : lightAIGrey }}>
        <div className="max-w-2xl mx-auto">
          <div
            className="rounded-2xl shadow-xl border-2 p-8"
            style={{
              backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
              borderColor: theme === 'dark' ? '#374151' : strategyBlue
            }}
          >
            <div className="text-center mb-8">
              <div
                className="mx-auto flex items-center justify-center h-16 w-16 rounded-xl mb-4"
                style={{ backgroundColor: strategyBlue }}
              >
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <h1
                className="text-3xl font-bold mb-2"
                style={{ color: theme === 'dark' ? '#FFFFFF' : strategyBlue }}
              >
                Create an Organization First
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                You need to create an organization before you can subscribe to a plan. This helps us organize your business plans and team members.
              </p>
            </div>

            {error && (
              <div
                className="mb-6 p-4 rounded-xl border-2"
                style={{
                  backgroundColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#FEF2F2',
                  borderColor: theme === 'dark' ? 'rgba(239, 68, 68, 0.3)' : '#FECACA',
                  color: theme === 'dark' ? '#FCA5A5' : '#DC2626'
                }}
              >
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label
                  htmlFor="orgName"
                  className="block text-sm font-semibold mb-2"
                  style={{ color: theme === 'dark' ? '#D1D5DB' : strategyBlue }}
                >
                  Organization Name <span style={{ color: '#DC2626' }}>*</span>
                </label>
                <input
                  id="orgName"
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all"
                  style={{
                    backgroundColor: theme === 'dark' ? '#374151' : '#FFFFFF',
                    borderColor: theme === 'dark' ? '#4B5563' : '#E5E7EB',
                    color: theme === 'dark' ? '#FFFFFF' : strategyBlue
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = momentumOrange}
                  onBlur={(e) => e.currentTarget.style.borderColor = theme === 'dark' ? '#4B5563' : '#E5E7EB'}
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
                <label
                  htmlFor="orgDescription"
                  className="block text-sm font-semibold mb-2"
                  style={{ color: theme === 'dark' ? '#D1D5DB' : strategyBlue }}
                >
                  Description (Optional)
                </label>
                <textarea
                  id="orgDescription"
                  value={orgDescription}
                  onChange={(e) => setOrgDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all resize-none"
                  style={{
                    backgroundColor: theme === 'dark' ? '#374151' : '#FFFFFF',
                    borderColor: theme === 'dark' ? '#4B5563' : '#E5E7EB',
                    color: theme === 'dark' ? '#FFFFFF' : strategyBlue
                  }}
                  onFocus={(e) => e.currentTarget.style.borderColor = momentumOrange}
                  onBlur={(e) => e.currentTarget.style.borderColor = theme === 'dark' ? '#4B5563' : '#E5E7EB'}
                  placeholder="Tell us about your organization"
                  rows={4}
                  disabled={creatingOrg}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 rounded-xl font-semibold transition-all border-2"
                  style={{
                    borderColor: theme === 'dark' ? '#4B5563' : '#E5E7EB',
                    color: theme === 'dark' ? '#D1D5DB' : '#6B7280',
                    backgroundColor: 'transparent'
                  }}
                  disabled={creatingOrg}
                >
                  Go to Dashboard
                </button>
                <button
                  onClick={handleCreateOrganization}
                  className="px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  style={{ backgroundColor: momentumOrange }}
                  onMouseEnter={(e) => {
                    if (!creatingOrg && orgName.trim()) e.currentTarget.style.backgroundColor = momentumOrangeHover;
                  }}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = momentumOrange}
                  disabled={creatingOrg || !orgName.trim()}
                >
                  {creatingOrg ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
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
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: theme === 'dark' ? '#111827' : lightAIGrey }}>
        <div className="text-center max-w-md">
          <p className="mb-4" style={{ color: theme === 'dark' ? '#FCA5A5' : '#DC2626' }}>Error: {error}</p>
          <button
            onClick={loadPlans}
            className="px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-xl"
            style={{ backgroundColor: momentumOrange }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = momentumOrangeHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = momentumOrange}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: theme === 'dark' ? '#111827' : lightAIGrey }}>
      <SEO
        title={cms('subscription.seo_title', '') || (language === 'fr'
          ? "Plans d'Abonnement | Sqordia"
          : "Subscription Plans | Sqordia")}
        description={cms('subscription.seo_description', '') || (language === 'fr'
          ? "Choisissez le plan d'abonnement Sqordia qui correspond à vos besoins."
          : "Choose the Sqordia subscription plan that fits your needs.")}
        url={getCanonicalUrl('/subscription-plans')}
        noindex={true}
        nofollow={true}
      />

      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 mb-8 transition-all group"
          style={{ color: theme === 'dark' ? '#D1D5DB' : strategyBlue }}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back</span>
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ color: theme === 'dark' ? '#FFFFFF' : strategyBlue }}
          >
            {cms('subscription.page_title', '') || 'Choose Your Plan'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Select the perfect plan for your business needs
          </p>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center gap-4 p-2 rounded-xl" style={{ backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF' }}>
            <span
              className={`text-sm font-semibold transition-colors ${billingCycle === 'monthly' ? '' : 'opacity-50'}`}
              style={{ color: billingCycle === 'monthly' ? momentumOrange : (theme === 'dark' ? '#9CA3AF' : '#6B7280') }}
            >
              {cms('subscription.monthly', '') || 'Monthly'}
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ backgroundColor: momentumOrange, outlineColor: momentumOrange }}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span
              className={`text-sm font-semibold transition-colors ${billingCycle === 'yearly' ? '' : 'opacity-50'}`}
              style={{ color: billingCycle === 'yearly' ? momentumOrange : (theme === 'dark' ? '#9CA3AF' : '#6B7280') }}
            >
              {cms('subscription.yearly', '') || 'Yearly'}
            </span>
            {billingCycle === 'yearly' && (
              <span
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: theme === 'dark' ? 'rgba(255, 107, 0, 0.2)' : '#FFF4ED',
                  color: momentumOrange
                }}
              >
                Save up to 17%
              </span>
            )}
          </div>
        </div>

        {/* Plans Grid */}
        {plans.length === 0 && !loading && !error ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No subscription plans available at this time.
            </p>
            <button
              onClick={loadPlans}
              className="px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-lg hover:shadow-xl"
              style={{ backgroundColor: momentumOrange }}
            >
              Refresh
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((plan) => {
              const price = getPrice(plan);
              const savings = getYearlySavings(plan);
              const isPopular = plan.planType === 'Pro';

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-2xl shadow-xl border-2 overflow-hidden transition-all hover:shadow-2xl ${
                    isPopular ? 'md:scale-105 md:-my-4' : ''
                  }`}
                  style={{
                    backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
                    borderColor: isPopular ? momentumOrange : (theme === 'dark' ? '#374151' : '#E5E7EB')
                  }}
                >
                  {/* Popular Badge */}
                  {isPopular && (
                    <div
                      className="absolute top-0 left-0 right-0 text-center py-2 text-sm font-bold text-white"
                      style={{ backgroundColor: momentumOrange }}
                    >
                      {cms('subscription.popular', '') || 'Most Popular'}
                    </div>
                  )}

                  <div className={`p-8 ${isPopular ? 'pt-14' : ''}`}>
                    {/* Plan Header */}
                    <div className="mb-6">
                      <div
                        className="w-14 h-14 rounded-xl flex items-center justify-center mb-4"
                        style={{
                          backgroundColor: isPopular ? momentumOrange : (theme === 'dark' ? '#374151' : lightAIGrey),
                          color: isPopular ? '#FFFFFF' : momentumOrange
                        }}
                      >
                        {getPlanIcon(plan.planType)}
                      </div>
                      <h3
                        className="text-2xl font-bold mb-2"
                        style={{ color: theme === 'dark' ? '#FFFFFF' : strategyBlue }}
                      >
                        {plan.name}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">
                        {plan.description}
                      </p>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span
                          className="text-4xl font-bold"
                          style={{ color: momentumOrange }}
                        >
                          {formatPrice(price, plan.currency)}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          /{billingCycle === 'yearly' ? 'year' : 'month'}
                        </span>
                      </div>
                      {billingCycle === 'yearly' && savings > 0 && (
                        <p
                          className="text-sm mt-1 font-medium"
                          style={{ color: theme === 'dark' ? '#34D399' : '#059669' }}
                        >
                          Save {formatPrice(savings, plan.currency)} per year
                        </p>
                      )}
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleSubscribe(plan)}
                      disabled={subscribingPlanId === plan.id}
                      className={`w-full py-3.5 px-6 rounded-xl font-semibold transition-all mb-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                        isPopular ? 'text-white shadow-lg hover:shadow-xl' : ''
                      }`}
                      style={{
                        backgroundColor: isPopular ? momentumOrange : 'transparent',
                        borderWidth: isPopular ? 0 : 2,
                        borderColor: momentumOrange,
                        color: isPopular ? '#FFFFFF' : momentumOrange
                      }}
                      onMouseEnter={(e) => {
                        if (isPopular) {
                          e.currentTarget.style.backgroundColor = momentumOrangeHover;
                        } else {
                          e.currentTarget.style.backgroundColor = momentumOrange;
                          e.currentTarget.style.color = '#FFFFFF';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (isPopular) {
                          e.currentTarget.style.backgroundColor = momentumOrange;
                        } else {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = momentumOrange;
                        }
                      }}
                    >
                      {subscribingPlanId === plan.id ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
                          <span>{cms('subscription.processing', '') || 'Processing...'}</span>
                        </>
                      ) : plan.planType === 'Free' ? (
                        cms('subscription.get_started', '') || 'Get Started'
                      ) : (
                        cms('subscription.subscribe', '') || 'Subscribe'
                      )}
                    </button>

                    {/* Gradient Divider */}
                    <div
                      className="h-px mb-6"
                      style={{
                        background: `linear-gradient(to right, transparent, ${theme === 'dark' ? '#374151' : '#E5E7EB'}, transparent)`
                      }}
                    />

                    {/* Features */}
                    <div className="space-y-3">
                      <FeatureItem
                        enabled={true}
                        theme={theme}
                        text={`${plan.maxBusinessPlans === 999999 ? 'Unlimited' : plan.maxBusinessPlans} Business Plans`}
                      />
                      <FeatureItem
                        enabled={true}
                        theme={theme}
                        text={`${plan.maxOrganizations === 999999 ? 'Unlimited' : plan.maxOrganizations} Organizations`}
                      />
                      <FeatureItem
                        enabled={true}
                        theme={theme}
                        text={`${plan.maxTeamMembers === 999999 ? 'Unlimited' : plan.maxTeamMembers} Team Members`}
                      />
                      <FeatureItem enabled={plan.hasAdvancedAI} theme={theme} text="Advanced AI Features" />
                      <FeatureItem enabled={plan.hasExportPDF} theme={theme} text="Export to PDF" />
                      <FeatureItem enabled={plan.hasExportWord} theme={theme} text="Export to Word" />
                      <FeatureItem enabled={plan.hasExportExcel} theme={theme} text="Export to Excel" />
                      <FeatureItem enabled={plan.hasPrioritySupport} theme={theme} text="Priority Support" />
                      <FeatureItem enabled={plan.hasCustomBranding} theme={theme} text="Custom Branding" />
                      <FeatureItem enabled={plan.hasAPIAccess} theme={theme} text="API Access" />
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

// Feature Item Component
function FeatureItem({ enabled, theme, text }: { enabled: boolean; theme: string; text: string }) {
  const momentumOrange = '#FF6B00';

  return (
    <div className="flex items-start gap-3">
      {enabled ? (
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ backgroundColor: theme === 'dark' ? 'rgba(255, 107, 0, 0.2)' : '#FFF4ED' }}
        >
          <Check className="w-3 h-3" style={{ color: momentumOrange }} />
        </div>
      ) : (
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ backgroundColor: theme === 'dark' ? 'rgba(107, 114, 128, 0.2)' : '#F3F4F6' }}
        >
          <X className="w-3 h-3" style={{ color: theme === 'dark' ? '#6B7280' : '#9CA3AF' }} />
        </div>
      )}
      <span
        className={`text-sm ${enabled ? '' : 'opacity-50'}`}
        style={{ color: theme === 'dark' ? (enabled ? '#D1D5DB' : '#6B7280') : (enabled ? '#374151' : '#9CA3AF') }}
      >
        {text}
      </span>
    </div>
  );
}
