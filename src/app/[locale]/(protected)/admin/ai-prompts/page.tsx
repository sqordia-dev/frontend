import type { Metadata } from 'next';
import AdminAIPromptsContent from './AdminAIPromptsContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'fr' ? 'Prompts IA | Admin | Sqordia' : 'AI Prompts | Admin | Sqordia',
    robots: { index: false, follow: false },
  };
}

export default async function AdminAIPromptsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <AdminAIPromptsContent locale={locale} />;
}
