import { useState, useRef, useEffect, type FC } from 'react';
import { useOutletContext } from 'react-router-dom';
import { ChevronDown, X, Loader2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import YearTabBar from '../../components/financial/YearTabBar';
import {
  useRecalculateStatements, useProfitLoss, useCashFlow,
  useBalanceSheet, useFinancialRatios,
} from '../../hooks/usePrevisio';
import type { FinancialPlanDto, StatementLineItem } from '../../types/financial-projections';
import { Button } from '../../components/ui/button';

interface OutletContext {
  plan: FinancialPlanDto;
  businessPlanId: string;
}

const REPORT_SECTIONS = [
  { key: 'full', labelKey: 'fin.reports.sectionFull' },
  { key: 'summary', labelKey: 'fin.reports.sectionSummary' },
  { key: 'income', labelKey: 'fin.reports.sectionIncome' },
  { key: 'balance', labelKey: 'fin.reports.sectionBalance' },
  { key: 'cashflow', labelKey: 'fin.reports.sectionCashflow' },
  { key: 'projectCost', labelKey: 'fin.reports.sectionProjectCost' },
  { key: 'ratios', labelKey: 'fin.reports.sectionRatios' },
];

function fmtCell(value: number): string {
  if (value === 0) return '0';
  return Math.round(value).toLocaleString('fr-CA');
}

const ReportsSection: FC = () => {
  const { t, language } = useTheme();
  const { plan, businessPlanId } = useOutletContext<OutletContext>();

  const [selected, setSelected] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [activeYear, setActiveYear] = useState(1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const recalculate = useRecalculateStatements(businessPlanId);
  const projectionYears = plan.projectionYears ?? 3;

  // Only fetch data when sections are selected
  const showIncome = selected.includes('full') || selected.includes('income');
  const showCashflow = selected.includes('full') || selected.includes('cashflow');
  const showBalance = selected.includes('full') || selected.includes('balance');
  const showRatios = selected.includes('full') || selected.includes('ratios');

  const { data: profitLoss, isLoading: plLoading } = useProfitLoss(
    showIncome ? businessPlanId : '', activeYear, language
  );
  const { data: cashFlow, isLoading: cfLoading } = useCashFlow(
    showCashflow ? businessPlanId : '', activeYear, language
  );
  const { data: balanceSheet, isLoading: bsLoading } = useBalanceSheet(
    showBalance ? businessPlanId : '', activeYear, language
  );
  const { data: ratios, isLoading: ratiosLoading } = useFinancialRatios(
    showRatios ? businessPlanId : ''
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleSection = (key: string) => {
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const removeSection = (key: string) => {
    setSelected((prev) => prev.filter((k) => k !== key));
  };

  const handleRecalculate = () => {
    recalculate.mutate(language);
  };

  const firstSelected = selected.length > 0
    ? REPORT_SECTIONS.find((s) => s.key === selected[0])
    : null;

  const isAnyLoading = plLoading || cfLoading || bsLoading || ratiosLoading;

  return (
    <div>
      {/* Title */}
      <h2 className="text-2xl font-heading font-bold text-strategy-blue mb-8">
        {t('fin.reports.title')}
      </h2>

      {/* Controls row */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Multi-select dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 h-10 px-4 border border-border rounded-lg text-sm bg-card hover:border-strategy-blue/40 transition-colors min-w-[280px]"
          >
            {selected.length === 0 ? (
              <span className="text-muted-foreground">{t('fin.reports.selectSections')}</span>
            ) : (
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {firstSelected && (
                  <span className="inline-flex items-center gap-1 bg-strategy-blue text-white text-xs font-medium px-2.5 py-1 rounded-full">
                    {t(firstSelected.labelKey)}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeSection(firstSelected.key); }}
                      className="ml-0.5 hover:bg-white/20 rounded-full p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {selected.length > 1 && (
                  <span className="text-xs font-medium text-strategy-blue bg-strategy-blue/10 px-2 py-1 rounded-full">
                    + {selected.length - 1}
                  </span>
                )}
              </div>
            )}
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-full bg-card border border-border rounded-lg shadow-lg z-20 py-1">
              {REPORT_SECTIONS.map((section) => (
                <button
                  key={section.key}
                  onClick={() => toggleSection(section.key)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                    selected.includes(section.key)
                      ? 'bg-strategy-blue/5 text-strategy-blue font-medium'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  {t(section.labelKey)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Recalculate button */}
        <Button
          variant="outline"
          className="rounded-full px-6 text-strategy-blue border-strategy-blue hover:bg-strategy-blue/5"
          disabled={recalculate.isPending}
          onClick={handleRecalculate}
        >
          {recalculate.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : null}
          {t('fin.reports.preview')}
        </Button>
        <Button
          className="rounded-full px-6"
          disabled={selected.length === 0}
        >
          {t('fin.reports.download')}
        </Button>
      </div>

      {/* Year selector */}
      {selected.length > 0 && (
        <YearTabBar
          projectionYears={projectionYears}
          activeYear={activeYear}
          onYearChange={setActiveYear}
          className="mb-8"
        />
      )}

      {/* Loading */}
      {isAnyLoading && selected.length > 0 && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-strategy-blue mr-3" />
          <span className="text-sm text-muted-foreground">{t('fin.reports.previewPlaceholder')}</span>
        </div>
      )}

      {/* Profit & Loss Statement */}
      {showIncome && profitLoss && !plLoading && (
        <StatementTable
          title={t('fin.reports.sectionIncome')}
          sections={[
            ...profitLoss.revenue,
            ...profitLoss.costOfGoodsSold,
            profitLoss.grossProfit,
            ...profitLoss.payroll,
            ...profitLoss.salesExpenses,
            ...profitLoss.adminExpenses,
            profitLoss.depreciation,
            profitLoss.totalOperatingExpenses,
            profitLoss.ebit,
            profitLoss.interestExpense,
            profitLoss.netIncome,
          ]}
        />
      )}

      {/* Cash Flow Statement */}
      {showCashflow && cashFlow && !cfLoading && (
        <StatementTable
          title={t('fin.reports.sectionCashflow')}
          sections={[
            ...cashFlow.cashInflows,
            ...cashFlow.cashOutflows,
            cashFlow.netCashFlow,
            cashFlow.cumulativeCashFlow,
          ]}
        />
      )}

      {/* Balance Sheet */}
      {showBalance && balanceSheet && !bsLoading && (
        <StatementTable
          title={t('fin.reports.sectionBalance')}
          sections={[
            ...balanceSheet.assets,
            balanceSheet.totalAssets,
            ...balanceSheet.liabilities,
            balanceSheet.totalLiabilities,
            ...balanceSheet.equity,
            balanceSheet.totalEquity,
            balanceSheet.totalLiabilitiesAndEquity,
          ]}
        />
      )}

      {/* Ratios */}
      {showRatios && ratios && !ratiosLoading && (
        <div className="bg-card border border-border rounded-2xl p-6 mb-6">
          <h3 className="text-lg font-heading font-bold text-foreground mb-4">
            {t('fin.reports.sectionRatios')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <RatioCard label={language === 'fr' ? 'Ratio d\'endettement' : 'Debt Ratio'} value={`${(ratios.debtRatio * 100).toFixed(1)}%`} />
            <RatioCard label={language === 'fr' ? 'Ratio de liquidité' : 'Liquidity Ratio'} value={ratios.liquidityRatio.toFixed(2)} />
            <RatioCard label={language === 'fr' ? 'Marge brute' : 'Gross Margin'} value={`${(ratios.grossMargin * 100).toFixed(1)}%`} />
            <RatioCard label={language === 'fr' ? 'Marge nette' : 'Net Margin'} value={`${(ratios.netMargin * 100).toFixed(1)}%`} />
            <RatioCard label={language === 'fr' ? 'Fonds de roulement' : 'Working Capital Ratio'} value={ratios.workingCapitalRatio.toFixed(2)} />
            <RatioCard
              label={language === 'fr' ? 'Seuil de rentabilité' : 'Break-even Month'}
              value={ratios.breakEvenMonth ? `${language === 'fr' ? 'Mois' : 'Month'} ${ratios.breakEvenMonth}` : 'N/A'}
            />
          </div>
        </div>
      )}

      {/* Empty state */}
      {selected.length === 0 && (
        <div className="border border-dashed border-border rounded-2xl p-12 text-center text-muted-foreground">
          <p className="text-sm">{t('fin.reports.previewPlaceholder')}</p>
        </div>
      )}
    </div>
  );
};

export default ReportsSection;

// -- Statement Table --

function StatementTable({ title, sections }: { title: string; sections: StatementLineItem[] }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-6 mb-6 overflow-x-auto">
      <h3 className="text-lg font-heading font-bold text-foreground mb-4">{title}</h3>
      <div className="grid gap-y-0.5" style={{ gridTemplateColumns: 'minmax(200px, 1fr) repeat(12, minmax(60px, 1fr)) minmax(80px, auto)' }}>
        {/* Header */}
        <div className="px-2 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground" />
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className="px-1 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            M{i + 1}
          </div>
        ))}
        <div className="px-1 py-2 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          TOTAL
        </div>

        {/* Rows */}
        {sections.map((line, idx) => (
          <StatementRow key={idx} line={line} />
        ))}
      </div>
    </div>
  );
}

function StatementRow({ line }: { line: StatementLineItem }) {
  const indent = line.indentLevel * 16;
  const isBold = line.isBold || line.isHeader;

  return (
    <>
      <div
        className={`px-2 py-1.5 text-sm self-center truncate ${isBold ? 'font-bold text-foreground' : 'text-muted-foreground'}`}
        style={{ paddingLeft: `${8 + indent}px` }}
      >
        {line.label}
      </div>
      {line.monthlyValues.map((val, i) => (
        <div key={i} className="px-0.5 py-0.5">
          <div className={`rounded h-8 flex items-center justify-center text-xs ${
            isBold
              ? 'bg-blue-50 dark:bg-blue-900/20 font-bold text-foreground'
              : 'text-foreground'
          }`}>
            {fmtCell(val)}
          </div>
        </div>
      ))}
      <div className="px-0.5 py-0.5">
        <div className={`rounded h-8 flex items-center justify-center text-xs ${
          isBold
            ? 'bg-blue-100 dark:bg-blue-900/30 font-bold text-foreground'
            : 'bg-blue-50/50 dark:bg-blue-900/10 text-foreground'
        }`}>
          {fmtCell(line.annualTotal)}
        </div>
      </div>
    </>
  );
}

function RatioCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border rounded-xl p-4 bg-card">
      <div className="text-xs font-medium text-muted-foreground mb-1">{label}</div>
      <div className="text-xl font-bold text-foreground">{value}</div>
    </div>
  );
}
