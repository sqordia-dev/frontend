import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Copy, Pencil, Trash2, ShoppingCart } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import FinancialSectionHeader from '../../components/financial/FinancialSectionHeader';
import YearTabBar from '../../components/financial/YearTabBar';
import MonthlyForecastGrid, { GridRow } from '../../components/financial/MonthlyForecastGrid';
import { useSalesModule, useCreateProduct, useUpdateVolumeGrid, useReplicateYear, useDeleteProduct } from '../../hooks/usePrevisio';
import AddProductDialog from '../../components/financial/dialogs/AddProductDialog';
import type { FinancialPlanDto, SalesProduct } from '../../types/financial-projections';
import { ResponsiveTable, ScrollableTable, type Column } from '../../components/ui/responsive-table';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { SkeletonTable, SkeletonStatsCard } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '../../components/ui/alert-dialog';

interface OutletContext {
  plan: FinancialPlanDto;
  businessPlanId: string;
}

const SalesSection: React.FC = () => {
  const { t } = useTheme();
  const { plan, businessPlanId } = useOutletContext<OutletContext>();
  const { data: salesData, isLoading } = useSalesModule(businessPlanId);
  const updateVolume = useUpdateVolumeGrid(businessPlanId);
  const replicateYear = useReplicateYear(businessPlanId);
  const deleteProduct = useDeleteProduct(businessPlanId);

  const [activeYear, setActiveYear] = useState(1);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<SalesProduct | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleEdit = (product: SalesProduct) => {
    setEditItem(product);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditItem(null);
    setDialogOpen(true);
  };

  const handleCellChange = (rowId: string, month: number, value: number) => {
    updateVolume.mutate({
      productId: rowId,
      year: activeYear,
      values: [{ month: month + 1, value }],
    });
  };

  // Build grid rows from sales data
  const gridRows: GridRow[] = (salesData?.products || []).map((product) => {
    const volumeGrid = salesData?.volumeGrids?.find(
      (vg) => vg.salesProductId === product.id && vg.year === activeYear
    );
    const monthlyValues = Array.from({ length: 12 }, (_, i) => {
      const mv = volumeGrid?.monthlyValues?.find((v) => v.month === i + 1);
      return mv?.value ?? 0;
    });

    return {
      id: product.id,
      label: `${product.name} (${product.unitPrice.toLocaleString('fr-CA')} $)`,
      monthlyValues,
      isEditable: true,
    };
  });

  // Revenue total row
  if (gridRows.length > 0) {
    const totalValues = Array.from({ length: 12 }, (_, i) =>
      gridRows.reduce((sum, row) => {
        const product = salesData?.products?.find(p => p.id === row.id);
        return sum + row.monthlyValues[i] * (product?.unitPrice ?? 0);
      }, 0)
    );

    gridRows.push({
      id: 'total-revenue',
      label: `${t('fin.common.total')} ($)`,
      monthlyValues: totalValues,
      isTotal: true,
      isBold: true,
    });
  }

  const totalRevenue = gridRows.find(r => r.id === 'total-revenue')?.monthlyValues.reduce((a, b) => a + b, 0) ?? 0;

  const columns: Column<SalesProduct>[] = [
    { key: 'name', header: t('fin.sales.productName'), render: (p) => <span className="font-medium">{p.name}</span> },
    { key: 'unitPrice', header: t('fin.sales.unitPrice'), align: 'right', render: (p) => `${p.unitPrice.toLocaleString('fr-CA')} $` },
    { key: 'paymentDelay', header: t('fin.sales.paymentDelay'), align: 'center', hideOnMobile: true },
    { key: 'taxRate', header: t('fin.sales.taxRate'), align: 'right', hideOnMobile: true, render: (p) => `${p.taxRate}%` },
    {
      key: 'actions', header: t('fin.common.actions'), align: 'center',
      render: (p) => (
        <div className="inline-flex gap-1">
          <button onClick={() => handleEdit(p)} className="p-1 text-muted-foreground hover:text-strategy-blue rounded"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={() => setDeleteId(p.id)} className="p-1 text-muted-foreground hover:text-red-500 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SkeletonStatsCard />
          <SkeletonStatsCard />
        </div>
        <SkeletonTable rows={4} columns={5} />
      </div>
    );
  }

  return (
    <div>
      <FinancialSectionHeader
        title={t('fin.sales.title')}
        description={t('fin.sales.description')}
        icon={<ShoppingCart className="w-5 h-5" />}
        actions={
          <Button onClick={handleAdd} size="sm">
            <Plus className="w-4 h-4" />
            {t('fin.sales.addProduct')}
          </Button>
        }
      />

      {/* KPI Stats */}
      {salesData?.products && salesData.products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <StatsCard
            title={t('fin.common.total') + ' Revenue'}
            value={`${totalRevenue.toLocaleString('fr-CA', { maximumFractionDigits: 0 })} $`}
            variant="primary"
            icon={<ShoppingCart className="w-5 h-5" />}
          />
          <StatsCard
            title={t('fin.sales.productName') + 's'}
            value={salesData.products.length}
            variant="success"
          />
        </div>
      )}

      {/* Product summary table */}
      {salesData?.products && salesData.products.length > 0 && (
        <div className="mb-6 border border-border rounded-lg overflow-hidden">
          <ResponsiveTable
            data={salesData.products}
            columns={columns}
            keyExtractor={(p) => p.id}
            mobileAsCards
            renderCard={(product) => (
              <div className="border border-border rounded-lg p-4 bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{product.name}</span>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(product)} className="p-1.5 text-muted-foreground hover:text-strategy-blue rounded"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteId(product.id)} className="p-1.5 text-muted-foreground hover:text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('fin.sales.unitPrice')}</span>
                  <span className="font-medium">{product.unitPrice.toLocaleString('fr-CA')} $</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('fin.sales.taxRate')}</span>
                  <Badge variant="secondary">{product.taxRate}%</Badge>
                </div>
              </div>
            )}
          />
        </div>
      )}

      {/* Year tabs + monthly grid */}
      {gridRows.length > 0 && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <YearTabBar
              projectionYears={plan?.projectionYears ?? 3}
              activeYear={activeYear}
              onYearChange={setActiveYear}
              showPreOpening={true}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => replicateYear.mutate({ sourceYear: activeYear, targetYear: activeYear + 1, rate: plan?.defaultVolumeGrowthRate ?? 5 })}
              disabled={activeYear >= (plan?.projectionYears ?? 3)}
            >
              <Copy className="w-3.5 h-3.5" />
              {t('fin.sales.replicateYear')} {activeYear + 1}
            </Button>
          </div>

          <ScrollableTable>
            <MonthlyForecastGrid
              rows={gridRows}
              onCellChange={handleCellChange}
              editable={true}
            />
          </ScrollableTable>
          <p className="text-xs text-muted-foreground mt-2 md:hidden">{t('fin.grid.scrollHint')}</p>
        </>
      )}

      {(!salesData?.products || salesData.products.length === 0) && (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-muted mb-3">
            <ShoppingCart className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-medium text-foreground mb-1">{t('fin.sales.noProducts')}</h3>
          <p className="text-sm text-muted-foreground mb-4">{t('fin.sales.noProductsHint')}</p>
          <Button variant="outline" onClick={handleAdd}>
            <Plus className="w-4 h-4" />
            {t('fin.sales.addProduct')}
          </Button>
        </div>
      )}

      <AddProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        businessPlanId={businessPlanId}
        defaultTaxRate={plan.defaultSalesTaxRate}
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
            <AlertDialogAction onClick={() => { if (deleteId) { deleteProduct.mutate(deleteId); setDeleteId(null); } }}>
              {t('fin.common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SalesSection;
