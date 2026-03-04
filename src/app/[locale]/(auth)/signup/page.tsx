import type { Metadata } from 'next';
import SignupContent from './SignupContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    en: 'Create Account | Sqordia',
    fr: 'Créer un compte | Sqordia',
  };

  const descriptions = {
    en: 'Create your free Sqordia account and start building professional business plans with AI-powered guidance.',
    fr: "Créez votre compte Sqordia gratuit et commencez à créer des plans d'affaires professionnels avec l'aide de l'IA.",
  };

  const baseUrl = 'https://sqordia.com';
  const canonicalUrl = `${baseUrl}${locale === 'en' ? '' : `/${locale}`}/signup`;

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/signup`,
        fr: `${baseUrl}/fr/signup`,
        'x-default': `${baseUrl}/signup`,
      },
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function SignupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <SignupContent locale={locale} />;
}
