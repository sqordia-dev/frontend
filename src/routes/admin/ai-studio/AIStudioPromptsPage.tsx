import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Plus,
  ChevronDown,
  ArrowLeft,
  Clock,
  CheckCircle,
  Loader2,
  FileText,
  LayoutGrid,
  List,
  Filter,
  Star,
  TrendingUp,
} from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import { promptRegistryService } from '../../../lib/prompt-registry-service';
import { DeploymentBadge } from '../../../components/admin/prompt-registry';
import { cn } from '../../../lib/utils';
import type {
  PromptTemplateListDto,
  PromptRegistryFilter,
  SectionType,
  BusinessPlanType,
} from '../../../types/prompt-registry';
import {
  SECTION_TYPE_OPTIONS,
  BUSINESS_PLAN_TYPE_OPTIONS,
} from '../../../types/prompt-registry';

type ViewMode = 'grid' | 'list';

// Color mapping for sections
const getSectionColor = (section: string) => {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    'ExecutiveSummary': { bg: 'bg-blue-50 dark:bg-blue-950', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800' },
    'CompanyOverview': { bg: 'bg-purple-50 dark:bg-purple-950', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800' },
    'MarketAnalysis': { bg: 'bg-emerald-50 dark:bg-emerald-950', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800' },
    'ProductsServices': { bg: 'bg-amber-50 dark:bg-amber-950', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800' },
    'MarketingStrategy': { bg: 'bg-pink-50 dark:bg-pink-950', text: 'text-pink-700 dark:text-pink-300', border: 'border-pink-200 dark:border-pink-800' },
    'OperationsPlan': { bg: 'bg-cyan-50 dark:bg-cyan-950', text: 'text-cyan-700 dark:text-cyan-300', border: 'border-cyan-200 dark:border-cyan-800' },
    'FinancialProjections': { bg: 'bg-green-50 dark:bg-green-950', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' },
  };
  return colors[section] || { bg: 'bg-zinc-50 dark:bg-zinc-800', text: 'text-zinc-700 dark:text-zinc-300', border: 'border-zinc-200 dark:border-zinc-700' };
};

const formatTimeAgo = (dateStr: string) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}mo ago`;
};

export function AIStudioPromptsPage() {
  const { language } = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [prompts, setPrompts] = useState<PromptTemplateListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSectionType, setFilterSectionType] = useState<SectionType | ''>('');
  const [filterPlanType, setFilterPlanType] = useState<BusinessPlanType | ''>('');
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [totalCount, setTotalCount] = useState(0);

  const t = {
    title: language === 'fr' ? 'Prompts Templates' : 'Prompt Templates',
    subtitle: language === 'fr'
      ? 'Gérez vos templates de prompts pour la génération de contenu'
      : 'Manage your prompt templates for content generation',
    search: language === 'fr' ? 'Rechercher...' : 'Search prompts...',
    newPrompt: language === 'fr' ? 'Nouveau Prompt' : 'New Prompt',
    allSections: language === 'fr' ? 'Toutes sections' : 'All Sections',
    allTypes: language === 'fr' ? 'Tous types' : 'All Types',
    activeOnly: language === 'fr' ? 'Actifs seulement' : 'Active only',
    noResults: language === 'fr' ? 'Aucun prompt trouvé' : 'No prompts found',
    tryAdjusting: language === 'fr' ? 'Essayez de modifier vos filtres' : 'Try adjusting your filters',
    back: language === 'fr' ? 'Retour à AI Studio' : 'Back to AI Studio',
  };

  const loadPrompts = useCallback(async () => {
    setLoading(true);
    try {
      const filter: PromptRegistryFilter = {
        pageSize: 100,
        search: searchTerm || undefined,
      };
      if (filterSectionType !== '') filter.sectionType = filterSectionType;
      if (filterPlanType !== '') filter.planType = filterPlanType;
      if (filterActiveOnly) filter.isActive = true;

      const result = await promptRegistryService.getAll(filter);
      setPrompts(result.items);
      setTotalCount(result.totalCount);
    } catch (err) {
      console.error('Error loading prompts:', err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filterSectionType, filterPlanType, filterActiveOnly]);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  // Check for action=new to open create dialog
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      // TODO: Open create prompt dialog
    }
  }, [searchParams]);

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-800 dark:via-slate-900 dark:to-black p-6 md:p-8"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
            backgroundSize: '24px 24px',
          }} />
        </div>

        {/* Gradient orbs */}
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              to="/admin/ai-studio"
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </Link>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">{t.title}</h1>
              <p className="text-slate-400 mt-1">{t.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20">
              <span className="text-sm font-medium text-blue-400">
                {totalCount} {language === 'fr' ? 'templates' : 'templates'}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
        <div className="p-4">
          {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="flex flex-wrap gap-2 items-center flex-1">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    placeholder={t.search}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-zinc-200 dark:border-zinc-700 rounded-lg bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>

                {/* Section Filter */}
                <div className="relative">
                  <select
                    value={filterSectionType}
                    onChange={e => setFilterSectionType(e.target.value === '' ? '' : Number(e.target.value) as SectionType)}
                    className="appearance-none pl-3 pr-8 py-2 text-sm font-medium border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer hover:border-orange-500/50 transition-colors"
                  >
                    <option value="">{t.allSections}</option>
                    {SECTION_TYPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>

                {/* Plan Type Filter */}
                <div className="relative">
                  <select
                    value={filterPlanType}
                    onChange={e => setFilterPlanType(e.target.value === '' ? '' : Number(e.target.value) as BusinessPlanType)}
                    className="appearance-none pl-3 pr-8 py-2 text-sm font-medium border border-zinc-200 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer hover:border-orange-500/50 transition-colors"
                  >
                    <option value="">{t.allTypes}</option>
                    {BUSINESS_PLAN_TYPE_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                </div>

                {/* Active Only Toggle */}
                <label className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filterActiveOnly}
                    onChange={e => setFilterActiveOnly(e.target.checked)}
                    className="w-4 h-4 text-orange-500 rounded border-zinc-300 focus:ring-orange-500"
                  />
                  <span className="text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                    {t.activeOnly}
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-2">
                {/* View Toggle */}
                <div className="flex items-center gap-1 p-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      'p-1.5 rounded-md transition-colors',
                      viewMode === 'grid' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    )}
                  >
                    <LayoutGrid className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      'p-1.5 rounded-md transition-colors',
                      viewMode === 'list' ? 'bg-white dark:bg-zinc-700 shadow-sm' : 'hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    )}
                  >
                    <List className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                  </button>
                </div>

                {/* New Prompt Button */}
                <button
                  onClick={() => navigate('/admin/ai-studio/prompts/new')}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-sm font-medium rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all shadow-lg shadow-orange-500/25"
                >
                  <Plus className="w-4 h-4" />
                  {t.newPrompt}
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Content */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : prompts.length === 0 ? (
          <div className="text-center py-20">
            <FileText className="w-16 h-16 mx-auto text-zinc-300 dark:text-zinc-600 mb-4" />
            <h3 className="text-lg font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              {t.noResults}
            </h3>
            <p className="text-sm text-zinc-500">{t.tryAdjusting}</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {prompts.map(prompt => {
              const sectionColor = getSectionColor(prompt.sectionTypeName);
              return (
                <motion.div
                  key={prompt.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  onClick={() => navigate(`/admin/ai-studio/prompts/${prompt.id}`)}
                  className="group bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 hover:shadow-lg hover:border-orange-500/50 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'px-2 py-0.5 text-[10px] font-semibold rounded-md border',
                        sectionColor.bg, sectionColor.text, sectionColor.border
                      )}>
                        {prompt.sectionTypeName}
                      </span>
                      <span className={cn(
                        'w-2 h-2 rounded-full',
                        prompt.isActive ? 'bg-green-500' : 'bg-zinc-300'
                      )} />
                    </div>
                    {prompt.alias && <DeploymentBadge alias={prompt.alias} size="sm" />}
                  </div>

                  <h3 className="font-medium text-zinc-900 dark:text-white mb-1 line-clamp-2 group-hover:text-orange-500 transition-colors">
                    {prompt.name}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-zinc-400 mb-3">
                    <span>{prompt.planTypeName}</span>
                    <span>v{prompt.version}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(prompt.updatedAt)}
                    </div>
                    {prompt.averageRating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        {prompt.averageRating.toFixed(1)}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          /* List View */
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-700">
                <tr>
                  <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-4 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Section</th>
                  <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-4 py-3 hidden md:table-cell">Type</th>
                  <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-4 py-3 hidden lg:table-cell">Status</th>
                  <th className="text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider px-4 py-3">Updated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {prompts.map(prompt => {
                  const sectionColor = getSectionColor(prompt.sectionTypeName);
                  return (
                    <tr
                      key={prompt.id}
                      onClick={() => navigate(`/admin/ai-studio/prompts/${prompt.id}`)}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className={cn('w-2 h-2 rounded-full flex-shrink-0', prompt.isActive ? 'bg-green-500' : 'bg-zinc-300')} />
                          <div>
                            <p className="font-medium text-zinc-900 dark:text-white text-sm">{prompt.name}</p>
                            <p className="text-xs text-zinc-500">v{prompt.version}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={cn('px-2 py-0.5 text-xs font-medium rounded', sectionColor.bg, sectionColor.text)}>
                          {prompt.sectionTypeName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400 hidden md:table-cell">
                        {prompt.planTypeName}
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {prompt.alias ? <DeploymentBadge alias={prompt.alias} size="sm" /> : <span className="text-xs text-zinc-400">—</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-zinc-500">
                        {formatTimeAgo(prompt.updatedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Count */}
        {!loading && prompts.length > 0 && (
          <div className="text-center text-sm text-zinc-500 mt-6">
            {language === 'fr' ? `${totalCount} prompts trouvés` : `${totalCount} prompts found`}
          </div>
        )}
      </div>
    </div>
  );
}

export default AIStudioPromptsPage;
