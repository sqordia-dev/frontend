import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { adminService } from '../../lib/admin-service';
import {
  Activity,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  ChevronDown,
  LogIn,
  LogOut,
  UserPlus,
  FileText,
  Settings,
  Shield,
  Database,
  Mail,
  CreditCard,
  Download,
  Upload,
  Trash2,
  Edit3,
  Eye,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Clock,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Calendar,
  User,
  Building2,
  Zap,
  AlertTriangle,
  type LucideIcon,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getUserFriendlyError } from '../../utils/error-messages';
import { cn } from '../../lib/utils';

// Action type mapping for human-readable names and icons
const ACTION_CONFIG: Record<string, { label: string; labelFr: string; icon: LucideIcon; color: string; category: string }> = {
  // Auth actions
  user_login: { label: 'User signed in', labelFr: 'Connexion utilisateur', icon: LogIn, color: '#10B981', category: 'auth' },
  user_logout: { label: 'User signed out', labelFr: 'Déconnexion utilisateur', icon: LogOut, color: '#6B7280', category: 'auth' },
  user_register: { label: 'New user registered', labelFr: 'Nouvel utilisateur inscrit', icon: UserPlus, color: '#3B82F6', category: 'auth' },
  password_reset: { label: 'Password reset', labelFr: 'Réinitialisation mot de passe', icon: Lock, color: '#F59E0B', category: 'auth' },
  password_change: { label: 'Password changed', labelFr: 'Mot de passe modifié', icon: Unlock, color: '#10B981', category: 'auth' },
  two_factor_enabled: { label: '2FA enabled', labelFr: '2FA activée', icon: Shield, color: '#10B981', category: 'auth' },
  two_factor_disabled: { label: '2FA disabled', labelFr: '2FA désactivée', icon: Shield, color: '#EF4444', category: 'auth' },
  login_failed: { label: 'Login failed', labelFr: 'Échec de connexion', icon: AlertTriangle, color: '#EF4444', category: 'auth' },

  // Business plan actions
  plan_created: { label: 'Business plan created', labelFr: 'Plan d\'affaires créé', icon: FileText, color: '#8B5CF6', category: 'plans' },
  plan_updated: { label: 'Business plan updated', labelFr: 'Plan d\'affaires modifié', icon: Edit3, color: '#3B82F6', category: 'plans' },
  plan_deleted: { label: 'Business plan deleted', labelFr: 'Plan d\'affaires supprimé', icon: Trash2, color: '#EF4444', category: 'plans' },
  plan_exported: { label: 'Business plan exported', labelFr: 'Plan d\'affaires exporté', icon: Download, color: '#10B981', category: 'plans' },
  plan_viewed: { label: 'Business plan viewed', labelFr: 'Plan d\'affaires consulté', icon: Eye, color: '#6B7280', category: 'plans' },
  section_generated: { label: 'Section generated with AI', labelFr: 'Section générée par IA', icon: Zap, color: '#F59E0B', category: 'plans' },

  // Organization actions
  org_created: { label: 'Organization created', labelFr: 'Organisation créée', icon: Building2, color: '#FF6B00', category: 'orgs' },
  org_updated: { label: 'Organization updated', labelFr: 'Organisation modifiée', icon: Edit3, color: '#3B82F6', category: 'orgs' },
  org_deleted: { label: 'Organization deleted', labelFr: 'Organisation supprimée', icon: Trash2, color: '#EF4444', category: 'orgs' },
  member_added: { label: 'Member added', labelFr: 'Membre ajouté', icon: UserPlus, color: '#10B981', category: 'orgs' },
  member_removed: { label: 'Member removed', labelFr: 'Membre retiré', icon: Trash2, color: '#EF4444', category: 'orgs' },

  // User actions
  profile_updated: { label: 'Profile updated', labelFr: 'Profil mis à jour', icon: User, color: '#3B82F6', category: 'users' },
  email_verified: { label: 'Email verified', labelFr: 'Email vérifié', icon: Mail, color: '#10B981', category: 'users' },

  // Admin actions
  user_suspended: { label: 'User suspended', labelFr: 'Utilisateur suspendu', icon: Lock, color: '#EF4444', category: 'admin' },
  user_activated: { label: 'User activated', labelFr: 'Utilisateur activé', icon: Unlock, color: '#10B981', category: 'admin' },
  settings_updated: { label: 'Settings updated', labelFr: 'Paramètres modifiés', icon: Settings, color: '#6B7280', category: 'admin' },

  // Subscription actions
  subscription_created: { label: 'Subscription created', labelFr: 'Abonnement créé', icon: CreditCard, color: '#10B981', category: 'billing' },
  subscription_updated: { label: 'Subscription updated', labelFr: 'Abonnement modifié', icon: CreditCard, color: '#3B82F6', category: 'billing' },
  subscription_cancelled: { label: 'Subscription cancelled', labelFr: 'Abonnement annulé', icon: CreditCard, color: '#EF4444', category: 'billing' },

  // System actions
  data_export: { label: 'Data exported', labelFr: 'Données exportées', icon: Download, color: '#6B7280', category: 'system' },
  data_import: { label: 'Data imported', labelFr: 'Données importées', icon: Upload, color: '#3B82F6', category: 'system' },
  backup_created: { label: 'Backup created', labelFr: 'Sauvegarde créée', icon: Database, color: '#10B981', category: 'system' },
};

