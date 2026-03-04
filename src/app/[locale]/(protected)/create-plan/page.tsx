import type { Metadata } from 'next';
import CreatePlanContent from './CreatePlanContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    en: 'New Project | Sqordia',
    fr: 'Nouveau projet | Sqordia',
  };

  const descriptions = {
    en: 'Create a new business plan with AI-powered guidance.',
    fr: "Créez un nouveau plan d'affaires avec l'accompagnement IA.",
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

export default async function CreatePlanPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <CreatePlanContent locale={locale} />;
}
