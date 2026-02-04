import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CmsProvider, useCms } from '@/contexts/CmsContext';
import { Skeleton } from '@/components/ui/skeleton';
import CmsPreviewProvider from '@/components/cms/preview/CmsPreviewProvider';
import CmsPreviewToolbar, { DeviceSize } from '@/components/cms/preview/CmsPreviewToolbar';
import CmsDeviceFrame from '@/components/cms/preview/CmsDeviceFrame';
import CmsPreviewNavRail from '@/components/cms/preview/CmsPreviewNavRail';

// Import landing page components
import { Header } from '@/components/layout';
import {
  Hero,
  LogoCloud,
  ValueProps,
  Features,
  Testimonials,
  FinalCTA,
  FAQ,
} from '@/components/landing';
import { Footer } from '@/components/layout';

function PreviewContent() {
  const { activeVersion, isLoading } = useCms();
  const navigate = useNavigate();

  const [deviceSize, setDeviceSize] = useState<DeviceSize>('desktop');
  const [language, setLanguage] = useState('en');

  // If no active version, redirect back to editor
  useEffect(() => {
    if (!isLoading && !activeVersion) {
      navigate('/admin/cms');
    }
  }, [isLoading, activeVersion, navigate]);

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (!activeVersion) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen">
      <CmsPreviewToolbar
        versionNumber={activeVersion.versionNumber}
        deviceSize={deviceSize}
        onDeviceSizeChange={setDeviceSize}
        language={language}
        onLanguageChange={setLanguage}
      />

      <CmsPreviewProvider
        blocks={activeVersion.contentBlocks}
        language={language}
      >
        <CmsDeviceFrame deviceSize={deviceSize}>
          <Header />
          <main id="main-content" className="min-h-screen">
            <Hero />
            <LogoCloud />
            <ValueProps />
            <Features />
            <Testimonials />
            <FinalCTA />
            <FAQ />
          </main>
          <Footer />
        </CmsDeviceFrame>
        <CmsPreviewNavRail />
      </CmsPreviewProvider>
    </div>
  );
}

export default function AdminCmsPreviewPage() {
  return (
    <CmsProvider>
      <PreviewContent />
    </CmsProvider>
  );
}
