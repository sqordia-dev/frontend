import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Sparkles,
  FileText,
  Lightbulb,
  Target,
  Zap,
} from 'lucide-react';
import { businessPlanService } from '../lib/business-plan-service';
import { organizationService } from '../lib/organization-service';
import { useCmsContent } from '../hooks/useCmsContent';
import SEO from '../components/SEO';
import { getCanonicalUrl } from '../utils/seo';
import { getUserFriendlyError } from '../utils/error-messages';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function CreatePlanPage() {
  const navigate = useNavigate();
  const { getContent: cms } = useCmsContent('create_plan');

  const [projectName, setProjectName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [isLoadingOrg, setIsLoadingOrg] = useState(true);

  useEffect(() => {
    fetchDefaultOrganization();
  }, []);

  const fetchDefaultOrganization = async () => {
    try {
      const orgs = await organizationService.getOrganizations();
      if (orgs.length > 0) {
        setOrganizationId(orgs[0].id);
      } else {
        // Create a default organization if none exists
        const newOrg = await organizationService.createOrganization({
          name: 'My Organization',
          organizationType: 'Startup',
        });
        setOrganizationId(newOrg.id);
      }
    } catch (err) {
      console.error('Failed to fetch organizations:', err);
      setError('Failed to load organization. Please try again.');
    } finally {
      setIsLoadingOrg(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!projectName.trim()) {
      setError('Project name is required');
      return;
    }

    if (!organizationId) {
      setError('Organization not found. Please refresh the page.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Get user's persona from localStorage (set during onboarding)
      const userPersona = localStorage.getItem('userPersona') as
        | 'entrepreneur'
        | 'consultant'
        | 'obnl'
        | null;

      // Map persona to plan type
      const planType = userPersona === 'obnl' ? 'StrategicPlan' : 'BusinessPlan';
      const persona = userPersona
        ? userPersona.charAt(0).toUpperCase() + userPersona.slice(1)
        : 'Entrepreneur';

      const plan = await businessPlanService.createBusinessPlan({
        title: projectName.trim(),
        planType,
        organizationId,
        persona: persona as 'Entrepreneur' | 'Consultant' | 'OBNL',
      });

      navigate(`/questionnaire/${plan.id}`);
    } catch (error: any) {
      console.error('Failed to create project:', error);
      setError(getUserFriendlyError(error, 'save'));
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Lightbulb className="h-4 w-4" />,
      text: "AI-powered content generation",
    },
    {
      icon: <Target className="h-4 w-4" />,
      text: "Bank-ready formatting",
    },
    {
      icon: <Zap className="h-4 w-4" />,
      text: "Complete in minutes",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${cms('create_plan.seo_title', '') || 'New Project'} | Sqordia`}
        description={
          cms('create_plan.seo_description', '') ||
          'Create a new business plan with Sqordia.'
        }
        url={getCanonicalUrl('/create-plan')}
        noindex={true}
        nofollow={true}
      />

      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-momentum-orange/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-strategy-blue/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mb-8 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="text-center mb-8">
            {/* AI Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wide mb-6 bg-gradient-to-r from-momentum-orange to-[#ff8533] text-white shadow-lg shadow-momentum-orange/25">
              <Sparkles className="h-3.5 w-3.5" />
              <span>AI-Powered</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground font-heading mb-3">
              {cms('create_plan.title', '') || 'Create New Project'}
            </h1>
            <p className="text-base text-muted-foreground max-w-md mx-auto">
              {cms('create_plan.subtitle', '') || 'Give your project a name to get started with your AI-powered business plan'}
            </p>
          </div>

          {/* Main Card */}
          <Card className="border-0 shadow-xl shadow-black/5 bg-card">
            <CardContent className="p-6 sm:p-8">
              <form onSubmit={handleCreateProject} className="space-y-6">
                {/* Error Alert */}
                {error && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 animate-in fade-in slide-in-from-top-2 duration-300">
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm text-destructive font-medium">{error}</p>
                  </div>
                )}

                {/* Project Name Input */}
                <div className="space-y-3">
                  <Label htmlFor="projectName" className="text-sm font-semibold text-foreground">
                    Project Name <span className="text-destructive">*</span>
                  </Label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <FileText className="h-5 w-5 text-muted-foreground/60 group-focus-within:text-momentum-orange transition-colors" />
                    </div>
                    <Input
                      type="text"
                      id="projectName"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="e.g., My Coffee Shop Business Plan"
                      autoFocus
                      className={cn(
                        "h-12 pl-12 pr-4 text-base rounded-xl border-border/60",
                        "bg-muted/30 hover:bg-muted/50 focus:bg-background",
                        "transition-all duration-200",
                        "focus:ring-2 focus:ring-momentum-orange/20 focus:border-momentum-orange"
                      )}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You can always change this later
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={!projectName.trim() || loading || isLoadingOrg}
                  className={cn(
                    "w-full h-12 rounded-xl font-semibold text-base gap-2",
                    "bg-momentum-orange hover:bg-momentum-orange/90 text-white",
                    "shadow-lg shadow-momentum-orange/25 hover:shadow-xl hover:shadow-momentum-orange/30",
                    "transition-all duration-200",
                    "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  )}
                >
                  {loading ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating...
                    </>
                  ) : isLoadingOrg ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      Start Building
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>

            {/* Features Footer */}
            <div className="px-6 sm:px-8 py-5 border-t border-border/50 bg-muted/30">
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 text-xs text-muted-foreground"
                  >
                    <span className="text-momentum-orange">{feature.icon}</span>
                    <span>{feature.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Help Text */}
          <p className="text-center text-sm text-muted-foreground mt-6 max-w-sm mx-auto">
            After creating your project, you'll answer a few questions to help our AI generate your personalized business plan.
          </p>
        </div>
      </div>
    </div>
  );
}
