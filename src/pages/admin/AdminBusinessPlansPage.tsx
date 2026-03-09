import { useEffect, useState } from 'react';
import { adminService } from '../../lib/admin-service';
import { Search, FileText, RefreshCw, AlertCircle, LayoutGrid, List } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { getUserFriendlyError } from '../../utils/error-messages';
import { useIsMobile } from '../../hooks';
import { cn } from '../../lib/utils';
import { Button } from '../../components/ui/button';

export default function AdminBusinessPlansPage() {
  const { t } = useTheme();
  const toast = useToast();
  const isMobile = useIsMobile();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('list');
  const [userOverrodeViewMode, setUserOverrodeViewMode] = useState(false);

  // Auto-switch view mode based on screen size
  useEffect(() => {
    if (!userOverrodeViewMode) {
      setViewMode(isMobile ? 'card' : 'list');
    }
  }, [isMobile, userOverrodeViewMode]);

  const handleViewModeChange = (mode: 'list' | 'card') => {
    setViewMode(mode);
    setUserOverrodeViewMode(true);
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getBusinessPlans();
      setPlans(data);
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'load'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async (planId: string) => {
    try {
      setRegenerating(planId);
      await adminService.regenerateBusinessPlan(planId);
      toast.success('Regeneration Started', 'Business plan regeneration has been started.');
    } catch (err: any) {
      toast.error('Regeneration Error', getUserFriendlyError(err, 'generate'));
    } finally {
      setRegenerating(null);
    }
  };

  const filteredPlans = plans.filter(plan =>
    plan.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.organizationName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header skeleton */}
        <div>
          <div className="h-8 w-56 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="mt-2 h-4 w-80 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        {/* Table card skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
          {/* Table header skeleton */}
          <div className="px-4 lg:px-6 py-3 bg-gray-50 dark:bg-gray-700/50">
            <div className="flex gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-3 w-20 bg-gray-200 dark:bg-gray-600 rounded" />
              ))}
            </div>
          </div>
          {/* Table rows skeleton */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-4 lg:px-6 py-4 flex items-center gap-4">
                <div className="w-9 h-9 bg-gray-200 dark:bg-gray-700 rounded flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="h-3 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded-full" />
                <div className="hidden md:block h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('admin.businessPlans.title')}</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{t('admin.businessPlans.subtitle')}</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('admin.businessPlans.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            {/* View Toggle - hidden on mobile since we auto-switch */}
            <div className="hidden md:flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg p-1 bg-white dark:bg-gray-700">
              <button
                onClick={() => handleViewModeChange('list')}
                className={cn(
                  'p-2 rounded transition-colors',
                  viewMode === 'list'
                    ? 'text-white bg-[#FF6B00]'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                )}
                title="List View"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleViewModeChange('card')}
                className={cn(
                  'p-2 rounded transition-colors',
                  viewMode === 'card'
                    ? 'text-white bg-[#FF6B00]'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                )}
                title="Card View"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {viewMode === 'list' ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('admin.businessPlans.plan')}
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">
                    {t('admin.businessPlans.organization')}
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('admin.businessPlans.status')}
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden xl:table-cell">
                    {t('admin.businessPlans.type')}
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">
                    {t('admin.businessPlans.created')}
                  </th>
                  <th className="px-4 lg:px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredPlans.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      {t('admin.businessPlans.noPlans')}
                    </td>
                  </tr>
                ) : (
                  filteredPlans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/20 p-2 rounded">
                            <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="ml-3 lg:ml-4 min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[150px] sm:max-w-[200px] lg:max-w-none">
                              {plan.title}
                            </div>
                            {plan.description && (
                              <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                {plan.description}
                              </div>
                            )}
                            {/* Show organization on mobile below title */}
                            <div className="lg:hidden text-xs text-gray-400 dark:text-gray-500 mt-1">
                              {plan.organizationName || '-'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white hidden lg:table-cell">
                        {plan.organizationName || '-'}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                          plan.status === 'Completed' || plan.status === 'completed'
                            ? 'bg-[#FF6B00] text-white'
                            : plan.status === 'In Progress' || plan.status === 'inProgress'
                            ? 'bg-blue-500/[0.08] text-blue-500'
                            : 'bg-gray-500/[0.08] text-gray-500'
                        )}>
                          {plan.status === 'Completed' ? t('admin.businessPlans.completed') :
                           plan.status === 'InProgress' ? t('admin.businessPlans.inProgress') :
                           t('admin.businessPlans.draft')}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden xl:table-cell">
                        {plan.planType || plan.businessType || 'Standard'}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 hidden md:table-cell">
                        {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="brand-ghost"
                          size="sm"
                          onClick={() => handleRegenerate(plan.id)}
                          disabled={regenerating === plan.id}
                        >
                          <RefreshCw className={cn('w-4 h-4', regenerating === plan.id && 'animate-spin')} />
                          <span className="hidden sm:inline">{t('admin.businessPlans.regenerate')}</span>
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4">
            {filteredPlans.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {t('admin.businessPlans.noPlans')}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/20 p-2 rounded">
                          <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {plan.title}
                          </h3>
                          {plan.description && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                              {plan.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Organization:</span>
                        <span className="text-gray-900 dark:text-white font-medium">{plan.organizationName || '-'}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Type:</span>
                        <span className="text-gray-900 dark:text-white font-medium">{plan.planType || plan.businessType || 'Standard'}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Created:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : '-'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        plan.status === 'Completed' || plan.status === 'completed'
                          ? 'bg-[#FF6B00] text-white'
                          : plan.status === 'In Progress' || plan.status === 'inProgress'
                          ? 'bg-blue-500/[0.08] text-blue-500'
                          : 'bg-gray-500/[0.08] text-gray-500'
                      }`}>
                        {plan.status === 'Completed' ? t('admin.businessPlans.completed') :
                         plan.status === 'InProgress' ? t('admin.businessPlans.inProgress') :
                         t('admin.businessPlans.draft')}
                      </span>
                      <Button
                        variant="brand-ghost"
                        size="sm"
                        onClick={() => handleRegenerate(plan.id)}
                        disabled={regenerating === plan.id}
                      >
                        <RefreshCw className={`w-4 h-4 ${regenerating === plan.id ? 'animate-spin' : ''}`} />
                        {t('admin.businessPlans.regenerate')}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