// Parse user agent to get device info
function parseUserAgent(userAgent: string): { device: 'desktop' | 'mobile' | 'tablet'; browser: string; os: string } {
  const ua = userAgent.toLowerCase();

  // Detect device type
  let device: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  if (/mobile|android|iphone|ipod/.test(ua) && !/ipad|tablet/.test(ua)) {
    device = 'mobile';
  } else if (/ipad|tablet|playbook|silk/.test(ua)) {
    device = 'tablet';
  }

  // Detect browser
  let browser = 'Unknown';
  if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('edg')) browser = 'Edge';
  else if (ua.includes('chrome')) browser = 'Chrome';
  else if (ua.includes('safari')) browser = 'Safari';
  else if (ua.includes('opera') || ua.includes('opr')) browser = 'Opera';

  // Detect OS
  let os = 'Unknown';
  if (ua.includes('windows')) os = 'Windows';
  else if (ua.includes('mac os') || ua.includes('macos')) os = 'macOS';
  else if (ua.includes('linux')) os = 'Linux';
  else if (ua.includes('android')) os = 'Android';
  else if (ua.includes('ios') || ua.includes('iphone') || ua.includes('ipad')) os = 'iOS';

  return { device, browser, os };
}

// Get action config with fallback
function getActionConfig(action: string) {
  const normalized = action.toLowerCase().replace(/[^a-z_]/g, '_');
  return ACTION_CONFIG[normalized] || {
    label: action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    labelFr: action.replace(/_/g, ' '),
    icon: Activity,
    color: '#6B7280',
    category: 'other',
  };
}

// Format relative time
function formatRelativeTime(timestamp: string, language: string): string {
  const now = new Date();
  const date = new Date(timestamp);
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return language === 'fr' ? 'À l\'instant' : 'Just now';
  if (diffMins < 60) return language === 'fr' ? `Il y a ${diffMins} min` : `${diffMins}m ago`;
  if (diffHours < 24) return language === 'fr' ? `Il y a ${diffHours}h` : `${diffHours}h ago`;
  if (diffDays < 7) return language === 'fr' ? `Il y a ${diffDays}j` : `${diffDays}d ago`;

  return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// Grouping options
type GroupingType = 'day' | 'month' | 'year';

const GROUPING_OPTIONS: { id: GroupingType; label: string; labelFr: string }[] = [
  { id: 'day', label: 'Day', labelFr: 'Jour' },
  { id: 'month', label: 'Month', labelFr: 'Mois' },
  { id: 'year', label: 'Year', labelFr: 'Année' },
];

// Group logs by date with different grouping levels
function groupLogsByDate(
  logs: any[],
  language: string,
  grouping: GroupingType = 'day'
): { date: string; logs: any[]; sortKey: number }[] {
  const groups: Record<string, { logs: any[]; sortKey: number }> = {};
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const thisMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const thisYear = new Date().getFullYear();

  logs.forEach(log => {
    const logDate = new Date(log.timestamp);
    let key: string;
    let sortKey: number;

    if (grouping === 'year') {
      const year = logDate.getFullYear();
      sortKey = year;
      if (year === thisYear) {
        key = language === 'fr' ? 'Cette année' : 'This Year';
      } else {
        key = year.toString();
      }
    } else if (grouping === 'month') {
      const monthKey = logDate.toISOString().slice(0, 7);
      sortKey = parseInt(monthKey.replace('-', ''));
      if (monthKey === thisMonth) {
        key = language === 'fr' ? 'Ce mois' : 'This Month';
      } else {
        key = logDate.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
          month: 'long',
          year: 'numeric',
        });
      }
    } else {
      // Day grouping (default)
      const dayString = logDate.toDateString();
      sortKey = logDate.getTime();

      if (dayString === today) {
        key = language === 'fr' ? 'Aujourd\'hui' : 'Today';
      } else if (dayString === yesterday) {
        key = language === 'fr' ? 'Hier' : 'Yesterday';
      } else {
        key = logDate.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
          weekday: 'long',
          month: 'long',
          day: 'numeric',
          year: logDate.getFullYear() !== thisYear ? 'numeric' : undefined,
        });
      }
    }

    if (!groups[key]) groups[key] = { logs: [], sortKey };
    groups[key].logs.push(log);
  });

  // Sort groups by sortKey (most recent first)
  return Object.entries(groups)
    .sort((a, b) => b[1].sortKey - a[1].sortKey)
    .map(([date, { logs, sortKey }]) => ({ date, logs, sortKey }));
}

