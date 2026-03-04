import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import {
  Flag,
  ToggleRight,
  ToggleLeft,
  AlertTriangle,
  RefreshCw,
  Plus,
  Search,
  Sparkles,
  FileOutput,
  Crown,
  ChevronDown,
  Calendar,
  User,
  MoreHorizontal,
  Clock,
  Archive,
  X,
  Check,
  Zap,
  Shield,
  TrendingUp
} from 'lucide-react';
import { useFeatureFlagsAdmin } from '../../hooks/useFeatureFlag';
import {
  FeatureFlag,
  FeatureFlagType,
  FeatureFlagState,
  FEATURE_FLAG_CATEGORIES,
  getFeatureFlagTypeLabel,
  getFeatureFlagStateInfo,
  CreateFeatureFlagRequest
} from '../../lib/feature-flags-service';

// Category configuration with gradients
const categoryConfig: Record<string, { icon: React.ReactNode; gradient: string; bg: string; text: string }> = {
  AI: {
    icon: <Sparkles className="w-4 h-4" />,
    gradient: 'from-orange-500 to-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
    text: 'text-orange-700 dark:text-orange-300'
  },
  Export: {
    icon: <FileOutput className="w-4 h-4" />,
    gradient: 'from-strategy-blue to-slate-700',
    bg: 'bg-slate-50 dark:bg-slate-900/30',
    text: 'text-strategy-blue dark:text-slate-300'
  },
  Premium: {
    icon: <Crown className="w-4 h-4" />,
    gradient: 'from-amber-500 to-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-300'
  },
  General: {
    icon: <Flag className="w-4 h-4" />,
    gradient: 'from-slate-500 to-gray-600',
    bg: 'bg-slate-50 dark:bg-slate-950/30',
    text: 'text-slate-700 dark:text-slate-300'
  }
};

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 }
};

