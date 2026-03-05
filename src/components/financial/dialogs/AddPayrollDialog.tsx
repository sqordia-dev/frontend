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
import { useCreatePayroll, useUpdatePayroll } from '../../../hooks/usePrevisio';
import type { PayrollItem } from '../../../types/financial-projections';

const schema = z.object({
  jobTitle: z.string().min(1, 'Required'),
  payrollType: z.string(),
  employmentStatus: z.string(),
  salaryFrequency: z.string(),
  salaryAmount: z.coerce.number().positive('Must be > 0'),
  socialChargeRate: z.coerce.number().min(0).max(100),
  headCount: z.coerce.number().int().min(1, 'Min 1'),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessPlanId: string;
  defaultSocialChargeRate: number;
  editItem?: PayrollItem | null;
}

const PAYROLL_TYPES = ['Owner', 'Production', 'Sales', 'Admin'] as const;
const EMPLOYMENT_STATUSES = ['Employee', 'Contractor'] as const;
const SALARY_FREQUENCIES = ['Hourly', 'Monthly', 'Annual'] as const;

const ENUM_KEY_MAP: Record<string, string> = {
  Owner: 'fin.payroll.owner',
  Production: 'fin.payroll.production',
  Sales: 'fin.payroll.sales',
  Admin: 'fin.payroll.admin',
  Employee: 'fin.payroll.employee',
  Contractor: 'fin.payroll.contractor',
  Hourly: 'fin.enum.hourly',
  Monthly: 'fin.enum.monthly',
  Annual: 'fin.enum.annual',
};

export default function AddPayrollDialog({ open, onOpenChange, businessPlanId, defaultSocialChargeRate, editItem }: Props) {
  const { t } = useTheme();
  const createMutation = useCreatePayroll(businessPlanId);
  const updateMutation = useUpdatePayroll(businessPlanId);
  const isEdit = !!editItem;

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      jobTitle: '', payrollType: 'Production', employmentStatus: 'Employee',
      salaryFrequency: 'Annual', salaryAmount: 0, socialChargeRate: defaultSocialChargeRate, headCount: 1,
    },
  });

  useEffect(() => {
    if (open) {
      if (editItem) {
        form.reset({
          jobTitle: editItem.jobTitle,
          payrollType: editItem.payrollType,
          employmentStatus: editItem.employmentStatus,
          salaryFrequency: editItem.salaryFrequency,
          salaryAmount: editItem.salaryAmount,
          socialChargeRate: editItem.socialChargeRate,
          headCount: editItem.headCount,
        });
      } else {
        form.reset({
          jobTitle: '', payrollType: 'Production', employmentStatus: 'Employee',
          salaryFrequency: 'Annual', salaryAmount: 0, socialChargeRate: defaultSocialChargeRate, headCount: 1,
        });
      }
    }
  }, [open, editItem, defaultSocialChargeRate, form]);

  const onSubmit = (data: FormValues) => {
    const payload = {
      jobTitle: data.jobTitle,
      payrollType: data.payrollType as PayrollItem['payrollType'],
      employmentStatus: data.employmentStatus as PayrollItem['employmentStatus'],
      salaryFrequency: data.salaryFrequency as PayrollItem['salaryFrequency'],
      salaryAmount: data.salaryAmount,
      socialChargeRate: data.socialChargeRate,
      headCount: data.headCount,
    };
    if (isEdit) {
      updateMutation.mutate({ itemId: editItem!.id, data: payload }, { onSuccess: () => onOpenChange(false) });
    } else {
      createMutation.mutate(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t(isEdit ? 'fin.dialog.editPayroll' : 'fin.dialog.addPayroll')}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="jobTitle" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('fin.dialog.jobTitle')}</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="payrollType" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fin.dialog.payrollType')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {PAYROLL_TYPES.map((v) => (
                        <SelectItem key={v} value={v}>{t(ENUM_KEY_MAP[v])}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="employmentStatus" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fin.dialog.employmentStatus')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {EMPLOYMENT_STATUSES.map((v) => (
                        <SelectItem key={v} value={v}>{t(ENUM_KEY_MAP[v])}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="salaryFrequency" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fin.dialog.salaryFrequency')}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {SALARY_FREQUENCIES.map((v) => (
                        <SelectItem key={v} value={v}>{t(ENUM_KEY_MAP[v])}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="salaryAmount" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fin.dialog.salaryAmount')}</FormLabel>
                  <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="socialChargeRate" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fin.dialog.socialChargeRate')}</FormLabel>
                  <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="headCount" render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('fin.dialog.headCount')}</FormLabel>
                  <FormControl><Input type="number" step="1" min="1" {...field} /></FormControl>
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
