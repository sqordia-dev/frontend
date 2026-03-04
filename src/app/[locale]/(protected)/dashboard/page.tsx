import type { Metadata } from 'next';
import DashboardContent from './DashboardContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    en: 'Dashboard | Sqordia',
    fr: 'Tableau de bord | Sqordia',
  };

  const descriptions = {
    en: 'Manage your business plans and projects in one place.',
    fr: "Gérez vos plans d'affaires et projets en un seul endroit.",
  };

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <DashboardContent locale={locale} />;
}
