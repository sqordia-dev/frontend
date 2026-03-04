'use client';

import dynamic from 'next/dynamic';

const AdminOrganizationsPageVite = dynamic(
  () => import('@/routes/admin/AdminOrganizationsPage'),
  { ssr: false }
);

interface AdminOrganizationsContentProps {
  locale: string;
}

export default function AdminOrganizationsContent({ locale }: AdminOrganizationsContentProps) {
  return <AdminOrganizationsPageVite />;
}
