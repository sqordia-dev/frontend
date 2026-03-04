import type { Metadata } from 'next';
import AdminIssueTrackerContent from './AdminIssueTrackerContent';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'fr' ? 'Suivi des problèmes | Admin | Sqordia' : 'Issue Tracker | Admin | Sqordia',
    robots: { index: false, follow: false },
  };
}

export default async function AdminBugReportPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <AdminIssueTrackerContent locale={locale} />;
}
