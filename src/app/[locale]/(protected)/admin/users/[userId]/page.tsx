import type { Metadata } from 'next';
import AdminUserDetailContent from './AdminUserDetailContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; userId: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'fr' ? 'Détail utilisateur | Admin | Sqordia' : 'User Detail | Admin | Sqordia',
    robots: { index: false, follow: false },
  };
}

export default async function AdminUserDetailPage({
  params,
}: {
  params: Promise<{ locale: string; userId: string }>;
}) {
  const { locale, userId } = await params;
  return <AdminUserDetailContent locale={locale} userId={userId} />;
}
