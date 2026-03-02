import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { adminService } from '../../lib/admin-service';
import { rolesService } from '../../lib/roles-service';
import {
  Search, MoreVertical, Shield, Ban, Check, AlertCircle, X, LayoutGrid, List,
  UserPlus, Download, ChevronLeft, ChevronRight, CheckCircle2, XCircle,
  Eye, KeyRound, Users, UserCheck, UserX, ChevronDown, RefreshCw,
  Loader2, Filter, ArrowUpDown, TrendingUp
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { getUserFriendlyError } from '../../utils/error-messages';
import { cn } from '../../lib/utils';
import { useIsMobile } from '../../hooks';

const STATUS_OPTIONS = ['All', 'Active', 'Inactive', 'Suspended', 'Banned'] as const;
const USER_TYPE_OPTIONS = ['All', 'Entrepreneur', 'Consultant', 'OBNL'] as const;
const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

const statusStyles: Record<string, { bg: string; text: string; dot: string }> = {
  Active: { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  Inactive: { bg: 'bg-gray-500/10', text: 'text-gray-600 dark:text-gray-400', dot: 'bg-gray-400' },
  Suspended: { bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400', dot: 'bg-amber-500' },
  Banned: { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
  PendingVerification: { bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400', dot: 'bg-blue-500' },
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
  const { language } = useTheme();
  const navigate = useNavigate();
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const isMobile = useIsMobile();

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

  // UI state - auto-switch to card view on mobile
  const [viewMode, setViewMode] = useState<'list' | 'card'>('list');
  const [userOverrodeViewMode, setUserOverrodeViewMode] = useState(false);

  // Auto-switch view mode based on screen size (unless user manually changed it)
  useEffect(() => {
    if (!userOverrodeViewMode) {
      setViewMode(isMobile ? 'card' : 'list');
    }
  }, [isMobile, userOverrodeViewMode]);

  const handleViewModeChange = (mode: 'list' | 'card') => {
    setViewMode(mode);
    setUserOverrodeViewMode(true);
  };
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
  const [showFilters, setShowFilters] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

      const params: Record<string, any> = { page, pageSize, sortBy, sortDescending };
      if (debouncedSearch) params.searchTerm = debouncedSearch;
      if (statusFilter !== 'All') params.status = statusFilter;
      if (userTypeFilter !== 'All') params.userType = userTypeFilter;
      if (emailVerifiedFilter !== 'All') params.emailVerified = emailVerifiedFilter === 'Verified';

      const data = await adminService.getUsersPaginated(params);
      setUsers(data.items || []);
      setTotalCount(data.totalCount || 0);
      setTotalPages(data.totalPages || 1);

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadUsers();
    setTimeout(() => setIsRefreshing(false), 500);
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
      await adminService.bulkUpdateUserStatus(Array.from(selectedUsers), status, `Bulk ${status.toLowerCase()} by admin`);
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
    if (selectedUsers.size === users.length) setSelectedUsers(new Set());
    else setSelectedUsers(new Set(users.map(u => u.id)));
  };

  const toggleSelectUser = (userId: string) => {
    const next = new Set(selectedUsers);
    if (next.has(userId)) next.delete(userId);
    else next.add(userId);
    setSelectedUsers(next);
  };

  // Active filters count
  const activeFiltersCount = [statusFilter !== 'All', userTypeFilter !== 'All', emailVerifiedFilter !== 'All', debouncedSearch].filter(Boolean).length;

  // Pagination
  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, totalCount);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {language === 'fr' ? 'Gestion des utilisateurs' : 'User Management'}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {language === 'fr' ? 'Gérez les comptes utilisateurs et leurs permissions' : 'Manage user accounts and permissions'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-momentum-orange hover:bg-orange-600 rounded-xl shadow-sm shadow-orange-500/20 transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            {language === 'fr' ? 'Créer un utilisateur' : 'Create User'}
          </motion.button>
        </div>
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="p-1 text-red-400 hover:text-red-600 dark:hover:text-red-300 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: language === 'fr' ? 'Total' : 'Total Users', value: stats.total, icon: Users, color: '#6366F1', trend: '+12%' },
          { label: language === 'fr' ? 'Actifs' : 'Active', value: stats.active, icon: UserCheck, color: '#10B981', trend: '+8%' },
          { label: language === 'fr' ? 'Inactifs' : 'Inactive', value: stats.inactive, icon: UserX, color: '#EF4444', trend: '-2%' },
          { label: language === 'fr' ? 'Nouveaux ce mois' : 'New This Month', value: stats.newThisMonth, icon: TrendingUp, color: '#FF6B00', trend: '+24%' },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 hover:shadow-lg hover:shadow-black/5 transition-all duration-200"
          >
            <div className="flex items-center justify-between">
              <div className="p-2.5 rounded-xl" style={{ backgroundColor: `${stat.color}15` }}>
                <stat.icon className="w-5 h-5" style={{ color: stat.color }} />
              </div>
              <span className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full',
                stat.trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'
              )}>
                {stat.trend}
              </span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{stat.value.toLocaleString()}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{stat.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden"
      >
        {/* Toolbar */}
        <div className="p-3 sm:p-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search - full width on mobile */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder={language === 'fr' ? 'Rechercher un utilisateur...' : 'Search users...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-momentum-orange/20 focus:border-momentum-orange focus:bg-white dark:focus:bg-gray-800 transition-all"
              />
            </div>

            {/* Actions row */}
            <div className="flex items-center gap-2 justify-between sm:justify-end">
              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 text-sm font-medium rounded-xl border transition-all',
                  showFilters || activeFiltersCount > 0
                    ? 'border-momentum-orange bg-momentum-orange/5 text-momentum-orange'
                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
              >
                <Filter className="w-4 h-4" />
                <span className="hidden xs:inline">{language === 'fr' ? 'Filtres' : 'Filters'}</span>
                {activeFiltersCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold bg-momentum-orange text-white rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  <span className="hidden md:inline">{language === 'fr' ? 'Exporter' : 'Export'}</span>
                </button>

                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="p-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                  title={language === 'fr' ? 'Actualiser' : 'Refresh'}
                >
                  <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
                </button>

                {/* View Toggle - hidden on mobile since we auto-switch */}
                <div className="hidden md:flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <button
                    onClick={() => handleViewModeChange('list')}
                    className={cn(
                      'p-2.5 transition-colors',
                      viewMode === 'list' ? 'bg-momentum-orange text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleViewModeChange('card')}
                    className={cn(
                      'p-2.5 transition-colors',
                      viewMode === 'card' ? 'bg-momentum-orange text-white' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    )}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Filter Row */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 pt-3 sm:pt-4 mt-3 sm:mt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <FilterPill
                      label={language === 'fr' ? 'Statut' : 'Status'}
                      value={statusFilter}
                      options={STATUS_OPTIONS}
                      onChange={(v) => { setStatusFilter(v); setPage(1); }}
                    />
                    <FilterPill
                      label={language === 'fr' ? 'Type' : 'Type'}
                      value={userTypeFilter}
                      options={USER_TYPE_OPTIONS}
                      onChange={(v) => { setUserTypeFilter(v); setPage(1); }}
                    />
                    <FilterPill
                      label="Email"
                      value={emailVerifiedFilter}
                      options={['All', 'Verified', 'Unverified']}
                      onChange={(v) => { setEmailVerifiedFilter(v); setPage(1); }}
                    />
                  </div>
                  <div className="flex items-center justify-between sm:ml-auto gap-2">
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={() => { setStatusFilter('All'); setUserTypeFilter('All'); setEmailVerifiedFilter('All'); setSearchTerm(''); setDebouncedSearch(''); setPage(1); }}
                        className="text-xs text-momentum-orange hover:text-orange-600 font-medium transition-colors"
                      >
                        {language === 'fr' ? 'Effacer' : 'Clear all'}
                      </button>
                    )}
                    <div className="text-xs text-gray-500 dark:text-gray-400 tabular-nums">
                      {totalCount.toLocaleString()} {language === 'fr' ? 'utilisateur' : 'user'}{totalCount !== 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-gray-200 dark:border-gray-700" />
              <div className="absolute top-0 left-0 w-10 h-10 rounded-full border-2 border-momentum-orange border-t-transparent animate-spin" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              {language === 'fr' ? 'Chargement...' : 'Loading users...'}
            </p>
          </div>
        ) : viewMode === 'list' ? (
          /* TABLE VIEW - Polished Design */
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-50/50 dark:from-gray-800/50 dark:to-gray-800/30 border-b border-gray-100 dark:border-gray-800">
                  <th className="w-14 px-5 py-4 hidden lg:table-cell">
                    <label className="relative flex items-center justify-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={users.length > 0 && selectedUsers.size === users.length}
                        onChange={toggleSelectAll}
                        className="sr-only peer"
                      />
                      <div className={cn(
                        'w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center',
                        users.length > 0 && selectedUsers.size === users.length
                          ? 'bg-momentum-orange border-momentum-orange'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                      )}>
                        {users.length > 0 && selectedUsers.size === users.length && (
                          <Check className="w-3 h-3 text-white" strokeWidth={3} />
                        )}
                      </div>
                    </label>
                  </th>
                  <SortHeader label={language === 'fr' ? 'Utilisateur' : 'User'} field="FirstName" sortBy={sortBy} onSort={(f) => { setSortBy(f); setSortDescending(sortBy === f ? !sortDescending : false); }} />
                  <th className="px-4 py-4 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {language === 'fr' ? 'Statut' : 'Status'}
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden xl:table-cell">
                    {language === 'fr' ? 'Rôle' : 'Role'}
                  </th>
                  <th className="px-4 py-4 text-left text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden lg:table-cell">Type</th>
                  <th className="px-4 py-4 text-center text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider hidden md:table-cell">Email</th>
                  <SortHeader label={language === 'fr' ? 'Inscrit' : 'Joined'} field="CreatedAt" sortBy={sortBy} onSort={(f) => { setSortBy(f); setSortDescending(sortBy === f ? !sortDescending : true); }} className="hidden lg:table-cell" />
                  <th className="px-5 py-4 text-right text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100/80 dark:divide-gray-800/80">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-20 text-center">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center mb-4">
                        <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                      </div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {language === 'fr' ? 'Aucun utilisateur trouvé' : 'No users found'}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {language === 'fr' ? 'Essayez de modifier vos filtres' : 'Try adjusting your filters'}
                      </p>
                    </td>
                  </tr>
                ) : users.map((user, index) => {
                  const status = getStatusLabel(user);
                  const statusStyle = statusStyles[status] || statusStyles.Inactive;

                  return (
                    <motion.tr
                      key={user.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className={cn(
                        'group transition-all duration-200 cursor-pointer',
                        selectedUsers.has(user.id)
                          ? 'bg-momentum-orange/5 dark:bg-momentum-orange/10'
                          : 'hover:bg-gray-50/80 dark:hover:bg-gray-800/40'
                      )}
                    >
                      <td className="w-14 px-5 py-4 hidden lg:table-cell" onClick={(e) => e.stopPropagation()}>
                        <label className="relative flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(user.id)}
                            onChange={() => toggleSelectUser(user.id)}
                            className="sr-only peer"
                          />
                          <div className={cn(
                            'w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center',
                            selectedUsers.has(user.id)
                              ? 'bg-momentum-orange border-momentum-orange'
                              : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500'
                          )}>
                            {selectedUsers.has(user.id) && (
                              <Check className="w-3 h-3 text-white" strokeWidth={3} />
                            )}
                          </div>
                        </label>
                      </td>
                      <td className="px-4 py-4" onClick={() => navigate(`/admin/users/${user.id}`)}>
                        <div className="flex items-center gap-3">
                          {/* Enhanced Avatar */}
                          <div className="relative flex-shrink-0">
                            <div className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm transition-transform duration-200 group-hover:scale-105',
                              'bg-gradient-to-br from-momentum-orange/20 via-orange-400/10 to-orange-500/5 text-momentum-orange',
                              'ring-2 ring-white dark:ring-gray-900'
                            )}>
                              {getInitials(user)}
                            </div>
                            {user.emailVerified && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center ring-2 ring-white dark:ring-gray-900">
                                <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-momentum-orange transition-colors">
                              {getUserName(user)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4" onClick={() => navigate(`/admin/users/${user.id}`)}>
                        <span className={cn(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium',
                          statusStyle.bg, statusStyle.text
                        )}>
                          <span className={cn('w-1.5 h-1.5 rounded-full', statusStyle.dot)} />
                          {status}
                        </span>
                      </td>
                      <td className="px-4 py-4 hidden xl:table-cell" onClick={() => navigate(`/admin/users/${user.id}`)}>
                        {user.role ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-strategy-blue/10 dark:bg-strategy-blue/20 text-xs font-medium text-strategy-blue dark:text-blue-300">
                            <Shield className="w-3 h-3" />
                            {user.role}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell" onClick={() => navigate(`/admin/users/${user.id}`)}>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-700/50 text-xs font-medium text-gray-600 dark:text-gray-400">
                          {user.userType || 'User'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center hidden md:table-cell" onClick={() => navigate(`/admin/users/${user.id}`)}>
                        {user.emailVerified ? (
                          <div className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                            <CheckCircle2 className="w-4 h-4" />
                            <span className="text-xs font-medium hidden lg:inline">{language === 'fr' ? 'Vérifié' : 'Verified'}</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-gray-400 dark:text-gray-500">
                            <XCircle className="w-4 h-4" />
                            <span className="text-xs font-medium hidden lg:inline">Pending</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-4 hidden lg:table-cell" onClick={() => navigate(`/admin/users/${user.id}`)}>
                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 tabular-nums">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </span>
                      </td>
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          {/* Quick action buttons - visible on hover */}
                          <div className="hidden group-hover:flex items-center gap-1 mr-1">
                            <button
                              onClick={() => navigate(`/admin/users/${user.id}`)}
                              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                              title={language === 'fr' ? 'Voir' : 'View'}
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openRoleModal(user)}
                              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                              title={language === 'fr' ? 'Rôles' : 'Roles'}
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                          </div>

                          {/* More actions dropdown */}
                          <div className="relative actions-dropdown">
                            <button
                              onClick={() => setShowActions(showActions === user.id ? null : user.id)}
                              className={cn(
                                'p-2 rounded-lg transition-all duration-200',
                                showActions === user.id
                                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                              )}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            <AnimatePresence>
                              {showActions === user.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-2xl shadow-black/10 dark:shadow-black/30 border border-gray-200 dark:border-gray-700 py-2 z-30 overflow-hidden"
                                >
                                  <ActionItem icon={Eye} label={language === 'fr' ? 'Voir le profil' : 'View Profile'} onClick={() => navigate(`/admin/users/${user.id}`)} />
                                  <div className="h-px bg-gray-100 dark:bg-gray-700 my-1.5 mx-3" />
                                  <ActionItem icon={Check} label={language === 'fr' ? 'Activer' : 'Activate'} onClick={() => handleStatusChange(user.id, 'Active')} className="text-emerald-600 dark:text-emerald-400" />
                                  <ActionItem icon={Ban} label={language === 'fr' ? 'Suspendre' : 'Suspend'} onClick={() => handleStatusChange(user.id, 'Suspended')} className="text-amber-600 dark:text-amber-400" />
                                  <ActionItem icon={XCircle} label={language === 'fr' ? 'Bannir' : 'Ban'} onClick={() => handleStatusChange(user.id, 'Banned')} className="text-red-600 dark:text-red-400" />
                                  <div className="h-px bg-gray-100 dark:bg-gray-700 my-1.5 mx-3" />
                                  <ActionItem icon={Shield} label={language === 'fr' ? 'Gérer les rôles' : 'Manage Roles'} onClick={() => openRoleModal(user)} />
                                  <ActionItem icon={KeyRound} label={language === 'fr' ? 'Réinitialiser MDP' : 'Reset Password'} onClick={() => handleResetPassword(user.id)} />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* CARD VIEW - Polished Design */
          <div className="p-4 sm:p-6">
            {users.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                </div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  {language === 'fr' ? 'Aucun utilisateur trouvé' : 'No users found'}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {language === 'fr' ? 'Essayez de modifier vos filtres' : 'Try adjusting your filters'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                {users.map((user, index) => {
                  const status = getStatusLabel(user);
                  const statusColor = statusStyles[status] || statusStyles.Inactive;
                  const joinedDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString(language === 'fr' ? 'fr-CA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';

                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.025, duration: 0.3 }}
                      className={cn(
                        'group relative rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden',
                        selectedUsers.has(user.id)
                          ? 'ring-2 ring-momentum-orange ring-offset-2 dark:ring-offset-gray-900'
                          : 'hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20 hover:-translate-y-1'
                      )}
                    >
                      {/* Card Background with subtle gradient */}
                      <div className={cn(
                        'absolute inset-0 bg-white dark:bg-gray-800 border transition-colors duration-300',
                        selectedUsers.has(user.id)
                          ? 'border-momentum-orange/30'
                          : 'border-gray-200/80 dark:border-gray-700/80 group-hover:border-gray-300 dark:group-hover:border-gray-600'
                      )} style={{ borderRadius: 'inherit' }} />

                      {/* Top accent gradient bar */}
                      <div
                        className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        style={{ background: `linear-gradient(90deg, #FF6B00, #FF8C40)` }}
                      />

                      {/* Card Content */}
                      <div className="relative p-5">
                        {/* Header Row: Checkbox + Status + Actions */}
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                            <label className="relative flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedUsers.has(user.id)}
                                onChange={() => toggleSelectUser(user.id)}
                                className="sr-only peer"
                              />
                              <div className={cn(
                                'w-5 h-5 rounded-md border-2 transition-all duration-200 flex items-center justify-center',
                                selectedUsers.has(user.id)
                                  ? 'bg-momentum-orange border-momentum-orange'
                                  : 'border-gray-300 dark:border-gray-600 group-hover:border-gray-400 dark:group-hover:border-gray-500'
                              )}>
                                {selectedUsers.has(user.id) && (
                                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                )}
                              </div>
                            </label>
                            {/* Status indicator dot */}
                            <div className="flex items-center gap-1.5">
                              <span className={cn('w-2 h-2 rounded-full', statusColor.dot)} />
                              <span className={cn('text-[11px] font-semibold uppercase tracking-wide', statusColor.text)}>
                                {status}
                              </span>
                            </div>
                          </div>

                          {/* Actions dropdown */}
                          <div className="actions-dropdown relative" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => setShowActions(showActions === user.id ? null : user.id)}
                              className={cn(
                                'p-2 rounded-xl transition-all duration-200',
                                showActions === user.id
                                  ? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                              )}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>
                            <AnimatePresence>
                              {showActions === user.id && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-2xl shadow-black/10 dark:shadow-black/30 border border-gray-200 dark:border-gray-700 py-2 z-30 overflow-hidden"
                                >
                                  <ActionItem icon={Eye} label={language === 'fr' ? 'Voir le profil' : 'View Profile'} onClick={() => navigate(`/admin/users/${user.id}`)} />
                                  <div className="h-px bg-gray-100 dark:bg-gray-700 my-1.5 mx-3" />
                                  <ActionItem icon={Check} label={language === 'fr' ? 'Activer' : 'Activate'} onClick={() => handleStatusChange(user.id, 'Active')} className="text-emerald-600 dark:text-emerald-400" />
                                  <ActionItem icon={Ban} label={language === 'fr' ? 'Suspendre' : 'Suspend'} onClick={() => handleStatusChange(user.id, 'Suspended')} className="text-amber-600 dark:text-amber-400" />
                                  <ActionItem icon={XCircle} label={language === 'fr' ? 'Bannir' : 'Ban'} onClick={() => handleStatusChange(user.id, 'Banned')} className="text-red-600 dark:text-red-400" />
                                  <div className="h-px bg-gray-100 dark:bg-gray-700 my-1.5 mx-3" />
                                  <ActionItem icon={Shield} label={language === 'fr' ? 'Gérer les rôles' : 'Manage Roles'} onClick={() => openRoleModal(user)} />
                                  <ActionItem icon={KeyRound} label={language === 'fr' ? 'Réinitialiser MDP' : 'Reset Password'} onClick={() => handleResetPassword(user.id)} />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>

                        {/* User Profile Section */}
                        <div
                          className="flex items-start gap-4"
                          onClick={() => navigate(`/admin/users/${user.id}`)}
                        >
                          {/* Avatar with status ring */}
                          <div className="relative flex-shrink-0">
                            <div className={cn(
                              'w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg transition-transform duration-300 group-hover:scale-105',
                              'bg-gradient-to-br from-momentum-orange/20 via-orange-400/10 to-orange-500/5 text-momentum-orange',
                              'ring-2 ring-white dark:ring-gray-800 shadow-sm'
                            )}>
                              {getInitials(user)}
                            </div>
                            {/* Email verified badge */}
                            {user.emailVerified && (
                              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center ring-2 ring-white dark:ring-gray-800">
                                <Check className="w-3 h-3 text-white" strokeWidth={3} />
                              </div>
                            )}
                          </div>

                          {/* User Info */}
                          <div className="flex-1 min-w-0 pt-0.5">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate leading-tight">
                              {getUserName(user)}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                              {user.email}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700/50 text-[10px] font-medium text-gray-600 dark:text-gray-400">
                                {user.userType || 'User'}
                              </span>
                              {user.role && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-strategy-blue/10 dark:bg-strategy-blue/20 text-[10px] font-medium text-strategy-blue dark:text-blue-300">
                                  <Shield className="w-2.5 h-2.5" />
                                  {user.role}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700/50">
                          <div className="text-center">
                            <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">{language === 'fr' ? 'Inscrit' : 'Joined'}</p>
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1 truncate">{joinedDate}</p>
                          </div>
                          <div className="text-center border-x border-gray-100 dark:border-gray-700/50">
                            <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Email</p>
                            <p className={cn(
                              'text-xs font-semibold mt-1',
                              user.emailVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 dark:text-gray-500'
                            )}>
                              {user.emailVerified ? (language === 'fr' ? 'Vérifié' : 'Verified') : 'Pending'}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">{language === 'fr' ? 'Plans' : 'Plans'}</p>
                            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mt-1">{user.planCount || 0}</p>
                          </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700/50" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => navigate(`/admin/users/${user.id}`)}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            {language === 'fr' ? 'Voir' : 'View'}
                          </button>
                          <button
                            onClick={() => openRoleModal(user)}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <Shield className="w-3.5 h-3.5" />
                            {language === 'fr' ? 'Rôles' : 'Roles'}
                          </button>
                          <button
                            onClick={() => handleStatusChange(user.id, status === 'Active' ? 'Suspended' : 'Active')}
                            className={cn(
                              'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors',
                              status === 'Active'
                                ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30'
                                : 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
                            )}
                          >
                            {status === 'Active' ? <Ban className="w-3.5 h-3.5" /> : <Check className="w-3.5 h-3.5" />}
                            {status === 'Active' ? (language === 'fr' ? 'Suspendre' : 'Suspend') : (language === 'fr' ? 'Activer' : 'Activate')}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalCount > 0 && (
          <div className="px-3 sm:px-4 py-3 border-t border-gray-100 dark:border-gray-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3 text-sm text-gray-500 dark:text-gray-400 order-2 sm:order-1">
                <span className="tabular-nums text-xs sm:text-sm">
                  {language === 'fr' ? `${startIndex}-${endIndex} sur ${totalCount}` : `${startIndex}-${endIndex} of ${totalCount}`}
                </span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs sm:text-sm px-2 py-1.5 focus:ring-momentum-orange/20 focus:border-momentum-orange"
                >
                  {PAGE_SIZE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-1 order-1 sm:order-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {/* Show simplified pagination on mobile */}
                <span className="sm:hidden px-3 text-sm text-gray-600 dark:text-gray-400 tabular-nums">
                  {page} / {totalPages}
                </span>
                {/* Full pagination on desktop */}
                <div className="hidden sm:flex items-center gap-1">
                  {generatePageNumbers(page, totalPages).map((p, i) =>
                    p === '...' ? (
                      <span key={`dot-${i}`} className="px-2 text-gray-400 text-sm">...</span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(Number(p))}
                        className={cn(
                          'min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors',
                          page === p
                            ? 'bg-momentum-orange text-white shadow-sm'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        )}
                      >
                        {p}
                      </button>
                    )
                  )}
                </div>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page >= totalPages}
                  className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Bulk Action Bar */}
      <AnimatePresence>
        {selectedUsers.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={cn(
              "fixed z-40 bg-gray-900 dark:bg-gray-800 text-white shadow-2xl border border-gray-700",
              // Mobile: full width at bottom
              "bottom-0 left-0 right-0 rounded-t-2xl px-4 py-4 safe-bottom",
              // Desktop: centered floating bar
              "sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2 sm:right-auto sm:rounded-2xl sm:px-6"
            )}
          >
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5">
              <span className="text-sm font-medium whitespace-nowrap">
                {selectedUsers.size} {language === 'fr' ? 'sélectionné' : 'selected'}{selectedUsers.size > 1 ? 's' : ''}
              </span>
              <div className="hidden sm:block h-5 w-px bg-gray-600" />
              <div className="flex items-center gap-3 sm:gap-5">
                <button onClick={() => handleBulkAction('Active')} disabled={bulkActioning} className="text-sm font-medium text-emerald-400 hover:text-emerald-300 disabled:opacity-50 transition-colors">
                  {language === 'fr' ? 'Activer' : 'Activate'}
                </button>
                <button onClick={() => handleBulkAction('Suspended')} disabled={bulkActioning} className="text-sm font-medium text-amber-400 hover:text-amber-300 disabled:opacity-50 transition-colors">
                  {language === 'fr' ? 'Suspendre' : 'Suspend'}
                </button>
                <button onClick={() => handleBulkAction('Banned')} disabled={bulkActioning} className="text-sm font-medium text-red-400 hover:text-red-300 disabled:opacity-50 transition-colors">
                  {language === 'fr' ? 'Bannir' : 'Ban'}
                </button>
              </div>
              <div className="hidden sm:block h-5 w-px bg-gray-600" />
              <button onClick={() => setSelectedUsers(new Set())} className="text-sm text-gray-400 hover:text-white transition-colors">
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </button>
              {bulkActioning && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create User Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <Modal onClose={() => setShowCreateModal(false)}>
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {language === 'fr' ? 'Créer un nouvel utilisateur' : 'Create New User'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {language === 'fr' ? 'Ajouter un utilisateur au système' : 'Add a new user to the system'}
              </p>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-5">
              {createError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 text-sm text-red-700 dark:text-red-300">
                  {createError}
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <FormField label={language === 'fr' ? 'Prénom' : 'First Name'} required>
                  <input type="text" required value={createForm.firstName} onChange={(e) => setCreateForm(p => ({ ...p, firstName: e.target.value }))} className="form-input" placeholder="John" />
                </FormField>
                <FormField label={language === 'fr' ? 'Nom' : 'Last Name'} required>
                  <input type="text" required value={createForm.lastName} onChange={(e) => setCreateForm(p => ({ ...p, lastName: e.target.value }))} className="form-input" placeholder="Doe" />
                </FormField>
              </div>
              <FormField label={language === 'fr' ? 'Courriel' : 'Email'} required>
                <input type="email" required value={createForm.email} onChange={(e) => setCreateForm(p => ({ ...p, email: e.target.value }))} className="form-input" placeholder="user@example.com" />
              </FormField>
              <FormField label={language === 'fr' ? 'Mot de passe' : 'Password'}>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                    <input type="checkbox" checked={createForm.autoPassword} onChange={(e) => setCreateForm(p => ({ ...p, autoPassword: e.target.checked }))} className="rounded border-gray-300 text-momentum-orange focus:ring-momentum-orange/20" />
                    {language === 'fr' ? 'Générer automatiquement' : 'Auto-generate password'}
                  </label>
                  {!createForm.autoPassword && (
                    <input type="password" value={createForm.password} onChange={(e) => setCreateForm(p => ({ ...p, password: e.target.value }))} className="form-input" placeholder="Min 8 characters" minLength={8} />
                  )}
                </div>
              </FormField>
              <FormField label={language === 'fr' ? "Type d'utilisateur" : 'User Type'}>
                <select value={createForm.userType} onChange={(e) => setCreateForm(p => ({ ...p, userType: e.target.value }))} className="form-input">
                  <option value="Entrepreneur">Entrepreneur</option>
                  <option value="Consultant">Consultant</option>
                  <option value="OBNL">OBNL</option>
                </select>
              </FormField>
              {roles.length > 0 && (
                <FormField label={language === 'fr' ? 'Rôles' : 'Roles'}>
                  <div className="flex flex-wrap gap-2">
                    {roles.map((role: any) => (
                      <label key={role.id} className={cn(
                        'flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-all',
                        createForm.roleIds.includes(role.id)
                          ? 'border-momentum-orange bg-momentum-orange/10 text-momentum-orange'
                          : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                      )}>
                        <input type="checkbox" className="sr-only" checked={createForm.roleIds.includes(role.id)} onChange={() => setCreateForm(p => ({ ...p, roleIds: p.roleIds.includes(role.id) ? p.roleIds.filter(r => r !== role.id) : [...p.roleIds, role.id] }))} />
                        <Shield className="w-3.5 h-3.5" />
                        {role.name}
                      </label>
                    ))}
                  </div>
                </FormField>
              )}
              <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
                <input type="checkbox" checked={createForm.emailVerified} onChange={(e) => setCreateForm(p => ({ ...p, emailVerified: e.target.checked }))} className="rounded border-gray-300 text-momentum-orange focus:ring-momentum-orange/20" />
                {language === 'fr' ? "Marquer l'email comme vérifié" : 'Mark email as verified'}
              </label>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  {language === 'fr' ? 'Annuler' : 'Cancel'}
                </button>
                <button type="submit" disabled={creating} className="px-5 py-2.5 text-sm font-medium text-white bg-momentum-orange hover:bg-orange-600 rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm shadow-orange-500/20">
                  {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {language === 'fr' ? 'Créer' : 'Create User'}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* Role Management Modal */}
      <AnimatePresence>
        {showRoleModal && selectedUser && (
          <Modal onClose={() => { setShowRoleModal(false); setSelectedUser(null); setUserRoles([]); }}>
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {language === 'fr' ? 'Gérer les rôles' : 'Manage Roles'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {getUserName(selectedUser)} &middot; {selectedUser.email}
              </p>
            </div>
            <div className="p-6">
              {loadingRoles ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 text-momentum-orange animate-spin" />
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                      {language === 'fr' ? 'Rôles actuels' : 'Current Roles'}
                    </h4>
                    {userRoles.length === 0 ? (
                      <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                        {language === 'fr' ? 'Aucun rôle assigné' : 'No roles assigned'}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {userRoles.map((role: any) => (
                          <div key={role.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-momentum-orange/10">
                                <Shield className="w-4 h-4 text-momentum-orange" />
                              </div>
                              <div>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">{role.name}</span>
                                {role.description && <p className="text-xs text-gray-500 dark:text-gray-400">{role.description}</p>}
                              </div>
                            </div>
                            <button onClick={() => handleRemoveRole(role.id)} className="text-xs font-medium text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors">
                              {language === 'fr' ? 'Retirer' : 'Remove'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                      {language === 'fr' ? 'Rôles disponibles' : 'Available Roles'}
                    </h4>
                    {roles.filter((r: any) => !userRoles.some((ur: any) => ur.id === r.id)).length === 0 ? (
                      <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                        {language === 'fr' ? 'Tous les rôles sont assignés' : 'All roles assigned'}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {roles.filter((r: any) => !userRoles.some((ur: any) => ur.id === r.id)).map((role: any) => (
                          <div key={role.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                            <div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">{role.name}</span>
                              {role.description && <p className="text-xs text-gray-500 dark:text-gray-400">{role.description}</p>}
                            </div>
                            <button onClick={() => handleAssignRole(role.id)} className="px-3 py-1.5 text-xs font-medium text-white bg-momentum-orange hover:bg-orange-600 rounded-lg transition-colors">
                              {language === 'fr' ? 'Assigner' : 'Assign'}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Styles */}
      <style>{`
        .form-input {
          width: 100%;
          padding: 0.625rem 0.875rem;
          font-size: 0.875rem;
          border: 1px solid rgb(229 231 235);
          border-radius: 0.75rem;
          background: rgb(249 250 251);
          color: rgb(17 24 39);
          transition: all 0.15s;
        }
        .form-input:focus {
          outline: none;
          border-color: #FF6B00;
          background: white;
          box-shadow: 0 0 0 3px rgba(255, 107, 0, 0.1);
        }
        .dark .form-input {
          background: rgb(31 41 55);
          border-color: rgb(55 65 81);
          color: rgb(243 244 246);
        }
        .dark .form-input:focus {
          border-color: #FF6B00;
          background: rgb(17 24 39);
        }
      `}</style>
    </div>
  );
}

// === Sub-components ===

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        className={cn(
          "relative bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-700",
          // Mobile: full width, rounded top corners, slides up from bottom
          "w-full max-h-[90vh] rounded-t-2xl",
          // Desktop: centered modal with all corners rounded
          "sm:rounded-2xl sm:max-w-lg"
        )}
      >
        {/* Drag handle for mobile */}
        <div className="sm:hidden flex justify-center pt-3">
          <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="overflow-y-auto max-h-[calc(90vh-1rem)]">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

function FilterPill({ label, value, options, onChange }: {
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
        className={cn(
          'flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg border transition-all',
          value !== 'All'
            ? 'border-momentum-orange bg-momentum-orange/5 text-momentum-orange'
            : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
        )}
      >
        {label}: <span className="font-semibold">{value}</span>
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute top-full left-0 mt-1.5 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1.5 z-30 min-w-[140px] overflow-hidden"
          >
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => { onChange(opt); setOpen(false); }}
                className={cn(
                  'block w-full text-left px-3 py-2 text-xs transition-colors',
                  value === opt
                    ? 'bg-momentum-orange/10 text-momentum-orange font-medium'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                )}
              >
                {opt}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SortHeader({ label, field, sortBy, onSort, className = '' }: {
  label: string; field: string; sortBy: string; onSort: (field: string) => void; className?: string;
}) {
  const active = sortBy === field;
  return (
    <th
      onClick={() => onSort(field)}
      className={cn(
        "px-4 py-4 text-left text-[11px] font-semibold uppercase tracking-wider cursor-pointer select-none group transition-colors",
        active
          ? "text-momentum-orange"
          : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200",
        className
      )}
    >
      <span className="inline-flex items-center gap-1.5">
        {label}
        <ArrowUpDown className={cn(
          'w-3 h-3 transition-all duration-200',
          active
            ? 'text-momentum-orange scale-110'
            : 'text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 group-hover:scale-100 scale-90'
        )} />
      </span>
    </th>
  );
}

function ActionItem({ icon: Icon, label, onClick, className = '' }: {
  icon: any; label: string; onClick: () => void; className?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-2.5 w-full px-3 py-2.5 text-[13px] font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all duration-150 group/action',
        className
      )}
    >
      <Icon className="w-4 h-4 transition-transform group-hover/action:scale-110" />
      {label}
    </button>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
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
