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
import { useCreateFinancing, useUpdateFinancing } from '../../../hooks/usePrevisio';
import type { FinancingSource } from '../../../types/financial-projections';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  financingType: z.string(),
  amount: z.coerce.number().positive('Must be > 0'),
  interestRate: z.coerce.number().min(0),
  termMonths: z.coerce.number().int().min(0),
  moratoireMonths: z.coerce.number().int().min(0),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessPlanId: string;
  editItem?: FinancingSource | null;
}

const FINANCING_TYPES = [
  'BankLoan', 'LineOfCredit', 'PersonalInvestment', 'PartnerInvestment',
  'AngelInvestor', 'VentureCapital', 'GovernmentSubsidy', 'Grant', 'Crowdfunding', 'Other',
] as const;

const ENUM_KEY_MAP: Record<string, string> = {
  BankLoan: 'fin.enum.bankLoan', LineOfCredit: 'fin.enum.lineOfCredit',
  PersonalInvestment: 'fin.enum.personalInvestment', PartnerInvestment: 'fin.enum.partnerInvestment',
  AngelInvestor: 'fin.enum.angelInvestor', VentureCapital: 'fin.enum.ventureCapital',
  GovernmentSubsidy: 'fin.enum.governmentSubsidy', Grant: 'fin.enum.grant',
  Crowdfunding: 'fin.enum.crowdfunding', Other: 'fin.enum.other',
};

export default function AddFinancingDialog({ open, onOpenChange, businessPlanId, editItem }: Props) {
  const { t } = useTheme();
  const createMutation = useCreateFinancing(businessPlanId);
  const updateMutation = useUpdateFinancing(businessPlanId);
  const isEdit = !!editItem;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: { name: '', financingType: 'BankLoan', amount: 0, interestRate: 0, termMonths: 60, moratoireMonths: 0 },
  });

  useEffect(() => {
    if (open) {
      if (editItem) {
        form.reset({
          name: editItem.name, financingType: editItem.financingType, amount: editItem.amount,
          interestRate: editItem.interestRate, termMonths: editItem.termMonths, moratoireMonths: editItem.moratoireMonths,
        });
      } else {
        form.reset({ name: '', financingType: 'BankLoan', amount: 0, interestRate: 0, termMonths: 60, moratoireMonths: 0 });
      }
    }
  }, [open, editItem, form]);

  const onSubmit = (data: FormValues) => {
    const payload = {
      name: data.name,
      financingType: data.financingType as FinancingSource['financingType'],
      amount: data.amount,
      interestRate: data.interestRate,
      termMonths: data.termMonths,
      moratoireMonths: data.moratoireMonths,
    };
    if (isEdit) {
      updateMutation.mutate({ sourceId: editItem!.id, data: payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(isEdit ? 'fin.dialog.editFinancing' : 'fin.dialog.addFinancing')}</DialogTitle>
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
            <FormField control={form.control} name="financingType" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fin.dialog.financingType')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {FINANCING_TYPES.map((ft) => (
                      <SelectItem key={ft} value={ft}>{t(ENUM_KEY_MAP[ft])}</SelectItem>
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
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="interestRate" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fin.dialog.interestRate')}</FormLabel>
                  <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="termMonths" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fin.dialog.termMonths')}</FormLabel>
                  <FormControl><Input type="number" min="0" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="moratoireMonths" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fin.dialog.moratoireMonths')}</FormLabel>
                <FormControl><Input type="number" min="0" {...field} /></FormControl>
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
