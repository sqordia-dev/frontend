import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, TrendingUp, Pencil, Trash2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import FinancialSectionHeader from '../../components/financial/FinancialSectionHeader';
import { useSalesExpenses, useDeleteSalesExpense } from '../../hooks/usePrevisio';
import AddSalesExpenseDialog from '../../components/financial/dialogs/AddSalesExpenseDialog';
import type { FinancialPlanDto, SalesExpenseItem } from '../../types/financial-projections';
import { ResponsiveTable, type Column } from '../../components/ui/responsive-table';
import { SkeletonTable } from '../../components/ui/skeleton';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle,
  AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction,
} from '../../components/ui/alert-dialog';

const SalesExpensesSection: React.FC = () => {
  const { t } = useTheme();
  const { businessPlanId } = useOutletContext<{ plan: FinancialPlanDto; businessPlanId: string }>();
  const { data: expenses, isLoading } = useSalesExpenses(businessPlanId);
  const deleteMutation = useDeleteSalesExpense(businessPlanId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<SalesExpenseItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const handleAdd = () => { setEditItem(null); setDialogOpen(true); };
  const handleEdit = (item: SalesExpenseItem) => { setEditItem(item); setDialogOpen(true); };

  const columns: Column<SalesExpenseItem>[] = [
    { key: 'name', header: t('fin.common.expense'), render: (e) => <span className="font-medium">{e.name}</span> },
    { key: 'category', header: t('fin.salesExp.category'), align: 'center', hideOnMobile: true },
    { key: 'amount', header: t('fin.salesExp.amount'), align: 'right', render: (e) => `${e.amount.toLocaleString('fr-CA')} ${e.expenseMode === 'PercentageOfSales' ? '%' : '$'}` },
    { key: 'frequency', header: t('fin.salesExp.frequency'), align: 'center', hideOnMobile: true },
    {
      key: 'actions', header: t('fin.common.actions'), align: 'center',
      render: (e) => (
        <div className="inline-flex gap-1">
          <button onClick={() => handleEdit(e)} className="p-1 text-muted-foreground hover:text-strategy-blue rounded"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={() => setDeleteId(e.id)} className="p-1 text-muted-foreground hover:text-red-500 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      ),
    },
  ];

  if (isLoading) return <SkeletonTable rows={4} columns={5} />;

  return (
    <div>
      <FinancialSectionHeader
        title={t('fin.salesExp.title')}
        description={t('fin.salesExp.description')}
        icon={<TrendingUp className="w-5 h-5" />}
        actions={
          <Button onClick={handleAdd} size="sm">
            <Plus className="w-4 h-4" /> {t('fin.salesExp.addExpense')}
          </Button>
        }
      />

      {expenses && expenses.length > 0 ? (
        <div className="border border-border rounded-lg overflow-hidden">
          <ResponsiveTable
            data={expenses}
            columns={columns}
            keyExtractor={(e) => e.id}
            mobileAsCards
            renderCard={(e) => (
              <div className="border border-border rounded-lg p-4 bg-card space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-foreground">{e.name}</span>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(e)} className="p-1.5 text-muted-foreground hover:text-strategy-blue rounded"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => setDeleteId(e.id)} className="p-1.5 text-muted-foreground hover:text-red-500 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('fin.salesExp.category')}</span>
                  <Badge variant="secondary">{e.category}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('fin.salesExp.amount')}</span>
                  <span className="font-medium">{e.amount.toLocaleString('fr-CA')} {e.expenseMode === 'PercentageOfSales' ? '%' : '$'}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('fin.salesExp.frequency')}</span>
                  <Badge variant="outline">{e.frequency}</Badge>
                </div>
              </div>
            )}
          />
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-muted mb-3">
            <TrendingUp className="w-6 h-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-medium text-foreground mb-1">{t('fin.salesExp.noExpenses')}</h3>
          <p className="text-sm text-muted-foreground mb-4">{t('fin.salesExp.description')}</p>
          <Button variant="outline" onClick={handleAdd}>
            <Plus className="w-4 h-4" /> {t('fin.salesExp.addExpense')}
          </Button>
        </div>
      )}

      <AddSalesExpenseDialog
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

export default SalesExpensesSection;
