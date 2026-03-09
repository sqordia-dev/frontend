import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Flag,
  AlertTriangle,
  RefreshCw,
  Plus,
  Search,
  Sparkles,
  FileOutput,
  Crown,
  Calendar,
  Clock,
  X,
  Check,
  Zap,
  Shield,
  Settings2,
} from 'lucide-react';
import { useFeatureFlagsAdmin } from '../../hooks/useFeatureFlag';
import {
  FeatureFlag,
  FeatureFlagType,
  FeatureFlagState,
  CreateFeatureFlagRequest,
} from '../../lib/feature-flags-service';
import { Button } from '../../components/ui/button';
import { cn } from '../../lib/utils';

// ── Category config ─────────────────────────────────────────────
const categoryConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  AI: {
    icon: <Sparkles className="w-4 h-4" />,
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
  },
  Export: {
    icon: <FileOutput className="w-4 h-4" />,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
  },
  Premium: {
    icon: <Crown className="w-4 h-4" />,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
  },
  General: {
    icon: <Settings2 className="w-4 h-4" />,
    color: 'text-gray-600 dark:text-gray-400',
    bg: 'bg-gray-100 dark:bg-gray-800',
  },
};

// ── Toggle switch ───────────────────────────────────────────────
function Toggle({
  enabled,
  onChange,
  disabled,
}: {
  enabled: boolean;
  onChange: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-950',
        enabled
          ? 'bg-emerald-500 focus:ring-emerald-500'
          : 'bg-gray-300 dark:bg-gray-600 focus:ring-gray-400',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
      role="switch"
      aria-checked={enabled}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200',
          enabled ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  );
}

// ── Single flag row ─────────────────────────────────────────────
function FlagRow({
  flag,
  onToggle,
  isToggling,
  t,
  language,
}: {
  flag: FeatureFlag;
  onToggle: (name: string, enabled: boolean) => void;
  isToggling: boolean;
  t: (key: string) => string;
  language: string;
}) {
  const getDescription = () => {
    const key = `admin.featureFlags.desc.${flag.name}`;
    const translated = t(key);
    return translated !== key ? translated : flag.description || '';
  };

  const isStale =
    flag.state === FeatureFlagState.Stale ||
    flag.state === FeatureFlagState.PotentiallyStale;

  const isExpiringSoon = flag.expiresAt && new Date(flag.expiresAt) < new Date(Date.now() + 7 * 86400000);

  return (
    <div
      className={cn(
        'group flex items-center gap-4 px-4 py-3 -mx-4 rounded-lg transition-colors',
        'hover:bg-gray-50 dark:hover:bg-white/[0.02]',
      )}
    >
      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {flag.name}
          </span>
          {flag.type === FeatureFlagType.Temporary && (
            <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
              <Clock className="w-2.5 h-2.5" />
              {t('admin.featureFlags.type.Temporary')}
            </span>
          )}
          {isStale && (
            <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400">
              <AlertTriangle className="w-2.5 h-2.5" />
              {t('admin.featureFlags.state.Stale')}
            </span>
          )}
          {isExpiringSoon && !isStale && (
            <span className="shrink-0 inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium rounded bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
              <Calendar className="w-2.5 h-2.5" />
              {language === 'fr' ? 'Expire bientôt' : 'Expiring soon'}
            </span>
          )}
        </div>
        {getDescription() && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            {getDescription()}
          </p>
        )}
      </div>

      {/* Toggle */}
      <Toggle
        enabled={flag.isEnabled}
        onChange={() => onToggle(flag.name, !flag.isEnabled)}
        disabled={isToggling}
      />
    </div>
  );
}

