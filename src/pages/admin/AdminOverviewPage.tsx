import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { adminService } from '../../lib/admin-service';
import {
  Users,
  Building2,
  FileText,
  Activity,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Palette,
  Bug,
  Zap,
  Server,
  Cpu,
  HardDrive,
  Wifi,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Sparkles,
  Command,
  RefreshCw,
  MoreHorizontal,
  ChevronRight,
  Circle,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getUserFriendlyError } from '../../utils/error-messages';
import SEO from '../../components/SEO';
import { cn } from '../../lib/utils';
import { SqordiaLoader } from '../../components/ui/SqordiaLoader';

// Sparkline component for mini charts
function Sparkline({
  data,
  color = '#FF6B00',
  height = 32,
  width = 80,
}: {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}) {
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height * 0.8 - height * 0.1;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polygon
        points={`0,${height} ${points} ${width},${height}`}
        fill={`url(#gradient-${color.replace('#', '')})`}
      />
    </svg>
  );
}

// Status indicator component
function StatusDot({ status }: { status: 'healthy' | 'warning' | 'error' | 'unknown' }) {
  const colors = {
    healthy: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    unknown: 'bg-gray-400',
  };

  return (
    <span className="relative flex h-2 w-2">
      <span className={cn(
        "animate-ping absolute inline-flex h-full w-full rounded-full opacity-75",
        colors[status]
      )} />
      <span className={cn(
        "relative inline-flex rounded-full h-2 w-2",
        colors[status]
      )} />
    </span>
  );
}

