import type { Metadata } from 'next';
import BugReportContent from './BugReportContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const titles = {
    en: 'Report a Bug | Sqordia',
    fr: 'Signaler un Bug | Sqordia',
  };

  const descriptions = {
    en: 'Report a bug or issue you encountered in Sqordia.',
    fr: 'Signalez un bug ou un probleme rencontre dans Sqordia.',
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

export default async function BugReportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  return <BugReportContent locale={locale} />;
}
