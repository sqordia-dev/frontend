import { useState, useRef, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { GripVertical } from 'lucide-react';

interface ResizablePanelProps {
  children: React.ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  className?: string;
  side?: 'left' | 'right';
}

export function ResizablePanel({
  children,
  defaultWidth = 400,
  minWidth = 280,
  maxWidth = 600,
  className,
  side = 'right',
}: ResizablePanelProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isResizing || !panelRef.current) return;

      const panelRect = panelRef.current.getBoundingClientRect();
      let newWidth: number;

      if (side === 'right') {
        newWidth = panelRect.right - e.clientX;
      } else {
        newWidth = e.clientX - panelRect.left;
      }

      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      setWidth(newWidth);
    },
    [isResizing, minWidth, maxWidth, side]
  );

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div
      ref={panelRef}
      className={cn('relative flex-shrink-0', className)}
      style={{ width }}
    >
      {/* Resize handle */}
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          'absolute top-0 bottom-0 w-4 flex items-center justify-center cursor-col-resize z-10 group',
          side === 'right' ? 'left-0 -ml-2' : 'right-0 -mr-2'
        )}
      >
        <div
          className={cn(
            'w-1 h-16 rounded-full transition-colors',
            isResizing
              ? 'bg-momentum-orange'
              : 'bg-gray-300 dark:bg-gray-600 group-hover:bg-momentum-orange/70'
          )}
        />
        <GripVertical
          className={cn(
            'absolute w-4 h-4 transition-colors',
            isResizing
              ? 'text-momentum-orange'
              : 'text-gray-400 group-hover:text-momentum-orange/70'
          )}
        />
      </div>

      {/* Content */}
      <div className="h-full overflow-hidden">{children}</div>
    </div>
  );
}

export default ResizablePanel;
