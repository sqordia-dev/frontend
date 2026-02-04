import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { DeviceSize } from './CmsPreviewToolbar';

interface CmsDeviceFrameProps {
  deviceSize: DeviceSize;
  children: ReactNode;
}

const deviceWidths: Record<DeviceSize, string> = {
  desktop: 'max-w-full',
  tablet: 'max-w-[768px]',
  mobile: 'max-w-[375px]',
};

export default function CmsDeviceFrame({ deviceSize, children }: CmsDeviceFrameProps) {
  const isConstrained = deviceSize !== 'desktop';

  return (
    <div className="flex-1 overflow-auto bg-gray-100 dark:bg-gray-950 p-4">
      <div
        className={cn(
          'mx-auto transition-all duration-300 ease-in-out',
          deviceWidths[deviceSize],
          isConstrained && 'rounded-2xl border border-gray-300 dark:border-gray-700 shadow-xl overflow-hidden',
          deviceSize === 'mobile' && 'rounded-[2rem]',
        )}
      >
        {/* Device chrome for phone/tablet */}
        {isConstrained && (
          <div className="bg-gray-200 dark:bg-gray-800 px-4 py-2 flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600" />
            <div className="w-16 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700" />
            <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600" />
          </div>
        )}

        {/* Content area */}
        <div
          className={cn(
            'bg-white dark:bg-gray-900 overflow-y-auto',
            isConstrained ? 'max-h-[calc(100vh-10rem)]' : 'min-h-0',
          )}
        >
          {children}
        </div>

        {/* Bottom bar for mobile */}
        {deviceSize === 'mobile' && (
          <div className="bg-gray-200 dark:bg-gray-800 px-4 py-3 flex items-center justify-center">
            <div className="w-24 h-1 rounded-full bg-gray-400 dark:bg-gray-600" />
          </div>
        )}
      </div>
    </div>
  );
}
