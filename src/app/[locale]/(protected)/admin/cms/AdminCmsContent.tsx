'use client';

import dynamic from 'next/dynamic';
import { ViteRouterBridge } from '@/lib/ViteRouterBridge';

const CmsEditorPageVite = dynamic(
  () => import('@/routes/admin/CmsEditorPage'),
  { ssr: false }
);

interface AdminCmsContentProps {
  locale: string;
}

export default function AdminCmsContent({ locale }: AdminCmsContentProps) {
  return (
    <ViteRouterBridge initialPath="/admin/cms">
      <CmsEditorPageVite />
    </ViteRouterBridge>
  );
}
