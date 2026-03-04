import type { Metadata } from 'next';
import ProfileContent from './ProfileContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    en: 'Settings | Sqordia',
    fr: 'Paramètres | Sqordia',
  };

  const descriptions = {
    en: 'Manage your account settings, security, and preferences.',
    fr: 'Gérez les paramètres de votre compte, la sécurité et vos préférences.',
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

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <ProfileContent locale={locale} />;
}
