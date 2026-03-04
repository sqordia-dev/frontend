import type { Metadata } from 'next';
import AdminUsersContent from './AdminUsersContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'fr' ? 'Utilisateurs | Admin | Sqordia' : 'Users | Admin | Sqordia',
    robots: { index: false, follow: false },
  };
}

export default async function AdminUsersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <AdminUsersContent locale={locale} />;
}
