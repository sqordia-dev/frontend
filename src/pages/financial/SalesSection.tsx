import { useState, useMemo, useCallback, type FC } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2, Copy } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { queryKeys } from '../../lib/query-client';
import YearTabBar from '../../components/financial/YearTabBar';
import {
  useSalesModule, useCreateProduct, useUpdateProduct,
  useUpdateVolumeGrid, useDeleteProduct, useReplicateYear,
} from '../../hooks/usePrevisio';
import type { FinancialPlanDto, PaymentDelay } from '../../types/financial-projections';
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

const PAYMENT_DELAYS: { value: PaymentDelay; labelKey: string }[] = [
  { value: 'Immediate', labelKey: 'fin.enum.immediate' },
  { value: 'OneMonth', labelKey: 'fin.enum.oneMonth' },
  { value: 'TwoMonths', labelKey: 'fin.enum.twoMonths' },
  { value: 'ThreeMonths', labelKey: 'fin.enum.threeMonths' },
  { value: 'SixMonths', labelKey: 'fin.enum.sixMonths' },
  { value: 'TwelveMonths', labelKey: 'fin.enum.twelveMonths' },
];

interface ProductRow {
  id: string;
  isNew: boolean;
  name: string;
  unitPrice: number;
  paymentDelay: PaymentDelay;
  taxRate: number;
}

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

