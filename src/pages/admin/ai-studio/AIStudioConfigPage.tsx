import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Database,
  Server,
  Zap,
  Settings2,
  Layers,
  ArrowLeft,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  ShieldCheck,
  Clock,
  ArrowRight,
  X,
  Info,
  FlaskConical,
  KeyRound,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  aiConfigService,
  AIConfiguration,
  ProviderTestResponse,
  SectionOverride,
} from '../../../lib/ai-config-service';
import { modelRegistryService, KnownModel } from '../../../lib/model-registry-service';
import { cn } from '../../../lib/utils';

// ── Constants ──────────────────────────────────────────

interface SectionDef {
  key: string;
  label: { en: string; fr: string };
}

interface SectionGroup {
  id: string;
  name: { en: string; fr: string };
  sections: SectionDef[];
}

const SECTION_GROUPS: SectionGroup[] = [
  {
    id: 'business-plan',
    name: { en: 'Business Plan', fr: "Plan d'affaires" },
    sections: [
      { key: 'ExecutiveSummary', label: { en: 'Executive Summary', fr: 'Résumé exécutif' } },
      { key: 'CompanyOverview', label: { en: 'Company Overview', fr: "Vue d'ensemble" } },
      { key: 'MarketAnalysis', label: { en: 'Market Analysis', fr: 'Analyse de marché' } },
      { key: 'ProductsServices', label: { en: 'Products & Services', fr: 'Produits et services' } },
      { key: 'MarketingStrategy', label: { en: 'Marketing Strategy', fr: 'Stratégie marketing' } },
      { key: 'OperationsPlan', label: { en: 'Operations Plan', fr: "Plan d'opérations" } },
      { key: 'ManagementTeam', label: { en: 'Management Team', fr: 'Équipe de direction' } },
      { key: 'FinancialProjections', label: { en: 'Financial Projections', fr: 'Projections financières' } },
      { key: 'FundingRequest', label: { en: 'Funding Request', fr: 'Demande de financement' } },
      { key: 'SWOTAnalysis', label: { en: 'SWOT Analysis', fr: 'Analyse SWOT' } },
      { key: 'RiskAssessment', label: { en: 'Risk Assessment', fr: 'Évaluation des risques' } },
    ],
  },
  {
    id: 'lean-canvas',
    name: { en: 'Lean Canvas', fr: 'Lean Canvas' },
    sections: [
      { key: 'Problem', label: { en: 'Problem', fr: 'Problème' } },
      { key: 'Solution', label: { en: 'Solution', fr: 'Solution' } },
      { key: 'UniqueValueProposition', label: { en: 'Unique Value Proposition', fr: 'Proposition de valeur' } },
      { key: 'Channels', label: { en: 'Channels', fr: 'Canaux' } },
      { key: 'CustomerSegments', label: { en: 'Customer Segments', fr: 'Segments clients' } },
      { key: 'CostStructure', label: { en: 'Cost Structure', fr: 'Structure des coûts' } },
      { key: 'RevenueStreams', label: { en: 'Revenue Streams', fr: 'Sources de revenus' } },
    ],
  },
  {
    id: 'obnl',
    name: { en: 'OBNL (Non-profit)', fr: 'OBNL (Organisme à but non lucratif)' },
    sections: [
      { key: 'MissionVision', label: { en: 'Mission & Vision', fr: 'Mission et vision' } },
      { key: 'ImpactMeasurement', label: { en: 'Impact Measurement', fr: "Mesure d'impact" } },
      { key: 'GovernanceStructure', label: { en: 'Governance Structure', fr: 'Structure de gouvernance' } },
    ],
  },
];

const ALL_SECTIONS = SECTION_GROUPS.flatMap((g) => g.sections);

const PROVIDERS = ['OpenAI', 'Claude', 'Gemini'] as const;
type Provider = (typeof PROVIDERS)[number];

const PROVIDER_META: Record<Provider, { color: string; bg: string; light: string; text: string; icon: string }> = {
  OpenAI: { color: '#10b981', bg: 'bg-emerald-500', light: 'bg-emerald-500/10', text: 'text-emerald-500', icon: 'O' },
  Claude: { color: '#f97316', bg: 'bg-orange-500', light: 'bg-orange-500/10', text: 'text-orange-500', icon: 'C' },
  Gemini: { color: '#3b82f6', bg: 'bg-blue-500', light: 'bg-blue-500/10', text: 'text-blue-500', icon: 'G' },
};

