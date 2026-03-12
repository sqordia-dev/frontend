import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Activity,
  RefreshCw,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  Brain,
  Gauge,
  Beaker,
  ChevronDown,
  CheckCircle,
  XCircle,
  Clock,
  Search,
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  mlService,
  type QualityDriftReport,
  type QualityDriftAlert,
  type LearnedPreference,
  type TrainingResult,
  type QualityPrediction,
  type QualityPredictionRequest,
} from '../../../lib/ml-service';
import { cn } from '../../../lib/utils';

// ── Constants ───────────────────────────────────────────

const SECTION_TYPES = [
  'ExecutiveSummary',
  'MarketAnalysis',
  'CompetitiveAnalysis',
  'MarketingStrategy',
  'OperationsPlan',
  'FinancialProjections',
  'ManagementTeam',
  'ProductsServices',
  'CompanyOverview',
  'RiskAnalysis',
  'GrowthStrategy',
  'SocialImpact',
  'LegalStructure',
  'FundingRequirements',
  'Appendices',
];

const PROVIDERS = ['OpenAI', 'Claude', 'Gemini'];

type TabId = 'drift' | 'preferences' | 'training' | 'prediction';

// ── Translations ────────────────────────────────────────

function useTranslations() {
  const { language } = useTheme();
  const fr = language === 'fr';

  return {
    title: fr ? 'Monitoring ML' : 'ML Monitoring',
    subtitle: fr
      ? 'Surveillez la qualité, les drifts et les modèles ML'
      : 'Monitor quality, drift, and ML models',
    back: fr ? 'Retour \u00e0 AI Studio' : 'Back to AI Studio',
    refresh: fr ? 'Actualiser' : 'Refresh',
    // Tabs
    tabDrift: fr ? 'Drift Qualit\u00e9' : 'Quality Drift',
    tabPreferences: fr ? 'Pr\u00e9f\u00e9rences Apprises' : 'Learned Preferences',
    tabTraining: fr ? 'Entra\u00eenement' : 'Model Training',
    tabPrediction: fr ? 'Pr\u00e9diction' : 'Quality Prediction',
    // Drift tab
    healthy: fr ? 'Syst\u00e8me en sant\u00e9' : 'System Healthy',
    unhealthy: fr ? 'Probl\u00e8mes d\u00e9tect\u00e9s' : 'Issues Detected',
    monitoredSections: fr ? 'Sections surveill\u00e9es' : 'Monitored Sections',
    totalSamples: fr ? '\u00c9chantillons totaux' : 'Total Samples',
    lastChecked: fr ? 'Derni\u00e8re v\u00e9rification' : 'Last Checked',
    noAlerts: fr ? 'Tout est en ordre \u2014 aucun drift de qualit\u00e9 d\u00e9tect\u00e9' : 'All clear \u2014 no quality drift detected',
    section: fr ? 'Section' : 'Section',
    metric: fr ? 'M\u00e9trique' : 'Metric',
    severity: fr ? 'S\u00e9v\u00e9rit\u00e9' : 'Severity',
    current: fr ? 'Actuel' : 'Current',
    baseline: fr ? 'R\u00e9f\u00e9rence' : 'Baseline',
    deviation: fr ? 'D\u00e9viation' : 'Deviation',
    detected: fr ? 'D\u00e9tect\u00e9' : 'Detected',
    // Preferences tab
    filterSection: fr ? 'Type de section' : 'Section Type',
    filterIndustry: fr ? 'Industrie' : 'Industry',
    filterLanguage: fr ? 'Langue' : 'Language',
    all: fr ? 'Toutes' : 'All',
    key: fr ? 'Cl\u00e9' : 'Key',
    value: fr ? 'Valeur' : 'Value',
    confidence: fr ? 'Confiance' : 'Confidence',
    samples: fr ? '\u00c9chantillons' : 'Samples',
    updated: fr ? 'Mis \u00e0 jour' : 'Updated',
    noPreferences: fr ? 'Aucune pr\u00e9f\u00e9rence apprise pour ces filtres' : 'No learned preferences for these filters',
    // Training tab
    triggerTraining: fr ? 'Lancer l\u2019entra\u00eenement' : 'Trigger Training',
    trainingInProgress: fr ? 'Entra\u00eenement en cours\u2026' : 'Training in progress\u2026',
    trainingSuccess: fr ? 'Entra\u00eenement r\u00e9ussi' : 'Training Successful',
    trainingFailed: fr ? 'Entra\u00eenement \u00e9chou\u00e9' : 'Training Failed',
    samplesUsed: fr ? '\u00c9chantillons utilis\u00e9s' : 'Samples Used',
    modelVersion: fr ? 'Version du mod\u00e8le' : 'Model Version',
    trainedAt: fr ? 'Entra\u00een\u00e9 \u00e0' : 'Trained At',
    metrics: fr ? 'M\u00e9triques' : 'Metrics',
    trainingHistory: fr ? 'Historique' : 'History',
    noTrainingYet: fr ? 'Aucun entra\u00eenement effectu\u00e9. Cliquez pour lancer.' : 'No training runs yet. Click to start.',
    // Prediction tab
    sectionType: fr ? 'Type de section' : 'Section Type',
    provider: fr ? 'Fournisseur' : 'Provider',
    model: fr ? 'Mod\u00e8le' : 'Model',
    language: fr ? 'Langue' : 'Language',
    temperature: fr ? 'Temp\u00e9rature' : 'Temperature',
    wordCount: fr ? 'Nombre de mots' : 'Word Count',
    inputTokens: fr ? 'Tokens entr\u00e9e' : 'Input Tokens',
    outputTokens: fr ? 'Tokens sortie' : 'Output Tokens',
    completeness: fr ? 'Compl\u00e9tude questionnaire' : 'Questionnaire Completeness',
    hasBusinessBrief: fr ? 'Business brief pr\u00e9sent' : 'Has Business Brief',
    predict: fr ? 'Pr\u00e9dire' : 'Predict',
    predictedScore: fr ? 'Score pr\u00e9dit' : 'Predicted Score',
    shouldRegenerate: fr ? 'R\u00e9g\u00e9n\u00e9rer ?' : 'Should Regenerate?',
    yes: fr ? 'Oui' : 'Yes',
    no: fr ? 'Non' : 'No',
    reason: fr ? 'Raison' : 'Reason',
    // Common
    error: fr
      ? 'Erreur de chargement. Vérifiez que le service ML (ai-service, port 8100) est en cours d\u2019exécution.'
      : 'Failed to load data. Ensure the ML service (ai-service, port 8100) is running.',
  };
}