const SalesSection: FC = () => {
  const { t, language } = useTheme();
  const toast = useToast();
  const { plan, businessPlanId } = useOutletContext<OutletContext>();
  const queryClient = useQueryClient();
  const { data: salesData, isLoading } = useSalesModule(businessPlanId);
  const createProduct = useCreateProduct(businessPlanId);
  const updateProduct = useUpdateProduct(businessPlanId);
  const updateVolume = useUpdateVolumeGrid(businessPlanId);
  const deleteProduct = useDeleteProduct(businessPlanId);
  const replicateYear = useReplicateYear(businessPlanId);

  const [activeYear, setActiveYear] = useState(1);
  const [viewMode, setViewMode] = useState<'Dollars' | 'Quantity'>('Dollars');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Inline product rows (local editing state)
  const [productRows, setProductRows] = useState<ProductRow[]>([]);
  const [rowsInitialized, setRowsInitialized] = useState(false);

  // Initialize from API data
  if (salesData?.products && !rowsInitialized) {
    setProductRows(
      salesData.products.map((p) => ({
        id: p.id,
        isNew: false,
        name: p.name,
        unitPrice: p.unitPrice,
        paymentDelay: p.paymentDelay,
        taxRate: p.taxRate,
      }))
    );
    setRowsInitialized(true);
  }

  const monthHeaders = useMemo(
    () => getMonthHeaders(plan.startMonth || 1, plan.startYear, activeYear, language),
    [plan.startMonth, plan.startYear, activeYear, language],
  );

  const projectionYears = plan.projectionYears ?? 3;
  const isPreOpening = activeYear === 0;

  const handleAddLine = () => {
    setProductRows((prev) => [
      ...prev,
      {
        id: `new-${Date.now()}`,
        isNew: true,
        name: '',
        unitPrice: 0,
        paymentDelay: 'Immediate',
        taxRate: plan.defaultSalesTaxRate ?? 14.975,
      },
    ]);
  };

  const handleRowChange = (id: string, field: keyof ProductRow, value: string | number) => {
    setProductRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleRemoveRow = (id: string) => {
    const row = productRows.find((r) => r.id === id);
    if (row?.isNew) {
      setProductRows((prev) => prev.filter((r) => r.id !== id));
    } else {
      setDeleteId(id);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const row of productRows) {
        const payload = {
          name: row.name,
          unitPrice: row.unitPrice,
          paymentDelay: row.paymentDelay,
          taxRate: row.taxRate,
          inputMode: 'Quantity' as const,
        };
        if (row.isNew && row.name.trim()) {
          await createProduct.mutateAsync(payload);
        } else if (!row.isNew) {
          await updateProduct.mutateAsync({ productId: row.id, data: payload });
        }
      }
      // Wait for fresh data before re-syncing local state
      await queryClient.refetchQueries({ queryKey: queryKeys.previsio.sales(businessPlanId) });
      setRowsInitialized(false);
      toast.success(language === 'fr' ? 'Enregistré' : 'Saved', language === 'fr' ? 'Données sauvegardées avec succès.' : 'Data saved successfully.');
    } catch (err) {
      console.error('[SalesSection] handleSave failed:', err);
      toast.error(t('fin.common.save'), String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setRowsInitialized(false);
  };

  // Grid cell editing
  const handleCellChange = useCallback(
    (productId: string, monthIndex: number, value: number) => {
      updateVolume.mutate({
        productId,
        year: activeYear,
        values: [{ month: monthIndex + 1, value }],
      });
    },
    [updateVolume, activeYear],
  );

  // Build grid data — include both saved products AND unsaved new rows
  const products = salesData?.products ?? [];
  const volumeGrids = salesData?.volumeGrids ?? [];
  const savedProductIds = new Set(products.map((p) => p.id));

  const gridProducts = [
    ...products.map((product) => {
      const vg = volumeGrids.find(
        (v) => v.salesProductId === product.id && v.year === activeYear,
      );
      const monthlyQuantities = Array.from({ length: 12 }, (_, i) => {
        return vg?.monthlyValues.find((v) => v.month === i + 1)?.value ?? 0;
      });
      const monthlyDollars = monthlyQuantities.map((q) => q * product.unitPrice);
      return { id: product.id, name: product.name, unitPrice: product.unitPrice, monthlyQuantities, monthlyDollars };
    }),
    // New unsaved rows appear in the grid immediately with all zeros
    ...productRows
      .filter((r) => r.isNew)
      .map((r) => ({
        id: r.id,
        name: r.name || t('fin.sales.productNamePlaceholder'),
        unitPrice: r.unitPrice,
        monthlyQuantities: Array(12).fill(0) as number[],
        monthlyDollars: Array(12).fill(0) as number[],
      })),
  ];

  // Total row
  const monthlyTotals = Array.from({ length: 12 }, (_, i) =>
    gridProducts.reduce(
      (sum, gp) =>
        sum + (viewMode === 'Dollars' ? gp.monthlyDollars[i] : gp.monthlyQuantities[i]),
      0,
    ),
  );
  const grandTotal = monthlyTotals.reduce((a, b) => a + b, 0);

  if (isLoading) return <SkeletonTable rows={5} columns={6} />;

  return (
    <div>
      {/* ── Title ── */}
      <h2 className="text-2xl font-heading font-bold text-strategy-blue mb-6">
        {t('fin.sales.title')}
      </h2>

      {/* ── Inline product form ── */}
      <div className="flex flex-wrap items-end gap-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        <span className="min-w-[180px]">
          {t('fin.sales.productName')} <span className="text-red-500">*</span>
        </span>
        <span className="min-w-[80px]">
          {t('fin.sales.unitPrice')} <span className="text-red-500">*</span>
        </span>
        <span className="min-w-[200px]">
          {t('fin.sales.paymentDelayClients')} <span className="text-red-500">*</span>
        </span>
        <span className="min-w-[80px]">
          {t('fin.sales.taxRate')} <span className="text-red-500">*</span>
        </span>
      </div>

      {/* Product rows */}
      <div className="space-y-2 mb-4">
        {productRows.map((row) => (
          <div key={row.id} className="flex flex-wrap items-center gap-3">
            <Input
              className="min-w-[180px] max-w-[200px] bg-card"
              placeholder={t('fin.sales.productNamePlaceholder')}
              value={row.name}
              onChange={(e) => handleRowChange(row.id, 'name', e.target.value)}
            />
            <Input
              className="w-20 bg-card text-right"
              type="number"
              step="0.01"
              value={row.unitPrice || ''}
              onChange={(e) =>
                handleRowChange(row.id, 'unitPrice', parseFloat(e.target.value) || 0)
              }
            />
            <Select
              value={row.paymentDelay}
              onValueChange={(val) => handleRowChange(row.id, 'paymentDelay', val)}
            >
              <SelectTrigger className="min-w-[200px] max-w-[220px] bg-card">
                <SelectValue placeholder={t('fin.sales.chooseDelay')} />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_DELAYS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {t(d.labelKey)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              className="w-20 bg-card text-right"
              type="number"
              step="0.01"
              value={row.taxRate || ''}
              onChange={(e) =>
                handleRowChange(row.id, 'taxRate', parseFloat(e.target.value) || 0)
              }
            />
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
        {t('fin.sales.addLine')}
      </Button>

      {/* ── Separator ── */}
      <div className="border-t border-border mb-8" />

      {/* ── Monthly Forecasts ── */}
      <h3 className="text-lg font-heading font-bold text-foreground mb-4">
        {t('fin.sales.monthlyForecasts')}
      </h3>

      <div className="flex items-center gap-4 mb-5">
        <YearTabBar
          projectionYears={projectionYears}
          activeYear={activeYear}
          onYearChange={setActiveYear}
          showPreOpening
        />

        {activeYear >= 2 && (
          <button
            onClick={() =>
              replicateYear.mutate({
                sourceYear: activeYear - 1,
                targetYear: activeYear,
                rate: 0,
              })
            }
            disabled={replicateYear.isPending}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8e] rounded-full hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
          >
            <Copy className="w-4 h-4" />
            {t('fin.sales.replicateYear')} {activeYear - 1}
          </button>
        )}
      </div>

      {/* ── Pre-opening grid (2 columns) or Monthly grid (12 columns) ── */}
      {isPreOpening ? (
        <PreOpeningGrid
          gridProducts={gridProducts}
          startMonth={plan.startMonth || 1}
          startYear={plan.startYear}
          language={language}
          onCellChange={handleCellChange}
          t={t}
        />
      ) : (
        <>
          {/* Dollars / Quantité toggle */}
          <div className="flex items-center border-b border-border mb-8">
            <button
              onClick={() => setViewMode('Dollars')}
              className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                viewMode === 'Dollars'
                  ? 'border-strategy-blue text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('fin.sales.dollars')}
            </button>
            <button
              onClick={() => setViewMode('Quantity')}
              className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                viewMode === 'Quantity'
                  ? 'border-strategy-blue text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('fin.sales.quantity')}
            </button>
          </div>

          {/* ── Monthly Grid ── */}
          <div className="grid gap-y-2" style={{ gridTemplateColumns: 'minmax(80px, auto) repeat(12, 1fr) minmax(60px, auto)' }}>
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

            {/* Product rows */}
            {gridProducts.map((gp) => {
              const values =
                viewMode === 'Dollars' ? gp.monthlyDollars : gp.monthlyQuantities;
              const rowTotal = values.reduce((a, b) => a + b, 0);

              return (
                <EditableGridRow
                  key={gp.id}
                  productId={gp.id}
                  label={gp.name}
                  values={values}
                  quantities={gp.monthlyQuantities}
                  viewMode={viewMode}
                  total={rowTotal}
                  onCellChange={handleCellChange}
                />
              );
            })}

            {/* Total row */}
            {gridProducts.length > 0 && (
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
        </>
      )}

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

      {/* ── Delete confirmation ── */}
      <AlertDialog
        open={!!deleteId}
        onOpenChange={(open) => !open && setDeleteId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('fin.common.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('fin.common.confirmDeleteDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('fin.common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) {
                  deleteProduct.mutate(deleteId);
                  setProductRows((prev) => prev.filter((r) => r.id !== deleteId));
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

export default SalesSection;

// ── Grid row sub-component (CSS grid cells) ──

function EditableGridRow({
  productId,
  label,
  values,
  quantities,
  viewMode,
  total,
  onCellChange,
}: {
  productId: string;
  label: string;
  values: number[];
  quantities: number[];
  viewMode: 'Dollars' | 'Quantity';
  total: number;
  onCellChange: (productId: string, monthIndex: number, value: number) => void;
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEdit = (index: number) => {
    setEditingIndex(index);
    const currentVal = viewMode === 'Quantity' ? quantities[index] : values[index];
    setEditValue(currentVal === 0 ? '' : String(currentVal));
  };

  const commitAndMove = (nextIndex: number | null) => {
    if (editingIndex !== null) {
      const raw = parseFloat(editValue) || 0;
      if (viewMode === 'Quantity') {
        onCellChange(productId, editingIndex, raw);
      } else {
        onCellChange(productId, editingIndex, raw);
      }
    }
    if (nextIndex !== null && nextIndex >= 0 && nextIndex < 12) {
      setEditingIndex(nextIndex);
      const nextVal = viewMode === 'Quantity' ? quantities[nextIndex] : values[nextIndex];
      setEditValue(nextVal === 0 ? '' : String(nextVal));
    } else {
      setEditingIndex(null);
      setEditValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitAndMove(editingIndex !== null ? editingIndex + 1 : null);
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      commitAndMove(
        editingIndex !== null ? editingIndex + (e.shiftKey ? -1 : 1) : null,
      );
    }
    if (e.key === 'Escape') {
      setEditingIndex(null);
      setEditValue('');
    }
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

// ── Pre-opening grid (2 columns: Already Sold + To Sell Before) ──

function PreOpeningGrid({
  gridProducts,
  startMonth,
  startYear,
  language,
  onCellChange,
  t,
}: {
  gridProducts: { id: string; name: string; monthlyQuantities: number[] }[];
  startMonth: number;
  startYear: number;
  language: string;
  onCellChange: (productId: string, monthIndex: number, value: number) => void;
  t: (key: string) => string;
}) {
  const MONTH_NAMES_FR = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const MONTH_NAMES_EN = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];
  const sm = Math.max(1, Math.min(12, startMonth));
  const names = language === 'fr' ? MONTH_NAMES_FR : MONTH_NAMES_EN;
  const startLabel = `${names[sm - 1]} ${String(startYear).slice(-2)}`.toUpperCase();

  return (
    <div className="max-w-lg">
      {/* Header */}
      <div className="grid grid-cols-[minmax(80px,auto)_1fr_1fr] gap-x-4 mb-1">
        <div />
        <div className="px-2 py-3 text-center font-bold text-[11px] uppercase tracking-wider text-muted-foreground">
          {t('fin.sales.alreadySold')}
        </div>
        <div className="px-2 py-3 text-center font-bold text-[11px] uppercase tracking-wider text-muted-foreground leading-tight">
          {t('fin.sales.toSellBefore')}
          <br />
          {startLabel}
        </div>
      </div>

      {/* Rows */}
      {gridProducts.map((gp) => (
        <PreOpeningRow
          key={gp.id}
          productId={gp.id}
          label={gp.name}
          alreadySold={gp.monthlyQuantities[0] ?? 0}
          toSell={gp.monthlyQuantities[1] ?? 0}
          onCellChange={onCellChange}
        />
      ))}
    </div>
  );
}

function PreOpeningRow({
  productId,
  label,
  alreadySold,
  toSell,
  onCellChange,
}: {
  productId: string;
  label: string;
  alreadySold: number;
  toSell: number;
  onCellChange: (productId: string, monthIndex: number, value: number) => void;
}) {
  const [editingCol, setEditingCol] = useState<0 | 1 | null>(null);
  const [editValue, setEditValue] = useState('');

  const values = [alreadySold, toSell];

  const startEdit = (col: 0 | 1) => {
    setEditingCol(col);
    setEditValue(values[col] === 0 ? '' : String(values[col]));
  };

  const commit = (nextCol: 0 | 1 | null) => {
    if (editingCol !== null) {
      onCellChange(productId, editingCol, parseFloat(editValue) || 0);
    }
    if (nextCol !== null) {
      setEditingCol(nextCol);
      setEditValue(values[nextCol] === 0 ? '' : String(values[nextCol]));
    } else {
      setEditingCol(null);
      setEditValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      const next = editingCol === 0 ? 1 : null;
      commit(next as 0 | 1 | null);
    }
    if (e.key === 'Escape') {
      setEditingCol(null);
      setEditValue('');
    }
  };

  return (
    <div className="grid grid-cols-[minmax(80px,auto)_1fr_1fr] gap-x-4 mb-2">
      <div className="px-2 py-2 text-sm text-foreground font-medium self-center truncate">
        {label}
      </div>
      {([0, 1] as const).map((col) => (
        <div key={col} className="px-1 py-1">
          {editingCol === col ? (
            <input
              type="number"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => commit(null)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full h-10 text-center border-2 border-strategy-blue rounded-lg text-sm bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-strategy-blue/20"
            />
          ) : (
            <div
              className="border border-border rounded-lg h-10 flex items-center justify-center text-sm font-medium text-foreground cursor-pointer bg-card hover:border-strategy-blue/40 hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors"
              onClick={() => startEdit(col)}
            >
              {fmtCell(values[col])}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
