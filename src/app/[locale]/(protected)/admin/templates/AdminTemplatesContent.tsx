'use client';

import dynamic from 'next/dynamic';

const AdminTemplatesPageVite = dynamic(
  () => import('@/routes/admin/AdminTemplatesPage'),
  { ssr: false }
);

interface AdminTemplatesContentProps {
  locale: string;
}

export default function AdminTemplatesContent({ locale }: AdminTemplatesContentProps) {
  return <AdminTemplatesPageVite />;
}
