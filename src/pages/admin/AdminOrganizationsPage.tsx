import { useEffect, useState } from 'react';
import { adminService } from '../../lib/admin-service';
import { Search, Building2, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { getUserFriendlyError } from '../../utils/error-messages';
import { Button } from '../../components/ui/button';

export default function AdminOrganizationsPage() {
  const { t } = useTheme();
  const toast = useToast();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadOrganizations();
  }, []);

  const loadOrganizations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getOrganizations();
      setOrganizations(data);
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'load'));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (organizationId: string, status: string) => {
    try {
      const isActive = status === 'Active' || status === 'active' || status === 'true';
      await adminService.updateOrganizationStatus(organizationId, isActive, 'Status updated by admin');
      await loadOrganizations();
    } catch (err: any) {
      toast.error('Status Update Error', getUserFriendlyError(err, 'save'));
    }
  };

  const filteredOrganizations = organizations.filter(org =>
    org.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-4 sm:space-y-6 animate-pulse">
        {/* Header skeleton */}
        <div>
          <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="mt-2 h-4 w-72 bg-gray-200 dark:bg-gray-700 rounded" />
        </div>
        {/* Card skeleton */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-3 sm:p-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                    <div className="space-y-2">
                      <div className="h-5 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                  </div>
                  <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded-full" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-3 w-8 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                  <div className="flex justify-between">
                    <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-3 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <div className="flex-1 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  <div className="flex-1 h-9 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{t('admin.organizations.title')}</h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">{t('admin.organizations.subtitle')}</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2 flex-shrink-0" />
            <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('admin.organizations.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-3 sm:p-6">
          {filteredOrganizations.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              {t('admin.organizations.noOrganizations')}
            </div>
          ) : (
            filteredOrganizations.map((org) => (
              <div
                key={org.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                    <div className="p-2 sm:p-3 rounded-lg bg-[#FF6B00]/[0.08] flex-shrink-0">
                      <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#FF6B00]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                        {org.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">{org.organizationType || org.type || 'Organization'}</p>
                    </div>
                  </div>
                  {org.isActive ? (
                    <CheckCircle className="w-5 h-5 text-[#FF6B00] flex-shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
                  )}
                </div>

                <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('admin.organizations.members')}</span>
                    <span className="font-medium text-gray-900 dark:text-white flex items-center">
                      <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1" />
                      {org.memberCount || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('admin.organizations.plans')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {org.businessPlanCount || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('admin.organizations.created')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {org.createdAt ? new Date(org.createdAt).toLocaleDateString() : '-'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  {org.isActive ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleStatusChange(org.id, 'Inactive')}
                    >
                      {t('admin.organizations.deactivate')}
                    </Button>
                  ) : (
                    <Button
                      variant="brand-outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleStatusChange(org.id, 'Active')}
                    >
                      {t('admin.organizations.activate')}
                    </Button>
                  )}
                  <Button variant="brand" size="sm" className="flex-1">
                    {t('admin.organizations.viewDetails')}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
