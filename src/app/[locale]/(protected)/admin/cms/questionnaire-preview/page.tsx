import type { Metadata } from 'next';
import AdminQuestionnairePreviewContent from './AdminQuestionnairePreviewContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    en: 'Questionnaire Preview | Admin | Sqordia',
    fr: 'Apercu du Questionnaire | Admin | Sqordia',
  };

  const descriptions = {
    en: 'Preview the questionnaire as it would appear to users.',
    fr: 'Previsualiser le questionnaire tel qu\'il apparaitrait aux utilisateurs.',
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

export default async function AdminQuestionnairePreviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <AdminQuestionnairePreviewContent locale={locale} />;
}
