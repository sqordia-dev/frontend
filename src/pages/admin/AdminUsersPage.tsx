import { useEffect, useState } from 'react';
import { adminService } from '../../lib/admin-service';
import { rolesService } from '../../lib/roles-service';
import { Search, Filter, MoreVertical, Shield, Ban, Check, AlertCircle, X, LayoutGrid, List } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function AdminUsersPage() {
  const { t } = useTheme();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [showActions, setShowActions] = useState<string | null>(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [viewMode, setViewMode] = useState<'card' | 'list'>('list');

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      const data = await rolesService.getRoles();
      setRoles(data);
    } catch (err: any) {
      console.error('Failed to load roles:', err);
    }
  };

  const openRoleModal = async (user: any) => {
    setSelectedUser(user);
    setShowRoleModal(true);
    setShowActions(null);
    setLoadingRoles(true);
    try {
      const data = await rolesService.getUserRoles(user.id);
      setUserRoles(data);
    } catch (err: any) {
      setError(`Failed to load user roles: ${err.message}`);
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleAssignRole = async (roleId: string) => {
    if (!selectedUser) return;
    try {
      await rolesService.assignRole(selectedUser.id, roleId);
      await openRoleModal(selectedUser); // Reload user roles
      await loadUsers(); // Refresh users list
    } catch (err: any) {
      setError(`Failed to assign role: ${err.message}`);
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    if (!selectedUser) return;
    try {
      await rolesService.removeUserRole(selectedUser.id, roleId);
      await openRoleModal(selectedUser); // Reload user roles
      await loadUsers(); // Refresh users list
    } catch (err: any) {
      setError(`Failed to remove role: ${err.message}`);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getUsers();
      setUsers(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: string, status: string) => {
    try {
      await adminService.updateUserStatus(userId, status);
      await loadUsers();
      setShowActions(null);
    } catch (err: any) {
      alert(`Failed to update user status: ${err.message}`);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B00]"></div>
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
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('admin.users.search')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-[#FF6B00] transition-colors"
              />
            </div>
            <button className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
            <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-600 rounded-lg p-1 bg-white dark:bg-gray-700">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list'
                    ? 'text-white bg-[#FF6B00]'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
                title="List View"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'card'
                    ? 'text-white bg-[#FF6B00]'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
                }`}
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
                    {t('admin.users.user')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('admin.users.status')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('admin.users.role')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('admin.users.joined')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('admin.users.lastLogin')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {t('admin.users.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      {t('admin.users.noUsers')}
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-[#FF6B00]/[0.08]">
                            <span className="font-medium text-[#FF6B00]">
                              {user.email?.[0]?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unnamed User'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'Active' || user.isActive
                            ? 'bg-[#FF6B00] text-white'
                            : 'bg-red-500/[0.08] text-red-500'
                        }`}>
                          {user.status || (user.isActive ? t('admin.users.active') : t('admin.users.inactive'))}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {user.userType || user.role || 'User'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {user.lastLoginAt || user.lastLogin ? new Date(user.lastLoginAt || user.lastLogin).toLocaleDateString() : t('admin.users.never')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="relative inline-block text-left">
                          <button
                            onClick={() => setShowActions(showActions === user.id ? null : user.id)}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                          >
                            <MoreVertical className="w-5 h-5" />
                          </button>

                          {showActions === user.id && (
                            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => handleStatusChange(user.id, 'Active')}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <Check className="w-4 h-4 mr-2" />
                                  Activate
                                </button>
                                <button
                                  onClick={() => handleStatusChange(user.id, 'Suspended')}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <Ban className="w-4 h-4 mr-2" />
                                  Suspend
                                </button>
                                <button
                                  onClick={() => openRoleModal(user)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                  <Shield className="w-4 h-4 mr-2" />
                                  Manage Roles
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {t('admin.users.noUsers')}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0 h-12 w-12 rounded-full flex items-center justify-center bg-[#FF6B00]/[0.08]">
                          <span className="font-medium text-lg text-[#FF6B00]">
                            {user.email?.[0]?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unnamed User'}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="relative flex-shrink-0">
                        <button
                          onClick={() => setShowActions(showActions === user.id ? null : user.id)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <MoreVertical className="w-5 h-5" />
                        </button>
                        {showActions === user.id && (
                          <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-lg shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1">
                              <button
                                onClick={() => handleStatusChange(user.id, 'Active')}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Check className="w-4 h-4 mr-2" />
                                Activate
                              </button>
                              <button
                                onClick={() => handleStatusChange(user.id, 'Suspended')}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Ban className="w-4 h-4 mr-2" />
                                Suspend
                              </button>
                              <button
                                onClick={() => openRoleModal(user)}
                                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                              >
                                <Shield className="w-4 h-4 mr-2" />
                                Manage Roles
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Status:</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === 'Active' || user.isActive
                            ? 'bg-[#FF6B00] text-white'
                            : 'bg-red-500/[0.08] text-red-500'
                        }`}>
                          {user.status || (user.isActive ? t('admin.users.active') : t('admin.users.inactive'))}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Role:</span>
                        <span className="text-gray-900 dark:text-white font-medium">{user.userType || user.role || 'User'}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Joined:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-500 dark:text-gray-400">Last Login:</span>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {user.lastLoginAt || user.lastLogin ? new Date(user.lastLoginAt || user.lastLogin).toLocaleDateString() : t('admin.users.never')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Role Management Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Manage Roles for {selectedUser.name || selectedUser.email}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Assign or remove roles to control user permissions
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowRoleModal(false);
                    setSelectedUser(null);
                    setUserRoles([]);
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              {loadingRoles ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]"></div>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Current Roles
                    </h4>
                    {userRoles.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No roles assigned</p>
                    ) : (
                      <div className="space-y-2">
                        {userRoles.map((role: any) => (
                          <div
                            key={role.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                          >
                            <div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {role.name}
                              </span>
                              {role.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {role.description}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => handleRemoveRole(role.id)}
                              className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                      Available Roles
                    </h4>
                    {roles.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No roles available</p>
                    ) : (
                      <div className="space-y-2">
                        {roles
                          .filter((role: any) => !userRoles.some((ur: any) => ur.id === role.id))
                          .map((role: any) => (
                            <div
                              key={role.id}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                            >
                              <div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {role.name}
                                </span>
                                {role.description && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    {role.description}
                                  </p>
                                )}
                              </div>
                              <button
                                onClick={() => handleAssignRole(role.id)}
                                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors bg-[#FF6B00] hover:bg-[#E55F00]"
                              >
                                Assign
                              </button>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
