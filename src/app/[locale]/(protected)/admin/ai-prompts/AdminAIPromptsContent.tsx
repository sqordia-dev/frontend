'use client';

import dynamic from 'next/dynamic';
import { ViteRouterBridge } from '@/lib/ViteRouterBridge';

const AdminAIPromptsPageVite = dynamic(
  () => import('@/routes/admin/AdminAIPromptsPage'),
  { ssr: false }
);

interface AdminAIPromptsContentProps {
  locale: string;
}

export default function AdminAIPromptsContent({ locale }: AdminAIPromptsContentProps) {
  return (
    <ViteRouterBridge initialPath="/admin/ai-prompts">
      <AdminAIPromptsPageVite />
    </ViteRouterBridge>
  );
}
