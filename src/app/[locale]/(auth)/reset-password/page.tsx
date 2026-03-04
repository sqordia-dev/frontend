import type { Metadata } from 'next';
import ResetPasswordContent from './ResetPasswordContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    en: 'Reset Password | Sqordia',
    fr: 'Réinitialiser le mot de passe | Sqordia',
  };

  const descriptions = {
    en: 'Create a new password for your Sqordia account.',
    fr: 'Créez un nouveau mot de passe pour votre compte Sqordia.',
  };

  const baseUrl = 'https://sqordia.com';
  const canonicalUrl = `${baseUrl}${locale === 'en' ? '' : `/${locale}`}/reset-password`;

  return {
    title: titles[locale as keyof typeof titles] || titles.en,
    description: descriptions[locale as keyof typeof descriptions] || descriptions.en,
    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/reset-password`,
        fr: `${baseUrl}/fr/reset-password`,
        'x-default': `${baseUrl}/reset-password`,
      },
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function ResetPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <ResetPasswordContent locale={locale} />;
}
