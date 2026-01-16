import { useEffect, useState } from 'react';
import { adminService } from '../../lib/admin-service';
import { Search, FileText, RefreshCw, AlertCircle, LayoutGrid, List } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function AdminBusinessPlansPage() {
  const { t } = useTheme();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [regenerating, setRegenerating] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('list');

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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async (planId: string) => {
    try {
      setRegenerating(planId);
      await adminService.regenerateBusinessPlan(planId);
      alert('Business plan regeneration started');
    } catch (err: any) {
      alert(`Failed to regenerate plan: ${err.message}`);
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#FF6B00' }}></div>
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
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('admin.businessPlans.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg p-1 bg-white dark:bg-gray-700">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                style={viewMode === 'list' ? { backgroundColor: '#FF6B00' } : {}}
                title="List View"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'card'
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                style={viewMode === 'card' ? { backgroundColor: '#FF6B00' } : {}}
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('admin.businessPlans.plan')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('admin.businessPlans.organization')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('admin.businessPlans.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('admin.businessPlans.type')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('admin.businessPlans.created')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
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
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/20 p-2 rounded">
                            <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {plan.title}
                            </div>
                            {plan.description && (
                              <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                {plan.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {plan.organizationName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={plan.status === 'Completed' || plan.status === 'completed' 
                          ? { backgroundColor: '#FF6B00', color: '#FFFFFF' } 
                          : plan.status === 'In Progress' || plan.status === 'inProgress'
                          ? { backgroundColor: '#3B82F615', color: '#3B82F6' }
                          : { backgroundColor: '#6B728015', color: '#6B7280' }}>
                          {plan.status === 'Completed' ? t('admin.businessPlans.completed') : 
                           plan.status === 'InProgress' ? t('admin.businessPlans.inProgress') : 
                           t('admin.businessPlans.draft')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {plan.planType || plan.businessType || 'Standard'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {plan.createdAt ? new Date(plan.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleRegenerate(plan.id)}
                          disabled={regenerating === plan.id}
                          className="inline-flex items-center transition-colors disabled:opacity-50"
                          style={{ color: '#FF6B00' }}
                          onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.color = '#E55F00')}
                          onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.color = '#FF6B00')}
                        >
                          <RefreshCw className={`w-4 h-4 mr-1 ${regenerating === plan.id ? 'animate-spin' : ''}`} />
                          {t('admin.businessPlans.regenerate')}
                        </button>
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={plan.status === 'Completed' || plan.status === 'completed' 
                        ? { backgroundColor: '#FF6B00', color: '#FFFFFF' } 
                        : plan.status === 'In Progress' || plan.status === 'inProgress'
                        ? { backgroundColor: '#3B82F615', color: '#3B82F6' }
                        : { backgroundColor: '#6B728015', color: '#6B7280' }}>
                        {plan.status === 'Completed' ? t('admin.businessPlans.completed') : 
                         plan.status === 'InProgress' ? t('admin.businessPlans.inProgress') : 
                         t('admin.businessPlans.draft')}
                      </span>
                      <button
                        onClick={() => handleRegenerate(plan.id)}
                        disabled={regenerating === plan.id}
                        className="inline-flex items-center text-xs transition-colors disabled:opacity-50"
                        style={{ color: '#FF6B00' }}
                        onMouseEnter={(e) => !e.currentTarget.disabled && (e.currentTarget.style.color = '#E55F00')}
                        onMouseLeave={(e) => !e.currentTarget.disabled && (e.currentTarget.style.color = '#FF6B00')}
                      >
                        <RefreshCw className={`w-4 h-4 mr-1 ${regenerating === plan.id ? 'animate-spin' : ''}`} />
                        {t('admin.businessPlans.regenerate')}
                      </button>
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
