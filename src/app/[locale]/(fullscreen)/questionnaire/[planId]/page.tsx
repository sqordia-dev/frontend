import type { Metadata } from 'next';
import QuestionnaireContent from './QuestionnaireContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; planId: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    en: 'Business Plan Interview | Sqordia',
    fr: "Entrevue plan d'affaires | Sqordia",
  };

  const descriptions = {
    en: 'Answer questions to create your business plan with AI assistance.',
    fr: "Repondez aux questions pour creer votre plan d'affaires avec l'aide de l'IA.",
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

export default async function QuestionnairePage({
  params,
}: {
  params: Promise<{ locale: string; planId: string }>;
}) {
  const { locale, planId } = await params;

  return <QuestionnaireContent locale={locale} planId={planId} />;
}
