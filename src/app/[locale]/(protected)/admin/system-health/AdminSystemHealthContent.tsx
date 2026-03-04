'use client';

import dynamic from 'next/dynamic';

const AdminSystemHealthPageVite = dynamic(
  () => import('@/routes/admin/AdminSystemHealthPage'),
  { ssr: false }
);

interface AdminSystemHealthContentProps {
  locale: string;
}

export default function AdminSystemHealthContent({ locale }: AdminSystemHealthContentProps) {
  return <AdminSystemHealthPageVite />;
}
