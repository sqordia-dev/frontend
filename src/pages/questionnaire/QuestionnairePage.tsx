import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { QuestionnaireContainer } from '../../components/questionnaire';
import SEO from '../../components/SEO';
import { businessPlanService } from '../../lib/business-plan-service';

/**
 * QuestionnairePage Component
 * Main page for the questionnaire flow
 * Gets planId from URL params and renders the QuestionnaireContainer
 */
export default function QuestionnairePage() {
  const { planId } = useParams<{ planId: string }>();
  const navigate = useNavigate();

  const [planTitle, setPlanTitle] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Validate planId and fetch plan details
  useEffect(() => {
    const validatePlan = async () => {
      if (!planId) {
        setError('No plan ID provided');
        setIsLoading(false);
        return;
      }

      try {
        // Fetch plan details to validate it exists
        const plan = await businessPlanService.getBusinessPlan(planId);
        setPlanTitle(plan.title || 'Business Plan');
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to fetch plan:', err);
        setError('Failed to load business plan. Please try again.');
        setIsLoading(false);
      }
    };

    validatePlan();
  }, [planId]);

  // Handle questionnaire completion
  const handleComplete = () => {
    // Navigate to the plan view page for generation
    navigate(`/plans/${planId}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <>
        <SEO
          title="Loading Questionnaire | Sqordia"
          description="Loading your questionnaire"
          noindex={true}
          nofollow={true}
        />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <Loader2
              size={48}
              className="animate-spin mx-auto mb-4"
              style={{ color: '#FF6B00' }}
            />
            <p className="text-gray-600 dark:text-gray-400">
              Loading your questionnaire...
            </p>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error || !planId) {
    return (
      <>
        <SEO
          title="Error | Sqordia"
          description="An error occurred"
          noindex={true}
          nofollow={true}
        />
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
          <div className="text-center max-w-md">
            <AlertCircle
              size={48}
              className="mx-auto mb-4 text-red-500"
            />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {error || 'Invalid Plan ID'}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error
                ? 'Please check the URL and try again.'
                : 'No plan ID was provided in the URL.'}
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="
                px-6 py-3 rounded-xl
                bg-orange-500 hover:bg-orange-600
                text-white font-semibold
                transition-colors
              "
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO
        title={`Questionnaire - ${planTitle} | Sqordia`}
        description="Complete the questionnaire to generate your business plan"
        noindex={true}
        nofollow={true}
      />
      <QuestionnaireContainer
        planId={planId}
        onComplete={handleComplete}
      />
    </>
  );
}
