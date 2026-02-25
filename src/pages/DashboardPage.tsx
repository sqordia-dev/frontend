import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import {
  Plus,
  FileText,
  Sparkles,
  ArrowRight,
  FolderOpen,
} from 'lucide-react';
import { businessPlanService } from '../lib/business-plan-service';
import { BusinessPlan } from '../lib/types';
import { useToast } from '../contexts/ToastContext';
import { useCmsContent } from '../hooks/useCmsContent';
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
import { FadeIn, StaggerContainer, StaggerItem } from '@/components/ui/page-transition';

// Dashboard components
import { StatsCard } from '@/components/dashboard/StatsCard';
import { PlanCard } from '@/components/dashboard/PlanCard';

export default function DashboardPage() {
  const { getContent: cms } = useCmsContent('dashboard');
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
        <div className="space-y-8">
          {/* Header skeleton */}
          <div className="mb-10">
            <div className="h-12 w-64 bg-muted animate-pulse rounded-lg mb-3" />
            <div className="h-6 w-96 bg-muted animate-pulse rounded-lg" />
          </div>

          {/* Stats skeleton */}
          <div className="max-w-sm">
            <SkeletonStatsCard />
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

      <FadeIn>
        <div className="space-y-8">
          {/* Header Section */}
          <div className="mb-10 dashboard-header">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold tracking-tight mb-2 text-foreground">
                  {cms('dashboard.welcome', 'dashboard.welcome')}
                </h1>
                <p className="text-lg text-muted-foreground">
                  {cms('dashboard.subtitle', 'dashboard.subtitle')}
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
                  {cms('dashboard.showTour', 'dashboard.showTour')}
                </Button>
                <Button asChild variant="brand">
                  <Link to="/create-plan">
                    <Plus className="mr-2 h-4 w-4" />
                    {cms('dashboard.newPlan', 'dashboard.newPlan')}
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Project Count Card */}
          <div className="max-w-sm dashboard-stats">
            <StatsCard
              title={cms('dashboard.totalProjects', 'dashboard.totalProjects') || 'Total Projects'}
              value={plans.length}
              icon={<FolderOpen className="h-6 w-6" />}
            />
          </div>

          {/* Create New Plan Card */}
          <Card className="overflow-hidden dashboard-create-card group hover:shadow-card-hover transition-shadow border border-momentum-orange/30 rounded-xl bg-strategy-blue">
            <Link to="/create-plan" className="block">
              <CardContent className="p-8 lg:p-12">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl shrink-0 bg-momentum-orange">
                      <Sparkles className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl lg:text-3xl font-bold mb-1.5 text-white font-heading">
                        {cms('dashboard.createNextPlan', 'dashboard.createNextPlan')}
                      </h3>
                      <p className="text-base text-gray-300">
                        {cms('dashboard.createNextPlanDesc', 'dashboard.createNextPlanDesc')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold hidden sm:inline text-white">
                      {cms('dashboard.getStarted', 'dashboard.getStarted')}
                    </span>
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg shrink-0 bg-momentum-orange group-hover:bg-[#E55F00] transition-colors">
                      <ArrowRight className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Link>
          </Card>

          {/* Recent Projects Section */}
          <Card className="dashboard-plans">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">
                    {cms('dashboard.recentProjects', 'dashboard.recentProjects') || 'Recent Projects'}
                  </CardTitle>
                  <CardDescription>
                    {plans.length > 5
                      ? `Showing ${recentPlans.length} of ${plans.length} projects`
                      : `${plans.length} ${plans.length === 1 ? 'project' : 'projects'}`}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {recentPlans.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-muted mx-auto mb-6">
                    <FileText className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">
                    {cms('dashboard.noPlans', 'dashboard.noPlans')}
                  </h3>
                  <p className="text-muted-foreground mb-8 max-w-md mx-auto text-lg">
                    {cms('dashboard.noPlansDesc', 'dashboard.noPlansDesc')}
                  </p>
                  <Button asChild variant="brand" size="lg">
                    <Link to="/create-plan">
                      <Plus className="mr-2 h-5 w-5" />
                      {cms('dashboard.createFirstPlan', 'dashboard.createFirstPlan')}
                    </Link>
                  </Button>
                </div>
              ) : (
                <StaggerContainer className="divide-y">
                  {recentPlans.map((plan) => {
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
              {cms('dashboard.deletePlan', 'dashboard.deletePlan')}
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                {cms('dashboard.deleteConfirm', 'dashboard.deleteConfirm')} <strong>"{planToDelete?.title || 'Untitled Plan'}"</strong>?
              </p>
              <p className="text-destructive font-medium">
                {cms('dashboard.deleteWarning', 'dashboard.deleteWarning')}
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
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
