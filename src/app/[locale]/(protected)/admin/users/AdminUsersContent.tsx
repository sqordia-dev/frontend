'use client';

import dynamic from 'next/dynamic';
import { ViteRouterBridge } from '@/lib/ViteRouterBridge';

const AdminUsersPageVite = dynamic(
  () => import('@/routes/admin/AdminUsersPage'),
  { ssr: false }
);

interface AdminUsersContentProps {
  locale: string;
}

export default function AdminUsersContent({ locale }: AdminUsersContentProps) {
  return (
    <ViteRouterBridge initialPath="/admin/users">
      <AdminUsersPageVite />
    </ViteRouterBridge>
  );
}