// ── Translations ───────────────────────────────────────

function useTranslations(lang: string) {
  return useMemo(() => {
    const fr = lang === 'fr';
    return {
      title: fr ? 'Configuration IA' : 'AI Configuration',
      subtitle: fr
        ? 'Gérez les clés API, modèles et fournisseurs IA en temps réel'
        : 'Manage AI API keys, models, and providers in real time',
      back: fr ? 'Retour à AI Studio' : 'Back to AI Studio',

      // Provider section
      activeProvider: fr ? 'Fournisseur principal' : 'Primary Provider',
      activeProviderDesc: fr
        ? 'Le fournisseur IA utilisé par défaut pour toutes les générations'
        : 'The default AI provider used for all generations',
      fallbackProviders: fr ? 'Fournisseurs de secours' : 'Fallback Providers',
      fallbackProvidersDesc: fr
        ? 'Utilisés automatiquement si le fournisseur principal échoue (dans l\'ordre)'
        : 'Used automatically if the primary provider fails (in order)',

      // Provider cards
      providerConfig: fr ? 'Configuration des fournisseurs' : 'Provider Configuration',
      apiKey: fr ? 'Clé API' : 'API Key',
      model: fr ? 'Modèle' : 'Model',
      configured: fr ? 'Configuré' : 'Configured',
      notConfigured: fr ? 'Non configuré' : 'Not configured',
      source: fr ? 'Source' : 'Source',
      sourceDb: fr ? 'Base de données' : 'Database',
      sourceEnv: fr ? 'Variable d\'environnement' : 'Environment variable',

      // Test
      testKey: fr ? 'Tester la clé' : 'Test Key',
      testing: fr ? 'Test en cours...' : 'Testing...',
      testSuccess: fr ? 'Connexion réussie' : 'Connection successful',
      testFailed: fr ? 'Échec de connexion' : 'Connection failed',
      testLatency: fr ? 'Latence' : 'Latency',
      testModel: fr ? 'Modèle utilisé' : 'Model used',
      enterKeyFirst: fr ? 'Entrez une clé API d\'abord' : 'Enter an API key first',

      // Section overrides
      sectionOverrides: fr ? 'Remplacements par section' : 'Section Overrides',
      sectionOverridesDesc: fr
        ? 'Optionnel : utiliser un fournisseur IA différent pour certaines sections'
        : 'Optional: use a different AI provider for specific sections',
      useDefault: fr ? 'Par défaut' : 'Default',
      overrides: fr ? 'remplacement(s)' : 'override(s)',

      // Save / Confirm
      reviewAndSave: fr ? 'Vérifier et enregistrer' : 'Review & Save',
      saving: fr ? 'Enregistrement...' : 'Saving...',
      saveSuccess: fr ? 'Configuration enregistrée avec succès!' : 'Configuration saved successfully!',
      noChanges: fr ? 'Aucun changement détecté' : 'No changes detected',

      // Confirmation dialog
      confirmTitle: fr ? 'Confirmer les modifications' : 'Confirm Changes',
      confirmSubtitle: fr
        ? 'Les modifications suivantes seront appliquées immédiatement à tous les utilisateurs :'
        : 'The following changes will be applied immediately to all users:',
      changeActiveProvider: fr ? 'Changement du fournisseur principal' : 'Primary provider change',
      changeFallbacks: fr ? 'Modification de la chaîne de secours' : 'Fallback chain change',
      changeApiKey: fr ? 'Nouvelle clé API' : 'New API key',
      changeModel: fr ? 'Changement de modèle' : 'Model change',
      changeSectionOverrides: fr ? 'Modifications des remplacements par section' : 'Section override changes',
      from: fr ? 'de' : 'from',
      to: fr ? 'vers' : 'to',
      confirmApply: fr ? 'Appliquer les modifications' : 'Apply Changes',
      confirmCancel: fr ? 'Annuler' : 'Cancel',
      impactWarning: fr
        ? 'Ces modifications prendront effet immédiatement. Toutes les nouvelles générations IA utiliseront cette configuration.'
        : 'These changes take effect immediately. All new AI generations will use this configuration.',
      sectionsAffected: fr ? 'sections affectées' : 'sections affected',
      allSections: fr ? 'Toutes les sections' : 'All sections',

      // Registry
      refreshRegistry: fr ? 'Actualiser les modèles' : 'Refresh Models',

      // Short labels & accessibility
      setActive: fr ? 'Activer' : 'Set Active',
      fallbackLabel: fr ? 'Secours' : 'Fallback',
      addFallback: fr ? '+ Secours' : '+ Fallback',
      none: fr ? 'Aucun' : 'None',
      showKey: fr ? 'Afficher la clé' : 'Show key',
      hideKey: fr ? 'Masquer la clé' : 'Hide key',
      dismiss: fr ? 'Fermer' : 'Dismiss',
      errorLoad: fr ? 'Impossible de charger la configuration' : 'Failed to load configuration',
      errorSave: fr ? 'Impossible d\'enregistrer la configuration' : 'Failed to save configuration',
      errorRefresh: fr ? 'Impossible d\'actualiser le registre' : 'Failed to refresh model registry',
      errorLoadShort: fr ? 'Échec du chargement' : 'Failed to load configuration',
    };
  }, [lang]);
}

