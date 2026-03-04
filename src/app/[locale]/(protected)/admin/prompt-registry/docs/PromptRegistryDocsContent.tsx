'use client';

import dynamic from 'next/dynamic';
import { ViteRouterBridge } from '@/lib/ViteRouterBridge';

const PromptRegistryDocPageVite = dynamic(
  () => import('@/routes/admin/PromptRegistryDocPage'),
  { ssr: false }
);

interface PromptRegistryDocsContentProps {
  locale: string;
}

export default function PromptRegistryDocsContent({ locale }: PromptRegistryDocsContentProps) {
  return (
    <ViteRouterBridge initialPath="/admin/prompt-registry/docs">
      <PromptRegistryDocPageVite />
    </ViteRouterBridge>
  );
}
