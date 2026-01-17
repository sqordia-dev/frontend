import React from 'react';

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

  return (
    <div className={`w-full ${className}`}>
      {/* Title */}
      <h3 
        className="text-2xl font-bold mb-6"
        style={{ color: strategyBlue, fontFamily: 'system-ui, -apple-system, sans-serif' }}
      >
        {title}
      </h3>

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-lg shadow-sm">
        <table className="w-full border-collapse min-w-full" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
          {/* Header */}
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th 
                className="text-left py-3 px-4 font-semibold"
                style={{ color: strategyBlue }}
              >
                {/* Empty cell for label column */}
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`py-3 px-4 font-semibold text-sm ${
                    col.align === 'right' ? 'text-right' : 
                    col.align === 'center' ? 'text-center' : 'text-left'
                  }`}
                  style={{ color: strategyBlue }}
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
                  {/* Label Column */}
                  <td 
                    className={`py-3 px-4 ${
                      row.isCategoryHeader 
                        ? 'font-bold text-white' 
                        : row.isSubtotal || row.isTotal
                        ? 'font-bold text-gray-900 dark:text-white'
                        : 'font-normal text-gray-900 dark:text-gray-100'
                    }`}
                    style={{
                      backgroundColor: row.isCategoryHeader ? categoryHeaderGray : 'transparent',
                      paddingLeft: row.indentLevel ? `${16 + (row.indentLevel * 16)}px` : '16px',
                      color: row.isCategoryHeader ? 'white' : undefined
                    }}
                  >
                    {row.label}
                  </td>

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

      {/* Bottom border line */}
      <div className="mt-4 h-0.5" style={{ backgroundColor: strategyBlue }}></div>
    </div>
  );
};

export default FinancialTable;
