import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import {
  Plus,
  FileText,
  Sparkles,
  ArrowRight,
  FolderOpen,
  Layers,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { businessPlanService } from '../lib/business-plan-service';
import { BusinessPlan } from '../lib/types';
import { useToast } from '../contexts/ToastContext';
import { useCmsContent } from '../hooks/useCmsContent';
import { useTheme } from '../contexts/ThemeContext';
import DashboardTour from '../components/DashboardTour';
import { getUserFriendlyError } from '../utils/error-messages';

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

// Dashboard components
import { StatsCard } from '@/components/dashboard/StatsCard';
import { PlanCard } from '@/components/dashboard/PlanCard';

export default function DashboardPage() {
  const { getContent: cms } = useCmsContent('dashboard');
  const { t, language } = useTheme();
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
        cms('dashboard.deleteSuccess', 'dashboard.deleteSuccess') || 'Plan deleted',
        cms('dashboard.deleteSuccessDesc', 'dashboard.deleteSuccessDesc') || 'Your plan has been deleted successfully'
      );
    } catch (error: unknown) {
      console.error('Failed to delete plan:', error);
      toast.error(cms('dashboard.deleteError', 'dashboard.deleteError') || 'Failed to delete plan', getUserFriendlyError(error, 'delete'));
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
        cms('dashboard.duplicateSuccess', 'dashboard.duplicateSuccess') || 'Plan duplicated',
        cms('dashboard.duplicateSuccessDesc', 'dashboard.duplicateSuccessDesc') || 'Your plan has been duplicated successfully'
      );
    } catch (error: unknown) {
      console.error('Failed to duplicate plan:', error);
      toast.error(cms('dashboard.duplicateError', 'dashboard.duplicateError') || 'Failed to duplicate plan', getUserFriendlyError(error, 'save'));
    } finally {
      setDuplicatingPlanId(null);
    }
  };

  // Calculate stats
  const draftCount = plans.filter(p => p.status?.toLowerCase() === 'draft' || !planProgress[p.id]?.isComplete).length;
  const completedCount = plans.filter(p => ['completed', 'generated', 'exported'].includes(p.status?.toLowerCase() || '')).length;
  const dateLocale = language === 'fr' ? 'fr-CA' : 'en-US';
  const recentActivity = plans.length > 0 ? new Date(Math.max(...plans.map(p => new Date(p.updatedAt || p.createdAt || 0).getTime()))).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' }) : null;

  // Loading state with skeletons
  if (loading) {
    return (
      <div className="min-h-screen">
        <SEO
          title={cms('dashboard.title', 'dashboard.title') || 'Dashboard | Sqordia'}
          description={cms('dashboard.description', 'dashboard.description') || 'Manage your business plans and projects'}
          noindex={true}
          nofollow={true}
        />
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Header skeleton */}
          <div className="space-y-3">
            <div className="h-10 w-72 bg-muted/60 animate-pulse rounded-lg" />
            <div className="h-5 w-96 bg-muted/40 animate-pulse rounded-lg" />
          </div>

          {/* Stats skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <SkeletonStatsCard key={i} />
            ))}
          </div>

          {/* CTA skeleton */}
          <div className="h-32 bg-muted/40 animate-pulse rounded-2xl" />

          {/* Plans skeleton */}
          <div className="space-y-4">
            <div className="h-8 w-48 bg-muted/60 animate-pulse rounded-lg" />
            {[1, 2, 3].map((i) => (
              <SkeletonPlanCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Sort plans by updatedAt or createdAt descending
  const sortedPlans = [...plans].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.createdAt || 0);
    const dateB = new Date(b.updatedAt || b.createdAt || 0);
    return dateB.getTime() - dateA.getTime();
  });

  // Show only last 5 recent projects
  const recentPlans = sortedPlans.slice(0, 5);

  return (
    <div className="min-h-screen">
      <SEO
        title={cms('dashboard.title', 'dashboard.title') || 'Dashboard | Sqordia'}
        description={cms('dashboard.description', 'dashboard.description') || 'Manage your business plans and projects'}
        noindex={true}
        nofollow={true}
      />

      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header Section */}
        <header className="dashboard-header">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-foreground font-heading">
                {cms('dashboard.welcome', 'dashboard.welcome')}
              </h1>
              <p className="text-base lg:text-lg text-muted-foreground max-w-xl">
                {cms('dashboard.subtitle', 'dashboard.subtitle')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  localStorage.removeItem('dashboardTourCompleted');
                  (window as Window & { startDashboardTour?: () => void }).startDashboardTour?.();
                }}
                className="hidden sm:inline-flex text-muted-foreground hover:text-foreground"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                {cms('dashboard.showTour', 'dashboard.showTour')}
              </Button>
              <Button asChild size="default" className="bg-momentum-orange hover:bg-momentum-orange/90 text-white shadow-md hover:shadow-lg transition-all duration-200">
                <Link to="/create-plan">
                  <Plus className="mr-2 h-4 w-4" />
                  {cms('dashboard.newPlan', 'dashboard.newPlan')}
                </Link>
              </Button>
            </div>
          </div>
        </header>

        {/* Stats Grid */}
        <section className="dashboard-stats grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title={cms('dashboard.totalProjects', 'dashboard.totalProjects') || t('dashboard.totalProjects')}
            value={plans.length}
            icon={<Layers className="h-5 w-5" />}
            variant="primary"
          />
          <StatsCard
            title={cms('dashboard.inProgress', 'dashboard.inProgress') || t('dashboard.inProgress')}
            value={draftCount}
            icon={<FolderOpen className="h-5 w-5" />}
            variant="default"
          />
          <StatsCard
            title={cms('dashboard.completed', 'dashboard.completed') || t('dashboard.completed')}
            value={completedCount}
            icon={<TrendingUp className="h-5 w-5" />}
            variant="success"
          />
          <StatsCard
            title={cms('dashboard.lastActivity', 'dashboard.lastActivity') || t('dashboard.lastActivity')}
            value={recentActivity || '—'}
            icon={<Clock className="h-5 w-5" />}
            variant="default"
          />
        </section>

        {/* Create New Plan Card - Premium CTA */}
        <section className="dashboard-create-card">
          <Link to="/create-plan" className="group block">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-strategy-blue via-strategy-blue to-[#0f1a2e] p-8 lg:p-10 transition-all duration-300 hover:shadow-xl hover:shadow-strategy-blue/20">
              {/* Subtle grid pattern overlay */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />

              {/* Gradient orb accent */}
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-momentum-orange/20 blur-3xl transition-all duration-500 group-hover:bg-momentum-orange/30" />

              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-momentum-orange shadow-lg shadow-momentum-orange/30 transition-transform duration-300 group-hover:scale-105">
                    <Sparkles className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl lg:text-2xl font-bold text-white font-heading tracking-tight">
                      {cms('dashboard.createNextPlan', 'dashboard.createNextPlan')}
                    </h3>
                    <p className="text-sm lg:text-base text-white/70 mt-1">
                      {cms('dashboard.createNextPlanDesc', 'dashboard.createNextPlanDesc')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:ml-auto">
                  <span className="text-sm font-medium text-white/80 hidden sm:inline">
                    {cms('dashboard.getStarted', 'dashboard.getStarted')}
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/10 transition-all duration-300 group-hover:bg-momentum-orange group-hover:border-momentum-orange group-hover:scale-110">
                    <ArrowRight className="h-4 w-4 text-white transition-transform duration-300 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </section>

        {/* Recent Projects Section */}
        <section className="dashboard-plans space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold tracking-tight text-foreground">
                {cms('dashboard.recentProjects', 'dashboard.recentProjects') || t('dashboard.recentProjects')}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                {plans.length > 5
                  ? t('dashboard.showingProjects').replace('{shown}', String(recentPlans.length)).replace('{total}', String(plans.length))
                  : plans.length === 1
                    ? t('dashboard.projectCount').replace('{count}', String(plans.length))
                    : t('dashboard.projectsCount').replace('{count}', String(plans.length))}
              </p>
            </div>
            {plans.length > 5 && (
              <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                <Link to="/projects">
                  {t('dashboard.viewAll')}
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            )}
          </div>

          {recentPlans.length === 0 ? (
            /* Empty State */
            <Card className="border-dashed border-2 bg-muted/30">
              <CardContent className="flex flex-col items-center justify-center py-16 px-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-muted mb-6">
                  <FileText className="h-8 w-8 text-muted-foreground/60" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-foreground">
                  {cms('dashboard.noPlans', 'dashboard.noPlans')}
                </h3>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto text-center text-sm">
                  {cms('dashboard.noPlansDesc', 'dashboard.noPlansDesc')}
                </p>
                <Button asChild size="lg" className="bg-momentum-orange hover:bg-momentum-orange/90 text-white">
                  <Link to="/create-plan">
                    <Plus className="mr-2 h-5 w-5" />
                    {cms('dashboard.createFirstPlan', 'dashboard.createFirstPlan')}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {recentPlans.map((plan, index) => {
                const progress = planProgress[plan.id];
                return (
                  <div
                    key={plan.id}
                    className="animate-in fade-in slide-in-from-bottom-2 duration-300"
                    style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'backwards' }}
                  >
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
                        resume: cms('dashboard.resume', 'dashboard.resume'),
                        view: cms('dashboard.view', 'dashboard.view'),
                        viewPlan: cms('dashboard.viewPlan', 'dashboard.viewPlan'),
                        noDescription: cms('dashboard.noDescription', 'dashboard.noDescription'),
                        delete: cms('dashboard.deletePlan', 'dashboard.deletePlan'),
                        duplicate: cms('dashboard.duplicatePlan', 'dashboard.duplicatePlan'),
                        status: {
                          draft: cms('dashboard.status.draft', 'dashboard.status.draft'),
                          completed: cms('dashboard.status.completed', 'dashboard.status.completed'),
                          active: cms('dashboard.status.active', 'dashboard.status.active'),
                          inProgress: cms('dashboard.status.inProgress', 'dashboard.status.inProgress'),
                          generating: cms('dashboard.status.generating', 'dashboard.status.generating'),
                          generated: cms('dashboard.status.generated', 'dashboard.status.generated'),
                          exported: cms('dashboard.status.exported', 'dashboard.status.exported'),
                        },
                      }}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg">
              {cms('dashboard.deletePlan', 'dashboard.deletePlan')}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 text-sm">
              <p>
                {cms('dashboard.deleteConfirm', 'dashboard.deleteConfirm')} <span className="font-medium text-foreground">"{planToDelete?.title || 'Untitled Plan'}"</span>?
              </p>
              <p className="text-destructive font-medium">
                {cms('dashboard.deleteWarning', 'dashboard.deleteWarning')}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel onClick={handleDeleteCancel} disabled={!!deletingPlanId}>
              {cms('dashboard.cancel', 'dashboard.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={!!deletingPlanId}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletingPlanId ? (
                <>
                  <Spinner size="sm" variant="white" className="mr-2" />
                  {cms('dashboard.deleting', 'dashboard.deleting')}
                </>
              ) : (
                cms('dashboard.deletePlanButton', 'dashboard.deletePlanButton')
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
