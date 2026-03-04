import type { Metadata } from 'next';
import AIStudioPromptEditorContent from './AIStudioPromptEditorContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    en: 'Edit Prompt | AI Studio | Admin | Sqordia',
    fr: 'Modifier le Prompt | AI Studio | Admin | Sqordia',
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function AIStudioPromptEditorPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale } = await params;

  return <AIStudioPromptEditorContent locale={locale} />;
}
