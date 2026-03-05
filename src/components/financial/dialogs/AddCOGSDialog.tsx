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
import { useCreateCOGS, useUpdateCOGS } from '../../../hooks/usePrevisio';
import type { COGSItem, SalesProduct } from '../../../types/financial-projections';

const schema = z.object({
  linkedSalesProductId: z.string().min(1, 'Required'),
  costMode: z.string(),
  costValue: z.coerce.number().positive('Must be > 0'),
  beginningInventory: z.coerce.number().min(0),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessPlanId: string;
  products: SalesProduct[];
  editItem?: COGSItem | null;
}

const COST_MODES = ['FixedDollars', 'PercentageOfPrice'] as const;
const ENUM_KEY_MAP: Record<string, string> = {
  FixedDollars: 'fin.enum.fixedDollars',
  PercentageOfPrice: 'fin.enum.percentageOfPrice',
};

export default function AddCOGSDialog({ open, onOpenChange, businessPlanId, products, editItem }: Props) {
  const { t } = useTheme();
  const createMutation = useCreateCOGS(businessPlanId);
  const updateMutation = useUpdateCOGS(businessPlanId);
  const isEdit = !!editItem;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { linkedSalesProductId: '', costMode: 'FixedDollars', costValue: 0, beginningInventory: 0 },
  });

  useEffect(() => {
    if (open) {
      if (editItem) {
        form.reset({
          linkedSalesProductId: editItem.linkedSalesProductId,
          costMode: editItem.costMode,
          costValue: editItem.costValue,
          beginningInventory: editItem.beginningInventory,
        });
      } else {
        form.reset({ linkedSalesProductId: '', costMode: 'FixedDollars', costValue: 0, beginningInventory: 0 });
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
          <DialogTitle>{t(isEdit ? 'fin.dialog.editCOGS' : 'fin.dialog.addCOGS')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="linkedSalesProductId" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fin.dialog.linkedProduct')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={isEdit}>
                  <FormControl><SelectTrigger><SelectValue placeholder={t('fin.dialog.linkedProduct')} /></SelectTrigger></FormControl>
                  <SelectContent>
                    {products.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="costMode" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fin.dialog.costMode')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {COST_MODES.map((m) => (
                      <SelectItem key={m} value={m}>{t(ENUM_KEY_MAP[m])}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="costValue" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fin.dialog.costValue')}</FormLabel>
                <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="beginningInventory" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fin.dialog.beginningInventory')}</FormLabel>
                <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
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
