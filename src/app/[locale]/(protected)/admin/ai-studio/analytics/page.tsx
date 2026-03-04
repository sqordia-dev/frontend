import type { Metadata } from 'next';
import AIStudioAnalyticsContent from './AIStudioAnalyticsContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    en: 'Analytics | AI Studio | Admin | Sqordia',
    fr: 'Analytics | AI Studio | Admin | Sqordia',
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function AIStudioAnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <AIStudioAnalyticsContent locale={locale} />;
}
