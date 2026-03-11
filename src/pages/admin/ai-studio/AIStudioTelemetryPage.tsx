import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  Zap,
  Coins,
  RefreshCw,
  Loader2,
  AlertCircle,
  Info,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { apiClient } from '../../../lib/api-client';
import { useTheme } from '../../../contexts/ThemeContext';
import { cn } from '../../../lib/utils';

// ── Types ────────────────────────────────────────────────────

interface OverviewMetrics {
  totalCalls: number;
  totalCallsTrend: number;
  avgLatencyMs: number;
  totalTokens: number;
  avgQualityScore: number;
}

interface ProviderStats {
  name: string;
  calls: number;
  tokens: number;
  avgLatencyMs: number;
  costEstimate: number;
  color: string;
  bgClass: string;
  borderClass: string;
}

interface OutcomeData {
  label: string;
  labelFr: string;
  count: number;
  percentage: number;
  color: string;
}

interface QualityBucket {
  range: string;
  count: number;
  color: string;
}

interface LatencyPoint {
  date: string;
  avgLatency: number;
}

interface SectionTokenUsage {
  section: string;
  tokens: number;
}

interface DailyCost {
  date: string;
  openai: number;
  claude: number;
  gemini: number;
  total: number;
}

interface TelemetryData {
  overview: OverviewMetrics;
  providers: ProviderStats[];
  outcomes: OutcomeData[];
  qualityBuckets: QualityBucket[];
  latencyTrend: LatencyPoint[];
  tokensBySection: SectionTokenUsage[];
  dailyCosts: DailyCost[];
  hasSampleData: boolean;
}

type Period = 'today' | 'week' | 'month' | '30days';

// ── Helpers ──────────────────────────────────────────────────

function generateSampleData(): Omit<TelemetryData, 'overview' | 'hasSampleData'> {
  const now = new Date();

  const latencyTrend: LatencyPoint[] = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (29 - i));
    return {
      date: d.toISOString().slice(5, 10),
      avgLatency: 800 + Math.round(Math.random() * 600 - 200),
    };
  });

  const sections = [
    'Executive Summary', 'Market Analysis', 'Financial Projections',
    'Marketing Strategy', 'Operations Plan', 'Company Description',
    'Products & Services', 'Management Team', 'SWOT Analysis',
    'Risk Analysis', 'Implementation Plan', 'Competitive Analysis',
  ];

  const tokensBySection: SectionTokenUsage[] = sections
    .map(s => ({ section: s, tokens: Math.round(5000 + Math.random() * 45000) }))
    .sort((a, b) => b.tokens - a.tokens);

  const dailyCosts: DailyCost[] = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (29 - i));
    const openai = +(0.8 + Math.random() * 1.2).toFixed(2);
    const claude = +(0.5 + Math.random() * 0.9).toFixed(2);
    const gemini = +(0.2 + Math.random() * 0.4).toFixed(2);
    return {
      date: d.toISOString().slice(5, 10),
      openai,
      claude,
      gemini,
      total: +(openai + claude + gemini).toFixed(2),
    };
  });

  return { latencyTrend, tokensBySection, dailyCosts,
    providers: [], outcomes: [], qualityBuckets: [] };
}

