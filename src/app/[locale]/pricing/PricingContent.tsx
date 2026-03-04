'use client';

import { useState } from 'react';
import { Check, X, Sparkles, Zap, Crown, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

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

const content = {
  en: {
    backToHome: 'Back to Home',
    title: 'Choose Your Plan',
    subtitle: 'Start free, upgrade as you grow. All plans include a 14-day free trial.',
    monthly: 'Monthly',
    yearly: 'Yearly',
    saveBadge: 'Save up to 17%',
    popular: 'Most Popular',
    getStarted: 'Get Started',
    subscribe: 'Subscribe Now',
    perMonth: '/month',
    perYear: '/year',
    savePerYear: 'Save {amount} per year',
    features: {
      businessPlans: '{count} Business Plans',
      organizations: '{count} Organizations',
      teamMembers: '{count} Team Members',
      advancedAI: 'Advanced AI Features',
      exportPDF: 'Export to PDF',
      exportWord: 'Export to Word',
      exportExcel: 'Export to Excel',
      prioritySupport: 'Priority Support',
      customBranding: 'Custom Branding',
      apiAccess: 'API Access',
      unlimited: 'Unlimited',
    },
    plans: {
      free: {
        name: 'Free',
        description: 'Perfect for getting started with business planning',
      },
      pro: {
        name: 'Pro',
        description: 'For growing businesses that need more features',
      },
      enterprise: {
        name: 'Enterprise',
        description: 'For large organizations with advanced needs',
      },
    },
    faq: {
      title: 'Frequently Asked Questions',
      items: [
        {
          question: 'Can I change plans later?',
          answer:
            'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.',
        },
        {
          question: 'What payment methods do you accept?',
          answer:
            'We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment processor.',
        },
        {
          question: 'Is there a free trial?',
          answer:
            'Yes! All paid plans come with a 14-day free trial. No credit card required to start.',
        },
      ],
    },
  },
  fr: {
    backToHome: "Retour à l'accueil",
    title: 'Choisissez votre plan',
    subtitle:
      "Commencez gratuitement, évoluez selon vos besoins. Tous les plans incluent un essai gratuit de 14 jours.",
    monthly: 'Mensuel',
    yearly: 'Annuel',
    saveBadge: "Économisez jusqu'à 17%",
    popular: 'Le plus populaire',
    getStarted: 'Commencer',
    subscribe: "S'abonner",
    perMonth: '/mois',
    perYear: '/an',
    savePerYear: 'Économisez {amount} par an',
    features: {
      businessPlans: "{count} Plans d'affaires",
      organizations: '{count} Organisations',
      teamMembers: "{count} Membres d'équipe",
      advancedAI: 'Fonctionnalités IA avancées',
      exportPDF: 'Export PDF',
      exportWord: 'Export Word',
      exportExcel: 'Export Excel',
      prioritySupport: 'Support prioritaire',
      customBranding: 'Marque personnalisée',
      apiAccess: 'Accès API',
      unlimited: 'Illimité',
    },
    plans: {
      free: {
        name: 'Gratuit',
        description: "Parfait pour commencer la planification d'affaires",
      },
      pro: {
        name: 'Pro',
        description: 'Pour les entreprises en croissance qui ont besoin de plus de fonctionnalités',
      },
      enterprise: {
        name: 'Entreprise',
        description: 'Pour les grandes organisations avec des besoins avancés',
      },
    },
    faq: {
      title: 'Questions fréquentes',
      items: [
        {
          question: 'Puis-je changer de plan plus tard?',
          answer:
            "Oui, vous pouvez mettre à niveau ou rétrograder votre plan à tout moment. Les changements prennent effet immédiatement.",
        },
        {
          question: 'Quels modes de paiement acceptez-vous?',
          answer:
            'Nous acceptons toutes les principales cartes de crédit (Visa, Mastercard, American Express) via notre processeur de paiement sécurisé.',
        },
        {
          question: "Y a-t-il un essai gratuit?",
          answer:
            "Oui! Tous les plans payants incluent un essai gratuit de 14 jours. Aucune carte de crédit requise pour commencer.",
        },
      ],
    },
  },
};

// Static default plans for SSG
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
    hasAPIAccess: false,
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
    hasAPIAccess: false,
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
    hasAPIAccess: true,
  },
];

