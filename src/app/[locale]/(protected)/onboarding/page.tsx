import type { Metadata } from 'next';
import OnboardingContent from './OnboardingContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    en: 'Welcome to Sqordia | Get Started',
    fr: 'Bienvenue sur Sqordia | Commencer',
  };

  const descriptions = {
    en: 'Set up your Sqordia account and create your first business plan in just a few minutes.',
    fr: 'Configurez votre compte Sqordia et creez votre premier plan d\'affaires en quelques minutes.',
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

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <OnboardingContent locale={locale} />;
}
