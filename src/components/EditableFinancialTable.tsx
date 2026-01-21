import { useState, useCallback, useEffect } from 'react';
import { Pencil, Check, X, TrendingUp, DollarSign } from 'lucide-react';
import { apiClient } from '../lib/api-client';

interface Cell {
  id: string;
  value: number;
  formula?: string;
  isEditable: boolean;
  dependencies?: string[];
}

interface EditableFinancialTableProps {
  planId: string;
  data: {
    rows: Array<{
      id: string;
      label: string;
      cells: Cell[];
    }>;
    columns: Array<{
      id: string;
      label: string;
    }>;
  };
  onUpdate?: (updatedData: any) => void;
}

export default function EditableFinancialTable({
  planId,
  data,
  onUpdate
}: EditableFinancialTableProps) {
  const [editingCell, setEditingCell] = useState<{ rowId: string; cellId: string } | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [localData, setLocalData] = useState(data);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    setLocalData(data);
  }, [data]);

  const handleCellClick = (rowId: string, cell: Cell) => {
    if (cell.isEditable && !editingCell) {
      setEditingCell({ rowId, cellId: cell.id });
      setEditValue(cell.value.toString());
    }
  };

  const handleCellUpdate = async (rowId: string, cellId: string, newValue: number) => {
    if (!planId) return;

    setRecalculating(true);

    try {
      // Update cell via API
      const response = await apiClient.post(`/api/v1/plans/${planId}/financials/update-cell`, {
        rowId,
        cellId,
        value: newValue
      });

      const updatedData = response.data?.value || response.data;
      
      // Update local state
      setLocalData(prev => {
        const newData = { ...prev };
        const row = newData.rows.find(r => r.id === rowId);
        if (row) {
          const cell = row.cells.find(c => c.id === cellId);
          if (cell) {
            cell.value = newValue;
          }
        }
        return newData;
      });

      if (onUpdate) {
        onUpdate(updatedData);
      }
    } catch (err: any) {
      console.error('Failed to update cell:', err);
      // Revert on error
      setLocalData(data);
    } finally {
      setRecalculating(false);
      setEditingCell(null);
    }
  };

  const handleSave = () => {
    if (!editingCell) return;
    
    const numericValue = parseFloat(editValue);
    if (isNaN(numericValue)) {
      // Invalid number, revert
      setEditingCell(null);
      return;
    }

    handleCellUpdate(editingCell.rowId, editingCell.cellId, numericValue);
  };

  const handleCancel = () => {
    setEditingCell(null);
    setEditValue('');
  };

  const getCellDisplayValue = (cell: Cell): string => {
    if (editingCell && editingCell.cellId === cell.id) {
      return editValue;
    }
    return cell.value.toLocaleString('en-CA', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const isCellEditable = (cell: Cell): boolean => {
    return cell.isEditable && !recalculating;
  };

  return (
    <div className="overflow-x-auto">
      {recalculating && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200 flex items-center gap-2">
            <TrendingUp size={16} className="animate-pulse" />
            Recalculating financials...
          </p>
        </div>
      )}

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left p-3 border-b border-gray-200 dark:border-gray-700 font-semibold">
              Category
            </th>
            {localData.columns.map(col => (
              <th
                key={col.id}
                className="text-right p-3 border-b border-gray-200 dark:border-gray-700 font-semibold"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {localData.rows.map(row => (
            <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
              <td className="p-3 border-b border-gray-200 dark:border-gray-700 font-medium">
                {row.label}
              </td>
              {row.cells.map(cell => {
                const isEditing = editingCell?.rowId === row.id && editingCell?.cellId === cell.id;
                const isEditable = isCellEditable(cell);

                return (
                  <td
                    key={cell.id}
                    onClick={() => isEditable && handleCellClick(row.id, cell)}
                    className={`
                      text-right p-3 border-b border-gray-200 dark:border-gray-700
                      ${isEditable ? 'cursor-pointer hover:bg-orange-50 dark:hover:bg-orange-900/20' : ''}
                      ${isEditing ? 'ring-2 ring-orange-500' : ''}
                      ${isEditable ? 'relative' : ''}
                    `}
                    title={cell.formula ? `Formula: ${cell.formula}` : undefined}
                  >
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-2">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSave();
                            if (e.key === 'Escape') handleCancel();
                          }}
                          autoFocus
                          className="w-24 px-2 py-1 rounded border border-orange-300 dark:border-orange-700 bg-white dark:bg-gray-800 text-right"
                        />
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSave();
                          }}
                          className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900/30"
                        >
                          <Check size={16} className="text-green-600 dark:text-green-400" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCancel();
                          }}
                          className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30"
                        >
                          <X size={16} className="text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-2">
                        <span>${getCellDisplayValue(cell)}</span>
                        {isEditable && (
                          <Pencil
                            size={14}
                            className="opacity-0 group-hover:opacity-100 text-gray-400"
                          />
                        )}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        <p>💡 Click on highlighted cells to edit. Changes will automatically recalculate dependent values.</p>
      </div>
    </div>
  );
}