// ── Severity Badge ──────────────────────────────────────

const severityColors: Record<QualityDriftAlert['severity'], { bg: string; text: string; dot: string }> = {
  low: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', dot: 'bg-blue-500' },
  medium: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-400', dot: 'bg-amber-500' },
  high: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-400', dot: 'bg-orange-500' },
  critical: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', dot: 'bg-red-500' },
};

const SeverityBadge: React.FC<{ severity: QualityDriftAlert['severity'] }> = ({ severity }) => {
  const c = severityColors[severity];
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium', c.bg, c.text)}>
      <span className={cn('w-1.5 h-1.5 rounded-full', c.dot)} />
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  );
};

// ── Stagger helpers ─────────────────────────────────────

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

// ── Component ───────────────────────────────────────────

export function AIStudioMLMonitoringPage() {
  const { language } = useTheme();
  const t = useTranslations();

  const [activeTab, setActiveTab] = useState<TabId>('drift');

  // ---- Drift state ----
  const [driftReport, setDriftReport] = useState<QualityDriftReport | null>(null);
  const [driftLoading, setDriftLoading] = useState(false);
  const [driftError, setDriftError] = useState(false);

  // ---- Preferences state ----
  const [preferences, setPreferences] = useState<LearnedPreference[]>([]);
  const [prefsLoading, setPrefsLoading] = useState(false);
  const [prefsError, setPrefsError] = useState(false);
  const [prefSection, setPrefSection] = useState('');
  const [prefIndustry, setPrefIndustry] = useState('');
  const [prefLang, setPrefLang] = useState<'fr' | 'en'>(language === 'fr' ? 'fr' : 'en');

  // ---- Training state ----
  const [trainingLoading, setTrainingLoading] = useState(false);
  const [trainingHistory, setTrainingHistory] = useState<TrainingResult[]>([]);

  // ---- Prediction state ----
  const [predictionResult, setPredictionResult] = useState<QualityPrediction | null>(null);
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [predForm, setPredForm] = useState<QualityPredictionRequest>({
    sectionType: 'ExecutiveSummary',
    language: language === 'fr' ? 'fr' : 'en',
    wordCount: 500,
    temperature: 0.7,
    provider: 'OpenAI',
    model: 'gpt-4.1',
    inputTokens: 2000,
    outputTokens: 1500,
    questionnaireCompleteness: 0.8,
    hasBusinessBrief: true,
  });

  // ── Data loaders ──────────────────────────────────────

  const loadDrift = useCallback(async () => {
    setDriftLoading(true);
    setDriftError(false);
    try {
      const data = await mlService.getQualityDrift();
      setDriftReport(data);
    } catch {
      setDriftError(true);
    } finally {
      setDriftLoading(false);
    }
  }, []);

  const loadPreferences = useCallback(async () => {
    setPrefsLoading(true);
    setPrefsError(false);
    try {
      const data = await mlService.getLearnedPreferences(
        prefSection || undefined,
        prefIndustry || undefined,
        prefLang,
      );
      setPreferences(data);
    } catch {
      setPrefsError(true);
    } finally {
      setPrefsLoading(false);
    }
  }, [prefSection, prefIndustry, prefLang]);

  const runTraining = async () => {
    setTrainingLoading(true);
    try {
      const result = await mlService.triggerTraining();
      setTrainingHistory((prev) => [result, ...prev]);
    } catch (err) {
      const failedResult: TrainingResult = {
        success: false,
        message: err instanceof Error ? err.message : 'Training failed',
        samplesUsed: 0,
        metrics: {},
        trainedAt: new Date().toISOString(),
      };
      setTrainingHistory((prev) => [failedResult, ...prev]);
    } finally {
      setTrainingLoading(false);
    }
  };

  const runPrediction = async () => {
    setPredictionLoading(true);
    setPredictionResult(null);
    try {
      const result = await mlService.predictQuality(predForm);
      setPredictionResult(result);
    } catch {
      setPredictionResult(null);
    } finally {
      setPredictionLoading(false);
    }
  };

  // ── Load data on tab switch ───────────────────────────

  useEffect(() => {
    if (activeTab === 'drift' && !driftReport && !driftLoading) loadDrift();
  }, [activeTab, driftReport, driftLoading, loadDrift]);

  useEffect(() => {
    if (activeTab === 'preferences') loadPreferences();
  }, [activeTab, prefSection, prefIndustry, prefLang]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Tab config ────────────────────────────────────────

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'drift', label: t.tabDrift, icon: AlertTriangle },
    { id: 'preferences', label: t.tabPreferences, icon: Brain },
    { id: 'training', label: t.tabTraining, icon: Gauge },
    { id: 'prediction', label: t.tabPrediction, icon: Beaker },
  ];

  // ── Formatters ────────────────────────────────────────

  const fmtDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString(language === 'fr' ? 'fr-CA' : 'en-CA', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return iso;
    }
  };

  const fmtPercent = (v: number) => `${(v * 100).toFixed(1)}%`;

  // ── Render ────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Header ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-800 dark:via-slate-900 dark:to-black p-6 md:p-8"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
              backgroundSize: '24px 24px',
            }}
          />
        </div>

        {/* Gradient orbs */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/admin/ai-studio" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{t.title}</h1>
              <p className="text-slate-400 mt-1">{t.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (activeTab === 'drift') loadDrift();
                if (activeTab === 'preferences') loadPreferences();
              }}
              disabled={driftLoading || prefsLoading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn('w-4 h-4', (driftLoading || prefsLoading) && 'animate-spin')} />
              {t.refresh}
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Tabs ───────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all',
                active
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/25'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-800 hover:border-cyan-300 dark:hover:border-cyan-700',
              )}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── Tab Content ────────────────────────────────── */}

      {/* ====== DRIFT ====== */}
      {activeTab === 'drift' && (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
          {driftLoading && !driftReport ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
            </div>
          ) : driftError ? (
            <div className="text-center py-20 text-gray-500">{t.error}</div>
          ) : driftReport ? (
            <>
              {/* Summary banner */}
              <motion.div
                variants={fadeUp}
                className={cn(
                  'rounded-2xl border p-6 flex flex-col md:flex-row md:items-center gap-6',
                  driftReport.overallHealthy
                    ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800',
                )}
              >
                <div className="flex items-center gap-3 flex-shrink-0">
                  {driftReport.overallHealthy ? (
                    <ShieldCheck className="w-8 h-8 text-green-600 dark:text-green-400" />
                  ) : (
                    <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                  )}
                  <div>
                    <p className={cn(
                      'text-lg font-semibold',
                      driftReport.overallHealthy
                        ? 'text-green-800 dark:text-green-300'
                        : 'text-red-800 dark:text-red-300',
                    )}>
                      {driftReport.overallHealthy ? t.healthy : t.unhealthy}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {(driftReport.alerts?.length ?? 0)} {language === 'fr' ? 'alerte(s)' : 'alert(s)'}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 md:ml-auto text-sm">
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">{t.monitoredSections}</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{driftReport.monitoredSections ?? 0}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">{t.totalSamples}</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{(driftReport.totalSamples ?? 0).toLocaleString()}</p>
                  </div>
                  <div>
                    <span className="text-gray-500 dark:text-gray-400">{t.lastChecked}</span>
                    <p className="font-semibold text-gray-900 dark:text-white">{fmtDate(driftReport.lastCheckedAt)}</p>
                  </div>
                </div>
              </motion.div>

              {/* Alert cards */}
              {(!driftReport.alerts || driftReport.alerts.length === 0) ? (
                <motion.div
                  variants={fadeUp}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center"
                >
                  <ShieldCheck className="w-12 h-12 mx-auto mb-4 text-green-500" />
                  <p className="text-gray-500 dark:text-gray-400">{t.noAlerts}</p>
                </motion.div>
              ) : (
                <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-3">
                  {(driftReport.alerts ?? []).map((alert, i) => (
                    <motion.div
                      key={`${alert.sectionType}-${alert.metric}-${i}`}
                      variants={fadeUp}
                      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                        <span className="font-semibold text-gray-900 dark:text-white">{alert.sectionType}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{alert.metric}</span>
                        <div className="sm:ml-auto">
                          <SeverityBadge severity={alert.severity} />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">{t.current}</span>
                          <p className="font-medium text-gray-900 dark:text-white">{alert.currentValue.toFixed(3)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">{t.baseline}</span>
                          <p className="font-medium text-gray-900 dark:text-white">{alert.baselineValue.toFixed(3)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">{t.deviation}</span>
                          <p className={cn(
                            'font-medium',
                            alert.deviation > 0 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400',
                          )}>
                            {alert.deviation > 0 ? '+' : ''}{fmtPercent(alert.deviation)}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">{t.detected}</span>
                          <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {fmtDate(alert.detectedAt)}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </>
          ) : null}
        </motion.div>
      )}

      {/* ====== PREFERENCES ====== */}
      {activeTab === 'preferences' && (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
          {/* Filters */}
          <motion.div
            variants={fadeUp}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5"
          >
            <div className="flex flex-wrap gap-4 items-end">
              {/* Section filter */}
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  {t.filterSection}
                </label>
                <div className="relative">
                  <select
                    value={prefSection}
                    onChange={(e) => setPrefSection(e.target.value)}
                    className="w-full appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 pr-8 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    <option value="">{t.all}</option>
                    {SECTION_TYPES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Industry filter */}
              <div className="flex-1 min-w-[180px]">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  {t.filterIndustry}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={prefIndustry}
                    onChange={(e) => setPrefIndustry(e.target.value)}
                    placeholder={language === 'fr' ? 'ex: Technologie' : 'e.g. Technology'}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Language toggle */}
              <div className="min-w-[120px]">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  {t.filterLanguage}
                </label>
                <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                  {(['fr', 'en'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setPrefLang(lang)}
                      className={cn(
                        'flex-1 px-4 py-2 text-sm font-medium transition-colors',
                        prefLang === lang
                          ? 'bg-cyan-600 text-white'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700',
                      )}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Table */}
          <motion.div
            variants={fadeUp}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden"
          >
            {prefsLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
              </div>
            ) : prefsError ? (
              <div className="text-center py-20 text-gray-500">{t.error}</div>
            ) : preferences.length === 0 ? (
              <div className="text-center py-16">
                <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">{t.noPreferences}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      {[t.section, t.key, t.value, t.confidence, t.samples, t.updated].map((h) => (
                        <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {preferences.map((pref) => (
                      <tr key={pref.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-5 py-3 text-sm font-medium text-gray-900 dark:text-white">{pref.sectionType}</td>
                        <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">{pref.preferenceKey}</td>
                        <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">{pref.preferenceValue}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700 max-w-[100px]">
                              <div
                                className={cn(
                                  'h-full rounded-full transition-all',
                                  pref.confidence >= 0.7 ? 'bg-green-500' : pref.confidence >= 0.4 ? 'bg-amber-500' : 'bg-red-500',
                                )}
                                style={{ width: `${Math.min(pref.confidence * 100, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 w-10 text-right">{fmtPercent(pref.confidence)}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400">{pref.sampleCount}</td>
                        <td className="px-5 py-3 text-sm text-gray-500 dark:text-gray-400">{fmtDate(pref.updatedAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* ====== TRAINING ====== */}
      {activeTab === 'training' && (
        <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
          {/* Control panel */}
          <motion.div
            variants={fadeUp}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 text-center"
          >
            <Gauge className="w-12 h-12 mx-auto mb-4 text-cyan-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {language === 'fr' ? 'Entra\u00eenement du mod\u00e8le ML' : 'ML Model Training'}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
              {language === 'fr'
                ? 'Lancez un cycle d\u2019entra\u00eenement pour mettre \u00e0 jour le mod\u00e8le de pr\u00e9diction de qualit\u00e9 avec les derni\u00e8res donn\u00e9es.'
                : 'Run a training cycle to update the quality prediction model with the latest data.'}
            </p>
            <button
              onClick={runTraining}
              disabled={trainingLoading}
              className={cn(
                'inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all',
                trainingLoading
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-600/25 hover:scale-[1.02] active:scale-[0.98]',
              )}
            >
              {trainingLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.trainingInProgress}
                </>
              ) : (
                <>
                  <Gauge className="w-4 h-4" />
                  {t.triggerTraining}
                </>
              )}
            </button>
          </motion.div>

          {/* History */}
          <motion.div variants={fadeUp}>
            <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
              {t.trainingHistory}
            </h3>

            {trainingHistory.length === 0 ? (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
                <Clock className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">{t.noTrainingYet}</p>
              </div>
            ) : (
              <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-4">
                {trainingHistory.map((run, i) => (
                  <motion.div
                    key={`${run.trainedAt}-${i}`}
                    variants={fadeUp}
                    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5"
                  >
                    {/* Header row */}
                    <div className="flex items-center gap-3 mb-4">
                      {run.success ? (
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      )}
                      <span className={cn(
                        'font-semibold',
                        run.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400',
                      )}>
                        {run.success ? t.trainingSuccess : t.trainingFailed}
                      </span>
                      <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {fmtDate(run.trainedAt)}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">{run.message}</p>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500 dark:text-gray-400">{t.samplesUsed}</span>
                        <p className="font-medium text-gray-900 dark:text-white">{run.samplesUsed.toLocaleString()}</p>
                      </div>
                      {run.modelVersion && (
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">{t.modelVersion}</span>
                          <p className="font-medium text-gray-900 dark:text-white">{run.modelVersion}</p>
                        </div>
                      )}
                    </div>

                    {/* Metrics */}
                    {Object.keys(run.metrics).length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          {t.metrics}
                        </span>
                        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                          {Object.entries(run.metrics).map(([key, value]) => (
                            <div key={key} className="bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400">{key}</span>
                              <p className="font-mono text-sm font-medium text-gray-900 dark:text-white">{value.toFixed(4)}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* ====== PREDICTION SANDBOX ====== */}
      {activeTab === 'prediction' && (
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <motion.div
            variants={fadeUp}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6"
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <Beaker className="w-5 h-5 text-cyan-500" />
              {language === 'fr' ? 'Bac \u00e0 sable de pr\u00e9diction' : 'Prediction Sandbox'}
            </h3>

            <div className="space-y-4">
              {/* Section type */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t.sectionType}</label>
                <div className="relative">
                  <select
                    value={predForm.sectionType}
                    onChange={(e) => setPredForm((f) => ({ ...f, sectionType: e.target.value }))}
                    className="w-full appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 pr-8 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  >
                    {SECTION_TYPES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Provider + Model row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t.provider}</label>
                  <div className="relative">
                    <select
                      value={predForm.provider}
                      onChange={(e) => setPredForm((f) => ({ ...f, provider: e.target.value }))}
                      className="w-full appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 pr-8 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    >
                      {PROVIDERS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t.model}</label>
                  <input
                    type="text"
                    value={predForm.model}
                    onChange={(e) => setPredForm((f) => ({ ...f, model: e.target.value }))}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Language toggle */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t.language}</label>
                <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 w-fit">
                  {(['fr', 'en'] as const).map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setPredForm((f) => ({ ...f, language: lang }))}
                      className={cn(
                        'px-5 py-2 text-sm font-medium transition-colors',
                        predForm.language === lang
                          ? 'bg-cyan-600 text-white'
                          : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700',
                      )}
                    >
                      {lang.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Temperature slider */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  {t.temperature}: <span className="font-mono text-gray-900 dark:text-white">{predForm.temperature.toFixed(2)}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={predForm.temperature}
                  onChange={(e) => setPredForm((f) => ({ ...f, temperature: parseFloat(e.target.value) }))}
                  className="w-full accent-cyan-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0</span>
                  <span>1</span>
                </div>
              </div>

              {/* Word count */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t.wordCount}</label>
                <input
                  type="number"
                  min={0}
                  value={predForm.wordCount}
                  onChange={(e) => setPredForm((f) => ({ ...f, wordCount: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              {/* Tokens row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t.inputTokens}</label>
                  <input
                    type="number"
                    min={0}
                    value={predForm.inputTokens}
                    onChange={(e) => setPredForm((f) => ({ ...f, inputTokens: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">{t.outputTokens}</label>
                  <input
                    type="number"
                    min={0}
                    value={predForm.outputTokens}
                    onChange={(e) => setPredForm((f) => ({ ...f, outputTokens: parseInt(e.target.value) || 0 }))}
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Completeness slider */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  {t.completeness}: <span className="font-mono text-gray-900 dark:text-white">{fmtPercent(predForm.questionnaireCompleteness)}</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={predForm.questionnaireCompleteness}
                  onChange={(e) => setPredForm((f) => ({ ...f, questionnaireCompleteness: parseFloat(e.target.value) }))}
                  className="w-full accent-cyan-600"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0%</span>
                  <span>100%</span>
                </div>
              </div>

              {/* Has business brief */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={predForm.hasBusinessBrief}
                  onChange={(e) => setPredForm((f) => ({ ...f, hasBusinessBrief: e.target.checked }))}
                  className="w-4 h-4 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">{t.hasBusinessBrief}</span>
              </label>

              {/* Submit */}
              <button
                onClick={runPrediction}
                disabled={predictionLoading}
                className={cn(
                  'w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold transition-all mt-2',
                  predictionLoading
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:shadow-lg hover:shadow-cyan-600/25 hover:scale-[1.02] active:scale-[0.98]',
                )}
              >
                {predictionLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {language === 'fr' ? 'Analyse en cours\u2026' : 'Analyzing\u2026'}
                  </>
                ) : (
                  <>
                    <Activity className="w-4 h-4" />
                    {t.predict}
                  </>
                )}
              </button>
            </div>
          </motion.div>

          {/* Results */}
          <motion.div variants={fadeUp} className="space-y-6">
            {predictionResult ? (
              <>
                {/* Score gauge */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                  <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-6">
                    {t.predictedScore}
                  </h4>
                  <div className="flex flex-col items-center">
                    {/* Circular gauge */}
                    <div className="relative w-40 h-40 mb-4">
                      <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                        {/* Background track */}
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="currentColor"
                          className="text-gray-200 dark:text-gray-700"
                          strokeWidth="10"
                        />
                        {/* Value arc */}
                        <circle
                          cx="60"
                          cy="60"
                          r="50"
                          fill="none"
                          stroke="url(#gaugeGrad)"
                          strokeWidth="10"
                          strokeLinecap="round"
                          strokeDasharray={`${predictionResult.predictedScore * 314.16} 314.16`}
                        />
                        <defs>
                          <linearGradient id="gaugeGrad" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor="#06b6d4" />
                            <stop offset="100%" stopColor="#2563eb" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold text-gray-900 dark:text-white">
                          {(predictionResult.predictedScore * 100).toFixed(0)}
                        </span>
                        <span className="text-xs text-gray-500">/100</span>
                      </div>
                    </div>

                    {/* Confidence */}
                    <div className="text-center mb-4">
                      <span className="text-sm text-gray-500 dark:text-gray-400">{t.confidence}: </span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{fmtPercent(predictionResult.confidence)}</span>
                    </div>

                    {/* Should regenerate badge */}
                    <div className={cn(
                      'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium',
                      predictionResult.shouldRegenerate
                        ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                        : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
                    )}>
                      {predictionResult.shouldRegenerate ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      {t.shouldRegenerate} {predictionResult.shouldRegenerate ? t.yes : t.no}
                    </div>
                  </div>
                </div>

                {/* Reason */}
                {predictionResult.reason && (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
                    <h4 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                      {t.reason}
                    </h4>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{predictionResult.reason}</p>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center h-full flex flex-col items-center justify-center min-h-[300px]">
                <Beaker className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400">
                  {language === 'fr'
                    ? 'Configurez les param\u00e8tres et lancez une pr\u00e9diction'
                    : 'Configure parameters and run a prediction'}
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default AIStudioMLMonitoringPage;
