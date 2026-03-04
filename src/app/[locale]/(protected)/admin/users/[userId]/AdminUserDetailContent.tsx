'use client';

import dynamic from 'next/dynamic';
import { ViteRouterBridge } from '@/lib/ViteRouterBridge';

const AdminUserDetailPageVite = dynamic(
  () => import('@/routes/admin/AdminUserDetailPage'),
  { ssr: false }
);

interface AdminUserDetailContentProps {
  locale: string;
  userId: string;
}

export default function AdminUserDetailContent({ locale, userId }: AdminUserDetailContentProps) {
  return (
    <ViteRouterBridge
      initialPath={`/admin/users/${userId}`}
      routePattern="/admin/users/:userId"
    >
      <AdminUserDetailPageVite />
    </ViteRouterBridge>
  );
}
