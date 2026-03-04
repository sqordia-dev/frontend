import type { Metadata } from 'next';
import TemplateDetailContent from './TemplateDetailContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; templateId: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  return {
    title: locale === 'fr' ? 'Modele de Plan d\'Affaires | Sqordia' : 'Business Plan Template | Sqordia',
    description: locale === 'fr'
      ? 'Explorez ce modele de plan d\'affaires professionnel.'
      : 'Explore this professional business plan template.',
  };
}

export default async function TemplateDetailPage({
  params,
}: {
  params: Promise<{ locale: string; templateId: string }>;
}) {
  const { locale, templateId } = await params;

  return <TemplateDetailContent locale={locale} templateId={templateId} />;
}
