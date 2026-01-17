import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import {
  Plus,
  FileText,
  Trash2,
  Copy,
  Calendar,
  Clock,
  ArrowRight,
  AlertTriangle,
  X,
  Sparkles,
  Zap,
  Target,
  BarChart3
} from 'lucide-react';
import { businessPlanService } from '../lib/business-plan-service';
import { BusinessPlan } from '../lib/types';
import { useTheme } from '../contexts/ThemeContext';
import DashboardTour from '../components/DashboardTour';

export default function DashboardPage() {
  const { t, theme } = useTheme();
  const [plans, setPlans] = useState<BusinessPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
  const [duplicatingPlanId, setDuplicatingPlanId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<BusinessPlan | null>(null);
  const [hoveredPlanId, setHoveredPlanId] = useState<string | null>(null);

  // Landing page color theme
  const strategyBlue = '#1A2B47';
  const momentumOrange = '#FF6B00';
  const momentumOrangeHover = '#E55F00';
  const lightAIGrey = '#F4F7FA';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const plansData = await businessPlanService.getBusinessPlans();
      const activePlans = plansData.filter((plan: any) => !plan.isDeleted);
      setPlans(activePlans);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (plan: BusinessPlan) => {
    setPlanToDelete(plan);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!planToDelete) return;

    try {
      setDeletingPlanId(planToDelete.id);
      await businessPlanService.deleteBusinessPlan(planToDelete.id);
      await loadDashboardData();
      setShowDeleteModal(false);
      setPlanToDelete(null);
    } catch (error: any) {
      console.error('Failed to delete plan:', error);
      alert(`Failed to delete plan: ${error.message}`);
    } finally {
      setDeletingPlanId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setPlanToDelete(null);
  };

  const handleDuplicatePlan = async (planId: string) => {
    try {
      setDuplicatingPlanId(planId);
      const duplicatedPlan = await businessPlanService.duplicateBusinessPlan(planId);
      setPlans([...plans, duplicatedPlan]);
    } catch (error: any) {
      console.error('Failed to duplicate plan:', error);
      alert(`Failed to duplicate plan: ${error.message}`);
    } finally {
      setDuplicatingPlanId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 rounded-full dark:border-gray-700" style={{ borderColor: theme === 'dark' ? undefined : lightAIGrey }}></div>
            <div className="absolute inset-0 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: momentumOrange }}></div>
          </div>
          <p className="font-medium dark:text-gray-200" style={{ color: theme === 'dark' ? undefined : strategyBlue }}>{t('dashboard.loading')}</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      name: t('dashboard.totalPlans'),
      value: plans.length,
      icon: FileText,
      iconBg: strategyBlue,
      bgColor: lightAIGrey,
    },
    {
      name: t('dashboard.activePlans'),
      value: plans.filter(p => p.status === 'active' || !p.status).length,
      icon: Target,
      iconBg: momentumOrange,
      bgColor: lightAIGrey,
    },
    {
      name: t('dashboard.recentPlans'),
      value: plans.filter(p => {
        if (!p.createdAt) return false;
        const created = new Date(p.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return created > weekAgo;
      }).length,
      icon: Zap,
      iconBg: strategyBlue,
      bgColor: lightAIGrey,
    },
    {
      name: t('dashboard.completionRate'),
      value: plans.length > 0 ? Math.round((plans.filter(p => p.status === 'Completed').length / plans.length) * 100) : 0,
      icon: BarChart3,
      iconBg: momentumOrange,
      bgColor: lightAIGrey,
      suffix: '%'
    }
  ];

  const getStatusColor = (status: string | undefined) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'active':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'draft':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'inprogress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getStatusLabel = (status: string | undefined) => {
    if (!status) return status;
    const statusLower = status.toLowerCase();
    switch (statusLower) {
      case 'draft':
        return t('dashboard.status.draft');
      case 'completed':
        return t('dashboard.status.completed');
      case 'active':
        return t('dashboard.status.active');
      case 'inprogress':
        return t('dashboard.status.inProgress');
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <SEO
        title={t('dashboard.title') || 'Dashboard | Sqordia'}
        description={t('dashboard.description') || 'Manage your business plans and projects'}
        noindex={true}
        nofollow={true}
      />
      <div className="relative z-10 space-y-8 p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-10 dashboard-header">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl lg:text-5xl font-bold mb-3 dark:text-white" style={{ color: theme === 'dark' ? undefined : strategyBlue }}>
                {t('dashboard.welcome')}
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                {t('dashboard.subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  localStorage.removeItem('dashboardTourCompleted');
                  (window as any).startDashboardTour?.();
                }}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                title="Show tour guide"
              >
                <Sparkles size={18} />
                <span className="text-sm">{t('dashboard.showTour')}</span>
              </button>
              <Link
                to="/create-plan"
                className="hidden sm:flex items-center gap-2 px-6 py-3 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                style={{ backgroundColor: momentumOrange }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = momentumOrangeHover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = momentumOrange}
              >
                <Plus size={20} />
                <span>{t('dashboard.newPlan')}</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 dashboard-stats">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.name}
                className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 p-6 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-lg" style={{ backgroundColor: stat.iconBg }}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                    {stat.name}
                  </p>
                  <p className="text-3xl font-bold dark:text-white" style={{ color: theme === 'dark' ? undefined : strategyBlue }}>
                    {stat.value}{stat.suffix || ''}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Create New Plan Card */}
        <Link
          to="/create-plan"
          className="block group relative overflow-hidden rounded-lg p-8 lg:p-12 shadow-md hover:shadow-lg transition-all duration-300 border-2 dashboard-create-card"
          style={{ 
            backgroundColor: strategyBlue,
            borderColor: momentumOrange
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-lg flex items-center justify-center" style={{ backgroundColor: momentumOrange }}>
                <Sparkles className="text-white" size={32} />
              </div>
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                  {t('dashboard.createNextPlan')}
                </h3>
                <p className="text-gray-300 text-lg">
                  {t('dashboard.createNextPlanDesc')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white font-semibold hidden sm:inline">{t('dashboard.getStarted')}</span>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ backgroundColor: momentumOrange }}>
                <ArrowRight className="text-white" size={24} />
              </div>
            </div>
          </div>
        </Link>

        {/* Business Plans Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden dashboard-plans">
          <div className="px-6 lg:px-8 py-6 border-b-2 border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1 dark:text-white" style={{ color: theme === 'dark' ? undefined : strategyBlue }}>
                  {t('dashboard.yourPlans')}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {plans.length} {plans.length === 1 ? t('dashboard.plan') : t('dashboard.plansTotal')}
                </p>
              </div>
            </div>
          </div>

          {plans.length === 0 ? (
            <div className="text-center py-16 px-6">
              <div className="w-24 h-24 rounded-lg flex items-center justify-center mx-auto mb-6 dark:bg-gray-700" style={{ backgroundColor: lightAIGrey }}>
                <FileText size={40} className="dark:text-gray-300" style={{ color: strategyBlue }} />
              </div>
              <h3 className="text-2xl font-bold mb-3 dark:text-white" style={{ color: theme === 'dark' ? undefined : strategyBlue }}>
                {t('dashboard.noPlans')}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto text-lg">
                {t('dashboard.noPlansDesc')}
              </p>
              <Link
                to="/create-plan"
                className="inline-flex items-center gap-3 px-6 sm:px-8 py-4 text-white rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 min-h-[44px] text-sm sm:text-base"
                style={{ backgroundColor: momentumOrange }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = momentumOrangeHover}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = momentumOrange}
              >
                <Plus size={22} />
                <span>{t('dashboard.createFirstPlan')}</span>
              </Link>
            </div>
          ) : (
            <div className="divide-y-2 divide-gray-200 dark:divide-gray-700">
              {plans.map((plan, index) => (
                <div
                  key={plan.id}
                  className="group relative p-6 lg:p-8 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-all duration-300"
                  onMouseEnter={() => setHoveredPlanId(plan.id)}
                  onMouseLeave={() => setHoveredPlanId(null)}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex-1 min-w-0 flex items-start gap-6">
                      {/* Icon */}
                      <div className="relative flex-shrink-0 w-14 h-14 rounded-lg shadow-sm flex items-center justify-center" style={{ backgroundColor: strategyBlue }}>
                        <FileText className="text-white" size={24} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold mb-2 truncate transition-colors dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400" style={{ color: theme === 'dark' ? undefined : strategyBlue }}>
                              {plan.title || 'Untitled Plan'}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                              {plan.description || t('dashboard.noDescription')}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          {plan.status && (
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${getStatusColor(plan.status)}`}>
                              {getStatusLabel(plan.status)}
                            </span>
                          )}
                          {plan.businessType && (
                            <span className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium">
                              {plan.businessType}
                            </span>
                          )}
                          {plan.createdAt && (
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <Calendar size={14} />
                              <span>{new Date(plan.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className={`flex items-center gap-2 transition-all duration-300 ${
                      hoveredPlanId === plan.id ? 'opacity-100 translate-x-0' : 'opacity-0 lg:opacity-100 translate-x-2 lg:translate-x-0'
                    }`}>
                      <Link
                        to={`/plans/${plan.id}`}
                        className="inline-flex items-center gap-2 px-5 py-3 md:py-2.5 text-white text-sm rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 min-h-[44px]"
                        style={{ backgroundColor: momentumOrange }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = momentumOrangeHover}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = momentumOrange}
                      >
                        <span>{t('dashboard.view')}</span>
                        <ArrowRight size={16} />
                      </Link>
                      <div className="relative flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDuplicatePlan(plan.id);
                          }}
                          disabled={duplicatingPlanId === plan.id}
                          className="p-3 md:p-2.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 flex items-center justify-center"
                          title="Duplicate plan"
                        >
                          <Copy size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(plan);
                          }}
                          disabled={deletingPlanId === plan.id}
                          className="p-3 md:p-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 flex items-center justify-center"
                          title="Delete plan"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Hover border effect */}
                  <div className="absolute inset-x-0 bottom-0 h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" style={{ backgroundColor: momentumOrange }}></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && planToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-0 md:p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-800 rounded-none md:rounded-lg shadow-2xl max-w-md w-full h-full md:h-auto transform transition-all animate-in zoom-in-95 duration-200 border-2 border-gray-200 dark:border-gray-700">
            <div className="p-6 lg:p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                    <AlertTriangle className="text-red-600 dark:text-red-400" size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {t('dashboard.deletePlan')}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {t('dashboard.deleteWarning')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDeleteCancel}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  disabled={deletingPlanId === planToDelete.id}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="mb-8">
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  {t('dashboard.deleteConfirm')}
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                  "{planToDelete.title || 'Untitled Plan'}"?
                </p>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                    ⚠️ {t('dashboard.deleteWarning')}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={handleDeleteCancel}
                  disabled={deletingPlanId === planToDelete.id}
                  className="px-6 py-3 md:py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                >
                  {t('dashboard.cancel')}
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deletingPlanId === planToDelete.id}
                  className="px-6 py-3 md:py-2.5 bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md hover:shadow-lg min-h-[44px]"
                >
                  {deletingPlanId === planToDelete.id ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>{t('dashboard.deleting')}</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={18} />
                      <span>{t('dashboard.deletePlanButton')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Tour */}
      <DashboardTour />
    </div>
  );
}
