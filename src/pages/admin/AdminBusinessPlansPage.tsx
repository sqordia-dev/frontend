import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../lib/admin-service';
import {
  Search, FileText, Building2, AlertCircle, X,
  ChevronLeft, ChevronRight, Eye, MoreVertical, RefreshCw,
  ArrowUpDown, Loader2, Trash2, RotateCcw, ExternalLink,
  LayoutGrid, List, Calendar, Brain, DollarSign, User,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { getUserFriendlyError } from '../../utils/error-messages';
import { Button } from '../../components/ui/button';
import { SqordiaLoader } from '../../components/ui/SqordiaLoader';

const PLAN_TYPE_OPTIONS = ['All', 'BusinessPlan', 'StrategicPlan', 'LeanCanvas'] as const;
const STATUS_OPTIONS = ['All', 'Draft', 'QuestionnaireComplete', 'Generating', 'Generated', 'InReview', 'Finalized', 'Archived'] as const;
const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

type ViewMode = 'table' | 'grid';

const TYPE_COLORS: Record<string, string> = {
  BusinessPlan: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  StrategicPlan: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  LeanCanvas: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

const STATUS_COLORS: Record<string, string> = {
  Draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-300',
  QuestionnaireComplete: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  Generating: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Generated: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  InReview: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  Finalized: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  Archived: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
};

const TYPE_LABELS: Record<string, { en: string; fr: string }> = {
  BusinessPlan: { en: 'Business Plan', fr: "Plan d'affaires" },
  StrategicPlan: { en: 'Strategic Plan', fr: 'Plan stratégique' },
  LeanCanvas: { en: 'Lean Canvas', fr: 'Lean Canvas' },
};

const STATUS_LABELS: Record<string, { en: string; fr: string }> = {
  Draft: { en: 'Draft', fr: 'Brouillon' },
  QuestionnaireComplete: { en: 'Questionnaire Done', fr: 'Questionnaire complété' },
  Generating: { en: 'Generating', fr: 'En génération' },
  Generated: { en: 'Generated', fr: 'Généré' },
  InReview: { en: 'In Review', fr: 'En révision' },
  Finalized: { en: 'Finalized', fr: 'Finalisé' },
  Archived: { en: 'Archived', fr: 'Archivé' },
};

export default function AdminBusinessPlansPage() {
  const { language } = useTheme();
  const toast = useToast();
  const navigate = useNavigate();
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const fr = language === 'fr';

  const [plans, setPlans] = useState<any[]>([]);
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
  const [deleteModalPlan, setDeleteModalPlan] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [regenerateModalPlan, setRegenerateModalPlan] = useState<any | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null);

  // Debounce search
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => { if (searchTimerRef.current) clearTimeout(searchTimerRef.current); };
  }, [searchTerm]);

  const loadPlans = useCallback(async () => {
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
      if (typeFilter !== 'All') params.planType = typeFilter;
      if (statusFilter !== 'All') params.status = statusFilter;

      const result = await adminService.getBusinessPlansPaginated(params);
      setPlans(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
    } catch (err: any) {
      setError(getUserFriendlyError(err, 'load'));
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, debouncedSearch, typeFilter, statusFilter, sortBy, sortDescending]);

  useEffect(() => { loadPlans(); }, [loadPlans]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortDescending(!sortDescending);
    } else {
      setSortBy(field);
      setSortDescending(true);
    }
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteModalPlan) return;
    try {
      setDeleting(true);
      await adminService.deleteBusinessPlan(deleteModalPlan.id);
      toast.success(
        fr ? 'Supprimé' : 'Deleted',
        fr ? 'Plan d\'affaires supprimé avec succès.' : 'Business plan deleted successfully.'
      );
      setDeleteModalPlan(null);
      await loadPlans();
    } catch (err: any) {
      toast.error('Error', getUserFriendlyError(err, 'save'));
    } finally {
      setDeleting(false);
    }
  };

  const handleRegenerate = async () => {
    if (!regenerateModalPlan) return;
    try {
      setRegenerating(true);
      await adminService.regenerateBusinessPlan(regenerateModalPlan.id);
      toast.success(
        fr ? 'Régénération lancée' : 'Regeneration Started',
        fr ? 'La régénération du plan a été lancée.' : 'Business plan regeneration has been started.'
      );
      setRegenerateModalPlan(null);
      await loadPlans();
    } catch (err: any) {
      toast.error('Error', getUserFriendlyError(err, 'save'));
    } finally {
      setRegenerating(false);
    }
  };

  const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' }) : '-';

  const getCompletionPercent = (plan: any) => {
    if (!plan.sectionCount || plan.sectionCount === 0) return 0;
    return Math.round((plan.completedSectionCount / plan.sectionCount) * 100);
  };

  if (loading && plans.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <SqordiaLoader size="lg" message={fr ? 'Chargement...' : 'Loading business plans...'} />
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
            {fr ? "Plans d'affaires" : 'Business Plans'}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {fr ? 'Gérer tous les plans d\'affaires de la plateforme' : 'Manage all business plans across the platform'}
          </p>
        </div>
        <Button variant="outline" onClick={() => loadPlans()} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {fr ? 'Rafraîchir' : 'Refresh'}
        </Button>
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
              placeholder={fr ? 'Rechercher par titre ou description...' : 'Search by title or description...'}
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
            {PLAN_TYPE_OPTIONS.map(o => (
              <option key={o} value={o}>
                {o === 'All' ? (fr ? 'Tous les types' : 'All types') : (TYPE_LABELS[o]?.[fr ? 'fr' : 'en'] || o)}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            {STATUS_OPTIONS.map(o => (
              <option key={o} value={o}>
                {o === 'All' ? (fr ? 'Tous les statuts' : 'All statuses') : (STATUS_LABELS[o]?.[fr ? 'fr' : 'en'] || o)}
              </option>
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
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:text-gray-900 dark:hover:text-white" onClick={() => handleSort('Title')}>
                    <span className="flex items-center gap-1">{fr ? 'Titre' : 'Title'} <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400 hidden md:table-cell">Type</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600 dark:text-gray-400">{fr ? 'Statut' : 'Status'}</th>
                  <th className="px-4 py-3 text-center font-medium text-gray-600 dark:text-gray-400 hidden lg:table-cell">{fr ? 'Progression' : 'Progress'}</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400 hidden xl:table-cell">
                    <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {fr ? 'Organisation' : 'Organization'}</span>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400 hidden lg:table-cell">
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {fr ? 'Créateur' : 'Creator'}</span>
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400 hidden lg:table-cell cursor-pointer hover:text-gray-900 dark:hover:text-white" onClick={() => handleSort('CreatedAt')}>
                    <span className="flex items-center gap-1">{fr ? 'Créé' : 'Created'} <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="px-4 py-3 text-right font-medium text-gray-600 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {plans.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-gray-500 dark:text-gray-400">
                      <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                      <p className="font-medium">{fr ? 'Aucun plan trouvé' : 'No business plans found'}</p>
                      <p className="text-xs mt-1">{fr ? 'Essayez de modifier vos filtres' : 'Try adjusting your filters'}</p>
                    </td>
                  </tr>
                ) : (
                  plans.map((plan) => {
                    const completion = getCompletionPercent(plan);
                    return (
                      <tr
                        key={plan.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                        onClick={() => window.open(`/business-plan/${plan.id}/preview`, '_blank')}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-4 h-4 text-purple-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 dark:text-white truncate max-w-[250px]">{plan.title || (fr ? 'Sans titre' : 'Untitled')}</p>
                              {plan.description && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[250px] hidden xl:block">{plan.description}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <span className={`inline-flex px-2 py-0.5 text-xs font-medium rounded-full ${TYPE_COLORS[plan.planType] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                            {TYPE_LABELS[plan.planType]?.[fr ? 'fr' : 'en'] || plan.planType || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[plan.status] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                            {plan.status === 'Generating' && <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />}
                            {STATUS_LABELS[plan.status]?.[fr ? 'fr' : 'en'] || plan.status || '-'}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden max-w-[80px]">
                              <div
                                className={`h-full rounded-full transition-all ${completion >= 100 ? 'bg-emerald-500' : completion >= 50 ? 'bg-blue-500' : 'bg-orange-500'}`}
                                style={{ width: `${Math.min(completion, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">
                              {plan.completedSectionCount}/{plan.sectionCount}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden xl:table-cell">
                          <p className="text-sm text-gray-900 dark:text-white truncate max-w-[150px]">{plan.organizationName || '-'}</p>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          <p className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[150px]">{plan.createdByEmail || '-'}</p>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell text-gray-500 dark:text-gray-400 text-xs">
                          {formatDate(plan.createdAt)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="inline-block" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => {
                                if (activeDropdown === plan.id) {
                                  setActiveDropdown(null);
                                  setDropdownPos(null);
                                } else {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  setDropdownPos({ top: rect.bottom + 4, left: rect.right - 192 });
                                  setActiveDropdown(plan.id);
                                }
                              }}
                              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                              <MoreVertical className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Grid View */}
        {viewMode === 'grid' && (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-500 dark:text-gray-400">
                <FileText className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p className="font-medium">{fr ? 'Aucun plan trouvé' : 'No business plans found'}</p>
              </div>
            ) : (
              plans.map((plan) => {
                const completion = getCompletionPercent(plan);
                return (
                  <div
                    key={plan.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => window.open(`/business-plan/${plan.id}/preview`, '_blank')}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); window.open(`/business-plan/${plan.id}/preview`, '_blank'); } }}
                    aria-label={`${fr ? 'Ouvrir le plan' : 'Open plan'} ${plan.title || (fr ? 'Sans titre' : 'Untitled')}`}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer transition-all group focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
                  >
                    {/* Card header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors flex-shrink-0">
                          <FileText className="w-5 h-5 text-purple-500" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{plan.title || (fr ? 'Sans titre' : 'Untitled')}</h3>
                          <span className={`inline-flex px-2 py-0.5 text-[10px] font-medium rounded-full mt-0.5 ${TYPE_COLORS[plan.planType] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                            {TYPE_LABELS[plan.planType]?.[fr ? 'fr' : 'en'] || plan.planType}
                          </span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium rounded-full flex-shrink-0 ${STATUS_COLORS[plan.status] || 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}>
                        {STATUS_LABELS[plan.status]?.[fr ? 'fr' : 'en'] || plan.status}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>{fr ? 'Sections' : 'Sections'}</span>
                        <span>{plan.completedSectionCount}/{plan.sectionCount} ({completion}%)</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${completion >= 100 ? 'bg-emerald-500' : completion >= 50 ? 'bg-blue-500' : 'bg-orange-500'}`}
                          style={{ width: `${Math.min(completion, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Organization & Creator */}
                    <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                      <Building2 className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{plan.organizationName || '-'}</p>
                        <p className="text-[10px] text-gray-400 truncate">{plan.createdByEmail || '-'}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg py-2">
                        <Brain className="w-3.5 h-3.5 mx-auto mb-0.5 text-purple-500" />
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{plan.aiGeneratedSectionCount || 0}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{fr ? 'IA' : 'AI'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg py-2">
                        <DollarSign className="w-3.5 h-3.5 mx-auto mb-0.5 text-emerald-500" />
                        <p className="text-sm font-bold text-gray-900 dark:text-white">${(plan.estimatedAICost || 0).toFixed(2)}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">{fr ? 'Coût' : 'Cost'}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg py-2">
                        <Calendar className="w-3.5 h-3.5 mx-auto mb-0.5 text-blue-500" />
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">{fr ? 'Créé' : 'Created'}</p>
                        <p className="text-xs font-medium text-gray-900 dark:text-white">{formatDate(plan.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Pagination */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {totalCount > 0 ? (
              fr
                ? `${startItem}-${endItem} sur ${totalCount} plans`
                : `${startItem}-${endItem} of ${totalCount} plans`
            ) : (
              fr ? '0 plans' : '0 plans'
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

      {/* Delete Confirmation Modal */}
      {deleteModalPlan && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {fr ? 'Supprimer le plan' : 'Delete Business Plan'}
              </h3>
              <button onClick={() => setDeleteModalPlan(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {fr
                ? `Êtes-vous sûr de vouloir supprimer "${deleteModalPlan.title}" ?`
                : `Are you sure you want to delete "${deleteModalPlan.title}"?`}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              {fr
                ? `Organisation: ${deleteModalPlan.organizationName || '-'} | Créateur: ${deleteModalPlan.createdByEmail || '-'}`
                : `Organization: ${deleteModalPlan.organizationName || '-'} | Creator: ${deleteModalPlan.createdByEmail || '-'}`}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setDeleteModalPlan(null)}>
                {fr ? 'Annuler' : 'Cancel'}
              </Button>
              <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={deleting}>
                {deleting && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                {fr ? 'Supprimer' : 'Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Regenerate Confirmation Modal */}
      {regenerateModalPlan && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {fr ? 'Régénérer le plan' : 'Regenerate Business Plan'}
              </h3>
              <button onClick={() => setRegenerateModalPlan(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {fr
                ? `Voulez-vous régénérer toutes les sections de "${regenerateModalPlan.title}" avec l'IA ?`
                : `Do you want to regenerate all sections of "${regenerateModalPlan.title}" using AI?`}
            </p>
            <p className="text-xs text-orange-600 dark:text-orange-400 mb-4">
              {fr ? 'Cela remplacera tout le contenu existant et entraînera des coûts d\'IA.' : 'This will replace all existing content and incur AI costs.'}
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setRegenerateModalPlan(null)}>
                {fr ? 'Annuler' : 'Cancel'}
              </Button>
              <Button variant="brand" className="flex-1" onClick={handleRegenerate} disabled={regenerating}>
                {regenerating && <Loader2 className="w-4 h-4 animate-spin mr-1" />}
                {fr ? 'Régénérer' : 'Regenerate'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dropdown menu */}
      {activeDropdown && dropdownPos && (() => {
        const plan = plans.find(p => p.id === activeDropdown);
        if (!plan) return null;
        return (
          <>
            <div className="fixed inset-0 z-40" onClick={() => { setActiveDropdown(null); setDropdownPos(null); }} />
            <div
              className="fixed w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-1"
              style={{ top: dropdownPos.top, left: dropdownPos.left }}
            >
              <button
                onClick={() => { window.open(`/business-plan/${plan.id}/preview`, '_blank'); setActiveDropdown(null); setDropdownPos(null); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <Eye className="w-4 h-4" /> {fr ? 'Aperçu' : 'Preview'}
              </button>
              {plan.organizationId && (
                <button
                  onClick={() => { navigate(`/admin/organizations/${plan.organizationId}`); setActiveDropdown(null); setDropdownPos(null); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <ExternalLink className="w-4 h-4" /> {fr ? 'Voir l\'organisation' : 'View Organization'}
                </button>
              )}
              <hr className="my-1 border-gray-200 dark:border-gray-700" />
              <button
                onClick={() => { setRegenerateModalPlan(plan); setActiveDropdown(null); setDropdownPos(null); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <RotateCcw className="w-4 h-4 text-orange-500" /> {fr ? 'Régénérer' : 'Regenerate'}
              </button>
              <button
                onClick={() => { setDeleteModalPlan(plan); setActiveDropdown(null); setDropdownPos(null); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="w-4 h-4" /> {fr ? 'Supprimer' : 'Delete'}
              </button>
            </div>
          </>
        );
      })()}
    </div>
  );
}
