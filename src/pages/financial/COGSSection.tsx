import { useState, useMemo, useCallback, type FC } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { PlusCircle, MinusCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import YearTabBar from '../../components/financial/YearTabBar';
import { useCOGSModule, useSalesModule, useCreateCOGS, useUpdateCOGS, useDeleteCOGS } from '../../hooks/usePrevisio';
import AddCOGSDialog from '../../components/financial/dialogs/AddCOGSDialog';
import type { FinancialPlanDto, COGSItem } from '../../types/financial-projections';
import { SkeletonTable } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
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

function calculateMonthlyCOGS(
  cogsItems: COGSItem[] | undefined,
  volumeGrids: { salesProductId: string; year: number; monthlyValues: { month: number; value: number }[] }[] | undefined,
  year: number,
): number[] {
  const months = Array(12).fill(0) as number[];
  if (!cogsItems || !volumeGrids) return months;
  for (const item of cogsItems) {
    const vg = volumeGrids.find(v => v.salesProductId === item.linkedSalesProductId && v.year === year);
    if (vg) {
      for (let i = 0; i < 12; i++) {
        const vol = vg.monthlyValues.find(v => v.month === i + 1)?.value ?? 0;
        months[i] += vol * item.effectiveCostPerUnit;
      }
    }
  }
  return months;
}

function computeInventory(beginningForFirstMonth: number, purchases: number[], cogs: number[]) {
  const beginning: number[] = [];
  const ending: number[] = [];
  for (let i = 0; i < 12; i++) {
    const b = i === 0 ? beginningForFirstMonth : ending[i - 1];
    beginning.push(b);
    ending.push(b + purchases[i] - cogs[i]);
  }
  return { beginning, ending };
}

function fmtCell(value: number): string {
  if (value === 0) return '0';
  return Math.round(value).toLocaleString('fr-CA');
}

const EMPTY_12 = () => Array(12).fill(0) as number[];

const GRID_COLS = 'minmax(160px, auto) repeat(12, 1fr)';

const COGSSection: FC = () => {
  const { t, language } = useTheme();
  const { plan, businessPlanId } = useOutletContext<OutletContext>();
  const { data: cogsData, isLoading: cogsLoading } = useCOGSModule(businessPlanId);
  const { data: salesData, isLoading: salesLoading } = useSalesModule(businessPlanId);
  const createMutation = useCreateCOGS(businessPlanId);
  const updateMutation = useUpdateCOGS(businessPlanId);
  const deleteMutation = useDeleteCOGS(businessPlanId);
  const navigate = useNavigate();

  const [activeYear, setActiveYear] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<COGSItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [purchasesByYear, setPurchasesByYear] = useState<Record<number, number[]>>({});

  const handleEdit = (item: COGSItem) => { setEditItem(item); setDialogOpen(true); };

  const monthHeaders = useMemo(
    () => getMonthHeaders(plan.startMonth || 1, plan.startYear, activeYear, language),
    [plan.startMonth, plan.startYear, activeYear, language],
  );

  const openingBalance = useMemo(
    () => cogsData?.items?.reduce((sum, item) => sum + item.beginningInventory, 0) ?? 0,
    [cogsData?.items],
  );

  const projectionYears = plan.projectionYears ?? 3;

  const allYearsInventory = useMemo(() => {
    const result: Record<number, { beginning: number[]; ending: number[]; cogs: number[]; purchases: number[] }> = {};
    let carry = openingBalance;
    for (let yr = 0; yr <= projectionYears; yr++) {
      const cogs = calculateMonthlyCOGS(cogsData?.items, salesData?.volumeGrids, yr);
      const purch = purchasesByYear[yr] ?? EMPTY_12();
      const inv = computeInventory(carry, purch, cogs);
      result[yr] = { beginning: inv.beginning, ending: inv.ending, cogs, purchases: purch };
      carry = inv.ending[11] ?? 0;
    }
    return result;
  }, [openingBalance, cogsData?.items, salesData?.volumeGrids, purchasesByYear, projectionYears]);

  const yearData = allYearsInventory[activeYear] ?? {
    beginning: EMPTY_12(), ending: EMPTY_12(), cogs: EMPTY_12(), purchases: EMPTY_12(),
  };

  const handlePurchaseChange = useCallback((monthIndex: number, value: number) => {
    setPurchasesByYear(prev => {
      const yearPurchases = [...(prev[activeYear] ?? EMPTY_12())];
      yearPurchases[monthIndex] = value;
      return { ...prev, [activeYear]: yearPurchases };
    });
  }, [activeYear]);

  const handleSave = async () => {
    setSaving(true);
    try {
      for (const item of items) {
        await updateMutation.mutateAsync({
          itemId: item.id,
          data: {
            costMode: item.costMode,
            costValue: item.costValue,
            beginningInventory: item.beginningInventory,
            costIndexationRate: item.costIndexationRate,
          },
        });
      }
    } catch {
      // handled by hooks
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setPurchasesByYear(prev => {
      const updated = { ...prev };
      delete updated[activeYear];
      return updated;
    });
  };

  const totalCOGS = yearData.cogs.reduce((a, b) => a + b, 0);
  const totalPurchases = yearData.purchases.reduce((a, b) => a + b, 0);

  const items = cogsData?.items ?? [];
  const products = salesData?.products ?? [];
  const isLoading = cogsLoading || salesLoading;

  if (isLoading) return <SkeletonTable rows={5} columns={6} />;

  return (
    <div>
      {/* ── Title ── */}
      <h2 className="text-2xl font-heading font-bold text-strategy-blue mb-6">
        {t('fin.cogs.pageTitle')}
      </h2>

      {/* ── Product config header ── */}
      <div className="flex flex-wrap items-end gap-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        <span>{t('fin.cogs.productServicePrice')}</span>
        <span>{t('fin.cogs.rawMaterialCost')} <span className="text-red-500">*</span></span>
        <span>{t('fin.cogs.dollarOrPercent')} <span className="text-red-500">*</span></span>
        <span>{t('fin.cogs.taxPercent')} <span className="text-red-500">*</span></span>
      </div>

      {/* Product rows */}
      {items.length > 0 && (
        <div className="mb-3 space-y-1">
          {items.map((item) => {
            const linked = products.find(p => p.id === item.linkedSalesProductId);
            return (
              <div key={item.id} className="flex flex-wrap items-center gap-6 text-sm text-foreground">
                <span className="font-medium min-w-[180px]">
                  {item.linkedProductName} <span className="text-muted-foreground">({item.linkedProductPrice.toLocaleString('fr-CA')} $)</span>
                </span>
                <span className="min-w-[100px]">{item.costValue.toLocaleString('fr-CA')}</span>
                <span className="min-w-[60px]">{item.costMode === 'FixedDollars' ? '$' : '%'}</span>
                <span className="min-w-[60px]">{linked?.taxRate ?? 0}%</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Manage button */}
      <Button
        variant="outline"
        size="sm"
        className="rounded-full mb-8"
        onClick={() => navigate('../sales')}
      >
        {t('fin.cogs.manageProducts')}
      </Button>

      {/* ── Separator ── */}
      <div className="border-t border-border mb-8" />

      {/* ── Monthly Forecasts ── */}
      <h3 className="text-lg font-heading font-bold text-foreground mb-4">
        {t('fin.cogs.monthlyForecasts')}
      </h3>

      <YearTabBar
        projectionYears={projectionYears}
        activeYear={activeYear}
        onYearChange={setActiveYear}
        showPreOpening
        className="mb-8"
      />

      {/* ── COGS Grid (CSS Grid — no scrollbar) ── */}
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

        {/* Beginning Inventory */}
        <div className="px-2 py-2 text-sm text-muted-foreground self-center whitespace-nowrap">
          {t('fin.cogs.beginningInventory')}
        </div>
        {yearData.beginning.map((val, i) => (
          <div key={i} className="px-1 py-1">
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 rounded-lg h-10 flex items-center justify-center text-sm font-medium text-foreground">
              {fmtCell(val)}
            </div>
          </div>
        ))}

        {/* Inventory Purchases (editable) */}
        <EditableRow
          icon={<PlusCircle className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />}
          label={t('fin.cogs.inventoryPurchases')}
          values={yearData.purchases}
          onChange={handlePurchaseChange}
        />

        {/* COGS (calculated) */}
        <div className="px-2 py-2 text-sm text-muted-foreground self-center whitespace-nowrap">
          <span className="flex items-center gap-1.5">
            <MinusCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {t('fin.cogs.cogsRow')}
          </span>
        </div>
        {yearData.cogs.map((val, i) => (
          <div key={i} className="px-1 py-1">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/30 rounded-lg h-10 flex items-center justify-center text-sm text-foreground">
              {fmtCell(val)}
            </div>
          </div>
        ))}

        {/* Ending Inventory */}
        <div className="px-2 py-2 text-sm font-semibold text-foreground self-center whitespace-nowrap">
          {t('fin.cogs.endingInventory')}
        </div>
        {yearData.ending.map((val, i) => (
          <div key={i} className="px-1 py-1">
            <div className="bg-gradient-to-r from-red-400 to-red-500 dark:from-red-600 dark:to-red-700 rounded-lg h-10 flex items-center justify-center text-sm font-bold text-white">
              {fmtCell(val)}
            </div>
          </div>
        ))}
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

      {/* ── Dialogs ── */}
      <AddCOGSDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        businessPlanId={businessPlanId}
        products={products}
        editItem={editItem}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('fin.common.confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription>{t('fin.common.confirmDeleteDesc')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('fin.common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (deleteId) { deleteMutation.mutate(deleteId); setDeleteId(null); } }}>
              {t('fin.common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default COGSSection;

// ── Editable Row (CSS grid cells) ──

function EditableRow({
  icon,
  label,
  values,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  values: number[];
  onChange: (monthIndex: number, value: number) => void;
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const startEdit = (index: number, currentValue: number) => {
    setEditingIndex(index);
    setEditValue(currentValue === 0 ? '' : String(currentValue));
  };

  const commitAndMove = (nextIndex: number | null) => {
    if (editingIndex !== null) {
      onChange(editingIndex, parseFloat(editValue) || 0);
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
    if (e.key === 'Enter') {
      e.preventDefault();
      commitAndMove(editingIndex !== null ? editingIndex + 1 : null);
    }
    if (e.key === 'Tab') {
      e.preventDefault();
      commitAndMove(editingIndex !== null ? editingIndex + (e.shiftKey ? -1 : 1) : null);
    }
    if (e.key === 'Escape') {
      setEditingIndex(null);
      setEditValue('');
    }
  };

  return (
    <>
      <div className="px-2 py-2 text-sm text-muted-foreground self-center whitespace-nowrap">
        <span className="flex items-center gap-1.5">
          {icon}
          {label}
        </span>
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
              onClick={() => startEdit(i, val)}
            >
              {fmtCell(val)}
            </div>
          )}
        </div>
      ))}
    </>
  );
}
