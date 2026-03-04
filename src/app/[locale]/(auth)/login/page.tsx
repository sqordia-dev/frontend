import type { Metadata } from 'next';
import LoginContent from './LoginContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    en: 'Login | Sqordia',
    fr: 'Connexion | Sqordia',
  };

  const descriptions = {
    en: 'Sign in to your Sqordia account to access your business plans and AI-powered planning tools.',
    fr: 'Connectez-vous à votre compte Sqordia pour accéder à vos plans d\'affaires et outils de planification IA.',
  };

  const baseUrl = 'https://sqordia.com';
  const canonicalUrl = `${baseUrl}${locale === 'en' ? '' : `/${locale}`}/login`;

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/login`,
        fr: `${baseUrl}/fr/login`,
        'x-default': `${baseUrl}/login`,
      },
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <LoginContent locale={locale} />;
}
