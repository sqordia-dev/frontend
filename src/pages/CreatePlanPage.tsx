import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  Sparkles,
  FileText,
} from 'lucide-react';
import { businessPlanService } from '../lib/business-plan-service';
import { organizationService } from '../lib/organization-service';
import { useCmsContent } from '../hooks/useCmsContent';
import SEO from '../components/SEO';
import { getCanonicalUrl } from '../utils/seo';
import { getUserFriendlyError } from '../utils/error-messages';

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 mb-8 hover:opacity-70 transition-opacity text-sm font-medium text-gray-500 dark:text-gray-400"
          >
            <ArrowLeft size={18} />
            <span>Back to Dashboard</span>
          </button>

          <div className="text-center">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full text-sm font-bold tracking-wide mb-6 shadow-lg relative overflow-hidden group bg-[#FF6B00] text-white">
              <div className="absolute inset-0 rounded-full opacity-50 blur-xl group-hover:opacity-75 transition-opacity bg-[#FF6B00]" />
              <Sparkles
                size={16}
                className="relative z-10 animate-pulse text-white"
              />
              <span className="relative z-10">AI-Powered</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight text-[#1A2B47] dark:text-gray-50 font-heading">
              Create New Project
            </h1>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              Give your project a name to get started
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="p-8 sm:p-10">
            <form onSubmit={handleCreateProject} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-start gap-3">
                  <AlertCircle
                    className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5"
                    size={20}
                  />
                  <p className="text-sm text-red-700 dark:text-red-300">
                    {error}
                  </p>
                </div>
              )}

              <div>
                <label
                  htmlFor="projectName"
                  className="block text-base font-bold mb-3 text-[#1A2B47] dark:text-gray-50"
                >
                  Project Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FileText
                      size={20}
                      className="text-gray-400"
                      aria-hidden="true"
                    />
                  </div>
                  <input
                    type="text"
                    id="projectName"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g., My Coffee Shop Business Plan"
                    autoFocus
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF6B00] focus:border-[#FF6B00] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-base transition-all"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  You can always change this later
                </p>
              </div>

              <button
                type="submit"
                disabled={!projectName.trim() || loading || isLoadingOrg}
                className="w-full py-4 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-base text-white disabled:opacity-50 disabled:cursor-not-allowed bg-[#FF6B00] hover:bg-[#E55F00]"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </>
                ) : isLoadingOrg ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Start Building
                    <ArrowRight size={20} />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Info footer */}
          <div className="px-8 sm:px-10 py-5 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm text-center text-gray-500 dark:text-gray-400">
              After creating your project, you'll answer a few questions to help
              our AI generate your personalized business plan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
