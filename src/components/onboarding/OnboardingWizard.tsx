import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import StepIndicator from './StepIndicator';
import LanguageDropdown from '../layout/LanguageDropdown';
import CompanyPersonaStep from './steps/CompanyPersonaStep';
import BusinessContextStep from './steps/BusinessContextStep';
import GoalsObjectivesStep from './steps/GoalsObjectivesStep';
import FeatureTourStep from './steps/FeatureTourStep';
import { onboardingService } from '../../lib/onboarding-service';
import { useToast } from '../../contexts/ToastContext';
import { getUserFriendlyError } from '../../utils/error-messages';
import type { OnboardingProfileCompleteRequest } from '../../types/organization-profile';

export interface OnboardingData {
  companyName?: string;
  industry?: string;
  sector?: string;
  persona?: string;
  businessStage?: string;
  teamSize?: string;
  fundingStatus?: string;
  targetMarket?: string;
  goals?: string[];
}

export interface StepProps {
  data: OnboardingData;
  onNext: (stepData: Partial<OnboardingData>) => void;
  onBack: () => void;
  onComplete: (options?: { createBusinessPlan?: boolean }) => Promise<void>;
  isFirstStep: boolean;
  isLastStep: boolean;
}

const STEPS = [
  { id: 'company-persona', title: 'Company', component: CompanyPersonaStep },
  { id: 'business-context', title: 'Context', component: BusinessContextStep },
  { id: 'goals-objectives', title: 'Goals', component: GoalsObjectivesStep },
  { id: 'feature-tour', title: 'Start', component: FeatureTourStep },
];

interface OnboardingWizardProps {
  userName?: string;
  initialStep?: number;
  initialData?: Partial<OnboardingData>;
}

export default function OnboardingWizard({
  userName,
  initialStep = 0,
  initialData = {},
}: OnboardingWizardProps) {
  const navigate = useNavigate();
  const { error: showError, success: showSuccess } = useToast();
  const { language, t } = useTheme();

  const [currentStep, setCurrentStep] = useState(initialStep);
  const [data, setData] = useState<OnboardingData>({ ...initialData });
  const [direction, setDirection] = useState(1);
  const [isCompleting, setIsCompleting] = useState(false);

  const stepConfig = STEPS[currentStep];
  const CurrentStepComponent = stepConfig.component;
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === STEPS.length - 1;
  const stepTitles = useMemo(() => STEPS.map(s => s.title), []);

  const handleNext = useCallback((stepData: Partial<OnboardingData>) => {
    const updatedData = { ...data, ...stepData };
    setData(updatedData);

    // Save progress (fire and forget)
    onboardingService.saveOnboardingProgress({
      currentStep: currentStep + 1,
      data: updatedData as any,
    }).catch(() => {});

    if (currentStep < STEPS.length - 1) {
      setDirection(1);
      setCurrentStep(currentStep + 1);
    }
  }, [currentStep, data]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const handleComplete = useCallback(async (options?: { createBusinessPlan?: boolean }) => {
    const createPlan = options?.createBusinessPlan ?? true;

    if (!data.persona || !data.companyName) {
      showError(
        t('onboarding.error.missingData.title'),
        t('onboarding.error.missingData.message'),
      );
      throw new Error('Missing required data');
    }

    setIsCompleting(true);

    try {
      const request: OnboardingProfileCompleteRequest = {
        companyName: data.companyName,
        persona: data.persona,
        industry: data.industry,
        sector: data.sector,
        businessStage: data.businessStage,
        teamSize: data.teamSize,
        fundingStatus: data.fundingStatus,
        targetMarket: data.targetMarket,
        goalsJson: data.goals ? JSON.stringify(data.goals) : undefined,
        createBusinessPlan: createPlan,
      };

      const result = await onboardingService.completeOnboardingProfile(request);

      if (createPlan && result.businessPlanId) {
        showSuccess(t('onboarding.success.title'), t('onboarding.success.planCreated'));
        navigate(`/interview/${result.businessPlanId}`);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Failed to complete onboarding:', err);
      showError(t('onboarding.error.createPlan'), getUserFriendlyError(err, 'save', language));
      setIsCompleting(false);
      throw err;
    }
  }, [data, navigate, showError, showSuccess, t, language]);

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 100 : -100, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 100 : -100, opacity: 0 }),
  };

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
      <header className="w-full py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center gap-3 group">
            <div className="p-2 rounded-lg transition-transform group-hover:scale-105" style={{ backgroundColor: '#1A2B47' }}>
              <Brain className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Sqordia</span>
          </a>
          {!isLastStep && (
            <div className="flex flex-col items-center">
              <StepIndicator
                currentStep={currentStep}
                totalSteps={STEPS.length - 1}
                stepTitles={stepTitles.slice(0, -1)}
              />
              <p className="text-center text-xs text-muted-foreground mt-1 sm:hidden">
                {STEPS[currentStep]?.title}
              </p>
            </div>
          )}
          <div className="flex items-center gap-2">
            <LanguageDropdown variant="toggle" />
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              aria-label={t('onboarding.skipForNow')}
            >
              <span className="hidden sm:inline">{t('onboarding.skip')}</span>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main id="main-content" className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8">
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
                transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                className="h-full"
              >
                <CurrentStepComponent {...stepProps} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center text-sm text-gray-500 dark:text-gray-400">
          <p>
            {t('onboarding.needHelp')}{' '}
            <a href="mailto:support@sqordia.com" className="text-orange-600 hover:text-orange-700 underline">{t('onboarding.contactSupport')}</a>
          </p>
        </div>
      </footer>

      {isCompleting && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="status" aria-label="Creating your business plan">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 flex flex-col items-center gap-4 shadow-xl">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-lg font-medium text-gray-900 dark:text-white">{t('onboarding.creatingPlan')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
