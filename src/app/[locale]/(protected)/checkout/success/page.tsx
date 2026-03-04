import type { Metadata } from 'next';
import CheckoutSuccessContent from './CheckoutSuccessContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    en: 'Checkout Success | Sqordia',
    fr: 'Paiement Reussi | Sqordia',
  };

  const descriptions = {
    en: 'Your subscription has been successfully activated',
    fr: 'Votre abonnement a ete active avec succes',
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

export default async function CheckoutSuccessPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <CheckoutSuccessContent locale={locale} />;
}