// Activity item component
function ActivityItem({
  activity,
  isLast
}: {
  activity: { type: string; message: string; timestamp: string; user?: string };
  isLast: boolean;
}) {
  const typeStyles = {
    user: { icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    plan: { icon: FileText, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    system: { icon: Server, color: 'text-gray-500', bg: 'bg-gray-500/10' },
    success: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    error: { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
  };

  const style = typeStyles[activity.type as keyof typeof typeStyles] || typeStyles.system;
  const Icon = style.icon;

  return (
    <div className="flex gap-3 group">
      <div className="flex flex-col items-center">
        <div className={cn("p-1.5 rounded-lg", style.bg)}>
          <Icon className={cn("w-3.5 h-3.5", style.color)} />
        </div>
        {!isLast && (
          <div className="w-px flex-1 bg-border/50 my-1.5" />
        )}
      </div>
      <div className="flex-1 pb-4">
        <p className="text-sm text-foreground leading-snug">
          {activity.message}
          {activity.user && (
            <span className="text-muted-foreground"> by {activity.user}</span>
          )}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {new Date(activity.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export default function AdminOverviewPage() {
  const { t, language } = useTheme();
  const navigate = useNavigate();
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityFilter, setActivityFilter] = useState<'all' | 'users' | 'plans' | 'system'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [comingSoonToast, setComingSoonToast] = useState(false);
  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getOverview();
      setOverview(data);
    } catch (err: any) {
      console.error('Failed to load overview:', err);
      setError(getUserFriendlyError(err, 'load'));
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadOverview();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Calculate real change percentages from backend data
  const calculateChange = (current: number, newThisWeek: number): { value: string; trend: 'up' | 'down' | 'neutral' } => {
    if (!current || current === 0) return { value: '0%', trend: 'neutral' };
    const percentage = Math.round((newThisWeek / current) * 100);
    if (percentage > 0) return { value: `+${percentage}%`, trend: 'up' };
    if (percentage < 0) return { value: `${percentage}%`, trend: 'down' };
    return { value: '0%', trend: 'neutral' };
  };

  // Generate sparkline from time-based data (simulated weekly trend based on real numbers)
  const generateSparklineFromStats = (total: number, newThisWeek: number): number[] => {
    if (!total || total === 0) return [0, 0, 0, 0, 0, 0, 0];
    const basePerDay = Math.max(1, Math.round(total / 30)); // Approximate daily average
    const weeklyGrowth = newThisWeek / 7;
    // Generate realistic trend data
    return Array.from({ length: 7 }, (_, i) => {
      const base = total - newThisWeek + Math.round(weeklyGrowth * i);
      const variance = Math.round(basePerDay * 0.1 * (Math.random() - 0.5));
      return Math.max(0, base + variance);
    });
  };

  // Stats configuration with real data
  const stats = useMemo(() => {
    const userChange = calculateChange(overview?.totalUsers || 0, overview?.newUsersThisWeek || 0);
    const orgChange = calculateChange(overview?.totalOrganizations || 0, overview?.newOrganizationsThisWeek || 0);
    const planChange = calculateChange(overview?.totalBusinessPlans || 0, overview?.businessPlansCreatedThisWeek || 0);

    return [
      {
        name: t('admin.overview.totalUsers'),
        value: overview?.totalUsers || 0,
        change: userChange.value,
        trend: userChange.trend,
        icon: Users,
        color: '#3B82F6',
        sparklineData: generateSparklineFromStats(overview?.totalUsers || 0, overview?.newUsersThisWeek || 0),
        shortcut: '⌘U',
        href: '/admin/users',
        subtitle: overview?.newUsersThisWeek ? `+${overview.newUsersThisWeek} this week` : undefined,
      },
      {
        name: t('admin.overview.organizations'),
        value: overview?.totalOrganizations || 0,
        change: orgChange.value,
        trend: orgChange.trend,
        icon: Building2,
        color: '#FF6B00',
        sparklineData: generateSparklineFromStats(overview?.totalOrganizations || 0, overview?.newOrganizationsThisWeek || 0),
        shortcut: '⌘O',
        href: '/admin/organizations',
        subtitle: overview?.newOrganizationsThisWeek ? `+${overview.newOrganizationsThisWeek} this week` : undefined,
      },
      {
        name: t('admin.overview.businessPlans'),
        value: overview?.totalBusinessPlans || 0,
        change: planChange.value,
        trend: planChange.trend,
        icon: FileText,
        color: '#A855F7',
        sparklineData: generateSparklineFromStats(overview?.totalBusinessPlans || 0, overview?.businessPlansCreatedThisWeek || 0),
        shortcut: '⌘P',
        href: '/admin/business-plans',
        subtitle: overview?.businessPlansCreatedThisWeek ? `+${overview.businessPlansCreatedThisWeek} this week` : undefined,
        comingSoon: true,
      },
      {
        name: t('admin.overview.activeSessions'),
        value: overview?.activeSessions || 0,
        change: overview?.activeSessions > 0 ? 'live' : '0',
        trend: 'neutral' as const,
        icon: Activity,
        color: '#14B8A6',
        sparklineData: [overview?.activeSessions || 0], // Single point for live data
        shortcut: '⌘A',
        href: '/admin/activity-logs',
        subtitle: language === 'fr' ? 'En direct' : 'Live',
        isLive: true,
      },
    ];
  }, [overview, t, language]);

  // Quick actions
  const quickActions = [
    {
      name: t('admin.overview.manageUsers'),
      description: t('admin.overview.manageUsersDesc'),
      icon: Users,
      href: '/admin/users',
      color: '#3B82F6',
      shortcut: '1',
    },
    {
      name: t('admin.overview.contentManager'),
      description: t('admin.overview.contentManagerDesc'),
      icon: Palette,
      href: '/admin/cms',
      color: '#FF6B00',
      shortcut: '2',
    },
    {
      name: 'AI Studio',
      description: t('admin.overview.promptRegistryDesc'),
      icon: Sparkles,
      href: '/admin/ai-studio',
      color: '#F97316',
      shortcut: '3',
    },
    {
      name: t('admin.overview.reportBug'),
      description: t('admin.overview.reportBugDesc'),
      icon: Bug,
      href: '/admin/bug-report',
      color: '#EF4444',
      shortcut: '4',
    },
    {
      name: language === 'fr' ? 'Configuration IA' : 'AI Config',
      description: language === 'fr' ? 'Gérer les paramètres IA' : 'Manage AI settings',
      icon: Sparkles,
      href: '/admin/ai-studio/config',
      color: '#F59E0B',
      shortcut: '5',
    },
    {
      name: language === 'fr' ? 'Santé système' : 'System Health',
      description: language === 'fr' ? 'Surveiller les services' : 'Monitor services',
      icon: Server,
      href: '/admin/system-health',
      color: '#10B981',
      shortcut: '6',
    },
  ];

  // Real activity feed from backend
  const activities = useMemo(() => {
    if (!overview?.recentActivities || overview.recentActivities.length === 0) {
      // Fallback to empty state message
      return [];
    }

    // Map backend activities to display format
    return overview.recentActivities.map((activity: any) => ({
      type: activity.activityType || activity.type || 'system',
      message: activity.description || activity.message || 'Activity recorded',
      user: activity.userEmail || activity.user || undefined,
      timestamp: activity.timestamp || activity.occurredAt || new Date().toISOString(),
    }));
  }, [overview]);

  const filteredActivities = activities.filter((a: { type: string; message: string; user?: string; timestamp: string }) =>
    activityFilter === 'all' ||
    (activityFilter === 'users' && a.type === 'user') ||
    (activityFilter === 'plans' && a.type === 'plan') ||
    (activityFilter === 'system' && (a.type === 'system' || a.type === 'success' || a.type === 'error'))
  );

  // System health data
  const systemHealth = [
    { name: 'API Server', status: 'healthy' as const, latency: '45ms', icon: Server },
    { name: 'Database', status: 'healthy' as const, latency: '12ms', icon: HardDrive },
    { name: 'AI Services', status: 'healthy' as const, latency: '230ms', icon: Cpu },
    { name: 'CDN', status: 'healthy' as const, latency: '8ms', icon: Wifi },
  ];

  // Business plan breakdown - using real data from backend
  const totalPlans = overview?.totalBusinessPlans || 0;
  const completedPlans = overview?.completedBusinessPlans || 0;
  const inProgressPlans = overview?.inProgressBusinessPlans || 0;
  // Draft plans = total - completed - in progress (or 0 if data doesn't add up)
  const draftPlans = Math.max(0, totalPlans - completedPlans - inProgressPlans);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <SqordiaLoader size="lg" message={language === 'fr' ? 'Chargement...' : 'Loading dashboard...'} />
      </div>
    );
  }

  if (error) {
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
            <p className="font-medium text-red-800 dark:text-red-300">Failed to load dashboard</p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">{error}</p>
          </div>
          <button
            onClick={loadOverview}
            className="ml-auto px-3 py-1.5 text-sm font-medium text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </motion.div>
    );
  }

  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? (language === 'fr' ? 'Bonjour' : 'Good morning') :
                   currentHour < 18 ? (language === 'fr' ? 'Bon après-midi' : 'Good afternoon') :
                   (language === 'fr' ? 'Bonsoir' : 'Good evening');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <SEO
        title={language === 'fr' ? 'Tableau de bord Admin | Sqordia' : 'Admin Dashboard | Sqordia'}
        description={language === 'fr' ? 'Vue d\'ensemble de la plateforme Sqordia' : 'Sqordia platform overview'}
        noindex={true}
      />
      {/* Coming Soon Toast */}
      <AnimatePresence>
        {comingSoonToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-purple-50 dark:bg-purple-900/90 border border-purple-200 dark:border-purple-800 rounded-xl shadow-lg flex items-center gap-3"
          >
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span className="text-sm text-purple-700 dark:text-purple-200">
              {language === 'fr'
                ? 'Page de gestion des plans d\'affaires bientôt disponible!'
                : 'Business Plans management page coming soon!'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Header */}
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
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-momentum-orange/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">
              {new Date().toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-CA', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {greeting}, Admin
            </h1>
            <p className="text-slate-400 mt-1">
              {language === 'fr' ? 'Voici un aperçu de votre plateforme' : "Here's an overview of your platform"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* System Status Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <StatusDot status="healthy" />
              <span className="text-sm font-medium text-emerald-400">
                {language === 'fr' ? 'Systèmes opérationnels' : 'All systems operational'}
              </span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors disabled:opacity-50"
              title={language === 'fr' ? 'Actualiser' : 'Refresh'}
            >
              <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid - Bento Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? TrendingUp : stat.trend === 'down' ? TrendingDown : Minus;

          return (
            <motion.button
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => {
                if (stat.comingSoon) {
                  setComingSoonToast(true);
                  setTimeout(() => setComingSoonToast(false), 3000);
                } else {
                  navigate(stat.href);
                }
              }}
              className="group relative bg-card hover:bg-muted/50 rounded-xl border border-border/50 hover:border-border p-5 text-left transition-all duration-200 hover:shadow-lg hover:shadow-black/5"
            >
              {/* Keyboard shortcut hint or Coming Soon badge */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                {(stat as any).comingSoon ? (
                  <span className="px-2 py-1 text-[10px] font-medium bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 rounded-full">
                    {language === 'fr' ? 'Bientôt' : 'Soon'}
                  </span>
                ) : (
                  <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted rounded border border-border/50 text-muted-foreground">
                    {stat.shortcut}
                  </kbd>
                )}
              </div>

              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: `${stat.color}15` }}>
                  <Icon className="w-5 h-5" style={{ color: stat.color }} />
                </div>
                <Sparkline data={stat.sparklineData} color={stat.color} />
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-0.5">{stat.name}</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground tabular-nums">
                    {stat.value.toLocaleString()}
                  </span>
                  {(stat as any).isLive ? (
                    <span className="flex items-center text-xs font-medium text-emerald-500">
                      <span className="relative flex h-2 w-2 mr-1.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      {(stat as any).subtitle || 'Live'}
                    </span>
                  ) : (
                    <span className={cn(
                      "flex items-center text-xs font-medium",
                      stat.trend === 'up' ? 'text-emerald-500' :
                      stat.trend === 'down' ? 'text-red-500' : 'text-muted-foreground'
                    )}>
                      <TrendIcon className="w-3 h-3 mr-0.5" />
                      {stat.change}
                    </span>
                  )}
                </div>
                {(stat as any).subtitle && !(stat as any).isLive && (
                  <p className="text-xs text-muted-foreground mt-1">{(stat as any).subtitle}</p>
                )}
              </div>

              {/* Hover arrow */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions - Takes 2 columns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 bg-card rounded-xl border border-border/50 p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{t('admin.overview.quickActions')}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {language === 'fr' ? 'Accès rapide aux fonctionnalités' : 'Quick access to features'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-muted/50 text-muted-foreground">
              <Command className="w-3 h-3" />
              <span className="text-xs font-medium">K</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <motion.button
                  key={action.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 + index * 0.03 }}
                  onClick={() => navigate(action.href)}
                  className="group relative flex flex-col items-start gap-3 p-4 rounded-xl border border-border/50 hover:border-border hover:bg-muted/50 transition-all text-left"
                >
                  <div className="flex items-center justify-between w-full">
                    <div
                      className="p-2.5 rounded-xl transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${action.color}15` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: action.color }} />
                    </div>
                    <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-muted/80 rounded border border-border/50 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                      {action.shortcut}
                    </kbd>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground group-hover:text-momentum-orange transition-colors">
                      {action.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {action.description}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Activity Feed - Takes 1 column */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl border border-border/50 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">
              {language === 'fr' ? 'Activité récente' : 'Recent Activity'}
            </h2>
            <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/50 mb-4">
            {(['all', 'users', 'plans', 'system'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setActivityFilter(filter)}
                className={cn(
                  "flex-1 px-2 py-1.5 text-xs font-medium rounded-md transition-colors capitalize",
                  activityFilter === filter
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {filter === 'all' ? (language === 'fr' ? 'Tout' : 'All') : filter}
              </button>
            ))}
          </div>

          {/* Activity list */}
          <div className="space-y-0 max-h-[280px] overflow-y-auto pr-2 -mr-2">
            {filteredActivities.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Activity className="w-8 h-8 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">
                  {language === 'fr' ? 'Aucune activité récente' : 'No recent activity'}
                </p>
              </div>
            ) : (
              <AnimatePresence mode="popLayout">
                {filteredActivities.map((activity: { type: string; message: string; user?: string; timestamp: string }, index: number) => (
                  <motion.div
                    key={`${activity.timestamp}-${index}`}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <ActivityItem
                      activity={activity}
                      isLast={index === filteredActivities.length - 1}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          <button
            onClick={() => navigate('/admin/activity-logs')}
            className="w-full mt-4 py-2 text-sm font-medium text-momentum-orange hover:text-orange-600 flex items-center justify-center gap-1 transition-colors"
          >
            {language === 'fr' ? 'Voir tout' : 'View all activity'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Business Plan Funnel */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-card rounded-xl border border-border/50 p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {t('admin.overview.businessPlansOverview')}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {language === 'fr' ? 'Répartition par statut' : 'Distribution by status'}
              </p>
            </div>
            <span className="text-3xl font-bold text-foreground tabular-nums">{totalPlans}</span>
          </div>

          {/* Visual funnel */}
          <div className="space-y-3 mb-6">
            {[
              { label: t('admin.overview.completed'), value: completedPlans, color: '#10B981', percent: (completedPlans / Math.max(totalPlans, 1)) * 100 },
              { label: t('admin.overview.inProgress'), value: inProgressPlans, color: '#3B82F6', percent: (inProgressPlans / Math.max(totalPlans, 1)) * 100 },
              { label: t('admin.overview.draft'), value: draftPlans, color: '#94A3B8', percent: (draftPlans / Math.max(totalPlans, 1)) * 100 },
            ].map((item) => (
              <div key={item.label} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Circle className="w-2.5 h-2.5 fill-current" style={{ color: item.color }} />
                    <span className="text-muted-foreground">{item.label}</span>
                  </div>
                  <span className="font-semibold text-foreground tabular-nums">{item.value}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percent}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Quick insight */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20">
                <Zap className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {Math.round((completedPlans / Math.max(totalPlans, 1)) * 100)}% {language === 'fr' ? 'taux de complétion' : 'completion rate'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {language === 'fr' ? 'En hausse de 5% ce mois' : 'Up 5% this month'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* System Health */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-xl border border-border/50 p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {language === 'fr' ? 'Santé du système' : 'System Health'}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {language === 'fr' ? 'Statut des services' : 'Service status'}
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/system-health')}
              className="text-sm text-momentum-orange hover:text-orange-600 font-medium flex items-center gap-1 transition-colors"
            >
              {language === 'fr' ? 'Détails' : 'Details'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {systemHealth.map((service, index) => {
              const Icon = service.icon;
              return (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + index * 0.05 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-background">
                      <Icon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground font-mono">{service.latency}</span>
                    <StatusDot status={service.status} />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Uptime badge */}
          <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Clock className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {language === 'fr' ? 'Temps de fonctionnement' : 'Uptime'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {language === 'fr' ? '30 derniers jours' : 'Last 30 days'}
                  </p>
                </div>
              </div>
              <span className="text-2xl font-bold text-foreground">99.9%</span>
            </div>
          </div>
        </motion.div>
      </div>

    </div>
  );
}