function buildProviders(raw: any): ProviderStats[] {
  const defs: Array<{ key: string; name: string; color: string; bgClass: string; borderClass: string; rate: number }> = [
    { key: 'openai', name: 'OpenAI', color: '#10b981', bgClass: 'bg-emerald-500/10', borderClass: 'border-emerald-500/20', rate: 0.003 },
    { key: 'claude', name: 'Claude', color: '#f97316', bgClass: 'bg-orange-500/10', borderClass: 'border-orange-500/20', rate: 0.004 },
    { key: 'gemini', name: 'Gemini', color: '#3b82f6', bgClass: 'bg-blue-500/10', borderClass: 'border-blue-500/20', rate: 0.001 },
  ];

  if (raw?.providerBreakdown) {
    return defs.map(d => {
      const match = raw.providerBreakdown.find(
        (p: any) => p.provider?.toLowerCase().includes(d.key)
      );
      return {
        name: d.name,
        calls: match?.callCount ?? Math.round(200 + Math.random() * 800),
        tokens: match?.totalTokens ?? Math.round(50000 + Math.random() * 200000),
        avgLatencyMs: match?.avgLatencyMs ?? Math.round(500 + Math.random() * 1000),
        costEstimate: match?.costEstimate ?? +(20 + Math.random() * 60).toFixed(2),
        color: d.color,
        bgClass: d.bgClass,
        borderClass: d.borderClass,
      };
    });
  }

  return defs.map(d => ({
    name: d.name,
    calls: Math.round(200 + Math.random() * 800),
    tokens: Math.round(50000 + Math.random() * 200000),
    avgLatencyMs: Math.round(500 + Math.random() * 1000),
    costEstimate: +(d.rate * (50000 + Math.random() * 200000)).toFixed(2),
    color: d.color,
    bgClass: d.bgClass,
    borderClass: d.borderClass,
  }));
}

function buildOutcomes(raw: any): OutcomeData[] {
  const accepted = raw?.acceptedCount ?? 620;
  const edited = raw?.editedCount ?? 245;
  const regenerated = raw?.regeneratedCount ?? 85;
  const total = accepted + edited + regenerated || 1;
  return [
    { label: 'Accepted', labelFr: 'Accept\u00e9', count: accepted, percentage: Math.round((accepted / total) * 100), color: '#22c55e' },
    { label: 'Edited', labelFr: '\u00c9dit\u00e9', count: edited, percentage: Math.round((edited / total) * 100), color: '#f59e0b' },
    { label: 'Regenerated', labelFr: 'R\u00e9g\u00e9n\u00e9r\u00e9', count: regenerated, percentage: Math.round((regenerated / total) * 100), color: '#ef4444' },
  ];
}

function buildQualityBuckets(raw: any): QualityBucket[] {
  if (raw?.qualityDistribution) {
    return raw.qualityDistribution;
  }
  return [
    { range: '0-20', count: 8, color: '#ef4444' },
    { range: '21-40', count: 24, color: '#f97316' },
    { range: '41-60', count: 65, color: '#eab308' },
    { range: '61-80', count: 182, color: '#84cc16' },
    { range: '81-100', count: 271, color: '#22c55e' },
  ];
}

// ── Sub-components ───────────────────────────────────────────

const SampleBadge: React.FC<{ isFr: boolean }> = ({ isFr }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
    <Info className="w-3 h-3" />
    {isFr ? 'Donn\u00e9es exemples' : 'Sample data'}
  </span>
);

const SectionHeader: React.FC<{
  title: string;
  subtitle?: string;
  showSample?: boolean;
  isFr: boolean;
}> = ({ title, subtitle, showSample, isFr }) => (
  <div className="flex items-center justify-between mb-4">
    <div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
    </div>
    {showSample && <SampleBadge isFr={isFr} />}
  </div>
);

const OverviewCard: React.FC<{
  label: string;
  value: string;
  icon: React.ElementType;
  gradient: string;
  trend?: number;
  index: number;
}> = ({ label, value, icon: Icon, gradient, trend, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08 }}
    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5"
  >
    <div className="flex items-start justify-between mb-3">
      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', gradient)}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      {trend !== undefined && (
        <span className={cn(
          'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
          trend >= 0
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        )}>
          {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{value}</p>
    <p className="text-sm text-gray-500">{label}</p>
  </motion.div>
);

// ── Main Component ───────────────────────────────────────────

