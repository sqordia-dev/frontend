import type { Metadata } from 'next';
import SubscriptionPlansContent from './SubscriptionPlansContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    en: 'Subscription Plans | Sqordia',
    fr: "Plans d'Abonnement | Sqordia",
  };

  const descriptions = {
    en: 'Choose the Sqordia subscription plan that fits your needs.',
    fr: "Choisissez le plan d'abonnement Sqordia qui correspond a vos besoins.",
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
  };
}

export default async function SubscriptionPlansPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <SubscriptionPlansContent locale={locale} />;
}
