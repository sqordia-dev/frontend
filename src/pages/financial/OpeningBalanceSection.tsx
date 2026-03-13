import { useState, useEffect, type FC } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
import { useUpdatePlanSettings } from '../../hooks/usePrevisio';
import { Button } from '../../components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../../components/ui/select';
import type { FinancialPlanDto } from '../../types/financial-projections';

interface OutletContext {
  plan: FinancialPlanDto;
  businessPlanId: string;
}

const OpeningBalanceSection: FC = () => {
  const { t } = useTheme();
  const { plan, businessPlanId } = useOutletContext<OutletContext>();
  const updateSettings = useUpdatePlanSettings(businessPlanId);

  const [isOperating, setIsOperating] = useState('no');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (plan) {
      setIsOperating(plan.isAlreadyOperating ? 'yes' : 'no');
    }
  }, [plan]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings.mutateAsync({
        projectionYears: plan.projectionYears,
        defaultVolumeGrowthRate: plan.defaultVolumeGrowthRate,
        defaultPriceIndexationRate: plan.defaultPriceIndexationRate,
        defaultExpenseIndexationRate: plan.defaultExpenseIndexationRate,
        defaultSocialChargeRate: plan.defaultSocialChargeRate,
        defaultSalesTaxRate: plan.defaultSalesTaxRate,
        isAlreadyOperating: isOperating === 'yes',
      });
    } catch {
      // error handled by hooks
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (plan) {
      setIsOperating(plan.isAlreadyOperating ? 'yes' : 'no');
    }
  };

  return (
    <div className="max-w-lg">
      <h2 className="text-xl font-heading font-semibold text-strategy-blue mb-6">
        {t('fin.openingBalance.title')}
      </h2>

      <div className="space-y-5">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
            <span className="text-red-500 mr-0.5">*</span>
            {t('fin.openingBalance.isOperating')}
          </label>
          <Select value={isOperating} onValueChange={setIsOperating}>
            <SelectTrigger className="bg-card">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no">{t('fin.openingBalance.no')}</SelectItem>
              <SelectItem value="yes">{t('fin.openingBalance.yes')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-8 pt-6 border-t border-border">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? t('fin.openingBalance.saving') : t('fin.openingBalance.save')}
        </Button>
        <Button variant="outline" onClick={handleCancel} disabled={saving}>
          {t('fin.common.cancel')}
        </Button>
      </div>
    </div>
  );
};

export default OpeningBalanceSection;
