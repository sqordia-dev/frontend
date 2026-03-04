'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  Building2,
  FileText,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Server,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  RefreshCw,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { adminService } from '@/lib/admin-service';

const translations = {
  en: {
    title: 'Admin Overview',
    subtitle: 'Monitor your platform metrics and system health.',
    totalUsers: 'Total Users',
    organizations: 'Organizations',
    businessPlans: 'Business Plans',
    activeToday: 'Active Today',
    systemHealth: 'System Health',
    allSystemsOperational: 'All systems operational',
    recentActivity: 'Recent Activity',
    viewAll: 'View All',
    quickActions: 'Quick Actions',
    manageUsers: 'Manage Users',
    viewOrganizations: 'View Organizations',
    systemSettings: 'System Settings',
    refresh: 'Refresh',
    loading: 'Loading...',
    error: 'Failed to load data',
    retry: 'Retry',
    noData: 'No data available',
    healthy: 'Healthy',
    warning: 'Warning',
    errorStatus: 'Error',
    api: 'API',
    database: 'Database',
    cache: 'Cache',
    storage: 'Storage',
  },
  fr: {
    title: 'Apercu Admin',
    subtitle: 'Surveillez les metriques et la sante du systeme.',
    totalUsers: 'Total Utilisateurs',
    organizations: 'Organisations',
    businessPlans: "Plans d'Affaires",
    activeToday: 'Actifs Aujourd hui',
    systemHealth: 'Sante du Systeme',
    allSystemsOperational: 'Tous les systemes operationnels',
    recentActivity: 'Activite Recente',
    viewAll: 'Voir Tout',
    quickActions: 'Actions Rapides',
    manageUsers: 'Gerer les Utilisateurs',
    viewOrganizations: 'Voir les Organisations',
    systemSettings: 'Parametres Systeme',
    refresh: 'Actualiser',
    loading: 'Chargement...',
    error: 'Echec du chargement',
    retry: 'Reessayer',
    noData: 'Aucune donnee disponible',
    healthy: 'Sain',
    warning: 'Attention',
    errorStatus: 'Erreur',
    api: 'API',
    database: 'Base de donnees',
    cache: 'Cache',
    storage: 'Stockage',
  },
};

interface DashboardStats {
  totalUsers: number;
  totalOrganizations: number;
  totalBusinessPlans: number;
  activeUsersToday: number;
  userGrowth?: number;
  planGrowth?: number;
}

interface SystemStatus {
  api: 'healthy' | 'warning' | 'error';
  database: 'healthy' | 'warning' | 'error';
  cache: 'healthy' | 'warning' | 'error';
  storage: 'healthy' | 'warning' | 'error';
}

export default function AdminOverviewContent({ locale }: { locale: string }) {
  const t = translations[locale as keyof typeof translations] || translations.en;
  const basePath = locale === 'fr' ? '/fr' : '';

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const [statsData, healthData] = await Promise.all([
        adminService.getOverview(),
        adminService.getSystemHealth(),
      ]);

      setStats(statsData);
      setSystemStatus({
        api: healthData?.api?.status || 'healthy',
        database: healthData?.database?.status || 'healthy',
        cache: healthData?.cache?.status || 'healthy',
        storage: healthData?.storage?.status || 'healthy',
      });
    } catch (err) {
      console.error('Failed to load admin data:', err);
      setError(t.error);
      // Set default values on error
      setStats({
        totalUsers: 0,
        totalOrganizations: 0,
        totalBusinessPlans: 0,
        activeUsersToday: 0,
      });
      setSystemStatus({
        api: 'healthy',
        database: 'healthy',
        cache: 'healthy',
        storage: 'healthy',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getGrowthIcon = (growth?: number) => {
    if (!growth || growth === 0) return <Minus size={16} className="text-gray-400" />;
    if (growth > 0) return <TrendingUp size={16} className="text-green-500" />;
    return <TrendingDown size={16} className="text-red-500" />;
  };

  const getStatusIcon = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle2 size={16} className="text-green-500" />;
      case 'warning':
        return <Clock size={16} className="text-yellow-500" />;
      case 'error':
        return <XCircle size={16} className="text-red-500" />;
    }
  };

  const getStatusText = (status: 'healthy' | 'warning' | 'error') => {
    switch (status) {
      case 'healthy':
        return t.healthy;
      case 'warning':
        return t.warning;
      case 'error':
        return t.errorStatus;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 size={40} className="animate-spin mx-auto mb-4 text-orange-500" />
          <p className="text-gray-600 dark:text-gray-400">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t.title}</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">{t.subtitle}</p>
        </div>
        <button
          onClick={loadData}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw size={16} />
          {t.refresh}
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} className="text-red-500" />
          <span className="text-red-700 dark:text-red-400">{error}</span>
          <button
            onClick={loadData}
            className="ml-auto text-sm font-medium text-red-600 hover:underline"
          >
            {t.retry}
          </button>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Users size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            {getGrowthIcon(stats?.userGrowth)}
          </div>
          <p className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            {stats?.totalUsers?.toLocaleString() || 0}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t.totalUsers}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Building2 size={20} className="text-purple-600 dark:text-purple-400" />
            </div>
            <Minus size={16} className="text-gray-400" />
          </div>
          <p className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            {stats?.totalOrganizations?.toLocaleString() || 0}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t.organizations}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <FileText size={20} className="text-orange-600 dark:text-orange-400" />
            </div>
            {getGrowthIcon(stats?.planGrowth)}
          </div>
          <p className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            {stats?.totalBusinessPlans?.toLocaleString() || 0}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t.businessPlans}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
          <div className="flex items-center justify-between">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Activity size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <Minus size={16} className="text-gray-400" />
          </div>
          <p className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            {stats?.activeUsersToday?.toLocaleString() || 0}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{t.activeToday}</p>
        </div>
      </div>

      {/* System Health & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Health */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Server size={20} className="text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t.systemHealth}</h2>
          </div>
          <div className="space-y-3">
            {systemStatus && Object.entries(systemStatus).map(([key, status]) => (
              <div key={key} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <span className="text-gray-700 dark:text-gray-300 capitalize">
                  {t[key as keyof typeof t] || key}
                </span>
                <div className="flex items-center gap-2">
                  {getStatusIcon(status)}
                  <span className={`text-sm ${
                    status === 'healthy' ? 'text-green-600 dark:text-green-400' :
                    status === 'warning' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    {getStatusText(status)}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {systemStatus && Object.values(systemStatus).every(s => s === 'healthy') && (
            <p className="mt-4 text-sm text-green-600 dark:text-green-400 flex items-center gap-2">
              <CheckCircle2 size={14} />
              {t.allSystemsOperational}
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t.quickActions}</h2>
          <div className="space-y-3">
            <Link
              href={`${basePath}/admin/users`}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Users size={18} className="text-blue-500" />
                <span className="font-medium text-gray-700 dark:text-gray-300">{t.manageUsers}</span>
              </div>
              <ArrowRight size={16} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors" />
            </Link>
            <Link
              href={`${basePath}/admin/organizations`}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Building2 size={18} className="text-purple-500" />
                <span className="font-medium text-gray-700 dark:text-gray-300">{t.viewOrganizations}</span>
              </div>
              <ArrowRight size={16} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors" />
            </Link>
            <Link
              href={`${basePath}/admin/settings`}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Server size={18} className="text-gray-500" />
                <span className="font-medium text-gray-700 dark:text-gray-300">{t.systemSettings}</span>
              </div>
              <ArrowRight size={16} className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-200 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
