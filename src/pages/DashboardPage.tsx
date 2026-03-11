import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import {
  Plus,
  Sparkles,
  ArrowRight,
  FolderOpen,
  Layers,
  TrendingUp,
  Clock,
  X,
  ClipboardList,
  Wand2,
  Download,
  Check,
  FileText,
  PlusCircle,
} from 'lucide-react';
import { businessPlanService } from '../lib/business-plan-service';
import { organizationService } from '../lib/organization-service';
import { authService } from '../lib/auth-service';
import { BusinessPlan, User } from '../lib/types';
import { useToast } from '../contexts/ToastContext';
import { useCmsContent } from '../hooks/useCmsContent';
import { useTheme } from '../contexts/ThemeContext';
import DashboardTour from '../components/DashboardTour';
import ProfileCompletionBanner from '../components/ProfileCompletionBanner';
import { getUserFriendlyError } from '../utils/error-messages';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

// ── Getting Started Checklist Component ──────────────────────────────────────

type StepStatus = 'pending' | 'active' | 'done';

interface GettingStartedChecklistProps {
  userName?: string;
  stepStatuses: [StepStatus, StepStatus, StepStatus];
  ctaHref: string;
  ctaLabel: string;
  t: (key: string) => string;
}

function GettingStartedChecklist({ userName, stepStatuses, ctaHref, ctaLabel, t }: GettingStartedChecklistProps) {
  const steps = [
    {
      icon: ClipboardList,
      titleKey: 'dashboard.gettingStarted.step1.title',
      descKey: 'dashboard.gettingStarted.step1.description',
    },
    {
      icon: Wand2,
      titleKey: 'dashboard.gettingStarted.step2.title',
      descKey: 'dashboard.gettingStarted.step2.description',
    },
    {
      icon: Download,
      titleKey: 'dashboard.gettingStarted.step3.title',
      descKey: 'dashboard.gettingStarted.step3.description',
    },
  ];

  const welcomeText = userName
    ? t('dashboard.gettingStarted.welcomeUser').replace('{name}', userName)
    : t('dashboard.gettingStarted.welcome');

  return (
    <Card className="relative overflow-hidden border-0 shadow-lg dark:shadow-gray-900/50">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-white to-blue-50 dark:from-orange-950/20 dark:via-background dark:to-blue-950/20" />
      {/* Decorative accent orb */}
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-momentum-orange/10 dark:bg-momentum-orange/5 blur-3xl" />
      <div className="absolute -left-16 -bottom-16 h-48 w-48 rounded-full bg-strategy-blue/10 dark:bg-strategy-blue/5 blur-3xl" />

      <CardContent className="relative p-6 sm:p-8 lg:p-10">
        {/* Header */}
        <div className="text-center mb-8 lg:mb-10">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-momentum-orange shadow-lg shadow-momentum-orange/20 dark:shadow-momentum-orange/15 mb-4">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h3 className="text-2xl lg:text-3xl font-bold tracking-tight text-foreground font-heading">
            {welcomeText}
          </h3>
          <p className="text-base text-muted-foreground mt-2 max-w-md mx-auto">
            {t('dashboard.gettingStarted.subtitle')}
          </p>
        </div>

        {/* Steps - Horizontal on tablet+, vertical on mobile */}
        <div className="relative max-w-3xl mx-auto mb-8 lg:mb-10">
          {/* Connecting line - horizontal on md+, vertical on mobile */}
          <div className="hidden md:block absolute top-6 left-[calc(16.67%+14px)] right-[calc(16.67%+14px)] h-0.5 bg-gradient-to-r from-muted-foreground/20 via-muted-foreground/20 to-muted-foreground/20">
            <div
              className="h-full bg-momentum-orange transition-all duration-700"
              style={{
                width: stepStatuses[2] === 'done' ? '100%' :
                       stepStatuses[1] !== 'pending' ? '50%' :
                       stepStatuses[0] !== 'pending' ? '0%' : '0%',
              }}
            />
          </div>
          <div className="md:hidden absolute top-0 bottom-0 left-6 w-0.5 bg-muted-foreground/20">
            <div
              className="w-full bg-momentum-orange transition-all duration-700"
              style={{
                height: stepStatuses[2] === 'done' ? '100%' :
                        stepStatuses[1] !== 'pending' ? '66%' :
                        stepStatuses[0] !== 'pending' ? '33%' : '0%',
              }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-4">
            {steps.map((step, index) => {
              const status = stepStatuses[index];
              const StepIcon = step.icon;
              const isDone = status === 'done';
              const isActive = status === 'active';

              return (
                <div
                  key={index}
                  className="relative flex md:flex-col items-start md:items-center gap-4 md:gap-3 text-left md:text-center animate-in fade-in slide-in-from-bottom-2 duration-500"
                  style={{ animationDelay: `${index * 150}ms`, animationFillMode: 'backwards' }}
                >
                  {/* Step circle */}
                  <div
                    className={`
                      relative z-10 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full
                      border-2 transition-all duration-300
                      ${isDone
                        ? 'border-green-500 bg-green-500 text-white shadow-md shadow-green-500/25 dark:shadow-green-500/15'
                        : isActive
                        ? 'border-momentum-orange bg-momentum-orange text-white shadow-md shadow-momentum-orange/25 dark:shadow-momentum-orange/15 animate-pulse'
                        : 'border-muted-foreground/30 bg-background text-muted-foreground'
                      }
                    `}
                  >
                    {isDone ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <StepIcon className="h-5 w-5" />
                    )}
                  </div>

                  {/* Step content */}
                  <div className="flex-1 md:flex-initial min-w-0">
                    <div className="flex items-center gap-2 md:justify-center mb-0.5">
                      <span className={`
                        text-xs font-semibold uppercase tracking-wider
                        ${isDone ? 'text-green-600 dark:text-green-400' :
                          isActive ? 'text-momentum-orange' :
                          'text-muted-foreground/60'}
                      `}>
                        {isDone
                          ? t('dashboard.gettingStarted.stepStatus.done')
                          : isActive
                          ? t('dashboard.gettingStarted.stepStatus.active')
                          : t('dashboard.gettingStarted.stepStatus.pending')}
                      </span>
                    </div>
                    <h4 className={`
                      text-sm font-semibold leading-tight
                      ${isDone ? 'text-foreground/70 line-through decoration-green-500/50' :
                        isActive ? 'text-foreground' :
                        'text-foreground/80'}
                    `}>
                      {t(step.titleKey)}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {t(step.descKey)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center space-y-3">
          <Button
            asChild
            size="lg"
            variant="brand" className="text-base px-8 py-6 h-auto"
          >
            <Link to={ctaHref}>
              <Plus className="mr-2 h-5 w-5" />
              {ctaLabel}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <p className="text-xs text-muted-foreground">
            {t('dashboard.gettingStarted.freeNote')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Dashboard Page ──────────────────────────────────────────────────────

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
  const [planProgress, setPlanProgress] = useState<Record<string, { isComplete: boolean; nextQuestionId?: string; completionPercentage?: number }>>({});
  const [dismissedBanner, setDismissedBanner] = useState(false);
  const [showAllPlans, setShowAllPlans] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [quickCreateName, setQuickCreateName] = useState('');
  const [quickCreateLoading, setQuickCreateLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
    authService.getCurrentUser().then(setUser).catch(() => {});
  }, []);

  // Auto-refresh when any plan is generating
  useEffect(() => {
    const hasGenerating = plans.some(p =>
      p.status?.toLowerCase() === 'generating'
    );
    if (!hasGenerating) return;

    const interval = setInterval(() => {
      loadDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, [plans]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const plansData = await businessPlanService.getBusinessPlans();
      const activePlans = plansData.filter((plan: BusinessPlan) => !plan.isDeleted);
      setPlans(activePlans);

      // Load progress for all plans in parallel
      const progressMap: Record<string, { isComplete: boolean; nextQuestionId?: string; completionPercentage?: number }> = {};
      const progressResults = await Promise.allSettled(
        activePlans.map(async (plan) => {
          const progress = await businessPlanService.getQuestionnaireProgress(plan.id);
          const progressData = progress?.value || progress;
          return {
            planId: plan.id,
            isComplete: progressData?.isComplete || progressData?.status === 'Completed' || plan.status === 'Completed' || plan.status === 'Generated',
            nextQuestionId: progressData?.unansweredQuestionIds?.[0],
            completionPercentage: progressData?.completionPercentage ?? undefined,
          };
        })
      );
      progressResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          progressMap[result.value.planId] = result.value;
        } else {
          const plan = activePlans[index];
          progressMap[plan.id] = {
            isComplete: plan.status !== 'Draft' && plan.status !== 'draft',
          };
        }
      });
      setPlanProgress(progressMap);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickCreate = async () => {
    if (!quickCreateName.trim()) return;
    setQuickCreateLoading(true);
    try {
      // Get or create org
      let orgId: string;
      const orgs = await organizationService.getOrganizations();
      if (orgs.length > 0) {
        orgId = orgs[0].id;
      } else {
        const newOrg = await organizationService.createOrganization({
          name: 'My Organization',
          organizationType: 'Startup',
        });
        orgId = newOrg.id;
      }
      const userPersona = localStorage.getItem('userPersona') as 'entrepreneur' | 'consultant' | 'obnl' | null;
      const planType = userPersona === 'obnl' ? 'StrategicPlan' : 'BusinessPlan';
      const persona = userPersona ? userPersona.charAt(0).toUpperCase() + userPersona.slice(1) : 'Entrepreneur';
      const plan = await businessPlanService.createBusinessPlan({
        title: quickCreateName.trim(),
        planType,
        organizationId: orgId,
        persona: persona as 'Entrepreneur' | 'Consultant' | 'OBNL',
      });
      setShowQuickCreate(false);
      setQuickCreateName('');
      navigate(`/interview/${plan.id}`);
    } catch (error: any) {
      toast.error(getUserFriendlyError(error, 'save'));
    } finally {
      setQuickCreateLoading(false);
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
      toast.error(cms('dashboard.deleteError', 'dashboard.deleteError') || 'Failed to delete plan', getUserFriendlyError(error, 'delete', language));
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
      toast.error(cms('dashboard.duplicateError', 'dashboard.duplicateError') || 'Failed to duplicate plan', getUserFriendlyError(error, 'save', language));
    } finally {
      setDuplicatingPlanId(null);
    }
  };

  // Local calculations for stats
  const totalPlans = plans.length;
  const draftCount = plans.filter(p => p.status?.toLowerCase() === 'draft' || !planProgress[p.id]?.isComplete).length;
  const completedCount = plans.filter(p => ['completed', 'generated', 'exported'].includes(p.status?.toLowerCase() || '')).length;
  const dateLocale = language === 'fr' ? 'fr-CA' : 'en-US';

  // Get the most recent activity date from local plans
  const recentActivity = (() => {
    const validDates = plans
      .map(p => new Date(p.updatedAt || p.createdAt || 0).getTime())
      .filter(time => time > 86400000);
    return validDates.length > 0
      ? new Date(Math.max(...validDates)).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' })
      : null;
  })();

  // Find the most recent draft/incomplete plan for the "continue" banner
  const mostRecentDraft = (() => {
    const drafts = plans
      .filter(p => {
        const status = p.status?.toLowerCase();
        // Only show banner for plans still in draft — not generated/completed/exported
        return status === 'draft';
      })
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
        const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
        return dateB - dateA;
      });
    return drafts.length > 0 ? drafts[0] : null;
  })();

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

  // Show only last 5 recent projects, or all if expanded
  const recentPlans = showAllPlans ? sortedPlans : sortedPlans.slice(0, 5);

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
              <Button size="default" className="bg-momentum-orange hover:bg-momentum-orange/90 text-white shadow-md hover:shadow-lg dark:shadow-gray-900/40 dark:hover:shadow-gray-900/60 transition-all duration-200" onClick={() => setShowQuickCreate(true)}>
                <Plus className="mr-2 h-4 w-4" />
                {cms('dashboard.newPlan', 'dashboard.newPlan')}
              </Button>
            </div>
          </div>
        </header>

        {/* Continue Where You Left Off Banner */}
        {mostRecentDraft && !dismissedBanner && (
          <section className="animate-in fade-in slide-in-from-top-2 duration-400">
            <div className="relative rounded-xl border-l-4 border-l-orange-500 dark:border-l-orange-400 bg-orange-50 dark:bg-orange-900/10 p-4 sm:p-5 shadow-sm dark:shadow-gray-900/30">
              <button
                onClick={() => setDismissedBanner(true)}
                className="absolute top-3 right-3 p-1 rounded-md text-orange-400 dark:text-orange-500 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors"
                aria-label={t('dashboard.dismiss')}
              >
                <X className="h-4 w-4" />
              </button>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 pr-8">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-300 mb-1">
                    {t('dashboard.continueBanner.title')}
                  </p>
                  <p className="text-base font-bold text-foreground truncate">
                    {mostRecentDraft.title || t('dashboard.continueBanner.untitled')}
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {planProgress[mostRecentDraft.id]?.completionPercentage != null && planProgress[mostRecentDraft.id]!.completionPercentage! < 100
                      ? t('dashboard.bannerInterviewProgress').replace('{percent}', String(planProgress[mostRecentDraft.id]!.completionPercentage))
                      : planProgress[mostRecentDraft.id]?.nextQuestionId
                        ? t('dashboard.continueBanner.continueInterview')
                        : t('dashboard.continueBanner.completePlan')}
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <Button
                    asChild
                    size="default"
                    variant="brand" className="w-full sm:w-auto"
                  >
                    <Link to={`/interview/${mostRecentDraft.id}`}>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      {t('dashboard.continueBanner.continue')}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Profile Completion Banner */}
        <ProfileCompletionBanner variant="dashboard" />

        {/* Stats Grid - hidden when user has no plans */}
        {totalPlans > 0 && (
          <section className="dashboard-stats grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title={cms('dashboard.totalProjects', 'dashboard.totalProjects') || t('dashboard.totalProjects')}
              value={totalPlans}
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
        )}

        {/* Create New Plan Card - Premium CTA */}
        <section className="dashboard-create-card">
          <button onClick={() => setShowQuickCreate(true)} className="group block w-full text-left">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-strategy-blue via-strategy-blue to-[#0f1a2e] p-8 lg:p-10 transition-all duration-300 hover:shadow-xl hover:shadow-strategy-blue/20 dark:hover:shadow-gray-900/60">
              {/* Subtle grid pattern overlay */}
              <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }} />

              {/* Gradient orb accent */}
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-momentum-orange/20 dark:bg-momentum-orange/10 blur-3xl transition-all duration-500 group-hover:bg-momentum-orange/30 dark:group-hover:bg-momentum-orange/20" />

              <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-momentum-orange shadow-lg shadow-momentum-orange/30 dark:shadow-momentum-orange/20 transition-transform duration-300 group-hover:scale-105">
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
          </button>
        </section>

        {/* Quick Create Plan Dialog */}
        <AlertDialog open={showQuickCreate} onOpenChange={setShowQuickCreate}>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle>
                {t('dashboard.quickCreate.title')}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {t('dashboard.quickCreate.description')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="py-2">
              <Label htmlFor="quick-plan-name" className="mb-2 block text-sm font-medium">
                {t('dashboard.quickCreate.label')}
              </Label>
              <Input
                id="quick-plan-name"
                value={quickCreateName}
                onChange={(e) => setQuickCreateName(e.target.value)}
                placeholder={t('dashboard.quickCreate.placeholder')}
                autoFocus
                onKeyDown={(e) => { if (e.key === 'Enter' && quickCreateName.trim()) handleQuickCreate(); }}
              />
            </div>
            <AlertDialogFooter>
              <AlertDialogCancel>{t('dashboard.quickCreate.cancel')}</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleQuickCreate}
                disabled={!quickCreateName.trim() || quickCreateLoading}
                className="bg-momentum-orange hover:bg-orange-600 dark:hover:bg-orange-700"
              >
                {quickCreateLoading ? t('dashboard.quickCreate.creating') : t('dashboard.quickCreate.create')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

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
            {plans.length > 5 && !showAllPlans && (
              <Button variant="ghost" size="sm" onClick={() => setShowAllPlans(true)} className="text-muted-foreground hover:text-foreground">
                {t('dashboard.viewAll')}
                <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          {recentPlans.length === 0 ? (
            /* Empty State - No plans yet */
            <div className="space-y-8">
              <GettingStartedChecklist
                userName={user?.firstName}
                stepStatuses={['pending', 'pending', 'pending']}
                ctaHref="/create-plan"
                ctaLabel={t('dashboard.gettingStarted.cta')}
                t={t}
              />
            </div>
          ) : completedCount === 0 ? (
            /* Getting Started Checklist - In Progress State */
            <>
              <GettingStartedChecklist
                userName={user?.firstName}
                stepStatuses={[
                  Object.values(planProgress).some(p => p.isComplete) ? 'done' :
                  plans.length > 0 ? 'active' : 'pending',
                  Object.values(planProgress).some(p => p.isComplete) ? 'active' : 'pending',
                  'pending',
                ]}
                ctaHref={mostRecentDraft ? `/interview/${mostRecentDraft.id}` : '/create-plan'}
                ctaLabel={mostRecentDraft ? t('dashboard.gettingStarted.ctaResume') : t('dashboard.gettingStarted.cta')}
                t={t}
              />
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
                        updatedAt={plan.updatedAt}
                        locale={language}
                        isComplete={progress?.isComplete}
                        nextQuestionId={progress?.nextQuestionId}
                        questionnaireProgress={progress?.completionPercentage}
                        exportCount={plan.exportCount}
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
                          progress: cms('dashboard.interviewProgress', 'dashboard.interviewProgress'),
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
            </>
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
                      updatedAt={plan.updatedAt}
                      locale={language}
                      isComplete={progress?.isComplete}
                      nextQuestionId={progress?.nextQuestionId}
                      questionnaireProgress={progress?.completionPercentage}
                      exportCount={plan.exportCount}
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
                        progress: cms('dashboard.interviewProgress', 'dashboard.interviewProgress'),
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
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-muted-foreground">
                <span className="block">
                  {cms('dashboard.deleteConfirm', 'dashboard.deleteConfirm')} <span className="font-medium text-foreground">"{planToDelete?.title || 'Untitled Plan'}"</span>?
                </span>
                <span className="block text-destructive font-medium">
                  {cms('dashboard.deleteWarning', 'dashboard.deleteWarning')}
                </span>
              </div>
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
