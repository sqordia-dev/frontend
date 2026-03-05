import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Package, Pencil, Trash2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import FinancialSectionHeader from '../../components/financial/FinancialSectionHeader';
import { useCOGSModule, useSalesModule, useDeleteCOGS } from '../../hooks/usePrevisio';
import AddCOGSDialog from '../../components/financial/dialogs/AddCOGSDialog';
import type { FinancialPlanDto, COGSItem } from '../../types/financial-projections';
import { ResponsiveTable, type Column } from '../../components/ui/responsive-table';
import { SkeletonTable } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '../../components/ui/alert-dialog';

const COGSSection: React.FC = () => {
  const { t } = useTheme();
  const { businessPlanId } = useOutletContext<{ plan: FinancialPlanDto; businessPlanId: string }>();
  const { data, isLoading } = useCOGSModule(businessPlanId);
  const { data: salesData } = useSalesModule(businessPlanId);
  const deleteMutation = useDeleteCOGS(businessPlanId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<COGSItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = () => { setEditItem(null); setDialogOpen(true); };
  const handleEdit = (item: COGSItem) => { setEditItem(item); setDialogOpen(true); };

  const columns: Column<COGSItem>[] = [
    { key: 'linkedProductName', header: t('fin.cogs.linkedProduct'), render: (item) => <span className="font-medium">{item.linkedProductName}</span> },
    { key: 'costMode', header: t('fin.cogs.costMode'), align: 'right', hideOnMobile: true },
    { key: 'costValue', header: t('fin.cogs.costValue'), align: 'right', render: (item) => `${item.costValue}${item.costMode === 'PercentageOfPrice' ? '%' : ' $'}` },
    { key: 'effectiveCostPerUnit', header: t('fin.cogs.effectiveCost'), align: 'right', render: (item) => <span className="font-medium">{item.effectiveCostPerUnit.toLocaleString('fr-CA')} $</span> },
    {
      key: 'actions', header: t('fin.common.actions'), align: 'center',
      render: (item) => (
        <div className="inline-flex gap-1">
          <button onClick={() => handleEdit(item)} className="p-1 text-muted-foreground hover:text-strategy-blue rounded"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={() => setDeleteId(item.id)} className="p-1 text-muted-foreground hover:text-red-500 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ),
    },
  ];

  if (isLoading) return <SkeletonTable rows={4} columns={5} />;

  return (
    <div>
      <FinancialSectionHeader
        title={t('fin.cogs.title')}
        description={t('fin.cogs.description')}
        icon={<Package className="w-5 h-5" />}
        actions={
          <Button onClick={handleAdd} size="sm">
            <Plus className="w-4 h-4" /> {t('fin.cogs.addItem')}
          </Button>
        }
      />

      {data?.items && data.items.length > 0 ? (
        <div className="border border-border rounded-lg overflow-hidden">
          <ResponsiveTable
            data={data.items}
            columns={columns}
            keyExtractor={(item) => item.id}
            mobileAsCards
            renderCard={(item) => (
              <div className="border border-border rounded-lg p-4 bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{item.linkedProductName}</span>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(item)} className="p-1.5 text-muted-foreground hover:text-strategy-blue rounded"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteId(item.id)} className="p-1.5 text-muted-foreground hover:text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('fin.cogs.costMode')}</span>
                  <Badge variant="secondary">{item.costMode}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('fin.cogs.costValue')}</span>
                  <span>{item.costValue}{item.costMode === 'PercentageOfPrice' ? '%' : ' $'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('fin.cogs.effectiveCost')}</span>
                  <span className="font-medium">{item.effectiveCostPerUnit.toLocaleString('fr-CA')} $</span>
                </div>
              </div>
            )}
          />
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-muted mb-3">
            <Package className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-medium text-foreground mb-1">{t('fin.cogs.noItems')}</h3>
          <p className="text-sm text-muted-foreground mb-4">{t('fin.cogs.description')}</p>
          <Button variant="outline" onClick={handleAdd}>
            <Plus className="w-4 h-4" /> {t('fin.cogs.addItem')}
          </Button>
        </div>
      )}

      <AddCOGSDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        businessPlanId={businessPlanId}
        products={salesData?.products ?? []}
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
