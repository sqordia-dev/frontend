import type { Metadata } from 'next';
import ForgotPasswordContent from './ForgotPasswordContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    en: 'Forgot Password | Sqordia',
    fr: 'Mot de passe oublié | Sqordia',
  };

  const descriptions = {
    en: 'Reset your Sqordia password. Enter your email and we will send you a link to reset your password.',
    fr: 'Réinitialisez votre mot de passe Sqordia. Entrez votre courriel et nous vous enverrons un lien de réinitialisation.',
  };

  const baseUrl = 'https://sqordia.com';
  const canonicalUrl = `${baseUrl}${locale === 'en' ? '' : `/${locale}`}/forgot-password`;

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/forgot-password`,
        fr: `${baseUrl}/fr/forgot-password`,
        'x-default': `${baseUrl}/forgot-password`,
      },
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <ForgotPasswordContent locale={locale} />;
}
