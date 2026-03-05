import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, HardDrive, Pencil, Trash2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import FinancialSectionHeader from '../../components/financial/FinancialSectionHeader';
import { useCapexAssets, useDeleteCapex } from '../../hooks/usePrevisio';
import AddCapexDialog from '../../components/financial/dialogs/AddCapexDialog';
import type { FinancialPlanDto, CapexAsset } from '../../types/financial-projections';
import { ResponsiveTable, type Column } from '../../components/ui/responsive-table';
import { SkeletonTable } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '../../components/ui/alert-dialog';

const CapexSection: React.FC = () => {
  const { t } = useTheme();
  const { businessPlanId } = useOutletContext<{ plan: FinancialPlanDto; businessPlanId: string }>();
  const { data: assets, isLoading } = useCapexAssets(businessPlanId);
  const deleteMutation = useDeleteCapex(businessPlanId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<CapexAsset | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = () => { setEditItem(null); setDialogOpen(true); };
  const handleEdit = (item: CapexAsset) => { setEditItem(item); setDialogOpen(true); };

  const fmt = (v: number) => v.toLocaleString('fr-CA', { maximumFractionDigits: 0 });

  const columns: Column<CapexAsset>[] = [
    { key: 'name', header: t('fin.capex.assetName'), render: (a) => <span className="font-medium">{a.name}</span> },
    { key: 'assetType', header: t('fin.capex.assetType'), align: 'center', hideOnMobile: true },
    { key: 'purchaseValue', header: t('fin.capex.value'), align: 'right', render: (a) => `${fmt(a.purchaseValue)} $` },
    { key: 'depreciationMethod', header: t('fin.capex.depreciation'), align: 'center', hideOnMobile: true },
    { key: 'usefulLifeYears', header: t('fin.capex.usefulLife'), align: 'right', hideOnMobile: true },
    { key: 'annualDepreciation', header: t('fin.capex.annualDepr'), align: 'right', hideOnTablet: true, render: (a) => <span className="font-medium">{fmt(a.annualDepreciation)} $</span> },
    {
      key: 'actions', header: t('fin.common.actions'), align: 'center',
      render: (a) => (
        <div className="inline-flex gap-1">
          <button onClick={() => handleEdit(a)} className="p-1 text-muted-foreground hover:text-strategy-blue rounded"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={() => setDeleteId(a.id)} className="p-1 text-muted-foreground hover:text-red-500 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ),
    },
  ];

  if (isLoading) return <SkeletonTable rows={4} columns={6} />;

  return (
    <div>
      <FinancialSectionHeader
        title={t('fin.capex.title')}
        description={t('fin.capex.description')}
        icon={<HardDrive className="w-5 h-5" />}
        actions={
          <Button onClick={handleAdd} size="sm">
            <Plus className="w-4 h-4" /> {t('fin.capex.addAsset')}
          </Button>
        }
      />

      {assets && assets.length > 0 ? (
        <div className="border border-border rounded-lg overflow-hidden">
          <ResponsiveTable
            data={assets}
            columns={columns}
            keyExtractor={(a) => a.id}
            mobileAsCards
            renderCard={(a) => (
              <div className="border border-border rounded-lg p-4 bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{a.name}</span>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(a)} className="p-1.5 text-muted-foreground hover:text-strategy-blue rounded"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteId(a.id)} className="p-1.5 text-muted-foreground hover:text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('fin.capex.assetType')}</span>
                  <Badge variant="info">{a.assetType}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('fin.capex.value')}</span>
                  <span className="font-medium">{fmt(a.purchaseValue)} $</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('fin.capex.depreciation')}</span>
                  <span>{a.depreciationMethod} / {a.usefulLifeYears} {t('fin.projectCost.months').replace('mois', 'ans')}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('fin.capex.annualDepr')}</span>
                  <span className="font-semibold">{fmt(a.annualDepreciation)} $</span>
                </div>
              </div>
            )}
          />
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-muted mb-3">
            <HardDrive className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-medium text-foreground mb-1">{t('fin.capex.noAssets')}</h3>
          <p className="text-sm text-muted-foreground mb-4">{t('fin.capex.description')}</p>
          <Button variant="outline" onClick={handleAdd}>
            <Plus className="w-4 h-4" /> {t('fin.capex.addAsset')}
          </Button>
        </div>
      )}

      <AddCapexDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        businessPlanId={businessPlanId}
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

export default CapexSection;
