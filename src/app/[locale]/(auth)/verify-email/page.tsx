import type { Metadata } from 'next';
import VerifyEmailContent from './VerifyEmailContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    en: 'Verify Email | Sqordia',
    fr: 'Vérifier le courriel | Sqordia',
  };

  const descriptions = {
    en: 'Verify your email address to complete your Sqordia account registration.',
    fr: 'Vérifiez votre adresse courriel pour compléter votre inscription à Sqordia.',
  };

  const baseUrl = 'https://sqordia.com';
  const canonicalUrl = `${baseUrl}${locale === 'en' ? '' : `/${locale}`}/verify-email`;

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/verify-email`,
        fr: `${baseUrl}/fr/verify-email`,
        'x-default': `${baseUrl}/verify-email`,
      },
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function VerifyEmailPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <VerifyEmailContent locale={locale} />;
}