export function AIStudioTelemetryPage() {
  const { language } = useTheme();
  const isFr = language === 'fr';

  const [data, setData] = useState<TelemetryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<Period>('30days');

  const t = {
    title: isFr ? 'T\u00e9l\u00e9m\u00e9trie IA' : 'AI Telemetry',
    subtitle: isFr
      ? 'Tableau de bord des m\u00e9triques d\u2019appels IA, latence, tokens et co\u00fbts'
      : 'Dashboard of AI call metrics, latency, tokens, and costs',
    back: isFr ? 'Retour \u00e0 AI Studio' : 'Back to AI Studio',
    refresh: isFr ? 'Actualiser' : 'Refresh',
    errorMsg: isFr ? 'Erreur lors du chargement' : 'Error loading data',
    retry: isFr ? 'R\u00e9essayer' : 'Retry',
    totalCalls: isFr ? 'Total appels IA' : 'Total AI Calls',
    avgLatency: isFr ? 'Latence moyenne' : 'Average Latency',
    totalTokens: isFr ? 'Tokens utilis\u00e9s' : 'Tokens Used',
    avgQuality: isFr ? 'Score qualit\u00e9 moy.' : 'Avg Quality Score',
    providers: isFr ? 'R\u00e9partition par fournisseur' : 'Provider Breakdown',
    providersDesc: isFr ? 'Appels, tokens et co\u00fbts par fournisseur IA' : 'Calls, tokens, and costs per AI provider',
    calls: isFr ? 'Appels' : 'Calls',
    tokens: 'Tokens',
    latency: isFr ? 'Latence' : 'Latency',
    cost: isFr ? 'Co\u00fbt est.' : 'Est. cost',
    distribution: isFr ? 'Distribution des appels' : 'Call Distribution',
    outcomes: isFr ? 'R\u00e9sultats de g\u00e9n\u00e9ration' : 'Generation Outcomes',
    outcomesDesc: isFr ? 'Comment les utilisateurs traitent le contenu g\u00e9n\u00e9r\u00e9' : 'How users handle generated content',
    qualityDist: isFr ? 'Distribution des scores de qualit\u00e9' : 'Quality Score Distribution',
    qualityDesc: isFr ? 'R\u00e9partition des scores de qualit\u00e9 IA (0-100)' : 'AI quality score distribution (0-100)',
    latencyTrend: isFr ? 'Tendance de latence' : 'Latency Trends',
    latencyDesc: isFr ? 'Latence moyenne sur les 30 derniers jours (ms)' : 'Average latency over the last 30 days (ms)',
    tokensBySection: isFr ? 'Tokens par section' : 'Token Usage by Section',
    tokensByDesc: isFr ? 'Consommation de tokens par type de section' : 'Token consumption per section type',
    costAnalysis: isFr ? 'Analyse des co\u00fbts' : 'Cost Analysis',
    costDesc: isFr ? 'Tendance quotidienne des co\u00fbts par fournisseur (USD)' : 'Daily cost trend per provider (USD)',
    today: isFr ? 'Aujourd\u2019hui' : 'Today',
    week: isFr ? 'Semaine' : 'Week',
    month: isFr ? 'Mois' : 'Month',
    days30: isFr ? '30 jours' : '30 Days',
    costByProvider: isFr ? 'Co\u00fbt par fournisseur' : 'Cost by Provider',
    totalCost: isFr ? 'Co\u00fbt total' : 'Total Cost',
  };

  const periods: { key: Period; label: string }[] = [
    { key: 'today', label: t.today },
    { key: 'week', label: t.week },
    { key: 'month', label: t.month },
    { key: '30days', label: t.days30 },
  ];

  const loadTelemetryData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const now = new Date();
      let startDate: string | undefined;

      if (period === 'today') {
        startDate = now.toISOString().slice(0, 10);
      } else if (period === 'week') {
        const d = new Date(now);
        d.setDate(d.getDate() - 7);
        startDate = d.toISOString().slice(0, 10);
      } else if (period === 'month') {
        const d = new Date(now);
        d.setMonth(d.getMonth() - 1);
        startDate = d.toISOString().slice(0, 10);
      } else {
        const d = new Date(now);
        d.setDate(d.getDate() - 30);
        startDate = d.toISOString().slice(0, 10);
      }

      const endDate = now.toISOString().slice(0, 10);
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      params.append('endDate', endDate);
      const qs = params.toString() ? `?${params.toString()}` : '';

      const response = await apiClient.get<any>(`/api/v1/admin/ai-usage-stats${qs}`);
      let raw = response.data;
      if (raw?.isSuccess && raw.value !== undefined) {
        raw = raw.value;
      }

      const sample = generateSampleData();
      const providers = buildProviders(raw);
      const outcomes = buildOutcomes(raw);
      const qualityBuckets = buildQualityBuckets(raw);
      const totalCalls = raw?.totalCalls ?? providers.reduce((s, p) => s + p.calls, 0);
      const hasSampleData = !raw?.totalCalls;

      setData({
        overview: {
          totalCalls,
          totalCallsTrend: raw?.totalCallsTrend ?? 12,
          avgLatencyMs: raw?.avgLatencyMs ?? Math.round(providers.reduce((s, p) => s + p.avgLatencyMs, 0) / (providers.length || 1)),
          totalTokens: raw?.totalTokens ?? providers.reduce((s, p) => s + p.tokens, 0),
          avgQualityScore: raw?.avgQualityScore ?? 74,
        },
        providers,
        outcomes,
        qualityBuckets,
        latencyTrend: raw?.latencyTrend ?? sample.latencyTrend,
        tokensBySection: raw?.tokensBySection ?? sample.tokensBySection,
        dailyCosts: raw?.dailyCosts ?? sample.dailyCosts,
        hasSampleData,
      });
    } catch (err: any) {
      console.error('Error loading telemetry:', err);

      // Fallback: render with full sample data so the UI structure is visible
      const sample = generateSampleData();
      const providers = buildProviders(null);
      const outcomes = buildOutcomes(null);
      const qualityBuckets = buildQualityBuckets(null);
      const totalCalls = providers.reduce((s, p) => s + p.calls, 0);

      setData({
        overview: {
          totalCalls,
          totalCallsTrend: 12,
          avgLatencyMs: Math.round(providers.reduce((s, p) => s + p.avgLatencyMs, 0) / providers.length),
          totalTokens: providers.reduce((s, p) => s + p.tokens, 0),
          avgQualityScore: 74,
        },
        providers,
        outcomes,
        qualityBuckets,
        latencyTrend: sample.latencyTrend,
        tokensBySection: sample.tokensBySection,
        dailyCosts: sample.dailyCosts,
        hasSampleData: true,
      });
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadTelemetryData();
  }, [loadTelemetryData]);

  // ── Derived values ──

  const totalProviderCalls = data?.providers.reduce((s, p) => s + p.calls, 0) || 1;
  const totalCostSum = data?.dailyCosts.reduce((s, d) => s + d.total, 0) ?? 0;
  const costByProvider = data ? {
    openai: data.dailyCosts.reduce((s, d) => s + d.openai, 0),
    claude: data.dailyCosts.reduce((s, d) => s + d.claude, 0),
    gemini: data.dailyCosts.reduce((s, d) => s + d.gemini, 0),
  } : { openai: 0, claude: 0, gemini: 0 };

  // ── Render ──

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-800 dark:via-slate-900 dark:to-black p-6 md:p-8"
      >
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }} />
        </div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/admin/ai-studio" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{t.title}</h1>
              <p className="text-slate-400 mt-1">{t.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Period Selector */}
            <div className="flex items-center bg-white/5 rounded-lg p-0.5">
              {periods.map(p => (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                    period === p.key
                      ? 'bg-white/15 text-white'
                      : 'text-slate-400 hover:text-white',
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <button
              onClick={loadTelemetryData}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
              {t.refresh}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Content ── */}
      {loading && !data ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
        </div>
      ) : error && !data ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertCircle className="w-10 h-10 text-red-400" />
          <p className="text-gray-500">{t.errorMsg}</p>
          <button
            onClick={loadTelemetryData}
            className="px-4 py-2 text-sm font-medium bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            {t.retry}
          </button>
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* ── Section 1: Overview Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <OverviewCard
              label={t.totalCalls}
              value={data.overview.totalCalls.toLocaleString()}
              icon={Activity}
              gradient="bg-gradient-to-br from-violet-500 to-purple-600"
              trend={data.overview.totalCallsTrend}
              index={0}
            />
            <OverviewCard
              label={t.avgLatency}
              value={`${data.overview.avgLatencyMs.toLocaleString()} ms`}
              icon={Clock}
              gradient="bg-gradient-to-br from-blue-500 to-cyan-600"
              index={1}
            />
            <OverviewCard
              label={t.totalTokens}
              value={data.overview.totalTokens >= 1_000_000
                ? `${(data.overview.totalTokens / 1_000_000).toFixed(1)}M`
                : data.overview.totalTokens >= 1_000
                  ? `${(data.overview.totalTokens / 1_000).toFixed(1)}K`
                  : data.overview.totalTokens.toLocaleString()
              }
              icon={Zap}
              gradient="bg-gradient-to-br from-amber-500 to-orange-600"
              index={2}
            />
            <OverviewCard
              label={t.avgQuality}
              value={`${data.overview.avgQualityScore}/100`}
              icon={TrendingUp}
              gradient="bg-gradient-to-br from-emerald-500 to-green-600"
              index={3}
            />
          </div>

          {/* ── Section 2: Provider Breakdown ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6"
          >
            <SectionHeader
              title={t.providers}
              subtitle={t.providersDesc}
              showSample={data.hasSampleData}
              isFr={isFr}
            />

            {/* Provider Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {data.providers.map(p => (
                <div
                  key={p.name}
                  className={cn(
                    'rounded-xl border p-4',
                    p.bgClass, p.borderClass,
                  )}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{p.name}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">{t.calls}</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{p.calls.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">{t.tokens}</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {p.tokens >= 1000 ? `${(p.tokens / 1000).toFixed(0)}K` : p.tokens}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">{t.latency}</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{p.avgLatencyMs} ms</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">{t.cost}</p>
                      <p className="font-semibold text-gray-900 dark:text-white">${p.costEstimate.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Distribution Bar */}
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">{t.distribution}</p>
              <div className="flex h-6 rounded-full overflow-hidden">
                {data.providers.map(p => {
                  const pct = (p.calls / totalProviderCalls) * 100;
                  return (
                    <div
                      key={p.name}
                      className="flex items-center justify-center text-[10px] font-bold text-white transition-all"
                      style={{ width: `${pct}%`, backgroundColor: p.color, minWidth: pct > 5 ? undefined : '24px' }}
                      title={`${p.name}: ${pct.toFixed(1)}%`}
                    >
                      {pct >= 10 && `${pct.toFixed(0)}%`}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-2">
                {data.providers.map(p => (
                  <div key={p.name} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.name} ({((p.calls / totalProviderCalls) * 100).toFixed(1)}%)
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── Section 3 & 4: Outcomes + Quality (side by side) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Outcomes Donut */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.22 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6"
            >
              <SectionHeader
                title={t.outcomes}
                subtitle={t.outcomesDesc}
                showSample={data.hasSampleData}
                isFr={isFr}
              />
              <div className="flex items-center gap-6">
                <div className="w-48 h-48 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.outcomes}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        dataKey="count"
                        strokeWidth={2}
                        stroke="transparent"
                      >
                        {data.outcomes.map((o, i) => (
                          <Cell key={i} fill={o.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(0,0,0,0.8)',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '12px',
                          color: '#fff',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-3 flex-1">
                  {data.outcomes.map(o => (
                    <div key={o.label} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: o.color }} />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {isFr ? o.labelFr : o.label}
                        </p>
                        <p className="text-xs text-gray-500">{o.count.toLocaleString()}</p>
                      </div>
                      <span className="text-sm font-bold" style={{ color: o.color }}>
                        {o.percentage}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Quality Score Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6"
            >
              <SectionHeader
                title={t.qualityDist}
                subtitle={t.qualityDesc}
                showSample={data.hasSampleData}
                isFr={isFr}
              />
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.qualityBuckets} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                    <XAxis dataKey="range" tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#9ca3af" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#fff',
                      }}
                    />
                    <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                      {data.qualityBuckets.map((b, i) => (
                        <Cell key={i} fill={b.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </div>

          {/* ── Section 5: Latency Trends ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6"
          >
            <SectionHeader
              title={t.latencyTrend}
              subtitle={t.latencyDesc}
              showSample={data.hasSampleData}
              isFr={isFr}
            />
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.latencyTrend}>
                  <defs>
                    <linearGradient id="latencyGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" unit=" ms" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                    formatter={(value: any) => [`${value} ms`, isFr ? 'Latence moy.' : 'Avg Latency']}
                  />
                  <Area
                    type="monotone"
                    dataKey="avgLatency"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    fill="url(#latencyGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* ── Section 6: Token Usage by Section ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6"
          >
            <SectionHeader
              title={t.tokensBySection}
              subtitle={t.tokensByDesc}
              showSample={data.hasSampleData}
              isFr={isFr}
            />
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.tokensBySection} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis
                    dataKey="section"
                    type="category"
                    width={140}
                    tick={{ fontSize: 11 }}
                    stroke="#9ca3af"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                    formatter={(value: any) => [Number(value).toLocaleString(), 'Tokens']}
                  />
                  <Bar dataKey="tokens" radius={[0, 6, 6, 0]} fill="#7c3aed" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* ── Section 7: Cost Analysis ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.46 }}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6"
          >
            <SectionHeader
              title={t.costAnalysis}
              subtitle={t.costDesc}
              showSample={data.hasSampleData}
              isFr={isFr}
            />

            {/* Cost Summary Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                <p className="text-xs text-gray-500 mb-1">{t.totalCost}</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">${totalCostSum.toFixed(2)}</p>
              </div>
              {[
                { label: 'OpenAI', value: costByProvider.openai, color: '#10b981' },
                { label: 'Claude', value: costByProvider.claude, color: '#f97316' },
                { label: 'Gemini', value: costByProvider.gemini, color: '#3b82f6' },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                    <p className="text-xs text-gray-500">{item.label}</p>
                  </div>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">${item.value.toFixed(2)}</p>
                </div>
              ))}
            </div>

            {/* Stacked Area Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.dailyCosts}>
                  <defs>
                    <linearGradient id="costOpenai" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="costClaude" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="costGemini" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(128,128,128,0.15)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#9ca3af" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" unit="$" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#fff',
                    }}
                    formatter={(value: any) => [`$${Number(value).toFixed(2)}`, '']}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="openai"
                    name="OpenAI"
                    stackId="1"
                    stroke="#10b981"
                    strokeWidth={1.5}
                    fill="url(#costOpenai)"
                  />
                  <Area
                    type="monotone"
                    dataKey="claude"
                    name="Claude"
                    stackId="1"
                    stroke="#f97316"
                    strokeWidth={1.5}
                    fill="url(#costClaude)"
                  />
                  <Area
                    type="monotone"
                    dataKey="gemini"
                    name="Gemini"
                    stackId="1"
                    stroke="#3b82f6"
                    strokeWidth={1.5}
                    fill="url(#costGemini)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      ) : null}
    </div>
  );
}

export default AIStudioTelemetryPage;
