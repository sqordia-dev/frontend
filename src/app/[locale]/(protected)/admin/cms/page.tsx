import type { Metadata } from 'next';
import AdminCmsContent from './AdminCmsContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'fr' ? 'Gestionnaire de contenu | Admin | Sqordia' : 'Content Manager | Admin | Sqordia',
    robots: { index: false, follow: false },
  };
}

export default async function AdminCmsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <AdminCmsContent locale={locale} />;
}
