import type { Metadata } from 'next';
import AdminOrganizationsContent from './AdminOrganizationsContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'fr' ? 'Organisations | Admin | Sqordia' : 'Organizations | Admin | Sqordia',
    robots: { index: false, follow: false },
  };
}

export default async function AdminOrganizationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <AdminOrganizationsContent locale={locale} />;
}
