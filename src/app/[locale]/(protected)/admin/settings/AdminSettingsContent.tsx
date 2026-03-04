'use client';

import dynamic from 'next/dynamic';

const AdminSettingsPageVite = dynamic(
  () => import('@/routes/admin/AdminSettingsPage'),
  { ssr: false }
);

interface AdminSettingsContentProps {
  locale: string;
}

export default function AdminSettingsContent({ locale }: AdminSettingsContentProps) {
  return <AdminSettingsPageVite />;
}
