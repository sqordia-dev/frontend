import type { Metadata } from 'next';
import CmsQuestionnaireContent from './CmsQuestionnaireContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    en: 'CMS Questionnaire | Admin | Sqordia',
    fr: 'CMS Questionnaire | Admin | Sqordia',
  };

  const descriptions = {
    en: 'Manage questionnaire templates and questions.',
    fr: 'Gerez les modeles de questionnaires et les questions.',
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

export default async function CmsQuestionnairePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <CmsQuestionnaireContent locale={locale} />;
}
