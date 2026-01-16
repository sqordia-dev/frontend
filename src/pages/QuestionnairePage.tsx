import { useState, useEffect, useCallback } from 'react';
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
  Briefcase
} from 'lucide-react';
import { businessPlanService } from '../lib/business-plan-service';
import { useTheme } from '../contexts/ThemeContext';

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
  const { theme } = useTheme();

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
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  const [generating, setGenerating] = useState(false);
  const [suggestingQuestionId, setSuggestingQuestionId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [autoSaveTimers, setAutoSaveTimers] = useState<Record<string, NodeJS.Timeout>>({});
  const [focusedQuestion, setFocusedQuestion] = useState<string | null>(null);
  const [planType, setPlanType] = useState<string>('StrategicPlan'); // Default to StrategicPlan for OBNL

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

  const handleGeneratePlan = async () => {
    if (!planId) return;

    setGenerating(true);

    try {
      await businessPlanService.generateBusinessPlan(planId);
      navigate(`/plan/${planId}`);
    } catch (err: any) {
      console.error('Failed to generate plan:', err);
      setError('Failed to generate business plan. Please try again.');
      setGenerating(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 rounded-full dark:border-gray-700" style={{ borderColor: theme === 'dark' ? undefined : lightAIGrey }}></div>
            <div className="absolute inset-0 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: momentumOrange }}></div>
          </div>
          <p className="text-lg font-semibold mb-2" style={{ color: theme === 'dark' ? '#F9FAFB' : strategyBlue }}>Loading your questionnaire...</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Preparing your personalized experience</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Enhanced Header with Progress */}
      <div className="bg-white dark:bg-gray-900 border-b-2 border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <button
              onClick={() => navigate('/dashboard')}
              className="group flex items-center gap-2 px-4 py-2 hover:opacity-80 transition-opacity font-medium text-sm"
              style={{ color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}
            >
              <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span>Back to Dashboard</span>
            </button>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
                style={{ color: theme === 'dark' ? '#F3F4F6' : strategyBlue }}
              >
                <Languages size={16} />
                <span>{language === 'en' ? 'FR' : 'EN'}</span>
              </button>

              {progress && (
                <div className="flex items-center gap-3 px-5 py-2.5 rounded-lg border-2 dark:bg-gray-800 dark:border-gray-700" style={{ 
                  backgroundColor: lightAIGrey,
                  borderColor: theme === 'dark' ? '#374151' : '#E5E7EB'
                }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: momentumOrange }}></div>
                    <span className="text-sm font-bold" style={{ color: theme === 'dark' ? '#F9FAFB' : strategyBlue }}>
                      {progress.completedQuestions}/{progress.totalQuestions}
                    </span>
                  </div>
                  <div className="h-5 w-px bg-gray-300 dark:bg-gray-600"></div>
                  <span className="text-sm font-bold" style={{ color: momentumOrange }}>
                    {Math.round(progress.completionPercentage)}%
                  </span>
                </div>
              )}
            </div>
          </div>

          {progress && (
            <div className="relative">
              <div className="w-full rounded-full h-2 overflow-hidden dark:bg-gray-700" style={{ backgroundColor: lightAIGrey }}>
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden"
                  style={{ 
                    width: `${progress.completionPercentage}%`,
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
              <p className="text-base font-bold text-red-900 dark:text-red-200 mb-1">Error</p>
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

        <div className="grid lg:grid-cols-12 gap-8">
          {/* Enhanced Sidebar Navigation */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 border-gray-200 dark:border-gray-700 p-6 sticky top-32">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-lg" style={{ backgroundColor: strategyBlue }}>
                  <Target className="text-white" size={20} />
                </div>
                <h3 className="text-xl font-bold" style={{ color: theme === 'dark' ? '#F9FAFB' : strategyBlue }}>Sections</h3>
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
                      onClick={() => setCurrentSection(index)}
                      className={`w-full text-left p-4 rounded-lg transition-all duration-200 group ${
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
                            Section {index + 1}
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
                      Section {currentSection + 1} of {sections.length}
                    </div>
                    <h2 className="text-3xl font-bold text-white">
                      {sections[currentSection]}
                    </h2>
                  </div>
                </div>
                <p className="text-white/80 text-base">
                  {getSectionProgress(sections[currentSection]).answered} of {getSectionProgress(sections[currentSection]).total} questions completed
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
                          placeholder="Share your thoughts here... Be as detailed as you'd like."
                          rows={6}
                          className="w-full px-5 py-4 border-2 rounded-xl transition-all duration-200 resize-none focus:outline-none text-base"
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
                                <span>Saving...</span>
                              </>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Check size={14} className="text-orange-600 dark:text-orange-400" />
                                Auto-saved
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
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <Save size={16} />
                              <span>Save Now</span>
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
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles size={16} />
                              <span>AI Suggestion</span>
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
                onClick={() => setCurrentSection(prev => Math.max(0, prev - 1))}
                disabled={currentSection === 0}
                className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                style={{
                  color: theme === 'dark' ? '#9CA3AF' : '#6B7280',
                  borderColor: theme === 'dark' ? '#374151' : '#E5E7EB',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => !(currentSection === 0) && (e.currentTarget.style.borderColor = momentumOrange)}
                onMouseLeave={(e) => !(currentSection === 0) && (e.currentTarget.style.borderColor = '')}
              >
                <ArrowLeft size={20} />
                <span>Previous Section</span>
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
                      <span>Generating Your Plan...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={20} />
                      <span>Generate Business Plan</span>
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={() => setCurrentSection(prev => Math.min(sections.length - 1, prev + 1))}
                  className="flex items-center gap-3 px-8 py-4 text-white rounded-lg font-bold shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: momentumOrange
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = momentumOrangeHover}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = momentumOrange}
                >
                  <span>Next Section</span>
                  <ArrowRight size={20} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

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
      `}</style>
    </div>
  );
}
