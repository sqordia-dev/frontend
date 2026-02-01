import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
    completedSections?: number;
    totalSections?: number;
    currentSection?: string;
  } | null>(null);
  const [statusPollInterval, setStatusPollInterval] = useState<NodeJS.Timeout | null>(null);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(null);
  // Use a ref to store both intervals together for proper cleanup
  const intervalsRef = useRef<{ statusPoll?: NodeJS.Timeout; progressPoll?: NodeJS.Timeout } | null>(null);

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

  // Navigate to next unanswered question when questions are first loaded (resume from last position)
  const hasNavigatedToUnanswered = useRef(false);
  useEffect(() => {
    if (questions.length > 0 && sections.length > 0 && !loading && !hasNavigatedToUnanswered.current) {
      hasNavigatedToUnanswered.current = true;
      
      // Find the first unanswered required question
      const firstUnansweredQuestion = questions.find(q => !q.isAnswered && q.isRequired);
      
      if (firstUnansweredQuestion) {
        // Find which section this question belongs to
        const questionSectionIndex = sections.findIndex(section => section === firstUnansweredQuestion.section);
        
        if (questionSectionIndex !== -1) {
          // Navigate to the section containing the first unanswered question
          if (questionSectionIndex !== currentSection) {
            setCurrentSection(questionSectionIndex);
          }
          
          // Scroll to the question after a short delay to ensure DOM is ready
          setTimeout(() => {
            const questionElement = document.querySelector(`[data-question-id="${firstUnansweredQuestion.questionId}"]`);
            if (questionElement) {
              questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
              // Focus the textarea
              const textarea = questionElement.querySelector('textarea');
              if (textarea) {
                setTimeout(() => {
                  textarea.focus();
                  setFocusedQuestion(firstUnansweredQuestion.questionId);
                }, 300);
              }
            }
          }, 500);
        }
      } else {
        // All required questions answered, go to last section
        if (currentSection !== sections.length - 1) {
          setCurrentSection(sections.length - 1);
        }
      }
    }
    
    // Reset flag when planId changes
    return () => {
      if (!planId) {
        hasNavigatedToUnanswered.current = false;
      }
    };
  }, [questions.length, sections.length, loading, planId]);

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
      // Persist answer to backend
      await businessPlanService.submitQuestionnaireResponses(planId, {
        questionTemplateId: questionId,
        responseText: answer
      });

      // Update local state and find next unanswered question
      setQuestions(prev => {
        const updatedQuestions = prev.map(q => {
          const qId = q.questionId || (q as any).id || (q as any).Id;
          return qId === questionId
            ? { ...q, isAnswered: true, responseText: answer }
            : q;
        });
        
        // Find next unanswered required question after current one
        const currentQuestionIndex = updatedQuestions.findIndex(q => {
          const qId = q.questionId || (q as any).id || (q as any).Id;
          return qId === questionId;
        });
        
        const nextUnansweredQuestion = updatedQuestions.slice(currentQuestionIndex + 1).find(q => !q.isAnswered && q.isRequired);
        
        if (nextUnansweredQuestion) {
          // Calculate sections from updated questions
          const questionsBySection = updatedQuestions.reduce((acc, q) => {
            if (!acc[q.section]) acc[q.section] = [];
            acc[q.section].push(q);
            return acc;
          }, {} as Record<string, QuestionnaireQuestion[]>);
          
          const updatedSections = SECTION_ORDER.filter(section => questionsBySection[section]);
          const nextSectionIndex = updatedSections.findIndex(section => section === nextUnansweredQuestion.section);
          
          // Navigate to next question after a delay
          setTimeout(() => {
            if (nextSectionIndex !== -1 && nextSectionIndex !== currentSection) {
              setCurrentSection(nextSectionIndex);
            }
            
            setTimeout(() => {
              const questionElement = document.querySelector(`[data-question-id="${nextUnansweredQuestion.questionId}"]`);
              if (questionElement) {
                questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const textarea = questionElement.querySelector('textarea');
                if (textarea) {
                  setTimeout(() => {
                    textarea.focus();
                    setFocusedQuestion(nextUnansweredQuestion.questionId);
                  }, 300);
                }
              }
            }, nextSectionIndex !== currentSection ? 300 : 0);
          }, 500);
        }
        
        return updatedQuestions;
      });

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

  // Get current step based on progress (fallback for simulated progress)
  const getCurrentStepFromProgress = useCallback((progress: number) => {
    if (progress < 10) return t('questionnaire.generation.step.initializing');
    if (progress < 30) return t('questionnaire.generation.step.analyzing');
    if (progress < 60) return t('questionnaire.generation.step.sections');
    if (progress < 85) return t('questionnaire.generation.step.financials');
    return t('questionnaire.generation.step.finalizing');
  }, [t]);

  // Map backend status to current step based on completed sections
  const getCurrentStepFromBackendStatus = useCallback((
    completedSections: number,
    totalSections: number,
    currentSection?: string
  ) => {
    // Financial sections typically start around section 12 (index 11) for BusinessPlan
    // For StrategicPlan, financial sections might be later due to additional sections
    // We'll use a percentage-based approach: financial sections start around 75-80% of total
    const financialSectionStart = Math.floor(totalSections * 0.75);
    
    if (completedSections === 0) {
      return t('questionnaire.generation.step.initializing');
    }
    if (completedSections < 2) {
      return t('questionnaire.generation.step.analyzing');
    }
    if (completedSections >= totalSections) {
      return t('questionnaire.generation.step.finalizing');
    }
    // Check if we're in financial sections
    if (currentSection) {
      const financialSections = ['FinancialProjections', 'FundingRequirements', 'RiskAnalysis', 'ExitStrategy'];
      if (financialSections.includes(currentSection)) {
        return t('questionnaire.generation.step.financials');
      }
    }
    if (completedSections >= financialSectionStart) {
      return t('questionnaire.generation.step.financials');
    }
    return t('questionnaire.generation.step.sections');
  }, [t]);

  // Poll generation status
  const pollGenerationStatus = useCallback(async () => {
    if (!planId) return;

    try {
      const status = await businessPlanService.getGenerationStatus(planId);
      
      // Log the response for debugging
      console.log('Generation status response:', status);
      
      // Try to extract progress from various possible fields
      // Backend returns: completionPercentage (from BusinessPlanGenerationStatus)
      let backendProgress = status?.completionPercentage ?? status?.CompletionPercentage ?? status?.progress ?? status?.Progress ?? status?.percentage ?? null;
      let backendStatus = status?.status || status?.Status || status?.state || null;
      let backendStep = status?.currentStep || status?.CurrentStep || status?.message || status?.step || status?.currentStage || null;
      
      // Enhanced logging to debug sync issues
      console.log('Raw backend status response:', JSON.stringify(status));
      
      // Extract section information from backend
      const completedSections = status?.completedSections ?? status?.CompletedSections ?? null;
      const totalSections = status?.totalSections ?? status?.TotalSections ?? null;
      const currentSection = status?.currentSection ?? status?.CurrentSection ?? null;
      
      // Calculate progress from backend if available
      let finalProgress: number;
      const backendStatusLower = (backendStatus || '').toLowerCase();
      
      if (backendProgress !== null && backendProgress !== undefined) {
        finalProgress = Number(backendProgress);
      } else if (completedSections !== null && totalSections !== null && totalSections > 0) {
        // Calculate progress from completed sections
        const sectionProgress = (completedSections / totalSections) * 100;
        // If generation is complete, show 100%, otherwise cap at 95% until truly complete
        if (backendStatusLower === 'generated' || backendStatusLower === 'completed' || completedSections >= totalSections) {
          finalProgress = 100;
        } else {
          finalProgress = Math.max(5, Math.min(95, Math.round(sectionProgress)));
        }
      } else {
        // Fallback to simulated progress
        finalProgress = calculateSimulatedProgress();
      }
      
      // Determine current step from backend status if available
      let finalStep: string;
      if (backendStep) {
        finalStep = backendStep;
      } else if (completedSections !== null && totalSections !== null) {
        finalStep = getCurrentStepFromBackendStatus(completedSections, totalSections, currentSection || undefined);
      } else {
        // Fallback to progress-based step
        finalStep = getCurrentStepFromProgress(finalProgress);
      }
      
      // Update status with progress information
      const updatedStatus = {
        status: backendStatus || 'InProgress',
        progress: finalProgress,
        currentStep: finalStep,
        estimatedTimeRemaining: status?.estimatedTimeRemaining || status?.EstimatedTimeRemaining,
        errorMessage: status?.errorMessage || status?.ErrorMessage || status?.error,
        completedSections: completedSections ?? undefined,
        totalSections: totalSections ?? undefined,
        currentSection: currentSection ?? undefined
      };
      
      console.log('Updated generation status:', updatedStatus);
      setGenerationStatus(updatedStatus);

      // If generation is complete, stop polling and navigate
      // Check multiple conditions for completion: explicit status OR all sections completed OR 100% progress
      const statusLower = (updatedStatus.status || '').toLowerCase();
      const isComplete = 
        statusLower === 'completed' || 
        statusLower === 'success' || 
        statusLower === 'generated' ||
        updatedStatus.progress === 100 ||
        (updatedStatus.completedSections && updatedStatus.totalSections && 
         updatedStatus.completedSections >= updatedStatus.totalSections && 
         statusLower !== 'generating' && statusLower !== 'inprogress' && statusLower !== 'draft');
      
      console.log('Checking completion:', {
        status: updatedStatus.status,
        statusLower,
        progress: updatedStatus.progress,
        completedSections: updatedStatus.completedSections,
        totalSections: updatedStatus.totalSections,
        isComplete
      });
      
      if (isComplete) {
        // Cleanup both intervals
        if (intervalsRef.current) {
          if (intervalsRef.current.statusPoll) {
            clearInterval(intervalsRef.current.statusPoll);
          }
          if (intervalsRef.current.progressPoll) {
            clearInterval(intervalsRef.current.progressPoll);
          }
          intervalsRef.current = null;
        }
        setStatusPollInterval(null);
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
          navigate(`/plans/${planId}`);
        }, 1500);
        return;
      }

      // If generation failed, stop polling
      if (updatedStatus.status === 'Failed' || updatedStatus.status === 'failed' || updatedStatus.status === 'Error') {
        // Cleanup both intervals
        if (intervalsRef.current) {
          if (intervalsRef.current.statusPoll) {
            clearInterval(intervalsRef.current.statusPoll);
          }
          if (intervalsRef.current.progressPoll) {
            clearInterval(intervalsRef.current.progressPoll);
          }
          intervalsRef.current = null;
        }
        setStatusPollInterval(null);
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
        // Cleanup both intervals
        if (intervalsRef.current) {
          if (intervalsRef.current.statusPoll) {
            clearInterval(intervalsRef.current.statusPoll);
          }
          if (intervalsRef.current.progressPoll) {
            clearInterval(intervalsRef.current.progressPoll);
          }
          intervalsRef.current = null;
        }
        setStatusPollInterval(null);
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
      const statusPoll = setInterval(() => {
        pollGenerationStatus();
      }, 2000);
      setStatusPollInterval(statusPoll);

      // Also poll immediately after a short delay
      setTimeout(() => {
        pollGenerationStatus();
      }, 1000);

      // Also update progress locally every second as fallback
      // This ensures progress updates even if backend doesn't respond
      const progressPoll = setInterval(() => {
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

      // Store both intervals in ref for cleanup
      intervalsRef.current = {
        statusPoll,
        progressPoll
      };
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
      // Cleanup both intervals
      if (intervalsRef.current) {
        if (intervalsRef.current.statusPoll) {
          clearInterval(intervalsRef.current.statusPoll);
        }
        if (intervalsRef.current.progressPoll) {
          clearInterval(intervalsRef.current.progressPoll);
        }
        intervalsRef.current = null;
      }
      if (statusPollInterval) {
        clearInterval(statusPollInterval);
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
            <div className="absolute inset-0 border-4 rounded-full border-[#F4F7FA] dark:border-gray-700"></div>
            <div className="absolute inset-0 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-semibold mb-2 text-[#1A2B47] dark:text-gray-50">{t('questionnaire.loading')}</p>
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
              className="group flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 hover:opacity-80 transition-opacity font-medium text-sm min-h-[44px] sm:min-h-0 text-gray-500 dark:text-gray-400"
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
                className="flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-2 text-sm font-semibold bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all min-h-[44px] sm:min-h-0 text-[#1A2B47] dark:text-gray-100"
              >
                <Languages size={16} />
                <span>{language === 'en' ? 'FR' : 'EN'}</span>
              </button>

              {questions.length > 0 && (
                <div className="flex items-center gap-3 px-5 py-2.5 rounded-lg border-2 bg-[#F4F7FA] dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full animate-pulse bg-[#FF6B00]"></div>
                    <span className="text-sm font-bold text-[#1A2B47] dark:text-gray-50">
                      {calculatedProgress.completedQuestions}/{calculatedProgress.totalQuestions}
                    </span>
                  </div>
                  <div className="h-5 w-px bg-gray-300 dark:bg-gray-600"></div>
                  <span className="text-sm font-bold text-[#FF6B00]">
                    {Math.round(calculatedProgress.completionPercentage)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {questions.length > 0 && (
            <div className="relative">
              <div className="w-full rounded-full h-3 overflow-hidden bg-[#F4F7FA] dark:bg-gray-700 shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden bg-[#FF6B00]"
                  style={{
                    width: `${calculatedProgress.completionPercentage}%`,
                    minWidth: '2%'
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
                  <div className="p-2 rounded-lg bg-[#FF6B00]">
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
              <div className="text-xs font-bold text-[#FF6B00]">
                {getSectionProgress(sections[currentSection]).answered}/{getSectionProgress(sections[currentSection]).total}
              </div>
            </div>
            <div className="flex-1 h-2 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 shadow-inner">
              <div
                className="h-full rounded-full transition-all duration-300 bg-[#FF6B00]"
                style={{
                  width: `${getSectionProgress(sections[currentSection]).percentage}%`,
                  minWidth: '2%'
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
                <div className="p-2.5 rounded-lg bg-[#1A2B47]">
                  <Target className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-bold text-[#1A2B47] dark:text-gray-50">{t('questionnaire.sections')}</h3>
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
                        backgroundColor: theme === 'dark' ? '#1F2937' : '#F4F7FA',
                        borderColor: '#FF6B00',
                        borderWidth: '2px'
                      } : isComplete ? {
                        backgroundColor: theme === 'dark' ? '#064E3B' : '#F0FDF4',
                        borderColor: theme === 'dark' ? '#CC4A00' : '#FFB366'
                      } : {
                        backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF'
                      }}
                    >
                      <div className="flex items-start gap-4">
                        {/* Progress Ring */}
                        <div className="relative w-12 h-12 flex-shrink-0 mt-0.5">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                              className={isCurrent 
                                ? 'text-gray-300 dark:text-gray-600' 
                                : 'text-gray-200 dark:text-gray-700'
                              }
                            />
                            <circle
                              cx="24"
                              cy="24"
                              r="20"
                              fill="none"
                              stroke={isComplete ? '#10B981' : '#FF6B00'}
                              strokeWidth="3"
                              strokeDasharray={`${percentage * 1.26} 126`}
                              className="transition-all duration-500"
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            {isComplete ? (
                              <CheckCircle2 size={18} className={isCurrent ? 'text-white' : 'text-green-600 dark:text-green-400'} />
                            ) : (
                              <div className={`p-1.5 rounded-lg ${
                                isCurrent 
                                  ? '' 
                                  : 'bg-gray-100 dark:bg-gray-700'
                              }`}
                              style={isCurrent ? {
                                backgroundColor: '#FF6B00'
                              } : {}}
                              >
                                <Icon size={14} className={isCurrent ? 'text-white' : 'text-gray-500 dark:text-gray-400'} />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-sm font-bold mb-1 text-[#1A2B47] dark:text-gray-50 ${
                            isCurrent
                              ? ''
                              : ''
                          }`}
                          >
                            {t('questionnaire.section')} {index + 1}
                          </div>
                          <div className={`text-xs mb-2 line-clamp-2 ${
                            isCurrent
                              ? 'text-gray-500 dark:text-gray-300'
                              : 'text-gray-500 dark:text-gray-400'
                          }`}
                          >
                            {section}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className={`flex-1 h-1.5 rounded-full overflow-hidden ${
                              isCurrent
                                ? 'bg-gray-200 dark:bg-gray-700'
                                : 'bg-gray-200 dark:bg-gray-600'
                            }`}
                            >
                              <div
                                className="h-full rounded-full transition-all duration-300 bg-[#FF6B00]"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className={`text-xs font-semibold ${
                              isCurrent
                                ? 'text-gray-500 dark:text-gray-300'
                                : 'text-gray-400 dark:text-gray-500'
                            }`}>
                              {answered}/{total}
                            </span>
                          </div>
                        </div>
                        {isCurrent && (
                          <ChevronRight size={16} className="flex-shrink-0 mt-1 text-[#FF6B00]" />
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
            {/* Section Header - Modern Design */}
            <div className="rounded-2xl shadow-xl p-8 relative overflow-hidden border-2 bg-[#1A2B47] border-[#FF6B00]">
              {/* Subtle Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0" style={{
                  backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                  backgroundSize: '40px 40px'
                }} />
              </div>
              
              <div className="relative z-10">
                <div className="flex items-start gap-6 mb-6">
                  {/* Section Icon with Progress Ring */}
                  {SECTION_ICONS[currentSection] && (() => {
                    const Icon = SECTION_ICONS[currentSection];
                    const sectionProgress = getSectionProgress(sections[currentSection]);
                    const progressPercentage = sectionProgress.percentage;
                    const circumference = 2 * Math.PI * 36; // radius = 36
                    const strokeDasharray = `${(progressPercentage / 100) * circumference} ${circumference}`;
                    
                    return (
                      <div className="relative w-20 h-20 flex-shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                          <circle
                            cx="40"
                            cy="40"
                            r="36"
                            fill="none"
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="4"
                          />
                          <circle
                            cx="40"
                            cy="40"
                            r="36"
                            fill="none"
                            stroke="#FF6B00"
                            strokeWidth="4"
                            strokeDasharray={strokeDasharray}
                            className="transition-all duration-500"
                            strokeLinecap="round"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="p-3 rounded-xl bg-[#FF6B00]">
                            <Icon size={24} className="text-white" />
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                  
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-white/90 mb-2 uppercase tracking-wide">
                      {t('questionnaire.sectionOf').replace('{current}', String(currentSection + 1)).replace('{total}', String(sections.length))}
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                      {sections[currentSection]}
                    </h2>
                    <p className="text-white/80 text-lg">
                      {t('questionnaire.questionsCompleted').replace('{answered}', String(getSectionProgress(sections[currentSection]).answered)).replace('{total}', String(getSectionProgress(sections[currentSection]).total))}
                    </p>
                  </div>
                </div>
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
                    data-question-id={question.questionId}
                    className={`group relative bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 transition-all duration-300 overflow-hidden ${
                      question.isAnswered
                        ? 'border-green-300 dark:border-green-700'
                        : isFocused
                        ? 'shadow-xl scale-[1.02] border-orange-400'
                        : 'border-gray-200 dark:border-gray-700 hover:shadow-xl hover:-translate-y-1'
                    }`}
                    style={isFocused && !question.isAnswered ? {
                      borderColor: '#FF6B00'
                    } : {}}
                    onFocus={() => setFocusedQuestion(question.questionId)}
                    onBlur={() => setFocusedQuestion(null)}
                  >
                    {/* Question Number Indicator Bar */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-all duration-300"
                      style={{
                        backgroundColor: question.isAnswered
                          ? '#10B981'
                          : isFocused
                          ? '#FF6B00'
                          : 'transparent'
                      }}
                    />
                    {/* Completion Accent Bar */}
                    {question.isAnswered && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
                    )}
                    
                    {/* Question Header - Prominent Display */}
                    <div className="p-6 pb-4">
                      {/* Question Text - Highly Visible Container */}
                      <div className="mb-6 p-6 sm:p-8 rounded-xl border-[3px] bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600" style={{
                        boxShadow: theme === 'dark'
                          ? '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                          : '0 10px 25px -5px rgba(0, 0, 0, 0.1)'
                      }}>
                        <div className="flex items-start gap-4">
                          {/* Question Number Badge */}
                          <div className={`flex items-center justify-center w-14 h-14 rounded-xl font-bold text-lg flex-shrink-0 transition-all duration-300 ${
                            question.isAnswered
                              ? 'text-white shadow-lg'
                              : isFocused
                              ? 'text-white shadow-lg scale-110'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                          }`}
                          style={question.isAnswered ? {
                            backgroundColor: '#10B981'
                          } : isFocused ? {
                            backgroundColor: '#FF6B00'
                          } : {}}
                          >
                            {question.order}
                          </div>
                          
                          {/* Question Text */}
                          <div className="flex-1">
                            <h3 className={`text-3xl sm:text-4xl md:text-5xl font-black mb-4 transition-colors leading-tight ${
                              question.isAnswered
                                ? ''
                                : ''
                            }`}
                            style={question.isAnswered ? {
                              color: theme === 'dark' ? '#34D399' : '#10B981',
                              fontWeight: 900,
                              fontSize: 'clamp(24px, 5vw, 48px)'
                            } : {
                              color: theme === 'dark' ? '#FFFFFF' : '#1A2B47',
                              fontWeight: 900,
                              letterSpacing: '-0.02em',
                              fontSize: 'clamp(24px, 5vw, 48px)',
                              lineHeight: '1.2'
                            }}
                            >
                              {question.questionText}
                              {question.isRequired && (
                                <span className="ml-2 text-red-500 dark:text-red-400 font-black" aria-label="Required" style={{ fontSize: '1.1em' }}>*</span>
                              )}
                            </h3>
                            
                            {/* Question Metadata */}
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-md text-[#FF6B00] border border-[#FF6B00]" style={{
                                backgroundColor: theme === 'dark' ? '#1F2937' : '#FFE4CC'
                              }}>
                                Question {question.order}
                              </span>
                              {question.isRequired && (
                                <span className="text-xs font-semibold px-3 py-1.5 rounded-md" style={{ 
                                  color: '#DC2626',
                                  backgroundColor: theme === 'dark' ? '#7F1D1D' : '#FEE2E2'
                                }}>
                                  Required Field
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {/* Completion Badge */}
                          {question.isAnswered && (
                            <div className="flex-shrink-0">
                              <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg bg-emerald-500">
                                <CheckCircle2 size={24} className="text-white" />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Help Text */}
                      {question.helpText && (
                        <div className="flex items-start gap-3 p-4 rounded-xl border-2 mb-4 bg-[#F4F7FA] dark:bg-gray-800 border-gray-300 dark:border-gray-600">
                          <div className="flex-shrink-0 mt-0.5 p-1.5 rounded-lg" style={{ backgroundColor: theme === 'dark' ? '#374151' : '#FFE4CC' }}>
                            <Lightbulb size={16} className="text-[#FF6B00]" />
                          </div>
                          <p className="text-sm font-medium leading-relaxed text-gray-900 dark:text-gray-200">{question.helpText}</p>
                        </div>
                      )}
                    </div>

                    {/* Answer Input - Modern Design */}
                    <div className="px-6 pb-6">
                      <div className="relative">
                        {/* Floating Label (appears on focus) */}
                        {isFocused && (
                          <div className="absolute -top-2 left-4 px-2 py-0.5 rounded-md z-10 transition-all duration-200 bg-white dark:bg-gray-800 border border-[#FF6B00]">
                            <span className="text-xs font-semibold text-[#FF6B00]">
                              Question {question.order}
                            </span>
                          </div>
                        )}
                        
                        {/* Textarea Container */}
                        <div className="relative">
                          <textarea
                            value={answers[question.questionId] || ''}
                            onChange={(e) => {
                              const textarea = e.target;
                              handleAnswerChange(question.questionId, textarea.value);
                              
                              // Auto-resize functionality
                              textarea.style.height = 'auto';
                              const newHeight = Math.min(Math.max(textarea.scrollHeight, 150), 400);
                              textarea.style.height = `${newHeight}px`;
                            }}
                            placeholder={t('questionnaire.placeholder') || 'Share your thoughts here... Be as detailed as you\'d like.'}
                            rows={6}
                            className={`w-full px-5 py-4 border-2 rounded-xl transition-all duration-200 resize-none focus:outline-none focus:ring-4 text-base text-[#1A2B47] dark:text-gray-50 leading-[1.7] min-h-[150px] max-h-[400px] font-sans ${
                              isFocused
                                ? 'focus:ring-orange-200 dark:focus:ring-orange-900 shadow-lg'
                                : question.isAnswered
                                ? 'shadow-sm'
                                : 'shadow-sm'
                            }`}
                            style={{
                              backgroundColor: isFocused
                                ? (theme === 'dark' ? '#1F2937' : '#FFFFFF')
                                : question.isAnswered
                                ? (theme === 'dark' ? '#064E3B' : '#F0FDF4')
                                : (theme === 'dark' ? '#111827' : '#F9FAFB'),
                              borderColor: isFocused
                                ? '#FF6B00'
                                : question.isAnswered
                                ? '#10B981'
                                : (theme === 'dark' ? '#374151' : '#E5E7EB'),
                              fontSize: '16px'
                            }}
                            onFocus={(e) => {
                              setFocusedQuestion(question.questionId);
                            }}
                            onBlur={(e) => {
                              setFocusedQuestion(null);
                            }}
                          />
                          
                          {/* Character Counter - Modern Floating Badge (Always Visible) */}
                          <div className={`
                            absolute bottom-3 right-3
                            px-2.5 py-1
                            rounded-full
                            text-xs font-medium
                            transition-all duration-200
                            ${hasAnswer || isFocused
                              ? 'bg-white/90 dark:bg-gray-800/90 shadow-md border border-gray-200 dark:border-gray-700 backdrop-blur-sm' 
                              : 'bg-transparent'
                            }
                          `}>
                            <span className={`
                              ${(answers[question.questionId] || '').length > 0 
                                ? 'text-gray-600 dark:text-gray-400' 
                                : 'text-gray-400 dark:text-gray-500'
                              }
                            `}>
                              {(answers[question.questionId] || '').length} {(answers[question.questionId] || '').length === 1 ? 'character' : 'characters'}
                            </span>
                          </div>
                          
                          {/* Save Status Indicator - Top Right */}
                          {hasAnswer && (
                            <div className={`
                              absolute top-3 right-3
                              px-3 py-1.5
                              rounded-full
                              flex items-center gap-1.5
                              text-xs font-medium
                              shadow-lg
                              transition-all duration-300
                              ${saving === question.questionId
                                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                                : 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                              }
                            `}>
                              {saving === question.questionId ? (
                                <>
                                  <Loader2 size={12} className="animate-spin" />
                                  <span>{t('questionnaire.saving')}</span>
                                </>
                              ) : (
                                <>
                                  <Check size={12} />
                                  <span>Saved</span>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Helper Text Below Textarea */}
                        {question.helpText && !isFocused && (
                          <div className="mt-2 flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Lightbulb size={14} className="text-[#FF6B00] flex-shrink-0 mt-0.5" />
                            <span>{question.helpText}</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-3 mt-6">
                        <button
                          onClick={() => handleManualSave(question.questionId)}
                          disabled={saving === question.questionId || !hasAnswer}
                          className={`flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 border-2 ${
                            hasAnswer ? 'hover:shadow-md' : ''
                          }`}
                          style={{
                            color: hasAnswer ? '#10B981' : '#9CA3AF',
                            borderColor: hasAnswer ? '#10B981' : '#D1D5DB',
                            backgroundColor: 'transparent'
                          }}
                          onMouseEnter={(e) => {
                            if (hasAnswer && !(saving === question.questionId)) {
                              e.currentTarget.style.backgroundColor = theme === 'dark' ? '#064E3B' : '#F0FDF4';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (hasAnswer && !(saving === question.questionId)) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          {saving === question.questionId ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              <span>{t('questionnaire.saving')}</span>
                            </>
                          ) : (
                            <>
                              <Save size={18} />
                              <span>{t('questionnaire.saveNow')}</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleGetSuggestion(question.questionId)}
                          disabled={suggestingQuestionId === question.questionId}
                          className="flex items-center gap-2 px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-75 disabled:cursor-not-allowed shadow-lg hover:shadow-xl bg-[#FF6B00] hover:bg-[#E55F00] text-white"
                        >
                          {suggestingQuestionId === question.questionId ? (
                            <>
                              <Loader2 size={18} className="animate-spin" />
                              <span>{t('questionnaire.generating')}</span>
                            </>
                          ) : (
                            <>
                              <Sparkles size={18} />
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
                className="flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold min-h-[44px] text-sm sm:text-base text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 bg-transparent hover:border-[#FF6B00]"
              >
                <ArrowLeft size={20} />
                <span>{t('questionnaire.previousSection')}</span>
              </button>

              {currentSection === sections.length - 1 ? (
                <button
                  onClick={handleGeneratePlan}
                  disabled={!allAnswered || generating}
                  className="flex items-center gap-3 px-8 py-4 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 bg-[#FF6B00] hover:bg-[#E55F00]"
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
                  className="flex items-center gap-2 sm:gap-3 px-6 sm:px-8 py-3 sm:py-4 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-h-[44px] text-sm sm:text-base bg-[#FF6B00] hover:bg-[#E55F00]"
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full p-8 relative border-2 border-[#FF6B00]">
            {/* Animated Business Plan Illustration */}
            <div className="flex justify-center mb-4">
              <div className="relative w-40 h-40">
                {/* Animated documents being built */}
                <svg className="w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  {/* Background circle with pulse animation */}
                  <circle cx="100" cy="100" r="80" fill="none" stroke="#FF6B00" strokeWidth="2" opacity="0.2" className="animate-pulse" />
                  
                  {/* Document 1 - sliding in from left */}
                  <g className="animate-document-slide-1">
                    <rect x="30" y="60" width="40" height="50" rx="2" fill="#1A2B47" opacity="0.9" />
                    <line x1="35" y1="75" x2="65" y2="75" stroke="white" strokeWidth="1.5" />
                    <line x1="35" y1="85" x2="60" y2="85" stroke="white" strokeWidth="1.5" />
                    <line x1="35" y1="95" x2="55" y2="95" stroke="white" strokeWidth="1.5" />
                    <circle cx="50" cy="105" r="3" fill="#FF6B00" />
                  </g>
                  
                  {/* Document 2 - center, being written */}
                  <g className="animate-document-write">
                    <rect x="80" y="50" width="40" height="60" rx="2" fill="#FF6B00" opacity="0.95" />
                    <line x1="85" y1="65" x2="115" y2="65" stroke="white" strokeWidth="1.5" />
                    <line x1="85" y1="75" x2="110" y2="75" stroke="white" strokeWidth="1.5" />
                    <line x1="85" y1="85" x2="105" y2="85" stroke="white" strokeWidth="1.5" />
                    <line x1="85" y1="95" x2="100" y2="95" stroke="white" strokeWidth="1.5" />
                    {/* Animated writing line */}
                    <line x1="85" y1="105" x2="95" y2="105" stroke="white" strokeWidth="2" className="animate-writing-line" />
                  </g>
                  
                  {/* Document 3 - sliding in from right */}
                  <g className="animate-document-slide-2">
                    <rect x="130" y="70" width="40" height="50" rx="2" fill="#1A2B47" opacity="0.9" />
                    <line x1="135" y1="85" x2="165" y2="85" stroke="white" strokeWidth="1.5" />
                    <line x1="135" y1="95" x2="160" y2="95" stroke="white" strokeWidth="1.5" />
                    <line x1="135" y1="105" x2="155" y2="105" stroke="white" strokeWidth="1.5" />
                    <circle cx="150" cy="110" r="3" fill="#FF6B00" />
                  </g>
                  
                  {/* Chart/Graph icon - floating */}
                  <g className="animate-float">
                    <rect x="85" y="120" width="30" height="20" rx="2" fill="white" opacity="0.9" stroke="#FF6B00" strokeWidth="1.5" />
                    {/* Bar chart */}
                    <rect x="90" y="135" width="4" height="3" fill="#FF6B00" />
                    <rect x="96" y="132" width="4" height="6" fill="#1A2B47" />
                    <rect x="102" y="130" width="4" height="8" fill="#FF6B00" />
                    <rect x="108" y="133" width="4" height="5" fill="#1A2B47" />
                  </g>
                  
                  {/* Sparkles/Stars - rotating */}
                  <g className="animate-sparkle-1">
                    <circle cx="50" cy="40" r="2" fill="#FF6B00" opacity="0.8" />
                  </g>
                  <g className="animate-sparkle-2">
                    <circle cx="150" cy="50" r="2" fill="#FF6B00" opacity="0.8" />
                  </g>
                  <g className="animate-sparkle-3">
                    <circle cx="160" cy="130" r="2" fill="#1A2B47" opacity="0.8" />
                  </g>
                </svg>
              </div>
            </div>

            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-2 text-center text-[#1A2B47] dark:text-gray-50">
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
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-300">
                  {generationStatus?.currentStep || t('questionnaire.generation.step.initializing')}
                </span>
                <span className="text-sm font-bold text-[#FF6B00]">
                  {Math.round(generationStatus?.progress || 5)}%
                </span>
              </div>
              <div className="w-full h-3 rounded-full overflow-hidden bg-[#F4F7FA] dark:bg-gray-700">
                <div
                  className="h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden bg-[#FF6B00]"
                  style={{
                    width: `${Math.max(2, generationStatus?.progress || 5)}%`,
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
                const currentStepKey = generationStatus?.currentStep || t('questionnaire.generation.step.initializing');
                const stepKeys = [
                  t('questionnaire.generation.step.initializing'),
                  t('questionnaire.generation.step.analyzing'),
                  t('questionnaire.generation.step.sections'),
                  t('questionnaire.generation.step.financials'),
                  t('questionnaire.generation.step.finalizing')
                ];
                
                // Check if generation is complete
                const isGenerationComplete = generationStatus?.status === 'Generated' || 
                                            generationStatus?.status === 'Completed' || 
                                            generationStatus?.status === 'completed' ||
                                            (generationStatus?.completedSections !== undefined && 
                                             generationStatus?.totalSections !== undefined &&
                                             generationStatus.completedSections >= generationStatus.totalSections);
                
                // Find the index of the current step
                const currentStepIndex = stepKeys.findIndex(key => key === currentStepKey);
                // If step not found, default to first step (initializing)
                const effectiveStepIndex = currentStepIndex >= 0 ? currentStepIndex : 0;
                
                // Determine step state
                // If generation is complete, all steps are completed
                const isCompleted = isGenerationComplete || index < effectiveStepIndex;
                const isActive = !isGenerationComplete && index === effectiveStepIndex;
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
                      borderColor: '#FF6B00'
                    } : {}}
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-green-500'
                        : isActive
                        ? 'bg-orange-500'
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 size={20} className="text-white" />
                      ) : isActive ? (
                        <StepIcon size={20} className="text-white" />
                      ) : (
                        <StepIcon size={20} className="text-gray-500 dark:text-gray-400" />
                      )}
                    </div>
                    <span className={`flex-1 text-sm font-medium transition-colors ${
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
              <div className="flex items-center justify-center gap-2 text-sm font-semibold text-emerald-500">
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
        
        /* Textarea Focus Animation */
        @keyframes focus-pulse {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(255, 107, 0, 0);
          }
          50% {
            box-shadow: 0 0 0 4px rgba(255, 107, 0, 0.1);
          }
        }
        
        /* Smooth textarea resize */
        textarea {
          transition: height 0.2s ease-out;
        }
        
        /* Placeholder animation */
        textarea::placeholder {
          transition: opacity 0.2s ease-out;
          opacity: 0.6;
        }
        
        textarea:focus::placeholder {
          opacity: 0.4;
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
