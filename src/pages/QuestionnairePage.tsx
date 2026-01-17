import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Circle,
  Sparkles,
  Save,
  Loader2,
  AlertCircle,
  Languages,
  ChevronRight,
  Lightbulb,
  Zap,
  Target,
  TrendingUp,
  BookOpen,
  Users,
  Briefcase,
  X,
  FileText
} from 'lucide-react';
import { businessPlanService } from '../lib/business-plan-service';
import { useTheme } from '../contexts/ThemeContext';
import SEO from '../components/SEO';

interface QuestionnaireQuestion {
  questionId: string;
  questionText: string;
  helpText: string;
  questionType: string;
  order: number;
  isRequired: boolean;
  section: string;
  response: any;
  responseText: string | null;
  isAnswered: boolean;
}

interface Progress {
  totalQuestions: number;
  completedQuestions: number;
  completionPercentage: number;
  isComplete: boolean;
}

const SECTION_ORDER = [
  'Mission, vision, valeurs et contexte',
  'Analyse stratégique',
  'Bénéficiaires, besoins et impact',
  'Orientations, objectifs et plan d\'action',
  'Gouvernance, financement et pérennité'
];

const SECTION_ICONS = [
  Target,
  TrendingUp,
  Users,
  Briefcase,
  BookOpen
];

