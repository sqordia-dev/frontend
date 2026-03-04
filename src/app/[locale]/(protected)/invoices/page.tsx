import type { Metadata } from 'next';
import InvoicesContent from './InvoicesContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    en: 'Invoices | Sqordia',
    fr: 'Factures | Sqordia',
  };

  const descriptions = {
    en: 'View and download your invoices and payment history.',
    fr: 'Consultez et téléchargez vos factures et votre historique de paiement.',
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

export default async function InvoicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <InvoicesContent locale={locale} />;
}
