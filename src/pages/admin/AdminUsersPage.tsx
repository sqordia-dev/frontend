import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../lib/admin-service';
import { rolesService } from '../../lib/roles-service';
import {
  Search, MoreVertical, Shield, Ban, Check, AlertCircle, X, LayoutGrid, List,
  UserPlus, Download, ChevronLeft, ChevronRight, CheckCircle2, XCircle,
  Eye, KeyRound, Users, UserCheck, UserX, UserMinus, ChevronDown, RefreshCw,
  Mail, MailX, Loader2
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getUserFriendlyError } from '../../utils/error-messages';

const STATUS_OPTIONS = ['All', 'Active', 'Inactive', 'Suspended', 'Banned'] as const;
const USER_TYPE_OPTIONS = ['All', 'Entrepreneur', 'Consultant', 'OBNL'] as const;
const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

const statusColors: Record<string, string> = {
  Active: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20',
  Inactive: 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border border-gray-500/20',
  Suspended: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20',
  Banned: 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20',
  PendingVerification: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20',
};

function getStatusLabel(user: any): string {
  if (user.status) return user.status;
  return user.isActive ? 'Active' : 'Inactive';
}

function getUserName(user: any): string {
  return user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email || 'Unnamed User';
}

function getInitials(user: any): string {
  const first = user.firstName?.[0] || '';
  const last = user.lastName?.[0] || '';
  if (first && last) return `${first}${last}`.toUpperCase();
  return user.email?.[0]?.toUpperCase() || 'U';
}

