import { useState, useMemo, useCallback, type FC } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { queryKeys } from '../../lib/query-client';
import YearTabBar from '../../components/financial/YearTabBar';
import { useFinancingModule, useCreateFinancing, useUpdateFinancing, useDeleteFinancing } from '../../hooks/usePrevisio';
import type { FinancialPlanDto, FinancingType } from '../../types/financial-projections';
import { SkeletonTable } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
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

const FINANCING_TYPES: { value: FinancingType; labelKey: string }[] = [
  { value: 'BankLoan', labelKey: 'fin.financing.typeBankLoan' },
  { value: 'LineOfCredit', labelKey: 'fin.financing.typeLineOfCredit' },
  { value: 'PersonalInvestment', labelKey: 'fin.financing.typePersonalInvestment' },
  { value: 'PartnerInvestment', labelKey: 'fin.financing.typePartnerInvestment' },
  { value: 'GovernmentSubsidy', labelKey: 'fin.financing.typeGovernmentSubsidy' },
  { value: 'Grant', labelKey: 'fin.financing.typeGrant' },
  { value: 'Other', labelKey: 'fin.financing.typeOther' },
];

const MONTH_OPTIONS_FR = ['Choisir un mois', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
const MONTH_OPTIONS_EN = ['Choose a month', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const STATE_OPTIONS_FR = ['Choisir', 'Obtenu', 'En demande', 'À demander'];
const STATE_OPTIONS_EN = ['Choose', 'Obtained', 'Pending', 'To request'];

type SubTab = 'payment' | 'principal' | 'interest' | 'balance';

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

interface FinancingRow {
  id: string;
  isNew: boolean;
  financingType: FinancingType;
  name: string;
  amount: number;
  disbursementMonth: number;
  interestRate: number;
  termMonths: number;
  moratoireMonths: number;
  state: string;
}

const GRID_COLS = 'minmax(100px, auto) repeat(12, 1fr) minmax(60px, auto)';

const FinancingSection: FC = () => {
  const { t, language } = useTheme();
  const { plan, businessPlanId } = useOutletContext<OutletContext>();
  const queryClient = useQueryClient();
  const { data, isLoading } = useFinancingModule(businessPlanId);
  const createFinancing = useCreateFinancing(businessPlanId);
  const updateFinancing = useUpdateFinancing(businessPlanId);
  const deleteFinancing = useDeleteFinancing(businessPlanId);

  const [activeYear, setActiveYear] = useState(1);
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('payment');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const monthOptions = language === 'fr' ? MONTH_OPTIONS_FR : MONTH_OPTIONS_EN;
  const stateOptions = language === 'fr' ? STATE_OPTIONS_FR : STATE_OPTIONS_EN;

  // Inline rows
  const [rows, setRows] = useState<FinancingRow[]>([]);
  const [rowsInitialized, setRowsInitialized] = useState(false);

  if (data?.sources && !rowsInitialized) {
    setRows(
      data.sources.map((s) => ({
        id: s.id,
        isNew: false,
        financingType: s.financingType,
        name: s.name,
        amount: s.amount,
        disbursementMonth: s.disbursementMonth,
        interestRate: s.interestRate,
        termMonths: s.termMonths,
        moratoireMonths: s.moratoireMonths,
        state: 'Obtenu',
      }))
    );
    setRowsInitialized(true);
  }

  const monthHeaders = useMemo(
    () => getMonthHeaders(plan.startMonth || 1, plan.startYear, activeYear, language),
    [plan.startMonth, plan.startYear, activeYear, language],
  );

  const projectionYears = plan.projectionYears ?? 3;

  const [paymentGrid, setPaymentGrid] = useState<Record<string, Record<number, number[]>>>({});

  const handleAddLine = () => {
    setRows((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`, isNew: true, financingType: 'BankLoan',
        name: '', amount: 0, disbursementMonth: 0, interestRate: 0,
        termMonths: 0, moratoireMonths: 0, state: '',
      },
    ]);
  };

  const handleRowChange = (id: string, field: keyof FinancingRow, value: string | number) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
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
      setPaymentGrid((prev) => {
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
          financingType: row.financingType,
          amount: row.amount,
          interestRate: row.interestRate,
          termMonths: row.termMonths,
          moratoireMonths: row.moratoireMonths,
          disbursementMonth: row.disbursementMonth || (plan.startMonth || 1),
          disbursementYear: plan.startYear,
        };
        if (row.isNew && row.name.trim()) {
          await createFinancing.mutateAsync(payload);
        } else if (!row.isNew) {
          await updateFinancing.mutateAsync({ sourceId: row.id, data: payload });
        }
      }
      await queryClient.refetchQueries({ queryKey: queryKeys.previsio.financing(businessPlanId) });
      setRowsInitialized(false);
    } catch {
      // handled by hooks
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setRowsInitialized(false);
    setPaymentGrid({});
  };

  // Totals - use backend data when available, fallback to local state
  const totalFinancing = data?.totalFinancing ?? rows.reduce((sum, r) => sum + r.amount, 0);
  const totalProjectCost = data?.totalProjectCost ?? 0;
  const difference = totalFinancing - totalProjectCost;

  // Build grid rows for monthly forecasts
  const gridRows = rows.map((r) => ({
    id: r.id,
    name: r.name || t('fin.financing.namePlaceholder'),
    monthly: paymentGrid[r.id]?.[activeYear] ?? Array(12).fill(r.isNew ? 0 : (r.amount > 0 ? Math.round(r.amount / Math.max(r.termMonths, 1)) : 0)) as number[],
  }));

  const monthlyTotals = Array.from({ length: 12 }, (_, i) =>
    gridRows.reduce((sum, r) => sum + (r.monthly[i] ?? 0), 0),
  );
  const grandTotal = monthlyTotals.reduce((a, b) => a + b, 0);

  const subTabs: { key: SubTab; label: string }[] = [
    { key: 'payment', label: t('fin.financing.subTabPayment') },
    { key: 'principal', label: t('fin.financing.subTabPrincipal') },
    { key: 'interest', label: t('fin.financing.subTabInterest') },
    { key: 'balance', label: t('fin.financing.subTabBalance') },
  ];

  if (isLoading) return <SkeletonTable rows={6} columns={8} />;

  return (
    <div>
      {/* Title */}
      <h2 className="text-2xl font-heading font-bold text-strategy-blue mb-6">
        {t('fin.financing.title')}
      </h2>

      {/* Inline form header */}
      <div className="flex flex-wrap items-end gap-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        <span className="min-w-[140px]">{t('fin.financing.type')} <span className="text-red-500">*</span></span>
        <span className="min-w-[140px]">{t('fin.financing.sourceName')} <span className="text-red-500">*</span></span>
        <span className="w-[90px]">{t('fin.financing.amount')} <span className="text-red-500">*</span></span>
        <span className="min-w-[130px]">{t('fin.financing.disbursementMonth')} <span className="text-red-500">*</span></span>
        <span className="w-[80px]">{t('fin.financing.rate')}</span>
        <span className="w-[70px]">{t('fin.financing.termLabel')}</span>
        <span className="min-w-[100px]">{t('fin.financing.moratorium')}</span>
        <span className="min-w-[100px]">{t('fin.financing.state')} <span className="text-red-500">*</span></span>
      </div>

      {/* Financing rows */}
      <div className="space-y-2 mb-4">
        {rows.map((row) => (
          <div key={row.id} className="flex flex-wrap items-center gap-3">
            <select
              className="min-w-[140px] max-w-[160px] h-10 px-2 border border-border rounded-lg text-sm bg-card focus:outline-none focus:border-strategy-blue focus:ring-2 focus:ring-strategy-blue/20"
              value={row.financingType}
              onChange={(e) => handleRowChange(row.id, 'financingType', e.target.value)}
            >
              <option value="">{language === 'fr' ? 'Choisir' : 'Choose'}</option>
              {FINANCING_TYPES.map((ft) => (
                <option key={ft.value} value={ft.value}>{t(ft.labelKey)}</option>
              ))}
            </select>
            <Input
              className="min-w-[140px] max-w-[160px] bg-card"
              placeholder={t('fin.financing.namePlaceholder')}
              value={row.name}
              onChange={(e) => handleRowChange(row.id, 'name', e.target.value)}
            />
            <Input
              className="w-[90px] bg-card text-center font-medium"
              type="number"
              value={row.amount || ''}
              onChange={(e) => handleRowChange(row.id, 'amount', parseFloat(e.target.value) || 0)}
            />
            <select
              className="min-w-[130px] h-10 px-2 border border-border rounded-lg text-sm bg-card focus:outline-none focus:border-strategy-blue focus:ring-2 focus:ring-strategy-blue/20"
              value={row.disbursementMonth}
              onChange={(e) => handleRowChange(row.id, 'disbursementMonth', parseInt(e.target.value, 10))}
            >
              {monthOptions.map((label, i) => (
                <option key={i} value={i}>{label}</option>
              ))}
            </select>
            <Input
              className="w-[80px] bg-card text-center font-medium"
              type="number" step="0.01"
              value={row.interestRate || ''}
              onChange={(e) => handleRowChange(row.id, 'interestRate', parseFloat(e.target.value) || 0)}
            />
            <Input
              className="w-[70px] bg-card text-center font-medium"
              type="number"
              value={row.termMonths || ''}
              onChange={(e) => handleRowChange(row.id, 'termMonths', parseInt(e.target.value, 10) || 0)}
            />
            <select
              className="min-w-[100px] h-10 px-2 border border-border rounded-lg text-sm bg-card focus:outline-none focus:border-strategy-blue focus:ring-2 focus:ring-strategy-blue/20"
              value={row.moratoireMonths}
              onChange={(e) => handleRowChange(row.id, 'moratoireMonths', parseInt(e.target.value, 10))}
            >
              <option value={0}>{language === 'fr' ? 'Durée' : 'Duration'}</option>
              {[3, 6, 9, 12].map((m) => (
                <option key={m} value={m}>{m} {language === 'fr' ? 'mois' : 'months'}</option>
              ))}
            </select>
            <select
              className="min-w-[100px] h-10 px-2 border border-border rounded-lg text-sm bg-card focus:outline-none focus:border-strategy-blue focus:ring-2 focus:ring-strategy-blue/20"
              value={row.state}
              onChange={(e) => handleRowChange(row.id, 'state', e.target.value)}
            >
              {stateOptions.map((label, i) => (
                <option key={i} value={label}>{label}</option>
              ))}
            </select>
            <button
              onClick={() => handleRemoveRow(row.id)}
              className="p-1.5 text-muted-foreground hover:text-red-500 rounded"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Add line */}
      <Button variant="outline" size="sm" className="rounded-full mb-6" onClick={handleAddLine}>
        {t('fin.financing.addLine')}
      </Button>

      {/* Summary */}
      <div className="space-y-2 mb-8">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-foreground w-[200px]">{t('fin.financing.totalFinancing')}</span>
          <div className="border border-border rounded-lg h-10 px-4 flex items-center justify-end text-sm font-medium bg-card min-w-[120px]">
            {fmtCell(totalFinancing)} $
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-foreground w-[200px]">{t('fin.financing.projectCost')}</span>
          <div className="border border-border rounded-lg h-10 px-4 flex items-center justify-end text-sm font-medium bg-card min-w-[120px]">
            {fmtCell(totalProjectCost)} $
          </div>
        </div>
        <div className="border-t border-strategy-blue pt-2">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-foreground w-[200px]" />
            <div className="border border-border rounded-lg h-10 px-4 flex items-center justify-end text-sm font-bold bg-card min-w-[120px]">
              {fmtCell(difference)} $
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Forecasts card */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-lg font-heading font-bold text-foreground mb-4">
          {t('fin.financing.monthlyForecasts')}
        </h3>

        <YearTabBar
          projectionYears={projectionYears}
          activeYear={activeYear}
          onYearChange={setActiveYear}
          showPreOpening
          className="mb-4"
        />

        {/* Sub-tabs */}
        <div className="flex gap-6 border-b border-border mb-6">
          {subTabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveSubTab(tab.key)}
              className={`pb-2 text-sm font-medium transition-colors ${
                activeSubTab === tab.key
                  ? 'text-foreground border-b-2 border-strategy-blue'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid gap-y-1" style={{ gridTemplateColumns: GRID_COLS }}>
          <div />
          {monthHeaders.map((label, i) => (
            <div key={i} className="px-1 py-2 text-center font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
              {label}
            </div>
          ))}
          <div className="px-1 py-2 text-center font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
            TOTAL
          </div>

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

      {/* Save / Cancel */}
      <div className="flex items-center gap-4 mt-10 pt-8 border-t border-border">
        <Button onClick={handleSave} disabled={saving} className="rounded-full px-8">
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

      {/* Delete confirmation */}
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
                  deleteFinancing.mutate(deleteId);
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

export default FinancingSection;

// -- Editable grid row --

function EditableGridRow({
  rowId, label, values, total, onCellChange,
}: {
  rowId: string; label: string; values: number[]; total: number;
  onCellChange: (rowId: string, monthIndex: number, value: number) => void;
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(values[index] === 0 ? '' : String(values[index]));
  };

  const commitAndMove = (nextIndex: number | null) => {
    if (editingIndex !== null) onCellChange(rowId, editingIndex, parseFloat(editValue) || 0);
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
      <div className="px-2 py-2 text-sm text-foreground font-medium self-center truncate">{label}</div>
      {values.map((val, i) => (
        <div key={i} className="px-1 py-1">
          {editingIndex === i ? (
            <input
              type="number" value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => commitAndMove(null)} onKeyDown={handleKeyDown} autoFocus
              className="w-full h-10 text-center border-2 border-strategy-blue rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-strategy-blue/20"
            />
          ) : (
            <div
              className="border border-border rounded-lg h-10 flex items-center justify-center text-sm font-medium text-foreground cursor-pointer bg-card hover:border-strategy-blue/40 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors"
              onClick={() => startEdit(i)}
            >{fmtCell(val)}</div>
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
