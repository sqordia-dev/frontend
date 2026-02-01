import React, { useState, useCallback, useEffect } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { TableData, TableRow, TableCell } from '../../../types/visual-elements';

interface EditableTableProps {
  /** Table data */
  data: TableData;
  /** Callback when data changes */
  onDataChange: (data: TableData) => void;
}

interface ContextMenuState {
  x: number;
  y: number;
  rowIndex: number;
}

/**
 * EditableTable Component
 * Provides inline editing for table data with cell navigation,
 * row add/delete context menu, and Tab navigation support.
 */
export function EditableTable({ data, onDataChange }: EditableTableProps) {
  const [activeCell, setActiveCell] = useState<{ row: number; col: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  // Handle cell value change
  const handleCellChange = useCallback(
    (rowIndex: number, colIndex: number, value: string) => {
      const newRows = [...data.rows];
      const newCells = [...newRows[rowIndex].cells];

      // Try to parse as number if it looks like one
      let parsedValue: string | number = value;
      const numValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
      if (!isNaN(numValue) && value.match(/^[\d,.$%-]+$/)) {
        parsedValue = numValue;
      }

      newCells[colIndex] = { ...newCells[colIndex], value: parsedValue };
      newRows[rowIndex] = { ...newRows[rowIndex], cells: newCells };

      onDataChange({ ...data, rows: newRows });
    },
    [data, onDataChange]
  );

  // Handle header change
  const handleHeaderChange = useCallback(
    (index: number, value: string) => {
      const newHeaders = [...data.headers];
      newHeaders[index] = value;
      onDataChange({ ...data, headers: newHeaders });
    },
    [data, onDataChange]
  );

  // Handle adding a row
  const handleAddRow = useCallback(
    (afterIndex: number) => {
      const newRow: TableRow = {
        cells: data.headers.map(() => ({ value: '' })),
      };
      const newRows = [...data.rows];
      newRows.splice(afterIndex + 1, 0, newRow);
      onDataChange({ ...data, rows: newRows });
      setContextMenu(null);

      // Set focus to first cell of new row
      setTimeout(() => {
        setActiveCell({ row: afterIndex + 1, col: 0 });
      }, 0);
    },
    [data, onDataChange]
  );

  // Handle deleting a row
  const handleDeleteRow = useCallback(
    (index: number) => {
      if (data.rows.length <= 1) return; // Keep at least one row

      const newRows = data.rows.filter((_, i) => i !== index);
      onDataChange({ ...data, rows: newRows });
      setContextMenu(null);

      // Update active cell if needed
      if (activeCell && activeCell.row >= newRows.length) {
        setActiveCell({ row: newRows.length - 1, col: activeCell.col });
      }
    },
    [data, onDataChange, activeCell]
  );

  // Handle context menu
  const handleContextMenu = useCallback((e: React.MouseEvent, rowIndex: number) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, rowIndex });
  }, []);

  // Handle Tab navigation between cells
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, rowIndex: number, colIndex: number) => {
      if (e.key === 'Tab') {
        e.preventDefault();

        if (e.shiftKey) {
          // Move backwards
          if (colIndex > 0) {
            setActiveCell({ row: rowIndex, col: colIndex - 1 });
          } else if (rowIndex > 0) {
            setActiveCell({ row: rowIndex - 1, col: data.headers.length - 1 });
          }
        } else {
          // Move forwards
          if (colIndex < data.headers.length - 1) {
            setActiveCell({ row: rowIndex, col: colIndex + 1 });
          } else if (rowIndex < data.rows.length - 1) {
            setActiveCell({ row: rowIndex + 1, col: 0 });
          }
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        // Move to next row, same column
        if (rowIndex < data.rows.length - 1) {
          setActiveCell({ row: rowIndex + 1, col: colIndex });
        }
      } else if (e.key === 'Escape') {
        setActiveCell(null);
      }
    },
    [data.headers.length, data.rows.length]
  );

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.context-menu')) {
        setContextMenu(null);
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Focus active cell input
  useEffect(() => {
    if (activeCell) {
      const input = document.querySelector(
        `[data-cell="${activeCell.row}-${activeCell.col}"]`
      ) as HTMLInputElement | null;
      input?.focus();
      input?.select();
    }
  }, [activeCell]);

  return (
    <div className="relative overflow-x-auto">
      <table className="w-full border-collapse bg-white dark:bg-gray-800 rounded-lg overflow-hidden">
        {/* Headers */}
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700">
            <th className="w-8 px-2" aria-label="Row actions"></th>
            {data.headers.map((header, index) => (
              <th
                key={index}
                className="px-4 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600"
              >
                <input
                  type="text"
                  value={header}
                  onChange={(e) => handleHeaderChange(index, e.target.value)}
                  className="w-full bg-transparent font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-1 -mx-1"
                  aria-label={`Edit header ${index + 1}`}
                />
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {data.rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="group hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              onContextMenu={(e) => handleContextMenu(e, rowIndex)}
            >
              {/* Row drag handle / menu trigger */}
              <td className="w-8 px-2 text-center">
                <button
                  onClick={(e) => handleContextMenu(e, rowIndex)}
                  className="p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-gray-600 dark:hover:text-gray-300 transition-opacity cursor-grab"
                  aria-label="Row options"
                >
                  <GripVertical size={14} />
                </button>
              </td>

              {/* Cells */}
              {row.cells.map((cell, colIndex) => {
                const isActive =
                  activeCell?.row === rowIndex && activeCell?.col === colIndex;

                return (
                  <td
                    key={colIndex}
                    className={`px-4 py-3 text-sm text-gray-700 dark:text-gray-300 border-b border-gray-100 dark:border-gray-700 ${
                      isActive ? 'ring-2 ring-blue-500 ring-inset' : ''
                    }`}
                    onClick={() => setActiveCell({ row: rowIndex, col: colIndex })}
                  >
                    <input
                      type="text"
                      data-cell={`${rowIndex}-${colIndex}`}
                      value={String(cell.value)}
                      onChange={(e) =>
                        handleCellChange(rowIndex, colIndex, e.target.value)
                      }
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                      onFocus={() => setActiveCell({ row: rowIndex, col: colIndex })}
                      className="w-full bg-transparent focus:outline-none"
                      aria-label={`Edit cell row ${rowIndex + 1}, column ${colIndex + 1}`}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Context Menu */}
      <AnimatePresence>
        {contextMenu && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.1 }}
            className="context-menu fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 min-w-[150px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <button
              onClick={() => handleAddRow(contextMenu.rowIndex)}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors"
            >
              <Plus size={14} aria-hidden="true" />
              Add row below
            </button>
            <button
              onClick={() => handleDeleteRow(contextMenu.rowIndex)}
              disabled={data.rows.length <= 1}
              className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={14} aria-hidden="true" />
              Delete row
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instructions */}
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
        Tab to navigate cells, Enter to move down, right-click for row options
      </p>
    </div>
  );
}

export default EditableTable;
