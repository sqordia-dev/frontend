import React, { useRef, useEffect, useState } from 'react';

export interface FinancialTableColumn {
  header: string;
  key: string;
  align?: 'left' | 'right' | 'center';
}

export interface FinancialTableRow {
  label: string;
  values: { [key: string]: number | null | undefined };
  isSubtotal?: boolean;
  isTotal?: boolean;
  isCategoryHeader?: boolean;
  indentLevel?: number;
}

export interface FinancialTableProps {
  title: string;
  columns: FinancialTableColumn[];
  rows: FinancialTableRow[];
  currency?: string;
  showNegativeInRed?: boolean;
  className?: string;
}

const formatCurrency = (value: number | null | undefined, currency: string = '$'): string => {
  if (value === null || value === undefined) return '-';
  const formatted = Math.abs(value).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
  return `${formatted} ${currency}`;
};

const FinancialTable: React.FC<FinancialTableProps> = ({
  title,
  columns,
  rows,
  currency = '$',
  showNegativeInRed = true,
  className = ''
}) => {
  const strategyBlue = '#1A2B47';
  const lightGray = '#F3F4F6';
  const categoryHeaderGray = '#9CA3AF';
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftIndicator, setShowLeftIndicator] = useState(false);
  const [showRightIndicator, setShowRightIndicator] = useState(true);

  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowLeftIndicator(scrollLeft > 10);
        setShowRightIndicator(scrollLeft < (scrollWidth - clientWidth - 10));
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      checkScroll();
      container.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        container.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  return (
    <div className={`w-full ${className}`}>
      {/* Title */}
      <h3 
        className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6"
        style={{ color: strategyBlue, fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        {title}
      </h3>

      {/* Table Container with Scroll Indicators */}
      <div className="relative">
        {/* Scroll Indicator - Left */}
        {showLeftIndicator && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-gray-900 to-transparent pointer-events-none z-10 transition-opacity duration-300"></div>
        )}
        
        {/* Scroll Indicator - Right */}
        {showRightIndicator && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-900 to-transparent pointer-events-none z-10 transition-opacity duration-300"></div>
        )}

        {/* Table */}
        <div 
          ref={scrollContainerRef}
          className="overflow-x-auto bg-white dark:bg-gray-900 rounded-lg shadow-sm -webkit-overflow-scrolling-touch"
          role="region"
          aria-label={`${title} table`}
          tabIndex={0}
        >
          <table className="w-full border-collapse min-w-[600px]" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }} role="table">
          {/* Header */}
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th 
                className="text-left py-2 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm sticky left-0 z-20 bg-white dark:bg-gray-900"
                style={{ color: strategyBlue }}
                scope="col"
                aria-label="Row label"
              >
                {/* Empty cell for label column */}
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-2 sm:py-3 px-3 sm:px-4 font-semibold text-xs sm:text-sm whitespace-nowrap ${
                    col.align === 'right' ? 'text-right' : 
                    col.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                  style={{ color: strategyBlue }}
                  scope="col"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {rows.map((row, rowIndex) => {
              const isEven = rowIndex % 2 === 0;
              const bgColor = row.isCategoryHeader 
                ? categoryHeaderGray
                : (isEven ? 'transparent' : '#FAFAFA');
              
              return (
                <tr
                  key={rowIndex}
                  style={{ backgroundColor: bgColor }}
                  className={row.isTotal ? 'border-t-2 border-gray-900 dark:border-gray-600' : ''}
                >
                  {/* Label Column - Sticky */}
                  <th 
                    className={`py-2 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm sticky left-0 z-10 text-left ${
                      row.isCategoryHeader 
                        ? 'font-bold text-white' 
                        : row.isSubtotal || row.isTotal
                        ? 'font-bold text-gray-900 dark:text-white'
                        : 'font-normal text-gray-900 dark:text-gray-100'
                    }`}
                    style={{
                      backgroundColor: row.isCategoryHeader ? categoryHeaderGray : (isEven ? 'transparent' : '#FAFAFA'),
                      paddingLeft: row.indentLevel ? `${12 + (row.indentLevel * 12)}px` : '12px',
                      color: row.isCategoryHeader ? 'white' : undefined,
                      boxShadow: row.isCategoryHeader ? '2px 0 4px rgba(0,0,0,0.1)' : '2px 0 2px rgba(0,0,0,0.05)'
                    }}
                    scope="row"
                  >
                    {row.label}
                  </th>

                  {/* Value Columns */}
                  {columns.map((col) => {
                    const value = row.values[col.key];
                    const isNegative = value !== null && value !== undefined && value < 0;
                    const alignClass = col.align === 'right' ? 'text-right' : 
                                     col.align === 'center' ? 'text-center' : 'text-left';

                    return (
                      <td
                        key={col.key}
                        className={`py-3 px-4 ${alignClass} ${
                          row.isSubtotal || row.isTotal 
                            ? 'font-bold text-gray-900 dark:text-white' 
                            : 'font-normal text-gray-900 dark:text-gray-100'
                        }`}
                        style={{
                          color: showNegativeInRed && isNegative ? '#EF4444' : undefined
                        }}
                      >
                        {formatCurrency(value, currency)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
      </div>

      {/* Scroll Hint for Mobile */}
      <div className="lg:hidden mt-2 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
          <span>←</span>
          <span>Swipe to view more columns</span>
          <span>→</span>
        </p>
      </div>

      {/* Bottom border line */}
      <div className="mt-4 h-0.5" style={{ backgroundColor: strategyBlue }}></div>
    </div>
  );
};

export default FinancialTable;
