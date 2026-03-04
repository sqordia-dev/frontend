'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  CreditCard,
  Check,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';

interface Subscription {
  plan: string;
  status: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

const translations = {
  en: {
    back: 'Back to Dashboard',
    title: 'Subscription',
    subtitle: 'Manage your subscription and billing preferences.',
    currentPlan: 'Current Plan',
    free: 'Free',
    starter: 'Starter',
    professional: 'Professional',
    enterprise: 'Enterprise',
    status: {
      active: 'Active',
      canceled: 'Canceled',
      pastDue: 'Past Due',
      trialing: 'Trial',
    },
    renewsOn: 'Renews on',
    cancelsOn: 'Cancels on',
    upgradeTitle: 'Upgrade Your Plan',
    upgradeSubtitle: 'Get more features and capabilities.',
    features: {
      free: ['1 business plan', 'Basic AI assistance', 'PDF export'],
      starter: ['5 business plans', 'Advanced AI assistance', 'PDF & Word export', 'Email support'],
      professional: ['Unlimited plans', 'Premium AI assistance', 'All export formats', 'Priority support', 'Custom branding'],
      enterprise: ['Everything in Professional', 'Dedicated account manager', 'Custom integrations', 'SLA guarantee'],
    },
    prices: {
      free: '$0',
      starter: '$19',
      professional: '$49',
      enterprise: 'Custom',
    },
    perMonth: '/month',
    currentPlanBadge: 'Current',
    upgradeButton: 'Upgrade',
    contactSales: 'Contact Sales',
    manageBilling: 'Manage Billing',
    cancelSubscription: 'Cancel Subscription',
  },
  fr: {
    back: 'Retour au tableau de bord',
    title: 'Abonnement',
    subtitle: 'Gérez votre abonnement et vos préférences de facturation.',
    currentPlan: 'Plan actuel',
    free: 'Gratuit',
    starter: 'Démarrage',
    professional: 'Professionnel',
    enterprise: 'Entreprise',
    status: {
      active: 'Actif',
      canceled: 'Annulé',
      pastDue: 'En retard',
      trialing: 'Essai',
    },
    renewsOn: 'Renouvellement le',
    cancelsOn: "S'annule le",
    upgradeTitle: 'Améliorez votre plan',
    upgradeSubtitle: 'Obtenez plus de fonctionnalités.',
    features: {
      free: ["1 plan d'affaires", 'Assistance IA de base', 'Export PDF'],
      starter: ["5 plans d'affaires", 'Assistance IA avancée', 'Export PDF & Word', 'Support par courriel'],
      professional: ['Plans illimités', 'Assistance IA premium', 'Tous les formats export', 'Support prioritaire', 'Marque personnalisée'],
      enterprise: ['Tout du Professionnel', 'Gestionnaire de compte dédié', 'Intégrations personnalisées', 'Garantie SLA'],
    },
    prices: {
      free: '0 $',
      starter: '19 $',
      professional: '49 $',
      enterprise: 'Sur mesure',
    },
    perMonth: '/mois',
    currentPlanBadge: 'Actuel',
    upgradeButton: 'Améliorer',
    contactSales: 'Contacter les ventes',
    manageBilling: 'Gérer la facturation',
    cancelSubscription: "Annuler l'abonnement",
  },
};

const plans = ['free', 'starter', 'professional', 'enterprise'] as const;

export default function SubscriptionContent({ locale }: { locale: string }) {
  const t = translations[locale as keyof typeof translations] || translations.en;
  const basePath = locale === 'fr' ? '/fr' : '';

  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubscription();
  }, []);

  const loadSubscription = async () => {
    try {
      const response = await fetch('/api/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      } else {
        // Default to free plan if no subscription
        setSubscription({ plan: 'free', status: 'active' });
      }
    } catch (error) {
      console.error('Failed to load subscription:', error);
      setSubscription({ plan: 'free', status: 'active' });
    } finally {
      setLoading(false);
    }
  };

  const currentPlan = subscription?.plan?.toLowerCase() || 'free';

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Back Button */}
      <Link
        href={`${basePath}/dashboard`}
        className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t.back}
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        {t.title}
      </h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        {t.subtitle}
      </p>

      {/* Current Plan Card */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#FF6B00]/10 rounded-xl">
              <CreditCard className="h-6 w-6 text-[#FF6B00]" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{t.currentPlan}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                {currentPlan === 'free' ? t.free : currentPlan === 'starter' ? t.starter : currentPlan === 'professional' ? t.professional : currentPlan === 'enterprise' ? t.enterprise : currentPlan}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              subscription?.status === 'active'
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            }`}>
              {t.status[subscription?.status as keyof typeof t.status] || subscription?.status}
            </span>
            {subscription?.currentPeriodEnd && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {subscription.cancelAtPeriodEnd ? t.cancelsOn : t.renewsOn}{' '}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString(locale === 'fr' ? 'fr-CA' : 'en-US')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t.upgradeTitle}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          {t.upgradeSubtitle}
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan) => {
            const isCurrentPlan = plan === currentPlan;
            const isProfessional = plan === 'professional';

            return (
              <div
                key={plan}
                className={`relative bg-white dark:bg-gray-800 rounded-xl border-2 p-5 ${
                  isProfessional
                    ? 'border-[#FF6B00]'
                    : isCurrentPlan
                      ? 'border-green-500'
                      : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                {isProfessional && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-[#FF6B00] text-white text-xs font-semibold rounded-full">
                      <Sparkles className="h-3 w-3" />
                      Popular
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {plan === 'free' ? t.free : plan === 'starter' ? t.starter : plan === 'professional' ? t.professional : t.enterprise}
                  </h3>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {t.prices[plan as keyof typeof t.prices]}
                    </span>
                    {plan !== 'enterprise' && (
                      <span className="text-gray-500 dark:text-gray-400 text-sm">
                        {t.perMonth}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-2 mb-5">
                  {t.features[plan as keyof typeof t.features].map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <div className="w-full py-2 text-center text-sm font-medium text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    {t.currentPlanBadge}
                  </div>
                ) : plan === 'enterprise' ? (
                  <button className="w-full py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                    {t.contactSales}
                  </button>
                ) : (
                  <button className="w-full py-2 text-sm font-medium text-white bg-[#FF6B00] hover:bg-[#E55F00] rounded-lg transition-colors flex items-center justify-center gap-1">
                    {t.upgradeButton}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Billing Actions */}
      {currentPlan !== 'free' && (
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
            {t.manageBilling}
          </button>
          <button className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
            {t.cancelSubscription}
          </button>
        </div>
      )}
    </div>
  );
}
