import { useState, useMemo, useCallback, type FC } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Trash2, Calculator, X, Check } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import YearTabBar from '../../components/financial/YearTabBar';
import { usePayrollModule, useCreatePayroll, useUpdatePayroll, useDeletePayroll } from '../../hooks/usePrevisio';
import type { FinancialPlanDto, PayrollItem, PayrollType, EmploymentStatus } from '../../types/financial-projections';
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

const PAYROLL_TYPES: { value: PayrollType; labelKey: string }[] = [
  { value: 'Owner', labelKey: 'fin.payroll.owner' },
  { value: 'Production', labelKey: 'fin.payroll.production' },
  { value: 'Sales', labelKey: 'fin.payroll.sales' },
  { value: 'Admin', labelKey: 'fin.payroll.admin' },
];

const EMPLOYMENT_TYPES: { value: EmploymentStatus; labelKey: string }[] = [
  { value: 'Employee', labelKey: 'fin.payroll.employee' },
  { value: 'Contractor', labelKey: 'fin.payroll.contractor' },
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

interface PayrollRow {
  id: string;
  isNew: boolean;
  payrollType: PayrollType;
  jobTitle: string;
  employmentStatus: EmploymentStatus;
  socialChargeRate: number;
  taxRate: number;
  monthlySalary: number;
  headCount: number;
}

const GRID_COLS = 'minmax(120px, auto) repeat(12, 1fr) minmax(60px, auto)';

const PayrollSection: FC = () => {
  const { t, language } = useTheme();
  const { plan, businessPlanId } = useOutletContext<OutletContext>();
  const { data: payrollData, isLoading } = usePayrollModule(businessPlanId);
  const createPayroll = useCreatePayroll(businessPlanId);
  const updatePayroll = useUpdatePayroll(businessPlanId);
  const deletePayroll = useDeletePayroll(businessPlanId);

  const [activeYear, setActiveYear] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [calcOpen, setCalcOpen] = useState(false);
  const [forecastRow, setForecastRow] = useState<PayrollRow | null>(null);

  // Inline rows
  const [rows, setRows] = useState<PayrollRow[]>([]);
  const [rowsInitialized, setRowsInitialized] = useState(false);

  // Initialize from API
  if (payrollData?.items && !rowsInitialized) {
    setRows(
      payrollData.items.map((p) => ({
        id: p.id,
        isNew: false,
        payrollType: p.payrollType,
        jobTitle: p.jobTitle,
        employmentStatus: p.employmentStatus,
        socialChargeRate: p.socialChargeRate,
        taxRate: 14.98,
        monthlySalary: p.monthlySalary,
        headCount: p.headCount,
      }))
    );
    setRowsInitialized(true);
  }

  const monthHeaders = useMemo(
    () => getMonthHeaders(plan.startMonth || 1, plan.startYear, activeYear, language),
    [plan.startMonth, plan.startYear, activeYear, language],
  );

  const projectionYears = plan.projectionYears ?? 3;

  // Local monthly salary overrides per row per year
  const [salaryGrid, setSalaryGrid] = useState<Record<string, Record<number, number[]>>>({});

  const handleAddLine = () => {
    setRows((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        isNew: true,
        payrollType: '' as PayrollType,
        jobTitle: '',
        employmentStatus: '' as EmploymentStatus,
        socialChargeRate: plan.defaultSocialChargeRate ?? 15,
        taxRate: 14.98,
        monthlySalary: 0,
        headCount: 1,
      },
    ]);
  };

  const handleRowChange = (id: string, field: keyof PayrollRow, value: string | number) => {
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
      setSalaryGrid((prev) => {
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
          jobTitle: row.jobTitle,
          payrollType: row.payrollType,
          employmentStatus: row.employmentStatus,
          salaryFrequency: 'Monthly' as const,
          salaryAmount: row.monthlySalary,
          socialChargeRate: row.socialChargeRate,
          headCount: row.headCount,
        };
        if (row.isNew && row.jobTitle.trim()) {
          await createPayroll.mutateAsync(payload);
        } else if (!row.isNew) {
          await updatePayroll.mutateAsync({ itemId: row.id, data: payload });
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
    setSalaryGrid({});
  };

  const handleAddToForecast = (rowId: string, amount: number, startDate: string, recurring: boolean) => {
    const [yearStr, monthStr] = startDate.split('-');
    const startYr = parseInt(yearStr, 10);
    const startMo = parseInt(monthStr, 10);
    const planStart = plan.startMonth || 1;
    const planStartYear = plan.startYear;

    setSalaryGrid((prev) => {
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

  // Build grid data for each row
  const items = payrollData?.items ?? [];
  const savedIds = new Set(items.map((p) => p.id));

  const gridRows = [
    ...items.map((item) => {
      const overrides = salaryGrid[item.id]?.[activeYear];
      const monthly = overrides ?? Array(12).fill(item.monthlySalary * item.headCount);
      return { id: item.id, name: item.jobTitle, monthly, socialChargeRate: item.socialChargeRate };
    }),
    ...rows
      .filter((r) => r.isNew)
      .map((r) => ({
        id: r.id,
        name: r.jobTitle || t('fin.payroll.positionPlaceholder'),
        monthly: salaryGrid[r.id]?.[activeYear] ?? Array(12).fill(0) as number[],
        socialChargeRate: r.socialChargeRate,
      })),
  ];

  // Totals
  const monthlyLaborTotals = Array.from({ length: 12 }, (_, i) =>
    gridRows.reduce((sum, r) => sum + (r.monthly[i] ?? 0), 0),
  );
  const monthlySocialTotals = Array.from({ length: 12 }, (_, i) =>
    gridRows.reduce((sum, r) => sum + (r.monthly[i] ?? 0) * (r.socialChargeRate / 100), 0),
  );
  const monthlyCombinedTotals = monthlyLaborTotals.map((v, i) => v + monthlySocialTotals[i]);

  const totalLabor = monthlyLaborTotals.reduce((a, b) => a + b, 0);
  const totalSocial = monthlySocialTotals.reduce((a, b) => a + b, 0);
  const totalCombined = totalLabor + totalSocial;

  if (isLoading) return <SkeletonTable rows={5} columns={6} />;

  return (
    <div>
      {/* ── Title + Calculator ── */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-heading font-bold text-strategy-blue">
          {t('fin.payroll.pageTitle')}
        </h2>
        <button
          onClick={() => setCalcOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-strategy-blue border border-border rounded-lg bg-card hover:bg-muted/50 transition-colors"
        >
          <Calculator className="w-4 h-4" />
          {t('fin.payroll.salaryCalculator')}
        </button>
      </div>

      {/* ── Inline form header ── */}
      <div className="flex flex-wrap items-end gap-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        <span className="min-w-[140px]">
          {t('fin.payroll.laborType')} <span className="text-red-500">*</span>
        </span>
        <span className="min-w-[200px]">
          {t('fin.payroll.positionName')} <span className="text-red-500">*</span>
        </span>
        <span className="min-w-[120px]">
          {t('fin.payroll.type')} <span className="text-red-500">*</span>
        </span>
        <span className="min-w-[100px]">
          {t('fin.payroll.socialCharges')} <span className="text-red-500">*</span>
        </span>
        <span className="min-w-[90px]">
          {t('fin.payroll.taxes')} <span className="text-red-500">*</span>
        </span>
      </div>

      {/* Payroll rows */}
      <div className="space-y-2 mb-4">
        {rows.map((row) => (
          <div key={row.id} className="flex flex-wrap items-center gap-3">
            <Select
              value={row.payrollType}
              onValueChange={(val) => handleRowChange(row.id, 'payrollType', val)}
            >
              <SelectTrigger className="min-w-[140px] max-w-[160px] bg-card">
                <SelectValue placeholder={t('fin.sales.chooseDelay')} />
              </SelectTrigger>
              <SelectContent>
                {PAYROLL_TYPES.map((pt) => (
                  <SelectItem key={pt.value} value={pt.value}>
                    {t(pt.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              className="min-w-[200px] max-w-[240px] bg-card"
              placeholder={t('fin.payroll.positionPlaceholder')}
              value={row.jobTitle}
              onChange={(e) => handleRowChange(row.id, 'jobTitle', e.target.value)}
            />
            <Select
              value={row.employmentStatus}
              onValueChange={(val) => handleRowChange(row.id, 'employmentStatus', val)}
            >
              <SelectTrigger className="min-w-[120px] max-w-[140px] bg-card">
                <SelectValue placeholder={t('fin.sales.chooseDelay')} />
              </SelectTrigger>
              <SelectContent>
                {EMPLOYMENT_TYPES.map((et) => (
                  <SelectItem key={et.value} value={et.value}>
                    {t(et.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              className="w-[100px] bg-blue-50 dark:bg-blue-900/20 text-center font-medium"
              type="number"
              step="0.01"
              value={row.socialChargeRate || ''}
              onChange={(e) =>
                handleRowChange(row.id, 'socialChargeRate', parseFloat(e.target.value) || 0)
              }
            />
            <Input
              className="w-[90px] bg-blue-50 dark:bg-blue-900/20 text-center font-medium"
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
              {t('fin.payroll.addToForecast')}
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

      {/* Progress bar (decorative) */}
      <div className="w-full h-2 rounded-full bg-gradient-to-r from-strategy-blue to-blue-400 mb-4" />

      {/* Add line button */}
      <Button
        variant="outline"
        size="sm"
        className="rounded-full mb-8"
        onClick={handleAddLine}
      >
        {t('fin.payroll.addLine')}
      </Button>

      {/* ── Monthly Forecasts card ── */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-lg font-heading font-bold text-foreground mb-4">
          {t('fin.payroll.monthlyForecasts')}
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

          {/* Editable salary rows */}
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

          {/* Labor Total row */}
          <SummaryRow
            label={t('fin.payroll.laborTotal')}
            values={monthlyLaborTotals}
            total={totalLabor}
            variant="light"
          />

          {/* Social Charges row */}
          <SummaryRow
            label={t('fin.payroll.socialChargeRow')}
            values={monthlySocialTotals}
            total={totalSocial}
            variant="light"
          />

          {/* Combined Total row */}
          <SummaryRow
            label={t('fin.payroll.combinedTotal')}
            values={monthlyCombinedTotals}
            total={totalCombined}
            variant="bold"
          />
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

      {/* ── Salary Calculator Dialog ── */}
      <SalaryCalculatorDialog open={calcOpen} onClose={() => setCalcOpen(false)} t={t} />

      {/* ── Add to Forecast Dialog ── */}
      <AddToForecastDialog
        open={!!forecastRow}
        rowName={forecastRow?.jobTitle ?? ''}
        defaultAmount={forecastRow?.monthlySalary ?? 0}
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
                  deletePayroll.mutate(deleteId);
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

export default PayrollSection;

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

// ── Summary row (read-only) ──

function SummaryRow({
  label,
  values,
  total,
  variant,
}: {
  label: string;
  values: number[];
  total: number;
  variant: 'light' | 'bold';
}) {
  const isBold = variant === 'bold';
  return (
    <>
      <div className={`px-2 py-2 text-sm self-center whitespace-nowrap ${isBold ? 'font-bold text-foreground' : 'font-medium text-muted-foreground'}`}>
        {label}
      </div>
      {values.map((val, i) => (
        <div key={i} className="px-1 py-1">
          <div className={`rounded-lg h-10 flex items-center justify-center text-sm ${
            isBold
              ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200/60 dark:border-blue-800/40 font-bold text-foreground'
              : 'bg-blue-50/60 dark:bg-blue-900/15 border border-blue-100/50 dark:border-blue-800/20 text-foreground'
          }`}>
            {fmtCell(val)}
          </div>
        </div>
      ))}
      <div className="px-1 py-1">
        <div className={`rounded-lg h-10 flex items-center justify-center text-sm ${
          isBold
            ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-200/60 dark:border-blue-800/40 font-bold text-foreground'
            : 'bg-blue-50/60 dark:bg-blue-900/15 border border-blue-100/50 dark:border-blue-800/20 text-foreground'
        }`}>
          {fmtCell(total)}
        </div>
      </div>
    </>
  );
}

// ── Salary Calculator Dialog ──

function SalaryCalculatorDialog({
  open,
  onClose,
  t,
}: {
  open: boolean;
  onClose: () => void;
  t: (key: string) => string;
}) {
  const [annualSalary, setAnnualSalary] = useState(0);
  const [hourlySalary, setHourlySalary] = useState(0);
  const [hoursPerWeek, setHoursPerWeek] = useState(40);
  const [lastEdited, setLastEdited] = useState<'annual' | 'hourly' | null>(null);

  const monthlySalary = useMemo(() => {
    if (lastEdited === 'annual' && annualSalary > 0) return annualSalary / 12;
    if (lastEdited === 'hourly' && hourlySalary > 0) return hourlySalary * hoursPerWeek * 52 / 12;
    return 0;
  }, [annualSalary, hourlySalary, hoursPerWeek, lastEdited]);

  const computedHourly = useMemo(() => {
    if (lastEdited === 'annual' && annualSalary > 0 && hoursPerWeek > 0) return annualSalary / 52 / hoursPerWeek;
    return hourlySalary;
  }, [annualSalary, hourlySalary, hoursPerWeek, lastEdited]);

  const computedAnnual = useMemo(() => {
    if (lastEdited === 'hourly' && hourlySalary > 0) return hourlySalary * hoursPerWeek * 52;
    return annualSalary;
  }, [annualSalary, hourlySalary, hoursPerWeek, lastEdited]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-strategy-blue/10 flex items-center justify-center">
              <Calculator className="w-5 h-5 text-strategy-blue" />
            </div>
            <h3 className="text-lg font-heading font-bold text-foreground">
              {t('fin.payroll.salaryCalculator')}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
          {t('fin.payroll.salaryCalcDesc').split('**').map((part, i) =>
            i % 2 === 1 ? <strong key={i} className="text-foreground">{part}</strong> : part
          )}
        </p>

        {/* Salary fields */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              {t('fin.payroll.annualSalary')}
            </label>
            <input
              type="number"
              value={computedAnnual || ''}
              onChange={(e) => {
                const v = parseFloat(e.target.value) || 0;
                setAnnualSalary(v);
                setLastEdited('annual');
              }}
              className="w-full h-10 text-center border border-border rounded-lg text-sm font-medium bg-card focus:outline-none focus:border-strategy-blue focus:ring-2 focus:ring-strategy-blue/20"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              {t('fin.payroll.monthlySalary')}
            </label>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/30 rounded-lg h-10 flex items-center justify-center text-sm font-bold text-foreground">
              {fmtCell(Math.round(monthlySalary))}
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">
              {t('fin.payroll.hourlySalary')}
            </label>
            <input
              type="number"
              value={computedHourly || ''}
              onChange={(e) => {
                const v = parseFloat(e.target.value) || 0;
                setHourlySalary(v);
                setLastEdited('hourly');
              }}
              className="w-full h-10 text-center border border-border rounded-lg text-sm font-medium bg-card focus:outline-none focus:border-strategy-blue focus:ring-2 focus:ring-strategy-blue/20"
            />
          </div>
        </div>

        {/* Hours per week */}
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground whitespace-nowrap">
            {t('fin.payroll.basedOn')}
          </label>
          <input
            type="number"
            value={hoursPerWeek}
            onChange={(e) => setHoursPerWeek(parseFloat(e.target.value) || 0)}
            className="w-16 h-10 text-center border border-border rounded-lg text-sm font-medium bg-card focus:outline-none focus:border-strategy-blue focus:ring-2 focus:ring-strategy-blue/20"
          />
          <span className="text-sm text-strategy-blue font-medium">
            {t('fin.payroll.hoursPerWeek')}
          </span>
        </div>
      </div>
    </div>
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
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-lg font-heading font-bold text-foreground mb-6 pr-8">
          {t('fin.forecast.dialogTitle')} &ldquo;{rowName}&rdquo;
        </h3>

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
              {recurring && <Check className="w-5 h-5 text-white" />}
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