// Stats card component
function StatsCard({
  title,
  value,
  icon,
  gradient,
  delay = 0
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="group relative overflow-hidden bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-900/50 transition-all duration-300"
    >
      {/* Subtle gradient overlay on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} />

      <div className="relative flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">{value}</p>
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} text-white shadow-lg`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

// Toggle switch component
function ToggleSwitch({
  enabled,
  onChange,
  disabled
}: {
  enabled: boolean;
  onChange: () => void;
  disabled: boolean;
}) {
  return (
    <button
      onClick={onChange}
      disabled={disabled}
      className={`
        relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full
        border-2 border-transparent transition-all duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900
        ${enabled
          ? 'bg-gradient-to-r from-emerald-500 to-green-500 focus:ring-emerald-500'
          : 'bg-gray-200 dark:bg-gray-700 focus:ring-gray-400'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}
      `}
    >
      <span
        className={`
          pointer-events-none inline-block h-5 w-5 transform rounded-full
          bg-white shadow-lg ring-0 transition-transform duration-300 ease-in-out
          ${enabled ? 'translate-x-5' : 'translate-x-0'}
        `}
      >
        <span
          className={`
            absolute inset-0 flex h-full w-full items-center justify-center
            transition-opacity duration-200
            ${enabled ? 'opacity-0' : 'opacity-100'}
          `}
        >
          <X className="w-3 h-3 text-gray-400" />
        </span>
        <span
          className={`
            absolute inset-0 flex h-full w-full items-center justify-center
            transition-opacity duration-200
            ${enabled ? 'opacity-100' : 'opacity-0'}
          `}
        >
          <Check className="w-3 h-3 text-emerald-600" />
        </span>
      </span>
    </button>
  );
}

// Feature flag row component
function FeatureFlagRow({
  flag,
  onToggle,
  onMarkStale,
  onArchive,
  isToggling
}: {
  flag: FeatureFlag;
  onToggle: (name: string, enabled: boolean) => void;
  onMarkStale: (name: string) => void;
  onArchive: (name: string) => void;
  isToggling: boolean;
}) {
  const { t, language } = useTheme();
  const [showMenu, setShowMenu] = useState(false);
  const config = categoryConfig[flag.category] || categoryConfig.General;

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get translated state label
  const getStateLabel = (state: FeatureFlagState | undefined | null) => {
    if (state === undefined || state === null) {
      return t('admin.featureFlags.state.Active'); // Default to Active
    }
    const stateKeys: Record<number, string> = {
      [FeatureFlagState.Active]: 'Active',
      [FeatureFlagState.PotentiallyStale]: 'PotentiallyStale',
      [FeatureFlagState.Stale]: 'Stale',
      [FeatureFlagState.Archived]: 'Archived'
    };
    const key = stateKeys[state] || 'Active';
    return t(`admin.featureFlags.state.${key}`);
  };

  // Get translated type label
  const getTypeLabel = (type: FeatureFlagType) => {
    return t(`admin.featureFlags.type.${type === FeatureFlagType.Temporary ? 'Temporary' : 'Permanent'}`);
  };

  // Get translated description (falls back to original if no translation)
  const getDescription = () => {
    const translationKey = `admin.featureFlags.desc.${flag.name}`;
    const translated = t(translationKey);
    // If translation exists (not returning the key itself), use it
    if (translated !== translationKey) {
      return translated;
    }
    // Fall back to original description
    return flag.description || t('admin.featureFlags.noDescription');
  };

  const stateInfo = getFeatureFlagStateInfo(flag.state);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="group relative bg-white dark:bg-gray-900/50 rounded-xl border border-gray-100 dark:border-gray-800 p-4 hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200"
    >
      <div className="flex items-start gap-4">
        {/* Category icon */}
        <div className={`flex-shrink-0 p-2.5 rounded-lg bg-gradient-to-br ${config.gradient} text-white shadow-sm`}>
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h4 className="font-mono text-sm font-semibold text-gray-900 dark:text-white">
                {flag.name}
              </h4>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                {getDescription()}
              </p>
            </div>

            {/* Toggle and menu */}
            <div className="flex items-center gap-2">
              <ToggleSwitch
                enabled={flag.isEnabled}
                onChange={() => onToggle(flag.name, !flag.isEnabled)}
                disabled={isToggling}
              />

              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {showMenu && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-10"
                        onClick={() => setShowMenu(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-1 z-20 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-1 overflow-hidden"
                      >
                        <button
                          onClick={() => {
                            onMarkStale(flag.name);
                            setShowMenu(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-2 transition-colors"
                        >
                          <AlertTriangle className="w-4 h-4 text-amber-500" />
                          {t('admin.featureFlags.markStale')}
                        </button>
                        <button
                          onClick={() => {
                            onArchive(flag.name);
                            setShowMenu(false);
                          }}
                          className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"
                        >
                          <Archive className="w-4 h-4" />
                          {t('admin.featureFlags.archive')}
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Meta info */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {/* State badge */}
            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${stateInfo.bgColor} ${stateInfo.color}`}>
              {getStateLabel(flag.state)}
            </span>

            {/* Type badge */}
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              {getTypeLabel(flag.type)}
            </span>

            {/* Tags */}
            {flag.tags.slice(0, 2).map(tag => (
              <span
                key={tag}
                className="inline-flex items-center px-2 py-0.5 rounded-md text-xs bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-500"
              >
                #{tag}
              </span>
            ))}
            {flag.tags.length > 2 && (
              <span className="text-xs text-gray-400">{t('admin.featureFlags.moreTagsText').replace('{count}', String(flag.tags.length - 2))}</span>
            )}

            {/* Separator */}
            <span className="text-gray-200 dark:text-gray-700">|</span>

            {/* Date info */}
            <span className="inline-flex items-center gap-1 text-xs text-gray-400">
              <Calendar className="w-3 h-3" />
              {formatDate(flag.created) || t('admin.featureFlags.unknown')}
            </span>

            {flag.createdBy && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                <User className="w-3 h-3" />
                {flag.createdBy.split('@')[0]}
              </span>
            )}

            {flag.expiresAt && (
              <span className="inline-flex items-center gap-1 text-xs text-orange-500">
                <Clock className="w-3 h-3" />
                {t('admin.featureFlags.expires')} {formatDate(flag.expiresAt)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Category accordion component
function CategoryAccordion({
  category,
  flags,
  onToggle,
  onMarkStale,
  onArchive,
  isToggling,
  defaultOpen = true
}: {
  category: string;
  flags: FeatureFlag[];
  onToggle: (name: string, enabled: boolean) => void;
  onMarkStale: (name: string) => void;
  onArchive: (name: string) => void;
  isToggling: boolean;
  defaultOpen?: boolean;
}) {
  const { t } = useTheme();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const label = t(`admin.featureFlags.category.${category}`);
  const enabledCount = flags.filter(f => f.isEnabled).length;
  const config = categoryConfig[category] || categoryConfig.General;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${config.gradient} text-white shadow-sm`}>
            {config.icon}
          </div>
          <div className="text-left">
            <h3 className="font-semibold text-gray-900 dark:text-white">{label}</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {flags.length} {t('admin.featureFlags.flags')} · {enabledCount} {t('admin.featureFlags.enabled')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick stats */}
          <div className="hidden sm:flex items-center gap-1.5">
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400">
              {enabledCount} {t('admin.featureFlags.on')}
            </span>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
              {flags.length - enabledCount} {t('admin.featureFlags.off')}
            </span>
          </div>

          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 space-y-2 border-t border-gray-100 dark:border-gray-800 pt-4">
              {flags.length === 0 ? (
                <div className="text-center py-8">
                  <Flag className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('admin.featureFlags.noFlagsInCategory')}
                  </p>
                </div>
              ) : (
                flags.map(flag => (
                  <FeatureFlagRow
                    key={flag.name}
                    flag={flag}
                    onToggle={onToggle}
                    onMarkStale={onMarkStale}
                    onArchive={onArchive}
                    isToggling={isToggling}
                  />
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Create flag modal component
function CreateFlagModal({
  isOpen,
  onClose,
  onCreate
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
    isEnabled: false
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
      setFormData({
        name: '',
        description: '',
        category: 'General',
        tags: [],
        type: FeatureFlagType.Permanent,
        isEnabled: false
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('admin.featureFlags.toast.createFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
          >
            {/* Header */}
            <div className="relative px-6 py-5 border-b border-gray-100 dark:border-gray-800">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-amber-500/5" />
              <div className="relative flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('admin.featureFlags.modal.title')}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.featureFlags.modal.subtitle')}</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-center gap-2"
                >
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              {/* Flag Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('admin.featureFlags.modal.name')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t('admin.featureFlags.modal.namePlaceholder')}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('admin.featureFlags.modal.description')}
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder={t('admin.featureFlags.modal.descriptionPlaceholder')}
                  rows={2}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('admin.featureFlags.modal.category')}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(categoryConfig).map(([key, cfg]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, category: key }))}
                      className={`
                        p-3 rounded-xl border-2 transition-all text-center
                        ${formData.category === key
                          ? `border-transparent bg-gradient-to-br ${cfg.gradient} text-white shadow-md`
                          : 'border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 text-gray-600 dark:text-gray-400'
                        }
                      `}
                    >
                      <div className="flex flex-col items-center gap-1">
                        {cfg.icon}
                        <span className="text-xs font-medium">{t(`admin.featureFlags.categoryShort.${key}`)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('admin.featureFlags.modal.tags')}
                </label>
                {formData.tags.length > 0 && (
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {formData.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-lg text-sm"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-orange-900 dark:hover:text-orange-100"
                        >
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
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder={t('admin.featureFlags.modal.tagsPlaceholder')}
                    className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {t('admin.featureFlags.modal.addTag')}
                  </button>
                </div>
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  {t('admin.featureFlags.modal.type')}
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: FeatureFlagType.Permanent, expiresAt: undefined }))}
                    className={`
                      flex-1 p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2
                      ${formData.type === FeatureFlagType.Permanent
                        ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300'
                        : 'border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700'
                      }
                    `}
                  >
                    <Shield className="w-4 h-4" />
                    <span className="font-medium">{t('admin.featureFlags.type.Permanent')}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, type: FeatureFlagType.Temporary }))}
                    className={`
                      flex-1 p-3 rounded-xl border-2 transition-all flex items-center justify-center gap-2
                      ${formData.type === FeatureFlagType.Temporary
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                        : 'border-gray-100 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700'
                      }
                    `}
                  >
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">{t('admin.featureFlags.type.Temporary')}</span>
                  </button>
                </div>
              </div>

              {/* Expiration Date */}
              <AnimatePresence>
                {formData.type === FeatureFlagType.Temporary && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      {t('admin.featureFlags.modal.expirationDate')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.expiresAt?.split('T')[0] || ''}
                      onChange={e => setFormData(prev => ({ ...prev, expiresAt: e.target.value ? `${e.target.value}T00:00:00Z` : undefined }))}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Enable Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{t('admin.featureFlags.modal.enableImmediately')}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.featureFlags.modal.enableImmediatelyDesc')}</p>
                </div>
                <ToggleSwitch
                  enabled={formData.isEnabled}
                  onChange={() => setFormData(prev => ({ ...prev, isEnabled: !prev.isEnabled }))}
                  disabled={false}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors font-medium"
                >
                  {t('admin.featureFlags.modal.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all font-medium shadow-lg shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      {t('admin.featureFlags.modal.creating')}
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      {t('admin.featureFlags.modal.create')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Main page component
export default function AdminFeatureFlagsPage() {
  const { t } = useTheme();
  const {
    flags,
    stats,
    isLoading,
    error,
    refresh,
    toggleFlag,
    createFlag,
    markAsStale,
    archiveFlag
  } = useFeatureFlagsAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [stateFilter, setStateFilter] = useState<'all' | 'active' | 'stale' | 'disabled'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Auto-dismiss messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  };

  const handleToggle = useCallback(async (name: string, enabled: boolean) => {
    setIsToggling(true);
    try {
      await toggleFlag(name, enabled);
      setMessage({ type: 'success', text: t(enabled ? 'admin.featureFlags.toast.enabled' : 'admin.featureFlags.toast.disabled').replace('{name}', name) });
    } catch {
      setMessage({ type: 'error', text: t('admin.featureFlags.toast.toggleFailed').replace('{name}', name) });
    } finally {
      setIsToggling(false);
    }
  }, [toggleFlag, t]);

  const handleMarkStale = useCallback(async (name: string) => {
    try {
      await markAsStale(name);
      setMessage({ type: 'success', text: t('admin.featureFlags.toast.markedStale').replace('{name}', name) });
    } catch {
      setMessage({ type: 'error', text: t('admin.featureFlags.toast.markStaleFailed').replace('{name}', name) });
    }
  }, [markAsStale, t]);

  const handleArchive = useCallback(async (name: string) => {
    if (!confirm(t('admin.featureFlags.archiveConfirm').replace('{name}', name))) return;
    try {
      await archiveFlag(name);
      setMessage({ type: 'success', text: t('admin.featureFlags.toast.archived').replace('{name}', name) });
    } catch {
      setMessage({ type: 'error', text: t('admin.featureFlags.toast.archiveFailed').replace('{name}', name) });
    }
  }, [archiveFlag, t]);

  const handleCreate = useCallback(async (data: CreateFeatureFlagRequest) => {
    await createFlag(data);
    setMessage({ type: 'success', text: t('admin.featureFlags.toast.created').replace('{name}', data.name) });
  }, [createFlag, t]);

  // Filter flags
  const filteredFlags = flags.filter(flag => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (!flag.name.toLowerCase().includes(query) &&
          !flag.description?.toLowerCase().includes(query) &&
          !flag.tags.some(t => t.toLowerCase().includes(query))) {
        return false;
      }
    }
    if (stateFilter === 'active' && (!flag.isEnabled || flag.state !== FeatureFlagState.Active)) return false;
    if (stateFilter === 'stale' && flag.state !== FeatureFlagState.Stale && flag.state !== FeatureFlagState.PotentiallyStale) return false;
    if (stateFilter === 'disabled' && flag.isEnabled) return false;
    return true;
  });

  // Group flags by category
  const groupedFlags = filteredFlags.reduce((acc, flag) => {
    const category = flag.category || 'General';
    if (!acc[category]) acc[category] = [];
    acc[category].push(flag);
    return acc;
  }, {} as Record<string, FeatureFlag[]>);

  const sortedCategories = Object.keys(groupedFlags).sort((a, b) => {
    const order = ['AI', 'Export', 'Premium', 'General'];
    return order.indexOf(a) - order.indexOf(b);
  });

  if (error && !flags.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('admin.featureFlags.errorTitle')}</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">{error.message}</p>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all font-medium shadow-lg shadow-orange-500/25"
        >
          <RefreshCw className="w-4 h-4" />
          {t('admin.featureFlags.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-strategy-blue text-white shadow-lg shadow-strategy-blue/25">
              <Flag className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('admin.featureFlags.title')}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.featureFlags.subtitle')}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">{t('admin.featureFlags.refresh')}</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all font-medium shadow-lg shadow-orange-500/25"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">{t('admin.featureFlags.createFlag')}</span>
          </button>
        </div>
      </div>

      {/* Toast Message */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`flex items-center gap-3 p-4 rounded-xl ${
              message.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/50'
                : 'bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            )}
            <p className={message.type === 'success' ? 'text-emerald-800 dark:text-emerald-200' : 'text-red-800 dark:text-red-200'}>
              {message.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title={t('admin.featureFlags.stats.total')}
          value={stats.totalCount}
          icon={<Flag className="w-5 h-5" />}
          gradient="from-slate-600 to-gray-700"
          delay={0}
        />
        <StatsCard
          title={t('admin.featureFlags.stats.enabled')}
          value={stats.enabledCount}
          icon={<Zap className="w-5 h-5" />}
          gradient="from-emerald-500 to-green-600"
          delay={0.05}
        />
        <StatsCard
          title={t('admin.featureFlags.stats.stale')}
          value={stats.staleCount}
          icon={<AlertTriangle className="w-5 h-5" />}
          gradient="from-amber-500 to-orange-500"
          delay={0.1}
        />
        <StatsCard
          title={t('admin.featureFlags.stats.disabled')}
          value={stats.disabledCount}
          icon={<ToggleLeft className="w-5 h-5" />}
          gradient="from-gray-400 to-gray-500"
          delay={0.15}
        />
      </div>

      {/* Stale Warning */}
      <AnimatePresence>
        {stats.staleCount > 0 && stateFilter !== 'stale' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl"
          >
            <div className="p-2 rounded-lg bg-amber-500 text-white">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <p className="text-amber-800 dark:text-amber-200 font-medium">
                {t('admin.featureFlags.staleWarning').replace('{count}', String(stats.staleCount))}
              </p>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                {t('admin.featureFlags.staleWarningDesc')}
              </p>
            </div>
            <button
              onClick={() => setStateFilter('stale')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {t('admin.featureFlags.review')}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={t('admin.featureFlags.search')}
            className="w-full pl-11 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
          />
        </div>

        <div className="flex gap-2">
          {(['all', 'active', 'stale', 'disabled'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setStateFilter(filter)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                stateFilter === filter
                  ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300'
                  : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              {t(`admin.featureFlags.filter${filter.charAt(0).toUpperCase() + filter.slice(1)}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && !flags.length && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
            <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-4 border-orange-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">{t('admin.featureFlags.loading')}</p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && sortedCategories.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16"
        >
          <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <Flag className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {searchQuery ? t('admin.featureFlags.noFlagsFound') : t('admin.featureFlags.noFlags')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
            {searchQuery
              ? t('admin.featureFlags.noFlagsFoundDesc')
              : t('admin.featureFlags.noFlagsDesc')}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all font-medium shadow-lg shadow-orange-500/25"
            >
              <Plus className="w-4 h-4" />
              {t('admin.featureFlags.createFlag')}
            </button>
          )}
        </motion.div>
      )}

      {/* Categories */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {sortedCategories.map((category, index) => (
          <motion.div key={category} variants={itemVariants}>
            <CategoryAccordion
              category={category}
              flags={groupedFlags[category]}
              onToggle={handleToggle}
              onMarkStale={handleMarkStale}
              onArchive={handleArchive}
              isToggling={isToggling}
              defaultOpen={index < 2}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Create Modal */}
      <CreateFlagModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
