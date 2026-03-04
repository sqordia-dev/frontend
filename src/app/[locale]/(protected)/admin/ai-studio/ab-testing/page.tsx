import type { Metadata } from 'next';
import AIStudioABTestingContent from './AIStudioABTestingContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    en: 'A/B Testing | AI Studio | Admin | Sqordia',
    fr: 'Tests A/B | AI Studio | Admin | Sqordia',
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function AIStudioABTestingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <AIStudioABTestingContent locale={locale} />;
}
