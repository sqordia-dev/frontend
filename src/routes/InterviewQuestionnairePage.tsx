import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Loader2,
  AlertCircle,
  ChevronDown,
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
  MessageSquare,
  Save,
} from 'lucide-react';
import { businessPlanService } from '../lib/business-plan-service';
import { useTheme } from '../contexts/ThemeContext';
import { QuestionnaireProvider, useQuestionnaire } from '../contexts/QuestionnaireContext';
import { getUserFriendlyError } from '../utils/error-messages';
import { PersonaType, User as UserType } from '../lib/types';
import SEO from '../components/SEO';
import AIInterviewer from '../components/questionnaire/AIInterviewer';
import NotionStyleEditor from '../components/questionnaire/NotionStyleEditor';
import { AICoachBubble, AICoachBubbleRef } from '../components/ai-coach';
import { apiClient } from '../lib/api-client';
import LanguageDropdown from '../components/layout/LanguageDropdown';
import { authService } from '../lib/auth-service';
import { motion, AnimatePresence } from 'framer-motion';

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

// Translations
const TRANSLATIONS = {
  en: {
    loading: 'Loading your interview...',
    seoTitle: 'Business Plan Interview | Sqordia',
    seoDescription: 'Answer questions to create your business plan with AI assistance.',
    backToDashboard: 'Back to Dashboard',
    answered: 'answered',
    sections: 'Sections',
    placeholder: 'Start typing your answer...',
    previous: 'Previous',
    next: 'Next',
    questionOf: 'Question {current} of {total}',
    generatePlan: 'Generate Plan',
    saveError: 'Failed to save. Please try again.',
    shortcuts: 'Shortcuts',
    shortcutsTitle: 'Keyboard Shortcuts',
    shortcutNext: 'Next question',
    shortcutPrev: 'Previous question',
    shortcutCoach: 'Open AI Coach',
    shortcutSave: 'Save answer',
    shortcutClose: 'Close dialog',
    shortcutHelp: 'Show shortcuts',
    pressKey: 'Press',
  },
  fr: {
    loading: 'Chargement de votre entrevue...',
    seoTitle: "Entrevue plan d'affaires | Sqordia",
    seoDescription: "Répondez aux questions pour créer votre plan d'affaires avec l'aide de l'IA.",
    backToDashboard: 'Retour au tableau de bord',
    answered: 'répondu',
    sections: 'Sections',
    placeholder: 'Commencez à taper votre réponse...',
    previous: 'Précédent',
    next: 'Suivant',
    questionOf: 'Question {current} sur {total}',
    generatePlan: 'Générer le plan',
    saveError: 'Échec de la sauvegarde. Veuillez réessayer.',
    shortcuts: 'Raccourcis',
    shortcutsTitle: 'Raccourcis clavier',
    shortcutNext: 'Question suivante',
    shortcutPrev: 'Question précédente',
    shortcutCoach: 'Ouvrir le coach IA',
    shortcutSave: 'Sauvegarder la réponse',
    shortcutClose: 'Fermer le dialogue',
    shortcutHelp: 'Afficher les raccourcis',
    pressKey: 'Appuyez sur',
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
  const { theme, language, toggleTheme } = useTheme();
  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

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
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [persona, setPersona] = useState<PersonaType | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([1]));
  const [isAIPolishing, setIsAIPolishing] = useState(false);
  const [user, setUser] = useState<UserType | null>(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isCoachOpen, setIsCoachOpen] = useState(false);

  // Refs
  const questionRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const coachRef = useRef<AICoachBubbleRef>(null);

  // Current question
  const currentQuestion = questions[currentQuestionIndex];
  const currentStep = currentQuestion?.stepNumber || 1;
  const stepInfo = STEPS.find(s => s.number === currentStep);

  // Progress calculation
  const answeredCount = questions.filter(q => {
    const answer = answers[q.id] || '';
    return answer.trim().length >= 10;
  }).length;
  const progressPercent = questions.length > 0 ? (answeredCount / questions.length) * 100 : 0;

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

  // Get persona from localStorage or user profile
  useEffect(() => {
    const storedPersona = localStorage.getItem('userPersona') as PersonaType | null;
    if (storedPersona) {
      setPersona(storedPersona);
    } else {
      apiClient.get('/api/v1/auth/me')
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

  // Load current user
  useEffect(() => {
    authService.getCurrentUser()
      .then(userData => setUser(userData))
      .catch(console.error);
  }, []);

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
      const response = await apiClient.get(`/api/v1/questionnaire/templates/${persona}?language=${language}`);

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

      setQuestions(mappedQuestions);

      // Initialize answers in context (with question number mapping)
      const initialAnswers: Record<string, string> = {};
      mappedQuestions.forEach(q => {
        if (q.responseText) {
          initialAnswers[q.id] = q.responseText;
        }
      });
      // Use context's bulk setter to initialize all answers with question number mapping
      setContextAnswers(initialAnswers, mappedQuestions.map(q => ({
        id: q.id,
        questionNumber: q.questionNumber,
      })));

      // Find first unanswered question
      const firstUnanswered = mappedQuestions.findIndex(q => !initialAnswers[q.id] || initialAnswers[q.id].trim().length < 10);
      if (firstUnanswered >= 0) {
        setCurrentQuestionIndex(firstUnanswered);
        setExpandedSections(new Set([mappedQuestions[firstUnanswered].stepNumber]));
      }
    } catch (err: any) {
      console.error('Failed to fetch questions:', err);
      setError(getUserFriendlyError(err, 'load'));
    } finally {
      setLoading(false);
    }
  };

  // Save answer to backend
  const saveAnswer = useCallback(async (questionId: string, answer: string) => {
    if (!planId || !answer.trim()) return;

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
    } catch (err) {
      console.error('Failed to save answer:', err);
      const errorMsg = language === 'fr'
        ? 'Échec de la sauvegarde. Veuillez réessayer.'
        : 'Failed to save. Please try again.';
      setError(errorMsg);
    } finally {
      setSaving(null);
    }
  }, [planId, language]);

  // Handle answer change - updates context with question number mapping
  const handleAnswerChange = useCallback((questionId: string, value: string) => {
    // Find question number for this question
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

  // Navigate to next question
  const goToNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setExpandedSections(prev => new Set([...prev, questions[nextIndex].stepNumber]));

      // Scroll to question
      setTimeout(() => {
        const questionEl = questionRefs.current.get(questions[nextIndex].id);
        questionEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [currentQuestionIndex, questions]);

  // Navigate to previous question
  const goToPrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);

      setTimeout(() => {
        const questionEl = questionRefs.current.get(questions[prevIndex].id);
        questionEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [currentQuestionIndex, questions]);

  // Jump to specific question
  const jumpToQuestion = useCallback((index: number) => {
    setCurrentQuestionIndex(index);
    setExpandedSections(prev => new Set([...prev, questions[index].stepNumber]));

    setTimeout(() => {
      const questionEl = questionRefs.current.get(questions[index].id);
      questionEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }, [questions]);

  // Toggle section expansion
  const toggleSection = useCallback((stepNumber: number) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepNumber)) {
        newSet.delete(stepNumber);
      } else {
        newSet.add(stepNumber);
      }
      return newSet;
    });
  }, []);

  // Handle AI Action (Ask Sqordia) - with full business context from QuestionnaireContext
  const handleAIAction = useCallback(async (questionId: string, action: string) => {
    const answer = answers[questionId];
    // For 'generate' action, we don't require existing content
    if (action !== 'generate' && (!answer || answer.trim().length < 10)) return;

    setIsAIPolishing(true);
    try {
      // Use context methods for business data
      const previousAnswers = answersByNumber;
      const businessName = getBusinessName();
      const businessSector = getBusinessSector();

      // Build context summary for the current question
      const contextSummary = currentQuestion?.questionNumber
        ? buildContextSummary(currentQuestion.questionNumber, language)
        : '';

      const response = await apiClient.post('/api/v1/ai/transform-answer', {
        questionId,
        questionNumber: currentQuestion?.questionNumber,
        questionText: currentQuestion?.questionText,
        answer: answer || '', // Empty string for generate action
        action, // 'generate', 'polish', 'shorten', 'expand', 'professional', 'examples', 'simplify'
        context: contextSummary || currentQuestion?.questionText,
        persona: persona || 'Entrepreneur',
        language,
        // Context fields for personalized AI responses
        previousAnswers,
        businessName,
        businessSector,
      });

      const transformedText = response.data?.transformedText || response.data?.value?.transformedText ||
                              response.data?.polishedText || response.data?.value?.polishedText ||
                              response.data?.generatedText || response.data?.value?.generatedText;
      if (transformedText) {
        // Update via context to maintain global state
        setContextAnswer(questionId, currentQuestion?.questionNumber, transformedText);
      }
    } catch (err) {
      console.error('AI Action failed:', err);
    } finally {
      setIsAIPolishing(false);
    }
  }, [answers, answersByNumber, currentQuestion, persona, language, getBusinessName, getBusinessSector, buildContextSummary, setContextAnswer]);

  // Complete questionnaire
  const handleComplete = useCallback(() => {
    if (planId) {
      localStorage.removeItem(`questionnaire_step_${planId}`);
      navigate(`/generation/${planId}`);
    }
  }, [planId, navigate]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input/textarea
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

      // Ctrl/Cmd + S - Save current answer
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        if (currentQuestion) {
          handleSave(currentQuestion.id);
        }
        return;
      }

      // Ctrl/Cmd + ArrowRight - Next question
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToNext();
        return;
      }

      // Ctrl/Cmd + ArrowLeft - Previous question
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToPrevious();
        return;
      }

      // Ctrl/Cmd + Enter - Save and go to next
      if (e.key === 'Enter') {
        e.preventDefault();
        if (currentQuestion) {
          handleSave(currentQuestion.id);
          setTimeout(() => goToNext(), 300);
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentQuestion, showShortcuts, isCoachOpen, goToNext, goToPrevious, handleSave]);

  // Theme colors - refined palette
  const bgColor = theme === 'dark' ? 'bg-slate-950' : 'bg-gradient-to-br from-slate-50 via-white to-orange-50/30';
  const cardBg = theme === 'dark' ? 'bg-slate-900/80 backdrop-blur-sm' : 'bg-white/80 backdrop-blur-sm';
  const borderColor = theme === 'dark' ? 'border-slate-800' : 'border-slate-200/80';
  const textColor = theme === 'dark' ? 'text-slate-100' : 'text-slate-900';
  const mutedColor = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';

  if (loading) {
    return (
      <div className={`min-h-screen ${bgColor} flex items-center justify-center`}>
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center shadow-lg shadow-orange-500/30 mx-auto mb-6">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-400 blur-xl opacity-30 animate-pulse" />
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
              onClick={() => navigate('/dashboard')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl ${mutedColor} hover:text-orange-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all`}
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-medium hidden sm:inline">{t.backToDashboard}</span>
            </button>

            {/* Progress - Enhanced visual */}
            <div className="flex-1 max-w-md mx-4 hidden sm:block">
              <div className="flex items-center justify-between mb-1.5">
                <span className={`text-xs font-medium ${mutedColor}`}>
                  {t.answered}
                </span>
                <span className="text-xs font-semibold text-orange-500">
                  {answeredCount} / {questions.length}
                </span>
              </div>
              <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 transition-all duration-700 ease-out rounded-full shadow-sm"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Mobile progress */}
            <div className="flex items-center gap-2 sm:hidden">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <span className="text-white text-xs font-bold">{Math.round(progressPercent)}%</span>
              </div>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-1">
              <LanguageDropdown variant="toggle" />

              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800 ${mutedColor} hover:text-orange-500`}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {user && (
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {user.profilePictureUrl ? (
                    <img
                      src={user.profilePictureUrl}
                      alt={user.firstName || 'User'}
                      className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-800 shadow-sm"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center ring-2 ring-white dark:ring-slate-800 shadow-sm">
                      <User size={14} className="text-white" />
                    </div>
                  )}
                  <span className={`text-sm font-medium hidden md:inline ${textColor}`}>
                    {user.firstName || user.email?.split('@')[0]}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-8 lg:pr-16 pb-24 md:pb-8">
        <div className="flex gap-8">
          {/* Sidebar - Section Navigation */}
          <aside className="w-72 flex-shrink-0 hidden lg:block">
            <div className={`sticky top-24 ${cardBg} rounded-2xl border ${borderColor} overflow-hidden shadow-sm`}>
              <div className="px-5 py-4 border-b border-slate-200/80 dark:border-slate-700/80 bg-gradient-to-r from-slate-50 to-transparent dark:from-slate-800/50 dark:to-transparent">
                <h3 className={`font-semibold ${textColor} flex items-center gap-2`}>
                  <div className="w-1.5 h-5 rounded-full bg-gradient-to-b from-orange-500 to-amber-400" />
                  {t.sections}
                </h3>
              </div>
              <nav className="p-3 space-y-1">
                {STEPS.map(step => {
                  const stepQuestions = questionsByStep.get(step.number) || [];
                  const stepAnswered = stepQuestions.filter(q => answers[q.id]?.trim().length >= 10).length;
                  const isComplete = stepQuestions.length > 0 && stepAnswered === stepQuestions.length;
                  const isExpanded = expandedSections.has(step.number);
                  const isCurrentStep = currentStep === step.number;
                  const StepIcon = step.icon;

                  return (
                    <div key={step.number}>
                      <button
                        onClick={() => toggleSection(step.number)}
                        className={`
                          w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left
                          transition-all duration-200
                          ${isCurrentStep
                            ? 'bg-gradient-to-r from-orange-500/15 to-amber-500/10 text-orange-600 dark:text-orange-400 shadow-sm'
                            : theme === 'dark'
                              ? 'hover:bg-slate-800/70 text-slate-300'
                              : 'hover:bg-slate-100/80 text-slate-700'
                          }
                        `}
                      >
                        <div className={`
                          w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
                          ${isComplete
                            ? 'bg-green-500/15 text-green-500'
                            : isCurrentStep
                              ? 'bg-orange-500/20 text-orange-500'
                              : theme === 'dark'
                                ? 'bg-slate-700 text-slate-400'
                                : 'bg-slate-200/80 text-slate-500'
                          }
                        `}>
                          {isComplete ? (
                            <CheckCircle2 size={16} />
                          ) : (
                            <StepIcon size={16} />
                          )}
                        </div>
                        <span className="flex-1 text-sm font-medium truncate">
                          {language === 'fr' ? step.titleFr : step.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className={`
                            text-xs font-medium px-2 py-0.5 rounded-full
                            ${isComplete
                              ? 'bg-green-500/15 text-green-600 dark:text-green-400'
                              : theme === 'dark'
                                ? 'bg-slate-700 text-slate-400'
                                : 'bg-slate-200/80 text-slate-500'
                            }
                          `}>
                            {stepAnswered}/{stepQuestions.length}
                          </span>
                          <div className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                            <ChevronDown size={16} className={mutedColor} />
                          </div>
                        </div>
                      </button>

                      {/* Expanded questions */}
                      {isExpanded && (
                        <div className="ml-5 mt-1.5 mb-2 pl-4 border-l-2 border-slate-200 dark:border-slate-700 space-y-0.5">
                          {stepQuestions.map((q) => {
                            const globalIdx = questions.findIndex(x => x.id === q.id);
                            const isAnswered = answers[q.id]?.trim().length >= 10;
                            const isCurrent = globalIdx === currentQuestionIndex;

                            return (
                              <button
                                key={q.id}
                                onClick={() => jumpToQuestion(globalIdx)}
                                className={`
                                  w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs
                                  transition-all duration-150
                                  ${isCurrent
                                    ? 'bg-gradient-to-r from-orange-500 to-orange-400 text-white shadow-sm shadow-orange-500/20'
                                    : isAnswered
                                      ? theme === 'dark'
                                        ? 'text-green-400 hover:bg-slate-800/70'
                                        : 'text-green-600 hover:bg-slate-100/80'
                                      : theme === 'dark'
                                        ? 'text-slate-400 hover:bg-slate-800/70 hover:text-slate-300'
                                        : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-700'
                                  }
                                `}
                              >
                                {isAnswered && !isCurrent && <CheckCircle2 size={12} className="flex-shrink-0" />}
                                {!isAnswered && !isCurrent && <div className="w-3 h-3 rounded-full border-2 border-slate-300 dark:border-slate-600 flex-shrink-0" />}
                                <span className="truncate font-medium">Q{globalIdx + 1}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Interview Area */}
          <main className="flex-1 min-w-0">
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

            {/* Current Question */}
            {currentQuestion && (
              <div
                ref={el => {
                  if (el) questionRefs.current.set(currentQuestion.id, el);
                }}
                className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                {/* AI Interviewer */}
                <AIInterviewer
                  questionText={currentQuestion.questionText}
                  helpText={currentQuestion.helpText}
                  questionNumber={currentQuestionIndex + 1}
                  totalQuestions={questions.length}
                  sectionTitle={stepInfo?.title || ''}
                  previousAnswer={currentQuestionIndex > 0 ? answers[questions[currentQuestionIndex - 1].id] : undefined}
                  isAnswered={answers[currentQuestion.id]?.trim().length >= 10}
                  persona={persona || 'Entrepreneur'}
                  expertAdviceFR={currentQuestion.expertAdviceFR}
                  expertAdviceEN={currentQuestion.expertAdviceEN}
                />

                {/* Answer Editor - key forces re-mount when question changes */}
                <div className="ml-0 lg:ml-16 mt-4">
                  <div className={`${cardBg} rounded-2xl border ${borderColor} p-4 md:p-6 shadow-sm`}>
                    <NotionStyleEditor
                      key={currentQuestion.id}
                      value={answers[currentQuestion.id] || ''}
                      onChange={(value) => handleAnswerChange(currentQuestion.id, value)}
                      onSave={() => handleSave(currentQuestion.id)}
                      isSaving={saving === currentQuestion.id}
                      isRequired={currentQuestion.isRequired}
                      minLength={10}
                      onAIAction={(action) => handleAIAction(currentQuestion.id, action)}
                      isAIProcessing={isAIPolishing}
                      questionId={currentQuestion.id}
                      placeholder={t.placeholder}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className={`flex items-center justify-between pt-6 mt-6 border-t ${borderColor}`}>
              <button
                onClick={goToPrevious}
                disabled={currentQuestionIndex === 0}
                className={`
                  flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-medium
                  transition-all duration-200 group
                  ${currentQuestionIndex === 0
                    ? 'text-slate-400 cursor-not-allowed opacity-50'
                    : `${textColor} hover:bg-slate-100 dark:hover:bg-slate-800 hover:shadow-sm`
                  }
                `}
              >
                <ArrowLeft size={18} className={currentQuestionIndex > 0 ? 'group-hover:-translate-x-1 transition-transform' : ''} />
                <span className="hidden sm:inline">{t.previous}</span>
              </button>

              <div className={`text-sm font-medium ${mutedColor} px-4 py-2 rounded-full bg-slate-100/80 dark:bg-slate-800/80`}>
                {t.questionOf.replace('{current}', String(currentQuestionIndex + 1)).replace('{total}', String(questions.length))}
              </div>

              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={goToNext}
                  className="flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-medium bg-gradient-to-r from-orange-500 to-orange-400 text-white hover:from-orange-600 hover:to-orange-500 shadow-md shadow-orange-500/25 hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-200 group"
                >
                  <span className="hidden sm:inline">{t.next}</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={answeredCount < questions.length}
                  className={`
                    flex items-center gap-2.5 px-6 py-2.5 rounded-xl font-medium
                    transition-all duration-200 group
                    ${answeredCount >= questions.length
                      ? 'bg-gradient-to-r from-green-500 to-emerald-400 text-white shadow-md shadow-green-500/25 hover:shadow-lg hover:shadow-green-500/30 hover:from-green-600 hover:to-emerald-500'
                      : 'bg-slate-200/80 dark:bg-slate-700/80 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                    }
                  `}
                >
                  <Sparkles size={18} className={answeredCount >= questions.length ? 'group-hover:scale-110 transition-transform' : ''} />
                  <span className="hidden sm:inline">{t.generatePlan}</span>
                </button>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* AI Coach Bubble - Floating chat assistant */}
      {currentQuestion && planId && (
        <AICoachBubble
          ref={coachRef}
          businessPlanId={planId}
          questionId={currentQuestion.id}
          questionNumber={currentQuestionIndex + 1}
          questionText={currentQuestion.questionText}
          currentAnswer={answers[currentQuestion.id] || null}
          language={language}
          persona={persona || 'Entrepreneur'}
          onSuggestionApply={(text) => handleAnswerChange(currentQuestion.id, text)}
          isOpenControlled={isCoachOpen}
          onOpenChange={setIsCoachOpen}
        />
      )}

      {/* Keyboard Shortcuts Button */}
      <button
        onClick={() => setShowShortcuts(true)}
        className={`
          fixed bottom-4 left-4 z-30 hidden lg:flex items-center gap-2
          px-3 py-2 rounded-xl text-xs font-medium
          ${cardBg} border ${borderColor} ${mutedColor}
          hover:text-orange-500 hover:border-orange-500/30
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
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center">
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
                  keys={['Ctrl', 'Enter']}
                  description={`${t.shortcutSave} + ${t.shortcutNext}`}
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
                  {t.pressKey} <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono text-[10px]">Esc</kbd> {language === 'fr' ? 'pour fermer' : 'to close'}
                </p>
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
