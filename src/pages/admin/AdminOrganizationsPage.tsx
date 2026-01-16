import { useEffect, useState } from 'react';
import { adminService } from '../../lib/admin-service';
import { Search, Building2, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function AdminOrganizationsPage() {
  const { t } = useTheme();
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
      setError(err.message);
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
      alert(`Failed to update organization status: ${err.message}`);
    }
  };

  const filteredOrganizations = organizations.filter(org =>
    org.name?.toLowerCase().includes(searchTerm.toLowerCase())
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
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('admin.organizations.title')}</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">{t('admin.organizations.subtitle')}</p>
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
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder={t('admin.organizations.search')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
          {filteredOrganizations.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              {t('admin.organizations.noOrganizations')}
            </div>
          ) : (
            filteredOrganizations.map((org) => (
              <div
                key={org.id}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 rounded-lg" style={{ backgroundColor: '#FF6B0015' }}>
                      <Building2 className="w-6 h-6" style={{ color: '#FF6B00' }} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {org.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{org.organizationType || org.type || 'Organization'}</p>
                    </div>
                  </div>
                  {org.isActive ? (
                    <CheckCircle className="w-5 h-5" style={{ color: '#FF6B00' }} />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('admin.organizations.members')}</span>
                    <span className="font-medium text-gray-900 dark:text-white flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {org.memberCount || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('admin.organizations.plans')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {org.businessPlanCount || 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{t('admin.organizations.created')}</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {org.createdAt ? new Date(org.createdAt).toLocaleDateString() : '-'}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  {org.isActive ? (
                    <button
                      onClick={() => handleStatusChange(org.id, 'Inactive')}
                      className="flex-1 px-3 py-2 text-sm border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      {t('admin.organizations.deactivate')}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatusChange(org.id, 'Active')}
                      className="flex-1 px-3 py-2 text-sm border rounded-lg transition-colors"
                      style={{ borderColor: '#FF6B00', color: '#FF6B00' }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#FF6B0015'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {t('admin.organizations.activate')}
                    </button>
                  )}
                  <button className="flex-1 px-3 py-2 text-sm text-white rounded-lg transition-colors"
                  style={{ backgroundColor: '#FF6B00' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E55F00'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF6B00'}>
                    {t('admin.organizations.viewDetails')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
