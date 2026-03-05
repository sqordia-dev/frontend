import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Landmark, Pencil, Trash2, DollarSign, Calculator, TrendingUp } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import FinancialSectionHeader from '../../components/financial/FinancialSectionHeader';
import { useFinancingModule, useDeleteFinancing } from '../../hooks/usePrevisio';
import AddFinancingDialog from '../../components/financial/dialogs/AddFinancingDialog';
import type { FinancialPlanDto, FinancingSource } from '../../types/financial-projections';
import { ResponsiveTable, type Column } from '../../components/ui/responsive-table';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { SkeletonTable, SkeletonStatsCard } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '../../components/ui/alert-dialog';

const FinancingSection: React.FC = () => {
  const { t } = useTheme();
  const { businessPlanId } = useOutletContext<{ plan: FinancialPlanDto; businessPlanId: string }>();
  const { data, isLoading } = useFinancingModule(businessPlanId);
  const deleteMutation = useDeleteFinancing(businessPlanId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<FinancingSource | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = () => { setEditItem(null); setDialogOpen(true); };
  const handleEdit = (item: FinancingSource) => { setEditItem(item); setDialogOpen(true); };

  const fmt = (v: number) => v.toLocaleString('fr-CA', { maximumFractionDigits: 0 });

  const columns: Column<FinancingSource>[] = [
    { key: 'name', header: t('fin.financing.sourceName'), render: (s) => <span className="font-medium">{s.name}</span> },
    { key: 'financingType', header: t('fin.financing.type'), align: 'center', hideOnMobile: true },
    { key: 'amount', header: t('fin.financing.amount'), align: 'right', render: (s) => `${fmt(s.amount)} $` },
    { key: 'interestRate', header: t('fin.financing.rate'), align: 'right', hideOnMobile: true, render: (s) => `${s.interestRate}%` },
    { key: 'termMonths', header: t('fin.financing.term'), align: 'right', hideOnMobile: true, render: (s) => s.termMonths || '-' },
    { key: 'monthlyPayment', header: t('fin.financing.monthlyPayment'), align: 'right', hideOnTablet: true, render: (s) => s.requiresRepayment ? <span className="font-medium">{fmt(s.monthlyPayment)} $</span> : '-' },
    {
      key: 'actions', header: t('fin.common.actions'), align: 'center',
      render: (s) => (
        <div className="inline-flex gap-1">
          <button onClick={() => handleEdit(s)} className="p-1 text-muted-foreground hover:text-strategy-blue rounded"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={() => setDeleteId(s.id)} className="p-1 text-muted-foreground hover:text-red-500 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SkeletonStatsCard />
          <SkeletonStatsCard />
          <SkeletonStatsCard />
        </div>
        <SkeletonTable rows={4} columns={6} />
      </div>
    );
  }

  return (
    <div>
      <FinancialSectionHeader
        title={t('fin.financing.title')}
        description={t('fin.financing.description')}
        icon={<Landmark className="w-5 h-5" />}
        actions={
          <Button onClick={handleAdd} size="sm">
            <Plus className="w-4 h-4" /> {t('fin.financing.addSource')}
          </Button>
        }
      />

      {data?.sources && data.sources.length > 0 ? (
        <>
          {/* KPI Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <StatsCard
              title={t('fin.financing.totalFinancing')}
              value={`${fmt(data.totalFinancing)} $`}
              variant="success"
              icon={<DollarSign className="w-5 h-5" />}
            />
            <StatsCard
              title={t('fin.financing.projectCost')}
              value={`${fmt(data.totalProjectCost)} $`}
              variant="primary"
              icon={<Calculator className="w-5 h-5" />}
            />
            <StatsCard
              title={data.financingGap > 0 ? t('fin.financing.gap') : t('fin.financing.surplus')}
              value={`${fmt(Math.abs(data.financingGap))} $`}
              variant={data.financingGap > 0 ? 'warning' : 'success'}
              icon={<TrendingUp className="w-5 h-5" />}
            />
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <ResponsiveTable
              data={data.sources}
              columns={columns}
              keyExtractor={(s) => s.id}
              mobileAsCards
              renderCard={(s) => (
                <div className="border border-border rounded-lg p-4 bg-card space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{s.name}</span>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(s)} className="p-1.5 text-muted-foreground hover:text-strategy-blue rounded"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(s.id)} className="p-1.5 text-muted-foreground hover:text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('fin.financing.type')}</span>
                    <Badge variant="info">{s.financingType}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t('fin.financing.amount')}</span>
                    <span className="font-medium">{fmt(s.amount)} $</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm pt-1">
                    <div>
                      <span className="text-muted-foreground block text-xs">{t('fin.financing.rate')}</span>
                      <span className="font-medium">{s.interestRate}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">{t('fin.financing.term')}</span>
                      <span className="font-medium">{s.termMonths || '-'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">{t('fin.financing.monthlyPayment')}</span>
                      <span className="font-medium">{s.requiresRepayment ? `${fmt(s.monthlyPayment)} $` : '-'}</span>
                    </div>
                  </div>
                </div>
              )}
            />
          </div>
        </>
      ) : (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-muted mb-3">
            <Landmark className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-medium text-foreground mb-1">{t('fin.financing.noSources')}</h3>
          <p className="text-sm text-muted-foreground mb-4">{t('fin.financing.description')}</p>
          <Button variant="outline" onClick={handleAdd}>
            <Plus className="w-4 h-4" /> {t('fin.financing.addSource')}
          </Button>
        </div>
      )}

      <AddFinancingDialog
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

export default FinancingSection;
