import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../lib/admin-service';
import {
  Search, Building2, Users, CheckCircle2, XCircle, AlertCircle, X,
  ChevronLeft, ChevronRight, Eye, MoreVertical, Plus, RefreshCw,
  ArrowUpDown, Loader2, Crown, FileText, UserPlus,
  LayoutGrid, List,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { getUserFriendlyError } from '../../utils/error-messages';
import { Button } from '../../components/ui/button';
import { SqordiaLoader } from '../../components/ui/SqordiaLoader';

const ORG_TYPE_OPTIONS = ['All', 'Startup', 'OBNL', 'ConsultingFirm', 'Company'] as const;
const ORG_TYPE_CREATE = ['Startup', 'OBNL', 'ConsultingFirm', 'Company'] as const;
const STATUS_OPTIONS = ['All', 'Active', 'Inactive'] as const;
const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

type ViewMode = 'table' | 'grid';

const EMPTY_FORM = {
  name: '',
  description: '',
  organizationType: 'Startup',
  website: '',
  maxMembers: 10,
  allowMemberInvites: true,
  requireEmailVerification: false,
};

const TYPE_COLORS: Record<string, string> = {
  Startup: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  OBNL: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  ConsultingFirm: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  Company: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
};

export default function AdminOrganizationsPage() {
  const { language } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const [organizations, setOrganizations] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState('CreatedAt');
  const [sortDescending, setSortDescending] = useState(true);

  // Modals
  const [statusModalOrg, setStatusModalOrg] = useState<any | null>(null);
  const [statusReason, setStatusReason] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);

  // Create modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);

  // Debounce search
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [searchTerm]);

  const loadOrganizations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params: Record<string, string> = {
        page: String(page),
        pageSize: String(pageSize),
        sortBy,
        sortDescending: String(sortDescending),
      };
      if (debouncedSearch) params.searchTerm = debouncedSearch;
      if (typeFilter !== 'All') params.organizationType = typeFilter;
      if (statusFilter !== 'All') params.isActive = String(statusFilter === 'Active');

      const result = await adminService.getOrganizationsPaginated(params);
      setOrganizations(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'load'));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, typeFilter, statusFilter, sortBy, sortDescending]);

  useEffect(() => { loadOrganizations(); }, [loadOrganizations]);

  const handleStatusChange = async () => {
    if (!statusModalOrg) return;
    try {
      setUpdatingStatus(true);
      const newActive = !statusModalOrg.isActive;
      await adminService.updateOrganizationStatus(statusModalOrg.id, newActive, statusReason || 'Status updated by admin');
      toast.success(language === 'fr' ? 'Statut mis à jour' : 'Status Updated', `Organization ${newActive ? 'activated' : 'deactivated'} successfully.`);
      setStatusModalOrg(null);
      setStatusReason('');
      await loadOrganizations();
    } catch (err: any) {
      toast.error('Error', getUserFriendlyError(err, 'save'));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDescending(!sortDescending);
    } else {
      setSortBy(field);
      setSortDescending(true);
    }
    setPage(1);
  };

  const handleCreate = async () => {
    if (!createForm.name.trim()) return;
    try {
      setCreating(true);
      await adminService.createOrganization({
        name: createForm.name.trim(),
        description: createForm.description.trim() || undefined,
        organizationType: createForm.organizationType,
        website: createForm.website.trim() || undefined,
        maxMembers: createForm.maxMembers,
        allowMemberInvites: createForm.allowMemberInvites,
        requireEmailVerification: createForm.requireEmailVerification,
      });
      toast.success(language === 'fr' ? 'Créée' : 'Created', language === 'fr' ? 'Organisation créée avec succès.' : 'Organization created successfully.');
      setShowCreateModal(false);
      setCreateForm(EMPTY_FORM);
      await loadOrganizations();
    } catch (err: any) {
      toast.error('Error', getUserFriendlyError(err, 'save'));
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';

  const getInitials = (name: string) => {
    if (!name || name === 'Unknown') return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading && organizations.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <SqordiaLoader size="lg" message={language === 'fr' ? 'Chargement...' : 'Loading organizations...'} />
      </div>
    );
  }

  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalCount);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {language === 'fr' ? 'Organisations' : 'Organizations'}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {language === 'fr' ? 'Gérer toutes les organisations et leurs membres' : 'Manage all organizations and their members'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => loadOrganizations()} className="gap-2">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {language === 'fr' ? 'Rafraîchir' : 'Refresh'}
          </Button>
          <Button variant="brand" onClick={() => setShowCreateModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            {language === 'fr' ? 'Créer' : 'Create'}
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Filters & View Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder={language === 'fr' ? 'Rechercher par nom ou propriétaire...' : 'Search by name or owner...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            {ORG_TYPE_OPTIONS.map(o => (
              <option key={o} value={o}>{o === 'All' ? (language === 'fr' ? 'Tous les types' : 'All types') : o}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o} value={o}>{o === 'All' ? (language === 'fr' ? 'Tous les statuts' : 'All statuses') : o}</option>
            ))}
          </select>
          <select
            value={pageSize}
            onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            {PAGE_SIZE_OPTIONS.map(s => (
              <option key={s} value={s}>{s} / page</option>
            ))}
          </select>
          {/* View toggle */}
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-2 transition-colors ${viewMode === 'table' ? 'bg-orange-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
              title="Table view"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 transition-colors ${viewMode === 'grid' ? 'bg-orange-500 text-white' : 'bg-white dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'}`}
              title="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-y border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-white" onClick={() => handleSort('Name')}>
                    <span className="flex items-center gap-1">{language === 'fr' ? 'Organisation' : 'Organization'} <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400 hidden md:table-cell">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Crown className="w-3 h-3" /> {language === 'fr' ? 'Propriétaire' : 'Owner'}</span>
                  </th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600 dark:text-gray-400">{language === 'fr' ? 'Membres' : 'Members'}</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600 dark:text-gray-400 hidden sm:table-cell">{language === 'fr' ? 'Plans' : 'Plans'}</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600 dark:text-gray-400">{language === 'fr' ? 'Statut' : 'Status'}</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400 hidden lg:table-cell cursor-pointer hover:text-gray-900 dark:hover:text-white" onClick={() => handleSort('CreatedAt')}>
                    <span className="flex items-center gap-1">{language === 'fr' ? 'Créé' : 'Created'} <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {organizations.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                      <Building2 className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                      <p className="font-medium">{language === 'fr' ? 'Aucune organisation trouvée' : 'No organizations found'}</p>
                      <p className="text-xs mt-1">{language === 'fr' ? 'Essayez de modifier vos filtres' : 'Try adjusting your filters'}</p>
                    </td>
                  </tr>
                ) : (
                  organizations.map((org) => (
                    <tr
                      key={org.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/admin/organizations/${org.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                            <Building2 className="w-4 h-4 text-orange-500" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">{org.name}</p>
                            {org.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px] hidden xl:block">{org.description}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${TYPE_COLORS[org.organizationType] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                          {org.organizationType || '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-orange-600 dark:text-orange-400">
                            {getInitials(org.ownerName)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm text-gray-900 dark:text-white truncate max-w-[140px]">
                              {org.ownerName && org.ownerName !== 'Unknown' ? org.ownerName : (
                                <span className="text-gray-400 italic">{language === 'fr' ? 'Aucun' : 'None'}</span>
                              )}
                            </p>
                            {org.ownerEmail && org.ownerEmail !== 'Unknown' && (
                              <p className="text-[11px] text-gray-400 truncate max-w-[140px] hidden xl:block">{org.ownerEmail}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 text-gray-700 dark:text-gray-300">
                          <Users className="w-3.5 h-3.5" /> {org.memberCount || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center hidden sm:table-cell">
                        <span className="inline-flex items-center gap-1 text-gray-700 dark:text-gray-300">
                          <FileText className="w-3.5 h-3.5" /> {org.businessPlanCount || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {org.isActive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-red-500/10 text-red-600 dark:text-red-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-500 dark:text-gray-400 text-xs">
                        {formatDate(org.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-block" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => {
                              if (activeDropdown === org.id) {
                                setActiveDropdown(null);
                                setDropdownPos(null);
                              } else {
                                const rect = e.currentTarget.getBoundingClientRect();
                                setDropdownPos({ top: rect.bottom + 4, left: rect.right - 192 });
                                setActiveDropdown(org.id);
                              }
                            }}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {organizations.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
                <Building2 className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="font-medium">{language === 'fr' ? 'Aucune organisation trouvée' : 'No organizations found'}</p>
              </div>
            ) : (
              organizations.map((org) => (
                <div
                  key={org.id}
                  onClick={() => navigate(`/admin/organizations/${org.id}`)}
                  className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md hover:border-orange-300 dark:hover:border-orange-700 cursor-pointer transition-all group"
                >
                  {/* Card header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center group-hover:bg-orange-500/20 transition-colors">
                        <Building2 className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white truncate max-w-[180px]">{org.name}</h3>
                        <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full mt-0.5 ${TYPE_COLORS[org.organizationType] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                          {org.organizationType}
                        </span>
                      </div>
                    </div>
                    {org.isActive ? (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 flex-shrink-0 mt-1" title="Active" />
                    ) : (
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0 mt-1" title="Inactive" />
                    )}
                  </div>

                  {/* Owner */}
                  <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <Crown className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                        {org.ownerName && org.ownerName !== 'Unknown' ? org.ownerName : (
                          <span className="text-gray-400 italic">{language === 'fr' ? 'Aucun propriétaire' : 'No owner'}</span>
                        )}
                      </p>
                      {org.ownerEmail && org.ownerEmail !== 'Unknown' && (
                        <p className="text-[10px] text-gray-400 truncate">{org.ownerEmail}</p>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg py-2">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{org.memberCount || 0}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">{language === 'fr' ? 'Membres' : 'Members'}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg py-2">
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{org.businessPlanCount || 0}</p>
                      <p className="text-[10px] text-gray-500 dark:text-gray-400">{language === 'fr' ? 'Plans' : 'Plans'}</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg py-2">
                      <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">{language === 'fr' ? 'Créé' : 'Created'}</p>
                      <p className="text-xs font-medium text-gray-900 dark:text-white">{formatDate(org.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {totalCount > 0 ? (
              language === 'fr'
                ? `${startItem}-${endItem} sur ${totalCount} organisations`
                : `${startItem}-${endItem} of ${totalCount} organizations`
            ) : (
              language === 'fr' ? '0 organisations' : '0 organizations'
            )}
          </p>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = page <= 3 ? i + 1 : page + i - 2;
                if (pageNum < 1 || pageNum > totalPages) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-9 h-9 text-sm font-medium rounded-lg transition-colors ${pageNum === page ? 'bg-orange-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-600 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Status Change Modal */}
      {statusModalOrg && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {statusModalOrg.isActive
                  ? (language === 'fr' ? 'Désactiver l\'organisation' : 'Deactivate Organization')
                  : (language === 'fr' ? 'Activer l\'organisation' : 'Activate Organization')}
              </h3>
              <button onClick={() => { setStatusModalOrg(null); setStatusReason(''); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              {statusModalOrg.isActive
                ? (language === 'fr'
                    ? `Êtes-vous sûr de vouloir désactiver "${statusModalOrg.name}" ? Les membres perdront l'accès.`
                    : `Are you sure you want to deactivate "${statusModalOrg.name}"? Members will lose access.`)
                : (language === 'fr'
                    ? `Êtes-vous sûr de vouloir activer "${statusModalOrg.name}" ?`
                    : `Are you sure you want to activate "${statusModalOrg.name}"?`)}
            </p>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {language === 'fr' ? 'Raison (obligatoire)' : 'Reason (required)'}
            </label>
            <textarea
              value={statusReason}
              onChange={(e) => setStatusReason(e.target.value)}
              placeholder={language === 'fr' ? 'Raison du changement de statut...' : 'Enter reason for status change...'}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500 mb-4"
              rows={3}
            />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => { setStatusModalOrg(null); setStatusReason(''); }}>
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </Button>
              <Button
                variant={statusModalOrg.isActive ? 'destructive' : 'brand'}
                className="flex-1"
                onClick={handleStatusChange}
                disabled={!statusReason.trim() || updatingStatus}
              >
                {updatingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {statusModalOrg.isActive ? (language === 'fr' ? 'Désactiver' : 'Deactivate') : (language === 'fr' ? 'Activer' : 'Activate')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Organization Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {language === 'fr' ? 'Nouvelle organisation' : 'New Organization'}
              </h3>
              <button onClick={() => { setShowCreateModal(false); setCreateForm(EMPTY_FORM); }} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {language === 'fr' ? 'Nom *' : 'Name *'}
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder={language === 'fr' ? 'Nom de l\'organisation' : 'Organization name'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select
                  value={createForm.organizationType}
                  onChange={(e) => setCreateForm({ ...createForm, organizationType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                >
                  {ORG_TYPE_CREATE.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder={language === 'fr' ? 'Description (optionnel)' : 'Description (optional)'}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {language === 'fr' ? 'Site web' : 'Website'}
                </label>
                <input
                  type="url"
                  value={createForm.website}
                  onChange={(e) => setCreateForm({ ...createForm, website: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {language === 'fr' ? 'Max membres' : 'Max Members'}
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={createForm.maxMembers}
                    onChange={(e) => setCreateForm({ ...createForm, maxMembers: Number(e.target.value) || 10 })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div className="flex flex-col justify-end gap-2">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={createForm.allowMemberInvites}
                      onChange={(e) => setCreateForm({ ...createForm, allowMemberInvites: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500"
                    />
                    {language === 'fr' ? 'Invitations' : 'Allow Invites'}
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input
                      type="checkbox"
                      checked={createForm.requireEmailVerification}
                      onChange={(e) => setCreateForm({ ...createForm, requireEmailVerification: e.target.checked })}
                      className="rounded border-gray-300 dark:border-gray-600 text-orange-500 focus:ring-orange-500"
                    />
                    {language === 'fr' ? 'Vérif. email' : 'Require Email Verification'}
                  </label>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="flex-1" onClick={() => { setShowCreateModal(false); setCreateForm(EMPTY_FORM); }}>
                {language === 'fr' ? 'Annuler' : 'Cancel'}
              </Button>
              <Button variant="brand" className="flex-1" onClick={handleCreate} disabled={!createForm.name.trim() || creating}>
                {creating && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                {language === 'fr' ? 'Créer' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Close dropdown on outside click */}
      {/* Fixed-position dropdown menu (rendered outside table overflow) */}
      {activeDropdown && dropdownPos && (() => {
        const org = organizations.find(o => o.id === activeDropdown);
        if (!org) return null;
        return (
          <>
            <div className="fixed inset-0 z-40" onClick={() => { setActiveDropdown(null); setDropdownPos(null); }} />
            <div
              className="fixed w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-1"
              style={{ top: dropdownPos.top, left: dropdownPos.left }}
            >
              <button
                onClick={() => { navigate(`/admin/organizations/${org.id}`); setActiveDropdown(null); setDropdownPos(null); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Eye className="w-4 h-4" /> {language === 'fr' ? 'Voir détails' : 'View Details'}
              </button>
              <button
                onClick={() => { navigate(`/admin/organizations/${org.id}?tab=members`); setActiveDropdown(null); setDropdownPos(null); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <UserPlus className="w-4 h-4" /> {language === 'fr' ? 'Gérer les membres' : 'Manage Members'}
              </button>
              <hr className="my-1 border-gray-200 dark:border-gray-700" />
              <button
                onClick={() => { setStatusModalOrg(org); setActiveDropdown(null); setDropdownPos(null); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {org.isActive ? <XCircle className="w-4 h-4 text-red-500" /> : <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                {org.isActive ? (language === 'fr' ? 'Désactiver' : 'Deactivate') : (language === 'fr' ? 'Activer' : 'Activate')}
              </button>
            </div>
          </>
        );
      })()}
    </div>
  );
}
