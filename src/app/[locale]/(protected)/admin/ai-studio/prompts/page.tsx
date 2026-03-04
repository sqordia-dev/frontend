import type { Metadata } from 'next';
import AIStudioPromptsContent from './AIStudioPromptsContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    en: 'Prompt Templates | AI Studio | Admin | Sqordia',
    fr: 'Templates de Prompts | AI Studio | Admin | Sqordia',
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function AIStudioPromptsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <AIStudioPromptsContent locale={locale} />;
}