// Filter categories
const CATEGORIES = [
  { id: 'all', label: 'All', labelFr: 'Tout' },
  { id: 'auth', label: 'Authentication', labelFr: 'Authentification' },
  { id: 'plans', label: 'Business Plans', labelFr: 'Plans d\'affaires' },
  { id: 'orgs', label: 'Organizations', labelFr: 'Organisations' },
  { id: 'users', label: 'Users', labelFr: 'Utilisateurs' },
  { id: 'admin', label: 'Admin', labelFr: 'Admin' },
  { id: 'billing', label: 'Billing', labelFr: 'Facturation' },
  { id: 'system', label: 'System', labelFr: 'Système' },
];

export default function AdminActivityLogsPage() {
  const { language } = useTheme();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'success' | 'failed'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [grouping, setGrouping] = useState<GroupingType>('day');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Toggle group collapse
  const toggleGroup = (groupKey: string) => {
    setCollapsedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  };

  // Expand all groups
  const expandAll = () => setCollapsedGroups(new Set());

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getActivityLogs();
      setLogs(data || []);
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'load'));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadLogs();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Filter logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      // Search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          (log.action?.toLowerCase().includes(search)) ||
          (log.userEmail?.toLowerCase().includes(search)) ||
          (log.entity?.toLowerCase().includes(search));
        if (!matchesSearch) return false;
      }

      // Category filter
      if (categoryFilter !== 'all') {
        const config = getActionConfig(log.action || '');
        if (config.category !== categoryFilter) return false;
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'success' && log.isSuccess === false) return false;
        if (statusFilter === 'failed' && log.isSuccess !== false) return false;
      }

      return true;
    });
  }, [logs, searchTerm, categoryFilter, statusFilter]);

  // Group by date
  const groupedLogs = useMemo(() => groupLogsByDate(filteredLogs, language, grouping), [filteredLogs, language, grouping]);

  // Collapse all groups
  const collapseAll = () => {
    const allKeys = groupedLogs.map(g => g.date);
    setCollapsedGroups(new Set(allKeys));
  };

  // Check if all are collapsed
  const allCollapsed = groupedLogs.length > 0 && collapsedGroups.size === groupedLogs.length;

  // Stats
  const stats = useMemo(() => {
    const total = logs.length;
    const successful = logs.filter(l => l.isSuccess !== false).length;
    const failed = logs.filter(l => l.isSuccess === false).length;
    const today = logs.filter(l => new Date(l.timestamp).toDateString() === new Date().toDateString()).length;
    return { total, successful, failed, today };
  }, [logs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-muted" />
            <div className="absolute top-0 left-0 w-12 h-12 rounded-full border-2 border-momentum-orange border-t-transparent animate-spin" />
          </div>
          <p className="text-sm text-muted-foreground">
            {language === 'fr' ? 'Chargement des logs...' : 'Loading activity logs...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {language === 'fr' ? 'Journal d\'activité' : 'Activity Logs'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'fr'
              ? 'Suivez toutes les actions effectuées sur la plateforme'
              : 'Track all actions performed on the platform'}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-card border border-border hover:bg-muted transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
          <span className="text-sm font-medium">
            {language === 'fr' ? 'Actualiser' : 'Refresh'}
          </span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl border border-border/50 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <Activity className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tabular-nums">{stats.total.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">
                {language === 'fr' ? 'Total événements' : 'Total events'}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-card rounded-xl border border-border/50 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tabular-nums">{stats.successful.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">
                {language === 'fr' ? 'Réussis' : 'Successful'}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl border border-border/50 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <XCircle className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tabular-nums">{stats.failed.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">
                {language === 'fr' ? 'Échoués' : 'Failed'}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-card rounded-xl border border-border/50 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-momentum-orange/10">
              <Clock className="w-5 h-5 text-momentum-orange" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground tabular-nums">{stats.today.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">
                {language === 'fr' ? 'Aujourd\'hui' : 'Today'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Error Alert */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
        >
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Search and Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={language === 'fr' ? 'Rechercher par utilisateur, action...' : 'Search by user, action...'}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-momentum-orange/20 focus:border-momentum-orange transition-colors"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors min-h-[44px]",
              showFilters
                ? "bg-momentum-orange text-white border-momentum-orange"
                : "bg-card border-border hover:bg-muted"
            )}
          >
            <Filter className="w-4 h-4" />
            <span className="sm:inline">{language === 'fr' ? 'Filtres' : 'Filters'}</span>
            <ChevronDown className={cn("w-4 h-4 transition-transform", showFilters && "rotate-180")} />
          </button>
        </div>

        {/* Quick Grouping Selector - scrollable on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 -mx-1 px-1">
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {language === 'fr' ? 'Grouper:' : 'Group:'}
          </span>
          <div className="inline-flex items-center rounded-lg bg-card border border-border p-1">
            {GROUPING_OPTIONS.map(option => (
              <button
                key={option.id}
                onClick={() => setGrouping(option.id)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                  grouping === option.id
                    ? "bg-momentum-orange text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                title={language === 'fr' ? `Grouper par ${option.labelFr.toLowerCase()}` : `Group by ${option.label.toLowerCase()}`}
              >
                {language === 'fr' ? option.labelFr : option.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-card rounded-xl border border-border/50 p-4 space-y-4">
              {/* Category Filter */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                  {language === 'fr' ? 'Catégorie' : 'Category'}
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 sm:flex-wrap sm:overflow-visible">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setCategoryFilter(cat.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap min-h-[36px]",
                        categoryFilter === cat.id
                          ? "bg-momentum-orange text-white"
                          : "bg-muted hover:bg-muted/80 text-muted-foreground"
                      )}
                    >
                      {language === 'fr' ? cat.labelFr : cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                  {language === 'fr' ? 'Statut' : 'Status'}
                </label>
                <div className="flex gap-2">
                  {(['all', 'success', 'failed'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                        statusFilter === status
                          ? "bg-momentum-orange text-white"
                          : "bg-muted hover:bg-muted/80 text-muted-foreground"
                      )}
                    >
                      {status === 'all'
                        ? (language === 'fr' ? 'Tous' : 'All')
                        : status === 'success'
                          ? (language === 'fr' ? 'Réussi' : 'Success')
                          : (language === 'fr' ? 'Échoué' : 'Failed')
                      }
                    </button>
                  ))}
                </div>
              </div>

              {/* Grouping Selector */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 block">
                  {language === 'fr' ? 'Grouper par' : 'Group by'}
                </label>
                <div className="flex gap-2">
                  {GROUPING_OPTIONS.map(option => (
                    <button
                      key={option.id}
                      onClick={() => setGrouping(option.id)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                        grouping === option.id
                          ? "bg-momentum-orange text-white"
                          : "bg-muted hover:bg-muted/80 text-muted-foreground"
                      )}
                    >
                      {language === 'fr' ? option.labelFr : option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Activity Timeline */}
      <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
        {/* Expand/Collapse All Header */}
        {filteredLogs.length > 0 && groupedLogs.length > 1 && (
          <div className="px-4 py-2 bg-muted/50 border-b border-border/50 flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              {groupedLogs.length} {language === 'fr' ? 'groupes' : 'groups'}
            </span>
            <button
              onClick={allCollapsed ? expandAll : collapseAll}
              className="text-xs font-medium text-momentum-orange hover:text-orange-600 transition-colors"
            >
              {allCollapsed
                ? (language === 'fr' ? 'Tout développer' : 'Expand all')
                : (language === 'fr' ? 'Tout réduire' : 'Collapse all')
              }
            </button>
          </div>
        )}

        {filteredLogs.length === 0 ? (
          <div className="text-center py-16">
            <Activity className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || categoryFilter !== 'all' || statusFilter !== 'all'
                ? (language === 'fr' ? 'Aucun résultat pour ces filtres' : 'No results for these filters')
                : (language === 'fr' ? 'Aucune activité enregistrée' : 'No activity recorded')
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {groupedLogs.map(({ date, logs: groupLogs }) => {
              const isCollapsed = collapsedGroups.has(date);

              return (
                <div key={date}>
                  {/* Date Header - Clickable */}
                  <button
                    onClick={() => toggleGroup(date)}
                    className="w-full px-4 py-3 bg-muted/30 border-b border-border/50 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ChevronDown
                          className={cn(
                            "w-4 h-4 text-muted-foreground transition-transform duration-200",
                            isCollapsed && "-rotate-90"
                          )}
                        />
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">{date}</span>
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {groupLogs.length} {language === 'fr' ? 'événements' : 'events'}
                      </span>
                    </div>
                  </button>

                  {/* Log Items - Collapsible */}
                  <AnimatePresence initial={false}>
                    {!isCollapsed && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        {groupLogs.map((log: any, index: number) => {
                  const config = getActionConfig(log.action || '');
                  const ActionIcon = config.icon;
                  const deviceInfo = log.userAgent ? parseUserAgent(log.userAgent) : null;
                  const DeviceIcon = deviceInfo?.device === 'mobile' ? Smartphone : deviceInfo?.device === 'tablet' ? Tablet : Monitor;

                  return (
                    <motion.div
                      key={log.id || index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="group px-4 py-4 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        {/* Icon */}
                        <div
                          className="flex-shrink-0 p-2 rounded-lg"
                          style={{ backgroundColor: `${config.color}15` }}
                        >
                          <ActionIcon className="w-4 h-4" style={{ color: config.color }} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium text-foreground">
                              {language === 'fr' ? config.labelFr : config.label}
                            </span>
                            {log.isSuccess === false && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500">
                                <XCircle className="w-3 h-3" />
                                {language === 'fr' ? 'Échoué' : 'Failed'}
                              </span>
                            )}
                          </div>

                          {/* User and Entity Info */}
                          <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                            {log.userEmail && (
                              <>
                                <User className="w-3.5 h-3.5" />
                                <span className="font-medium">{log.userEmail}</span>
                              </>
                            )}
                            {log.entity && log.entity !== 'auth' && (
                              <>
                                <span className="text-muted-foreground/40">•</span>
                                <span>{log.entity}</span>
                              </>
                            )}
                          </div>

                          {/* Error Message */}
                          {log.errorMessage && (
                            <p className="mt-1.5 text-sm text-red-500 bg-red-500/5 px-2 py-1 rounded">
                              {log.errorMessage}
                            </p>
                          )}

                          {/* Meta Info */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground/70">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatRelativeTime(log.timestamp, language)}
                            </span>

                            {(log.IPAddress || log.iPAddress) && (
                              <span className="hidden sm:flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {log.IPAddress || log.iPAddress}
                              </span>
                            )}

                            {deviceInfo && (
                              <span className="hidden md:flex items-center gap-1" title={log.userAgent}>
                                <DeviceIcon className="w-3 h-3" />
                                <span className="truncate max-w-[150px]">{deviceInfo.browser} on {deviceInfo.os}</span>
                              </span>
                            )}
                          </div>
                        </div>

                                {/* Timestamp */}
                                <div className="flex-shrink-0 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                                  {new Date(log.timestamp).toLocaleTimeString(language === 'fr' ? 'fr-FR' : 'en-US', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    second: '2-digit',
                                  })}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Results Count */}
      {filteredLogs.length > 0 && (
        <p className="text-sm text-muted-foreground text-center">
          {language === 'fr'
            ? `Affichage de ${filteredLogs.length} sur ${logs.length} événements`
            : `Showing ${filteredLogs.length} of ${logs.length} events`
          }
        </p>
      )}
    </div>
  );
}
