import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Loader2,
  AlertCircle,
  ChevronRight,
  X,
  Building2,
  Lightbulb,
  Target,
  Users,
  DollarSign,
  UserPlus,
  Calculator,
  Sun,
  Moon,
  User,
  Keyboard,
  Command,
  Rocket,
  Clock,
  BookmarkCheck,
  LogOut,
  CreditCard,
} from 'lucide-react';
import { businessPlanService } from '../lib/business-plan-service';
import { useTheme } from '../contexts/ThemeContext';
import { QuestionnaireProvider, useQuestionnaire } from '../contexts/QuestionnaireContext';
import { getUserFriendlyError } from '../utils/error-messages';
import { useToast } from '../contexts/ToastContext';
import { PersonaType, User as UserType } from '../lib/types';
import SEO from '../components/SEO';
import { useFeatureFlag } from '../hooks/useFeatureFlag';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { apiClient } from '../lib/api-client';
import LanguageDropdown from '../components/layout/LanguageDropdown';
import { authService } from '../lib/auth-service';
import { motion, AnimatePresence } from 'framer-motion';
import { organizationService } from '../lib/organization-service';
import ProfileContextPanel from '../components/questionnaire/ProfileContextPanel';
import type { OrganizationProfile, SkippedQuestionDto } from '../types/organization-profile';
import SectionSidebar from '../components/questionnaire/SectionSidebar';
import ProfileCompletionBanner from '../components/ProfileCompletionBanner';
import QuestionCard from '../components/questionnaire/QuestionCard';
import CoachPanel from '../components/questionnaire/CoachPanel';
import { evaluateAnswerCompleteness } from '../lib/ai-evaluation-service';

interface Question {
  id: string;
  questionNumber?: number;
  questionText: string;
  questionTextEN?: string;
  helpText?: string;
  helpTextEN?: string;
  questionType: string;
  order: number;
  isRequired: boolean;
  stepNumber: number;
  responseText?: string;
  isAnswered: boolean;
  // V3 fields for AI coaching and expert advice
  coachPromptFR?: string;
  coachPromptEN?: string;
  expertAdviceFR?: string;
  expertAdviceEN?: string;
}

interface StepInfo {
  number: number;
  title: string;
  titleFr: string;
  description?: string;
  descriptionFr?: string;
  icon: React.ElementType;
}

// Helper to create a property-access proxy over the global t() function for interview keys
function createInterviewTranslations(t: (key: string) => string) {
  return {
    loading: t('interview.loading'),
    seoTitle: t('interview.seoTitle'),
    seoDescription: t('interview.seoDescription'),
    backToDashboard: t('interview.backToDashboard'),
    answered: t('interview.answered'),
    sections: t('interview.sections'),
    placeholder: t('interview.placeholder'),
    previous: t('interview.previous'),
    next: t('interview.next'),
    questionOf: t('interview.questionOf'),
    sectionOf: t('interview.sectionOf'),
    sectionProgress: t('interview.sectionProgress'),
    generatePlan: t('interview.generatePlan'),
    saveError: t('interview.saveError'),
    shortcuts: t('interview.shortcuts'),
    shortcutsTitle: t('interview.shortcutsTitle'),
    shortcutNext: t('interview.shortcutNext'),
    shortcutPrev: t('interview.shortcutPrev'),
    shortcutCoach: t('interview.shortcutCoach'),
    shortcutSave: t('interview.shortcutSave'),
    shortcutClose: t('interview.shortcutClose'),
    shortcutHelp: t('interview.shortcutHelp'),
    pressKey: t('interview.pressKey'),
    toClose: t('interview.toClose'),
    autoSaving: t('interview.autoSaving'),
    autoSaved: t('interview.autoSaved'),
    autoSaveError: t('interview.autoSaveError'),
    unsavedChanges: t('interview.unsavedChanges'),
    proactiveTitle: t('interview.proactiveTitle'),
    proactiveDraft: t('interview.proactiveDraft'),
    proactiveHint: t('interview.proactiveHint'),
    generatePreview: t('interview.generatePreview'),
    generatePreviewTooltip: t('interview.generatePreviewTooltip'),
    generatePreviewTitle: t('interview.generatePreviewTitle'),
    generatePreviewBody: t('interview.generatePreviewBody'),
    generatePreviewConfirm: t('interview.generatePreviewConfirm'),
    generatePreviewCancel: t('interview.generatePreviewCancel'),
    welcomeHeading: t('interview.welcomeHeading'),
    welcomeSubtext: t('interview.welcomeSubtext'),
    welcomeSaveNote: t('interview.welcomeSaveNote'),
    welcomeEstimate: t('interview.welcomeEstimate'),
    welcomeCta: t('interview.welcomeCta'),
    welcomeSections: t('interview.welcomeSections'),
    interviewComplete: t('interview.interviewComplete'),
    interviewCompleteDesc: t('interview.interviewCompleteDesc'),
    viewCompanyContext: t('interview.viewCompanyContext'),
    context: t('interview.context'),
    questionsAnswered: t('interview.questionsAnswered'),
  };
}

// Section intro messages (extracted from AIInterviewer)
const SECTION_INTROS: Record<string, { en: string; fr: string }> = {
  'Identity & Vision': {
    en: "Let's start with the foundation of your business. This section helps define who you are.",
    fr: "Commençons par les fondations de votre entreprise. Cette section aide à définir qui vous êtes.",
  },
  'The Offering': {
    en: "Now let's explore what makes your product or service unique.",
    fr: "Explorons maintenant ce qui rend votre produit ou service unique.",
  },
  'Market Analysis': {
    en: "Understanding your market is crucial. Let's map out your opportunity.",
    fr: "Comprendre votre marché est crucial. Cartographions votre opportunité.",
  },
  'Operations & People': {
    en: "Time to think about how you'll run things day-to-day.",
    fr: "Il est temps de réfléchir à la gestion quotidienne.",
  },
  'Financials & Risks': {
    en: "Let's get into the numbers - this is where your plan becomes bankable.",
    fr: "Passons aux chiffres - c'est ici que votre plan devient finançable.",
  },
  'Team': {
    en: "Great teams build great companies. Tell me about yours.",
    fr: "Les grandes équipes bâtissent de grandes entreprises. Parlez-moi de la vôtre.",
  },
  'Financials': {
    en: "Final stretch! Let's nail down your financial projections.",
    fr: "Dernière ligne droite! Finalisons vos projections financières.",
  },
};

// Step configurations
const STEPS: StepInfo[] = [
  { number: 1, title: 'Identity & Vision', titleFr: "Identité et Vision", icon: Building2 },
  { number: 2, title: 'The Offering', titleFr: "L'Offre", icon: Lightbulb },
  { number: 3, title: 'Market Analysis', titleFr: 'Analyse de marché', icon: Target },
  { number: 4, title: 'Operations & People', titleFr: 'Opérations et Personnel', icon: Users },
  { number: 5, title: 'Financials & Risks', titleFr: 'Finances et Risques', icon: DollarSign },
  { number: 6, title: 'Team', titleFr: 'Équipe', icon: UserPlus },
  { number: 7, title: 'Financials', titleFr: 'Finances', icon: Calculator },
];