export default function PricingContent({ locale }: { locale: string }) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const t = content[locale as keyof typeof content] || content.en;
  const plans = defaultPlans;

  const formatPrice = (price: number, currency: string = 'CAD') => {
    return new Intl.NumberFormat(locale === 'fr' ? 'fr-CA' : 'en-CA', {
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

  const getPlanContent = (planType: string) => {
    switch (planType.toLowerCase()) {
      case 'pro':
        return t.plans.pro;
      case 'enterprise':
        return t.plans.enterprise;
      default:
        return t.plans.free;
    }
  };

  const formatCount = (count: number) => {
    return count === 999999 ? t.features.unlimited : count.toString();
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link
          href={locale === 'fr' ? '/fr' : '/'}
          className="inline-flex items-center gap-2 mb-8 text-[#1A2B47] dark:text-gray-300 hover:text-[#FF6B00] transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">{t.backToHome}</span>
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-[#1A2B47] dark:text-white mb-4">
            {t.title}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            {t.subtitle}
          </p>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center gap-4 p-2 rounded-xl bg-white dark:bg-gray-800">
            <span
              className={`text-sm font-semibold transition-colors ${
                billingCycle === 'monthly' ? 'text-[#FF6B00]' : 'text-gray-400'
              }`}
            >
              {t.monthly}
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-7 w-12 items-center rounded-full bg-[#FF6B00] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:ring-offset-2"
              aria-label="Toggle billing cycle"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span
              className={`text-sm font-semibold transition-colors ${
                billingCycle === 'yearly' ? 'text-[#FF6B00]' : 'text-gray-400'
              }`}
            >
              {t.yearly}
            </span>
            {billingCycle === 'yearly' && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFF4ED] dark:bg-[#FF6B00]/20 text-[#FF6B00]">
                {t.saveBadge}
              </span>
            )}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-16">
          {plans.map((plan) => {
            const price = getPrice(plan);
            const savings = getYearlySavings(plan);
            const isPopular = plan.planType === 'Pro';
            const planContent = getPlanContent(plan.planType);

            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl shadow-xl border-2 overflow-hidden transition-all hover:shadow-2xl bg-white dark:bg-gray-800 ${
                  isPopular ? 'md:scale-105 md:-my-4 border-[#FF6B00]' : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {/* Popular Badge */}
                {isPopular && (
                  <div className="absolute top-0 left-0 right-0 text-center py-2 text-sm font-bold text-white bg-[#FF6B00]">
                    {t.popular}
                  </div>
                )}

                <div className={`p-8 ${isPopular ? 'pt-14' : ''}`}>
                  {/* Plan Header */}
                  <div className="mb-6">
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                        isPopular
                          ? 'bg-[#FF6B00] text-white'
                          : 'bg-[#F4F7FA] dark:bg-gray-700 text-[#FF6B00]'
                      }`}
                    >
                      {getPlanIcon(plan.planType)}
                    </div>
                    <h3 className="text-2xl font-bold text-[#1A2B47] dark:text-white mb-2">
                      {planContent.name}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {planContent.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-[#FF6B00]">
                        {formatPrice(price, plan.currency)}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        {billingCycle === 'yearly' ? t.perYear : t.perMonth}
                      </span>
                    </div>
                    {billingCycle === 'yearly' && savings > 0 && (
                      <p className="text-sm mt-1 font-medium text-green-600 dark:text-green-400">
                        {t.savePerYear.replace('{amount}', formatPrice(savings, plan.currency))}
                      </p>
                    )}
                  </div>

                  {/* CTA Button */}
                  <Link
                    href={locale === 'fr' ? '/fr/signup' : '/signup'}
                    className={`block w-full py-3.5 px-6 rounded-xl font-semibold transition-all mb-6 text-center ${
                      isPopular
                        ? 'bg-[#FF6B00] text-white hover:bg-[#E55F00] shadow-lg hover:shadow-xl'
                        : 'border-2 border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white'
                    }`}
                  >
                    {plan.planType === 'Free' ? t.getStarted : t.subscribe}
                  </Link>

                  {/* Divider */}
                  <div className="h-px mb-6 bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />

                  {/* Features */}
                  <div className="space-y-3">
                    <FeatureItem
                      enabled={true}
                      text={t.features.businessPlans.replace(
                        '{count}',
                        formatCount(plan.maxBusinessPlans)
                      )}
                    />
                    <FeatureItem
                      enabled={true}
                      text={t.features.organizations.replace(
                        '{count}',
                        formatCount(plan.maxOrganizations)
                      )}
                    />
                    <FeatureItem
                      enabled={true}
                      text={t.features.teamMembers.replace(
                        '{count}',
                        formatCount(plan.maxTeamMembers)
                      )}
                    />
                    <FeatureItem enabled={plan.hasAdvancedAI} text={t.features.advancedAI} />
                    <FeatureItem enabled={plan.hasExportPDF} text={t.features.exportPDF} />
                    <FeatureItem enabled={plan.hasExportWord} text={t.features.exportWord} />
                    <FeatureItem enabled={plan.hasExportExcel} text={t.features.exportExcel} />
                    <FeatureItem enabled={plan.hasPrioritySupport} text={t.features.prioritySupport} />
                    <FeatureItem enabled={plan.hasCustomBranding} text={t.features.customBranding} />
                    <FeatureItem enabled={plan.hasAPIAccess} text={t.features.apiAccess} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-[#1A2B47] dark:text-white text-center mb-8">
            {t.faq.title}
          </h2>
          <div className="space-y-4">
            {t.faq.items.map((item, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
              >
                <h3 className="text-lg font-semibold text-[#1A2B47] dark:text-white mb-2">
                  {item.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureItem({ enabled, text }: { enabled: boolean; text: string }) {
  return (
    <div className="flex items-start gap-3">
      {enabled ? (
        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-[#FFF4ED] dark:bg-[#FF6B00]/20">
          <Check className="w-3 h-3 text-[#FF6B00]" />
        </div>
      ) : (
        <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 bg-gray-100 dark:bg-gray-700">
          <X className="w-3 h-3 text-gray-400" />
        </div>
      )}
      <span
        className={`text-sm ${
          enabled
            ? 'text-gray-700 dark:text-gray-300'
            : 'text-gray-400 dark:text-gray-500 opacity-50'
        }`}
      >
        {text}
      </span>
    </div>
  );
}
