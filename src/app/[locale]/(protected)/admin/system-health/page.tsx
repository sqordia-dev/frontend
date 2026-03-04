import type { Metadata } from 'next';
import AdminSystemHealthContent from './AdminSystemHealthContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'fr' ? 'Santé du système | Admin | Sqordia' : 'System Health | Admin | Sqordia',
    robots: { index: false, follow: false },
  };
}

export default async function AdminSystemHealthPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <AdminSystemHealthContent locale={locale} />;
}
