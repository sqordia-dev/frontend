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
} from 'lucide-react';
import { businessPlanService } from '../lib/business-plan-service';
import { useTheme } from '../contexts/ThemeContext';
import { QuestionnaireProvider, useQuestionnaire } from '../contexts/QuestionnaireContext';
import { getUserFriendlyError } from '../utils/error-messages';
import { PersonaType, User as UserType } from '../lib/types';
import SEO from '../components/SEO';
import AIInterviewer from '../components/questionnaire/AIInterviewer';
import NotionStyleEditor from '../components/questionnaire/NotionStyleEditor';
import { apiClient } from '../lib/api-client';
import LanguageDropdown from '../components/layout/LanguageDropdown';
import { authService } from '../lib/auth-service';

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

  // Refs
  const questionRefs = useRef<Map<string, HTMLDivElement>>(new Map());

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

  // Theme colors
  const bgColor = theme === 'dark' ? 'bg-gray-950' : 'bg-gray-50';
  const cardBg = theme === 'dark' ? 'bg-gray-900' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-800' : 'border-gray-200';
  const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const mutedColor = theme === 'dark' ? 'text-gray-400' : 'text-gray-500';

  if (loading) {
    return (
      <div className={`min-h-screen ${bgColor} flex items-center justify-center`}>
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-orange-500" />
          <p className={mutedColor}>{t.loading}</p>
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

      {/* Header */}
      <header className={`sticky top-0 z-40 ${cardBg} border-b ${borderColor}`}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Back button */}
            <button
              onClick={() => navigate('/dashboard')}
              className={`flex items-center gap-2 ${mutedColor} hover:text-orange-500 transition-colors`}
            >
              <ArrowLeft size={18} />
              <span className="text-sm font-medium hidden sm:inline">{t.backToDashboard}</span>
            </button>

            {/* Progress */}
            <div className="flex items-center gap-4">
              <div className={`text-sm ${mutedColor} hidden sm:block`}>
                <span className="font-semibold text-orange-500">{answeredCount}</span>
                <span> / {questions.length} {t.answered}</span>
              </div>
              <div className="w-24 sm:w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Language & Theme Toggles */}
            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <LanguageDropdown variant="toggle" />

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-lg transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-700 ${mutedColor} hover:text-orange-500`}
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              {/* User Profile */}
              {user && (
                <Link
                  to="/profile"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-300 hover:bg-gray-200 dark:hover:bg-gray-700 ${mutedColor} hover:text-orange-500`}
                >
                  {user.profilePictureUrl ? (
                    <img
                      src={user.profilePictureUrl}
                      alt={user.firstName || 'User'}
                      className="w-7 h-7 rounded-full object-cover border border-gray-200 dark:border-gray-700"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                      <User size={14} className="text-white" />
                    </div>
                  )}
                  <span className="text-sm font-medium hidden sm:inline">
                    {user.firstName || user.email?.split('@')[0]}
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* Sidebar - Section Navigation */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className={`sticky top-24 ${cardBg} rounded-xl border ${borderColor} overflow-hidden`}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <h3 className={`font-semibold ${textColor}`}>{t.sections}</h3>
              </div>
              <nav className="p-2">
                {STEPS.map(step => {
                  const stepQuestions = questionsByStep.get(step.number) || [];
                  const stepAnswered = stepQuestions.filter(q => answers[q.id]?.trim().length >= 10).length;
                  const isComplete = stepQuestions.length > 0 && stepAnswered === stepQuestions.length;
                  const isExpanded = expandedSections.has(step.number);
                  const StepIcon = step.icon;

                  return (
                    <div key={step.number} className="mb-1">
                      <button
                        onClick={() => toggleSection(step.number)}
                        className={`
                          w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left
                          transition-colors
                          ${currentStep === step.number
                            ? 'bg-orange-500/10 text-orange-500'
                            : theme === 'dark'
                              ? 'hover:bg-gray-800 text-gray-300'
                              : 'hover:bg-gray-100 text-gray-700'
                          }
                        `}
                      >
                        {isComplete ? (
                          <CheckCircle2 size={18} className="text-green-500" />
                        ) : (
                          <StepIcon size={18} />
                        )}
                        <span className="flex-1 text-sm font-medium truncate">
                          {language === 'fr' ? step.titleFr : step.title}
                        </span>
                        <span className={`text-xs ${mutedColor}`}>
                          {stepAnswered}/{stepQuestions.length}
                        </span>
                        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </button>

                      {/* Expanded questions */}
                      {isExpanded && (
                        <div className="ml-6 mt-1 space-y-1">
                          {stepQuestions.map((q) => {
                            const globalIdx = questions.findIndex(x => x.id === q.id);
                            const isAnswered = answers[q.id]?.trim().length >= 10;
                            const isCurrent = globalIdx === currentQuestionIndex;

                            return (
                              <button
                                key={q.id}
                                onClick={() => jumpToQuestion(globalIdx)}
                                className={`
                                  w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left text-xs
                                  transition-colors
                                  ${isCurrent
                                    ? 'bg-orange-500 text-white'
                                    : isAnswered
                                      ? theme === 'dark'
                                        ? 'text-green-400 hover:bg-gray-800'
                                        : 'text-green-600 hover:bg-gray-100'
                                      : theme === 'dark'
                                        ? 'text-gray-400 hover:bg-gray-800'
                                        : 'text-gray-500 hover:bg-gray-100'
                                  }
                                `}
                              >
                                {isAnswered && !isCurrent && <CheckCircle2 size={12} />}
                                <span className="truncate">Q{globalIdx + 1}</span>
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
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                <p className="text-red-500 text-sm flex-1">{error}</p>
                <button onClick={() => setError(null)} className="text-red-500 hover:text-red-400">
                  <X size={18} />
                </button>
              </div>
            )}

            {/* Current Question */}
            {currentQuestion && (
              <div
                ref={el => {
                  if (el) questionRefs.current.set(currentQuestion.id, el);
                }}
                className="mb-8"
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
                <div className="ml-0 lg:ml-16">
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
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-800">
              <button
                onClick={goToPrevious}
                disabled={currentQuestionIndex === 0}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium
                  transition-colors
                  ${currentQuestionIndex === 0
                    ? 'text-gray-400 cursor-not-allowed'
                    : 'text-gray-600 dark:text-gray-300 hover:text-orange-500'
                  }
                `}
              >
                <ArrowLeft size={18} />
                {t.previous}
              </button>

              <div className={`text-sm ${mutedColor}`}>
                {t.questionOf.replace('{current}', String(currentQuestionIndex + 1)).replace('{total}', String(questions.length))}
              </div>

              {currentQuestionIndex < questions.length - 1 ? (
                <button
                  onClick={goToNext}
                  className="flex items-center gap-2 px-6 py-2 rounded-lg font-medium bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                >
                  {t.next}
                  <ArrowRight size={18} />
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={answeredCount < questions.length}
                  className={`
                    flex items-center gap-2 px-6 py-2 rounded-lg font-medium
                    transition-colors
                    ${answeredCount >= questions.length
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  <Sparkles size={18} />
                  {t.generatePlan}
                </button>
              )}
            </div>
          </main>
        </div>
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
