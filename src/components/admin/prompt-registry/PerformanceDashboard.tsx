import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  RefreshCw,
  Loader2,
  AlertCircle,
  ChevronRight,
  Star,
  Trophy,
  Flame,
  Award,
  ArrowUpRight,
  X,
} from 'lucide-react';
import { promptRegistryService } from '../../../lib/prompt-registry-service';
import {
  PromptPerformanceSummaryDto,
  PromptPerformanceDto,
  TopPerformerDto,
  SectionPerformanceDto,
} from '../../../types/prompt-registry';
import { PromptMetricsCard, PromptMetricsMini } from './PromptMetricsCard';
import { UsageTrendChart, AcceptanceRateGauge } from './UsageTrendChart';
import { cn } from '../../../lib/utils';

interface PerformanceDashboardProps {
  isOpen: boolean;
  onClose: () => void;
  promptId?: string;
  promptName?: string;
  language?: 'en' | 'fr';
}

export const PerformanceDashboard: React.FC<PerformanceDashboardProps> = ({
  isOpen,
  onClose,
  promptId,
  promptName,
  language = 'en',
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<PromptPerformanceSummaryDto | null>(null);
  const [promptPerformance, setPromptPerformance] = useState<PromptPerformanceDto | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'sections' | 'top'>('overview');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (promptId) {
        // Load specific prompt performance
        const data = await promptRegistryService.getPerformance(promptId);
        setPromptPerformance(data);
      } else {
        // Load overall summary
        const data = await promptRegistryService.getPerformanceSummary();
        setSummary(data);
      }
    } catch (err: any) {
      console.error('Error loading performance data:', err);
      // Check if it's a 404 (endpoint not implemented yet)
      if (err?.response?.status === 404) {
        setError(language === 'fr'
          ? 'Les données de performance ne sont pas encore disponibles. Cette fonctionnalité sera bientôt activée.'
          : 'Performance data is not yet available. This feature will be enabled soon.');
      } else {
        setError(err.message || 'Failed to load performance data');
      }
    } finally {
      setLoading(false);
    }
  }, [promptId, language]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  if (!isOpen) return null;

  const t = {
    title: language === 'fr' ? 'Tableau de bord de performance' : 'Performance Dashboard',
    overview: language === 'fr' ? 'Vue d\'ensemble' : 'Overview',
    sections: language === 'fr' ? 'Par section' : 'By Section',
    topPerformers: language === 'fr' ? 'Meilleurs prompts' : 'Top Performers',
    totalPrompts: language === 'fr' ? 'Prompts totaux' : 'Total Prompts',
    activePrompts: language === 'fr' ? 'Prompts actifs' : 'Active Prompts',
    totalUsage: language === 'fr' ? 'Utilisations totales' : 'Total Usage',
    avgRating: language === 'fr' ? 'Note moyenne' : 'Avg Rating',
    acceptanceRate: language === 'fr' ? 'Taux d\'acceptation' : 'Acceptance Rate',
    editRate: language === 'fr' ? 'Taux d\'édition' : 'Edit Rate',
    regenerateRate: language === 'fr' ? 'Taux de régénération' : 'Regenerate Rate',
    usageTrends: language === 'fr' ? 'Tendances d\'utilisation' : 'Usage Trends',
    mostUsed: language === 'fr' ? 'Les plus utilisés' : 'Most Used',
    highestRated: language === 'fr' ? 'Les mieux notés' : 'Highest Rated',
    loading: language === 'fr' ? 'Chargement...' : 'Loading...',
    refresh: language === 'fr' ? 'Actualiser' : 'Refresh',
    noData: language === 'fr' ? 'Aucune donnée disponible' : 'No data available',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-xl bg-white dark:bg-zinc-900 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                  {promptName ? `${t.title}: ${promptName}` : t.title}
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {promptId
                    ? (language === 'fr' ? 'Métriques détaillées du prompt' : 'Detailed prompt metrics')
                    : (language === 'fr' ? 'Vue d\'ensemble de tous les prompts' : 'Overview of all prompts')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={loadData}
                disabled={loading}
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
                title={t.refresh}
              >
                <RefreshCw className={cn('w-5 h-5 text-zinc-500', loading && 'animate-spin')} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>
          </div>

          {/* Tabs (for summary view only) */}
          {!promptId && (
            <div className="flex gap-1 px-6 pt-4 border-b border-zinc-200 dark:border-zinc-700">
              {(['overview', 'sections', 'top'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={cn(
                    'px-4 py-2 text-sm font-medium rounded-t-lg transition-colors',
                    selectedTab === tab
                      ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white border-b-2 border-emerald-500'
                      : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
                  )}
                >
                  {tab === 'overview' && t.overview}
                  {tab === 'sections' && t.sections}
                  {tab === 'top' && t.topPerformers}
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                <p className="mt-4 text-sm text-zinc-500">{t.loading}</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16">
                <AlertCircle className="w-8 h-8 text-red-500" />
                <p className="mt-4 text-sm text-red-500">{error}</p>
              </div>
            ) : promptId && promptPerformance ? (
              <PromptPerformanceView performance={promptPerformance} language={language} />
            ) : summary ? (
              <>
                {selectedTab === 'overview' && (
                  <SummaryOverview summary={summary} language={language} t={t} />
                )}
                {selectedTab === 'sections' && (
                  <SectionPerformanceView sections={summary.performanceBySection} language={language} />
                )}
                {selectedTab === 'top' && (
                  <TopPerformersView summary={summary} language={language} t={t} />
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <BarChart3 className="w-8 h-8 text-zinc-400" />
                <p className="mt-4 text-sm text-zinc-500">{t.noData}</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Summary Overview Component
const SummaryOverview: React.FC<{
  summary: PromptPerformanceSummaryDto;
  language: string;
  t: Record<string, string>;
}> = ({ summary, language, t }) => (
  <div className="space-y-6">
    {/* Key Metrics */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <PromptMetricsCard
        type="active"
        value={summary.totalPrompts}
        label={t.totalPrompts}
        subtitle={`${summary.activePrompts} ${language === 'fr' ? 'actifs' : 'active'}`}
      />
      <PromptMetricsCard
        type="usage"
        value={summary.totalUsage}
        label={t.totalUsage}
      />
      <PromptMetricsCard
        type="rating"
        value={summary.overallAverageRating}
        label={t.avgRating}
        format="rating"
      />
      <PromptMetricsCard
        type="acceptance"
        value={summary.overallAcceptanceRate}
        label={t.acceptanceRate}
        format="percent"
      />
    </div>

    {/* Acceptance & Edit/Regenerate Rates */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="flex justify-center p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
        <AcceptanceRateGauge
          rate={summary.overallAcceptanceRate}
          label={t.acceptanceRate}
        />
      </div>
      <div className="flex justify-center p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
        <AcceptanceRateGauge
          rate={1 - summary.overallEditRate}
          label={language === 'fr' ? 'Sans édition' : 'No Edits'}
        />
      </div>
      <div className="flex justify-center p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
        <AcceptanceRateGauge
          rate={1 - summary.overallRegenerateRate}
          label={language === 'fr' ? 'Sans régénération' : 'No Regeneration'}
        />
      </div>
    </div>

    {/* Usage Trends Chart */}
    <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
      <UsageTrendChart
        data={summary.usageTrends}
        title={t.usageTrends}
        height={280}
      />
    </div>
  </div>
);

// Section Performance View
const SectionPerformanceView: React.FC<{
  sections: SectionPerformanceDto[];
  language: string;
}> = ({ sections, language }) => (
  <div className="space-y-4">
    {sections.length === 0 ? (
      <p className="text-center text-zinc-500 py-8">
        {language === 'fr' ? 'Aucune donnée de section' : 'No section data'}
      </p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-700">
              <th className="pb-3 font-medium">{language === 'fr' ? 'Section' : 'Section'}</th>
              <th className="pb-3 font-medium text-right">{language === 'fr' ? 'Prompts' : 'Prompts'}</th>
              <th className="pb-3 font-medium text-right">{language === 'fr' ? 'Utilisations' : 'Usage'}</th>
              <th className="pb-3 font-medium text-right">{language === 'fr' ? 'Note' : 'Rating'}</th>
              <th className="pb-3 font-medium text-right">{language === 'fr' ? 'Acceptation' : 'Acceptance'}</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((section, idx) => (
              <motion.tr
                key={section.sectionType}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="border-b border-zinc-100 dark:border-zinc-800"
              >
                <td className="py-3">
                  <span className="font-medium text-zinc-900 dark:text-white">
                    {section.sectionTypeName}
                  </span>
                </td>
                <td className="py-3 text-right text-zinc-600 dark:text-zinc-400">
                  {section.promptCount}
                </td>
                <td className="py-3 text-right text-zinc-600 dark:text-zinc-400">
                  {section.usageCount.toLocaleString()}
                </td>
                <td className="py-3 text-right">
                  <span className="flex items-center justify-end gap-1">
                    {section.averageRating.toFixed(1)}
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  </span>
                </td>
                <td className="py-3 text-right">
                  <span className={cn(
                    'px-2 py-0.5 text-xs font-medium rounded-full',
                    section.acceptanceRate >= 0.8
                      ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                      : section.acceptanceRate >= 0.6
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                  )}>
                    {(section.acceptanceRate * 100).toFixed(0)}%
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

// Top Performers View
const TopPerformersView: React.FC<{
  summary: PromptPerformanceSummaryDto;
  language: string;
  t: Record<string, string>;
}> = ({ summary, language, t }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
    {/* Most Used */}
    <TopPerformerList
      title={t.mostUsed}
      icon={<Flame className="w-4 h-4 text-orange-500" />}
      items={summary.mostUsedPrompts}
      metricKey="usageCount"
      metricLabel={language === 'fr' ? 'utilisations' : 'uses'}
    />

    {/* Highest Rated */}
    <TopPerformerList
      title={t.highestRated}
      icon={<Star className="w-4 h-4 text-yellow-500" />}
      items={summary.highestRatedPrompts}
      metricKey="averageRating"
      metricLabel={language === 'fr' ? 'note' : 'rating'}
      formatMetric={(v) => v.toFixed(1)}
    />

    {/* Best Acceptance */}
    <TopPerformerList
      title={language === 'fr' ? 'Meilleure acceptation' : 'Best Acceptance'}
      icon={<Trophy className="w-4 h-4 text-emerald-500" />}
      items={summary.topPerformingPrompts}
      metricKey="acceptanceRate"
      metricLabel={language === 'fr' ? 'acceptation' : 'acceptance'}
      formatMetric={(v) => `${(v * 100).toFixed(0)}%`}
    />
  </div>
);

// Top Performer List Component
const TopPerformerList: React.FC<{
  title: string;
  icon: React.ReactNode;
  items: TopPerformerDto[];
  metricKey: keyof TopPerformerDto;
  metricLabel: string;
  formatMetric?: (value: number) => string;
}> = ({ title, icon, items, metricKey, metricLabel, formatMetric }) => (
  <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
    <div className="flex items-center gap-2 mb-4">
      {icon}
      <h3 className="font-medium text-zinc-900 dark:text-white">{title}</h3>
    </div>
    <div className="space-y-3">
      {items.slice(0, 5).map((item, idx) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.05 }}
          className="flex items-center gap-3"
        >
          <span className={cn(
            'w-6 h-6 flex items-center justify-center text-xs font-bold rounded-full',
            idx === 0 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400' :
            idx === 1 ? 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300' :
            idx === 2 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
            'bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400'
          )}>
            {idx + 1}
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">
              {item.name}
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
              {item.sectionTypeName}
            </p>
          </div>
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            {formatMetric
              ? formatMetric(item[metricKey] as number)
              : (item[metricKey] as number).toLocaleString()
            }
            <span className="text-xs text-zinc-400 ml-1">{metricLabel}</span>
          </span>
        </motion.div>
      ))}
    </div>
  </div>
);

// Individual Prompt Performance View
const PromptPerformanceView: React.FC<{
  performance: PromptPerformanceDto;
  language: string;
}> = ({ performance, language }) => (
  <div className="space-y-6">
    {/* Key Metrics */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <PromptMetricsCard
        type="usage"
        value={performance.totalUsageCount}
        label={language === 'fr' ? 'Utilisations' : 'Total Usage'}
      />
      <PromptMetricsCard
        type="acceptance"
        value={performance.acceptanceRate}
        label={language === 'fr' ? 'Taux d\'acceptation' : 'Acceptance Rate'}
        format="percent"
      />
      <PromptMetricsCard
        type="edit"
        value={performance.editRate}
        label={language === 'fr' ? 'Taux d\'édition' : 'Edit Rate'}
        format="percent"
      />
      <PromptMetricsCard
        type="rating"
        value={performance.averageRating}
        label={language === 'fr' ? 'Note moyenne' : 'Avg Rating'}
        format="rating"
      />
    </div>

    {/* Performance Over Time */}
    {performance.periods && performance.periods.length > 0 && (
      <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl">
        <UsageTrendChart
          data={performance.periods.map(p => ({
            date: p.periodStart,
            usageCount: p.usageCount,
            acceptCount: p.acceptCount,
            editCount: p.editCount,
            regenerateCount: p.regenerateCount,
          }))}
          title={language === 'fr' ? 'Performance dans le temps' : 'Performance Over Time'}
          height={280}
        />
      </div>
    )}

    {/* Detailed Stats */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-center">
        <p className="text-2xl font-bold text-zinc-900 dark:text-white">
          {performance.totalAcceptCount.toLocaleString()}
        </p>
        <p className="text-sm text-zinc-500">{language === 'fr' ? 'Acceptés' : 'Accepted'}</p>
      </div>
      <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-center">
        <p className="text-2xl font-bold text-zinc-900 dark:text-white">
          {performance.totalEditCount.toLocaleString()}
        </p>
        <p className="text-sm text-zinc-500">{language === 'fr' ? 'Édités' : 'Edited'}</p>
      </div>
      <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-center">
        <p className="text-2xl font-bold text-zinc-900 dark:text-white">
          {performance.totalRegenerateCount.toLocaleString()}
        </p>
        <p className="text-sm text-zinc-500">{language === 'fr' ? 'Régénérés' : 'Regenerated'}</p>
      </div>
      <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl text-center">
        <p className="text-2xl font-bold text-zinc-900 dark:text-white">
          {performance.totalRatingCount.toLocaleString()}
        </p>
        <p className="text-sm text-zinc-500">{language === 'fr' ? 'Évaluations' : 'Ratings'}</p>
      </div>
    </div>
  </div>
);

export default PerformanceDashboard;
