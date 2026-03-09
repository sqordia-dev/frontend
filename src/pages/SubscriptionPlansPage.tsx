import { useState, useEffect } from 'react';
import { Check, X, Sparkles, Zap, Crown, Building2, ArrowLeft, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiClient } from '../lib/api-client';
import { useNavigate } from 'react-router-dom';
import { organizationService } from '../lib/organization-service';
import { subscriptionService } from '../lib/subscription-service';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
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

const T = {
  en: {
    back: 'Back',
    title: 'Choose Your Plan',
    subtitle: 'Select the perfect plan for your business needs',
    monthly: 'Monthly',
    yearly: 'Yearly',
    saveUpTo: 'Save up to 17%',
    perMonth: '/month',
    perYear: '/year',
    save: 'Save',
    perYearSuffix: 'per year',
    getStarted: 'Get Started Free',
    subscribe: 'Subscribe Now',
    mostPopular: 'Most Popular',
    processing: 'Processing...',
    unlimited: 'Unlimited',
    businessPlans: 'Business Plans',
    organizations: 'Organizations',
    teamMembers: 'Team Members',
    advancedAI: 'Advanced AI Features',
    exportPDF: 'Export to PDF',
    exportWord: 'Export to Word',
    exportExcel: 'Export to Excel',
    prioritySupport: 'Priority Support',
    customBranding: 'Custom Branding',
    apiAccess: 'API Access',
    seeFeatures: 'See all features',
    hideFeatures: 'Hide features',
    noPlans: 'No subscription plans available at this time.',
    refresh: 'Refresh',
    retry: 'Retry',
    loading: 'Loading plans...',
    createOrgTitle: 'Create an Organization First',
    createOrgDesc: 'You need to create an organization before subscribing. This helps us organize your business plans and team members.',
    orgName: 'Organization Name',
    orgDescription: 'Description (Optional)',
    orgNamePlaceholder: 'Enter your organization name',
    orgDescPlaceholder: 'Tell us about your organization',
    creating: 'Creating...',
    createOrganization: 'Create Organization',
    goToDashboard: 'Go to Dashboard',
    loginRequired: 'Please log in to subscribe to a plan.',
    orgRequired: 'Please create an organization first.',
    planChanged: 'Plan changed successfully!',
    subscribed: 'Successfully subscribed!',
    errorSubscribe: 'Failed to subscribe',
    required: '*',
  },
  fr: {
    back: 'Retour',
    title: 'Choisissez votre plan',
    subtitle: 'Sélectionnez le plan parfait pour vos besoins',
    monthly: 'Mensuel',
    yearly: 'Annuel',
    saveUpTo: "Économisez jusqu'à 17%",
    perMonth: '/mois',
    perYear: '/an',
    save: 'Économisez',
    perYearSuffix: 'par an',
    getStarted: 'Commencer gratuitement',
    subscribe: "S'abonner maintenant",
    mostPopular: 'Le plus populaire',
    processing: 'Traitement...',
    unlimited: 'Illimité',
    businessPlans: "Plans d'affaires",
    organizations: 'Organisations',
    teamMembers: "Membres d'équipe",
    advancedAI: 'Fonctionnalités IA avancées',
    exportPDF: 'Export PDF',
    exportWord: 'Export Word',
    exportExcel: 'Export Excel',
    prioritySupport: 'Support prioritaire',
    customBranding: 'Marque personnalisée',
    apiAccess: 'Accès API',
    seeFeatures: 'Voir les fonctionnalités',
    hideFeatures: 'Masquer les fonctionnalités',
    noPlans: 'Aucun plan disponible pour le moment.',
    refresh: 'Actualiser',
    retry: 'Réessayer',
    loading: 'Chargement des plans...',
    createOrgTitle: "Créez d'abord une organisation",
    createOrgDesc: "Vous devez créer une organisation avant de vous abonner. Cela nous aide à organiser vos plans d'affaires et vos membres.",
    orgName: "Nom de l'organisation",
    orgDescription: 'Description (Optionnel)',
    orgNamePlaceholder: "Entrez le nom de votre organisation",
    orgDescPlaceholder: 'Parlez-nous de votre organisation',
    creating: 'Création...',
    createOrganization: "Créer l'organisation",
    goToDashboard: 'Aller au tableau de bord',
    loginRequired: 'Veuillez vous connecter pour vous abonner.',
    orgRequired: "Veuillez d'abord créer une organisation.",
    planChanged: 'Plan modifié avec succès!',
    subscribed: 'Abonnement réussi!',
    errorSubscribe: "Échec de l'abonnement",
    required: '*',
  },
};

