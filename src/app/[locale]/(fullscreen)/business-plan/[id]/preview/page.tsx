import type { Metadata } from 'next';
import PreviewContent from './PreviewContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    en: 'Business Plan Preview | Sqordia',
    fr: "Apercu du plan d'affaires | Sqordia",
  };

  const descriptions = {
    en: 'Preview and edit your business plan.',
    fr: "Visualisez et modifiez votre plan d'affaires.",
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

export default async function BusinessPlanPreviewPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  return <PreviewContent locale={locale} planId={id} />;
}
