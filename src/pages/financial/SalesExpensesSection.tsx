import { useState, useMemo, useCallback, type FC } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Trash2, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import YearTabBar from '../../components/financial/YearTabBar';
import { useSalesExpenses, useCreateSalesExpense, useUpdateSalesExpense, useDeleteSalesExpense } from '../../hooks/usePrevisio';
import type { FinancialPlanDto, SalesExpenseItem, ExpenseMode } from '../../types/financial-projections';
import { SkeletonTable } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '../../components/ui/alert-dialog';

interface OutletContext {
  plan: FinancialPlanDto;
  businessPlanId: string;
}

const MONTH_ABBR_FR = ['JANV.', 'FEVR.', 'MARS', 'AVR.', 'MAI', 'JUIN', 'JUIL.', 'AOUT', 'SEPT.', 'OCT.', 'NOV.', 'DEC.'];
const MONTH_ABBR_EN = ['JAN.', 'FEB.', 'MAR.', 'APR.', 'MAY', 'JUN.', 'JUL.', 'AUG.', 'SEP.', 'OCT.', 'NOV.', 'DEC.'];

const EXPENSE_MODES: { value: ExpenseMode; label: string }[] = [
  { value: 'FixedDollars', label: 'Dollars ($)' },
  { value: 'PercentageOfSales', label: '%' },
];

function getMonthHeaders(startMonth: number, startYear: number, projectionYear: number, lang: string) {
  const sm = Math.max(1, Math.min(12, startMonth));
  const abbr = lang === 'fr' ? MONTH_ABBR_FR : MONTH_ABBR_EN;
  const headers: string[] = [];
  const baseYear = projectionYear <= 0 ? startYear - 1 : startYear + (projectionYear - 1);
  for (let i = 0; i < 12; i++) {
    const m0 = (sm - 1 + i) % 12;
    const y = baseYear + Math.floor((sm - 1 + i) / 12);
    headers.push(`${abbr[m0]} ${String(y).slice(-2)}`);
  }
  return headers;
}

function fmtCell(value: number): string {
  if (value === 0) return '0';
  return Math.round(value).toLocaleString('fr-CA');
}

interface ExpenseRow {
  id: string;
  isNew: boolean;
  name: string;
  expenseMode: ExpenseMode;
  amount: number;
  taxRate: number;
}

const GRID_COLS = 'minmax(100px, auto) repeat(12, 1fr) minmax(60px, auto)';

