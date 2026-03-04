import type { Metadata } from 'next';
import AdminSettingsContent from './AdminSettingsContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'fr' ? 'Paramètres | Admin | Sqordia' : 'Settings | Admin | Sqordia',
    robots: { index: false, follow: false },
  };
}

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <AdminSettingsContent locale={locale} />;
}
