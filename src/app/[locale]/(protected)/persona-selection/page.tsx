import type { Metadata } from 'next';
import PersonaSelectionContent from './PersonaSelectionContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    en: 'Select Your Profile | Sqordia',
    fr: 'Sélectionnez votre profil | Sqordia',
  };

  const descriptions = {
    en: 'Choose your profile type to get a personalized business planning experience.',
    fr: "Choisissez votre type de profil pour obtenir une expérience de planification d'affaires personnalisée.",
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

export default async function PersonaSelectionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <PersonaSelectionContent locale={locale} />;
}
