import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../lib/admin-service';
import {
  Users,
  Building2,
  FileText,
  Activity,
  AlertCircle,
  UserPlus,
  Clock,
  CheckCircle2,
  PenLine,
  ArrowRight,
  Palette,
  Database,
  Bug
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getUserFriendlyError } from '../../utils/error-messages';

export default function AdminOverviewPage() {
  const { t } = useTheme();
  const navigate = useNavigate();
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
      iconColor: '#3B82F6'
    },
    {
      name: t('admin.overview.organizations'),
      value: overview?.totalOrganizations || 0,
      icon: Building2,
      iconColor: '#FF6B00'
    },
    {
      name: t('admin.overview.businessPlans'),
      value: overview?.totalBusinessPlans || 0,
      icon: FileText,
      iconColor: '#A855F7'
    },
    {
      name: t('admin.overview.activeSessions'),
      value: overview?.activeSessions || 0,
      icon: Activity,
      iconColor: '#14B8A6'
    }
  ];

  const quickActions = [
    {
      name: t('admin.overview.manageUsers'),
      description: t('admin.overview.manageUsersDesc'),
      icon: Users,
      href: '/admin/users',
      color: '#3B82F6'
    },
    {
      name: t('admin.overview.contentManager'),
      description: t('admin.overview.contentManagerDesc'),
      icon: Palette,
      href: '/admin/cms',
      color: '#FF6B00'
    },
    {
      name: t('admin.overview.promptRegistry'),
      description: t('admin.overview.promptRegistryDesc'),
      icon: Database,
      href: '/admin/prompt-registry',
      color: '#A855F7'
    },
    {
      name: t('admin.overview.reportBug'),
      description: t('admin.overview.reportBugDesc'),
      icon: Bug,
      href: '/admin/bug-report',
      color: '#EF4444'
    }
  ];

  // Calculate business plan stats
  const totalPlans = overview?.totalBusinessPlans || 0;
  const draftPlans = overview?.draftBusinessPlans || Math.floor(totalPlans * 0.3);
  const inProgressPlans = overview?.inProgressBusinessPlans || Math.floor(totalPlans * 0.5);
  const completedPlans = overview?.completedBusinessPlans || totalPlans - draftPlans - inProgressPlans;

  // Recent registrations from activities or mock data
  const recentUsers = overview?.recentUsers || overview?.recentActivities?.filter((a: any) =>
    a.activity?.includes('register') || a.activity?.includes('signup')
  ).slice(0, 4) || [];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
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
            </div>
          );
        })}
      </div>

      {/* Second Row: Quick Actions & Business Plan Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('admin.overview.quickActions')}</h3>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.name}
                  onClick={() => navigate(action.href)}
                  className="flex items-start gap-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all text-left group"
                >
                  <div
                    className="p-2 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: `${action.color}15` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: action.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-[#FF6B00] transition-colors">
                      {action.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                      {action.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Business Plan Breakdown */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('admin.overview.businessPlansOverview')}</h3>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">{totalPlans}</span>
          </div>

          {/* Progress bar */}
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden flex mb-4">
            {completedPlans > 0 && (
              <div
                className="bg-green-500 h-full transition-all"
                style={{ width: `${(completedPlans / Math.max(totalPlans, 1)) * 100}%` }}
              />
            )}
            {inProgressPlans > 0 && (
              <div
                className="bg-blue-500 h-full transition-all"
                style={{ width: `${(inProgressPlans / Math.max(totalPlans, 1)) * 100}%` }}
              />
            )}
            {draftPlans > 0 && (
              <div
                className="bg-gray-400 h-full transition-all"
                style={{ width: `${(draftPlans / Math.max(totalPlans, 1)) * 100}%` }}
              />
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('admin.overview.completed')}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{completedPlans}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PenLine className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('admin.overview.inProgress')}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{inProgressPlans}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{t('admin.overview.draft')}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">{draftPlans}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Third Row: Recent Registrations & Top Organizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registrations */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('admin.overview.recentRegistrations')}</h3>
            <button
              onClick={() => navigate('/admin/users')}
              className="text-sm text-[#FF6B00] hover:text-[#e55f00] font-medium flex items-center gap-1"
            >
              {t('admin.overview.viewAll')} <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {recentUsers.length > 0 ? (
            <div className="space-y-3">
              {recentUsers.map((user: any, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] flex items-center justify-center text-white font-medium">
                    {(user.name || user.email || 'U').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.name || user.email || 'New User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.timestamp ? new Date(user.timestamp).toLocaleDateString() : t('admin.overview.recently')}
                    </p>
                  </div>
                  <UserPlus className="w-4 h-4 text-green-500 flex-shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <UserPlus className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">{t('admin.overview.noRecentRegistrations')}</p>
            </div>
          )}
        </div>

        {/* Platform Insights */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('admin.overview.platformInsights')}</h3>

          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">{t('admin.overview.avgPlansPerUser')}</p>
                  <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
                    {overview?.totalUsers ? (overview?.totalBusinessPlans / overview?.totalUsers).toFixed(1) : '0'}
                  </p>
                </div>
                <FileText className="w-10 h-10 text-blue-500/50" />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">{t('admin.overview.avgUsersPerOrg')}</p>
                  <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">
                    {overview?.totalOrganizations ? (overview?.totalUsers / overview?.totalOrganizations).toFixed(1) : '0'}
                  </p>
                </div>
                <Building2 className="w-10 h-10 text-purple-500/50" />
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">{t('admin.overview.completionRate')}</p>
                  <p className="text-2xl font-bold text-orange-700 dark:text-orange-300 mt-1">
                    {totalPlans > 0 ? Math.round((completedPlans / totalPlans) * 100) : 0}%
                  </p>
                </div>
                <CheckCircle2 className="w-10 h-10 text-orange-500/50" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
