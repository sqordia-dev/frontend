import type { Metadata } from 'next';
import AdminTemplatesContent from './AdminTemplatesContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'fr' ? 'Modèles | Admin | Sqordia' : 'Templates | Admin | Sqordia',
    robots: { index: false, follow: false },
  };
}

export default async function AdminTemplatesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <AdminTemplatesContent locale={locale} />;
}