// ── Change Detection ───────────────────────────────────

interface PendingChange {
  type: 'activeProvider' | 'fallbacks' | 'apiKey' | 'model' | 'sectionOverrides';
  provider?: string;
  from?: string;
  to?: string;
  detail?: string;
}

function detectChanges(
  config: AIConfiguration,
  selectedActiveProvider: string,
  selectedFallbacks: string[],
  editedApiKeys: Record<string, string>,
  editedModels: Record<string, string>,
  sectionOverrides: Record<string, SectionOverride>,
  originalSectionOverrides: Record<string, SectionOverride>,
  noneLabel: string
): PendingChange[] {
  const changes: PendingChange[] = [];

  // Active provider changed
  if (selectedActiveProvider !== config.activeProvider) {
    changes.push({
      type: 'activeProvider',
      from: config.activeProvider,
      to: selectedActiveProvider,
    });
  }

  // Fallbacks changed
  const originalFallbacks = config.fallbackProviders.join(', ') || noneLabel;
  const newFallbacks = selectedFallbacks.join(', ') || noneLabel;
  if (originalFallbacks !== newFallbacks) {
    changes.push({
      type: 'fallbacks',
      from: originalFallbacks,
      to: newFallbacks,
    });
  }

  // API keys changed
  for (const provider of PROVIDERS) {
    const newKey = editedApiKeys[provider];
    if (newKey && newKey.trim().length > 0) {
      changes.push({
        type: 'apiKey',
        provider,
        detail: `${newKey.slice(0, 8)}...`,
      });
    }
  }

  // Models changed
  for (const provider of PROVIDERS) {
    const currentModel = config.providers[provider]?.model;
    const newModel = editedModels[provider];
    if (newModel && newModel !== currentModel) {
      changes.push({
        type: 'model',
        provider,
        from: currentModel,
        to: newModel,
      });
    }
  }

  // Section overrides changed
  const origKeys = Object.keys(originalSectionOverrides);
  const newKeys = Object.keys(sectionOverrides);
  const allKeys = new Set([...origKeys, ...newKeys]);
  let overrideChanges = 0;
  for (const key of allKeys) {
    const orig = originalSectionOverrides[key];
    const curr = sectionOverrides[key];
    if (orig?.provider !== curr?.provider) overrideChanges++;
  }
  if (overrideChanges > 0) {
    changes.push({
      type: 'sectionOverrides',
      detail: `${overrideChanges}`,
    });
  }

  return changes;
}

// ── Confirmation Dialog ────────────────────────────────

