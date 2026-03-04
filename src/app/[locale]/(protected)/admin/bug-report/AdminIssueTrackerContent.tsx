'use client';

import dynamic from 'next/dynamic';

const AdminIssueTrackerPageVite = dynamic(
  () => import('@/routes/admin/AdminIssueTrackerPage'),
  { ssr: false }
);

interface AdminIssueTrackerContentProps {
  locale: string;
}

export default function AdminIssueTrackerContent({ locale }: AdminIssueTrackerContentProps) {
  return <AdminIssueTrackerPageVite />;
}
