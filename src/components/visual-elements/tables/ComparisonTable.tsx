import React, { useCallback } from 'react';
import {
  TableData,
  TableCell,
  VisualStyling,
  ColumnType,
} from '../../../types/visual-elements';

interface ComparisonTableProps {
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
    classes.push('bg-green-100 dark:bg-green-900/30');
  }

  return classes.join(' ');
}

/**
 * Check if value represents a positive comparison
 */
function isPositiveValue(value: string | number): boolean {
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase();
    return (
      lowerValue === 'yes' ||
      lowerValue === 'true' ||
      lowerValue.includes('check') ||
      lowerValue === 'included' ||
      lowerValue === 'available'
    );
  }
  return false;
}

/**
 * Check if value represents a negative comparison
 */
function isNegativeValue(value: string | number): boolean {
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase();
    return (
      lowerValue === 'no' ||
      lowerValue === 'false' ||
      lowerValue === 'n/a' ||
      lowerValue === 'not included' ||
      lowerValue === 'unavailable'
    );
  }
  return false;
}

/**
 * Comparison Table Component
 * Displays competitor or feature comparisons with visual indicators
 */
export function ComparisonTable({
  data,
  styling,
  editable = false,
  onDataChange,
}: ComparisonTableProps) {
  // Handle cell value change
  const handleCellChange = useCallback(
    (rowIndex: number, cellIndex: number, newValue: string) => {
      if (!onDataChange) return;

      const newRows = [...data.rows];
      const newCells = [...newRows[rowIndex].cells];
      const columnType = data.columnTypes?.[cellIndex];

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

  // Get font size classes
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

  // Render cell content with visual indicators for boolean-like values
  const renderCellContent = (cell: TableCell, columnType?: ColumnType) => {
    const value = cell.value;

    if (isPositiveValue(value)) {
      return (
        <span className="inline-flex items-center justify-center">
          <svg
            className="w-5 h-5 text-green-500"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-label="Yes"
          >
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      );
    }

    if (isNegativeValue(value)) {
      return (
        <span className="inline-flex items-center justify-center">
          <svg
            className="w-5 h-5 text-red-400"
            fill="currentColor"
            viewBox="0 0 20 20"
            aria-label="No"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </span>
      );
    }

    return formatValue(value, columnType);
  };

  return (
    <div className="w-full my-6">
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <table className={`w-full border-collapse ${getFontSizeClasses()}`} role="table">
          {/* Header */}
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              {data.headers.map((header, index) => (
                <th
                  key={index}
                  className={`py-4 px-5 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600
                    ${index === 0 ? 'text-left' : 'text-center'}`}
                  scope="col"
                >
                  {index === 0 ? (
                    header
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-base">{header}</span>
                      {/* Highlight "Your Company" column */}
                      {header.toLowerCase().includes('your') ||
                      header.toLowerCase().includes('us') ||
                      index === 1 ? (
                        <span className="text-xs text-orange-500 font-medium">(You)</span>
                      ) : null}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {data.rows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`
                  ${row.isHighlighted ? 'bg-orange-50 dark:bg-orange-900/10' : ''}
                  ${!row.isHighlighted && rowIndex % 2 !== 0 ? 'bg-gray-50 dark:bg-gray-800/50' : ''}
                  hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors
                `}
              >
                {row.cells.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={`py-3 px-5 text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700
                      ${cellIndex === 0 ? 'text-left font-medium' : 'text-center'}
                      ${getCellFormatClasses(cell)}`}
                    colSpan={cell.colspan}
                    rowSpan={cell.rowspan}
                  >
                    {editable ? (
                      <input
                        type="text"
                        value={cell.value}
                        onChange={(e) => handleCellChange(rowIndex, cellIndex, e.target.value)}
                        className={`w-full bg-transparent border border-gray-200 dark:border-gray-600 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                          ${cellIndex === 0 ? 'text-left' : 'text-center'}`}
                        aria-label={`Edit ${data.headers[cellIndex]} for ${row.cells[0]?.value || `row ${rowIndex + 1}`}`}
                      />
                    ) : (
                      renderCellContent(cell, data.columnTypes?.[cellIndex])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>

          {/* Footer */}
          {data.footer && (
            <tfoot className="bg-gray-100 dark:bg-gray-700">
              <tr className="border-t-2 border-gray-300 dark:border-gray-600">
                {data.footer.cells.map((cell, index) => (
                  <td
                    key={index}
                    className={`py-3 px-5 font-bold text-gray-900 dark:text-white
                      ${index === 0 ? 'text-left' : 'text-center'}
                      ${getCellFormatClasses(cell)}`}
                    colSpan={cell.colspan}
                    rowSpan={cell.rowspan}
                  >
                    {renderCellContent(cell, data.columnTypes?.[index])}
                  </td>
                ))}
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          <span>Available/Yes</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-red-400" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
          <span>Not Available/No</span>
        </div>
      </div>
    </div>
  );
}

export default ComparisonTable;
