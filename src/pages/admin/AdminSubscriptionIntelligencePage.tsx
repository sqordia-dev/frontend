import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Loader2,
  Building2,
  ChevronDown,
  AlertTriangle,
  ShieldAlert,
  ArrowUpCircle,
  Gift,
  Copy,
  Check,
  Search,
  Sparkles,
  Users,
  RefreshCw,
  Tag,
  Clock,
  Target,
  Zap,
  BarChart3,
} from 'lucide-react';
import {
  subscriptionIntelligenceService,
  SubscriptionIntelligence,
  GeneratedCoupon,
  ActivePromotion,
  CouponValidationResult,
} from '../../lib/subscription-intelligence-service';
import { adminService } from '../../lib/admin-service';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';

// ── Types ──────────────────────────────────────────────────────────────────

interface Organization {
  id: string;
  name: string;
  memberCount?: number;
  membersCount?: number;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function riskColor(level: string): string {
  switch (level?.toLowerCase()) {
    case 'low': return 'text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/40';
    case 'medium': return 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/40';
    case 'high': return 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/40';
    default: return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-800';
  }
}

function riskDotColor(level: string): string {
  switch (level?.toLowerCase()) {
    case 'low': return 'bg-emerald-500';
    case 'medium': return 'bg-amber-500';
    case 'high': return 'bg-red-500';
    default: return 'bg-gray-400';
  }
}

function gaugeStroke(level: string): string {
  switch (level?.toLowerCase()) {
    case 'low': return '#ef4444';
    case 'medium': return '#f59e0b';
    case 'high': return '#10b981';
    default: return '#6b7280';
  }
}

// ── Circular Gauge ─────────────────────────────────────────────────────────

function CircularGauge({ value, size = 160, strokeWidth = 12, color }: {
  value: number;
  size?: number;
  strokeWidth?: number;
  color: string;
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        className="text-gray-200 dark:text-gray-700"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
    </svg>
  );
}

// ── Card Wrapper ───────────────────────────────────────────────────────────

function SectionCard({ children, title, icon: Icon, delay = 0 }: {
  children: React.ReactNode;
  title: string;
  icon: React.ElementType;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
          <Icon className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>
      {children}
    </motion.div>
  );
}

// ── Component ──────────────────────────────────────────────────────────────

export default function AdminSubscriptionIntelligencePage() {
  const { language } = useTheme();
  const isFr = language === 'fr';

  // ── State ──────────────────────────────────────────────────────────────
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [orgSearch, setOrgSearch] = useState('');

  const [intelligence, setIntelligence] = useState<SubscriptionIntelligence | null>(null);
  const [promotions, setPromotions] = useState<ActivePromotion[]>([]);
  const [generatedCoupon, setGeneratedCoupon] = useState<GeneratedCoupon | null>(null);
  const [couponCode, setCouponCode] = useState('');
  const [validationResult, setValidationResult] = useState<CouponValidationResult | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const [orgsLoading, setOrgsLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [couponGenerating, setCouponGenerating] = useState(false);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataError, setDataError] = useState<string | null>(null);

  // ── Labels ─────────────────────────────────────────────────────────────
  const t = useCallback((en: string, fr: string) => isFr ? fr : en, [isFr]);

  // ── Load Organizations ─────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        setOrgsLoading(true);
        setError(null);
        const orgs = await adminService.getOrganizations();
        const normalized: Organization[] = (Array.isArray(orgs) ? orgs : []).map((o: any) => ({
          id: o.id || o.Id,
          name: o.name || o.Name || 'Unknown',
          memberCount: o.memberCount ?? o.MemberCount ?? o.membersCount ?? o.MembersCount ?? 0,
        }));
        setOrganizations(normalized);
      } catch (err: any) {
        setError(err.message || (isFr ? 'Erreur de chargement des organisations' : 'Failed to load organizations'));
      } finally {
        setOrgsLoading(false);
      }
    })();
  }, [isFr]);

  // ── Load Intelligence Data ─────────────────────────────────────────────
  const loadIntelligence = useCallback(async (orgId: string) => {
    if (!orgId) return;
    try {
      setDataLoading(true);
      setDataError(null);
      setGeneratedCoupon(null);
      setValidationResult(null);
      setCouponCode('');

      const [intel, promos] = await Promise.allSettled([
        subscriptionIntelligenceService.getIntelligence(orgId),
        subscriptionIntelligenceService.getActivePromotions(orgId),
      ]);

      if (intel.status === 'fulfilled') {
        setIntelligence(intel.value);
      } else {
        const msg = intel.reason?.message || '';
        const isOffline = msg.includes('Connection refused') || msg.includes('Intelligence.Failed');
        setDataError(isOffline
          ? (isFr ? 'Le service ML (ai-service) n\'est pas disponible. Démarrez le service Python sur le port 8100.' : 'ML service (ai-service) is not available. Start the Python service on port 8100.')
          : (msg || (isFr ? 'Erreur de chargement' : 'Failed to load intelligence'))
        );
      }

      if (promos.status === 'fulfilled') {
        setPromotions(promos.value);
      } else {
        setPromotions([]);
      }
    } catch (err: any) {
      setDataError(err.message || (isFr ? 'Erreur inattendue' : 'Unexpected error'));
    } finally {
      setDataLoading(false);
    }
  }, [isFr]);

  const handleOrgSelect = (orgId: string) => {
    setSelectedOrgId(orgId);
    setDropdownOpen(false);
    setOrgSearch('');
    loadIntelligence(orgId);
  };

  // ── Generate Coupon ────────────────────────────────────────────────────
  const [couponInfo, setCouponInfo] = useState<string | null>(null);

  const handleGenerateCoupon = async () => {
    if (!selectedOrgId) return;
    try {
      setCouponGenerating(true);
      setCouponInfo(null);
      const coupon = await subscriptionIntelligenceService.generatePersonalizedCoupon(selectedOrgId);
      setGeneratedCoupon(coupon);
    } catch (err: any) {
      const msg = err.message || '';
      const isNoPromo = msg.includes('NoPromotion') || msg.includes('No promotion');
      if (isNoPromo) {
        setCouponInfo(isFr
          ? 'Aucune promotion recommandée pour cette organisation actuellement.'
          : 'No promotion is recommended for this organization at this time.');
      } else {
        setDataError(msg || (isFr ? 'Erreur lors de la génération du coupon' : 'Failed to generate coupon'));
      }
    } finally {
      setCouponGenerating(false);
    }
  };

  // ── Validate Coupon ────────────────────────────────────────────────────
  const handleValidateCoupon = async () => {
    if (!couponCode.trim() || !selectedOrgId) return;
    try {
      setValidating(true);
      setValidationResult(null);
      const result = await subscriptionIntelligenceService.validateCoupon(couponCode.trim(), selectedOrgId);
      setValidationResult(result);
    } catch (err: any) {
      setValidationResult({
        isValid: false,
        discountPercent: 0,
        errorMessage: err.message || (isFr ? 'Erreur de validation' : 'Validation failed'),
      });
    } finally {
      setValidating(false);
    }
  };

  // ── Copy to Clipboard ─────────────────────────────────────────────────
  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // ── Derived ────────────────────────────────────────────────────────────
  const selectedOrg = organizations.find((o) => o.id === selectedOrgId);
  const filteredOrgs = organizations.filter((o) =>
    o.name.toLowerCase().includes(orgSearch.toLowerCase())
  );

  const engagement = intelligence?.engagement;
  const churn = intelligence?.churn;
  const upgrade = intelligence?.upgrade;

  // ── Render ─────────────────────────────────────────────────────────────
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
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                {t('Subscription Intelligence', 'Intelligence Abonnements')}
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                {t(
                  'ML-driven analytics: engagement, churn risk, upgrade propensity & promotions',
                  'Analyses ML : engagement, risque de churn, propension d\'upgrade & promotions'
                )}
              </p>
            </div>
          </div>
          {selectedOrgId && (
            <button
              onClick={() => loadIntelligence(selectedOrgId)}
              disabled={dataLoading}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <RefreshCw className={cn('w-4 h-4', dataLoading && 'animate-spin')} />
              {t('Refresh', 'Actualiser')}
            </button>
          )}
        </div>
      </motion.div>

      {/* ── Organization Selector ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5"
      >
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('Select Organization', 'Sélectionner une organisation')}
        </label>

        {orgsLoading ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            {t('Loading organizations...', 'Chargement des organisations...')}
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertTriangle className="w-4 h-4" />
            {error}
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-colors',
                'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800',
                'hover:border-gray-300 dark:hover:border-gray-600',
                'focus:outline-none focus:ring-2 focus:ring-emerald-500/40'
              )}
            >
              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-gray-400" />
                {selectedOrg ? (
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">{selectedOrg.name}</span>
                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                      ({selectedOrg.memberCount} {t('members', 'membres')})
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-500 dark:text-gray-400">
                    {t('Choose an organization...', 'Choisir une organisation...')}
                  </span>
                )}
              </div>
              <ChevronDown className={cn('w-5 h-5 text-gray-400 transition-transform', dropdownOpen && 'rotate-180')} />
            </button>

            {dropdownOpen && (
              <div className="absolute z-50 mt-2 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl max-h-72 overflow-hidden">
                <div className="p-2 border-b border-gray-100 dark:border-gray-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={orgSearch}
                      onChange={(e) => setOrgSearch(e.target.value)}
                      placeholder={t('Search organizations...', 'Rechercher...')}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                      autoFocus
                    />
                  </div>
                </div>
                <div className="overflow-y-auto max-h-56">
                  {filteredOrgs.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
                      {t('No organizations found', 'Aucune organisation trouvée')}
                    </div>
                  ) : (
                    filteredOrgs.map((org) => (
                      <button
                        key={org.id}
                        onClick={() => handleOrgSelect(org.id)}
                        className={cn(
                          'w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
                          selectedOrgId === org.id && 'bg-emerald-50 dark:bg-emerald-900/20'
                        )}
                      >
                        <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <span className="block text-sm font-medium text-gray-900 dark:text-white truncate">
                            {org.name}
                          </span>
                        </div>
                        <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                          <Users className="w-3 h-3" />
                          {org.memberCount}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>

      {/* ── Empty State ── */}
      {!selectedOrgId && !dataLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center"
        >
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('Select an organization to begin', 'Sélectionnez une organisation pour commencer')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            {t(
              'Choose an organization above to view ML-driven engagement scoring, churn prediction, upgrade propensity, and promotional recommendations.',
              'Choisissez une organisation ci-dessus pour voir le score d\'engagement ML, la prédiction de churn, la propension d\'upgrade et les recommandations promotionnelles.'
            )}
          </p>
        </motion.div>
      )}

      {/* ── Loading State ── */}
      {dataLoading && (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {t('Analyzing organization data...', 'Analyse des données en cours...')}
            </p>
          </div>
        </div>
      )}

      {/* ── Data Error ── */}
      {dataError && !dataLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-5 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-800 dark:text-red-300">
              {t('Error loading intelligence data', 'Erreur de chargement des données')}
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{dataError}</p>
          </div>
        </motion.div>
      )}

      {/* ── Intelligence Dashboard ── */}
      {intelligence && !dataLoading && (
        <div className="space-y-6">
          {/* ── Section 1: Engagement Score ── */}
          <SectionCard
            title={t('Engagement Score', 'Score d\'engagement')}
            icon={BarChart3}
            delay={0.1}
          >
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Gauge */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <CircularGauge
                    value={engagement?.score ?? 0}
                    color={gaugeStroke(engagement?.level ?? 'low')}
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {engagement?.score ?? 0}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">/100</span>
                  </div>
                </div>
                <span className={cn('px-3 py-1 rounded-full text-xs font-semibold uppercase', riskColor(engagement?.level ?? ''))}>
                  {engagement?.level === 'low'
                    ? t('Low', 'Faible')
                    : engagement?.level === 'medium'
                      ? t('Medium', 'Moyen')
                      : t('High', 'Élevé')}
                </span>
              </div>

              {/* Signal Breakdown */}
              <div className="flex-1 space-y-3">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t('Signal Breakdown', 'Détail des signaux')}
                </h3>
                {engagement?.signals && Object.keys(engagement.signals).length > 0 ? (
                  Object.entries(engagement.signals).map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {typeof value === 'number' ? value.toFixed(1) : value}
                        </span>
                      </div>
                      <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-700"
                          style={{ width: `${Math.min(100, Math.max(0, Number(value)))}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                    {t('No signal data available', 'Aucune donnée de signal disponible')}
                  </p>
                )}
              </div>
            </div>
          </SectionCard>

          {/* ── Section 2: Churn Prediction ── */}
          <SectionCard
            title={t('Churn Prediction', 'Prédiction de Churn')}
            icon={ShieldAlert}
            delay={0.15}
          >
            <div className="space-y-5">
              {/* Risk Level + Probability */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {t('Risk Level', 'Niveau de risque')}:
                  </span>
                  <span className={cn('inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase', riskColor(churn?.riskLevel ?? ''))}>
                    <span className={cn('w-2 h-2 rounded-full', riskDotColor(churn?.riskLevel ?? ''))} />
                    {churn?.riskLevel === 'low'
                      ? t('Low', 'Faible')
                      : churn?.riskLevel === 'medium'
                        ? t('Medium', 'Moyen')
                        : t('High', 'Élevé')}
                  </span>
                </div>

                {churn?.daysToLikelyChurn != null && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">
                      {t('Days to likely churn', 'Jours avant churn probable')}:
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {churn.daysToLikelyChurn}
                    </span>
                  </div>
                )}
              </div>

              {/* Probability Bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {t('Churn Probability', 'Probabilité de churn')}
                  </span>
                  <span className="font-bold text-gray-900 dark:text-white">
                    {((churn?.churnProbability ?? 0) * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700',
                      (churn?.churnProbability ?? 0) > 0.7 ? 'bg-gradient-to-r from-red-400 to-red-600' :
                      (churn?.churnProbability ?? 0) > 0.4 ? 'bg-gradient-to-r from-amber-400 to-amber-600' :
                      'bg-gradient-to-r from-emerald-400 to-emerald-600'
                    )}
                    style={{ width: `${Math.min(100, (churn?.churnProbability ?? 0) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Risk Factors */}
              {churn?.riskFactors && churn.riskFactors.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('Risk Factors', 'Facteurs de risque')}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {churn.riskFactors.map((factor, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-100 dark:border-red-800/50"
                      >
                        <AlertTriangle className="w-3 h-3" />
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Recommended Action */}
              {churn?.recommendedAction && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Zap className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                        {t('Recommended Action', 'Action recommandée')}
                      </h4>
                      <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                        {churn.recommendedAction}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>

          {/* ── Section 3: Upgrade Propensity ── */}
          <SectionCard
            title={t('Upgrade Propensity', 'Propension d\'upgrade')}
            icon={ArrowUpCircle}
            delay={0.2}
          >
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Gauge */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <CircularGauge
                    value={(upgrade?.upgradeProbability ?? 0) * 100}
                    size={140}
                    color="#8b5cf6"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      {((upgrade?.upgradeProbability ?? 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {t('Upgrade Probability', 'Probabilité d\'upgrade')}
                </span>
              </div>

              {/* Details */}
              <div className="flex-1 space-y-4">
                {/* Recommended Plan */}
                {upgrade?.recommendedPlan && (
                  <div className="flex items-center gap-3">
                    <Target className="w-5 h-5 text-purple-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t('Recommended Plan', 'Plan recommandé')}:
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300">
                      {upgrade.recommendedPlan}
                    </span>
                  </div>
                )}

                {/* Suggested Promotion Type */}
                {upgrade?.suggestedPromotionType && (
                  <div className="flex items-center gap-3">
                    <Gift className="w-5 h-5 text-pink-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {t('Suggested Promotion', 'Promotion suggérée')}:
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300">
                      {upgrade.suggestedPromotionType}
                    </span>
                  </div>
                )}

                {/* Upgrade Signals */}
                {upgrade?.upgradeSignals && upgrade.upgradeSignals.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('Upgrade Signals', 'Signaux d\'upgrade')}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {upgrade.upgradeSignals.map((signal, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border border-violet-100 dark:border-violet-800/50"
                        >
                          <TrendingUp className="w-3 h-3" />
                          {signal}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* No signals */}
                {(!upgrade?.upgradeSignals || upgrade.upgradeSignals.length === 0) &&
                  !upgrade?.recommendedPlan && (
                  <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                    {t('No upgrade signals detected', 'Aucun signal d\'upgrade détecté')}
                  </p>
                )}
              </div>
            </div>
          </SectionCard>

          {/* ── Section 4: Promotions & Coupons ── */}
          <SectionCard
            title={t('Promotions & Coupons', 'Promotions & Coupons')}
            icon={Gift}
            delay={0.25}
          >
            <div className="space-y-6">
              {/* Active Promotions */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t('Active Promotions', 'Promotions actives')}
                </h3>
                {promotions.length > 0 ? (
                  <div className="space-y-3">
                    {promotions.map((promo, i) => (
                      <div
                        key={i}
                        className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Tag className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {promo.promotionType}
                          </span>
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                            -{promo.discountPercent}%
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                          {promo.targetPlan && (
                            <span className="px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                              {promo.targetPlan}
                            </span>
                          )}
                          <span className={cn('px-2 py-0.5 rounded-full font-medium uppercase', riskColor(promo.urgency))}>
                            {promo.urgency}
                          </span>
                          {promo.expiresAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(promo.expiresAt).toLocaleDateString(isFr ? 'fr-CA' : 'en-CA')}
                            </span>
                          )}
                          {promo.couponCode && (
                            <code className="px-2 py-0.5 rounded bg-gray-200 dark:bg-gray-700 font-mono text-gray-800 dark:text-gray-200">
                              {promo.couponCode}
                            </code>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                    {t('No active promotions', 'Aucune promotion active')}
                  </p>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 dark:border-gray-800" />

              {/* Generate Coupon */}
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('Generate Personalized Coupon', 'Générer un coupon personnalisé')}
                  </h3>
                  <button
                    onClick={handleGenerateCoupon}
                    disabled={couponGenerating}
                    className={cn(
                      'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-colors',
                      'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm',
                      'hover:from-emerald-600 hover:to-teal-700',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    {couponGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {t('Generate Coupon', 'Générer un coupon')}
                  </button>
                </div>

                {/* No Promotion Info */}
                {couponInfo && (
                  <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 flex items-center gap-3">
                    <Tag className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <p className="text-sm text-blue-700 dark:text-blue-400">{couponInfo}</p>
                  </div>
                )}

                {/* Generated Coupon Result */}
                {generatedCoupon && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-5 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <code className="text-lg font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-white dark:bg-gray-800 px-4 py-2 rounded-lg border border-emerald-200 dark:border-emerald-700">
                          {generatedCoupon.code}
                        </code>
                        <button
                          onClick={() => handleCopy(generatedCoupon.code)}
                          className="p-2 rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
                          title={t('Copy code', 'Copier le code')}
                        >
                          {copiedCode ? (
                            <Check className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-500" />
                          )}
                        </button>
                      </div>
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        -{generatedCoupon.discountPercent}%
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">{t('Type', 'Type')}: </span>
                        <span className="font-medium text-gray-900 dark:text-white">{generatedCoupon.promotionType}</span>
                      </div>
                      {generatedCoupon.targetPlan && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">{t('Target Plan', 'Plan cible')}: </span>
                          <span className="font-medium text-gray-900 dark:text-white">{generatedCoupon.targetPlan}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">{t('Valid Until', 'Valide jusqu\'au')}: </span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {new Date(generatedCoupon.validUntil).toLocaleDateString(isFr ? 'fr-CA' : 'en-CA')}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      {generatedCoupon.reason}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 dark:border-gray-800" />

              {/* Validate Coupon */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  {t('Validate Coupon', 'Valider un coupon')}
                </h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setValidationResult(null);
                    }}
                    placeholder={t('Enter coupon code...', 'Entrer le code du coupon...')}
                    className="flex-1 px-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
                    onKeyDown={(e) => e.key === 'Enter' && handleValidateCoupon()}
                  />
                  <button
                    onClick={handleValidateCoupon}
                    disabled={validating || !couponCode.trim()}
                    className={cn(
                      'inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-colors',
                      'bg-gray-900 dark:bg-white text-white dark:text-gray-900',
                      'hover:bg-gray-800 dark:hover:bg-gray-100',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    {validating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4" />
                    )}
                    {t('Validate', 'Valider')}
                  </button>
                </div>

                {/* Validation Result */}
                {validationResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      'mt-3 p-4 rounded-xl border text-sm',
                      validationResult.isValid
                        ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    )}
                  >
                    {validationResult.isValid ? (
                      <div className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-emerald-800 dark:text-emerald-300">
                            {t('Valid Coupon', 'Coupon valide')}
                          </p>
                          <p className="text-emerald-700 dark:text-emerald-400 mt-1">
                            {t('Discount', 'Remise')}: {validationResult.discountPercent}%
                            {validationResult.targetPlan && ` — ${t('Plan', 'Plan')}: ${validationResult.targetPlan}`}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-semibold text-red-800 dark:text-red-300">
                            {t('Invalid Coupon', 'Coupon invalide')}
                          </p>
                          {validationResult.errorMessage && (
                            <p className="text-red-700 dark:text-red-400 mt-1">
                              {validationResult.errorMessage}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}
