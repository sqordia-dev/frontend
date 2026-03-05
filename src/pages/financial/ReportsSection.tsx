import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import FinancialSectionHeader from '../../components/financial/FinancialSectionHeader';
import YearTabBar from '../../components/financial/YearTabBar';
import { useFinancialRatios } from '../../hooks/usePrevisio';
import type { FinancialPlanDto } from '../../types/financial-projections';
import { StatsCard } from '../../components/dashboard/StatsCard';
import { StaggerContainer, StaggerItem } from '../../components/ui/page-transition';

const ReportsSection: React.FC = () => {
  const { t } = useTheme();
  const { plan, businessPlanId } = useOutletContext<{ plan: FinancialPlanDto; businessPlanId: string }>();
  const { data: ratios } = useFinancialRatios(businessPlanId);
  const [activeYear, setActiveYear] = useState(1);

  const formatPct = (v: number) => `${(v * 100).toFixed(1)}%`;

  const getRatioVariant = (key: string, value: number): 'success' | 'warning' | 'default' => {
    switch (key) {
      case 'debtRatio': return value < 1 ? 'success' : 'warning';
      case 'liquidityRatio': return value >= 1.5 ? 'success' : 'warning';
      case 'grossMargin': return value > 0.3 ? 'success' : 'warning';
      case 'netMargin': return value > 0 ? 'success' : 'warning';
      case 'workingCapitalRatio': return value >= 1.5 ? 'success' : 'warning';
      default: return 'default';
    }
  };

  return (
    <div>
      <FinancialSectionHeader
        title={t('fin.reports.title')}
        description={t('fin.reports.description')}
        icon={<BarChart3 className="w-5 h-5" />}
      />

      <YearTabBar
        projectionYears={plan?.projectionYears ?? 3}
        activeYear={activeYear}
        onYearChange={setActiveYear}
        showPreOpening={false}
        className="mb-6"
      />

      {/* Ratio cards */}
      {ratios && (
        <StaggerContainer className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <StaggerItem>
            <StatsCard
              title={t('fin.reports.debtRatio')}
              value={ratios.debtRatio.toFixed(2)}
              description={`${t('fin.reports.target')}: < 1.0`}
              variant={getRatioVariant('debtRatio', ratios.debtRatio)}
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title={t('fin.reports.liquidityRatio')}
              value={ratios.liquidityRatio.toFixed(2)}
              description={`${t('fin.reports.target')}: 1.7 - 2.0`}
              variant={getRatioVariant('liquidityRatio', ratios.liquidityRatio)}
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title={t('fin.reports.grossMargin')}
              value={formatPct(ratios.grossMargin)}
              variant={getRatioVariant('grossMargin', ratios.grossMargin)}
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title={t('fin.reports.netMargin')}
              value={formatPct(ratios.netMargin)}
              variant={getRatioVariant('netMargin', ratios.netMargin)}
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title={t('fin.reports.breakEven')}
              value={ratios.breakEvenMonth ? `${t('fin.reports.breakEvenMonth')} ${ratios.breakEvenMonth}` : t('fin.reports.na')}
              variant="default"
            />
          </StaggerItem>
          <StaggerItem>
            <StatsCard
              title={t('fin.reports.workingCapitalRatio')}
              value={ratios.workingCapitalRatio.toFixed(2)}
              variant={getRatioVariant('workingCapitalRatio', ratios.workingCapitalRatio)}
            />
          </StaggerItem>
        </StaggerContainer>
      )}

      <div className="text-center py-12 border border-dashed border-border rounded-lg text-muted-foreground">
        <p>{t('fin.reports.statementsPlaceholder')}</p>
        <p className="text-sm mt-2">{t('fin.reports.engineInProgress')}</p>
      </div>
    </div>
  );
};

export default ReportsSection;
