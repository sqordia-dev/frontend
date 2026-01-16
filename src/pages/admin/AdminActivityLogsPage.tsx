import { useEffect, useState } from 'react';
import { adminService } from '../../lib/admin-service';
import { Activity, AlertCircle } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function AdminActivityLogsPage() {
  const { t } = useTheme();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getActivityLogs();
      setLogs(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#FF6B00' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" />
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">{t('admin.activityLogs.noLogs')}</p>
            </div>
          ) : (
            logs.map((log, index) => (
              <div key={log.id || index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full" style={{ backgroundColor: log.isSuccess !== false ? '#FF6B00' : '#EF4444' }}></div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {log.action || t('admin.activityLogs.systemActivity')}
                      </p>
                      {log.isSuccess !== undefined && (
                        <span 
                          className="px-2 py-0.5 rounded text-xs"
                          style={log.isSuccess ? { backgroundColor: '#FF6B00', color: '#FFFFFF' } : { backgroundColor: '#EF444415', color: '#EF4444' }}
                        >
                          {log.isSuccess ? t('admin.activityLogs.success') : t('admin.activityLogs.failed')}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {log.entity ? `${log.entity}${log.entityId ? ` (${log.entityId})` : ''}` : t('admin.activityLogs.systemActivity')}
                    </p>
                    {log.errorMessage && (
                      <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                        {log.errorMessage}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        {log.userEmail || (log.userId ? `${t('admin.activityLogs.user')} ${log.userId}` : t('admin.activityLogs.system'))}
                      </span>
                      <span>
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : t('admin.activityLogs.unknownTime')}
                      </span>
                      {(log.IPAddress || log.iPAddress) && (
                        <span>{t('admin.activityLogs.ip')}: {log.IPAddress || log.iPAddress}</span>
                      )}
                      {log.userAgent && (
                        <span className="truncate max-w-xs" title={log.userAgent}>
                          {log.userAgent}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
