import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StepIndicator from './StepIndicator';
import WelcomeStep from './steps/WelcomeStep';
import PersonaStep from './steps/PersonaStep';
import BusinessDetailsStep from './steps/BusinessDetailsStep';
import TemplateStep from './steps/TemplateStep';
import CompletionStep from './steps/CompletionStep';
import { OnboardingData, OnboardingStep, StepProps } from '../../types/onboarding';
import { onboardingService } from '../../lib/onboarding-service';
import { useToast } from '../../contexts/ToastContext';

// Define the steps configuration
const STEPS: OnboardingStep[] = [
  { id: 'welcome', title: 'Welcome', component: WelcomeStep },
  { id: 'persona', title: 'Profile', component: PersonaStep },
  { id: 'business', title: 'Business', component: BusinessDetailsStep },
  { id: 'template', title: 'Template', component: TemplateStep },
  { id: 'completion', title: 'Complete', component: CompletionStep },
];

interface OnboardingWizardProps {
  userName?: string;
  initialStep?: number;
  initialData?: Partial<OnboardingData>;
}

/**
 * Main onboarding wizard component
 * Manages step state, data accumulation, and navigation
 */
export default function OnboardingWizard({
  userName,
  initialStep = 0,
  initialData = {},
}: OnboardingWizardProps) {
  const navigate = useNavigate();
  const { error: showError, success: showSuccess } = useToast();

  // Current step index
  const [currentStep, setCurrentStep] = useState(initialStep);

  // Accumulated data from all steps
  const [data, setData] = useState<OnboardingData>({
    userName,
    ...initialData,
  });

  // Direction for animation (1 = forward, -1 = backward)
  const [direction, setDirection] = useState(1);

  // Loading state for completion
  const [isCompleting, setIsCompleting] = useState(false);

  // Get current step configuration
  const stepConfig = STEPS[currentStep];
  const CurrentStepComponent = stepConfig.component;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === STEPS.length - 1;

  // Step titles for indicator
  const stepTitles = useMemo(() => STEPS.map(s => s.title), []);

  // Handle moving to next step
  const handleNext = useCallback(async (stepData: Partial<OnboardingData>) => {
    // Merge new data with existing data
    const updatedData = { ...data, ...stepData };
    setData(updatedData);

    // Save progress to backend (fire and forget)
    try {
      await onboardingService.saveOnboardingProgress({
        currentStep: currentStep + 1,
        data: updatedData,
      });
    } catch (err) {
      console.warn('Failed to save onboarding progress:', err);
      // Don't block the user, just log the error
    }

    // Move to next step
    if (currentStep < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, data]);

  // Handle moving to previous step
  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // Handle completing onboarding
  const handleComplete = useCallback(async () => {
    if (!data.persona || !data.businessName) {
      showError('Missing required data', 'Please complete all required fields.');
      return;
    }

    setIsCompleting(true);

    try {
      const result = await onboardingService.completeOnboarding({
        persona: data.persona,
        businessName: data.businessName,
        industry: data.industry,
        description: data.description,
        templateId: data.templateId === 'scratch' ? undefined : data.templateId,
      });

      showSuccess('Success!', 'Your business plan has been created.');

      // Navigate to the newly created plan
      navigate(`/questionnaire/${result.planId}`);
    } catch (err: any) {
      console.error('Failed to complete onboarding:', err);
      showError(
        'Failed to create plan',
        err.message || 'Something went wrong. Please try again.'
      );
      setIsCompleting(false);
    }
  }, [data, navigate, showError, showSuccess]);

  // Animation variants
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction < 0 ? 100 : -100,
      opacity: 0,
    }),
  };

  // Props to pass to each step component
  const stepProps: StepProps = {
    data,
    onNext: handleNext,
    onBack: handleBack,
    onComplete: handleComplete,
    isFirstStep,
    isLastStep,
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-gray-900">
      {/* Header */}
      <header className="w-full py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 group">
            <div
              className="p-2 rounded-lg transition-transform group-hover:scale-105"
              style={{ backgroundColor: '#1A2B47' }}
            >
              <Brain className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">
              Sqordia
            </span>
          </a>

          {/* Step indicator - hide on first and last step */}
          {!isFirstStep && !isLastStep && (
            <StepIndicator
              currentStep={currentStep}
              totalSteps={STEPS.length}
              stepTitles={stepTitles}
            />
          )}

          {/* Spacer to balance header */}
          <div className="w-[100px]" />
        </div>
      </header>

      {/* Main content */}
      <main
        id="main-content"
        className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="w-full max-w-2xl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 sm:p-10 min-h-[500px]">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={currentStep}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                className="h-full"
              >
                <CurrentStepComponent {...stepProps} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            Need help?{' '}
            <a
              href="mailto:support@sqordia.com"
              className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 underline focus:outline-none focus:ring-2 focus:ring-orange-500 rounded"
            >
              Contact support
            </a>
          </p>
        </div>
      </footer>

      {/* Loading overlay */}
      {isCompleting && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          role="status"
          aria-label="Creating your business plan"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 flex flex-col items-center gap-4 shadow-xl">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              Creating your business plan...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
