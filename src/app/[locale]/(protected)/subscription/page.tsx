import type { Metadata } from 'next';
import SubscriptionContent from './SubscriptionContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    en: 'Subscription | Sqordia',
    fr: 'Abonnement | Sqordia',
  };

  const descriptions = {
    en: 'Manage your Sqordia subscription and billing.',
    fr: 'Gérez votre abonnement Sqordia et votre facturation.',
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function SubscriptionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <SubscriptionContent locale={locale} />;
}
