import { usePlanFeatures } from '../hooks/usePlanFeatures';
import { PlanFeatures, UsageInfo } from '../lib/plan-features-service';
import { useTheme } from '../contexts/ThemeContext';
import { BarChart3, Zap, MessageSquare, FileOutput, Database, TrendingUp } from 'lucide-react';

interface UsageDashboardProps {
  organizationId: string | null | undefined;
}

const T = {
  en: {
    title: 'Usage & Limits',
    subtitle: 'Current billing period',
    plansGenerated: 'AI Generations',
    coachMessages: 'Coach Messages',
    exports: 'Exports',
    storage: 'Storage',
    unlimited: 'Unlimited',
    of: 'of',
    used: 'used',
    nearLimit: 'Near limit',
    noData: 'No usage data available',
    loading: 'Loading usage...',
    upgradePrompt: 'Upgrade for more',
  },
  fr: {
    title: 'Utilisation & Limites',
    subtitle: 'Période de facturation en cours',
    plansGenerated: 'Générations IA',
    coachMessages: 'Messages Coach',
    exports: 'Exports',
    storage: 'Stockage',
    unlimited: 'Illimité',
    of: 'de',
    used: 'utilisé',
    nearLimit: 'Proche de la limite',
    noData: 'Aucune donnée disponible',
    loading: 'Chargement...',
    upgradePrompt: 'Passez au niveau supérieur',
  },
};

interface UsageMeter {
  key: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

export default function UsageDashboard({ organizationId }: UsageDashboardProps) {
  const { language } = useTheme();
  const t = T[language as keyof typeof T] ?? T.en;
  const { snapshot, isLoading, error } = usePlanFeatures(organizationId);

  const meters: UsageMeter[] = [
    {
      key: PlanFeatures.MaxAiGenerationsMonthly,
      label: t.plansGenerated,
      icon: <Zap className="w-4 h-4" />,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500',
    },
    {
      key: PlanFeatures.MaxAiCoachMessagesMonthly,
      label: t.coachMessages,
      icon: <MessageSquare className="w-4 h-4" />,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500',
    },
    {
      key: PlanFeatures.MaxStorageMb,
      label: t.storage,
      icon: <Database className="w-4 h-4" />,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500',
    },
  ];

  if (!organizationId) return null;

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-5 w-40 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-slate-100 dark:bg-slate-700 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !snapshot) return null;

  const renderMeter = (meter: UsageMeter) => {
    const usage: UsageInfo | null = snapshot.usage[meter.key] ?? null;
    const limit = parseInt(snapshot.features[meter.key] ?? '0', 10);
    const isUnlimited = limit === -1;

    const current = usage?.current ?? 0;
    const percent = isUnlimited ? 0 : (limit > 0 ? Math.min((current / limit) * 100, 100) : 0);
    const isNear = percent >= 80;
    const isExhausted = percent >= 100;

    return (
      <div
        key={meter.key}
        className={`relative p-4 rounded-xl border transition-colors ${
          isExhausted
            ? 'border-red-200 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/10'
            : isNear
              ? 'border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10'
              : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50'
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className={meter.color}>{meter.icon}</span>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{meter.label}</span>
          {isNear && !isUnlimited && (
            <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              isExhausted
                ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
            }`}>
              {isExhausted ? '100%' : t.nearLimit}
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-1 mb-2">
          <span className="text-xl font-bold text-slate-900 dark:text-white">{current}</span>
          {isUnlimited ? (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">/ {t.unlimited}</span>
          ) : (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {t.of} {limit}
            </span>
          )}
        </div>

        {/* Progress bar */}
        {!isUnlimited && (
          <div className="h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isExhausted ? 'bg-red-500' : isNear ? 'bg-amber-500' : meter.bgColor
              }`}
              style={{ width: `${Math.min(percent, 100)}%` }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-strategy-blue dark:text-slate-300" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-strategy-blue dark:text-white">{t.title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {meters.map(renderMeter)}
      </div>
    </div>
  );
}
