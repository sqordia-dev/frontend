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
import { useCreateCapex, useUpdateCapex } from '../../../hooks/usePrevisio';
import type { CapexAsset } from '../../../types/financial-projections';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  assetType: z.string(),
  purchaseValue: z.coerce.number().positive('Must be > 0'),
  purchaseMonth: z.coerce.number().int().min(0).max(12),
  purchaseYear: z.coerce.number().int().min(1),
  depreciationMethod: z.string(),
  usefulLifeYears: z.coerce.number().int().positive('Must be > 0'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessPlanId: string;
  editItem?: CapexAsset | null;
}

const ASSET_TYPES = ['IT', 'Vehicle', 'Equipment', 'Furniture', 'LeaseholdImprovements'] as const;
const DEPRECIATION_METHODS = ['StraightLine', 'DecliningBalance'] as const;

const ASSET_USEFUL_LIFE: Record<string, number> = {
  IT: 3, Vehicle: 5, Equipment: 5, Furniture: 5, LeaseholdImprovements: 10,
};

const ENUM_KEY_MAP: Record<string, string> = {
  IT: 'fin.enum.it', Vehicle: 'fin.enum.vehicle', Equipment: 'fin.enum.equipment',
  Furniture: 'fin.enum.furniture', LeaseholdImprovements: 'fin.enum.leaseholdImprovements',
  StraightLine: 'fin.enum.straightLine', DecliningBalance: 'fin.enum.decliningBalance',
};

export default function AddCapexDialog({ open, onOpenChange, businessPlanId, editItem }: Props) {
  const { t } = useTheme();
  const createMutation = useCreateCapex(businessPlanId);
  const updateMutation = useUpdateCapex(businessPlanId);
  const isEdit = !!editItem;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      name: '', assetType: 'Equipment', purchaseValue: 0, purchaseMonth: 1,
      purchaseYear: 1, depreciationMethod: 'StraightLine', usefulLifeYears: 5,
    },
  });

  useEffect(() => {
    if (open) {
      if (editItem) {
        form.reset({
          name: editItem.name, assetType: editItem.assetType, purchaseValue: editItem.purchaseValue,
          purchaseMonth: editItem.purchaseMonth, purchaseYear: editItem.purchaseYear,
          depreciationMethod: editItem.depreciationMethod, usefulLifeYears: editItem.usefulLifeYears,
        });
      } else {
        form.reset({
          name: '', assetType: 'Equipment', purchaseValue: 0, purchaseMonth: 1,
          purchaseYear: 1, depreciationMethod: 'StraightLine', usefulLifeYears: 5,
        });
      }
    }
  }, [open, editItem, form]);

  const watchedAssetType = form.watch('assetType');
  useEffect(() => {
    if (!isEdit && watchedAssetType) {
      form.setValue('usefulLifeYears', ASSET_USEFUL_LIFE[watchedAssetType] ?? 5);
    }
  }, [watchedAssetType, isEdit, form]);

  const onSubmit = (data: FormValues) => {
    const payload = {
      name: data.name,
      assetType: data.assetType as CapexAsset['assetType'],
      purchaseValue: data.purchaseValue,
      purchaseMonth: data.purchaseMonth,
      purchaseYear: data.purchaseYear,
      depreciationMethod: data.depreciationMethod as CapexAsset['depreciationMethod'],
      usefulLifeYears: data.usefulLifeYears,
    };
    if (isEdit) {
      updateMutation.mutate({ assetId: editItem!.id, data: payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(isEdit ? 'fin.dialog.editCapex' : 'fin.dialog.addCapex')}</DialogTitle>
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
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="assetType" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fin.dialog.assetType')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {ASSET_TYPES.map((a) => (
                        <SelectItem key={a} value={a}>{t(ENUM_KEY_MAP[a])}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="purchaseValue" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fin.dialog.purchaseValue')}</FormLabel>
                  <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="purchaseMonth" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fin.dialog.purchaseMonth')}</FormLabel>
                  <FormControl><Input type="number" min="0" max="12" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="purchaseYear" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fin.dialog.purchaseYear')}</FormLabel>
                  <FormControl><Input type="number" min="1" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="depreciationMethod" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fin.dialog.depreciationMethod')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {DEPRECIATION_METHODS.map((m) => (
                        <SelectItem key={m} value={m}>{t(ENUM_KEY_MAP[m])}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="usefulLifeYears" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fin.dialog.usefulLifeYears')}</FormLabel>
                  <FormControl><Input type="number" min="1" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
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
