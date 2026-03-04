'use client';

import dynamic from 'next/dynamic';

const AdminActivityLogsPageVite = dynamic(
  () => import('@/routes/admin/AdminActivityLogsPage'),
  { ssr: false }
);

interface AdminActivityLogsContentProps {
  locale: string;
}

export default function AdminActivityLogsContent({ locale }: AdminActivityLogsContentProps) {
  return <AdminActivityLogsPageVite />;
}