export default function QuestionnairePage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { theme, t, language: contextLanguage } = useTheme();

  // Landing page color theme
  const strategyBlue = '#1A2B47';
  const momentumOrange = '#FF6B00';
  const momentumOrangeHover = '#E55F00';
  const lightAIGrey = '#F4F7FA';

  const [questions, setQuestions] = useState<QuestionnaireQuestion[]>([]);
  const [currentSection, setCurrentSection] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [language, setLanguage] = useState<'en' | 'fr'>(contextLanguage);
  const [generating, setGenerating] = useState(false);
  const [suggestingQuestionId, setSuggestingQuestionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [autoSaveTimers, setAutoSaveTimers] = useState<Record<string, NodeJS.Timeout>>({});
  const [focusedQuestion, setFocusedQuestion] = useState<string | null>(null);
  const [planType, setPlanType] = useState<string>('StrategicPlan'); // Default to StrategicPlan for OBNL
  const [generationStatus, setGenerationStatus] = useState<{
    status?: string;
    progress?: number;
    currentStep?: string;
    estimatedTimeRemaining?: number;
    errorMessage?: string;
  } | null>(null);
  const [statusPollInterval, setStatusPollInterval] = useState<NodeJS.Timeout | null>(null);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);

  // Sync local language state with context language
  useEffect(() => {
    setLanguage(contextLanguage);
  }, [contextLanguage]);

  useEffect(() => {
    if (planId) {
      fetchQuestions();
      fetchProgress();
      fetchPlanType();
    }
  }, [planId, language]);

  const fetchPlanType = async () => {
    if (!planId) return;
    
    try {
      const plan = await businessPlanService.getBusinessPlan(planId);
      // Backend returns PlanType field (capital P)
      const planTypeValue = (plan as any)?.planType || (plan as any)?.PlanType;
      if (planTypeValue) {
        // Ensure it's a valid plan type
        if (['BusinessPlan', 'StrategicPlan', 'LeanCanvas'].includes(planTypeValue)) {
          setPlanType(planTypeValue);
        } else {
          // Map other values if needed
          setPlanType('StrategicPlan'); // Default for OBNL/other types
        }
      } else {
        // If no planType found, default to StrategicPlan (for OBNL)
        setPlanType('StrategicPlan');
      }
    } catch (err) {
      console.error('Failed to fetch plan type:', err);
      // Keep default value (StrategicPlan)
    }
  };

  const fetchQuestions = async () => {
    if (!planId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await businessPlanService.getQuestionnaire(planId, language);
      
      // Map backend response (Id, UserResponse) to frontend format (questionId, responseText)
      // Backend returns: Id (Guid) and UserResponse (string)
      // Frontend expects: questionId (string) and responseText (string)
      const mappedQuestions = response.map((q: any) => {
        const questionId = q.id || q.questionId || q.Id;
        const responseText = q.userResponse || q.responseText || q.UserResponse || null;
        
        return {
          ...q,
          questionId: questionId ? String(questionId) : String(q.Id || ''), // Ensure it's a string
          responseText: responseText || null,
          isAnswered: !!responseText
        };
      });
      
      setQuestions(mappedQuestions);

      const initialAnswers: Record<string, string> = {};
      mappedQuestions.forEach((q: QuestionnaireQuestion) => {
        if (q.questionId && q.responseText) {
          initialAnswers[q.questionId] = q.responseText;
        }
      });
      setAnswers(initialAnswers);
    } catch (err: any) {
      console.error('Failed to fetch questions:', err);
      setError(err.message || 'Failed to load questionnaire. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
    if (!planId) return;

    try {
      const progressData = await businessPlanService.getQuestionnaireProgress(planId);
      setProgress(progressData);
    } catch (err) {
      console.error('Failed to fetch progress:', err);
    }
  };

  const saveAnswer = async (questionId: string, answer: string) => {
    if (!planId || !answer.trim()) return;

    setSaving(questionId);

    try {
      await businessPlanService.submitQuestionnaireResponses(planId, {
        questionTemplateId: questionId,
        responseText: answer
      });

      setQuestions(prev => prev.map(q => {
        const qId = q.questionId || (q as any).id || (q as any).Id;
        return qId === questionId
          ? { ...q, isAnswered: true, responseText: answer }
          : q;
      }));

      await fetchProgress();
    } catch (err: any) {
      console.error('Failed to save answer:', err);
      setError('Failed to save answer. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  const handleAnswerChange = useCallback((questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));

    if (autoSaveTimers[questionId]) {
      clearTimeout(autoSaveTimers[questionId]);
    }

    const timer = setTimeout(() => {
      saveAnswer(questionId, value);
    }, 2000);

    setAutoSaveTimers(prev => ({ ...prev, [questionId]: timer }));
  }, [autoSaveTimers, planId]);

  const handleManualSave = async (questionId: string) => {
    const answer = answers[questionId];
    if (!answer?.trim()) return;

    if (autoSaveTimers[questionId]) {
      clearTimeout(autoSaveTimers[questionId]);
    }

    await saveAnswer(questionId, answer);
  };

  const handleGetSuggestion = async (questionId: string) => {
    if (!planId) return;

    setSuggestingQuestionId(questionId);
    setError(null);

    try {
      // Find the question to get its text
      const question = questions.find(q => q.questionId === questionId);
      if (!question) {
        setError('Question not found.');
        setSuggestingQuestionId(null);
        return;
      }

      // Get the current answer if any
      const existingAnswer = answers[questionId] || null;

      // Validate question text length (backend requires minimum 10 characters)
      if (!question.questionText || question.questionText.trim().length < 10) {
        setError('Question text is too short for AI suggestions. Please ensure the question has at least 10 characters.');
        setSuggestingQuestionId(null);
        return;
      }

      const suggestion = await businessPlanService.suggestAnswer(
        planId, 
        questionId, 
        question.questionText.trim(), 
        planType, 
        existingAnswer || undefined,
        language
      );
      setAnswers(prev => ({ ...prev, [questionId]: suggestion }));
      setError(null);
    } catch (err: any) {
      console.error('Failed to get suggestion:', err);
      console.error('Error response data:', err.response?.data);
      
      // Extract detailed error message
      let errorMessage = 'AI suggestions are temporarily unavailable.';
      
      if (err.response?.data) {
        const errorData = err.response.data;
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.details && Array.isArray(errorData.details)) {
          errorMessage = errorData.details.join(', ');
        } else if (typeof errorData === 'string') {
          errorMessage = errorData;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setSuggestingQuestionId(null);
    }
  };

  // Calculate simulated progress based on elapsed time
  const calculateSimulatedProgress = useCallback(() => {
    if (!generationStartTime) return 5; // Start at 5%
    const elapsed = Math.floor((Date.now() - generationStartTime) / 1000); // seconds
    const estimatedTotal = 180; // 3 minutes average
    
    // Simulate progress with a smooth curve
    // Start at 5%, accelerate in middle, slow at end
    // Use a quadratic ease-out function for natural progression
    const normalizedTime = Math.min(1, elapsed / estimatedTotal);
    // Ease-out quadratic: 1 - (1-t)^2
    const easedProgress = 1 - Math.pow(1 - normalizedTime, 2);
    // Scale from 5% to 95%
    const progress = 5 + (easedProgress * 90);
    return Math.max(5, Math.min(95, Math.round(progress)));
  }, [generationStartTime]);

  // Get current step based on progress
  const getCurrentStepFromProgress = useCallback((progress: number) => {
    if (progress < 10) return t('questionnaire.generation.step.initializing');
    if (progress < 30) return t('questionnaire.generation.step.analyzing');
    if (progress < 60) return t('questionnaire.generation.step.sections');
    if (progress < 85) return t('questionnaire.generation.step.financials');
    return t('questionnaire.generation.step.finalizing');
  }, [t]);

  // Poll generation status
  const pollGenerationStatus = useCallback(async () => {
    if (!planId) return;

    try {
      const status = await businessPlanService.getGenerationStatus(planId);
      
      // Log the response for debugging
      console.log('Generation status response:', status);
      
      // Try to extract progress from various possible fields
      let backendProgress = status?.progress || status?.Progress || status?.percentage || status?.completionPercentage || null;
      let backendStatus = status?.status || status?.Status || status?.state || null;
      let backendStep = status?.currentStep || status?.CurrentStep || status?.message || status?.step || status?.currentStage || null;
      
      // If backend doesn't provide progress, use simulated progress
      const simulatedProgress = calculateSimulatedProgress();
      const finalProgress = backendProgress !== null && backendProgress !== undefined ? backendProgress : simulatedProgress;
      
      // If backend doesn't provide step, derive from progress
      const finalStep = backendStep || getCurrentStepFromProgress(finalProgress);
      
      // Update status with progress information
      const updatedStatus = {
        status: backendStatus || 'InProgress',
        progress: finalProgress,
        currentStep: finalStep,
        estimatedTimeRemaining: status?.estimatedTimeRemaining || status?.EstimatedTimeRemaining,
        errorMessage: status?.errorMessage || status?.ErrorMessage || status?.error
      };
      
      console.log('Updated generation status:', updatedStatus);
      setGenerationStatus(updatedStatus);

      // If generation is complete, stop polling and navigate
      if (updatedStatus.status === 'Completed' || updatedStatus.status === 'completed' || updatedStatus.status === 'Success') {
        setStatusPollInterval((currentInterval) => {
          if (currentInterval) {
            clearInterval(currentInterval);
            // Also cleanup progress interval if it exists
            if ((currentInterval as any).progressInterval) {
              clearInterval((currentInterval as any).progressInterval);
            }
          }
          return null;
        });
        // Show completion message briefly before navigating
        setGenerationStatus({
          ...updatedStatus,
          status: 'Completed',
          progress: 100,
          currentStep: t('questionnaire.generation.completed')
        });
        setTimeout(() => {
          setGenerating(false);
          setGenerationStatus(null);
          setGenerationStartTime(null);
          navigate(`/plan/${planId}`);
        }, 1500);
        return;
      }

      // If generation failed, stop polling
      if (updatedStatus.status === 'Failed' || updatedStatus.status === 'failed' || updatedStatus.status === 'Error') {
        setStatusPollInterval((currentInterval) => {
          if (currentInterval) {
            clearInterval(currentInterval);
            // Also cleanup progress interval if it exists
            if ((currentInterval as any).progressInterval) {
              clearInterval((currentInterval as any).progressInterval);
            }
          }
          return null;
        });
        setGenerating(false);
        setGenerationStartTime(null);
        setError(updatedStatus.errorMessage || 'Business plan generation failed. Please try again.');
        setGenerationStatus(null);
        return;
      }
    } catch (err: any) {
      console.error('Failed to poll generation status:', err);
      // Don't stop polling on individual errors, just log them
      // The generation might still be in progress on the backend
      // Use simulated progress as fallback
      const simulatedProgress = calculateSimulatedProgress();
      if (simulatedProgress > 0) {
        setGenerationStatus({
          status: 'InProgress',
          progress: simulatedProgress,
          currentStep: getCurrentStepFromProgress(simulatedProgress),
          estimatedTimeRemaining: undefined,
          errorMessage: undefined
        });
      }
    }
  }, [planId, navigate, t, calculateSimulatedProgress, getCurrentStepFromProgress]);

  const handleGeneratePlan = async () => {
    if (!planId) return;

    setGenerating(true);
    setError(null);
    const startTime = Date.now();
    setGenerationStartTime(startTime);
    setGenerationStatus({
      status: 'Starting',
      progress: 5, // Start at 5% to show immediate progress
      currentStep: t('questionnaire.generation.step.initializing')
    });

    try {
      // Start generation (non-blocking)
      businessPlanService.generateBusinessPlan(planId).catch((err: any) => {
        // If the initial request fails, handle it
        console.error('Failed to start generation:', err);
        setStatusPollInterval((currentInterval) => {
          if (currentInterval) {
            clearInterval(currentInterval);
            // Also cleanup progress interval if it exists
            if ((currentInterval as any).progressInterval) {
              clearInterval((currentInterval as any).progressInterval);
            }
          }
          return null;
        });
        setGenerating(false);
        setGenerationStatus(null);
        setGenerationStartTime(null);
        
        const errorMessage = err.response?.data?.message 
          || err.response?.data?.error 
          || err.message 
          || 'Failed to start business plan generation. Please try again.';
        setError(errorMessage);
      });

      // Start polling for status updates every 2 seconds
      const interval = setInterval(() => {
        pollGenerationStatus();
      }, 2000);
      setStatusPollInterval(interval);

      // Also poll immediately after a short delay
      setTimeout(() => {
        pollGenerationStatus();
      }, 1000);

      // Also update progress locally every second as fallback
      // This ensures progress updates even if backend doesn't respond
      const progressInterval = setInterval(() => {
        setGenerationStatus((current) => {
          if (!current) return current;
          const simulatedProgress = calculateSimulatedProgress();
          return {
            ...current,
            progress: current.progress || simulatedProgress,
            currentStep: current.currentStep || getCurrentStepFromProgress(simulatedProgress)
          };
        });
      }, 1000);

      // Store progress interval for cleanup
      (interval as any).progressInterval = progressInterval;
    } catch (err: any) {
      console.error('Failed to generate plan:', err);
      setGenerating(false);
      setGenerationStatus(null);
      setGenerationStartTime(null);
      
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error 
        || err.message 
        || 'Failed to generate business plan. Please try again.';
      setError(errorMessage);
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (statusPollInterval) {
        clearInterval(statusPollInterval);
        // Also cleanup progress interval if it exists
        if ((statusPollInterval as any).progressInterval) {
          clearInterval((statusPollInterval as any).progressInterval);
        }
      }
    };
  }, [statusPollInterval]);

  // Get estimated time remaining
  const getEstimatedTime = () => {
    if (!generationStartTime) return null;
    const elapsed = Math.floor((Date.now() - generationStartTime) / 1000);
    const estimatedTotal = 180; // 3 minutes average
    const remaining = Math.max(0, estimatedTotal - elapsed);
    return remaining;
  };

  // Get progress steps for visual display
  const getProgressSteps = () => {
    const steps = [
      { key: 'initializing', label: t('questionnaire.generation.step.initializing'), icon: Zap },
      { key: 'analyzing', label: t('questionnaire.generation.step.analyzing'), icon: Target },
      { key: 'sections', label: t('questionnaire.generation.step.sections'), icon: FileText },
      { key: 'financials', label: t('questionnaire.generation.step.financials'), icon: TrendingUp },
      { key: 'finalizing', label: t('questionnaire.generation.step.finalizing'), icon: CheckCircle2 },
    ];
    return steps;
  };

  const questionsBySection = questions.reduce((acc, q) => {
    if (!acc[q.section]) acc[q.section] = [];
    acc[q.section].push(q);
    return acc;
  }, {} as Record<string, QuestionnaireQuestion[]>);

  const sections = SECTION_ORDER.filter(section => questionsBySection[section]);
  const currentSectionQuestions = sections[currentSection] ? questionsBySection[sections[currentSection]] : [];
  const allAnswered = questions.every(q => !q.isRequired || q.isAnswered);

  const getSectionProgress = (section: string) => {
    const sectionQuestions = questionsBySection[section] || [];
    const answered = sectionQuestions.filter(q => q.isAnswered).length;
    return { total: sectionQuestions.length, answered, percentage: sectionQuestions.length > 0 ? (answered / sectionQuestions.length) * 100 : 0 };
  };

  // Check if a section is complete (all questions answered)
  const isSectionComplete = (section: string) => {
    const { total, answered } = getSectionProgress(section);
    return total > 0 && answered === total;
  };

  // Check if we can navigate to a specific section
  const canNavigateToSection = (targetIndex: number) => {
    // Can always go back or stay in current section
    if (targetIndex <= currentSection) return true;
    
    // Can only go forward if all previous sections are complete
    for (let i = 0; i < targetIndex; i++) {
      if (sections[i] && !isSectionComplete(sections[i])) {
        return false;
      }
    }
    return true;
  };

  // Handle section navigation with validation
  const handleSectionNavigation = (targetIndex: number) => {
    if (targetIndex === currentSection) return;
    
    // Allow backward navigation
    if (targetIndex < currentSection) {
      setCurrentSection(targetIndex);
      setError(null);
      return;
    }
    
    // Forward navigation requires all previous sections to be complete
    if (!canNavigateToSection(targetIndex)) {
      const incompleteSection = sections.find((_, index) => index < targetIndex && !isSectionComplete(sections[index]));
      if (incompleteSection) {
        setError(t('questionnaire.errorCompleteBefore').replace('{section}', incompleteSection));
      } else {
        setError(t('questionnaire.errorCompleteCurrent'));
      }
      return;
    }
    
    setCurrentSection(targetIndex);
    setError(null);
  };

  // Calculate progress locally based on actual questions loaded
  const calculatedProgress = useMemo(() => {
    const totalQuestions = questions.length;
    const completedQuestions = questions.filter(q => q.isAnswered).length;
    const completionPercentage = totalQuestions > 0 ? (completedQuestions / totalQuestions) * 100 : 0;
    return {
      totalQuestions,
      completedQuestions,
      completionPercentage,
      isComplete: completedQuestions === totalQuestions && totalQuestions > 0
    };
  }, [questions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 rounded-full dark:border-gray-700" style={{ borderColor: theme === 'dark' ? undefined : lightAIGrey }}></div>
            <div className="absolute inset-0 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: momentumOrange }}></div>
          </div>
          <p className="text-lg font-semibold mb-2" style={{ color: theme === 'dark' ? '#F9FAFB' : strategyBlue }}>{t('questionnaire.loading')}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{t('questionnaire.loadingSubtitle')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <SEO
        title={t('questionnaire.title') || 'Questionnaire | Sqordia'}
        description={t('questionnaire.description') || 'Complete the questionnaire to generate your business plan'}
        noindex={true}
        nofollow={true}
      />
      {/* Enhanced Header with Progress */}
      <div className="bg-white dark:bg-gray-900 border-b-2 border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => navigate('/dashboard')}
              className="group flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 hover:opacity-80 transition-opacity font-medium text-sm min-h-[44px] sm:min-h-0"
              style={{ color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span className="hidden sm:inline">{t('questionnaire.backToDashboard')}</span>
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={() => {
                  const newLang = language === 'en' ? 'fr' : 'en';
                  setLanguage(newLang);
                  setContextLanguage(newLang);
                }}
                className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 text-sm font-semibold bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all min-h-[44px] sm:min-h-0"
                style={{ color: theme === 'dark' ? '#F3F4F6' : strategyBlue }}
              >
                <Languages size={16} />
                <span>{language === 'en' ? 'FR' : 'EN'}</span>
              </button>

              {questions.length > 0 && (
                <div className="flex items-center gap-3 px-5 py-2.5 rounded-lg border-2 dark:bg-gray-800 dark:border-gray-700" style={{ 
                  backgroundColor: lightAIGrey,
                  borderColor: theme === 'dark' ? '#374151' : '#E5E7EB'
                }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: momentumOrange }}></div>
                    <span className="text-sm font-bold" style={{ color: theme === 'dark' ? '#F9FAFB' : strategyBlue }}>
                      {calculatedProgress.completedQuestions}/{calculatedProgress.totalQuestions}
                    </span>
                  </div>
                  <div className="h-5 w-px bg-gray-300 dark:bg-gray-600"></div>
                  <span className="text-sm font-bold" style={{ color: momentumOrange }}>
                    {Math.round(calculatedProgress.completionPercentage)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {questions.length > 0 && (
            <div className="relative">
              <div className="w-full rounded-full h-2 overflow-hidden dark:bg-gray-700" style={{ backgroundColor: lightAIGrey }}>
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                  style={{ 
                    width: `${calculatedProgress.completionPercentage}%`,
                    backgroundColor: momentumOrange
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 max-w-7xl">
        {error && (
          <div className="mb-6 p-5 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl flex items-start gap-4 animate-slide-in shadow-sm">
            <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" size={22} />
            <div className="flex-1">
              <p className="text-base font-bold text-red-900 dark:text-red-200 mb-1">{t('questionnaire.error')}</p>
              <p className="text-sm text-red-700 dark:text-red-300 leading-relaxed">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)} 
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200 transition-colors p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded"
              aria-label="Dismiss error"
            >
              <span className="text-xl leading-none">×</span>
            </button>
          </div>
        )}

        {/* Mobile Section Indicator */}
        <div className="lg:hidden mb-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {SECTION_ICONS[currentSection] && (
                  <div className="p-2 rounded-lg" style={{ backgroundColor: momentumOrange }}>
                    {(() => {
                      const Icon = SECTION_ICONS[currentSection];
                      return <Icon size={18} className="text-white" />;
                    })()}
                  </div>
                )}
                <div>
                  <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {t('questionnaire.section')} {currentSection + 1} / {sections.length}
                  </div>
                  <div className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">
                    {sections[currentSection]}
                  </div>
                </div>
              </div>
              <div className="text-xs font-bold" style={{ color: momentumOrange }}>
                {getSectionProgress(sections[currentSection]).answered}/{getSectionProgress(sections[currentSection]).total}
              </div>
            </div>
            <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600">
              <div 
                className="h-full rounded-full transition-all duration-300"
                style={{ 
                  width: `${getSectionProgress(sections[currentSection]).percentage}%`,
                  backgroundColor: momentumOrange
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8">
          {/* Enhanced Sidebar Navigation - Hidden on mobile, shown as bottom sheet */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-200 dark:border-gray-700 p-4 sm:p-6 sticky top-32">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-lg" style={{ backgroundColor: strategyBlue }}>
                  <Target className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-bold" style={{ color: theme === 'dark' ? '#F9FAFB' : strategyBlue }}>{t('questionnaire.sections')}</h3>
              </div>
              
              <nav className="space-y-2">
                {sections.map((section, index) => {
                  const { total, answered, percentage } = getSectionProgress(section);
                  const isComplete = answered === total && total > 0;
                  const isCurrent = index === currentSection;
                  const Icon = SECTION_ICONS[index] || Target;

                  return (
                    <button
                      key={section}
                      onClick={() => handleSectionNavigation(index)}
                      disabled={!canNavigateToSection(index)}
                      className={`w-full text-left p-3 sm:p-4 rounded-lg transition-all duration-200 group min-h-[44px] flex items-center ${
                        !canNavigateToSection(index) ? 'opacity-50 cursor-not-allowed' : ''
                      } ${
                        isCurrent
                          ? 'shadow-md'
                          : isComplete
                          ? 'border-2 hover:shadow-sm'
                          : 'border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      style={isCurrent ? {
                        backgroundColor: theme === 'dark' ? '#1F2937' : lightAIGrey,
                        borderColor: momentumOrange,
                        borderWidth: '2px'
                      } : isComplete ? {
                        backgroundColor: theme === 'dark' ? '#064E3B' : '#F0FDF4',
                        borderColor: theme === 'dark' ? '#CC4A00' : '#FFB366'
                      } : {
                        backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF'
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 p-2 rounded-lg ${
                          isCurrent 
                            ? '' 
                            : isComplete 
                            ? 'bg-orange-100 dark:bg-orange-900/50' 
                            : 'bg-gray-100 dark:bg-gray-700'
                        }`}
                        style={isCurrent ? {
                          backgroundColor: momentumOrange
                        } : {}}
                        >
                          {isComplete ? (
                            <CheckCircle2 size={16} className={isCurrent ? 'text-white' : 'text-orange-600 dark:text-orange-400'} />
                          ) : (
                            <Icon size={16} className={isCurrent ? 'text-white' : (theme === 'dark' ? '#9CA3AF' : '#6B7280')} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-bold mb-1 ${
                            isCurrent 
                              ? '' 
                              : ''
                          }`}
                          style={isCurrent ? {
                            color: theme === 'dark' ? '#F9FAFB' : strategyBlue
                          } : {
                            color: theme === 'dark' ? '#F9FAFB' : strategyBlue
                          }}
                          >
                            {t('questionnaire.section')} {index + 1}
                          </div>
                          <div className={`text-xs mb-2 line-clamp-2 ${
                            isCurrent 
                              ? '' 
                              : ''
                          }`}
                          style={isCurrent ? {
                            color: theme === 'dark' ? '#D1D5DB' : '#6B7280'
                          } : {
                            color: theme === 'dark' ? '#9CA3AF' : '#6B7280'
                          }}
                          >
                            {section}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${
                              isCurrent 
                                ? '' 
                                : 'bg-gray-200 dark:bg-gray-600'
                            }`}
                            style={isCurrent ? {
                              backgroundColor: theme === 'dark' ? '#374151' : '#E5E7EB'
                            } : {}}
                            >
                              <div 
                                className="h-full rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${percentage}%`,
                                  backgroundColor: isCurrent 
                                    ? momentumOrange
                                    : isComplete 
                                    ? '#FF6B00' 
                                    : momentumOrange
                                }}
                              />
                            </div>
                            <span className="text-xs font-semibold" style={{ 
                              color: isCurrent 
                                ? (theme === 'dark' ? '#D1D5DB' : '#6B7280')
                                : (theme === 'dark' ? '#6B7280' : '#9CA3AF')
                            }}>
                              {answered}/{total}
                            </span>
                          </div>
                        </div>
                        {isCurrent && (
                          <ChevronRight size={16} className="flex-shrink-0 mt-1" style={{ color: momentumOrange }} />
                        )}
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-6">
            {/* Section Header */}
            <div className="rounded-xl shadow-sm p-8 relative overflow-hidden border-2" style={{ 
              backgroundColor: strategyBlue,
              borderColor: momentumOrange
            }}>
              <div className="relative z-10">
                <div className="flex items-center gap-4 mb-4">
                  {SECTION_ICONS[currentSection] && (
                    <div className="p-3 rounded-lg" style={{ backgroundColor: momentumOrange }}>
                      {(() => {
                        const Icon = SECTION_ICONS[currentSection];
                        return <Icon size={24} className="text-white" />;
                      })()}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-semibold text-white/90 mb-1 uppercase tracking-wide">
                      {t('questionnaire.sectionOf').replace('{current}', String(currentSection + 1)).replace('{total}', String(sections.length))}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white">
                      {sections[currentSection]}
                    </h2>
                  </div>
                </div>
                <p className="text-white/80 text-base">
                  {t('questionnaire.questionsCompleted').replace('{answered}', String(getSectionProgress(sections[currentSection]).answered)).replace('{total}', String(getSectionProgress(sections[currentSection]).total))}
                </p>
              </div>
            </div>

            {/* Questions */}
            <div className="space-y-6">
              {currentSectionQuestions.map((question, idx) => {
                const isFocused = focusedQuestion === question.questionId;
                const hasAnswer = answers[question.questionId]?.trim();
                
                return (
                  <div
                    key={question.questionId}
                    className={`group relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 transition-all duration-300 overflow-hidden ${
                      question.isAnswered
                        ? 'border-orange-300 dark:border-orange-700'
                        : isFocused
                        ? 'shadow-lg scale-[1.01]'
                        : 'border-gray-200 dark:border-gray-700 hover:shadow-md'
                    }`}
                    style={isFocused && !question.isAnswered ? {
                      borderColor: momentumOrange
                    } : {}}
                    onFocus={() => setFocusedQuestion(question.questionId)}
                    onBlur={() => setFocusedQuestion(null)}
                  >
                    {/* Question Header */}
                    <div className="p-6 pb-4">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-start gap-4 flex-1">
                          <div className={`flex items-center justify-center w-12 h-12 rounded-xl font-bold text-base transition-all ${
                            question.isAnswered
                              ? 'text-white'
                              : isFocused
                              ? 'text-white'
                              : ''
                          }`}
                          style={question.isAnswered ? {
                            backgroundColor: '#FF6B00'
                          } : isFocused ? {
                            backgroundColor: momentumOrange
                          } : {
                            backgroundColor: theme === 'dark' ? '#374151' : lightAIGrey,
                            color: theme === 'dark' ? '#F3F4F6' : strategyBlue
                          }}
                          >
                            {question.order}
                          </div>
                          <div className="flex-1">
                            <h3 className={`text-lg font-bold mb-2 transition-colors ${
                              question.isAnswered
                                ? ''
                                : ''
                            }`}
                            style={question.isAnswered ? {
                              color: theme === 'dark' ? '#FF8C42' : '#FF6B00'
                            } : {
                              color: theme === 'dark' ? '#F9FAFB' : strategyBlue
                            }}
                            >
                              {question.questionText}
                            </h3>
                            {question.helpText && (
                              <div className="flex items-start gap-2 mt-3 p-3 rounded-lg border dark:bg-gray-700 dark:border-gray-600" style={{ 
                                backgroundColor: lightAIGrey,
                                borderColor: theme === 'dark' ? '#374151' : '#E5E7EB'
                              }}>
                                <Lightbulb size={16} style={{ color: momentumOrange }} className="flex-shrink-0 mt-0.5" />
                                <p className="text-sm" style={{ color: theme === 'dark' ? '#D1D5DB' : '#374151' }}>{question.helpText}</p>
                              </div>
                            )}
                          </div>
                        </div>
                        {question.isAnswered && (
                          <div className="flex-shrink-0">
                            <div className="p-2 rounded-full dark:bg-orange-900/50" style={{ backgroundColor: '#FFE4CC' }}>
                              <CheckCircle2 size={20} className="text-orange-600 dark:text-orange-400" />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Answer Input */}
                    <div className="px-6 pb-6">
                      <div className="relative">
                        <textarea
                          value={answers[question.questionId] || ''}
                          onChange={(e) => handleAnswerChange(question.questionId, e.target.value)}
                          placeholder={t('questionnaire.placeholder')}
                          rows={8}
                          className="w-full px-5 py-4 md:py-3 border-2 rounded-xl transition-all duration-200 resize-none focus:outline-none text-base min-h-[120px]"
                          style={{
                            backgroundColor: theme === 'dark' ? '#111827' : '#F9FAFB',
                            borderColor: isFocused ? momentumOrange : (theme === 'dark' ? '#374151' : '#E5E7EB'),
                            color: theme === 'dark' ? '#F9FAFB' : strategyBlue
                          }}
                          onFocus={(e) => {
                            setFocusedQuestion(question.questionId);
                            e.currentTarget.style.borderColor = momentumOrange;
                            e.currentTarget.style.backgroundColor = theme === 'dark' ? '#1F2937' : '#FFFFFF';
                          }}
                          onBlur={(e) => {
                            setFocusedQuestion(null);
                            e.currentTarget.style.borderColor = '';
                            e.currentTarget.style.backgroundColor = theme === 'dark' ? '#111827' : '#F9FAFB';
                          }}
                        />
                        {hasAnswer && (
                          <div className="absolute bottom-3 right-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            {saving === question.questionId ? (
                              <>
                                <Loader2 size={14} className="animate-spin text-blue-600 dark:text-blue-400" />
                                <span>{t('questionnaire.saving')}</span>
                              </>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Check size={14} className="text-orange-600 dark:text-orange-400" />
                                {t('questionnaire.autoSaved')}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 mt-4">
                        <button
                          onClick={() => handleManualSave(question.questionId)}
                          disabled={saving === question.questionId || !hasAnswer}
                          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 border-2"
                          style={{
                            color: momentumOrange,
                            borderColor: momentumOrange,
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => !saving && !hasAnswer && (e.currentTarget.style.backgroundColor = lightAIGrey)}
                          onMouseLeave={(e) => !saving && !hasAnswer && (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          {saving === question.questionId ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              <span>{t('questionnaire.saving')}</span>
                            </>
                          ) : (
                            <>
                              <Save size={16} />
                              <span>{t('questionnaire.saveNow')}</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleGetSuggestion(question.questionId)}
                          disabled={suggestingQuestionId === question.questionId}
                          className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            backgroundColor: momentumOrange,
                            color: '#FFFFFF'
                          }}
                          onMouseEnter={(e) => !(suggestingQuestionId === question.questionId) && (e.currentTarget.style.backgroundColor = momentumOrangeHover)}
                          onMouseLeave={(e) => !(suggestingQuestionId === question.questionId) && (e.currentTarget.style.backgroundColor = momentumOrange)}
                        >
                          {suggestingQuestionId === question.questionId ? (
                            <>
                              <Loader2 size={16} className="animate-spin" />
                              <span>{t('questionnaire.generating')}</span>
                            </>
                          ) : (
                            <>
                              <Sparkles size={16} />
                              <span>{t('questionnaire.aiSuggestion')}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Navigation Footer */}
            <div className="flex items-center justify-between pt-6 border-t-2 border-gray-200 dark:border-gray-700">
              <button
                onClick={() => handleSectionNavigation(Math.max(0, currentSection - 1))}
                disabled={currentSection === 0}
                className="flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold min-h-[44px] text-sm sm:text-base"
                style={{
                  color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
                  borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => !(currentSection === 0) && (e.currentTarget.style.borderColor = momentumOrange)}
                onMouseLeave={(e) => !(currentSection === 0) && (e.currentTarget.style.borderColor = '')}
              >
                <ArrowLeft size={20} />
                <span>{t('questionnaire.previousSection')}</span>
              </button>

              {currentSection === sections.length - 1 ? (
                <button
                  onClick={handleGeneratePlan}
                  disabled={!allAnswered || generating}
                  className="flex items-center gap-3 px-8 py-4 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: momentumOrange
                  }}
                  onMouseEnter={(e) => !generating && !allAnswered && (e.currentTarget.style.backgroundColor = momentumOrangeHover)}
                  onMouseLeave={(e) => !generating && !allAnswered && (e.currentTarget.style.backgroundColor = momentumOrange)}
                >
                  {generating ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      <span>{t('questionnaire.generatingPlan')}</span>
                    </>
                  ) : (
                    <>
                      <Zap size={20} />
                      <span>{t('questionnaire.generatePlan')}</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => {
                    const nextSection = currentSection + 1;
                    if (isSectionComplete(sections[currentSection])) {
                      handleSectionNavigation(nextSection);
                    } else {
                      setError(t('questionnaire.errorCompleteSection'));
                    }
                  }}
                  disabled={!isSectionComplete(sections[currentSection])}
                  className="flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-h-[44px] text-sm sm:text-base"
                  style={{
                    backgroundColor: momentumOrange
                  }}
                  onMouseEnter={(e) => {
                    if (isSectionComplete(sections[currentSection])) {
                      e.currentTarget.style.backgroundColor = momentumOrangeHover;
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isSectionComplete(sections[currentSection])) {
                      e.currentTarget.style.backgroundColor = momentumOrange;
                    }
                  }}
                >
                  <span>{t('questionnaire.nextSection')}</span>
                  <ArrowRight size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Generation Progress Modal */}
      {generating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full p-8 relative border-2" style={{ borderColor: momentumOrange }}>
            {/* Animated Business Plan Illustration */}
            <div className="flex justify-center mb-4">
              <div className="relative w-40 h-40">
                {/* Animated documents being built */}
                <svg className="w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  {/* Background circle with pulse animation */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke={momentumOrange} strokeWidth="2" opacity="0.2" className="animate-pulse" />
                  
                  {/* Document 1 - sliding in from left */}
                  <g className="animate-document-slide-1">
                    <rect x="30" y="60" width="40" height="50" rx="2" fill={strategyBlue} opacity="0.9" />
                    <line x1="35" y1="75" x2="65" y2="75" stroke="white" strokeWidth="1.5" />
                    <line x1="35" y1="85" x2="60" y2="85" stroke="white" strokeWidth="1.5" />
                    <line x1="35" y1="95" x2="55" y2="95" stroke="white" strokeWidth="1.5" />
                    <circle cx="50" cy="105" r="3" fill={momentumOrange} />
                  </g>
                  
                  {/* Document 2 - center, being written */}
                  <g className="animate-document-write">
                    <rect x="80" y="50" width="40" height="60" rx="2" fill={momentumOrange} opacity="0.95" />
                    <line x1="85" y1="65" x2="115" y2="65" stroke="white" strokeWidth="1.5" />
                    <line x1="85" y1="75" x2="110" y2="75" stroke="white" strokeWidth="1.5" />
                    <line x1="85" y1="85" x2="105" y2="85" stroke="white" strokeWidth="1.5" />
                    <line x1="85" y1="95" x2="100" y2="95" stroke="white" strokeWidth="1.5" />
                    {/* Animated writing line */}
                    <line x1="85" y1="105" x2="95" y2="105" stroke="white" strokeWidth="2" className="animate-writing-line" />
                  </g>
                  
                  {/* Document 3 - sliding in from right */}
                  <g className="animate-document-slide-2">
                    <rect x="130" y="70" width="40" height="50" rx="2" fill={strategyBlue} opacity="0.9" />
                    <line x1="135" y1="85" x2="165" y2="85" stroke="white" strokeWidth="1.5" />
                    <line x1="135" y1="95" x2="160" y2="95" stroke="white" strokeWidth="1.5" />
                    <line x1="135" y1="105" x2="155" y2="105" stroke="white" strokeWidth="1.5" />
                    <circle cx="150" cy="110" r="3" fill={momentumOrange} />
                  </g>
                  
                  {/* Chart/Graph icon - floating */}
                  <g className="animate-float">
                    <rect x="85" y="120" width="30" height="20" rx="2" fill="white" opacity="0.9" stroke={momentumOrange} strokeWidth="1.5" />
                    {/* Bar chart */}
                    <rect x="90" y="135" width="4" height="3" fill={momentumOrange} />
                    <rect x="96" y="132" width="4" height="6" fill={strategyBlue} />
                    <rect x="102" y="130" width="4" height="8" fill={momentumOrange} />
                    <rect x="108" y="133" width="4" height="5" fill={strategyBlue} />
                  </g>
                  
                  {/* Sparkles/Stars - rotating */}
                  <g className="animate-sparkle-1">
                    <circle cx="50" cy="40" r="2" fill={momentumOrange} opacity="0.8" />
                  </g>
                  <g className="animate-sparkle-2">
                    <circle cx="150" cy="50" r="2" fill={momentumOrange} opacity="0.8" />
                  </g>
                  <g className="animate-sparkle-3">
                    <circle cx="160" cy="130" r="2" fill={strategyBlue} opacity="0.8" />
                  </g>
                </svg>
              </div>
            </div>

            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2 text-center" style={{ color: theme === 'dark' ? '#F9FAFB' : strategyBlue }}>
                  {t('questionnaire.generation.title')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  {t('questionnaire.generation.subtitle')}
                </p>
              </div>
              {generationStatus?.status !== 'Completed' && (
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to cancel? The generation will continue in the background.')) {
                      if (statusPollInterval) {
                        clearInterval(statusPollInterval);
                        setStatusPollInterval(null);
                      }
                      setGenerating(false);
                      setGenerationStatus(null);
                      setGenerationStartTime(null);
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors ml-4 flex-shrink-0"
                  aria-label="Close"
                >
                  <X size={24} />
                </button>
              )}
            </div>

            {/* Progress Bar */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold" style={{ color: theme === 'dark' ? '#D1D5DB' : '#6B7280' }}>
                  {generationStatus?.currentStep || t('questionnaire.generation.step.initializing')}
                </span>
                <span className="text-sm font-bold" style={{ color: momentumOrange }}>
                  {Math.round(generationStatus?.progress || 5)}%
                </span>
              </div>
              <div className="w-full h-3 rounded-full overflow-hidden dark:bg-gray-700" style={{ backgroundColor: lightAIGrey }}>
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                  style={{ 
                    width: `${Math.max(2, generationStatus?.progress || 5)}%`,
                    backgroundColor: momentumOrange,
                    minWidth: '2%'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                </div>
              </div>
            </div>

            {/* Progress Steps */}
            <div className="space-y-3 mb-6">
              {getProgressSteps().map((step, index) => {
                const stepProgress = generationStatus?.progress || 5;
                const stepThreshold = (index + 1) * 20;
                const isActive = stepProgress >= stepThreshold - 10;
                const isCompleted = stepProgress >= stepThreshold;
                const StepIcon = step.icon;

                return (
                  <div
                    key={step.key}
                    className={`flex items-center gap-4 p-3 rounded-lg transition-all ${
                      isCompleted
                        ? 'bg-green-50 dark:bg-green-900/20 border-2'
                        : isActive
                        ? 'bg-orange-50 dark:bg-orange-900/20 border-2'
                        : 'bg-gray-50 dark:bg-gray-700/50 border-2 border-transparent'
                    }`}
                    style={isCompleted ? {
                      borderColor: '#10B981'
                    } : isActive ? {
                      borderColor: momentumOrange
                    } : {}}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? 'bg-green-500'
                        : isActive
                        ? 'bg-orange-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 size={20} className="text-white" />
                      ) : isActive ? (
                        <Loader2 size={20} className="text-white animate-spin" />
                      ) : (
                        <StepIcon size={20} className="text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                    <span className={`flex-1 text-sm font-medium ${
                      isCompleted
                        ? 'text-green-700 dark:text-green-300'
                        : isActive
                        ? 'text-orange-700 dark:text-orange-300'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Time Estimate */}
            {generationStatus?.status !== 'Completed' && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Loader2 size={16} className="animate-spin" />
                <span>
                  {generationStatus?.estimatedTimeRemaining 
                    ? (() => {
                        const minutes = Math.ceil(generationStatus.estimatedTimeRemaining / 60);
                        const unit = minutes === 1 ? t('questionnaire.generation.minute') : t('questionnaire.generation.minutes');
                        return t('questionnaire.generation.timeRemaining')
                          .replace('{minutes}', String(minutes))
                          .replace('{unit}', unit)
                          .replace('{plural}', minutes === 1 ? '' : 's');
                      })()
                    : getEstimatedTime() !== null && getEstimatedTime()! > 0
                    ? (() => {
                        const minutes = Math.ceil((getEstimatedTime() || 0) / 60);
                        const unit = minutes === 1 ? t('questionnaire.generation.minute') : t('questionnaire.generation.minutes');
                        return t('questionnaire.generation.timeRemaining')
                          .replace('{minutes}', String(minutes))
                          .replace('{unit}', unit)
                          .replace('{plural}', minutes === 1 ? '' : 's');
                      })()
                    : t('questionnaire.generation.processing')}
                </span>
              </div>
            )}

            {generationStatus?.status === 'Completed' && (
              <div className="flex items-center justify-center gap-2 text-sm font-semibold" style={{ color: '#10B981' }}>
                <CheckCircle2 size={20} />
                <span>{t('questionnaire.generation.redirecting')}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        @keyframes document-slide-1 {
          0% {
            transform: translateX(-30px);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-document-slide-1 {
          animation: document-slide-1 2s ease-out infinite;
        }
        @keyframes document-write {
          0%, 100% {
            transform: scale(1);
            opacity: 0.95;
          }
          50% {
            transform: scale(1.05);
            opacity: 1;
          }
        }
        .animate-document-write {
          animation: document-write 2s ease-in-out infinite;
        }
        @keyframes writing-line {
          0% {
            stroke-dasharray: 0, 20;
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            stroke-dasharray: 20, 0;
            opacity: 0;
          }
        }
        .animate-writing-line {
          animation: writing-line 1.5s ease-in-out infinite;
          stroke-dasharray: 10;
        }
        @keyframes document-slide-2 {
          0% {
            transform: translateX(30px);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .animate-document-slide-2 {
          animation: document-slide-2 2.5s ease-out infinite;
        }
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes sparkle-1 {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }
        .animate-sparkle-1 {
          animation: sparkle-1 2s ease-in-out infinite;
        }
        @keyframes sparkle-2 {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }
        .animate-sparkle-2 {
          animation: sparkle-2 2.5s ease-in-out infinite;
          animation-delay: 0.5s;
        }
        @keyframes sparkle-3 {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 1;
            transform: scale(1.5);
          }
        }
        .animate-sparkle-3 {
          animation: sparkle-3 2.2s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