// ── Category group (collapsible) ────────────────────────────────
function CategoryGroup({
  category,
  flags,
  onToggle,
  isToggling,
  t,
  language,
  defaultOpen = true,
}: {
  category: string;
  flags: FeatureFlag[];
  onToggle: (name: string, enabled: boolean) => void;
  isToggling: boolean;
  t: (key: string) => string;
  language: string;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const config = categoryConfig[category] || categoryConfig.General;
  const enabledCount = flags.filter((f) => f.isEnabled).length;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
      {/* Category header — clickable to collapse */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-3 w-full px-5 py-3.5 text-left transition-colors',
          'hover:bg-gray-50 dark:hover:bg-white/[0.02]',
          isOpen && 'border-b border-gray-100 dark:border-gray-800',
        )}
      >
        <div className={cn('p-1.5 rounded-lg', config.bg, config.color)}>
          {config.icon}
        </div>
        <span className="text-sm font-semibold text-gray-900 dark:text-white">
          {t(`admin.featureFlags.category.${category}`)}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto tabular-nums mr-2">
          {enabledCount}/{flags.length}
        </span>
        <svg
          className={cn('w-4 h-4 text-gray-400 transition-transform duration-200', isOpen && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Flag rows — collapsible */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 py-1 divide-y divide-gray-100 dark:divide-gray-800/50">
              {flags.map((flag) => (
                <FlagRow
                  key={flag.name}
                  flag={flag}
                  onToggle={onToggle}
                  isToggling={isToggling}
                  t={t}
                  language={language}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Create flag modal ───────────────────────────────────────────
function CreateFlagModal({
  isOpen,
  onClose,
  onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: CreateFeatureFlagRequest) => Promise<void>;
}) {
  const { t } = useTheme();
  const [formData, setFormData] = useState<CreateFeatureFlagRequest>({
    name: '',
    description: '',
    category: 'General',
    tags: [],
    type: FeatureFlagType.Permanent,
    isEnabled: false,
  });
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError(t('admin.featureFlags.modal.nameRequired'));
      return;
    }
    if (formData.type === FeatureFlagType.Temporary && !formData.expiresAt) {
      setError(t('admin.featureFlags.modal.expirationRequired'));
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      await onCreate(formData);
      onClose();
      setFormData({ name: '', description: '', category: 'General', tags: [], type: FeatureFlagType.Permanent, isEnabled: false });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.featureFlags.toast.createFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({ ...prev, tags: prev.tags.filter((t) => t !== tag) }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-md overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                {t('admin.featureFlags.modal.title')}
              </h2>
              <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.featureFlags.modal.name')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder={t('admin.featureFlags.modal.namePlaceholder')}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-momentum-orange/20 focus:border-momentum-orange transition-colors"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.featureFlags.modal.description')}
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder={t('admin.featureFlags.modal.descriptionPlaceholder')}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-momentum-orange/20 focus:border-momentum-orange transition-colors resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.featureFlags.modal.category')}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(categoryConfig).map(([key, cfg]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, category: key }))}
                      className={cn(
                        'flex flex-col items-center gap-1 p-2.5 rounded-lg border transition-all text-xs font-medium',
                        formData.category === key
                          ? 'border-momentum-orange bg-orange-50 dark:bg-orange-900/20 text-momentum-orange'
                          : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600',
                      )}
                    >
                      {cfg.icon}
                      {t(`admin.featureFlags.categoryShort.${key}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.featureFlags.modal.tags')}
                </label>
                {formData.tags.length > 0 && (
                  <div className="flex gap-1.5 mb-2 flex-wrap">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded text-xs"
                      >
                        #{tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder={t('admin.featureFlags.modal.tagsPlaceholder')}
                    className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-momentum-orange/20 focus:border-momentum-orange transition-colors"
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={addTag}>
                    {t('admin.featureFlags.modal.addTag')}
                  </Button>
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('admin.featureFlags.modal.type')}
                </label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, type: FeatureFlagType.Permanent, expiresAt: undefined }))}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg border transition-all text-sm font-medium',
                      formData.type === FeatureFlagType.Permanent
                        ? 'border-momentum-orange bg-orange-50 dark:bg-orange-900/20 text-momentum-orange'
                        : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300',
                    )}
                  >
                    <Shield className="w-4 h-4" />
                    {t('admin.featureFlags.type.Permanent')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, type: FeatureFlagType.Temporary }))}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 p-2.5 rounded-lg border transition-all text-sm font-medium',
                      formData.type === FeatureFlagType.Temporary
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-600'
                        : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:border-gray-300',
                    )}
                  >
                    <Clock className="w-4 h-4" />
                    {t('admin.featureFlags.type.Temporary')}
                  </button>
                </div>
              </div>

              {/* Expiration */}
              <AnimatePresence>
                {formData.type === FeatureFlagType.Temporary && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('admin.featureFlags.modal.expirationDate')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.expiresAt?.split('T')[0] || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, expiresAt: e.target.value ? `${e.target.value}T00:00:00Z` : undefined }))
                      }
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-momentum-orange/20 focus:border-momentum-orange transition-colors"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Enable toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{t('admin.featureFlags.modal.enableImmediately')}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('admin.featureFlags.modal.enableImmediatelyDesc')}</p>
                </div>
                <Toggle
                  enabled={formData.isEnabled}
                  onChange={() => setFormData((prev) => ({ ...prev, isEnabled: !prev.isEnabled }))}
                  disabled={false}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-1">
                <Button type="button" variant="ghost" onClick={onClose}>
                  {t('admin.featureFlags.modal.cancel')}
                </Button>
                <Button type="submit" variant="brand" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {isSubmitting ? t('admin.featureFlags.modal.creating') : t('admin.featureFlags.modal.create')}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ── Main page ───────────────────────────────────────────────────
export default function AdminFeatureFlagsPage() {
  const { t, language } = useTheme();
  const { flags, stats, isLoading, error, refresh, toggleFlag, createFlag } = useFeatureFlagsAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState<'all' | 'active' | 'stale' | 'disabled'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  const handleToggle = useCallback(
    async (name: string, enabled: boolean) => {
      setIsToggling(true);
      try {
        await toggleFlag(name, enabled);
        setToast({
          type: 'success',
          text: t(enabled ? 'admin.featureFlags.toast.enabled' : 'admin.featureFlags.toast.disabled').replace('{name}', name),
        });
      } catch {
        setToast({ type: 'error', text: t('admin.featureFlags.toast.toggleFailed').replace('{name}', name) });
      } finally {
        setIsToggling(false);
      }
    },
    [toggleFlag, t],
  );

  const handleCreate = useCallback(
    async (data: CreateFeatureFlagRequest) => {
      await createFlag(data);
      setToast({ type: 'success', text: t('admin.featureFlags.toast.created').replace('{name}', data.name) });
    },
    [createFlag, t],
  );

  // Filter
  const filteredFlags = flags.filter((flag) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (
        !flag.name.toLowerCase().includes(q) &&
        !flag.description?.toLowerCase().includes(q) &&
        !flag.tags.some((t) => t.toLowerCase().includes(q))
      )
        return false;
    }
    if (stateFilter === 'active' && (!flag.isEnabled || flag.state !== FeatureFlagState.Active)) return false;
    if (stateFilter === 'stale' && flag.state !== FeatureFlagState.Stale && flag.state !== FeatureFlagState.PotentiallyStale) return false;
    if (stateFilter === 'disabled' && flag.isEnabled) return false;
    return true;
  });

  // Group by category
  const grouped = filteredFlags.reduce(
    (acc, flag) => {
      const cat = flag.category || 'General';
      (acc[cat] ||= []).push(flag);
      return acc;
    },
    {} as Record<string, FeatureFlag[]>,
  );

  const sortedCategories = Object.keys(grouped).sort((a, b) => {
    const order = ['AI', 'Export', 'Premium', 'General'];
    return order.indexOf(a) - order.indexOf(b);
  });

  // ── Error state ─────────────────────────────────────────────
  if (error && !flags.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertTriangle className="w-7 h-7 text-red-500" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t('admin.featureFlags.errorTitle')}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{error.message}</p>
        <Button variant="brand" onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4" />
          {t('admin.featureFlags.retry')}
        </Button>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-strategy-blue text-white">
            <Flag className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{t('admin.featureFlags.title')}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {stats.enabledCount} {t('admin.featureFlags.enabled')} / {stats.totalCount} {t('admin.featureFlags.stats.total').toLowerCase()}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn('w-3.5 h-3.5', isRefreshing && 'animate-spin')} />
          </Button>
          <Button variant="brand" size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('admin.featureFlags.createFlag')}</span>
          </Button>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm',
              toast.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800',
            )}
          >
            {toast.type === 'success' ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick stats pills */}
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-gray-600 dark:text-gray-400">{stats.enabledCount} {t('admin.featureFlags.on')}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600" />
          <span className="text-gray-600 dark:text-gray-400">{stats.disabledCount} {t('admin.featureFlags.off')}</span>
        </div>
        {stats.staleCount > 0 && (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-amber-600 dark:text-amber-400">{stats.staleCount} {t('admin.featureFlags.state.Stale').toLowerCase()}</span>
          </div>
        )}
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('admin.featureFlags.search')}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-momentum-orange/20 focus:border-momentum-orange transition-colors"
          />
        </div>
        <div className="flex rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {(['all', 'active', 'stale', 'disabled'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStateFilter(filter)}
              className={cn(
                'px-3 py-2 text-xs font-medium transition-colors',
                stateFilter === filter
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                  : 'bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800',
              )}
            >
              {t(`admin.featureFlags.filter${filter.charAt(0).toUpperCase() + filter.slice(1)}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading && !flags.length && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="space-y-3">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-3 w-48 bg-gray-100 dark:bg-gray-800 rounded" />
                    </div>
                    <div className="h-6 w-11 bg-gray-200 dark:bg-gray-700 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && sortedCategories.length === 0 && (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-3">
            <Flag className="w-6 h-6 text-gray-400" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            {searchQuery ? t('admin.featureFlags.noFlagsFound') : t('admin.featureFlags.noFlags')}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {searchQuery ? t('admin.featureFlags.noFlagsFoundDesc') : t('admin.featureFlags.noFlagsDesc')}
          </p>
          {!searchQuery && (
            <Button variant="brand" size="sm" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4" />
              {t('admin.featureFlags.createFlag')}
            </Button>
          )}
        </div>
      )}

      {/* Category groups */}
      <div className="space-y-4">
        {sortedCategories.map((category) => (
          <CategoryGroup
            key={category}
            category={category}
            flags={grouped[category]}
            onToggle={handleToggle}
            isToggling={isToggling}
            t={t}
            language={language}
          />
        ))}
      </div>

      {/* Create modal */}
      <CreateFlagModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreate={handleCreate} />
    </div>
  );
}
