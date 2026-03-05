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
import { useCreateProduct, useUpdateProduct } from '../../../hooks/usePrevisio';
import type { SalesProduct } from '../../../types/financial-projections';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  unitPrice: z.coerce.number().positive('Must be > 0'),
  paymentDelay: z.string(),
  taxRate: z.coerce.number().min(0).max(100),
  inputMode: z.string(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessPlanId: string;
  defaultTaxRate: number;
  editItem?: SalesProduct | null;
}

const PAYMENT_DELAYS = ['Immediate', 'OneMonth', 'TwoMonths', 'ThreeMonths', 'SixMonths', 'TwelveMonths'] as const;
const INPUT_MODES = ['Quantity', 'Dollars'] as const;

const ENUM_KEY_MAP: Record<string, string> = {
  Immediate: 'fin.enum.immediate',
  OneMonth: 'fin.enum.oneMonth',
  TwoMonths: 'fin.enum.twoMonths',
  ThreeMonths: 'fin.enum.threeMonths',
  SixMonths: 'fin.enum.sixMonths',
  TwelveMonths: 'fin.enum.twelveMonths',
  Quantity: 'fin.enum.quantity',
  Dollars: 'fin.enum.dollars',
};

export default function AddProductDialog({ open, onOpenChange, businessPlanId, defaultTaxRate, editItem }: Props) {
  const { t } = useTheme();
  const createMutation = useCreateProduct(businessPlanId);
  const updateMutation = useUpdateProduct(businessPlanId);
  const isEdit = !!editItem;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: '',
      unitPrice: 0,
      paymentDelay: 'Immediate',
      taxRate: defaultTaxRate,
      inputMode: 'Quantity',
    },
  });

  useEffect(() => {
    if (open) {
      if (editItem) {
        form.reset({
          name: editItem.name,
          unitPrice: editItem.unitPrice,
          paymentDelay: editItem.paymentDelay,
          taxRate: editItem.taxRate,
          inputMode: editItem.inputMode,
        });
      } else {
        form.reset({
          name: '',
          unitPrice: 0,
          paymentDelay: 'Immediate',
          taxRate: defaultTaxRate,
          inputMode: 'Quantity',
        });
      }
    }
  }, [open, editItem, defaultTaxRate, form]);

  const onSubmit = (data: FormValues) => {
    const payload = {
      name: data.name,
      unitPrice: data.unitPrice,
      paymentDelay: data.paymentDelay as SalesProduct['paymentDelay'],
      taxRate: data.taxRate,
      inputMode: data.inputMode as SalesProduct['inputMode'],
    };
    if (isEdit) {
      updateMutation.mutate({ productId: editItem!.id, data: payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(isEdit ? 'fin.dialog.editProduct' : 'fin.dialog.addProduct')}</DialogTitle>
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
            <FormField control={form.control} name="unitPrice" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fin.dialog.unitPrice')}</FormLabel>
                <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="paymentDelay" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fin.dialog.paymentDelay')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {PAYMENT_DELAYS.map((d) => (
                        <SelectItem key={d} value={d}>{t(ENUM_KEY_MAP[d])}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="inputMode" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fin.dialog.inputMode')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {INPUT_MODES.map((m) => (
                        <SelectItem key={m} value={m}>{t(ENUM_KEY_MAP[m])}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="taxRate" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fin.dialog.taxRate')}</FormLabel>
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
