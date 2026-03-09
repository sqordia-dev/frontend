import { useEffect, useState, useMemo, useCallback } from 'react';
import { sanitizeHtml } from '../../utils/sanitize';
import { motion } from 'framer-motion';
import {
  Users,
  FileText,
  Activity,
  Building2,
  AlertCircle,
  RefreshCw,
  Bot,
  DollarSign,
  Zap,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Lightbulb,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { adminService } from '../../lib/admin-service';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';
import { SqordiaLoader } from '../../components/ui/SqordiaLoader';

// ─── Types ──────────────────────────────────────────────────────────────────

type Period = 'today' | 'week' | 'month' | '30days';

interface AIUsageData {
  startDate?: string;
  endDate?: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  totalCost: number;
  averageCostPerRequest: number;
  totalTokensUsed: number;
  dailyUsage: Array<{ date: string; requests: number; cost: number; tokens: number }>;
  featureBreakdown: Array<{ feature: string; requests: number; cost: number; averageResponseTime: number }>;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function getDateRange(period: Period): { startDate: string; endDate: string } {
  const now = new Date();
  const end = now.toISOString().split('T')[0];
  let start: Date;

  switch (period) {
    case 'today':
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      break;
    case 'week': {
      start = new Date(now);
      start.setDate(now.getDate() - 7);
      break;
    }
    case 'month': {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    }
    case '30days':
    default:
      start = new Date(now);
      start.setDate(now.getDate() - 30);
      break;
  }

  return { startDate: start.toISOString().split('T')[0], endDate: end };
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

function formatTokens(tokens: number): string {
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(1)}K`;
  return tokens.toLocaleString();
}

function normalizeAIData(raw: any): AIUsageData {
  return {
    startDate: raw?.startDate || raw?.StartDate,
    endDate: raw?.endDate || raw?.EndDate,
    totalRequests: raw?.totalRequests ?? raw?.TotalRequests ?? 0,
    successfulRequests: raw?.successfulRequests ?? raw?.SuccessfulRequests ?? 0,
    failedRequests: raw?.failedRequests ?? raw?.FailedRequests ?? 0,
    totalCost: raw?.totalCost ?? raw?.TotalCost ?? 0,
    averageCostPerRequest: raw?.averageCostPerRequest ?? raw?.AverageCostPerRequest ?? 0,
    totalTokensUsed: raw?.totalTokensUsed ?? raw?.TotalTokensUsed ?? 0,
    dailyUsage: (raw?.dailyUsage || raw?.DailyUsage || []).map((d: any) => ({
      date: d.date || d.Date || '',
      requests: d.requests ?? d.Requests ?? 0,
      cost: d.cost ?? d.Cost ?? 0,
      tokens: d.tokens ?? d.Tokens ?? 0,
    })),
    featureBreakdown: (raw?.featureBreakdown || raw?.FeatureBreakdown || []).map((f: any) => ({
      feature: f.feature || f.Feature || 'Unknown',
      requests: f.requests ?? f.Requests ?? 0,
      cost: f.cost ?? f.Cost ?? 0,
      averageResponseTime: f.averageResponseTime ?? f.AverageResponseTime ?? 0,
    })),
  };
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function AdminMetricsPage() {
  const { t, language, theme } = useTheme();
  const [overview, setOverview] = useState<any>(null);
  const [aiUsage, setAiUsage] = useState<AIUsageData | null>(null);
  const [health, setHealth] = useState<any>(null);
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [period, setPeriod] = useState<Period>('30days');

  // Load all data
  const loadData = useCallback(async () => {
    try {
      setError(null);
      const { startDate, endDate } = getDateRange(period);

      const [overviewRes, aiRes, healthRes, orgsRes] = await Promise.allSettled([
        adminService.getOverview(),
        adminService.getAIUsageStats(startDate, endDate),
        adminService.getSystemHealth(),
        adminService.getOrganizations(),
      ]);

      if (overviewRes.status === 'fulfilled') setOverview(overviewRes.value);
      if (aiRes.status === 'fulfilled') setAiUsage(normalizeAIData(aiRes.value));
      if (healthRes.status === 'fulfilled') setHealth(healthRes.value);
      if (orgsRes.status === 'fulfilled') {
        setOrganizations(Array.isArray(orgsRes.value) ? orgsRes.value : []);
      }

      setLastUpdated(new Date());
    } catch (err: any) {
      setError(err.message || 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  }, [period]);

  // Reload AI data when period changes
  const loadAiData = useCallback(async (p: Period) => {
    try {
      setAiLoading(true);
      const { startDate, endDate } = getDateRange(p);
      const raw = await adminService.getAIUsageStats(startDate, endDate);
      setAiUsage(normalizeAIData(raw));
    } catch {
      // keep existing data on period-switch failure
    } finally {
      setAiLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePeriodChange = (p: Period) => {
    setPeriod(p);
    loadAiData(p);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // ─── Derived data ───────────────────────────────────────────────────────

  const ai = aiUsage;
  const successRate = ai && ai.totalRequests > 0
    ? ((ai.successfulRequests / ai.totalRequests) * 100).toFixed(2)
    : '0';

  // Overview quick stats
  const aiRequestsToday = overview?.aiRequestsToday ?? overview?.AIRequestsToday ?? 0;
  const aiCostToday = overview?.estimatedAICostToday ?? overview?.EstimatedAICostToday ?? 0;
  const aiCostMonth = overview?.estimatedAICostThisMonth ?? overview?.EstimatedAICostThisMonth ?? 0;
  const totalUsers = overview?.totalUsers || 0;
  const newUsersWeek = overview?.newUsersThisWeek || 0;
  const plansCreatedWeek = overview?.businessPlansCreatedThisWeek || 0;
  const activeSessions = overview?.activeSessions || 0;
  const totalOrgs = overview?.totalOrganizations || 0;
  const totalPlans = overview?.totalBusinessPlans || 0;
  const completedPlans = overview?.completedBusinessPlans || 0;
  const inProgressPlans = overview?.inProgressBusinessPlans || 0;
  const draftPlans = Math.max(0, totalPlans - completedPlans - inProgressPlans);

  // Top orgs
  const topOrgs = useMemo(() => {
    return [...organizations]
      .sort((a: any, b: any) => (b.memberCount || b.MemberCount || 0) - (a.memberCount || a.MemberCount || 0))
      .slice(0, 5);
  }, [organizations]);
  const maxMembers = topOrgs.length > 0
    ? Math.max(...topOrgs.map((o: any) => o.memberCount || o.MemberCount || 0))
    : 1;

  // Health
  const healthServices = useMemo(() => {
    if (!health) return [];
    const services = health.services || health.Services || [];
    if (Array.isArray(services) && services.length > 0) return services;
    return [
      { name: 'API Server', status: health.apiStatus || health.ApiStatus || 'unknown' },
      { name: 'Database', status: health.databaseStatus || health.DatabaseStatus || 'unknown' },
      { name: 'AI Services', status: health.aiStatus || health.AiStatus || 'unknown' },
    ].filter(s => s.status !== 'unknown');
  }, [health]);

  // Key takeaways (auto-generated from data)
  const takeaways = useMemo(() => {
    if (!ai) return [];
    const items: string[] = [];

    // Feature dominance
    if (ai.featureBreakdown.length > 0) {
      const sorted = [...ai.featureBreakdown].sort((a, b) => b.requests - a.requests);
      const top = sorted[0];
      if (ai.totalRequests > 0) {
        const pctRequests = Math.round((top.requests / ai.totalRequests) * 100);
        const pctCost = ai.totalCost > 0 ? Math.round((top.cost / ai.totalCost) * 100) : 0;
        items.push(
          language === 'fr'
            ? `**${top.feature}** représente **${pctRequests}% des requêtes** et **${pctCost}%** des coûts totaux (${formatCurrency(top.cost)} sur ${formatCurrency(ai.totalCost)}).`
            : `**${top.feature}** accounts for **${pctRequests}% of all requests** and **${pctCost}%** of total costs (${formatCurrency(top.cost)} of ${formatCurrency(ai.totalCost)}).`,
        );
      }

      // Remaining features
      if (sorted.length > 1) {
        const remaining = sorted.slice(1);
        const remainingReqs = remaining.reduce((s, f) => s + f.requests, 0);
        const remainingCost = remaining.reduce((s, f) => s + f.cost, 0);
        items.push(
          language === 'fr'
            ? `Les **${remainingReqs} requêtes restantes** (${formatCurrency(remainingCost)}) sont réparties entre ${remaining.length} autre(s) fonctionnalité(s).`
            : `The remaining **${remainingReqs} requests** (${formatCurrency(remainingCost)}) are attributed to ${remaining.length} other feature(s).`,
        );
      }
    }

    // Reliability
    if (ai.totalRequests > 0) {
      const failCount = ai.failedRequests;
      if (failCount === 0) {
        items.push(
          language === 'fr'
            ? 'Fiabilité parfaite sur cette période — **aucune requête échouée**.'
            : 'Perfect reliability this period — **zero failed requests**.',
        );
      } else if (parseFloat(successRate) >= 90) {
        items.push(
          language === 'fr'
            ? `Fiabilité solide avec seulement **${failCount} requête(s) échouée(s)** (taux de réussite de ${successRate}%).`
            : `Solid reliability with only **${failCount} failed request(s)** (${successRate}% success rate).`,
        );
      } else {
        items.push(
          language === 'fr'
            ? `Attention : **${failCount} requêtes échouées** détectées (taux de réussite de ${successRate}%). Investigation recommandée.`
            : `Warning: **${failCount} failed requests** detected (${successRate}% success rate). Investigation recommended.`,
        );
      }
    }

    // Volume assessment
    if (ai.totalRequests > 0 && ai.totalRequests < 50) {
      items.push(
        language === 'fr'
          ? 'L\'utilisation semble relativement faible sur cette période.'
          : 'Usage appears relatively low this period.',
      );
    }

    return items;
  }, [ai, successRate, language]);

  // Chart styling
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#374151' : '#E5E7EB';
  const textColor = isDark ? '#9CA3AF' : '#6B7280';

  // Daily usage chart data
  const dailyChartData = useMemo(() => {
    if (!ai?.dailyUsage?.length) return [];
    return ai.dailyUsage.map((d) => ({
      date: new Date(d.date).toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-CA', { month: 'short', day: 'numeric' }),
      [t('admin.metrics.ai.requests')]: d.requests,
      [t('admin.metrics.ai.cost')]: d.cost,
      [t('admin.metrics.ai.tokens')]: d.tokens,
    }));
  }, [ai, language, t]);

  // Period label for date range display
  const dateRangeLabel = useMemo(() => {
    if (!ai?.startDate || !ai?.endDate) return '';
    const opts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    const locale = language === 'fr' ? 'fr-CA' : 'en-CA';
    const start = new Date(ai.startDate).toLocaleDateString(locale, opts);
    const end = new Date(ai.endDate).toLocaleDateString(locale, opts);
    return `${start} – ${end}`;
  }, [ai, language]);

  // ─── Loading ────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <SqordiaLoader size="lg" message={language === 'fr' ? 'Chargement...' : 'Loading metrics...'} />
      </div>
    );
  }

  if (error && !overview && !ai) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="font-medium text-red-800 dark:text-red-300">
              {language === 'fr' ? 'Échec du chargement' : 'Failed to load metrics'}
            </p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">{error}</p>
          </div>
          <button
            onClick={loadData}
            className="ml-auto px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
          >
            {language === 'fr' ? 'Réessayer' : 'Retry'}
          </button>
        </div>
      </motion.div>
    );
  }

  const periods: { key: Period; label: string }[] = [
    { key: 'today', label: t('admin.metrics.period.today') },
    { key: 'week', label: t('admin.metrics.period.week') },
    { key: 'month', label: t('admin.metrics.period.month') },
    { key: '30days', label: t('admin.metrics.period.30days') },
  ];

  // ─── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Gradient Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-800 dark:via-slate-900 dark:to-black p-6 md:p-8"
      >
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />
        </div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{t('admin.metrics.title')}</h1>
            <p className="text-slate-400 text-sm mt-1">{t('admin.metrics.subtitle')}</p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-slate-400">
                {t('admin.metrics.lastUpdated')}: {lastUpdated.toLocaleTimeString(language === 'fr' ? 'fr-CA' : 'en-CA')}
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
              {t('admin.metrics.refresh')}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── AI Quick Stats (from overview) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-card rounded-xl border border-border/50 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10">
            <Zap className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{aiRequestsToday.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">{t('admin.metrics.ai.requestsToday')}</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl border border-border/50 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10">
            <DollarSign className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(aiCostToday)}</p>
            <p className="text-xs text-muted-foreground">{t('admin.metrics.ai.costToday')}</p>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card rounded-xl border border-border/50 p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-500/10">
            <DollarSign className="w-5 h-5 text-purple-500" />
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(aiCostMonth)}</p>
            <p className="text-xs text-muted-foreground">{t('admin.metrics.ai.costThisMonth')}</p>
          </div>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          AI USAGE OVERVIEW SECTION
         ══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-xl border border-border/50 overflow-hidden"
      >
        {/* Section Header with period tabs */}
        <div className="p-5 pb-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Bot className="w-5 h-5 text-purple-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{t('admin.metrics.ai.title')}</h2>
                {dateRangeLabel && (
                  <p className="text-xs text-muted-foreground">{dateRangeLabel}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
              {periods.map((p) => (
                <button
                  key={p.key}
                  onClick={() => handlePeriodChange(p.key)}
                  disabled={aiLoading}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                    period === p.key
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {aiLoading ? (
          <div className="flex items-center justify-center py-16">
            <SqordiaLoader size="md" message={language === 'fr' ? 'Chargement...' : 'Loading...'} />
          </div>
        ) : !ai ? (
          <div className="p-5 text-center text-sm text-muted-foreground">{t('admin.metrics.noData')}</div>
        ) : (
          <div className="p-5 pt-4 space-y-6">
            {/* Request Summary + Cost Breakdown side by side */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Request Summary */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-base">📊</span> {t('admin.metrics.ai.requestSummary')}
                </h3>
                <div className="border border-border/50 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/30">
                        <th className="text-left px-4 py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                          {language === 'fr' ? 'Métrique' : 'Metric'}
                        </th>
                        <th className="text-left px-4 py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                          {language === 'fr' ? 'Valeur' : 'Value'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      <tr>
                        <td className="px-4 py-2.5 font-medium text-foreground">{t('admin.metrics.ai.totalRequests')}</td>
                        <td className="px-4 py-2.5 text-foreground">{ai.totalRequests.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-medium text-foreground">{t('admin.metrics.ai.successfulRequests')}</td>
                        <td className="px-4 py-2.5 text-foreground">{ai.successfulRequests.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-medium text-foreground">{t('admin.metrics.ai.failedRequests')}</td>
                        <td className="px-4 py-2.5 text-foreground">{ai.failedRequests.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-medium text-foreground">{t('admin.metrics.ai.successRate')}</td>
                        <td className="px-4 py-2.5">
                          <span className={cn(
                            'font-semibold',
                            parseFloat(successRate) >= 95 ? 'text-emerald-600 dark:text-emerald-400' :
                            parseFloat(successRate) >= 80 ? 'text-amber-600 dark:text-amber-400' :
                            'text-red-600 dark:text-red-400',
                          )}>
                            {successRate}%
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-base">💰</span> {t('admin.metrics.ai.costBreakdown')}
                </h3>
                <div className="border border-border/50 rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/30">
                        <th className="text-left px-4 py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                          {language === 'fr' ? 'Métrique' : 'Metric'}
                        </th>
                        <th className="text-left px-4 py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                          {language === 'fr' ? 'Valeur' : 'Value'}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/30">
                      <tr>
                        <td className="px-4 py-2.5 font-medium text-foreground">{t('admin.metrics.ai.totalCost')}</td>
                        <td className="px-4 py-2.5 text-foreground font-semibold">{formatCurrency(ai.totalCost)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-medium text-foreground">{t('admin.metrics.ai.avgCostPerRequest')}</td>
                        <td className="px-4 py-2.5 text-foreground">{formatCurrency(ai.averageCostPerRequest)}</td>
                      </tr>
                      <tr>
                        <td className="px-4 py-2.5 font-medium text-foreground">{t('admin.metrics.ai.totalTokens')}</td>
                        <td className="px-4 py-2.5 text-foreground">{ai.totalTokensUsed.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Feature Breakdown */}
            {ai.featureBreakdown.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <span className="text-base">✨</span> {t('admin.metrics.ai.featureBreakdown')}
                </h3>
                <div className="border border-border/50 rounded-lg overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/30">
                          <th className="text-left px-4 py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                            {t('admin.metrics.ai.feature')}
                          </th>
                          <th className="text-left px-4 py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                            {t('admin.metrics.ai.requests')}
                          </th>
                          <th className="text-left px-4 py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                            {t('admin.metrics.ai.cost')}
                          </th>
                          <th className="text-left px-4 py-2 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
                            {t('admin.metrics.ai.avgResponseTime')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {ai.featureBreakdown.map((feat, i) => (
                          <tr key={i}>
                            <td className="px-4 py-2.5 font-medium text-foreground">{feat.feature}</td>
                            <td className="px-4 py-2.5 text-foreground">{feat.requests.toLocaleString()}</td>
                            <td className="px-4 py-2.5 text-foreground">{formatCurrency(feat.cost)}</td>
                            <td className="px-4 py-2.5 text-foreground">{feat.averageResponseTime.toFixed(1)}s</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Key Takeaways */}
            {takeaways.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  {t('admin.metrics.ai.keyTakeaways')}
                </h3>
                <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                  {takeaways.map((text, i) => (
                    <p key={i} className="text-sm text-foreground leading-relaxed" dangerouslySetInnerHTML={{
                      __html: sanitizeHtml(text
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'))
                    }} />
                  ))}
                </div>
              </div>
            )}

            {/* Daily Usage Chart */}
            {dailyChartData.length > 1 && (
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  {t('admin.metrics.ai.dailyUsage')}
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyChartData}>
                      <defs>
                        <linearGradient id="gradReqs" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradCost" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: textColor }} axisLine={false} tickLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                          borderColor: isDark ? '#374151' : '#E5E7EB',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Legend />
                      <Area
                        yAxisId="left"
                        type="monotone"
                        dataKey={t('admin.metrics.ai.requests')}
                        stroke="#3B82F6"
                        fill="url(#gradReqs)"
                        strokeWidth={2}
                      />
                      <Area
                        yAxisId="right"
                        type="monotone"
                        dataKey={t('admin.metrics.ai.cost')}
                        stroke="#F59E0B"
                        fill="url(#gradCost)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* ══════════════════════════════════════════════════════════════════════
          PLATFORM OVERVIEW SECTION
         ══════════════════════════════════════════════════════════════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-lg font-semibold text-foreground mb-4">{t('admin.metrics.platform.title')}</h2>

        {/* Platform quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[
            { label: t('admin.metrics.platform.newUsersWeek'), value: newUsersWeek, icon: Users, color: '#3B82F6', bg: 'bg-blue-500/10' },
            { label: t('admin.metrics.platform.plansCreatedWeek'), value: plansCreatedWeek, icon: FileText, color: '#A855F7', bg: 'bg-purple-500/10' },
            { label: t('admin.metrics.platform.activeSessions'), value: activeSessions, icon: Activity, color: '#14B8A6', bg: 'bg-teal-500/10' },
            { label: t('admin.metrics.platform.totalOrgs'), value: totalOrgs, icon: Building2, color: '#FF6B00', bg: 'bg-orange-500/10' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="bg-card rounded-xl border border-border/50 p-5 flex items-center gap-4"
              >
                <div className={cn('p-3 rounded-xl', stat.bg)}>
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{stat.value.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom row: Funnel + Top Orgs + Health */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Business Plan Funnel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-card rounded-xl border border-border/50 p-5"
          >
            <h3 className="text-sm font-semibold text-foreground mb-3">{t('admin.metrics.platform.funnel')}</h3>
            <div className="space-y-3">
              {[
                { label: t('admin.metrics.platform.completed'), value: completedPlans, color: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
                { label: t('admin.metrics.platform.inProgress'), value: inProgressPlans, color: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
                { label: t('admin.metrics.platform.draft'), value: draftPlans, color: 'bg-gray-400', text: 'text-gray-600 dark:text-gray-400' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-foreground">{item.label}</span>
                    <span className={cn('text-sm font-semibold', item.text)}>{item.value}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full transition-all', item.color)}
                      style={{ width: totalPlans > 0 ? `${(item.value / totalPlans) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Top Organizations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="bg-card rounded-xl border border-border/50 p-5"
          >
            <h3 className="text-sm font-semibold text-foreground mb-3">{t('admin.metrics.platform.topOrgs')}</h3>
            {topOrgs.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t('admin.metrics.noData')}</p>
            ) : (
              <div className="space-y-2.5">
                {topOrgs.map((org: any, i: number) => {
                  const count = org.memberCount || org.MemberCount || 0;
                  const name = org.name || org.Name || 'Unknown';
                  const pct = maxMembers > 0 ? (count / maxMembers) * 100 : 0;
                  return (
                    <div key={org.id || org.Id || i} className="flex items-center gap-3">
                      <span className="text-xs font-medium text-muted-foreground w-4 text-right">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground truncate">{name}</span>
                          <span className="text-xs text-muted-foreground ml-2 shrink-0">
                            {count} {t('admin.metrics.platform.members')}
                          </span>
                        </div>
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* System Health */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-card rounded-xl border border-border/50 p-5"
          >
            <h3 className="text-sm font-semibold text-foreground mb-3">{t('admin.metrics.platform.systemHealth')}</h3>
            {healthServices.length === 0 ? (
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-sm text-emerald-600 dark:text-emerald-400">
                  {health?.overallStatus || health?.OverallStatus || (language === 'fr' ? 'Tous les systèmes opérationnels' : 'All systems operational')}
                </span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {healthServices.map((svc: any, i: number) => {
                  const name = svc.name || svc.Name || `Service ${i + 1}`;
                  const status = (svc.status || svc.Status || 'unknown').toLowerCase();
                  const isHealthy = status === 'healthy' || status === 'ok' || status === 'online';
                  const isError = status === 'error' || status === 'offline' || status === 'down';
                  return (
                    <div key={i} className="flex items-center gap-2.5">
                      {isHealthy ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : isError ? (
                        <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                      <span className="text-sm text-foreground">{name}</span>
                      <span className={cn(
                        'text-xs ml-auto capitalize',
                        isHealthy ? 'text-emerald-600 dark:text-emerald-400' : isError ? 'text-red-600 dark:text-red-400' : 'text-amber-600 dark:text-amber-400',
                      )}>
                        {status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
