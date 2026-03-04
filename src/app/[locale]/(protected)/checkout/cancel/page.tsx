import type { Metadata } from 'next';
import CheckoutCancelContent from './CheckoutCancelContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    en: 'Checkout Cancelled | Sqordia',
    fr: 'Paiement Annule | Sqordia',
  };

  const descriptions = {
    en: 'Your payment was cancelled',
    fr: 'Votre paiement a ete annule',
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

export default async function CheckoutCancelPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <CheckoutCancelContent locale={locale} />;
}
