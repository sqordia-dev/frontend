import type { Metadata } from 'next';
import AIStudioConfigContent from './AIStudioConfigContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    en: 'AI Configuration | AI Studio | Admin | Sqordia',
    fr: 'Configuration IA | AI Studio | Admin | Sqordia',
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function AIStudioConfigPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <AIStudioConfigContent locale={locale} />;
}
