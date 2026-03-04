import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  FileText,
  BarChart3,
  FlaskConical,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  Zap,
  Brain,
  Activity,
  Target,
  Loader2,
  Settings2,
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { promptRegistryService } from '../../../lib/prompt-registry-service';
import { cn } from '../../../lib/utils';

interface DashboardStats {
  totalPrompts: number;
  activePrompts: number;
  totalUsage: number;
  avgAcceptanceRate: number;
  avgRating: number;
}

interface RecentActivity {
  id: string;
  action: string;
  promptName: string;
  timestamp: string;
  type: 'created' | 'updated' | 'activated' | 'tested';
}

const FeatureCard: React.FC<{
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  gradient: string;
  stats?: string;
  badge?: string;
}> = ({ title, description, icon: Icon, href, gradient, stats, badge }) => (
  <Link to={href}>
    <motion.div
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-xl hover:border-transparent transition-all duration-300 overflow-hidden"
    >
      {/* Gradient Background on Hover */}
      <div className={cn(
        'absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300',
        gradient
      )} />

      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center',
            gradient
          )}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {badge && (
            <span className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
              {badge}
            </span>
          )}
        </div>

        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-orange-500 group-hover:to-amber-500 transition-all">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
          {description}
        </p>

        <div className="flex items-center justify-between">
          {stats && (
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
              {stats}
            </span>
          )}
          <div className="flex items-center gap-1 text-sm font-medium text-orange-500 group-hover:gap-2 transition-all">
            Open
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </motion.div>
  </Link>
);

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ElementType;
  trend?: number;
  color: string;
}> = ({ label, value, icon: Icon, trend, color }) => (
  <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </span>
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', color)}>
        <Icon className="w-4 h-4 text-white" />
      </div>
    </div>
    <div className="flex items-end justify-between">
      <span className="text-2xl font-bold text-gray-900 dark:text-white">
        {value}
      </span>
      {trend !== undefined && (
        <span className={cn(
          'flex items-center gap-0.5 text-xs font-medium',
          trend >= 0 ? 'text-green-500' : 'text-red-500'
        )}>
          <TrendingUp className={cn('w-3 h-3', trend < 0 && 'rotate-180')} />
          {Math.abs(trend)}%
        </span>
      )}
    </div>
  </div>
);