export default function AdminUsersPage() {
  const { t } = useTheme();
  const navigate = useNavigate();
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();

  // Data state
  const [users, setUsers] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [userTypeFilter, setUserTypeFilter] = useState<string>('All');
  const [emailVerifiedFilter, setEmailVerifiedFilter] = useState<string>('All');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState('CreatedAt');
  const [sortDescending, setSortDescending] = useState(true);

  // UI state
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [showActions, setShowActions] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [roles, setRoles] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [bulkActioning, setBulkActioning] = useState(false);

  // Create user state
  const [createForm, setCreateForm] = useState({
    firstName: '', lastName: '', email: '', password: '',
    userType: 'Entrepreneur', emailVerified: false, autoPassword: true,
    roleIds: [] as string[],
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Stat summary
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, newThisMonth: 0 });

  // Debounce search
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [searchTerm]);

  // Load users when filters change
  useEffect(() => {
    loadUsers();
  }, [debouncedSearch, statusFilter, userTypeFilter, emailVerifiedFilter, page, pageSize, sortBy, sortDescending]);

  // Load roles once
  useEffect(() => {
    loadRoles();
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.actions-dropdown')) setShowActions(null);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, any> = {
        page,
        pageSize,
        sortBy,
        sortDescending,
      };
      if (debouncedSearch) params.searchTerm = debouncedSearch;
      if (statusFilter !== 'All') params.status = statusFilter;
      if (userTypeFilter !== 'All') params.userType = userTypeFilter;
      if (emailVerifiedFilter !== 'All') params.emailVerified = emailVerifiedFilter === 'Verified';

      const data = await adminService.getUsersPaginated(params);
      setUsers(data.items || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);

      // Update stats from first load (unfiltered)
      if (!debouncedSearch && statusFilter === 'All' && userTypeFilter === 'All' && emailVerifiedFilter === 'All') {
        const items = data.items || [];
        const activeCount = items.filter((u: any) => getStatusLabel(u) === 'Active').length;
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        const newThisMonth = items.filter((u: any) => u.createdAt && new Date(u.createdAt) > monthAgo).length;
        setStats({
          total: data.totalCount || items.length,
          active: activeCount,
          inactive: (data.totalCount || items.length) - activeCount,
          newThisMonth,
        });
      }
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'load'));
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, userTypeFilter, emailVerifiedFilter, page, pageSize, sortBy, sortDescending]);

  const loadRoles = async () => {
    try {
      const data = await rolesService.getRoles();
      setRoles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load roles:', err);
    }
  };

  // === Actions ===

  const handleStatusChange = async (userId: string, status: string) => {
    try {
      await adminService.updateUserStatus(userId, status, `Admin status change to ${status}`);
      await loadUsers();
      setShowActions(null);
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'save'));
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      await adminService.resetUserPassword(userId);
      setShowActions(null);
      setError(null);
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'save'));
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      const params: Record<string, any> = {};
      if (debouncedSearch) params.searchTerm = debouncedSearch;
      if (statusFilter !== 'All') params.status = statusFilter;
      if (userTypeFilter !== 'All') params.userType = userTypeFilter;
      if (emailVerifiedFilter !== 'All') params.emailVerified = emailVerifiedFilter === 'Verified';

      const blob = await adminService.exportUsers(params);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users_export_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'export'));
    } finally {
      setExporting(false);
    }
  };

  const handleBulkAction = async (status: string) => {
    if (selectedUsers.size === 0) return;
    try {
      setBulkActioning(true);
      await adminService.bulkUpdateUserStatus(
        Array.from(selectedUsers), status, `Bulk ${status.toLowerCase()} by admin`
      );
      setSelectedUsers(new Set());
      await loadUsers();
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'save'));
    } finally {
      setBulkActioning(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      setCreateError(null);
      await adminService.createUser({
        firstName: createForm.firstName,
        lastName: createForm.lastName,
        email: createForm.email,
        password: createForm.autoPassword ? undefined : createForm.password,
        userType: createForm.userType,
        emailVerified: createForm.emailVerified,
        roleIds: createForm.roleIds,
      });
      setShowCreateModal(false);
      setCreateForm({ firstName: '', lastName: '', email: '', password: '', userType: 'Entrepreneur', emailVerified: false, autoPassword: true, roleIds: [] });
      await loadUsers();
    } catch (err: any) {
      setCreateError(getUserFriendlyError(err, 'save'));
    } finally {
      setCreating(false);
    }
  };

  // Role modal
  const openRoleModal = async (user: any) => {
    setSelectedUser(user);
    setShowRoleModal(true);
    setShowActions(null);
    setLoadingRoles(true);
    try {
      const data = await rolesService.getUserRoles(user.id);
      setUserRoles(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'load'));
    } finally {
      setLoadingRoles(false);
    }
  };

  const handleAssignRole = async (roleId: string) => {
    if (!selectedUser) return;
    try {
      await rolesService.assignRole(selectedUser.id, roleId);
      await openRoleModal(selectedUser);
      await loadUsers();
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'save'));
    }
  };

  const handleRemoveRole = async (roleId: string) => {
    if (!selectedUser) return;
    try {
      await rolesService.removeUserRole(selectedUser.id, roleId);
      await openRoleModal(selectedUser);
      await loadUsers();
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'delete'));
    }
  };

  // Selection
  const toggleSelectAll = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)));
    }
  };

  const toggleSelectUser = (userId: string) => {
    const next = new Set(selectedUsers);
    if (next.has(userId)) next.delete(userId);
    else next.add(userId);
    setSelectedUsers(next);
  };

  // Pagination
  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalCount);

  return (
    <div className="space-y-5">
      {/* Error banner */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 dark:hover:text-red-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats.total, icon: Users, color: '#6366F1' },
          { label: 'Active', value: stats.active, icon: UserCheck, color: '#10B981' },
          { label: 'Inactive', value: stats.inactive, icon: UserX, color: '#EF4444' },
          { label: 'New This Month', value: stats.newThisMonth, icon: UserPlus, color: '#FF6B00' },
        ].map((s) => (
          <div key={s.label} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${s.color}14` }}>
              <s.icon className="w-5 h-5" style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white leading-none">{s.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main card */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-3">
          {/* Row 1: Search + Actions */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={t('admin.users.search') || 'Search users...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-[#FF6B00]/30 focus:border-[#FF6B00] transition-colors"
              />
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#FF6B00] hover:bg-[#E55F00] rounded-lg transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Create User
            </button>
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Export
            </button>
            <button
              onClick={() => loadUsers()}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${viewMode === 'list' ? 'text-white bg-[#FF6B00]' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`p-2 transition-colors ${viewMode === 'card' ? 'text-white bg-[#FF6B00]' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Row 2: Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <FilterDropdown label="Status" value={statusFilter} options={STATUS_OPTIONS} onChange={(v) => { setStatusFilter(v); setPage(1); }} />
            <FilterDropdown label="User Type" value={userTypeFilter} options={USER_TYPE_OPTIONS} onChange={(v) => { setUserTypeFilter(v); setPage(1); }} />
            <FilterDropdown label="Email" value={emailVerifiedFilter} options={['All', 'Verified', 'Unverified']} onChange={(v) => { setEmailVerifiedFilter(v); setPage(1); }} />
            {(statusFilter !== 'All' || userTypeFilter !== 'All' || emailVerifiedFilter !== 'All' || debouncedSearch) && (
              <button
                onClick={() => { setStatusFilter('All'); setUserTypeFilter('All'); setEmailVerifiedFilter('All'); setSearchTerm(''); setDebouncedSearch(''); setPage(1); }}
                className="text-xs text-[#FF6B00] hover:underline font-medium"
              >
                Clear filters
              </button>
            )}
            <div className="ml-auto text-xs text-gray-500 dark:text-gray-400">
              {totalCount} user{totalCount !== 1 ? 's' : ''} total
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-[#FF6B00] animate-spin" />
          </div>
        ) : viewMode === 'list' ? (
          /* TABLE VIEW */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                  <th className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      checked={users.length > 0 && selectedUsers.size === users.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-[#FF6B00] focus:ring-[#FF6B00]"
                    />
                  </th>
                  <SortableHeader label={t('admin.users.user') || 'User'} field="FirstName" sortBy={sortBy} sortDesc={sortDescending} onSort={(f) => { setSortBy(f); setSortDescending(sortBy === f ? !sortDescending : false); }} />
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('admin.users.status') || 'Status'}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('admin.users.role') || 'Role'}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</th>
                  <SortableHeader label={t('admin.users.joined') || 'Joined'} field="CreatedAt" sortBy={sortBy} sortDesc={sortDescending} onSort={(f) => { setSortBy(f); setSortDescending(sortBy === f ? !sortDescending : true); }} />
                  <SortableHeader label={t('admin.users.lastLogin') || 'Last Login'} field="LastLogin" sortBy={sortBy} sortDesc={sortDescending} onSort={(f) => { setSortBy(f); setSortDescending(sortBy === f ? !sortDescending : true); }} />
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('admin.users.actions') || 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-16 text-center text-gray-400 dark:text-gray-500">
                      <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm">{t('admin.users.noUsers') || 'No users found'}</p>
                    </td>
                  </tr>
                ) : users.map((user) => (
                  <tr
                    key={user.id}
                    className={`group transition-colors cursor-pointer ${
                      selectedUsers.has(user.id)
                        ? 'bg-[#FF6B00]/[0.04] dark:bg-[#FF6B00]/[0.06]'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    <td className="w-12 px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => toggleSelectUser(user.id)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-[#FF6B00] focus:ring-[#FF6B00]"
                      />
                    </td>
                    <td className="px-4 py-3" onClick={() => navigate(`/admin/users/${user.id}`)}>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[#FF6B00]/[0.08] flex-shrink-0 text-sm font-semibold text-[#FF6B00]">
                          {getInitials(user)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{getUserName(user)}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3" onClick={() => navigate(`/admin/users/${user.id}`)}>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${statusColors[getStatusLabel(user)] || statusColors.Inactive}`}>
                        {getStatusLabel(user)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" onClick={() => navigate(`/admin/users/${user.id}`)}>
                      {user.role || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400" onClick={() => navigate(`/admin/users/${user.id}`)}>
                      <span className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-xs font-medium">
                        {user.userType || 'User'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center" onClick={() => navigate(`/admin/users/${user.id}`)}>
                      {user.emailVerified ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                      ) : (
                        <XCircle className="w-4 h-4 text-gray-300 dark:text-gray-600 mx-auto" />
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400" onClick={() => navigate(`/admin/users/${user.id}`)}>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400" onClick={() => navigate(`/admin/users/${user.id}`)}>
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : (
                        <span className="text-gray-300 dark:text-gray-600">{t('admin.users.never') || 'Never'}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="relative inline-block actions-dropdown">
                        <button
                          onClick={() => setShowActions(showActions === user.id ? null : user.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {showActions === user.id && (
                          <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-20">
                            <ActionMenuItem icon={Eye} label="View Details" onClick={() => navigate(`/admin/users/${user.id}`)} />
                            <ActionMenuItem icon={Check} label="Activate" onClick={() => handleStatusChange(user.id, 'Active')} className="text-emerald-600 dark:text-emerald-400" />
                            <ActionMenuItem icon={Ban} label="Suspend" onClick={() => handleStatusChange(user.id, 'Suspended')} className="text-amber-600 dark:text-amber-400" />
                            <ActionMenuItem icon={UserMinus} label="Ban" onClick={() => handleStatusChange(user.id, 'Banned')} className="text-red-600 dark:text-red-400" />
                            <div className="h-px bg-gray-100 dark:bg-gray-700 my-1" />
                            <ActionMenuItem icon={Shield} label="Manage Roles" onClick={() => openRoleModal(user)} />
                            <ActionMenuItem icon={KeyRound} label="Reset Password" onClick={() => handleResetPassword(user.id)} />
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* CARD VIEW */
          <div className="p-4">
            {users.length === 0 ? (
              <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">{t('admin.users.noUsers') || 'No users found'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => navigate(`/admin/users/${user.id}`)}
                    className={`group relative border rounded-xl p-4 transition-all cursor-pointer ${
                      selectedUsers.has(user.id)
                        ? 'border-[#FF6B00] bg-[#FF6B00]/[0.03] dark:bg-[#FF6B00]/[0.05] shadow-sm'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="absolute top-3 left-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.id)}
                        onChange={() => toggleSelectUser(user.id)}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-[#FF6B00] focus:ring-[#FF6B00]"
                      />
                    </div>
                    <div className="absolute top-3 right-3 actions-dropdown" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setShowActions(showActions === user.id ? null : user.id)}
                        className="p-1 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                      {showActions === user.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-20">
                          <ActionMenuItem icon={Eye} label="View Details" onClick={() => navigate(`/admin/users/${user.id}`)} />
                          <ActionMenuItem icon={Check} label="Activate" onClick={() => handleStatusChange(user.id, 'Active')} />
                          <ActionMenuItem icon={Ban} label="Suspend" onClick={() => handleStatusChange(user.id, 'Suspended')} />
                          <ActionMenuItem icon={Shield} label="Manage Roles" onClick={() => openRoleModal(user)} />
                          <ActionMenuItem icon={KeyRound} label="Reset Password" onClick={() => handleResetPassword(user.id)} />
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col items-center text-center pt-4 pb-2">
                      <div className="w-14 h-14 rounded-full flex items-center justify-center bg-[#FF6B00]/[0.08] mb-3 text-lg font-semibold text-[#FF6B00]">
                        {getInitials(user)}
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-full">{getUserName(user)}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-full mt-0.5">{user.email}</p>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${statusColors[getStatusLabel(user)] || statusColors.Inactive}`}>
                          {getStatusLabel(user)}
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <CardStat label="Type" value={user.userType || 'User'} />
                      <CardStat label="Email" value={user.emailVerified ? 'Verified' : 'Pending'} icon={user.emailVerified ? Mail : MailX} iconColor={user.emailVerified ? '#10B981' : '#9CA3AF'} />
                      <CardStat label="Joined" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'} />
                      <CardStat label="Last Login" value={user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalCount > 0 && (
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span>Showing {startIndex}-{endIndex} of {totalCount}</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm px-2 py-1 focus:ring-[#FF6B00] focus:border-[#FF6B00]"
              >
                {PAGE_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s} / page</option>)}
              </select>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {generatePageNumbers(page, totalPages).map((p, i) =>
                p === '...' ? (
                  <span key={`dot-${i}`} className="px-2 text-gray-400 text-sm">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(Number(p))}
                    className={`min-w-[32px] h-8 rounded-lg text-sm font-medium transition-colors ${
                      page === p
                        ? 'bg-[#FF6B00] text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Action Bar */}
      {selectedUsers.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-gray-900 dark:bg-gray-800 text-white rounded-xl shadow-2xl border border-gray-700 px-5 py-3 flex items-center gap-4">
          <span className="text-sm font-medium">{selectedUsers.size} user{selectedUsers.size > 1 ? 's' : ''} selected</span>
          <div className="h-5 w-px bg-gray-600" />
          <button onClick={() => handleBulkAction('Active')} disabled={bulkActioning} className="text-sm font-medium text-emerald-400 hover:text-emerald-300 disabled:opacity-50 transition-colors">
            Activate
          </button>
          <button onClick={() => handleBulkAction('Suspended')} disabled={bulkActioning} className="text-sm font-medium text-amber-400 hover:text-amber-300 disabled:opacity-50 transition-colors">
            Suspend
          </button>
          <button onClick={() => handleBulkAction('Banned')} disabled={bulkActioning} className="text-sm font-medium text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors">
            Ban
          </button>
          <div className="h-5 w-px bg-gray-600" />
          <button onClick={() => setSelectedUsers(new Set())} className="text-sm text-gray-400 hover:text-white transition-colors">
            Deselect
          </button>
          {bulkActioning && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
        </div>
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <ModalOverlay onClose={() => setShowCreateModal(false)}>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Create New User</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Add a new user to the system</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-5 space-y-4">
              {createError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-300">
                  {createError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <FormField label="First Name" required>
                  <input type="text" required value={createForm.firstName} onChange={(e) => setCreateForm(p => ({ ...p, firstName: e.target.value }))} className="form-input" placeholder="John" />
                </FormField>
                <FormField label="Last Name" required>
                  <input type="text" required value={createForm.lastName} onChange={(e) => setCreateForm(p => ({ ...p, lastName: e.target.value }))} className="form-input" placeholder="Doe" />
                </FormField>
              </div>
              <FormField label="Email" required>
                <input type="email" required value={createForm.email} onChange={(e) => setCreateForm(p => ({ ...p, email: e.target.value }))} className="form-input" placeholder="user@example.com" />
              </FormField>
              <FormField label="Password">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <input type="checkbox" checked={createForm.autoPassword} onChange={(e) => setCreateForm(p => ({ ...p, autoPassword: e.target.checked }))} className="rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]" />
                    Auto-generate password
                  </label>
                  {!createForm.autoPassword && (
                    <input type="password" value={createForm.password} onChange={(e) => setCreateForm(p => ({ ...p, password: e.target.value }))} className="form-input" placeholder="Min 8 characters" minLength={8} />
                  )}
                </div>
              </FormField>
              <FormField label="User Type">
                <select value={createForm.userType} onChange={(e) => setCreateForm(p => ({ ...p, userType: e.target.value }))} className="form-input">
                  <option value="Entrepreneur">Entrepreneur</option>
                  <option value="Consultant">Consultant</option>
                  <option value="OBNL">OBNL</option>
                </select>
              </FormField>
              {roles.length > 0 && (
                <FormField label="Roles">
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role: any) => (
                      <label key={role.id} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-colors ${
                        createForm.roleIds.includes(role.id)
                          ? 'border-[#FF6B00] bg-[#FF6B00]/[0.08] text-[#FF6B00]'
                          : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}>
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={createForm.roleIds.includes(role.id)}
                          onChange={() => {
                            setCreateForm(p => ({
                              ...p,
                              roleIds: p.roleIds.includes(role.id)
                                ? p.roleIds.filter(r => r !== role.id)
                                : [...p.roleIds, role.id]
                            }));
                          }}
                        />
                        <Shield className="w-3.5 h-3.5" />
                        {role.name}
                      </label>
                    ))}
                  </div>
                </FormField>
              )}
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <input type="checkbox" checked={createForm.emailVerified} onChange={(e) => setCreateForm(p => ({ ...p, emailVerified: e.target.checked }))} className="rounded border-gray-300 text-[#FF6B00] focus:ring-[#FF6B00]" />
                Mark email as verified
              </label>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="px-5 py-2 text-sm font-medium text-white bg-[#FF6B00] hover:bg-[#E55F00] rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  Create User
                </button>
              </div>
            </form>
          </div>
        </ModalOverlay>
      )}

      {/* Role Management Modal */}
      {showRoleModal && selectedUser && (
        <ModalOverlay onClose={() => { setShowRoleModal(false); setSelectedUser(null); setUserRoles([]); }}>
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-xl mx-4 max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-700">
            <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Manage Roles
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  {getUserName(selectedUser)} &middot; {selectedUser.email}
                </p>
              </div>
              <button onClick={() => { setShowRoleModal(false); setSelectedUser(null); setUserRoles([]); }} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5">
              {loadingRoles ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 text-[#FF6B00] animate-spin" />
                </div>
              ) : (
                <div className="space-y-5">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Current Roles</h4>
                    {userRoles.length === 0 ? (
                      <p className="text-sm text-gray-400 dark:text-gray-500 italic">No roles assigned</p>
                    ) : (
                      <div className="space-y-2">
                        {userRoles.map((role: any) => (
                          <div key={role.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-2.5">
                              <Shield className="w-4 h-4 text-[#FF6B00]" />
                              <div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{role.name}</span>
                                {role.description && <p className="text-xs text-gray-500 dark:text-gray-400">{role.description}</p>}
                              </div>
                            </div>
                            <button onClick={() => handleRemoveRole(role.id)} className="text-xs font-medium text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors">
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Available Roles</h4>
                    {roles.filter((r: any) => !userRoles.some((ur: any) => ur.id === r.id)).length === 0 ? (
                      <p className="text-sm text-gray-400 dark:text-gray-500 italic">All roles assigned</p>
                    ) : (
                      <div className="space-y-2">
                        {roles.filter((r: any) => !userRoles.some((ur: any) => ur.id === r.id)).map((role: any) => (
                          <div key={role.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
                            <div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{role.name}</span>
                              {role.description && <p className="text-xs text-gray-500 dark:text-gray-400">{role.description}</p>}
                            </div>
                            <button onClick={() => handleAssignRole(role.id)} className="px-3 py-1.5 text-xs font-medium text-white bg-[#FF6B00] hover:bg-[#E55F00] rounded-lg transition-colors">
                              Assign
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </ModalOverlay>
      )}

      {/* Inline styles for form inputs */}
      <style>{`
        .form-input {
          width: 100%;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          border: 1px solid rgb(209 213 219);
          border-radius: 0.5rem;
          background: white;
          color: rgb(17 24 39);
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .form-input:focus {
          outline: none;
          border-color: #FF6B00;
          box-shadow: 0 0 0 3px rgba(255, 107, 0, 0.15);
        }
        .dark .form-input {
          background: rgb(31 41 55);
          border-color: rgb(75 85 99);
          color: rgb(243 244 246);
        }
        .dark .form-input:focus {
          border-color: #FF6B00;
        }
      `}</style>
    </div>
  );
}

// === Sub-components ===

function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

function FilterDropdown({ label, value, options, onChange }: {
  label: string; value: string; options: readonly string[]; onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
          value !== 'All'
            ? 'border-[#FF6B00] bg-[#FF6B00]/[0.06] text-[#FF6B00]'
            : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
      >
        {label}: {value}
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-30 min-w-[120px]">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => { onChange(opt); setOpen(false); }}
              className={`block w-full text-left px-3 py-1.5 text-xs transition-colors ${
                value === opt
                  ? 'bg-[#FF6B00]/[0.08] text-[#FF6B00] font-medium'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SortableHeader({ label, field, sortBy, sortDesc, onSort }: {
  label: string; field: string; sortBy: string; sortDesc: boolean; onSort: (field: string) => void;
}) {
  const active = sortBy === field;
  return (
    <th
      onClick={() => onSort(field)}
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 select-none"
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active && <ChevronDown className={`w-3 h-3 transition-transform ${sortDesc ? '' : 'rotate-180'}`} />}
      </span>
    </th>
  );
}

function ActionMenuItem({ icon: Icon, label, onClick, className = '' }: {
  icon: any; label: string; onClick: () => void; className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${className}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function CardStat({ label, value, icon: Icon, iconColor }: { label: string; value: string; icon?: any; iconColor?: string }) {
  return (
    <div className="text-center">
      <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</p>
      <div className="flex items-center justify-center gap-1 mt-0.5">
        {Icon && <Icon className="w-3 h-3" style={{ color: iconColor }} />}
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{value}</p>
      </div>
    </div>
  );
}

function generatePageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | string)[] = [];
  if (current <= 3) {
    pages.push(1, 2, 3, 4, '...', total);
  } else if (current >= total - 2) {
    pages.push(1, '...', total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, '...', current - 1, current, current + 1, '...', total);
  }
  return pages;
}
