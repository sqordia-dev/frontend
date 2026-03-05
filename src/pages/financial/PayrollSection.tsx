import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, Users, Pencil, Trash2, DollarSign, Percent } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import FinancialSectionHeader from '../../components/financial/FinancialSectionHeader';
import { usePayrollModule, useDeletePayroll } from '../../hooks/usePrevisio';
import AddPayrollDialog from '../../components/financial/dialogs/AddPayrollDialog';
import type { FinancialPlanDto, PayrollItem } from '../../types/financial-projections';
import { ResponsiveTable, type Column } from '../../components/ui/responsive-table';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { SkeletonTable, SkeletonStatsCard } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '../../components/ui/alert-dialog';

const PayrollSection: React.FC = () => {
  const { t } = useTheme();
  const { plan, businessPlanId } = useOutletContext<{ plan: FinancialPlanDto; businessPlanId: string }>();
  const { data, isLoading } = usePayrollModule(businessPlanId);
  const deleteMutation = useDeletePayroll(businessPlanId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<PayrollItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = () => { setEditItem(null); setDialogOpen(true); };
  const handleEdit = (item: PayrollItem) => { setEditItem(item); setDialogOpen(true); };

  const fmt = (v: number) => v.toLocaleString('fr-CA', { maximumFractionDigits: 0 });

  const columns: Column<PayrollItem>[] = [
    { key: 'jobTitle', header: t('fin.payroll.jobTitle'), render: (item) => <span className="font-medium">{item.jobTitle}</span> },
    { key: 'payrollType', header: t('fin.payroll.type'), align: 'center', hideOnMobile: true, render: (item) => t(`fin.payroll.${item.payrollType.toLowerCase()}`) },
    { key: 'employmentStatus', header: t('fin.payroll.status'), align: 'center', hideOnMobile: true, render: (item) => t(`fin.payroll.${item.employmentStatus.toLowerCase()}`) },
    { key: 'salaryAmount', header: t('fin.payroll.salary'), align: 'right', render: (item) => `${fmt(item.salaryAmount)} $` },
    { key: 'socialChargeRate', header: t('fin.payroll.charges'), align: 'right', hideOnMobile: true, render: (item) => `${item.socialChargeRate}%` },
    { key: 'headCount', header: '#', align: 'center', hideOnMobile: true },
    { key: 'monthlyTotalCost', header: t('fin.payroll.monthlyCost'), align: 'right', render: (item) => <span className="font-semibold">{fmt(item.monthlyTotalCost)} $</span> },
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

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        title={t('fin.payroll.title')}
        description={t('fin.payroll.description')}
        icon={<Users className="w-5 h-5" />}
        actions={
          <Button onClick={handleAdd} size="sm">
            <Plus className="w-4 h-4" /> {t('fin.payroll.addEmployee')}
          </Button>
        }
      />

      {data?.items && data.items.length > 0 ? (
        <>
          {/* KPI Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <StatsCard
              title={t('fin.payroll.totalPayroll')}
              value={`${fmt(data.totalMonthlyPayroll)} $`}
              variant="primary"
              icon={<DollarSign className="w-5 h-5" />}
            />
            <StatsCard
              title={t('fin.payroll.totalCharges')}
              value={`${fmt(data.totalMonthlySocialCharges)} $`}
              variant="warning"
              icon={<Percent className="w-5 h-5" />}
            />
          </div>

          <div className="border border-border rounded-lg overflow-hidden">
            <ResponsiveTable
              data={data.items}
              columns={columns}
              keyExtractor={(item) => item.id}
              mobileAsCards
              renderCard={(item) => (
                <div className="border border-border rounded-lg p-4 bg-card space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-foreground">{item.jobTitle}</span>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(item)} className="p-1.5 text-muted-foreground hover:text-strategy-blue rounded"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => setDeleteId(item.id)} className="p-1.5 text-muted-foreground hover:text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="info">{t(`fin.payroll.${item.payrollType.toLowerCase()}`)}</Badge>
                    <Badge variant="secondary">{t(`fin.payroll.${item.employmentStatus.toLowerCase()}`)}</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground block text-xs">{t('fin.payroll.salary')}</span>
                      <span className="font-medium">{fmt(item.salaryAmount)} $</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">#</span>
                      <span className="font-medium">{item.headCount}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-xs">{t('fin.payroll.monthlyCost')}</span>
                      <span className="font-semibold">{fmt(item.monthlyTotalCost)} $</span>
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
            <Users className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-medium text-foreground mb-1">{t('fin.payroll.noEmployees')}</h3>
          <p className="text-sm text-muted-foreground mb-4">{t('fin.payroll.description')}</p>
          <Button variant="outline" onClick={handleAdd}>
            <Plus className="w-4 h-4" /> {t('fin.payroll.addEmployee')}
          </Button>
        </div>
      )}

      <AddPayrollDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        businessPlanId={businessPlanId}
        defaultSocialChargeRate={plan.defaultSocialChargeRate}
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

export default PayrollSection;
