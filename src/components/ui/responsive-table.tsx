import * as React from 'react';
import { cn } from '../../lib/utils';
import { useIsMobile } from '../../hooks';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  /** Hide on mobile (< 640px) */
  hideOnMobile?: boolean;
  /** Hide on tablet (< 1024px) */
  hideOnTablet?: boolean;
  /** Alignment */
  align?: 'left' | 'center' | 'right';
  /** Custom cell renderer */
  render?: (item: T, index: number) => React.ReactNode;
  /** Column width class */
  width?: string;
}

export interface ResponsiveTableProps<T> {
  data: T[];
  columns: Column<T>[];
  /** Unique key for each row */
  keyExtractor: (item: T, index: number) => string;
  /** Show card view on mobile instead of horizontal scroll */
  mobileAsCards?: boolean;
  /** Card renderer for mobile view */
  renderCard?: (item: T, index: number) => React.ReactNode;
  /** Row click handler */
  onRowClick?: (item: T, index: number) => void;
  /** Empty state content */
  emptyMessage?: string;
  /** Loading state */
  loading?: boolean;
  /** Table class name */
  className?: string;
  /** Header class name */
  headerClassName?: string;
  /** Row class name or function */
  rowClassName?: string | ((item: T, index: number) => string);
  /** Sticky header */
  stickyHeader?: boolean;
}

export function ResponsiveTable<T>({
  data,
  columns,
  keyExtractor,
  mobileAsCards = true,
  renderCard,
  onRowClick,
  emptyMessage = 'No data available',
  loading = false,
  className,
  headerClassName,
  rowClassName,
  stickyHeader = false,
}: ResponsiveTableProps<T>) {
  const isMobile = useIsMobile();
  const showCards = isMobile && mobileAsCards;

  // Get cell value from item
  const getCellValue = (item: T, column: Column<T>): React.ReactNode => {
    if (column.render) {
      return column.render(item, data.indexOf(item));
    }
    const value = (item as any)[column.key];
    if (value === null || value === undefined) return '-';
    return String(value);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="relative">
          <div className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-700" />
          <div className="absolute top-0 left-0 w-10 h-10 rounded-full border-2 border-momentum-orange border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  // Card view for mobile
  if (showCards) {
    return (
      <div className="space-y-3 p-3 sm:p-4">
        {data.map((item, index) => {
          const key = keyExtractor(item, index);

          // Use custom card renderer if provided
          if (renderCard) {
            return (
              <div key={key} onClick={() => onRowClick?.(item, index)}>
                {renderCard(item, index)}
              </div>
            );
          }

          // Default card layout
          return (
            <div
              key={key}
              onClick={() => onRowClick?.(item, index)}
              className={cn(
                'border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800',
                onRowClick && 'cursor-pointer hover:shadow-md transition-shadow',
              )}
            >
              <div className="space-y-2">
                {columns
                  .filter(col => !col.hideOnMobile)
                  .map(column => (
                    <div key={String(column.key)} className="flex justify-between items-start gap-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
                        {column.header}
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white text-right">
                        {getCellValue(item, column)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Table view (with horizontal scroll on mobile if not using cards)
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full', className)}>
        <thead className={cn(
          'bg-gray-50 dark:bg-gray-800/50',
          stickyHeader && 'sticky top-0 z-10',
          headerClassName
        )}>
          <tr>
            {columns.map(column => (
              <th
                key={String(column.key)}
                className={cn(
                  'px-4 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider',
                  column.align === 'center' && 'text-center',
                  column.align === 'right' && 'text-right',
                  !column.align && 'text-left',
                  column.hideOnMobile && 'hidden sm:table-cell',
                  column.hideOnTablet && 'hidden lg:table-cell',
                  column.width,
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
          {data.map((item, index) => {
            const key = keyExtractor(item, index);
            const rowClass = typeof rowClassName === 'function'
              ? rowClassName(item, index)
              : rowClassName;

            return (
              <tr
                key={key}
                onClick={() => onRowClick?.(item, index)}
                className={cn(
                  'transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50',
                  rowClass,
                )}
              >
                {columns.map(column => (
                  <td
                    key={String(column.key)}
                    className={cn(
                      'px-4 py-3 text-sm',
                      column.align === 'center' && 'text-center',
                      column.align === 'right' && 'text-right',
                      column.hideOnMobile && 'hidden sm:table-cell',
                      column.hideOnTablet && 'hidden lg:table-cell',
                    )}
                  >
                    {getCellValue(item, column)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// Simple wrapper for tables with scroll indicators
export function ScrollableTable({
  children,
  className,
  showIndicators = true,
}: {
  children: React.ReactNode;
  className?: string;
  showIndicators?: boolean;
}) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = React.useState(false);
  const [showRight, setShowRight] = React.useState(false);

  React.useEffect(() => {
    const checkScroll = () => {
      if (!scrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setShowLeft(scrollLeft > 10);
      setShowRight(scrollLeft < scrollWidth - clientWidth - 10);
    };

    const el = scrollRef.current;
    if (el) {
      checkScroll();
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  return (
    <div className="relative">
      {/* Left scroll indicator */}
      {showIndicators && showLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-gray-900 to-transparent pointer-events-none z-10" />
      )}

      {/* Right scroll indicator */}
      {showIndicators && showRight && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none z-10" />
      )}

      <div
        ref={scrollRef}
        className={cn('overflow-x-auto', className)}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {children}
      </div>
    </div>
  );
}