export function AIStudioDashboard() {
  const { language } = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const t = {
    title: language === 'fr' ? 'AI Studio' : 'AI Studio',
    subtitle: language === 'fr'
      ? 'Gérez vos prompts IA, analysez les performances et optimisez la génération de contenu'
      : 'Manage your AI prompts, analyze performance, and optimize content generation',
    features: language === 'fr' ? 'Fonctionnalités' : 'Features',
    prompts: {
      title: language === 'fr' ? 'Prompts Templates' : 'Prompt Templates',
      desc: language === 'fr'
        ? 'Créez et gérez vos templates de prompts pour chaque section du plan d\'affaires'
        : 'Create and manage prompt templates for each business plan section',
    },
    analytics: {
      title: language === 'fr' ? 'Analytics' : 'Analytics',
      desc: language === 'fr'
        ? 'Analysez les performances, taux d\'acceptation et métriques d\'utilisation'
        : 'Analyze performance, acceptance rates, and usage metrics',
    },
    abTesting: {
      title: language === 'fr' ? 'Tests A/B' : 'A/B Testing',
      desc: language === 'fr'
        ? 'Comparez deux prompts côte à côte et identifiez les plus performants'
        : 'Compare two prompts side-by-side and identify top performers',
    },
    questions: {
      title: language === 'fr' ? 'Prompts Questions' : 'Question Prompts',
      desc: language === 'fr'
        ? 'Gérez les prompts IA et conseils d\'expert pour chaque question du questionnaire'
        : 'Manage AI coach prompts and expert tips for questionnaire questions',
    },
    config: {
      title: language === 'fr' ? 'Configuration IA' : 'AI Configuration',
      desc: language === 'fr'
        ? 'Configurez les fournisseurs IA (OpenAI, Claude, Gemini) et les remplacements par section'
        : 'Configure AI providers (OpenAI, Claude, Gemini) and section-specific overrides',
    },
    stats: {
      totalPrompts: language === 'fr' ? 'Total Prompts' : 'Total Prompts',
      activePrompts: language === 'fr' ? 'Actifs' : 'Active',
      totalUsage: language === 'fr' ? 'Utilisations' : 'Total Usage',
      acceptanceRate: language === 'fr' ? 'Taux Acceptation' : 'Acceptance Rate',
    },
    quickActions: language === 'fr' ? 'Actions Rapides' : 'Quick Actions',
    createPrompt: language === 'fr' ? 'Nouveau Prompt' : 'New Prompt',
    viewAll: language === 'fr' ? 'Voir tout' : 'View All',
  };

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [prompts, summary] = await Promise.all([
        promptRegistryService.getAll({ pageSize: 100 }),
        promptRegistryService.getPerformanceSummary().catch(() => null),
      ]);

      setStats({
        totalPrompts: prompts.totalCount || prompts.items.length,
        activePrompts: prompts.items.filter(p => p.isActive).length,
        totalUsage: summary?.totalUsage || 0,
        avgAcceptanceRate: summary?.overallAcceptanceRate || 0,
        avgRating: summary?.overallAverageRating || 0,
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/25">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {t.title}
              </h1>
              <p className="text-slate-400 mt-1">
                {t.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-medium text-emerald-400">
                {language === 'fr' ? 'Système actif' : 'System Active'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <div>
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 animate-pulse">
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
                <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))
          ) : (
            <>
              <StatCard
                label={t.stats.totalPrompts}
                value={stats?.totalPrompts || 0}
                icon={FileText}
                color="bg-blue-500"
              />
              <StatCard
                label={t.stats.activePrompts}
                value={stats?.activePrompts || 0}
                icon={CheckCircle}
                color="bg-green-500"
              />
              <StatCard
                label={t.stats.totalUsage}
                value={stats?.totalUsage?.toLocaleString() || '0'}
                icon={Activity}
                color="bg-purple-500"
              />
              <StatCard
                label={t.stats.acceptanceRate}
                value={`${((stats?.avgAcceptanceRate || 0) * 100).toFixed(0)}%`}
                icon={Target}
                color="bg-orange-500"
              />
            </>
          )}
        </div>

        {/* Features Grid */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-500" />
            {t.features}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            <FeatureCard
              title={t.prompts.title}
              description={t.prompts.desc}
              icon={FileText}
              href="/admin/ai-studio/prompts"
              gradient="bg-gradient-to-br from-blue-500 to-indigo-600"
              stats={`${stats?.totalPrompts || 0} templates`}
            />
            <FeatureCard
              title={t.analytics.title}
              description={t.analytics.desc}
              icon={BarChart3}
              href="/admin/ai-studio/analytics"
              gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            />
            <FeatureCard
              title={t.abTesting.title}
              description={t.abTesting.desc}
              icon={FlaskConical}
              href="/admin/ai-studio/ab-testing"
              gradient="bg-gradient-to-br from-amber-500 to-orange-600"
              badge="Beta"
            />
            <FeatureCard
              title={t.questions.title}
              description={t.questions.desc}
              icon={MessageSquare}
              href="/admin/ai-studio/questions"
              gradient="bg-gradient-to-br from-purple-500 to-pink-600"
            />
            <FeatureCard
              title={t.config.title}
              description={t.config.desc}
              icon={Settings2}
              href="/admin/ai-studio/config"
              gradient="bg-gradient-to-br from-slate-500 to-gray-600"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            {t.quickActions}
          </h2>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/ai-studio/prompts?action=new"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-medium rounded-xl hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/25"
            >
              <Sparkles className="w-4 h-4" />
              {t.createPrompt}
            </Link>
            <Link
              to="/admin/ai-studio/prompts"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <FileText className="w-4 h-4" />
              {t.viewAll}
            </Link>
            <Link
              to="/admin/ai-studio/analytics"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              {t.analytics.title}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIStudioDashboard;
