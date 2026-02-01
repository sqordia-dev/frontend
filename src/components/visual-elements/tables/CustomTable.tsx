import React, { useCallback } from 'react';
import {
  TableData,
  TableCell,
  VisualStyling,
  ColumnType,
} from '../../../types/visual-elements';

interface CustomTableProps {
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
 * Custom Table Component
 * A generic table component for various use cases including timeline, pricing, and custom tables
 */
export function CustomTable({
  data,
  styling,
  editable = false,
  onDataChange,
}: CustomTableProps) {
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

  // Get theme-based classes
  const getThemeClasses = () => {
    switch (styling?.theme) {
      case 'minimal':
        return {
          container: 'border-0',
          header: 'bg-transparent border-b-2 border-gray-300 dark:border-gray-600',
          row: 'border-b border-gray-100 dark:border-gray-800',
        };
      case 'corporate':
        return {
          container: 'border-2 border-gray-400 dark:border-gray-500',
          header: 'bg-gray-800 dark:bg-gray-900 text-white',
          row: 'border-b border-gray-200 dark:border-gray-700',
        };
      case 'modern':
        return {
          container: 'border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl overflow-hidden',
          header: 'bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800',
          row: 'border-b border-gray-100 dark:border-gray-700',
        };
      default:
        return {
          container: 'border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm',
          header: 'bg-gray-50 dark:bg-gray-700',
          row: 'border-b border-gray-100 dark:border-gray-700',
        };
    }
  };

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

  // Get border style classes
  const getBorderClasses = () => {
    switch (styling?.borderStyle) {
      case 'none':
        return 'border-0';
      case 'light':
        return 'border border-gray-100 dark:border-gray-800';
      case 'heavy':
        return 'border-2 border-gray-400 dark:border-gray-500';
      default:
        return 'border border-gray-200 dark:border-gray-700';
    }
  };

  const themeClasses = getThemeClasses();

  return (
    <div className="w-full my-6">
      <div
        className={`overflow-x-auto bg-white dark:bg-gray-800 ${themeClasses.container} ${getBorderClasses()}`}
      >
        <table className={`w-full border-collapse ${getFontSizeClasses()}`} role="table">
          {/* Header */}
          <thead>
            <tr className={themeClasses.header}>
              {data.headers.map((header, index) => (
                <th
                  key={index}
                  className={`py-3 px-4 font-semibold text-gray-900 dark:text-white
                    ${index === 0 ? 'text-left' : 'text-left'}
                    ${styling?.theme === 'corporate' ? 'text-white' : ''}`}
                  scope="col"
                >
                  {header}
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
                  ${themeClasses.row}
                  ${row.isHighlighted ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  ${!row.isHighlighted && rowIndex % 2 !== 0 ? 'bg-gray-50 dark:bg-gray-800/50' : ''}
                  hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors
                `}
              >
                {row.cells.map((cell, cellIndex) => (
                  <td
                    key={cellIndex}
                    className={`py-3 px-4 text-gray-700 dark:text-gray-300 ${getCellFormatClasses(cell)}`}
                    colSpan={cell.colspan}
                    rowSpan={cell.rowspan}
                  >
                    {editable ? (
                      <input
                        type="text"
                        value={cell.value}
                        onChange={(e) => handleCellChange(rowIndex, cellIndex, e.target.value)}
                        className="w-full bg-transparent border border-gray-200 dark:border-gray-600 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        aria-label={`Edit cell row ${rowIndex + 1}, column ${cellIndex + 1}`}
                      />
                    ) : (
                      formatValue(cell.value, data.columnTypes?.[cellIndex])
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
                    className={`py-3 px-4 font-bold text-gray-900 dark:text-white ${getCellFormatClasses(cell)}`}
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

      {/* Empty State */}
      {data.rows.length === 0 && (
        <div className="py-8 text-center text-gray-500 dark:text-gray-400">
          <p>No data available</p>
        </div>
      )}
    </div>
  );
}

export default CustomTable;
