import type { Metadata } from 'next';
import AdminActivityLogsContent from './AdminActivityLogsContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'fr' ? 'Journal d\'activité | Admin | Sqordia' : 'Activity Logs | Admin | Sqordia',
    robots: { index: false, follow: false },
  };
}

export default async function AdminActivityLogsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <AdminActivityLogsContent locale={locale} />;
}
