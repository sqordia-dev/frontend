import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  TableData,
  TableCell,
  VisualStyling,
  ColumnType,
} from '../../../types/visual-elements';

interface FinancialTableProps {
  data: TableData;
  styling?: VisualStyling;
  editable?: boolean;
  onDataChange?: (data: TableData) => void;
}

/**
 * Format a value based on column type
 */
function formatValue(value: string | number, columnType?: ColumnType): string {
  if (value === null || value === undefined || value === '') return '-';

  if (columnType === 'currency' && typeof value === 'number') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  if (columnType === 'percentage' && typeof value === 'number') {
    return `${(value * 100).toFixed(1)}%`;
  }

  if (columnType === 'number' && typeof value === 'number') {
    return new Intl.NumberFormat('en-US').format(value);
  }

  if (columnType === 'date' && typeof value === 'string') {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  }

  return String(value);
}

/**
 * Get cell format classes
 */
function getCellFormatClasses(cell: TableCell): string {
  const classes: string[] = [];

  if (cell.format === 'bold') {
    classes.push('font-semibold');
  } else if (cell.format === 'italic') {
    classes.push('italic');
  } else if (cell.format === 'highlight') {
    classes.push('bg-yellow-100 dark:bg-yellow-900/30');
  }

  return classes.join(' ');
}

/**
 * Financial Table Component
 * Displays financial data such as revenue, expenses, and projections
 */
export function FinancialTable({
  data,
  styling,
  editable = false,
  onDataChange,
}: FinancialTableProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftIndicator, setShowLeftIndicator] = useState(false);
  const [showRightIndicator, setShowRightIndicator] = useState(false);

  // Check scroll indicators
  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setShowLeftIndicator(scrollLeft > 10);
        setShowRightIndicator(scrollLeft < scrollWidth - clientWidth - 10);
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

  // Handle cell value change
  const handleCellChange = useCallback(
    (rowIndex: number, cellIndex: number, newValue: string) => {
      if (!onDataChange) return;

      const newRows = [...data.rows];
      const newCells = [...newRows[rowIndex].cells];
      const columnType = data.columnTypes?.[cellIndex];

      // Parse value based on column type
      let parsedValue: string | number = newValue;
      if (columnType === 'currency' || columnType === 'number' || columnType === 'percentage') {
        const numValue = parseFloat(newValue.replace(/[^0-9.-]/g, ''));
        parsedValue = isNaN(numValue) ? newValue : numValue;
      }

      newCells[cellIndex] = { ...newCells[cellIndex], value: parsedValue };
      newRows[rowIndex] = { ...newRows[rowIndex], cells: newCells };

      onDataChange({ ...data, rows: newRows });
    },
    [data, onDataChange]
  );

  // Get styling classes based on theme
  const getThemeClasses = () => {
    switch (styling?.theme) {
      case 'minimal':
        return 'border-0 shadow-none';
      case 'corporate':
        return 'border-2 border-gray-300 dark:border-gray-600';
      case 'modern':
        return 'border border-gray-200 dark:border-gray-700 shadow-lg';
      default:
        return 'border border-gray-200 dark:border-gray-700 shadow-sm';
    }
  };

  const getFontSizeClasses = () => {
    switch (styling?.fontSize) {
      case 'small':
        return 'text-xs';
      case 'large':
        return 'text-base';
      default:
        return 'text-sm';
    }
  };

  return (
    <div className="w-full my-6">
      {/* Table Container with Scroll Indicators */}
      <div className="relative">
        {/* Scroll Indicator - Left */}
        {showLeftIndicator && (
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-gray-800 to-transparent pointer-events-none z-10 transition-opacity duration-300" />
        )}

        {/* Scroll Indicator - Right */}
        {showRightIndicator && (
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-800 to-transparent pointer-events-none z-10 transition-opacity duration-300" />
        )}

        {/* Table */}
        <div
          ref={scrollContainerRef}
          className={`overflow-x-auto bg-white dark:bg-gray-800 rounded-lg ${getThemeClasses()}`}
          role="region"
          aria-label="Financial table"
          tabIndex={0}
        >
          <table
            className={`w-full border-collapse min-w-[500px] ${getFontSizeClasses()}`}
            role="table"
          >
            {/* Header */}
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {data.headers.map((header, index) => (
                  <th
                    key={index}
                    className={`py-3 px-4 font-semibold text-gray-900 dark:text-white ${
                      index === 0 ? 'text-left sticky left-0 bg-gray-50 dark:bg-gray-700 z-20' : 'text-right'
                    } bg-gray-50 dark:bg-gray-700`}
                    scope="col"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {data.rows.map((row, rowIndex) => {
                const isEven = rowIndex % 2 === 0;

                return (
                  <tr
                    key={rowIndex}
                    className={`
                      ${row.isHighlighted ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                      ${!row.isHighlighted && !isEven ? 'bg-gray-50 dark:bg-gray-800/50' : ''}
                      ${!row.isHighlighted && isEven ? 'bg-white dark:bg-gray-800' : ''}
                      hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors
                    `}
                  >
                    {row.cells.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className={`py-3 px-4 text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700
                          ${cellIndex === 0 ? 'text-left sticky left-0 bg-inherit z-10' : 'text-right'}
                          ${getCellFormatClasses(cell)}`}
                        colSpan={cell.colspan}
                        rowSpan={cell.rowspan}
                      >
                        {editable ? (
                          <input
                            type="text"
                            value={cell.value}
                            onChange={(e) => handleCellChange(rowIndex, cellIndex, e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-2 focus:ring-blue-500 rounded px-1 text-right"
                            aria-label={`Edit cell row ${rowIndex + 1}, column ${cellIndex + 1}`}
                          />
                        ) : (
                          formatValue(cell.value, data.columnTypes?.[cellIndex])
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>

            {/* Footer */}
            {data.footer && (
              <tfoot className="bg-gray-100 dark:bg-gray-700">
                <tr className="border-t-2 border-gray-300 dark:border-gray-600">
                  {data.footer.cells.map((cell, index) => (
                    <td
                      key={index}
                      className={`py-3 px-4 font-bold text-gray-900 dark:text-white
                        ${index === 0 ? 'text-left sticky left-0 bg-gray-100 dark:bg-gray-700 z-10' : 'text-right'}
                        ${getCellFormatClasses(cell)}`}
                      colSpan={cell.colspan}
                      rowSpan={cell.rowspan}
                    >
                      {formatValue(cell.value, data.columnTypes?.[index])}
                    </td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Scroll Hint for Mobile */}
      <div className="lg:hidden mt-2 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
          <span aria-hidden="true">&larr;</span>
          <span>Swipe to view more columns</span>
          <span aria-hidden="true">&rarr;</span>
        </p>
      </div>
    </div>
  );
}

export default FinancialTable;
