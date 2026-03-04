import type { Metadata } from 'next';
import PromptRegistryDocsContent from './PromptRegistryDocsContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'fr' ? 'Documentation Registre de Prompts | Admin | Sqordia' : 'Prompt Registry Docs | Admin | Sqordia',
    robots: { index: false, follow: false },
  };
}

export default async function PromptRegistryDocsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <PromptRegistryDocsContent locale={locale} />;
}
