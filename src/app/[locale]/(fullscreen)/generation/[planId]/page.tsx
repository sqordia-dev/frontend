import type { Metadata } from 'next';
import GenerationContent from './GenerationContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; planId: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    en: 'Generating Your Business Plan | Sqordia',
    fr: "Generation de votre plan d'affaires | Sqordia",
  };

  const descriptions = {
    en: 'AI is generating your business plan.',
    fr: "L'IA genere votre plan d'affaires.",
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

export default async function GenerationPage({
  params,
}: {
  params: Promise<{ locale: string; planId: string }>;
}) {
  const { locale, planId } = await params;

  return <GenerationContent locale={locale} planId={planId} />;
}