export default function SubscriptionPlansPage() {
  const navigate = useNavigate();
  const { language } = useTheme();
  const toast = useToast();
  const { getContent: cms } = useCmsContent('subscription');
  const t = T[language as keyof typeof T] ?? T.en;
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
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

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
        const orgsData = orgsResponse.data as { isSuccess?: boolean; value?: any[] } | any[];
        const orgs = (orgsData && typeof orgsData === 'object' && 'isSuccess' in orgsData && orgsData.isSuccess)
          ? (orgsData.value || [])
          : (Array.isArray(orgsData) ? orgsData : []);
        setOrganizations(orgs);
        setNeedsOrganization(orgs.length === 0);
      } catch (e: any) {
        const status = e.response?.status;
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
          setOrganizations([]);
          setNeedsOrganization(!!token);
        }
      }
    } catch {
      const token = localStorage.getItem('accessToken');
      setOrganizations([]);
      setNeedsOrganization(!!token);
    } finally {
      setLoadingOrgs(false);
    }
  };

  const handleCreateOrganization = async () => {
    if (!orgName.trim()) {
      setError(t.orgName + ' is required');
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
      const responseData = response.data as { isSuccess?: boolean; value?: SubscriptionPlan[] } | SubscriptionPlan[];

      if (responseData && typeof responseData === 'object' && 'isSuccess' in responseData && responseData.isSuccess && responseData.value) {
        plansData = Array.isArray(responseData.value) ? responseData.value : [];
      } else if (Array.isArray(responseData)) {
        plansData = responseData;
      } else if (responseData && typeof responseData === 'object' && 'value' in responseData && Array.isArray(responseData.value)) {
        plansData = responseData.value;
      }

      plansData.sort((a, b) => {
        const orderA = (a as any).displayOrder ?? getPlanOrder(a.planType);
        const orderB = (b as any).displayOrder ?? getPlanOrder(b.planType);
        return orderA - orderB;
      });

      setPlans(plansData);
      // Auto-expand Pro card features
      const proIdx = plansData.findIndex(p => p.planType === 'Pro');
      if (proIdx >= 0) setExpandedPlanId(plansData[proIdx].id);

      if (plansData.length === 0) {
        setError('No subscription plans available. Please contact support.');
      }
    } catch (err: any) {
      if (err.response?.status === 400 || err.response?.status === 404) {
        const defaultPlans: SubscriptionPlan[] = [
          {
            id: 'free',
            planType: 'Free',
            name: language === 'fr' ? 'Plan Gratuit' : 'Free Plan',
            description: language === 'fr' ? 'Parfait pour commencer' : 'Perfect for getting started',
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
            name: language === 'fr' ? 'Plan Pro' : 'Pro Plan',
            description: language === 'fr' ? 'Pour les entreprises en croissance' : 'For growing businesses',
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
            name: language === 'fr' ? 'Plan Entreprise' : 'Enterprise Plan',
            description: language === 'fr' ? 'Pour les grandes organisations' : 'For large organizations',
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
        setExpandedPlanId('pro');
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
        return <Crown className="w-7 h-7" />;
      case 'enterprise':
        return <Sparkles className="w-7 h-7" />;
      default:
        return <Zap className="w-7 h-7" />;
    }
  };

  const formatPrice = (price: number, currency: string = 'CAD') => {
    return new Intl.NumberFormat(language === 'fr' ? 'fr-CA' : 'en-CA', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const getPrice = (plan: SubscriptionPlan) => {
    return billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
  };

  const getYearlySavings = (plan: SubscriptionPlan) => {
    if (plan.monthlyPrice === 0) return 0;
    return plan.monthlyPrice * 12 - plan.yearlyPrice;
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    try {
      setSubscribingPlanId(plan.id);

      const token = localStorage.getItem('accessToken');
      if (!token) {
        toast.warning('Authentication Required', cms('subscription.login_required', 'subscription.loginRequired') || t.loginRequired);
        navigate('/login');
        return;
      }

      if (organizations.length === 0) {
        toast.warning('Organization Required', cms('subscription.org_required', 'subscription.orgRequired') || t.orgRequired);
        window.location.reload();
        return;
      }

      const organizationId = organizations[0].id;

      let existingSubscription = null;
      try {
        existingSubscription = await subscriptionService.getCurrent();
      } catch {
        // No existing subscription
      }

      if (plan.planType === 'Free') {
        if (existingSubscription) {
          await subscriptionService.changePlan(plan.id, billingCycle === 'yearly');
          toast.success('Plan Changed', cms('subscription.plan_changed', 'subscription.planChanged') || t.planChanged);
          navigate('/subscription');
        } else {
          await subscriptionService.subscribe(plan.id, organizationId, billingCycle === 'yearly');
          toast.success('Subscribed', cms('subscription.subscribed', 'subscription.subscribed') || t.subscribed);
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
      const errorMessage = err.message ||
                         err.response?.data?.message ||
                         err.response?.data?.errorMessage ||
                         t.errorSubscribe;
      toast.error('Subscription Error', cms('subscription.error', 'subscription.error') || `${t.errorSubscribe}: ${errorMessage}`);
    } finally {
      setSubscribingPlanId(null);
    }
  };

  const getFeatures = (plan: SubscriptionPlan) => [
    { enabled: true, text: `${plan.maxBusinessPlans === 999999 ? t.unlimited : plan.maxBusinessPlans} ${t.businessPlans}` },
    { enabled: true, text: `${plan.maxOrganizations === 999999 ? t.unlimited : plan.maxOrganizations} ${t.organizations}` },
    { enabled: true, text: `${plan.maxTeamMembers === 999999 ? t.unlimited : plan.maxTeamMembers} ${t.teamMembers}` },
    { enabled: plan.hasAdvancedAI, text: t.advancedAI },
    { enabled: plan.hasExportPDF, text: t.exportPDF },
    { enabled: plan.hasExportWord, text: t.exportWord },
    { enabled: plan.hasExportExcel, text: t.exportExcel },
    { enabled: plan.hasPrioritySupport, text: t.prioritySupport },
    { enabled: plan.hasCustomBranding, text: t.customBranding },
    { enabled: plan.hasAPIAccess, text: t.apiAccess },
  ];

  // ── Loading ──────────────────────────────────────────
  if (loading || loadingOrgs) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-ai-grey dark:bg-gray-900">
        <div className="text-center">
          <div className="relative w-14 h-14 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-slate-200 dark:border-slate-700" />
            <div className="absolute inset-0 rounded-full border-4 border-t-momentum-orange border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{t.loading}</p>
        </div>
      </div>
    );
  }

  // ── Organization Creation ────────────────────────────
  if (needsOrganization) {
    return (
      <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-light-ai-grey dark:bg-gray-900">
        <div className="max-w-xl mx-auto animate-fade-in-up">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-card border border-slate-200 dark:border-slate-700 p-8">
            <div className="text-center mb-8">
              <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-xl bg-strategy-blue mb-4">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <h1 className="text-display-sm text-strategy-blue dark:text-white mb-2">
                {t.createOrgTitle}
              </h1>
              <p className="text-body-sm text-slate-500 dark:text-slate-400">
                {t.createOrgDesc}
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl border border-red-200 dark:border-red-800/50 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label htmlFor="orgName" className="block text-label-md text-strategy-blue dark:text-slate-200 mb-2">
                  {t.orgName} <span className="text-red-500">{t.required}</span>
                </label>
                <input
                  id="orgName"
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-strategy-blue dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-momentum-orange/40 focus:border-momentum-orange transition-all"
                  placeholder={t.orgNamePlaceholder}
                  disabled={creatingOrg}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && orgName.trim() && !creatingOrg) {
                      handleCreateOrganization();
                    }
                  }}
                />
              </div>

              <div>
                <label htmlFor="orgDescription" className="block text-label-md text-strategy-blue dark:text-slate-200 mb-2">
                  {t.orgDescription}
                </label>
                <textarea
                  id="orgDescription"
                  value={orgDescription}
                  onChange={(e) => setOrgDescription(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-strategy-blue dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-momentum-orange/40 focus:border-momentum-orange transition-all resize-none"
                  placeholder={t.orgDescPlaceholder}
                  rows={4}
                  disabled={creatingOrg}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  disabled={creatingOrg}
                >
                  {t.goToDashboard}
                </button>
                <button
                  onClick={handleCreateOrganization}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-momentum-orange hover:bg-[#E55F00] shadow-md shadow-momentum-orange/25 hover:shadow-lg hover:shadow-momentum-orange/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={creatingOrg || !orgName.trim()}
                >
                  {creatingOrg ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>{t.creating}</span>
                    </>
                  ) : (
                    <span>{t.createOrganization}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-light-ai-grey dark:bg-gray-900">
        <div className="text-center max-w-md">
          <p className="mb-4 text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={loadPlans}
            className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-momentum-orange hover:bg-[#E55F00] shadow-md shadow-momentum-orange/25 transition-all"
          >
            {t.retry}
          </button>
        </div>
      </div>
    );
  }

  // ── Main Plans Page ──────────────────────────────────
  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 lg:px-8 bg-light-ai-grey dark:bg-gray-900">
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

      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 mb-8 text-strategy-blue dark:text-slate-300 hover:text-momentum-orange dark:hover:text-momentum-orange transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">{t.back}</span>
        </button>

        {/* Header */}
        <div className="text-center mb-10 animate-fade-in-up">
          <h1 className="text-display-md md:text-display-lg text-strategy-blue dark:text-white mb-3">
            {cms('subscription.page_title', '') || t.title}
          </h1>
          <p className="text-body-md text-slate-500 dark:text-slate-400 mb-8 max-w-xl mx-auto">
            {t.subtitle}
          </p>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-soft">
            <span
              className={`text-sm font-semibold transition-colors ${
                billingCycle === 'monthly' ? 'text-momentum-orange' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {cms('subscription.monthly', '') || t.monthly}
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-7 w-12 items-center rounded-full bg-momentum-orange transition-colors focus:outline-none focus:ring-2 focus:ring-momentum-orange/40 focus:ring-offset-2 dark:focus:ring-offset-slate-800"
            >
              <span
                className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span
              className={`text-sm font-semibold transition-colors ${
                billingCycle === 'yearly' ? 'text-momentum-orange' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {cms('subscription.yearly', '') || t.yearly}
            </span>
            {billingCycle === 'yearly' && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
                {t.saveUpTo}
              </span>
            )}
          </div>
        </div>

        {/* Plans Grid */}
        {plans.length === 0 && !loading && !error ? (
          <div className="text-center py-12">
            <p className="text-slate-500 dark:text-slate-400 mb-4">{t.noPlans}</p>
            <button
              onClick={loadPlans}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-momentum-orange hover:bg-[#E55F00] transition-colors"
            >
              {t.refresh}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 items-start">
            {plans.map((plan, i) => {
              const price = getPrice(plan);
              const savings = getYearlySavings(plan);
              const isPopular = plan.planType === 'Pro';
              const features = getFeatures(plan);
              const isExpanded = expandedPlanId === plan.id;

              return (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1, duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                  layout
                  className={`relative rounded-2xl border overflow-hidden transition-shadow duration-300 bg-white dark:bg-slate-800 ${
                    isPopular
                      ? 'border-momentum-orange/50 shadow-glow-orange ring-1 ring-momentum-orange/10'
                      : 'border-slate-200 dark:border-slate-700 shadow-card hover:shadow-card-hover'
                  }`}
                >
                  {/* Popular Badge */}
                  {isPopular && (
                    <div className="bg-momentum-orange text-center py-1.5 text-xs font-bold text-white tracking-wider uppercase">
                      {cms('subscription.popular', '') || t.mostPopular}
                    </div>
                  )}

                  <div className="p-6">
                    {/* Icon + Name */}
                    <div className="flex items-start gap-3.5 mb-5">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isPopular
                            ? 'bg-momentum-orange text-white shadow-md shadow-momentum-orange/20'
                            : 'bg-momentum-orange/10 dark:bg-momentum-orange/15 text-momentum-orange'
                        }`}
                      >
                        {getPlanIcon(plan.planType)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-heading-lg text-strategy-blue dark:text-white">
                          {plan.name}
                        </h3>
                        <p className="text-body-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {plan.description}
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-4xl font-bold text-strategy-blue dark:text-white tracking-tight">
                          {formatPrice(price, plan.currency)}
                        </span>
                        <span className="text-sm text-slate-400 dark:text-slate-500">
                          {billingCycle === 'yearly' ? t.perYear : t.perMonth}
                        </span>
                      </div>
                      {billingCycle === 'yearly' && savings > 0 && (
                        <p className="text-xs mt-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                          {t.save} {formatPrice(savings, plan.currency)} {t.perYearSuffix}
                        </p>
                      )}
                    </div>

                    {/* CTA Button */}
                    <button
                      onClick={() => handleSubscribe(plan)}
                      disabled={subscribingPlanId === plan.id}
                      className={`w-full py-3 px-6 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] ${
                        isPopular
                          ? 'bg-momentum-orange text-white shadow-lg shadow-momentum-orange/20 hover:bg-[#E56000] hover:shadow-xl hover:shadow-momentum-orange/25'
                          : 'border-2 border-momentum-orange text-momentum-orange hover:bg-momentum-orange hover:text-white'
                      }`}
                    >
                      {subscribingPlanId === plan.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                          <span>{cms('subscription.processing', '') || t.processing}</span>
                        </>
                      ) : plan.planType === 'Free' ? (
                        cms('subscription.get_started', '') || t.getStarted
                      ) : (
                        cms('subscription.subscribe', '') || t.subscribe
                      )}
                    </button>

                    {/* ── Expandable Features Accordion ──────── */}
                    <div className="mt-4">
                      <button
                        onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                        className="w-full flex items-center justify-between py-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-strategy-blue dark:hover:text-slate-200 transition-colors"
                      >
                        <span>{isExpanded ? t.hideFeatures : t.seeFeatures}</span>
                        <motion.div
                          animate={{ rotate: isExpanded ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </motion.div>
                      </button>

                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-700 to-transparent mb-3" />
                            <ul className="space-y-2.5 pb-1">
                              {features.map((feature, idx) => (
                                <motion.li
                                  key={idx}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: idx * 0.03, duration: 0.2 }}
                                  className="flex items-center gap-2.5"
                                >
                                  {feature.enabled ? (
                                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-momentum-orange/10 dark:bg-momentum-orange/15">
                                      <Check className="w-3 h-3 text-momentum-orange" />
                                    </div>
                                  ) : (
                                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-100 dark:bg-slate-700">
                                      <X className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                                    </div>
                                  )}
                                  <span
                                    className={`text-sm ${
                                      feature.enabled
                                        ? 'text-slate-700 dark:text-slate-200'
                                        : 'text-slate-400 dark:text-slate-500 line-through'
                                    }`}
                                  >
                                    {feature.text}
                                  </span>
                                </motion.li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
