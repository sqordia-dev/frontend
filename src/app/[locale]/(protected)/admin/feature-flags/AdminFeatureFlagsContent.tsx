'use client';

import dynamic from 'next/dynamic';

const AdminFeatureFlagsPageVite = dynamic(
  () => import('@/routes/admin/AdminFeatureFlagsPage'),
  { ssr: false }
);

interface AdminFeatureFlagsContentProps {
  locale: string;
}

export default function AdminFeatureFlagsContent({ locale }: AdminFeatureFlagsContentProps) {
  return <AdminFeatureFlagsPageVite />;
}
