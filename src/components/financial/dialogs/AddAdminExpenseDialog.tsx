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
import { Switch } from '../../ui/switch';
import { useCreateAdminExpense, useUpdateAdminExpense } from '../../../hooks/usePrevisio';
import type { AdminExpenseItem } from '../../../types/financial-projections';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  category: z.string(),
  monthlyAmount: z.coerce.number().positive('Must be > 0'),
  isTaxable: z.boolean(),
  frequency: z.string(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessPlanId: string;
  editItem?: AdminExpenseItem | null;
}

const CATEGORIES = ['Rent', 'Insurance', 'Telecom', 'OfficeSupplies', 'ProfessionalFees', 'BankCharges', 'Licenses', 'Training', 'Maintenance', 'Utilities', 'SecurityAlarm', 'Subscriptions', 'Other'] as const;
const FREQUENCIES = ['Monthly', 'Quarterly', 'SemiAnnual', 'Annual', 'OneTime'] as const;

const ENUM_KEY_MAP: Record<string, string> = {
  Rent: 'fin.enum.rent', Insurance: 'fin.enum.insurance', Telecom: 'fin.enum.telecom',
  OfficeSupplies: 'fin.enum.officeSupplies', ProfessionalFees: 'fin.enum.professionalFees',
  BankCharges: 'fin.enum.bankCharges', Licenses: 'fin.enum.licenses', Training: 'fin.enum.training',
  Maintenance: 'fin.enum.maintenance', Utilities: 'fin.enum.utilities', SecurityAlarm: 'fin.enum.securityAlarm',
  Subscriptions: 'fin.enum.subscriptions', Other: 'fin.enum.other',
  Monthly: 'fin.enum.monthly', Quarterly: 'fin.enum.quarterly', SemiAnnual: 'fin.enum.semiAnnual',
  Annual: 'fin.enum.annual', OneTime: 'fin.enum.oneTime',
};

export default function AddAdminExpenseDialog({ open, onOpenChange, businessPlanId, editItem }: Props) {
  const { t } = useTheme();
  const createMutation = useCreateAdminExpense(businessPlanId);
  const updateMutation = useUpdateAdminExpense(businessPlanId);
  const isEdit = !!editItem;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { name: '', category: 'Rent', monthlyAmount: 0, isTaxable: true, frequency: 'Monthly' },
  });

  useEffect(() => {
    if (open) {
      if (editItem) {
        form.reset({
          name: editItem.name, category: editItem.category,
          monthlyAmount: editItem.monthlyAmount, isTaxable: editItem.isTaxable, frequency: editItem.frequency,
        });
      } else {
        form.reset({ name: '', category: 'Rent', monthlyAmount: 0, isTaxable: true, frequency: 'Monthly' });
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
          <DialogTitle>{t(isEdit ? 'fin.dialog.editAdminExpense' : 'fin.dialog.addAdminExpense')}</DialogTitle>
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
              <FormField control={form.control} name="monthlyAmount" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fin.dialog.monthlyAmount')}</FormLabel>
                  <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
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
            </div>
            <FormField control={form.control} name="isTaxable" render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3">
                <FormLabel>{t('fin.dialog.isTaxable')}</FormLabel>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
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
