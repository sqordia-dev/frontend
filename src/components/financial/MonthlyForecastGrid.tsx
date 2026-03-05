import React, { useRef, useState, useEffect } from 'react';

interface MonthlyForecastGridProps {
  rows: GridRow[];
  onCellChange?: (rowId: string, month: number, value: number) => void;
  editable?: boolean;
  currency?: string;
  className?: string;
}

export interface GridRow {
  id: string;
  label: string;
  monthlyValues: number[];
  isEditable?: boolean;
  isSubtotal?: boolean;
  isTotal?: boolean;
  isBold?: boolean;
}

const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

const formatValue = (value: number, currency = '$'): string => {
  if (value === 0) return '-';
  return Math.abs(value).toLocaleString('fr-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const MonthlyForecastGrid: React.FC<MonthlyForecastGridProps> = ({
  rows,
  onCellChange,
  editable = true,
  currency = '$',
  className = '',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [editingCell, setEditingCell] = useState<{ rowId: string; month: number } | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleStartEdit = (rowId: string, month: number, currentValue: number) => {
    if (!editable) return;
    const row = rows.find(r => r.id === rowId);
    if (!row?.isEditable) return;
    setEditingCell({ rowId, month });
    setEditValue(currentValue === 0 ? '' : String(currentValue));
  };

  const handleFinishEdit = () => {
    if (editingCell && onCellChange) {
      const numValue = parseFloat(editValue) || 0;
      onCellChange(editingCell.rowId, editingCell.month, numValue);
    }
    setEditingCell(null);
    setEditValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleFinishEdit();
    if (e.key === 'Escape') { setEditingCell(null); setEditValue(''); }
    if (e.key === 'Tab') {
      e.preventDefault();
      handleFinishEdit();
    }
  };

  return (
    <div className={`border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden ${className}`}>
      <div ref={scrollRef} className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800">
              <th className="sticky left-0 z-10 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-left font-medium text-gray-600 dark:text-gray-300 w-48 min-w-[192px]">
                Poste
              </th>
              {MONTHS.map((month, i) => (
                <th key={i} className="px-2 py-2 text-right font-medium text-gray-600 dark:text-gray-300 min-w-[80px]">
                  {month}
                </th>
              ))}
              <th className="px-3 py-2 text-right font-semibold text-gray-800 dark:text-gray-200 min-w-[100px] bg-gray-100 dark:bg-gray-750">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const total = row.monthlyValues.reduce((sum, v) => sum + v, 0);
              const isHighlighted = row.isSubtotal || row.isTotal;

              return (
                <tr
                  key={row.id}
                  className={`border-t border-gray-100 dark:border-gray-700 ${
                    isHighlighted ? 'bg-blue-50/50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                >
                  <td className={`sticky left-0 z-10 px-3 py-1.5 ${
                    isHighlighted ? 'bg-blue-50/50 dark:bg-blue-900/20 font-semibold' : 'bg-white dark:bg-gray-900'
                  } ${row.isBold ? 'font-semibold' : ''}`}>
                    {row.label}
                  </td>
                  {row.monthlyValues.map((value, monthIndex) => {
                    const isEditing = editingCell?.rowId === row.id && editingCell?.month === monthIndex;

                    return (
                      <td
                        key={monthIndex}
                        className={`px-1 py-1 text-right ${
                          row.isEditable && editable ? 'cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30' : ''
                        } ${value < 0 ? 'text-red-600 dark:text-red-400' : ''}`}
                        onClick={() => handleStartEdit(row.id, monthIndex, value)}
                      >
                        {isEditing ? (
                          <input
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={handleFinishEdit}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className="w-full px-1 py-0 text-right border border-blue-400 rounded text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400"
                          />
                        ) : (
                          formatValue(value, currency)
                        )}
                      </td>
                    );
                  })}
                  <td className={`px-3 py-1.5 text-right font-semibold bg-gray-50 dark:bg-gray-800/50 ${
                    total < 0 ? 'text-red-600 dark:text-red-400' : ''
                  }`}>
                    {formatValue(total, currency)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MonthlyForecastGrid;
