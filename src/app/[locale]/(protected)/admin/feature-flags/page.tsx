import type { Metadata } from 'next';
import AdminFeatureFlagsContent from './AdminFeatureFlagsContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'fr' ? 'Feature Flags | Admin | Sqordia' : 'Feature Flags | Admin | Sqordia',
    robots: { index: false, follow: false },
  };
}

export default async function AdminFeatureFlagsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <AdminFeatureFlagsContent locale={locale} />;
}
