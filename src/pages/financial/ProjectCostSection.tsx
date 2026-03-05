import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calculator } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import FinancialSectionHeader from '../../components/financial/FinancialSectionHeader';
import { useProjectCost } from '../../hooks/usePrevisio';
import type { FinancialPlanDto } from '../../types/financial-projections';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { SkeletonStatsCard } from '../../components/ui/skeleton';

const ProjectCostSection: React.FC = () => {
  const { t } = useTheme();
  const { businessPlanId } = useOutletContext<{ plan: FinancialPlanDto; businessPlanId: string }>();
  const { data, isLoading } = useProjectCost(businessPlanId);

  const fmt = (v: number) => v.toLocaleString('fr-CA', { maximumFractionDigits: 0 });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <SkeletonStatsCard />
          <SkeletonStatsCard />
        </div>
        <SkeletonStatsCard />
      </div>
    );
  }

  return (
    <div>
      <FinancialSectionHeader
        title={t('fin.projectCost.title')}
        description={t('fin.projectCost.description')}
        icon={<Calculator className="w-5 h-5" />}
      />

      {data ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t('fin.projectCost.workingCapital')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-foreground">{fmt(data.totalWorkingCapital)} $</p>
                <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  <div className="flex justify-between"><span>{t('fin.projectCost.cogsMonths')} ({data.workingCapitalMonthsCOGS} {t('fin.projectCost.months')})</span><span className="text-foreground">{fmt(data.breakdown.workingCapitalCOGS)} $</span></div>
                  <div className="flex justify-between"><span>{t('fin.projectCost.payrollMonths')} ({data.workingCapitalMonthsPayroll} {t('fin.projectCost.months')})</span><span className="text-foreground">{fmt(data.breakdown.workingCapitalPayroll)} $</span></div>
                  <div className="flex justify-between"><span>{t('fin.projectCost.salesExpMonths')} ({data.workingCapitalMonthsSalesExpenses} {t('fin.projectCost.months')})</span><span className="text-foreground">{fmt(data.breakdown.workingCapitalSalesExpenses)} $</span></div>
                  <div className="flex justify-between"><span>{t('fin.projectCost.adminExpMonths')} ({data.workingCapitalMonthsAdminExpenses} {t('fin.projectCost.months')})</span><span className="text-foreground">{fmt(data.breakdown.workingCapitalAdminExpenses)} $</span></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{t('fin.projectCost.capitalAssets')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold text-foreground">{fmt(data.totalCapex)} $</p>
                <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                  {data.breakdown.capexItems.map((item, i) => (
                    <div key={i} className="flex justify-between"><span>{item.name}</span><span className="text-foreground">{fmt(item.amount)} $</span></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Total band */}
          <Card className="border-strategy-blue/20 bg-strategy-blue/5">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <span className="text-lg font-medium text-foreground">{t('fin.projectCost.totalProjectCost')}</span>
                <span className="text-2xl font-bold text-strategy-blue">{fmt(data.totalProjectCost)} $</span>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground">{t('fin.projectCost.noData')}</div>
      )}
    </div>
  );
};

export default ProjectCostSection;
