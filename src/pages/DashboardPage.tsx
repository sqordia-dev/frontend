import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import {
  Plus,
  FileText,
  Sparkles,
  Zap,
  Target,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import { businessPlanService } from '../lib/business-plan-service';
import { BusinessPlan } from '../lib/types';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../contexts/ToastContext';
import DashboardTour from '../components/DashboardTour';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Spinner } from '@/components/ui/spinner';
import { SkeletonStatsCard, SkeletonPlanCard } from '@/components/ui/skeleton';
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/page-transition';

// Dashboard components
import { StatsCard } from '@/components/dashboard/StatsCard';
import { PlanCard } from '@/components/dashboard/PlanCard';

export default function DashboardPage() {
  const { t } = useTheme();
  const toast = useToast();
  const [plans, setPlans] = useState<BusinessPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
  const [duplicatingPlanId, setDuplicatingPlanId] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [planToDelete, setPlanToDelete] = useState<BusinessPlan | null>(null);
  const [planProgress, setPlanProgress] = useState<Record<string, { isComplete: boolean; nextQuestionId?: string }>>({});

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const plansData = await businessPlanService.getBusinessPlans();
      const activePlans = plansData.filter((plan: BusinessPlan) => !plan.isDeleted);
      setPlans(activePlans);

      // Load progress for each plan to determine completion status
      const progressMap: Record<string, { isComplete: boolean; nextQuestionId?: string }> = {};
      for (const plan of activePlans) {
        try {
          const progress = await businessPlanService.getQuestionnaireProgress(plan.id);
          const progressData = progress?.value || progress;
          progressMap[plan.id] = {
            isComplete: progressData?.isComplete || progressData?.status === 'Completed' || plan.status === 'Completed',
            nextQuestionId: progressData?.unansweredQuestionIds?.[0]
          };
        } catch {
          progressMap[plan.id] = {
            isComplete: plan.status !== 'Draft' && plan.status !== 'draft'
          };
        }
      }
      setPlanProgress(progressMap);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (plan) {
      setPlanToDelete(plan);
      setShowDeleteModal(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!planToDelete || deletingPlanId) return;

    try {
      setDeletingPlanId(planToDelete.id);
      await businessPlanService.deleteBusinessPlan(planToDelete.id);
      await loadDashboardData();
      setShowDeleteModal(false);
      setPlanToDelete(null);
      toast.success(
        t('dashboard.deleteSuccess') || 'Plan deleted',
        t('dashboard.deleteSuccessDesc') || 'Your plan has been deleted successfully'
      );
    } catch (error: unknown) {
      console.error('Failed to delete plan:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast.error(t('dashboard.deleteError') || 'Failed to delete plan', errorMessage);
    } finally {
      setDeletingPlanId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setPlanToDelete(null);
  };

  const handleDuplicatePlan = async (planId: string) => {
    if (duplicatingPlanId) return;

    try {
      setDuplicatingPlanId(planId);
      const duplicatedPlan = await businessPlanService.duplicateBusinessPlan(planId);
      setPlans(prevPlans => [...prevPlans, duplicatedPlan]);
      toast.success(
        t('dashboard.duplicateSuccess') || 'Plan duplicated',
        t('dashboard.duplicateSuccessDesc') || 'Your plan has been duplicated successfully'
      );
    } catch (error: unknown) {
      console.error('Failed to duplicate plan:', error);
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      toast.error(t('dashboard.duplicateError') || 'Failed to duplicate plan', errorMessage);
    } finally {
      setDuplicatingPlanId(null);
    }
  };

  // Loading state with skeletons
  if (loading) {
    return (
      <div className="min-h-screen">
        <SEO
          title={t('dashboard.title') || 'Dashboard | Sqordia'}
          description={t('dashboard.description') || 'Manage your business plans and projects'}
          noindex={true}
          nofollow={true}
        />
        <div className="space-y-8">
          {/* Header skeleton */}
          <div className="mb-10">
            <div className="h-12 w-64 bg-muted animate-pulse rounded-lg mb-3" />
            <div className="h-6 w-96 bg-muted animate-pulse rounded-lg" />
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonStatsCard key={i} />
            ))}
          </div>

          {/* Plans skeleton */}
          <Card>
            <CardHeader>
              <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3].map((i) => (
                <SkeletonPlanCard key={i} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: t('dashboard.totalPlans'),
      value: plans.length,
      icon: <FileText className="h-6 w-6" />,
    },
    {
      title: t('dashboard.activePlans'),
      value: plans.filter(p => p.status === 'active' || !p.status).length,
      icon: <Target className="h-6 w-6" />,
    },
    {
      title: t('dashboard.recentPlans'),
      value: plans.filter(p => {
        if (!p.createdAt) return false;
        const created = new Date(p.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return created > weekAgo;
      }).length,
      icon: <Zap className="h-6 w-6" />,
    },
    {
      title: t('dashboard.completionRate'),
      value: plans.length > 0
        ? `${Math.round((plans.filter(p => p.status === 'Completed').length / plans.length) * 100)}%`
        : '0%',
      icon: <BarChart3 className="h-6 w-6" />,
    }
  ];

  return (
    <div className="min-h-screen">
      <SEO
        title={t('dashboard.title') || 'Dashboard | Sqordia'}
        description={t('dashboard.description') || 'Manage your business plans and projects'}
        noindex={true}
        nofollow={true}
      />

      <FadeIn>
        <div className="space-y-8">
          {/* Header Section */}
          <div className="mb-10 dashboard-header">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2">
                  {t('dashboard.welcome')}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {t('dashboard.subtitle')}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    localStorage.removeItem('dashboardTourCompleted');
                    (window as Window & { startDashboardTour?: () => void }).startDashboardTour?.();
                  }}
                  className="hidden sm:flex"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {t('dashboard.showTour')}
                </Button>
                <Button asChild variant="brand">
                  <Link to="/create-plan">
                    <Plus className="mr-2 h-4 w-4" />
                    {t('dashboard.newPlan')}
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Stats Cards Grid */}
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 dashboard-stats">
            {stats.map((stat) => (
              <StaggerItem key={stat.title}>
                <StatsCard
                  title={stat.title}
                  value={stat.value}
                  icon={stat.icon}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Create New Plan Card */}
          <Card className="bg-primary text-primary-foreground border-0 overflow-hidden dashboard-create-card group hover:shadow-lg transition-shadow">
            <Link to="/create-plan" className="block">
              <CardContent className="p-8 lg:p-12">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary-foreground/20">
                      <Sparkles className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="text-2xl lg:text-3xl font-bold mb-2">
                        {t('dashboard.createNextPlan')}
                      </h3>
                      <p className="text-primary-foreground/80 text-lg">
                        {t('dashboard.createNextPlanDesc')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold hidden sm:inline">
                      {t('dashboard.getStarted')}
                    </span>
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-foreground/20 group-hover:bg-primary-foreground/30 transition-colors">
                      <ArrowRight className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Business Plans Section */}
          <Card className="dashboard-plans">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    {t('dashboard.yourPlans')}
                  </CardTitle>
                  <CardDescription>
                    {plans.length} {plans.length === 1 ? t('dashboard.plan') : t('dashboard.plansTotal')}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {plans.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-muted mx-auto mb-6">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">
                    {t('dashboard.noPlans')}
                  </h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
                    {t('dashboard.noPlansDesc')}
                  </p>
                  <Button asChild variant="brand" size="lg">
                    <Link to="/create-plan">
                      <Plus className="mr-2 h-5 w-5" />
                      {t('dashboard.createFirstPlan')}
                    </Link>
                  </Button>
                </div>
              ) : (
                <StaggerContainer className="divide-y">
                  {plans.map((plan) => {
                    const progress = planProgress[plan.id];
                    return (
                      <StaggerItem key={plan.id} className="p-4 lg:p-6">
                        <PlanCard
                          id={plan.id}
                          title={plan.title}
                          description={plan.description}
                          status={plan.status}
                          businessType={plan.businessType}
                          createdAt={plan.createdAt}
                          isComplete={progress?.isComplete}
                          nextQuestionId={progress?.nextQuestionId}
                          onDelete={handleDeleteClick}
                          onDuplicate={handleDuplicatePlan}
                          isDeleting={deletingPlanId === plan.id}
                          isDuplicating={duplicatingPlanId === plan.id}
                          translations={{
                            resume: t('dashboard.resume'),
                            view: t('dashboard.view'),
                            noDescription: t('dashboard.noDescription'),
                            delete: t('dashboard.deletePlan'),
                            duplicate: t('dashboard.duplicatePlan'),
                            status: {
                              draft: t('dashboard.status.draft'),
                              completed: t('dashboard.status.completed'),
                              active: t('dashboard.status.active'),
                              inProgress: t('dashboard.status.inProgress'),
                            },
                          }}
                        />
                      </StaggerItem>
                    );
                  })}
                </StaggerContainer>
              )}
            </CardContent>
          </Card>
        </div>
      </FadeIn>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('dashboard.deletePlan')}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                {t('dashboard.deleteConfirm')} <strong>"{planToDelete?.title || 'Untitled Plan'}"</strong>?
              </p>
              <p className="text-destructive font-medium">
                {t('dashboard.deleteWarning')}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel} disabled={!!deletingPlanId}>
              {t('dashboard.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={!!deletingPlanId}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingPlanId ? (
                <>
                  <Spinner size="sm" variant="white" className="mr-2" />
                  {t('dashboard.deleting')}
                </>
              ) : (
                t('dashboard.deletePlanButton')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dashboard Tour */}
      <DashboardTour />
    </div>
  );
}
