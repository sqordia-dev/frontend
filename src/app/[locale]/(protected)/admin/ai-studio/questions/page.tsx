import type { Metadata } from 'next';
import AIStudioQuestionsContent from './AIStudioQuestionsContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    en: 'Question Prompts | AI Studio | Admin | Sqordia',
    fr: 'Prompts Questions | AI Studio | Admin | Sqordia',
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function AIStudioQuestionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <AIStudioQuestionsContent locale={locale} />;
}