function ConfirmationDialog({
  changes,
  t,
  lang,
  saving,
  onConfirm,
  onCancel,
  selectedActiveProvider,
  sectionOverrides,
}: {
  changes: PendingChange[];
  t: ReturnType<typeof useTranslations>;
  lang: string;
  saving: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  selectedActiveProvider: string;
  sectionOverrides: Record<string, SectionOverride>;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);

  // Auto-focus cancel button + Escape key handler
  useEffect(() => {
    cancelRef.current?.focus();
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  // Count how many sections use each provider
  const sectionCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const section of ALL_SECTIONS) {
      const override = sectionOverrides[section.key];
      const provider = override?.provider || selectedActiveProvider;
      counts[provider] = (counts[provider] || 0) + 1;
    }
    return counts;
  }, [sectionOverrides, selectedActiveProvider]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Dialog */}
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 id="confirm-dialog-title" className="text-lg font-semibold text-gray-900 dark:text-white">{t.confirmTitle}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t.confirmSubtitle}</p>
            </div>
          </div>
        </div>

        {/* Changes list */}
        <div className="p-6 space-y-3 max-h-[50vh] overflow-y-auto">
          {changes.map((change) => (
            <div
              key={`${change.type}-${change.provider ?? ''}`}
              className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700/50"
            >
              <ChangeIcon type={change.type} />
              <div className="flex-1 min-w-0">
                <ChangeLabel change={change} t={t} />
                <ChangeDetail change={change} t={t} />
              </div>
            </div>
          ))}

          {/* Impact summary */}
          <div className="mt-4 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-700 dark:text-blue-300">
                <p className="font-medium mb-1">{t.impactWarning}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Object.entries(sectionCounts).map(([provider, count]) => {
                    const meta = PROVIDER_META[provider as Provider];
                    return meta ? (
                      <span
                        key={provider}
                        className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', meta.light, meta.text)}
                      >
                        {provider}: {count} {t.sectionsAffected}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
          <button
            ref={cancelRef}
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {t.confirmCancel}
          </button>
          <button
            onClick={onConfirm}
            disabled={saving}
            className="px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 transition-all shadow-lg shadow-orange-500/25 flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {t.saving}
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                {t.confirmApply}
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ChangeIcon({ type }: { type: PendingChange['type'] }) {
  const iconClass = 'w-4 h-4 flex-shrink-0 mt-0.5';
  switch (type) {
    case 'activeProvider':
      return <Zap className={cn(iconClass, 'text-amber-500')} />;
    case 'fallbacks':
      return <RefreshCw className={cn(iconClass, 'text-blue-500')} />;
    case 'apiKey':
      return <KeyRound className={cn(iconClass, 'text-purple-500')} />;
    case 'model':
      return <Brain className={cn(iconClass, 'text-emerald-500')} />;
    case 'sectionOverrides':
      return <Layers className={cn(iconClass, 'text-indigo-500')} />;
  }
}

function ChangeLabel({ change, t }: { change: PendingChange; t: ReturnType<typeof useTranslations> }) {
  const labels: Record<PendingChange['type'], string> = {
    activeProvider: t.changeActiveProvider,
    fallbacks: t.changeFallbacks,
    apiKey: t.changeApiKey,
    model: t.changeModel,
    sectionOverrides: t.changeSectionOverrides,
  };
  const suffix = change.provider ? ` (${change.provider})` : '';
  return (
    <p className="text-sm font-medium text-gray-900 dark:text-white">
      {labels[change.type]}{suffix}
    </p>
  );
}

function ChangeDetail({ change, t }: { change: PendingChange; t: ReturnType<typeof useTranslations> }) {
  if (change.from && change.to) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        <span className="px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded">
          {change.from}
        </span>
        <ArrowRight className="w-3 h-3" />
        <span className="px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded">
          {change.to}
        </span>
      </div>
    );
  }
  if (change.detail) {
    return (
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
        {change.type === 'sectionOverrides'
          ? `${change.detail} ${t.sectionsAffected}`
          : change.detail}
      </p>
    );
  }
  return null;
}

// ── Test Result Badge ──────────────────────────────────

function TestResultBadge({ result, t }: { result: ProviderTestResponse; t: ReturnType<typeof useTranslations> }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'mt-3 p-3 rounded-xl border',
        result.success
          ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800/50'
          : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/50'
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        {result.success ? (
          <CheckCircle className="w-4 h-4 text-green-500" />
        ) : (
          <XCircle className="w-4 h-4 text-red-500" />
        )}
        <span className={cn('text-sm font-medium', result.success ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400')}>
          {result.success ? t.testSuccess : t.testFailed}
        </span>
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {t.testLatency}: {result.responseTimeMs}ms
        </span>
        {result.modelUsed && (
          <span className="flex items-center gap-1">
            <Brain className="w-3 h-3" />
            {t.testModel}: {result.modelUsed}
          </span>
        )}
      </div>
      {result.errorDetails && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 rounded-lg p-2">
          {result.errorDetails}
        </p>
      )}
    </motion.div>
  );
}

// ── Provider Card ──────────────────────────────────────

function ProviderCard({
  provider,
  providerInfo,
  isActive,
  isFallback,
  fallbackIndex,
  editedApiKey,
  editedModel,
  showApiKey,
  testResult,
  isTesting,
  models,
  t,
  onApiKeyChange,
  onModelChange,
  onToggleShowKey,
  onTest,
  onSetActive,
  onToggleFallback,
}: {
  provider: Provider;
  providerInfo: { isConfigured: boolean; model: string; apiKeyPreview: string; source?: string } | undefined;
  isActive: boolean;
  isFallback: boolean;
  fallbackIndex: number;
  editedApiKey: string;
  editedModel: string;
  showApiKey: boolean;
  testResult: ProviderTestResponse | undefined;
  isTesting: boolean;
  models: string[];
  t: ReturnType<typeof useTranslations>;
  onApiKeyChange: (val: string) => void;
  onModelChange: (val: string) => void;
  onToggleShowKey: () => void;
  onTest: () => void;
  onSetActive: () => void;
  onToggleFallback: () => void;
}) {
  const meta = PROVIDER_META[provider];
  const hasKey = providerInfo?.isConfigured || (editedApiKey && editedApiKey.trim().length > 0);

  return (
    <motion.div
      layout
      className={cn(
        'rounded-2xl border-2 p-5 transition-all',
        isActive
          ? `border-current ${meta.text} shadow-lg shadow-${provider === 'OpenAI' ? 'emerald' : provider === 'Claude' ? 'orange' : 'blue'}-500/10`
          : 'border-gray-200 dark:border-gray-700'
      )}
    >
      {/* Card header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg', meta.bg)}>
            {meta.icon}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{provider}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              {hasKey ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  {t.configured}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full">
                  <AlertCircle className="w-3 h-3" />
                  {t.notConfigured}
                </span>
              )}
              {providerInfo?.source && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full">
                  {providerInfo.source === 'Database' ? <Database className="w-3 h-3" /> : <Server className="w-3 h-3" />}
                  {providerInfo.source === 'Database' ? t.sourceDb : t.sourceEnv}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Role badges */}
        <div className="flex flex-col items-end gap-1">
          {isActive && (
            <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-full', meta.light, meta.text)}>
              <Zap className="w-3 h-3" />
              {t.setActive}
            </span>
          )}
          {isFallback && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
              #{fallbackIndex + 1} {t.fallbackLabel}
            </span>
          )}
        </div>
      </div>

      {/* API Key input */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
          {t.apiKey}
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={editedApiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              placeholder={providerInfo?.apiKeyPreview || 'sk-...'}
              className="w-full px-3 py-2.5 pr-10 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all placeholder:text-gray-400"
            />
            <button
              type="button"
              onClick={onToggleShowKey}
              aria-label={showApiKey ? t.hideKey : t.showKey}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <button
            onClick={onTest}
            disabled={isTesting || (!hasKey && !editedApiKey)}
            className={cn(
              'px-3.5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-all border',
              isTesting
                ? 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-400'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
              (!hasKey && !editedApiKey) && 'opacity-40 cursor-not-allowed'
            )}
          >
            {isTesting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FlaskConical className="w-4 h-4" />
            )}
            {isTesting ? t.testing : t.testKey}
          </button>
        </div>
        {testResult && <TestResultBadge result={testResult} t={t} />}
      </div>

      {/* Model selector */}
      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 uppercase tracking-wider">
          {t.model}
        </label>
        <select
          value={editedModel}
          onChange={(e) => onModelChange(e.target.value)}
          className="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500 transition-all"
        >
          {models.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-2">
        {!isActive && (
          <button
            onClick={onSetActive}
            disabled={!hasKey}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              hasKey
                ? `${meta.light} ${meta.text} hover:opacity-80`
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
            )}
          >
            <Zap className="w-3 h-3 inline mr-1" />
            {t.setActive}
          </button>
        )}
        {!isActive && (
          <button
            onClick={onToggleFallback}
            disabled={!hasKey}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
              isFallback
                ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                : hasKey
                  ? 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  : 'border-gray-200 dark:border-gray-700 text-gray-400 cursor-not-allowed'
            )}
          >
            {isFallback ? (
              <>
                <CheckCircle className="w-3 h-3 inline mr-1" />
                {t.fallbackLabel} #{fallbackIndex + 1}
              </>
            ) : (
              <>{t.addFallback}</>
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
}

// ── Main Page ──────────────────────────────────────────

export function AIStudioConfigPage() {
  const { language } = useTheme();
  const t = useTranslations(language);

  const [config, setConfig] = useState<AIConfiguration | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Editable state
  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({});
  const [editedApiKeys, setEditedApiKeys] = useState<Record<string, string>>({});
  const [editedModels, setEditedModels] = useState<Record<string, string>>({});
  const [selectedActiveProvider, setSelectedActiveProvider] = useState<string>('OpenAI');
  const [selectedFallbacks, setSelectedFallbacks] = useState<string[]>([]);

  // Testing
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, ProviderTestResponse>>({});

  // Section overrides
  const [sectionOverrides, setSectionOverrides] = useState<Record<string, SectionOverride>>({});
  const [originalSectionOverrides, setOriginalSectionOverrides] = useState<Record<string, SectionOverride>>({});
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Model registry
  const [availableModels, setAvailableModels] = useState<Record<string, KnownModel[]>>({});
  const [refreshingRegistry, setRefreshingRegistry] = useState(false);

  // Confirmation dialog
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);

  const loadConfiguration = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [configData, overridesData, registry] = await Promise.all([
        aiConfigService.getConfiguration(),
        aiConfigService.getSectionOverrides().catch(() => ({})),
        modelRegistryService.getConfig().catch(() => null),
      ]);

      setConfig(configData);
      setSelectedActiveProvider(configData.activeProvider);
      setSelectedFallbacks(configData.fallbackProviders);
      setSectionOverrides(overridesData);
      setOriginalSectionOverrides(overridesData);

      if (registry?.knownModels) {
        setAvailableModels(registry.knownModels);
      }

      const models: Record<string, string> = {};
      Object.entries(configData.providers).forEach(([key, info]) => {
        models[key] = info.model;
      });
      setEditedModels(models);
    } catch {
      setError(t.errorLoad);
    } finally {
      setLoading(false);
    }
  }, [t.errorLoad]);

  useEffect(() => {
    loadConfiguration();
  }, [loadConfiguration]);

  const handleRefreshRegistry = async () => {
    try {
      setRefreshingRegistry(true);
      await modelRegistryService.refreshCache();
      const registry = await modelRegistryService.getConfig();
      if (registry.knownModels) {
        setAvailableModels(registry.knownModels);
      }
    } catch {
      setError(t.errorRefresh);
    } finally {
      setRefreshingRegistry(false);
    }
  };

  const getModelsForProvider = (provider: string): string[] => {
    const registryModels = availableModels[provider];
    if (registryModels && registryModels.length > 0) {
      return registryModels.map((m) => m.id || m.name);
    }
    const STATIC_MODELS: Record<string, string[]> = {
      OpenAI: ['gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano', 'o3', 'o4-mini'],
      Claude: ['claude-sonnet-4-6', 'claude-opus-4-6', 'claude-haiku-4-5-20251001'],
      Gemini: ['gemini-2.5-flash', 'gemini-2.5-pro'],
    };
    return STATIC_MODELS[provider] || [];
  };

  const handleTestProvider = async (providerName: string) => {
    if (!config) return;

    const apiKey = editedApiKeys[providerName] || '';
    if (!apiKey && !config.providers[providerName]?.isConfigured) {
      setError(t.enterKeyFirst);
      return;
    }

    try {
      setTestingProvider(providerName);
      setError(null);
      // Clear previous result for this provider
      setTestResults((prev) => {
        const updated = { ...prev };
        delete updated[providerName];
        return updated;
      });

      const result = await aiConfigService.testProvider(providerName, {
        apiKey: apiKey || 'existing',
        model: editedModels[providerName],
      });

      setTestResults((prev) => ({ ...prev, [providerName]: result }));
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [providerName]: {
          success: false,
          message: err.message || 'Test failed',
          responseTimeMs: 0,
          modelUsed: editedModels[providerName],
          errorDetails: err.response?.data?.message || err.message,
        },
      }));
    } finally {
      setTestingProvider(null);
    }
  };

  const handleSectionOverrideChange = (sectionKey: string, provider: string | null) => {
    if (provider === null || provider === 'default') {
      const newOverrides = { ...sectionOverrides };
      delete newOverrides[sectionKey];
      setSectionOverrides(newOverrides);
    } else {
      setSectionOverrides({
        ...sectionOverrides,
        [sectionKey]: { provider, model: editedModels[provider] },
      });
    }
  };

  const toggleFallback = (provider: string) => {
    if (provider === selectedActiveProvider) return;
    if (selectedFallbacks.includes(provider)) {
      setSelectedFallbacks(selectedFallbacks.filter((p) => p !== provider));
    } else {
      setSelectedFallbacks([...selectedFallbacks, provider]);
    }
  };

  const toggleGroup = (group: string) => {
    setExpandedGroups({ ...expandedGroups, [group]: !expandedGroups[group] });
  };

  // Review & Save: detect changes, show confirmation
  const handleReviewAndSave = () => {
    if (!config) return;
    const changes = detectChanges(
      config,
      selectedActiveProvider,
      selectedFallbacks,
      editedApiKeys,
      editedModels,
      sectionOverrides,
      originalSectionOverrides,
      t.none
    );

    if (changes.length === 0) {
      setSuccessMessage(t.noChanges);
      setTimeout(() => setSuccessMessage(null), 3000);
      return;
    }

    setPendingChanges(changes);
    setShowConfirmDialog(true);
  };

  // Confirmed save
  const handleConfirmedSave = async () => {
    if (!config) return;

    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const request = {
        activeProvider: selectedActiveProvider,
        fallbackProviders: selectedFallbacks,
        providers: {} as Record<string, { apiKey?: string; model: string }>,
      };

      Object.keys(config.providers).forEach((providerName) => {
        const newKey = editedApiKeys[providerName];
        request.providers[providerName] = {
          apiKey: newKey && newKey.trim().length > 0 ? newKey : undefined,
          model: editedModels[providerName],
        };
      });

      await Promise.all([
        aiConfigService.updateConfiguration(request),
        aiConfigService.updateSectionOverrides(sectionOverrides),
      ]);

      setShowConfirmDialog(false);
      setSuccessMessage(t.saveSuccess);
      await loadConfiguration();
      setEditedApiKeys({});
      setTestResults({});

      setTimeout(() => setSuccessMessage(null), 4000);
    } catch {
      setError(t.errorSave);
      setShowConfirmDialog(false);
    } finally {
      setSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-gray-600 dark:text-gray-400">{t.errorLoadShort}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Header ───────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-800 dark:via-slate-900 dark:to-black p-6 md:p-8"
      >
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
              backgroundSize: '24px 24px',
            }}
          />
        </div>
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-slate-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gray-500/20 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/admin/ai-studio" aria-label={t.back} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center shadow-lg shadow-slate-500/25">
              <Settings2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{t.title}</h1>
              <p className="text-slate-400 mt-1">{t.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefreshRegistry}
              disabled={refreshingRegistry}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-sm font-medium text-slate-300 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn('w-4 h-4', refreshingRegistry && 'animate-spin')} />
              {t.refreshRegistry}
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-500/10 border border-slate-500/20">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-sm font-medium text-slate-400">{selectedActiveProvider}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Messages ─────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-red-700 dark:text-red-400 flex-1">{error}</p>
            <button onClick={() => setError(null)} aria-label={t.dismiss} className="text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-start gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <p className="text-green-700 dark:text-green-400">{successMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Provider Cards ───────────────── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-5 h-5 text-purple-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.providerConfig}</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {PROVIDERS.map((provider) => (
            <ProviderCard
              key={provider}
              provider={provider}
              providerInfo={config.providers[provider]}
              isActive={selectedActiveProvider === provider}
              isFallback={selectedFallbacks.includes(provider)}
              fallbackIndex={selectedFallbacks.indexOf(provider)}
              editedApiKey={editedApiKeys[provider] || ''}
              editedModel={editedModels[provider] || ''}
              showApiKey={showApiKeys[provider] || false}
              testResult={testResults[provider]}
              isTesting={testingProvider === provider}
              models={getModelsForProvider(provider)}
              t={t}
              onApiKeyChange={(val) => setEditedApiKeys({ ...editedApiKeys, [provider]: val })}
              onModelChange={(val) => setEditedModels({ ...editedModels, [provider]: val })}
              onToggleShowKey={() => setShowApiKeys({ ...showApiKeys, [provider]: !showApiKeys[provider] })}
              onTest={() => handleTestProvider(provider)}
              onSetActive={() => setSelectedActiveProvider(provider)}
              onToggleFallback={() => toggleFallback(provider)}
            />
          ))}
        </div>
      </div>

      {/* ── Section Overrides ────────────── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-2">
          <Layers className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.sectionOverrides}</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{t.sectionOverridesDesc}</p>

        <div className="space-y-4">
          {SECTION_GROUPS.map((group) => {
            const groupLabel = group.name[language === 'fr' ? 'fr' : 'en'];
            return (
            <div key={group.id} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
              <button
                onClick={() => toggleGroup(group.id)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <span className="font-medium text-gray-900 dark:text-white">{groupLabel}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {group.sections.filter((s) => sectionOverrides[s.key]).length} / {group.sections.length} {t.overrides}
                  </span>
                  {expandedGroups[group.id] ? (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {expandedGroups[group.id] && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 space-y-3 border-t border-gray-200 dark:border-gray-700">
                      {group.sections.map((section) => {
                        const override = sectionOverrides[section.key];
                        const label = section.label[language === 'fr' ? 'fr' : 'en'];

                        return (
                          <div key={section.key} className="flex items-center justify-between gap-4">
                            <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{label}</span>
                            <select
                              value={override?.provider || 'default'}
                              onChange={(e) =>
                                handleSectionOverrideChange(section.key, e.target.value === 'default' ? null : e.target.value)
                              }
                              className={cn(
                                'px-3 py-1.5 text-sm border rounded-lg transition-colors',
                                override?.provider
                                  ? `${PROVIDER_META[override.provider as Provider]?.light} ${PROVIDER_META[override.provider as Provider]?.text} border-current`
                                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                              )}
                            >
                              <option value="default">
                                {t.useDefault} ({selectedActiveProvider})
                              </option>
                              {PROVIDERS.map((provider) => (
                                <option key={provider} value={provider}>
                                  {provider}
                                </option>
                              ))}
                            </select>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            );
          })}
        </div>
      </div>

      {/* ── Save Button ──────────────────── */}
      <div className="flex justify-end">
        <button
          onClick={handleReviewAndSave}
          disabled={saving}
          className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium rounded-xl hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 transition-all shadow-lg shadow-orange-500/25 flex items-center gap-2"
        >
          <ShieldCheck className="w-5 h-5" />
          {t.reviewAndSave}
        </button>
      </div>

      {/* ── Confirmation Dialog ──────────── */}
      <AnimatePresence>
        {showConfirmDialog && (
          <ConfirmationDialog
            changes={pendingChanges}
            t={t}
            lang={language}
            saving={saving}
            onConfirm={handleConfirmedSave}
            onCancel={() => setShowConfirmDialog(false)}
            selectedActiveProvider={selectedActiveProvider}
            sectionOverrides={sectionOverrides}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default AIStudioConfigPage;
