import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from '../../../contexts/ThemeContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../../ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '../../ui/form';
import { Input } from '../../ui/input';
import { Button } from '../../ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../ui/select';
import { useCreateSalesExpense, useUpdateSalesExpense } from '../../../hooks/usePrevisio';
import type { SalesExpenseItem } from '../../../types/financial-projections';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  category: z.string(),
  expenseMode: z.string(),
  amount: z.coerce.number().positive('Must be > 0'),
  frequency: z.string(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessPlanId: string;
  editItem?: SalesExpenseItem | null;
}

const CATEGORIES = ['Commissions', 'Marketing', 'Advertising', 'TradeShows', 'TravelExpenses', 'Samples', 'Packaging', 'Shipping', 'WebHosting', 'Other'] as const;
const EXPENSE_MODES = ['FixedDollars', 'PercentageOfSales'] as const;
const FREQUENCIES = ['Monthly', 'Quarterly', 'SemiAnnual', 'Annual', 'OneTime'] as const;

const ENUM_KEY_MAP: Record<string, string> = {
  Commissions: 'fin.enum.commissions', Marketing: 'fin.enum.marketing', Advertising: 'fin.enum.advertising',
  TradeShows: 'fin.enum.tradeShows', TravelExpenses: 'fin.enum.travelExpenses', Samples: 'fin.enum.samples',
  Packaging: 'fin.enum.packaging', Shipping: 'fin.enum.shipping', WebHosting: 'fin.enum.webHosting', Other: 'fin.enum.other',
  FixedDollars: 'fin.enum.fixedDollars', PercentageOfSales: 'fin.enum.percentageOfSales',
  Monthly: 'fin.enum.monthly', Quarterly: 'fin.enum.quarterly', SemiAnnual: 'fin.enum.semiAnnual',
  Annual: 'fin.enum.annual', OneTime: 'fin.enum.oneTime',
};

export default function AddSalesExpenseDialog({ open, onOpenChange, businessPlanId, editItem }: Props) {
  const { t } = useTheme();
  const createMutation = useCreateSalesExpense(businessPlanId);
  const updateMutation = useUpdateSalesExpense(businessPlanId);
  const isEdit = !!editItem;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { name: '', category: 'Marketing', expenseMode: 'FixedDollars', amount: 0, frequency: 'Monthly' },
  });

  useEffect(() => {
    if (open) {
      if (editItem) {
        form.reset({
          name: editItem.name, category: editItem.category, expenseMode: editItem.expenseMode,
          amount: editItem.amount, frequency: editItem.frequency,
        });
      } else {
        form.reset({ name: '', category: 'Marketing', expenseMode: 'FixedDollars', amount: 0, frequency: 'Monthly' });
      }
    }
  }, [open, editItem, form]);

  const onSubmit = (data: FormValues) => {
    if (isEdit) {
      updateMutation.mutate({ itemId: editItem!.id, data: data as any }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(data as any, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(isEdit ? 'fin.dialog.editSalesExpense' : 'fin.dialog.addSalesExpense')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fin.dialog.name')}</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fin.dialog.category')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>{t(ENUM_KEY_MAP[c])}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="expenseMode" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fin.dialog.expenseMode')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {EXPENSE_MODES.map((m) => (
                        <SelectItem key={m} value={m}>{t(ENUM_KEY_MAP[m])}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="amount" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fin.dialog.amount')}</FormLabel>
                  <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="frequency" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fin.dialog.frequency')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {FREQUENCIES.map((f) => (
                      <SelectItem key={f} value={f}>{t(ENUM_KEY_MAP[f])}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>{t('fin.common.cancel')}</Button>
              <Button type="submit" disabled={isPending}>{t(isEdit ? 'fin.common.save' : 'fin.common.add')}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
