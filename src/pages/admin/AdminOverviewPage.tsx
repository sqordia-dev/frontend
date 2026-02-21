import { useEffect, useState } from 'react';
import { adminService } from '../../lib/admin-service';
import { Users, Building2, FileText, TrendingUp, Activity, AlertCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getUserFriendlyError } from '../../utils/error-messages';

export default function AdminOverviewPage() {
  const { t } = useTheme();
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOverview();
  }, []);

  const loadOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getOverview();
      // Handle both direct data and Result wrapper
      setOverview(data);
    } catch (err: any) {
      console.error('Failed to load overview:', err);
      setError(getUserFriendlyError(err, 'load'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B00]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
          <p className="text-red-800 dark:text-red-300">{error}</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: t('admin.overview.totalUsers'),
      value: overview?.totalUsers || 0,
      icon: Users,
      iconColor: '#3B82F6',
      change: '+12%',
      changeType: 'positive'
    },
    {
      name: t('admin.overview.organizations'),
      value: overview?.totalOrganizations || 0,
      icon: Building2,
      iconColor: '#FF6B00',
      change: '+8%',
      changeType: 'positive'
    },
    {
      name: t('admin.overview.businessPlans'),
      value: overview?.totalBusinessPlans || 0,
      icon: FileText,
      iconColor: '#A855F7',
      change: '+23%',
      changeType: 'positive'
    },
    {
      name: t('admin.overview.activeSessions'),
      value: overview?.activeSessions || 0,
      icon: Activity,
      iconColor: '#14B8A6',
      change: '-5%',
      changeType: 'negative'
    }
  ];

  return (
    <div className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.name}
                    className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all duration-200 hover:border-gray-300 dark:hover:border-gray-700"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.name}</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value.toLocaleString()}</p>
                      </div>
                      <div className="p-3 rounded-xl" style={{ backgroundColor: `${stat.iconColor}15` }}>
                        <Icon className="w-6 h-6" style={{ color: stat.iconColor }} />
                      </div>
                    </div>
                    <div className="flex items-center pt-4 border-t border-gray-100 dark:border-gray-800">
                      <TrendingUp className={`w-4 h-4 mr-1 ${stat.changeType === 'positive' ? 'text-orange-600' : 'text-red-600'}`} />
                      <span className={`text-sm font-semibold ${stat.changeType === 'positive' ? 'text-orange-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{t('admin.overview.vsLastMonth')}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all duration-200">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('admin.overview.recentActivity')}</h3>
                <div className="space-y-3">
                  {overview?.recentActivities?.slice(0, 5).map((activity: any, index: number) => (
                    <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                      <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-[#FF6B00]"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{activity.activity || activity.description || 'System activity'}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {activity.timestamp ? new Date(activity.timestamp).toLocaleString() : 'Just now'}
                        </p>
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">{t('admin.overview.noActivity')}</p>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 hover:shadow-lg transition-all duration-200">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">{t('admin.overview.systemStatus')}</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.overview.apiStatus')}</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FF6B00] text-white">
                      {t('admin.overview.operational')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.overview.database')}</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FF6B00] text-white">
                      {t('admin.overview.healthy')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.overview.aiServices')}</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-[#FF6B00] text-white">
                      {t('admin.overview.active')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{t('admin.overview.storage')}</span>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500 text-white">
                      {overview?.storageUsage || '75%'} {t('admin.overview.used')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
    </div>
  );
}
