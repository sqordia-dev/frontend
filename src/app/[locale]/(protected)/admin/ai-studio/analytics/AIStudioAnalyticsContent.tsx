'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Star,
  RefreshCw,
  Loader2,
  CheckCircle,
  Edit3,
  RotateCcw,
} from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { promptRegistryService } from '@/lib/prompt-registry-service';
import { cn } from '@/lib/utils';
import type { PromptPerformanceSummaryDto } from '@/types/prompt-registry';

const MetricCard: React.FC<{
  label: string;
  value: string;
  subValue?: string;
  icon: React.ElementType;
  color: string;
  trend?: number;
}> = ({ label, value, subValue, icon: Icon, color, trend }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5"
  >
    <div className="flex items-start justify-between mb-3">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', color)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      {trend !== undefined && (
        <span className={cn(
          'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
          trend >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        )}>
          {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-zinc-900 dark:text-white mb-1">{value}</p>
    <p className="text-sm text-zinc-500">{label}</p>
    {subValue && <p className="text-xs text-zinc-400 mt-1">{subValue}</p>}
  </motion.div>
);

export default function AIStudioAnalyticsContent({ locale }: { locale: string }) {
  const { language } = useTheme();
  const [summary, setSummary] = useState<PromptPerformanceSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);

  const t = {
    title: language === 'fr' ? 'Analytics' : 'Analytics',
    subtitle: language === 'fr'
      ? 'Analysez les performances de vos prompts IA'
      : 'Analyze the performance of your AI prompts',
    back: language === 'fr' ? 'Retour a AI Studio' : 'Back to AI Studio',
    refresh: language === 'fr' ? 'Actualiser' : 'Refresh',
    totalPrompts: language === 'fr' ? 'Total Prompts' : 'Total Prompts',
    activePrompts: language === 'fr' ? 'Prompts Actifs' : 'Active Prompts',
    totalUsage: language === 'fr' ? 'Utilisations Totales' : 'Total Usage',
    acceptanceRate: language === 'fr' ? 'Taux d\'Acceptation' : 'Acceptance Rate',
    editRate: language === 'fr' ? 'Taux d\'Edition' : 'Edit Rate',
    regenerateRate: language === 'fr' ? 'Taux de Regeneration' : 'Regenerate Rate',
    avgRating: language === 'fr' ? 'Note Moyenne' : 'Average Rating',
    topPerformers: language === 'fr' ? 'Meilleurs Performeurs' : 'Top Performers',
    mostUsed: language === 'fr' ? 'Plus Utilises' : 'Most Used',
    highestRated: language === 'fr' ? 'Mieux Notes' : 'Highest Rated',
    bySection: language === 'fr' ? 'Par Section' : 'By Section',
  };

  const loadSummary = async () => {
    setLoading(true);
    try {
      const data = await promptRegistryService.getPerformanceSummary();
      setSummary(data);
    } catch (err) {
      console.error('Error loading summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-800 dark:via-slate-900 dark:to-black p-6 md:p-8"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }} />
        </div>

        {/* Gradient orbs */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/ai-studio"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{t.title}</h1>
              <p className="text-slate-400 mt-1">{t.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadSummary}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
              {t.refresh}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <div>
        {loading && !summary ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
          </div>
        ) : summary ? (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                label={t.totalPrompts}
                value={String(summary.totalPrompts)}
                icon={Activity}
                color="bg-blue-500"
              />
              <MetricCard
                label={t.activePrompts}
                value={String(summary.activePrompts)}
                icon={CheckCircle}
                color="bg-green-500"
              />
              <MetricCard
                label={t.totalUsage}
                value={summary.totalUsage.toLocaleString()}
                icon={TrendingUp}
                color="bg-purple-500"
              />
              <MetricCard
                label={t.acceptanceRate}
                value={`${(summary.overallAcceptanceRate * 100).toFixed(1)}%`}
                icon={Target}
                color="bg-orange-500"
              />
            </div>

            {/* Secondary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <MetricCard
                label={t.editRate}
                value={`${(summary.overallEditRate * 100).toFixed(1)}%`}
                subValue={language === 'fr' ? 'Utilisateurs modifiant le contenu' : 'Users editing content'}
                icon={Edit3}
                color="bg-amber-500"
              />
              <MetricCard
                label={t.regenerateRate}
                value={`${(summary.overallRegenerateRate * 100).toFixed(1)}%`}
                subValue={language === 'fr' ? 'Demandes de regeneration' : 'Regeneration requests'}
                icon={RotateCcw}
                color="bg-red-500"
              />
              <MetricCard
                label={t.avgRating}
                value={summary.overallAverageRating.toFixed(1)}
                subValue="/5.0"
                icon={Star}
                color="bg-yellow-500"
              />
            </div>

            {/* Top Performers Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Top Performing */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                  {t.topPerformers}
                </h3>
                <div className="space-y-3">
                  {summary.topPerformingPrompts.slice(0, 5).map((p, i) => (
                    <Link
                      key={p.id}
                      href={`/admin/ai-studio/prompts/${p.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <span className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{p.name}</p>
                        <p className="text-xs text-zinc-500">{p.sectionTypeName}</p>
                      </div>
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        {(p.acceptanceRate * 100).toFixed(0)}%
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Most Used */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-purple-500" />
                  {t.mostUsed}
                </h3>
                <div className="space-y-3">
                  {summary.mostUsedPrompts.slice(0, 5).map((p, i) => (
                    <Link
                      key={p.id}
                      href={`/admin/ai-studio/prompts/${p.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <span className="w-6 h-6 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{p.name}</p>
                        <p className="text-xs text-zinc-500">{p.sectionTypeName}</p>
                      </div>
                      <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                        {p.usageCount.toLocaleString()}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Highest Rated */}
              <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
                <h3 className="font-semibold text-zinc-900 dark:text-white mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-amber-500" />
                  {t.highestRated}
                </h3>
                <div className="space-y-3">
                  {summary.highestRatedPrompts.slice(0, 5).map((p, i) => (
                    <Link
                      key={p.id}
                      href={`/admin/ai-studio/prompts/${p.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                    >
                      <span className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-bold flex items-center justify-center">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-zinc-900 dark:text-white truncate">{p.name}</p>
                        <p className="text-xs text-zinc-500">{p.sectionTypeName}</p>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400">
                        <Star className="w-3 h-3 fill-current" />
                        {p.averageRating.toFixed(1)}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Performance by Section */}
            <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
              <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">{t.bySection}</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-700">
                      <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider pb-3">Section</th>
                      <th className="text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider pb-3">Prompts</th>
                      <th className="text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider pb-3">Usage</th>
                      <th className="text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider pb-3">Acceptance</th>
                      <th className="text-right text-xs font-semibold text-zinc-500 uppercase tracking-wider pb-3">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {summary.performanceBySection.map(section => (
                      <tr key={section.sectionType} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                        <td className="py-3 text-sm font-medium text-zinc-900 dark:text-white">{section.sectionTypeName}</td>
                        <td className="py-3 text-sm text-zinc-600 dark:text-zinc-400 text-right">{section.promptCount}</td>
                        <td className="py-3 text-sm text-zinc-600 dark:text-zinc-400 text-right">{section.usageCount.toLocaleString()}</td>
                        <td className="py-3 text-sm text-right">
                          <span className={cn(
                            'font-medium',
                            section.acceptanceRate >= 0.7 ? 'text-green-600' : section.acceptanceRate >= 0.5 ? 'text-amber-600' : 'text-red-600'
                          )}>
                            {(section.acceptanceRate * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="py-3 text-sm text-zinc-600 dark:text-zinc-400 text-right">{section.averageRating.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 text-zinc-500">
            {language === 'fr' ? 'Erreur lors du chargement des donnees' : 'Error loading data'}
          </div>
        )}
      </div>
    </div>
  );
}