const SalesExpensesSection: FC = () => {
  const { t, language } = useTheme();
  const { plan, businessPlanId } = useOutletContext<OutletContext>();
  const { data: expenses, isLoading } = useSalesExpenses(businessPlanId);
  const createExpense = useCreateSalesExpense(businessPlanId);
  const updateExpense = useUpdateSalesExpense(businessPlanId);
  const deleteExpense = useDeleteSalesExpense(businessPlanId);

  const [activeYear, setActiveYear] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [forecastRow, setForecastRow] = useState<ExpenseRow | null>(null);

  // Inline rows
  const [rows, setRows] = useState<ExpenseRow[]>([]);
  const [rowsInitialized, setRowsInitialized] = useState(false);

  // Initialize from API
  if (expenses && !rowsInitialized) {
    setRows(
      expenses.map((e) => ({
        id: e.id,
        isNew: false,
        name: e.name,
        expenseMode: e.expenseMode,
        amount: e.amount,
        taxRate: 14.98,
      }))
    );
    setRowsInitialized(true);
  }

  const monthHeaders = useMemo(
    () => getMonthHeaders(plan.startMonth || 1, plan.startYear, activeYear, language),
    [plan.startMonth, plan.startYear, activeYear, language],
  );

  const projectionYears = plan.projectionYears ?? 3;

  // Local monthly overrides
  const [expenseGrid, setExpenseGrid] = useState<Record<string, Record<number, number[]>>>({});

  const handleAddLine = () => {
    setRows((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        isNew: true,
        name: '',
        expenseMode: 'FixedDollars',
        amount: 0,
        taxRate: 14.98,
      },
    ]);
  };

  const handleRowChange = (id: string, field: keyof ExpenseRow, value: string | number) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleRemoveRow = (id: string) => {
    const row = rows.find((r) => r.id === id);
    if (row?.isNew) {
      setRows((prev) => prev.filter((r) => r.id !== id));
    } else {
      setDeleteId(id);
    }
  };

  const handleCellChange = useCallback(
    (rowId: string, monthIndex: number, value: number) => {
      setExpenseGrid((prev) => {
        const rowGrid = { ...(prev[rowId] ?? {}) };
        const yearVals = [...(rowGrid[activeYear] ?? Array(12).fill(0))];
        yearVals[monthIndex] = value;
        rowGrid[activeYear] = yearVals;
        return { ...prev, [rowId]: rowGrid };
      });
    },
    [activeYear],
  );

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const row of rows) {
        const payload = {
          name: row.name,
          category: 'Other',
          expenseMode: row.expenseMode,
          amount: row.amount,
          frequency: 'Monthly' as const,
          indexationRate: 0,
        };
        if (row.isNew && row.name.trim()) {
          await createExpense.mutateAsync(payload);
        } else if (!row.isNew) {
          await updateExpense.mutateAsync({ itemId: row.id, data: payload });
        }
      }
      setRowsInitialized(false);
    } catch {
      // handled by hooks
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setRowsInitialized(false);
    setExpenseGrid({});
  };

  const handleAddToForecast = (rowId: string, amount: number, startDate: string, recurring: boolean) => {
    const [yearStr, monthStr] = startDate.split('-');
    const startYr = parseInt(yearStr, 10);
    const startMo = parseInt(monthStr, 10);
    const planStart = plan.startMonth || 1;
    const planStartYear = plan.startYear;

    // Fill all years from the start date
    setExpenseGrid((prev) => {
      const updated = { ...prev };
      const rowGrid = { ...(updated[rowId] ?? {}) };

      for (let yr = 0; yr <= projectionYears; yr++) {
        const baseYear = yr <= 0 ? planStartYear - 1 : planStartYear + (yr - 1);
        const yearVals = [...(rowGrid[yr] ?? Array(12).fill(0))];

        for (let i = 0; i < 12; i++) {
          const m0 = (planStart - 1 + i) % 12;
          const cellYear = baseYear + Math.floor((planStart - 1 + i) / 12);
          const cellMonth = m0 + 1;

          if (cellYear > startYr || (cellYear === startYr && cellMonth >= startMo)) {
            yearVals[i] = amount;
            if (!recurring) {
              // One-time: only set the first matching month
              rowGrid[yr] = yearVals;
              updated[rowId] = rowGrid;
              return updated;
            }
          }
        }
        rowGrid[yr] = yearVals;
      }

      updated[rowId] = rowGrid;
      return updated;
    });

    setForecastRow(null);
  };

  // Build grid rows
  const savedExpenses = expenses ?? [];
  const savedIds = new Set(savedExpenses.map((e) => e.id));

  const gridRows = [
    ...savedExpenses.map((item) => {
      const overrides = expenseGrid[item.id]?.[activeYear];
      const monthly = overrides ?? Array(12).fill(item.amount) as number[];
      return { id: item.id, name: item.name, monthly };
    }),
    ...rows
      .filter((r) => r.isNew)
      .map((r) => ({
        id: r.id,
        name: r.name || t('fin.salesExp.expensePlaceholder'),
        monthly: expenseGrid[r.id]?.[activeYear] ?? Array(12).fill(0) as number[],
      })),
  ];

  // Totals
  const monthlyTotals = Array.from({ length: 12 }, (_, i) =>
    gridRows.reduce((sum, r) => sum + (r.monthly[i] ?? 0), 0),
  );
  const grandTotal = monthlyTotals.reduce((a, b) => a + b, 0);

  if (isLoading) return <SkeletonTable rows={5} columns={6} />;

  return (
    <div>
      {/* ── Title ── */}
      <h2 className="text-2xl font-heading font-bold text-strategy-blue mb-6">
        {t('fin.salesExp.title')}
      </h2>

      {/* ── Inline form header ── */}
      <div className="flex flex-wrap items-end gap-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        <span className="min-w-[180px]">
          {t('fin.salesExp.expenseName')} <span className="text-red-500">*</span>
        </span>
        <span className="min-w-[120px]">
          {t('fin.salesExp.dollarOrPercent')} <span className="text-red-500">*</span>
        </span>
        <span className="min-w-[90px]">
          {t('fin.salesExp.value')} <span className="text-red-500">*</span>
        </span>
        <span className="min-w-[90px]">
          {t('fin.salesExp.taxes')} <span className="text-red-500">*</span>
        </span>
      </div>

      {/* Expense rows */}
      <div className="space-y-2 mb-4">
        {rows.map((row) => (
          <div key={row.id} className="flex flex-wrap items-center gap-3">
            <Input
              className="min-w-[180px] max-w-[220px] bg-card"
              placeholder={t('fin.salesExp.expensePlaceholder')}
              value={row.name}
              onChange={(e) => handleRowChange(row.id, 'name', e.target.value)}
            />
            <Select
              value={row.expenseMode}
              onValueChange={(val) => handleRowChange(row.id, 'expenseMode', val)}
            >
              <SelectTrigger className="min-w-[120px] max-w-[150px] bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPENSE_MODES.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              className="w-[90px] bg-blue-50 dark:bg-blue-900/20 text-center font-medium"
              type="number"
              step="0.01"
              value={row.amount || ''}
              onChange={(e) =>
                handleRowChange(row.id, 'amount', parseFloat(e.target.value) || 0)
              }
            />
            <Input
              className="w-[90px] bg-card text-center font-medium"
              type="number"
              step="0.01"
              value={row.taxRate || ''}
              onChange={(e) =>
                handleRowChange(row.id, 'taxRate', parseFloat(e.target.value) || 0)
              }
            />
            <Button
              variant="outline"
              size="sm"
              className="rounded-full text-xs whitespace-nowrap"
              onClick={() => setForecastRow(row)}
            >
              {t('fin.salesExp.addToForecast')}
            </Button>
            <button
              onClick={() => handleRemoveRow(row.id)}
              className="p-1.5 text-muted-foreground hover:text-red-500 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add line button */}
      <Button
        variant="outline"
        size="sm"
        className="rounded-full mb-8"
        onClick={handleAddLine}
      >
        {t('fin.salesExp.addLine')}
      </Button>

      {/* ── Monthly Forecasts card ── */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-lg font-heading font-bold text-foreground mb-4">
          {t('fin.salesExp.monthlyForecasts')}
        </h3>

        <YearTabBar
          projectionYears={projectionYears}
          activeYear={activeYear}
          onYearChange={setActiveYear}
          showPreOpening
          className="mb-8"
        />

        {/* ── Grid ── */}
        <div className="grid gap-y-1" style={{ gridTemplateColumns: GRID_COLS }}>
          {/* Header row */}
          <div />
          {monthHeaders.map((label, i) => (
            <div
              key={i}
              className="px-1 py-2 text-center font-bold text-[11px] uppercase tracking-wider text-muted-foreground"
            >
              {label}
            </div>
          ))}
          <div className="px-1 py-2 text-center font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
            TOTAL
          </div>

          {/* Editable expense rows */}
          {gridRows.map((gr) => (
            <EditableGridRow
              key={gr.id}
              rowId={gr.id}
              label={gr.name}
              values={gr.monthly}
              total={gr.monthly.reduce((a: number, b: number) => a + b, 0)}
              onCellChange={handleCellChange}
            />
          ))}

          {/* Total row */}
          {gridRows.length > 0 && (
            <>
              <div className="px-2 py-2 text-sm font-semibold text-foreground self-center">
                Total
              </div>
              {monthlyTotals.map((val, i) => (
                <div key={i} className="px-1 py-1">
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/30 rounded-lg h-10 flex items-center justify-center text-sm text-foreground">
                    {fmtCell(val)}
                  </div>
                </div>
              ))}
              <div className="px-1 py-1">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/30 rounded-lg h-10 flex items-center justify-center text-sm font-bold text-foreground">
                  {fmtCell(grandTotal)}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Save / Cancel ── */}
      <div className="flex items-center gap-4 mt-10 pt-8 border-t border-border">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="rounded-full px-8"
        >
          {saving ? t('fin.ident.saving') : t('fin.common.save')}
        </Button>
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={saving}
          className="rounded-full px-8 text-strategy-blue border-strategy-blue hover:bg-strategy-blue/5"
        >
          {t('fin.common.cancel')}
        </Button>
      </div>

      {/* ── Add to Forecast Dialog ── */}
      <AddToForecastDialog
        open={!!forecastRow}
        rowName={forecastRow?.name ?? ''}
        defaultAmount={forecastRow?.amount ?? 0}
        defaultStartDate={`${plan.startYear}-${String(plan.startMonth || 1).padStart(2, '0')}`}
        onClose={() => setForecastRow(null)}
        onSubmit={(amount, startDate, recurring) => {
          if (forecastRow) handleAddToForecast(forecastRow.id, amount, startDate, recurring);
        }}
        t={t}
      />

      {/* ── Delete confirmation ── */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('fin.common.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>{t('fin.common.confirmDeleteDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('fin.common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  deleteExpense.mutate(deleteId);
                  setRows((prev) => prev.filter((r) => r.id !== deleteId));
                  setDeleteId(null);
                }
              }}
            >
              {t('fin.common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SalesExpensesSection;

// ── Editable grid row ──

function EditableGridRow({
  rowId,
  label,
  values,
  total,
  onCellChange,
}: {
  rowId: string;
  label: string;
  values: number[];
  total: number;
  onCellChange: (rowId: string, monthIndex: number, value: number) => void;
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(values[index] === 0 ? '' : String(values[index]));
  };

  const commitAndMove = (nextIndex: number | null) => {
    if (editingIndex !== null) {
      onCellChange(rowId, editingIndex, parseFloat(editValue) || 0);
    }
    if (nextIndex !== null && nextIndex >= 0 && nextIndex < 12) {
      setEditingIndex(nextIndex);
      setEditValue(values[nextIndex] === 0 ? '' : String(values[nextIndex]));
    } else {
      setEditingIndex(null);
      setEditValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); commitAndMove(editingIndex !== null ? editingIndex + 1 : null); }
    if (e.key === 'Tab') { e.preventDefault(); commitAndMove(editingIndex !== null ? editingIndex + (e.shiftKey ? -1 : 1) : null); }
    if (e.key === 'Escape') { setEditingIndex(null); setEditValue(''); }
  };

  return (
    <>
      <div className="px-2 py-2 text-sm text-foreground font-medium self-center truncate">
        {label}
      </div>
      {values.map((val, i) => (
        <div key={i} className="px-1 py-1">
          {editingIndex === i ? (
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => commitAndMove(null)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full h-10 text-center border-2 border-strategy-blue rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-strategy-blue/20"
            />
          ) : (
            <div
              className="border border-border rounded-lg h-10 flex items-center justify-center text-sm font-medium text-foreground cursor-pointer bg-card hover:border-strategy-blue/40 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors"
              onClick={() => startEdit(i)}
            >
              {fmtCell(val)}
            </div>
          )}
        </div>
      ))}
      <div className="px-1 py-1">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/30 rounded-lg h-10 flex items-center justify-center text-sm font-bold text-foreground">
          {fmtCell(total)}
        </div>
      </div>
    </>
  );
}

// ── Add to Forecast Dialog ──

function AddToForecastDialog({
  open,
  rowName,
  defaultAmount,
  defaultStartDate,
  onClose,
  onSubmit,
  t,
}: {
  open: boolean;
  rowName: string;
  defaultAmount: number;
  defaultStartDate: string;
  onClose: () => void;
  onSubmit: (amount: number, startDate: string, recurring: boolean) => void;
  t: (key: string) => string;
}) {
  const [amount, setAmount] = useState(defaultAmount);
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [recurring, setRecurring] = useState(false);

  // Reset when dialog opens with new data
  const [prevName, setPrevName] = useState(rowName);
  if (rowName !== prevName) {
    setPrevName(rowName);
    setAmount(defaultAmount);
    setStartDate(defaultStartDate);
    setRecurring(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h3 className="text-lg font-heading font-bold text-foreground mb-6 pr-8">
          {t('fin.forecast.dialogTitle')} &ldquo;{rowName}&rdquo;
        </h3>

        {/* Fields */}
        <div className="flex flex-wrap items-end gap-4 mb-2">
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {t('fin.forecast.amount')}
            </label>
            <input
              type="number"
              value={amount || ''}
              onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              className="w-[100px] h-10 text-center border border-border rounded-lg text-sm font-medium bg-card focus:outline-none focus:border-strategy-blue focus:ring-2 focus:ring-strategy-blue/20"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {t('fin.forecast.startDate')}
            </label>
            <input
              type="month"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10 px-3 border border-border rounded-lg text-sm font-medium bg-card focus:outline-none focus:border-strategy-blue focus:ring-2 focus:ring-strategy-blue/20"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              {t('fin.forecast.recurring')}
            </label>
            <button
              onClick={() => setRecurring(!recurring)}
              className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors ${
                recurring
                  ? 'bg-strategy-blue border-strategy-blue'
                  : 'bg-card border-border hover:border-strategy-blue/40'
              }`}
            >
              {recurring && (
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="rounded-full text-xs whitespace-nowrap h-10"
            onClick={() => onSubmit(amount, startDate, recurring)}
          >
            {t('fin.forecast.addBtn')}
          </Button>
        </div>
      </div>
    </div>
  );
}
