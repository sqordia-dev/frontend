import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  FlaskConical,
  Loader2,
  Trophy,
  BarChart3,
  TrendingUp,
  Shuffle,
  Target,
  Zap,
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { promptRegistryService } from '../../../lib/prompt-registry-service';
import { ABTestingPanel } from '../../../components/admin/prompt-registry';
import type { PromptTemplateListDto } from '../../../types/prompt-registry';
import { cn } from '../../../lib/utils';

interface BanditArm {
  promptId: string;
  promptName: string;
  sectionType: string;
  successes: number;
  failures: number;
  allocationPercent: number;
  estimatedReward: number;
}

export function AIStudioABTestingPage() {
  const { language } = useTheme();
  const [prompts, setPrompts] = useState<PromptTemplateListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'compare' | 'bandit'>('compare');

  const t = {
    title: language === 'fr' ? 'Tests A/B' : 'A/B Testing',
    subtitle: language === 'fr'
      ? 'Comparez deux prompts côte à côte et visualisez la sélection automatique'
      : 'Compare prompts side-by-side and visualize automatic selection',
    back: language === 'fr' ? 'Retour à AI Studio' : 'Back to AI Studio',
    tabCompare: language === 'fr' ? 'Comparaison manuelle' : 'Manual Comparison',
    tabBandit: language === 'fr' ? 'Sélection automatique' : 'Auto Selection',
    banditTitle: language === 'fr' ? 'Thompson Sampling - Allocation du trafic' : 'Thompson Sampling - Traffic Allocation',
    banditDesc: language === 'fr'
      ? 'Le système alloue automatiquement plus de trafic aux prompts les plus performants via un algorithme bandit multi-bras'
      : 'The system automatically allocates more traffic to top-performing prompts via a multi-armed bandit algorithm',
    sectionType: language === 'fr' ? 'Type de section' : 'Section Type',
    prompt: language === 'fr' ? 'Prompt' : 'Prompt',
    allocation: language === 'fr' ? 'Allocation' : 'Allocation',
    reward: language === 'fr' ? 'Récompense estimée' : 'Estimated Reward',
    successes: language === 'fr' ? 'Succès' : 'Successes',
    trials: language === 'fr' ? 'Essais' : 'Trials',
    topPerformer: language === 'fr' ? 'Meilleur performant' : 'Top Performer',
    totalTrials: language === 'fr' ? 'Total essais' : 'Total Trials',
    activeSections: language === 'fr' ? 'Sections actives' : 'Active Sections',
    avgReward: language === 'fr' ? 'Récompense moyenne' : 'Avg Reward',
    noData: language === 'fr'
      ? 'Aucune donnée de bandit disponible. Les données apparaîtront après les premières générations.'
      : 'No bandit data available. Data will appear after first generations.',
  };

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    setLoading(true);
    try {
      const result = await promptRegistryService.getAll({ pageSize: 100, isActive: true });
      setPrompts(result.items);
    } catch (err) {
      console.error('Error loading prompts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Derive bandit arms from prompt usage data (Thompson Sampling simulation)
  const banditArms = useMemo((): BanditArm[] => {
    if (!prompts.length) return [];

    const arms: BanditArm[] = prompts
      .filter(p => p.totalUsageCount > 0)
      .map(p => {
        const successes = Math.round(p.totalUsageCount * (p.acceptanceRate || 0.5));
        const failures = p.totalUsageCount - successes;
        // Beta distribution mean = alpha / (alpha + beta)
        const alpha = successes + 1;
        const beta = failures + 1;
        const estimatedReward = alpha / (alpha + beta);
        return {
          promptId: p.id,
          promptName: p.name,
          sectionType: p.sectionTypeName || String(p.sectionType) || 'Unknown',
          successes,
          failures,
          allocationPercent: 0,
          estimatedReward,
        };
      });

    // Group by section type and compute allocation within each group
    const groups: Record<string, BanditArm[]> = {};
    arms.forEach(arm => {
      if (!groups[arm.sectionType]) groups[arm.sectionType] = [];
      groups[arm.sectionType].push(arm);
    });

    Object.values(groups).forEach(group => {
      const totalReward = group.reduce((sum, a) => sum + a.estimatedReward, 0);
      group.forEach(arm => {
        arm.allocationPercent = totalReward > 0 ? (arm.estimatedReward / totalReward) * 100 : 100 / group.length;
      });
    });

    return arms.sort((a, b) => b.estimatedReward - a.estimatedReward);
  }, [prompts]);

  const banditStats = useMemo(() => {
    if (!banditArms.length) return null;
    const totalTrials = banditArms.reduce((s, a) => s + a.successes + a.failures, 0);
    const sections = new Set(banditArms.map(a => a.sectionType)).size;
    const avgReward = banditArms.reduce((s, a) => s + a.estimatedReward, 0) / banditArms.length;
    const topPerformer = banditArms[0];
    return { totalTrials, sections, avgReward, topPerformer };
  }, [banditArms]);

  const sectionGroups = useMemo(() => {
    const groups: Record<string, BanditArm[]> = {};
    banditArms.forEach(arm => {
      if (!groups[arm.sectionType]) groups[arm.sectionType] = [];
      groups[arm.sectionType].push(arm);
    });
    return groups;
  }, [banditArms]);

  const tabs = [
    { key: 'compare' as const, label: t.tabCompare, icon: FlaskConical },
    { key: 'bandit' as const, label: t.tabBandit, icon: Shuffle },
  ];

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-800 dark:via-slate-900 dark:to-black p-6 md:p-8"
      >
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }} />
        </div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/admin/ai-studio" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <FlaskConical className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{t.title}</h1>
              <p className="text-slate-400 mt-1">{t.subtitle}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
              activeTab === tab.key
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-orange-300 dark:hover:border-orange-700'
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </div>
      ) : activeTab === 'compare' ? (
        <ABTestingPanel
          isOpen={true}
          onClose={() => {}}
          prompts={prompts}
          language={language as 'en' | 'fr'}
          embedded={true}
        />
      ) : (
        <div className="space-y-6">
          {/* Bandit Stats Overview */}
          {banditStats ? (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.topPerformer}</span>
                    <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
                      <Trophy className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{banditStats.topPerformer.promptName}</p>
                  <p className="text-xs text-gray-500 mt-1">{(banditStats.topPerformer.estimatedReward * 100).toFixed(0)}% {t.reward.toLowerCase()}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.totalTrials}</span>
                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{banditStats.totalTrials.toLocaleString()}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.activeSections}</span>
                    <div className="w-8 h-8 rounded-lg bg-purple-500 flex items-center justify-center">
                      <Target className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{banditStats.sections}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{t.avgReward}</span>
                    <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{(banditStats.avgReward * 100).toFixed(1)}%</p>
                </motion.div>
              </div>

              {/* Description */}
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/30 rounded-2xl p-4 flex items-start gap-3">
                <Zap className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-300">{t.banditTitle}</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">{t.banditDesc}</p>
                </div>
              </div>

              {/* Bandit Arms by Section */}
              <div className="space-y-4">
                {Object.entries(sectionGroups).map(([section, arms], groupIdx) => (
                  <motion.div
                    key={section}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: groupIdx * 0.05 }}
                    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
                  >
                    <div className="px-5 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{section}</h3>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {arms.sort((a, b) => b.allocationPercent - a.allocationPercent).map((arm, idx) => (
                        <div key={arm.promptId} className="px-5 py-3 flex items-center gap-4">
                          {/* Rank */}
                          <div className={cn(
                            'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0',
                            idx === 0
                              ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                          )}>
                            {idx + 1}
                          </div>

                          {/* Prompt Name */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{arm.promptName}</p>
                            <p className="text-xs text-gray-500">
                              {arm.successes + arm.failures} {t.trials} &middot; {arm.successes} {t.successes}
                            </p>
                          </div>

                          {/* Reward */}
                          <div className="text-right flex-shrink-0 w-20">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">
                              {(arm.estimatedReward * 100).toFixed(1)}%
                            </p>
                            <p className="text-[10px] text-gray-400 uppercase">{t.reward}</p>
                          </div>

                          {/* Allocation Bar */}
                          <div className="w-32 flex-shrink-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[10px] text-gray-400 uppercase">{t.allocation}</span>
                              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {arm.allocationPercent.toFixed(0)}%
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all',
                                  idx === 0
                                    ? 'bg-gradient-to-r from-amber-400 to-orange-500'
                                    : 'bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500'
                                )}
                                style={{ width: `${arm.allocationPercent}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-16">
              <FlaskConical className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">{t.noData}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AIStudioABTestingPage;