// Inner component that uses the questionnaire context
function InterviewQuestionnaireContent() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { theme, language, toggleTheme, t: globalT } = useTheme();
  const t = useMemo(() => createInterviewTranslations(globalT), [language, globalT]);
  const toast = useToast();

  // Get context for global answer tracking and business context
  const {
    answers,
    answersByNumber,
    setAnswer: setContextAnswer,
    setAnswers: setContextAnswers,
    getBusinessName,
    getBusinessSector,
    buildContextSummary,
  } = useQuestionnaire();

  // State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [sectionDirection, setSectionDirection] = useState<1 | -1>(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [persona, setPersona] = useState<PersonaType | null>(null);
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [aiPolishingIds, setAiPolishingIds] = useState<Set<string>>(new Set());
  const [user, setUser] = useState<UserType | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isCoachOpen, setIsCoachOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'dirty' | 'saving' | 'saved' | 'error'>('idle');
  const autoSaveStatusTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showPreviewConfirm, setShowPreviewConfirm] = useState(false);
  const [showCompletionBanner, setShowCompletionBanner] = useState(false);
  const [showProfileContext, setShowProfileContext] = useState(false);

  // Answer completeness scores (from AI evaluation)
  const [completenessScores, setCompletenessScores] = useState<Record<string, number>>({});

  // Proactive AI Coach suggestion state
  const [showProactiveSuggestion, setShowProactiveSuggestion] = useState(false);
  const proactiveSuggestionShownFor = useRef<Set<string>>(new Set());
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const coachUsedForRef = useRef<Set<string>>(new Set());

  // Adaptive interview state
  const { isEnabled: adaptiveEnabled } = useFeatureFlag('adaptive-interview', true);
  const [orgProfile, setOrgProfile] = useState<OrganizationProfile | null>(null);
  const [skippedQuestions, setSkippedQuestions] = useState<SkippedQuestionDto[]>([]);

  // Refs
  const questionRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const savedAnswersRef = useRef<Record<string, string>>({});
  const saveTimersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // Group questions by step
  const questionsByStep = useMemo(() => {
    const grouped = new Map<number, Question[]>();
    questions.forEach(q => {
      if (!grouped.has(q.stepNumber)) {
        grouped.set(q.stepNumber, []);
      }
      grouped.get(q.stepNumber)!.push(q);
    });
    return grouped;
  }, [questions]);

  // Section-based derived state
  const activeSections = useMemo(() => {
    return STEPS.filter(s => questionsByStep.has(s.number));
  }, [questionsByStep]);

  const currentSection = activeSections[currentSectionIndex];
  const currentSectionQuestions = useMemo(() =>
    questionsByStep.get(activeSections[currentSectionIndex]?.number) || [],
    [questionsByStep, activeSections, currentSectionIndex]
  );

  const focusedQuestion = activeQuestionId
    ? questions.find(q => q.id === activeQuestionId) || null
    : null;

  const sectionAnsweredCount = useMemo(() =>
    currentSectionQuestions.filter(q => (answers[q.id] || '').trim().length >= 10).length,
    [currentSectionQuestions, answers]
  );

  // Global progress % (for ProgressBar)
  const globalPercent = useMemo(() => {
    const allQuestions = activeSections.flatMap(s => questionsByStep.get(s.number) || []);
    const answered = allQuestions.filter(q => (answers[q.id] || '').trim().length >= 10).length;
    return allQuestions.length > 0 ? Math.round((answered / allQuestions.length) * 100) : 0;
  }, [activeSections, questionsByStep, answers]);

  // Progress calculation (includes pre-filled/skipped questions from profile)
  const answeredCount = questions.filter(q => {
    const answer = answers[q.id] || '';
    return answer.trim().length >= 10;
  }).length;
  const totalWithSkipped = questions.length + skippedQuestions.length;
  const answeredWithSkipped = answeredCount + skippedQuestions.length;
  const progressPercent = totalWithSkipped > 0 ? (answeredWithSkipped / totalWithSkipped) * 100 : 0;

  // Time estimate: ~2 min per unanswered question
  const remainingQuestions = questions.length - answeredCount;
  const estimatedMinutes = Math.max(1, Math.round(remainingQuestions * 2));

  // Section data for sidebar
  const sidebarSections = useMemo(() =>
    activeSections.map(s => {
      const sectionQ = questionsByStep.get(s.number) || [];
      return {
        number: s.number,
        title: s.title,
        titleFr: s.titleFr,
        icon: s.icon,
        questionCount: sectionQ.length,
        answeredCount: sectionQ.filter(q => (answers[q.id] || '').trim().length >= 10).length,
      };
    }),
    [activeSections, questionsByStep, answers]
  );

  // Section intro message
  const sectionIntro = useMemo(() => {
    if (!currentSection) return '';
    const intros = SECTION_INTROS[currentSection.title];
    if (!intros) return '';
    return language === 'fr' ? intros.fr : intros.en;
  }, [currentSection, language]);

  // Effective question for AI Coach (active question or first in section)
  const effectiveCoachQuestion = focusedQuestion || currentSectionQuestions[0] || null;

  // Get persona from localStorage or user profile
  useEffect(() => {
    const storedPersona = localStorage.getItem('userPersona') as PersonaType | null;
    if (storedPersona) {
      setPersona(storedPersona);
    } else {
      apiClient.get<any>('/api/v1/auth/me')
        .then(response => {
          const userPersona = response.data?.persona || response.data?.value?.persona;
          if (userPersona) {
            setPersona(userPersona);
            localStorage.setItem('userPersona', userPersona);
          }
        })
        .catch(console.error);
    }
  }, []);

  // Load current user and org profile (tied to business plan's organization)
  useEffect(() => {
    authService.getCurrentUser()
      .then(userData => setUser(userData))
      .catch(console.error);

    if (planId) {
      // Fetch the plan's organizationId, then load that org's profile
      businessPlanService.getBusinessPlan(planId)
        .then(plan => {
          if (plan.organizationId) {
            return organizationService.getMyOrganizationProfile(plan.organizationId);
          }
          return organizationService.getMyOrganizationProfile();
        })
        .then(profile => setOrgProfile(profile))
        .catch(() => {});
    } else {
      organizationService.getMyOrganizationProfile()
        .then(profile => setOrgProfile(profile))
        .catch(() => {});
    }
  }, [planId]);

  // Warn user about unsaved changes before leaving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (autoSaveStatus === 'dirty' || autoSaveStatus === 'saving') {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [autoSaveStatus]);

  // Fetch questions
  useEffect(() => {
    if (planId && persona) {
      fetchQuestions();
    }
  }, [planId, persona, language]);

  const fetchQuestions = async () => {
    if (!planId || !persona) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<any>(`/api/v1/questionnaire/templates/${persona}?language=${language}`);

      // Fetch existing responses
      let existingResponses: Record<string, string> = {};
      try {
        const responsesData = await businessPlanService.getQuestionnaireResponses(planId, language);
        if (Array.isArray(responsesData)) {
          responsesData.forEach((r: any) => {
            const questionId = r.id || r.Id || r.questionId || r.QuestionId;
            const responseText = r.userResponse || r.UserResponse || r.responseText || r.ResponseText;
            if (questionId && responseText) {
              existingResponses[questionId] = responseText;
            }
          });
        }
      } catch (err) {
        console.warn('Could not fetch existing responses:', err);
      }

      const responseData = response.data?.value || response.data;
      const steps = responseData?.steps || [];

      // Flatten questions
      const questionsData: any[] = [];
      steps.forEach((step: any) => {
        if (step.questions && Array.isArray(step.questions)) {
          step.questions.forEach((q: any) => {
            questionsData.push({ ...q, stepNumber: step.stepNumber || q.stepNumber });
          });
        }
      });

      // Map to Question interface
      const mappedQuestions: Question[] = questionsData.map((q: any) => {
        const questionText = language === 'fr'
          ? (q.questionTextFR || q.QuestionTextFR || q.questionText || q.QuestionText || '')
          : (q.questionTextEN || q.QuestionTextEN || q.questionText || q.QuestionText || '');
        const helpText = language === 'fr'
          ? (q.helpTextFR || q.HelpTextFR || q.helpText || q.HelpText || '')
          : (q.helpTextEN || q.HelpTextEN || q.helpText || q.HelpText || '');
        const questionId = q.id || q.Id || q.questionId || q.QuestionId;
        const savedResponse = existingResponses[questionId];

        return {
          id: questionId,
          questionNumber: q.questionNumber || q.QuestionNumber,
          questionText,
          questionTextEN: q.questionTextEN || q.QuestionTextEN,
          helpText,
          helpTextEN: q.helpTextEN || q.HelpTextEN,
          questionType: q.questionType || q.QuestionType || 'LongText',
          order: q.order || q.Order || 0,
          isRequired: q.isRequired !== false && q.IsRequired !== false,
          stepNumber: q.stepNumber || q.StepNumber || 1,
          responseText: savedResponse || undefined,
          isAnswered: !!(savedResponse && savedResponse.trim().length >= 10),
          // V3 fields for AI coaching and expert advice
          coachPromptFR: q.coachPromptFR || q.CoachPromptFR,
          coachPromptEN: q.coachPromptEN || q.CoachPromptEN,
          expertAdviceFR: q.expertAdviceFR || q.ExpertAdviceFR,
          expertAdviceEN: q.expertAdviceEN || q.ExpertAdviceEN,
        };
      });

      // Adaptive filtering: if org profile has values for questions with profileFieldKey, skip them
      let filteredQuestions = mappedQuestions;
      const skipped: SkippedQuestionDto[] = [];

      if (adaptiveEnabled && orgProfile) {
        try {
          const adaptiveResponse = await apiClient.get<any>(
            `/api/v1/business-plans/${planId}/adaptive-interview/questions?language=${language}`
          );
          const adaptiveData = adaptiveResponse.data?.value || adaptiveResponse.data;
          if (adaptiveData?.skippedQuestions?.length > 0) {
            const skippedIds = new Set(adaptiveData.skippedQuestions.map((sq: any) => sq.id));
            filteredQuestions = mappedQuestions.filter(q => !skippedIds.has(q.id));
            skipped.push(...adaptiveData.skippedQuestions);
          }
        } catch {
          // If adaptive endpoint fails, just use all questions
        }
      }

      setSkippedQuestions(skipped);
      setQuestions(filteredQuestions);

      // Initialize answers in context (with question number mapping)
      const initialAnswers: Record<string, string> = {};
      filteredQuestions.forEach(q => {
        if (q.responseText) {
          initialAnswers[q.id] = q.responseText;
        }
      });
      // Use context's bulk setter to initialize all answers with question number mapping
      setContextAnswers(initialAnswers, filteredQuestions.map(q => ({
        id: q.id,
        questionNumber: q.questionNumber,
      })));
      // Track what's already persisted to avoid redundant saves
      savedAnswersRef.current = { ...initialAnswers };

      // If user already has answered questions, skip the welcome screen
      const hasExistingProgress = Object.keys(initialAnswers).length > 0;
      if (hasExistingProgress) {
        setShowWelcome(false);
      }

      // Find first unanswered question and navigate to its section
      const firstUnanswered = filteredQuestions.findIndex(q => !initialAnswers[q.id] || initialAnswers[q.id].trim().length < 10);
      if (firstUnanswered >= 0) {
        const firstUnansweredStep = filteredQuestions[firstUnanswered].stepNumber;
        // Compute active sections inline since useMemo hasn't recomputed yet
        const activeSteps = STEPS.filter(s =>
          filteredQuestions.some(q => q.stepNumber === s.number)
        );
        const sectionIdx = activeSteps.findIndex(s => s.number === firstUnansweredStep);
        setCurrentSectionIndex(sectionIdx >= 0 ? sectionIdx : 0);
      }
    } catch (err: any) {
      console.error('Failed to fetch questions:', err);
      setError(getUserFriendlyError(err, 'load'));
      toast.error(
        language === 'fr' ? 'Erreur de chargement' : 'Loading Error',
        getUserFriendlyError(err, 'load')
      );
    } finally {
      setLoading(false);
    }
  };

  // Save answer to backend — returns true on success
  const saveAnswer = useCallback(async (questionId: string, answer: string): Promise<boolean> => {
    if (!planId || !answer.trim()) return false;

    setSaving(questionId);
    try {
      await businessPlanService.submitQuestionnaireResponses(planId, {
        questionTemplateId: questionId,
        responseText: answer,
      });

      setQuestions(prev => prev.map(q =>
        q.id === questionId
          ? { ...q, isAnswered: answer.trim().length >= 10, responseText: answer }
          : q
      ));
      return true;
    } catch (err) {
      console.error('Failed to save answer:', err);
      const errorMsg = language === 'fr'
        ? 'Échec de la sauvegarde. Veuillez réessayer.'
        : 'Failed to save. Please try again.';
      setError(errorMsg);
      toast.error(
        language === 'fr' ? 'Erreur de sauvegarde' : 'Save Error',
        errorMsg
      );
      return false;
    } finally {
      setSaving(null);
    }
  }, [planId, language]);

  // Handle answer change - updates context with question number mapping
  const handleAnswerChange = useCallback((questionId: string, value: string) => {
    const question = questions.find(q => q.id === questionId);
    setContextAnswer(questionId, question?.questionNumber, value);
  }, [questions, setContextAnswer]);

  // Handle manual save
  const handleSave = useCallback((questionId: string) => {
    const answer = answers[questionId];
    if (answer?.trim()) {
      saveAnswer(questionId, answer);
    }
  }, [answers, saveAnswer]);

  // Show "saved" status briefly, then fade back to idle
  const showSavedStatus = useCallback((status: 'saved' | 'error') => {
    setAutoSaveStatus(status);
    if (autoSaveStatusTimerRef.current) clearTimeout(autoSaveStatusTimerRef.current);
    autoSaveStatusTimerRef.current = setTimeout(() => setAutoSaveStatus('idle'), 3000);
  }, []);

  // Flush all dirty answers in current section
  const flushAllSectionAnswers = useCallback(() => {
    // Clear all pending save timers
    saveTimersRef.current.forEach((timer) => clearTimeout(timer));
    saveTimersRef.current.clear();

    // Save all dirty answers in current section
    currentSectionQuestions.forEach(q => {
      const currentAnswer = answers[q.id] || '';
      if (currentAnswer.trim() && currentAnswer !== savedAnswersRef.current[q.id]) {
        setAutoSaveStatus('saving');
        saveAnswer(q.id, currentAnswer).then(ok => {
          if (ok) savedAnswersRef.current[q.id] = currentAnswer;
          showSavedStatus(ok ? 'saved' : 'error');
        });
      }
    });
  }, [currentSectionQuestions, answers, saveAnswer, showSavedStatus]);

  // Per-question debounced auto-save
  useEffect(() => {
    if (!planId) return;

    currentSectionQuestions.forEach(q => {
      const currentAnswer = answers[q.id] || '';
      const savedAnswer = savedAnswersRef.current[q.id] || '';

      if (currentAnswer === savedAnswer) {
        // Clear timer if answer is now saved
        const existingTimer = saveTimersRef.current.get(q.id);
        if (existingTimer) {
          clearTimeout(existingTimer);
          saveTimersRef.current.delete(q.id);
        }
        return;
      }

      setAutoSaveStatus('dirty');

      // Debounce: clear previous timer and set new one
      const existingTimer = saveTimersRef.current.get(q.id);
      if (existingTimer) clearTimeout(existingTimer);

      const questionId = q.id;
      const answerToSave = currentAnswer;
      const timer = setTimeout(async () => {
        if (answerToSave.trim()) {
          setAutoSaveStatus('saving');
          const ok = await saveAnswer(questionId, answerToSave);
          if (ok) savedAnswersRef.current[questionId] = answerToSave;
          showSavedStatus(ok ? 'saved' : 'error');
        }
        saveTimersRef.current.delete(questionId);
      }, 2000);

      saveTimersRef.current.set(questionId, timer);
    });
  }, [answers, currentSectionQuestions, planId, saveAnswer, showSavedStatus]);

  // Warn user about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (autoSaveStatus === 'dirty' || autoSaveStatus === 'saving') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [autoSaveStatus]);

  // Detect when all questions are answered and show completion banner
  useEffect(() => {
    if (answeredCount > 0 && answeredCount >= questions.length && questions.length > 0 && !showCompletionBanner) {
      setShowCompletionBanner(true);
    }
  }, [answeredCount, questions.length]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      saveTimersRef.current.forEach((timer) => clearTimeout(timer));
      saveTimersRef.current.clear();
      if (autoSaveStatusTimerRef.current) clearTimeout(autoSaveStatusTimerRef.current);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
    };
  }, []);

  // Proactive AI Coach suggestion: show after 15s of inactivity on an empty focused question
  useEffect(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
    setShowProactiveSuggestion(false);

    if (!activeQuestionId) return;

    const currentAnswer = answers[activeQuestionId] || '';

    if (
      proactiveSuggestionShownFor.current.has(activeQuestionId) ||
      currentAnswer.trim().length >= 10 ||
      coachUsedForRef.current.has(activeQuestionId) ||
      isCoachOpen
    ) {
      return;
    }

    const questionId = activeQuestionId;
    inactivityTimerRef.current = setTimeout(() => {
      const answerAtTrigger = answers[questionId] || '';
      if (
        answerAtTrigger.trim().length < 10 &&
        !proactiveSuggestionShownFor.current.has(questionId) &&
        !coachUsedForRef.current.has(questionId)
      ) {
        setShowProactiveSuggestion(true);
        proactiveSuggestionShownFor.current.add(questionId);
      }
    }, 15000);

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
    };
  }, [activeQuestionId, isCoachOpen]);

  // Dismiss proactive suggestion when user starts typing
  useEffect(() => {
    if (!activeQuestionId || !showProactiveSuggestion) return;
    const currentAnswer = answers[activeQuestionId] || '';
    if (currentAnswer.trim().length > 0) {
      setShowProactiveSuggestion(false);
    }
  }, [answers, activeQuestionId, showProactiveSuggestion]);

  // Track when AI coach is opened for a question
  useEffect(() => {
    if (isCoachOpen && activeQuestionId) {
      coachUsedForRef.current.add(activeQuestionId);
      setShowProactiveSuggestion(false);
    }
  }, [isCoachOpen, activeQuestionId]);

  // Navigate to next section
  const goToNextSection = useCallback(() => {
    if (currentSectionIndex < activeSections.length - 1) {
      flushAllSectionAnswers();
      const nextIndex = currentSectionIndex + 1;
      setSectionDirection(1);
      setCurrentSectionIndex(nextIndex);
      setActiveQuestionId(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentSectionIndex, activeSections, flushAllSectionAnswers]);

  // Navigate to previous section
  const goToPreviousSection = useCallback(() => {
    if (currentSectionIndex > 0) {
      flushAllSectionAnswers();
      const prevIndex = currentSectionIndex - 1;
      setSectionDirection(-1);
      setCurrentSectionIndex(prevIndex);
      setActiveQuestionId(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentSectionIndex, activeSections, flushAllSectionAnswers]);

  // Jump to a specific section by step number
  const jumpToSection = useCallback((sectionNumber: number) => {
    const sectionIdx = activeSections.findIndex(s => s.number === sectionNumber);
    if (sectionIdx >= 0) {
      flushAllSectionAnswers();
      setCurrentSectionIndex(sectionIdx);
      setActiveQuestionId(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeSections, flushAllSectionAnswers]);

  // Jump to a specific question (navigates to its section)
  const jumpToQuestion = useCallback((questionId: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;

    const sectionIdx = activeSections.findIndex(s => s.number === question.stepNumber);
    if (sectionIdx >= 0 && sectionIdx !== currentSectionIndex) {
      flushAllSectionAnswers();
      setCurrentSectionIndex(sectionIdx);
    }

    setActiveQuestionId(questionId);
  }, [questions, activeSections, currentSectionIndex, flushAllSectionAnswers]);

  // Handle AI Action (Ask Sqordia) - with full business context from QuestionnaireContext
  const handleAIAction = useCallback(async (questionId: string, action: string) => {
    const answer = answers[questionId];
    if (action !== 'generate' && (!answer || answer.trim().length < 10)) return;

    setAiPolishingIds(prev => new Set(prev).add(questionId));
    try {
      const question = questions.find(q => q.id === questionId);
      const previousAnswers = answersByNumber;
      const businessName = getBusinessName();
      const businessSector = getBusinessSector();

      const contextSummary = question?.questionNumber
        ? buildContextSummary(question.questionNumber, language)
        : '';

      const response = await apiClient.post<any>('/api/v1/ai/transform-answer', {
        questionId,
        questionNumber: question?.questionNumber,
        questionText: question?.questionText,
        answer: answer || '',
        action,
        context: contextSummary || question?.questionText,
        persona: persona || 'Entrepreneur',
        language: language || 'fr',
        previousAnswers,
        businessName,
        businessSector,
        organizationContext: orgProfile ? {
          companyName: orgProfile.name,
          industry: orgProfile.industry,
          sector: orgProfile.sector,
          businessStage: orgProfile.businessStage,
          teamSize: orgProfile.teamSize,
          fundingStatus: orgProfile.fundingStatus,
          targetMarket: orgProfile.targetMarket,
          city: orgProfile.city,
          province: orgProfile.province,
          country: orgProfile.country,
          goals: orgProfile.goalsJson,
        } : undefined,
      });

      const transformedText = response.data?.transformedText || response.data?.value?.transformedText ||
                              response.data?.polishedText || response.data?.value?.polishedText ||
                              response.data?.generatedText || response.data?.value?.generatedText;
      if (transformedText) {
        setContextAnswer(questionId, question?.questionNumber, transformedText);
      }
    } catch (err) {
      console.error('AI Action failed:', err);
      toast.error(
        language === 'fr' ? 'Erreur IA' : 'AI Error',
        language === 'fr' ? 'L\'action IA a échoué. Veuillez réessayer.' : 'AI action failed. Please try again.'
      );
    } finally {
      setAiPolishingIds(prev => {
        const next = new Set(prev);
        next.delete(questionId);
        return next;
      });
    }
  }, [answers, answersByNumber, questions, persona, language, getBusinessName, getBusinessSector, buildContextSummary, setContextAnswer, orgProfile]);

  // Focus mode: continue to next unanswered question
  const handleContinueQuestion = useCallback((questionId: string) => {
    handleSave(questionId);

    // Evaluate answer completeness in the background (non-blocking)
    const question = questions.find(q => q.id === questionId);
    const answerText = answers[questionId] || '';
    if (question && answerText.trim().length >= 10) {
      evaluateAnswerCompleteness(
        question.questionNumber ?? 0,
        question.questionText,
        answerText,
        language,
        persona || 'entrepreneur',
      )
        .then(result => {
          setCompletenessScores(prev => ({ ...prev, [questionId]: result.completenessScore }));
        })
        .catch(() => {
          // Fail silently — don't show the ring if evaluation is unavailable
        });
    }

    const currentIdx = currentSectionQuestions.findIndex(q => q.id === questionId);
    const nextQuestion = currentSectionQuestions.slice(currentIdx + 1).find(q =>
      (answers[q.id] || '').trim().length < 10
    );
    if (nextQuestion) {
      setActiveQuestionId(nextQuestion.id);
    } else {
      setActiveQuestionId(null);
    }
  }, [currentSectionQuestions, answers, handleSave, questions, language, persona]);

  // Focus mode: skip to next question
  const handleSkipQuestion = useCallback((questionId: string) => {
    const currentIdx = currentSectionQuestions.findIndex(q => q.id === questionId);
    const nextQuestion = currentSectionQuestions[currentIdx + 1];
    if (nextQuestion) setActiveQuestionId(nextQuestion.id);
  }, [currentSectionQuestions]);

  // Auto-set activeQuestionId when section changes
  useEffect(() => {
    const firstUnanswered = currentSectionQuestions.find(q => (answers[q.id] || '').trim().length < 10);
    setActiveQuestionId(firstUnanswered?.id ?? currentSectionQuestions[0]?.id ?? null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSectionIndex]); // only on section change, not on every answer change

  // Complete questionnaire
  const handleComplete = useCallback(() => {
    if (planId) {
      flushAllSectionAnswers();
      localStorage.removeItem(`questionnaire_step_${planId}`);
      navigate(`/generation/${planId}`);
    }
  }, [planId, navigate, flushAllSectionAnswers]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isTyping = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Escape always works - close modals/coach
      if (e.key === 'Escape') {
        if (showShortcuts) {
          setShowShortcuts(false);
          e.preventDefault();
          return;
        }
        if (isCoachOpen) {
          setIsCoachOpen(false);
          e.preventDefault();
          return;
        }
      }

      // Show shortcuts help with ? or Ctrl/Cmd + /
      if ((e.key === '?' && !isTyping) || (e.key === '/' && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        setShowShortcuts(prev => !prev);
        return;
      }

      // All other shortcuts require Ctrl/Cmd
      if (!e.ctrlKey && !e.metaKey) return;

      // Ctrl/Cmd + K - Toggle AI Coach
      if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        setIsCoachOpen(prev => !prev);
        return;
      }

      // Ctrl/Cmd + S - Save all section answers
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        flushAllSectionAnswers();
        return;
      }

      // Ctrl/Cmd + ArrowRight - Next section
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNextSection();
        return;
      }

      // Ctrl/Cmd + ArrowLeft - Previous section
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPreviousSection();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showShortcuts, isCoachOpen, goToNextSection, goToPreviousSection, flushAllSectionAnswers]);

  // Theme colors - refined palette
  const bgColor = theme === 'dark' ? 'bg-slate-950' : 'bg-gradient-to-br from-slate-50 via-white to-momentum-orange/5';
  const cardBg = theme === 'dark' ? 'bg-slate-900/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm';
  const borderColor = theme === 'dark' ? 'border-slate-800' : 'border-slate-200/80';
  const textColor = theme === 'dark' ? 'text-slate-100' : 'text-slate-900';
  const mutedColor = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';

  if (loading) {
    return (
      <div className={`min-h-screen ${bgColor} flex items-center justify-center`}>
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-momentum-orange flex items-center justify-center shadow-lg shadow-momentum-orange/20 mx-auto mb-6">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-momentum-orange blur-xl opacity-20 animate-pulse" />
          </div>
          <p className={`font-medium ${textColor} mb-1`}>{t.loading}</p>
          <p className={`text-sm ${mutedColor}`}>Preparing your interview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${bgColor}`}>
      <SEO
        title={t.seoTitle}
        description={t.seoDescription}
        noindex={true}
        nofollow={true}
      />

      {/* Header - Modern glassmorphism style */}
      <header className={`sticky top-0 z-40 ${cardBg} border-b ${borderColor} shadow-sm`}>
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Back button */}
            <button
              onClick={() => { flushAllSectionAnswers(); navigate('/dashboard'); }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl ${mutedColor} hover:text-momentum-orange hover:bg-slate-100 dark:hover:bg-slate-800 transition-all`}
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-medium hidden sm:inline">{t.backToDashboard}</span>
            </button>

            {/* Progress percentage — desktop only */}
            <div className="hidden sm:flex items-center gap-2 flex-1 justify-center">
              <div className="h-1.5 w-40 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                <div
                  className="h-full bg-momentum-orange rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${globalPercent}%` }}
                />
              </div>
              <span className={`text-xs font-semibold ${textColor}`}>{globalPercent}%</span>
            </div>

            {/* Auto-save status indicator */}
            {autoSaveStatus !== 'idle' && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-300">
                {autoSaveStatus === 'dirty' && (
                  <span className={`flex items-center gap-1 ${mutedColor}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {t.unsavedChanges}
                  </span>
                )}
                {autoSaveStatus === 'saving' && (
                  <span className="flex items-center gap-1 text-momentum-orange">
                    <Loader2 size={12} className="animate-spin" />
                    {t.autoSaving}
                  </span>
                )}
                {autoSaveStatus === 'saved' && (
                  <span className="flex items-center gap-1 text-emerald-500">
                    <CheckCircle2 size={12} />
                    {t.autoSaved}
                  </span>
                )}
                {autoSaveStatus === 'error' && (
                  <span className="flex items-center gap-1 text-red-500">
                    <AlertCircle size={12} />
                    {t.autoSaveError}
                  </span>
                )}
              </div>
            )}

            {/* Time estimate - desktop */}
            {remainingQuestions > 0 && (
              <span className={`hidden sm:flex items-center gap-1 text-xs ${mutedColor}`}>
                <Clock size={12} />
                ~{estimatedMinutes} min
              </span>
            )}

            {/* Mobile progress */}
            <div className="flex items-center gap-2 sm:hidden">
              {remainingQuestions > 0 && (
                <span className={`text-[10px] ${mutedColor} flex items-center gap-1`}>
                  <Clock size={10} />
                  ~{estimatedMinutes} min
                </span>
              )}
              <div className="w-10 h-10 rounded-full bg-momentum-orange flex items-center justify-center shadow-lg shadow-momentum-orange/20">
                <span className="text-white text-xs font-bold">{Math.round(progressPercent)}%</span>
              </div>
            </div>

            {/* Generate Preview button - desktop */}
            <div className="relative hidden sm:block group">
              <button
                onClick={() => {
                  if (answeredCount >= 5) setShowPreviewConfirm(true);
                }}
                disabled={answeredCount < 5}
                className={`
                  flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${answeredCount >= 5
                    ? `border ${borderColor} ${textColor} hover:bg-momentum-orange hover:text-white hover:border-transparent hover:shadow-md hover:shadow-momentum-orange/20`
                    : `border border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60`
                  }
                `}
              >
                <Sparkles size={15} />
                <span>{t.generatePreview}</span>
              </button>
              {answeredCount < 5 && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-50">
                  {t.generatePreviewTooltip}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 rotate-45 bg-slate-900 dark:bg-slate-700" />
                </div>
              )}
            </div>

            {/* Generate Preview button - mobile (icon only) */}
            <div className="relative sm:hidden group">
              <button
                onClick={() => {
                  if (answeredCount >= 5) setShowPreviewConfirm(true);
                }}
                disabled={answeredCount < 5}
                className={`
                  p-2.5 rounded-xl transition-all duration-200
                  ${answeredCount >= 5
                    ? `${mutedColor} hover:bg-momentum-orange hover:text-white hover:shadow-md hover:shadow-momentum-orange/20`
                    : `text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60`
                  }
                `}
                aria-label={t.generatePreview}
              >
                <Sparkles size={18} />
              </button>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-slate-700 text-white text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg z-50">
                {answeredCount < 5 ? t.generatePreviewTooltip : t.generatePreview}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 rotate-45 bg-slate-900 dark:bg-slate-700" />
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowProfileContext(true)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm ${mutedColor} hover:text-momentum-orange hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors`}
                title={t.viewCompanyContext}
              >
                <Building2 className="w-4 h-4" />
                <span className="hidden sm:inline">{t.context}</span>
              </button>

              <LanguageDropdown variant="toggle" />

              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800 ${mutedColor} hover:text-momentum-orange`}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {user && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800 outline-none">
                      {user.profilePictureUrl ? (
                        <img
                          src={user.profilePictureUrl}
                          alt={user.firstName || 'User'}
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow-sm"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-momentum-orange flex items-center justify-center ring-2 ring-white dark:ring-slate-800 shadow-sm">
                          <User size={14} className="text-white" />
                        </div>
                      )}
                      <span className={`text-sm font-medium hidden md:inline ${textColor}`}>
                        {user.firstName || user.email?.split('@')[0]}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <div className="px-3 py-2">
                      <p className="text-sm font-semibold truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center gap-2 cursor-pointer">
                        <User size={14} />
                        {language === 'fr' ? 'Profil' : 'Profile'}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/subscription" className="flex items-center gap-2 cursor-pointer">
                        <CreditCard size={14} />
                        {language === 'fr' ? 'Abonnement' : 'Billing'}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={async () => {
                        await authService.logout();
                        navigate('/login');
                      }}
                      className="flex items-center gap-2 cursor-pointer text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
                    >
                      <LogOut size={14} />
                      {language === 'fr' ? 'Déconnexion' : 'Logout'}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content — Two-column layout */}
      <div className="max-w-6xl mx-auto flex gap-6 px-4 md:px-6 pb-24 md:pb-8">
        {/* Section Sidebar */}
        {!showWelcome && (
          <SectionSidebar
            sections={sidebarSections}
            currentIndex={currentSectionIndex}
            onSectionClick={(idx) => {
              setSectionDirection(idx > currentSectionIndex ? 1 : -1);
              flushAllSectionAnswers();
              setCurrentSectionIndex(idx);
            }}
          />
        )}

        {/* Content area */}
        <div className="flex-1 min-w-0 py-6 md:py-8">
        <AnimatePresence mode="wait">
        {showWelcome ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96, y: -20 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center min-h-[60vh]"
          >
            <div className={`w-full max-w-2xl ${cardBg} rounded-3xl border ${borderColor} shadow-xl overflow-hidden`}>
              {/* Hero header with gradient */}
              <div className="relative px-8 md:px-12 pt-10 pb-8 text-center overflow-hidden">
                {/* Decorative background glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-momentum-orange/5 via-transparent to-transparent dark:from-momentum-orange/10" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-32 bg-momentum-orange/8 dark:bg-momentum-orange/15 rounded-full blur-3xl" />

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.4 }}
                  className="relative"
                >
                  <div className="w-16 h-16 rounded-2xl bg-momentum-orange flex items-center justify-center shadow-lg shadow-momentum-orange/20 mx-auto mb-5">
                    <Rocket className="w-8 h-8 text-white" />
                  </div>
                  <h1 className={`text-2xl md:text-3xl font-bold ${textColor} mb-2`}>
                    {t.welcomeHeading}
                  </h1>
                  <p className={`text-base ${mutedColor} max-w-sm mx-auto leading-relaxed`}>
                    {t.welcomeSubtext}
                  </p>

                  {/* Time estimate badge */}
                  <div className="flex justify-center mt-5">
                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium ${theme === 'dark' ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-white text-slate-600 border border-slate-200 shadow-sm'}`}>
                      <Clock size={14} className="text-momentum-orange" />
                      {t.welcomeEstimate}
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Section grid */}
              <div className="px-8 md:px-12 pb-4">
                <h3 className={`text-[11px] font-semibold ${mutedColor} uppercase tracking-[0.15em] mb-3 text-center`}>
                  {t.welcomeSections}
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {STEPS.map((step, idx) => {
                    const StepIcon = step.icon;
                    const isOdd = STEPS.length % 2 !== 0 && idx === STEPS.length - 1;
                    return (
                      <motion.div
                        key={step.number}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 + idx * 0.05, duration: 0.3 }}
                        className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${isOdd ? 'col-span-2 max-w-[50%] mx-auto w-full' : ''} ${theme === 'dark' ? 'bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/40' : 'bg-slate-50/60 hover:bg-slate-100/80 border border-slate-200/50'}`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${theme === 'dark' ? 'bg-slate-700/80 text-momentum-orange group-hover:bg-slate-700' : 'bg-momentum-orange/10 text-momentum-orange group-hover:bg-momentum-orange/15'}`}>
                          <StepIcon size={14} />
                        </div>
                        <span className={`text-sm font-medium ${textColor} truncate flex-1`}>
                          {language === 'fr' ? step.titleFr : step.title}
                        </span>
                        <span className={`text-[11px] font-semibold tabular-nums ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{step.number}/{STEPS.length}</span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Footer: save note + CTA */}
              <div className="px-8 md:px-12 pt-4 pb-8">
                <div className={`flex items-center justify-center gap-2 mb-6 px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-emerald-950/30' : 'bg-emerald-50/60'}`}>
                  <BookmarkCheck size={14} className="text-emerald-500 flex-shrink-0" />
                  <span className={`text-xs ${theme === 'dark' ? 'text-emerald-400/80' : 'text-emerald-700/70'}`}>{t.welcomeSaveNote}</span>
                </div>

                <div className="text-center">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowWelcome(false)}
                    className="inline-flex items-center gap-3 px-10 py-3.5 rounded-2xl font-semibold text-base bg-momentum-orange text-white shadow-lg shadow-momentum-orange/20 hover:bg-[#E56000] hover:shadow-xl hover:shadow-momentum-orange/30 transition-all duration-200"
                  >
                    {t.welcomeCta}
                    <ArrowRight size={18} />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="interview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
        <div className="max-w-2xl mx-auto">
            {/* Error Banner */}
            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 flex items-start gap-3 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="text-red-500" size={16} />
                </div>
                <p className="text-red-600 dark:text-red-400 text-sm flex-1 pt-1.5">{error}</p>
                <button onClick={() => setError(null)} className="text-red-400 hover:text-red-500 dark:hover:text-red-300 p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">
                  <X size={16} />
                </button>
              </div>
            )}

            {/* Adaptive Interview: Profile Context Panel */}
            {(showProfileContext || (adaptiveEnabled && skippedQuestions.length > 0)) && (
              <ProfileContextPanel
                skippedQuestions={skippedQuestions}
                profileCompletenessScore={orgProfile?.profileCompletenessScore ?? 0}
              />
            )}

            {/* Completion Celebration Banner */}
            <AnimatePresence>
              {showCompletionBanner && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-6 p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border border-emerald-200 dark:border-emerald-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-emerald-800 dark:text-emerald-200">
                        {t.interviewComplete}
                      </p>
                      <p className="text-sm text-emerald-600 dark:text-emerald-400">
                        {t.interviewCompleteDesc}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowPreviewConfirm(true)}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors"
                    >
                      {t.generatePlan}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Section-Based Content — Focus Mode */}
            <AnimatePresence mode="wait" custom={sectionDirection}>
              <motion.div
                key={currentSectionIndex}
                custom={sectionDirection}
                variants={{
                  enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
                  center: { x: 0, opacity: 1 },
                  exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              >
            {currentSection && currentSectionQuestions.length > 0 && (
              <div className="mb-8">
                {/* Section Header */}
                <div className="mb-6">
                  <h2 className={`text-xl font-bold ${textColor}`}>
                    {language === 'fr' ? currentSection.titleFr : currentSection.title}
                  </h2>
                  <div className="flex items-center gap-3 mt-1">
                    <p className={`text-sm ${mutedColor}`}>
                      {sectionAnsweredCount} / {currentSectionQuestions.length}{' '}
                      {t.questionsAnswered}
                    </p>
                    <div className="flex gap-1">
                      {currentSectionQuestions.map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full ${
                          i < sectionAnsweredCount ? 'bg-momentum-orange' : theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'
                        }`} />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Profile completion nudge */}
                {currentSectionIndex === 0 && (
                  <div className="mb-4">
                    <ProfileCompletionBanner variant="interview" orgProfile={orgProfile} threshold={80} />
                  </div>
                )}

                {/* Section intro banner */}
                {sectionIntro && (
                  <p className={`flex items-center gap-2 text-sm ${mutedColor} mb-6`}>
                    <Sparkles size={14} className="text-momentum-orange flex-shrink-0" />
                    {sectionIntro}
                  </p>
                )}

                {/* Questions in focus mode */}
                <div className="space-y-2">
                  {currentSectionQuestions.map((q, qIdx) => {
                    const isAnswered = (answers[q.id] || '').trim().length >= 10;
                    const isActive = q.id === activeQuestionId;
                    const cardState = isActive ? 'active' : isAnswered ? 'answered' : 'upcoming';

                    return (
                      <QuestionCard
                        key={q.id}
                        question={q}
                        index={qIdx}
                        state={cardState}
                        answer={answers[q.id] || ''}
                        isSaving={saving === q.id}
                        isAIProcessing={aiPolishingIds.has(q.id)}
                        language={language as 'en' | 'fr'}
                        onAnswerChange={(value) => handleAnswerChange(q.id, value)}
                        onContinue={() => handleContinueQuestion(q.id)}
                        onSkip={() => handleSkipQuestion(q.id)}
                        onEdit={() => setActiveQuestionId(q.id)}
                        onAIAction={(action) => handleAIAction(q.id, action)}
                        onHint={() => {
                          setActiveQuestionId(q.id);
                          setIsCoachOpen(true);
                        }}
                        completenessScore={completenessScores[q.id]}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section Navigation */}
            <div className="flex justify-between mt-8 pt-4 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={goToPreviousSection}
                disabled={currentSectionIndex === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  currentSectionIndex === 0
                    ? 'opacity-40 cursor-not-allowed'
                    : theme === 'dark' ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ArrowLeft size={16} />
                {language === 'fr' ? 'Section précédente' : 'Previous Section'}
              </button>

              {currentSectionIndex < activeSections.length - 1 ? (
                <button
                  onClick={goToNextSection}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all bg-momentum-orange text-white shadow-md shadow-momentum-orange/20 hover:bg-[#E56000] hover:shadow-lg"
                >
                  {language === 'fr' ? 'Section suivante' : 'Next Section'}
                  <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={answeredCount < questions.length}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all
                    ${answeredCount >= questions.length
                      ? 'bg-gradient-to-r from-green-500 to-emerald-400 text-white shadow-md hover:shadow-lg'
                      : 'opacity-40 cursor-not-allowed bg-slate-200 dark:bg-slate-700 text-slate-400'
                    }
                  `}
                >
                  <Sparkles size={16} />
                  {t.generatePlan}
                </button>
              )}
            </div>
              </motion.div>
            </AnimatePresence>
          </div>
          </motion.div>
        )}
        </AnimatePresence>
        </div>
      </div>

      {/* Coach Panel — Expert advice overlay */}
      <CoachPanel
        isOpen={isCoachOpen}
        onClose={() => setIsCoachOpen(false)}
        expertAdvice={
          (() => {
            const activeQ = currentSectionQuestions.find(q => q.id === activeQuestionId);
            return (language === 'fr' ? activeQ?.expertAdviceFR : activeQ?.expertAdviceEN) ?? '';
          })()
        }
        language={language as 'en' | 'fr'}
      />

      {/* Keyboard Shortcuts Button */}
      <button
        onClick={() => setShowShortcuts(true)}
        className={`
          fixed bottom-4 left-4 z-30 hidden lg:flex items-center gap-2
          px-3 py-2 rounded-xl text-xs font-medium
          ${cardBg} border ${borderColor} ${mutedColor}
          hover:text-momentum-orange hover:border-momentum-orange/30
          transition-all duration-200 shadow-sm
        `}
        title={t.shortcuts}
      >
        <Keyboard size={14} />
        <span>?</span>
      </button>

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showShortcuts && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 backdrop-blur-sm"
              onClick={() => setShowShortcuts(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className={`
                fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                w-full max-w-md mx-4
                ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}
                rounded-2xl shadow-2xl border ${borderColor}
                overflow-hidden
              `}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-momentum-orange flex items-center justify-center">
                    <Keyboard className="w-5 h-5 text-white" />
                  </div>
                  <h2 className={`text-lg font-semibold ${textColor}`}>{t.shortcutsTitle}</h2>
                </div>
                <button
                  onClick={() => setShowShortcuts(false)}
                  className={`p-2 rounded-lg ${mutedColor} hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors`}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Shortcuts List */}
              <div className="p-6 space-y-3">
                <ShortcutRow
                  keys={['Ctrl', '→']}
                  description={t.shortcutNext}
                  theme={theme}
                />
                <ShortcutRow
                  keys={['Ctrl', '←']}
                  description={t.shortcutPrev}
                  theme={theme}
                />
                <ShortcutRow
                  keys={['Ctrl', 'K']}
                  description={t.shortcutCoach}
                  theme={theme}
                />
                <ShortcutRow
                  keys={['Ctrl', 'S']}
                  description={t.shortcutSave}
                  theme={theme}
                />
                <ShortcutRow
                  keys={['Esc']}
                  description={t.shortcutClose}
                  theme={theme}
                />
                <ShortcutRow
                  keys={['?']}
                  description={t.shortcutHelp}
                  theme={theme}
                />
              </div>

              {/* Footer hint */}
              <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
                <p className={`text-xs ${mutedColor} text-center`}>
                  {t.pressKey} <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">Esc</kbd> {t.toClose}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Generate Preview Confirmation Dialog */}
      <AnimatePresence>
        {showPreviewConfirm && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 backdrop-blur-sm"
              onClick={() => setShowPreviewConfirm(false)}
            />

            {/* Dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className={`
                fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50
                w-full max-w-md mx-4
                ${theme === 'dark' ? 'bg-slate-900' : 'bg-white'}
                rounded-2xl shadow-2xl border ${borderColor}
                overflow-hidden
              `}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-momentum-orange flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <h2 className={`text-lg font-semibold ${textColor}`}>{t.generatePreviewTitle}</h2>
                </div>
                <button
                  onClick={() => setShowPreviewConfirm(false)}
                  className={`p-2 rounded-lg ${mutedColor} hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors`}
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5">
                <p className={`text-sm leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
                  {t.generatePreviewBody
                    .replace('{answered}', String(answeredCount))
                    .replace('{total}', String(questions.length))
                  }
                </p>
              </div>

              {/* Actions */}
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowPreviewConfirm(false)}
                  className={`
                    px-4 py-2.5 rounded-xl text-sm font-medium
                    border ${borderColor} ${textColor}
                    hover:bg-slate-100 dark:hover:bg-slate-800
                    transition-all duration-200
                  `}
                >
                  {t.generatePreviewCancel}
                </button>
                <button
                  onClick={() => {
                    setShowPreviewConfirm(false);
                    handleComplete();
                  }}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium bg-momentum-orange text-white hover:bg-[#E56000] shadow-md shadow-momentum-orange/20 hover:shadow-lg hover:shadow-momentum-orange/25 transition-all duration-200"
                >
                  {t.generatePreviewConfirm}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// Shortcut row component
function ShortcutRow({ keys, description, theme }: { keys: string[]; description: string; theme: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}`}>
        {description}
      </span>
      <div className="flex items-center gap-1">
        {keys.map((key, idx) => (
          <span key={idx} className="flex items-center gap-1">
            <kbd className={`
              px-2 py-1 rounded-lg text-xs font-medium font-mono
              ${theme === 'dark'
                ? 'bg-slate-800 text-slate-300 border border-slate-700'
                : 'bg-slate-100 text-slate-700 border border-slate-200'
              }
              shadow-sm
            `}>
              {key === 'Ctrl' ? (
                <span className="flex items-center gap-0.5">
                  <Command size={10} />
                  <span>/Ctrl</span>
                </span>
              ) : key}
            </kbd>
            {idx < keys.length - 1 && (
              <span className={`text-xs ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>+</span>
            )}
          </span>
        ))}
      </div>
    </div>
  );
}

// Main export - wraps the questionnaire with QuestionnaireProvider for global state
export default function InterviewQuestionnairePage() {
  return (
    <QuestionnaireProvider>
      <InterviewQuestionnaireContent />
    </QuestionnaireProvider>
  );
}
