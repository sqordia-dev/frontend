import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Sparkles,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  FileText,
  TrendingUp,
  Users,
  Briefcase,
  Target,
  DollarSign,
  X,
  RefreshCw,
  Lightbulb,
  XCircle,
  Building2,
  UserPlus,
  Calculator
} from 'lucide-react';
import { businessPlanService } from '../lib/business-plan-service';
import { useTheme } from '../contexts/ThemeContext';
import { getUserFriendlyError } from '../utils/error-messages';
import { useCmsContent } from '../hooks/useCmsContent';
import { PersonaType } from '../lib/types';
import SEO from '../components/SEO';
import WizardStep from '../components/WizardStep';
import QuestionField from '../components/QuestionField';
import FinancialDriverInput from '../components/FinancialDriverInput';
import MilestoneCelebration from '../components/MilestoneCelebration';
import SectionReviewModal from '../components/SectionReviewModal';
import { apiClient } from '../lib/api-client';

interface Question {
  id: string;
  questionText: string;
  helpText?: string;
  questionType: string;
  order: number;
  isRequired: boolean;
  stepNumber: number;
  responseText?: string;
  isAnswered: boolean;
}

interface StepInfo {
  number: number;
  title: string;
  titleFr: string;
  description?: string;
  descriptionFr?: string;
  timeEstimate: string;
  icon: React.ElementType;
}

interface StepMetadata {
  id: string;
  stepNumber: number;
  title: string;
  titleEN: string | null;
  description: string | null;
  descriptionEN: string | null;
  questionCount: number;
}

// Default step info (fallback if API fails) - 7 sections
const DEFAULT_STEP_INFO: StepInfo[] = [
  {
    number: 1,
    title: 'Business Information',
    titleFr: 'Informations sur l\'entreprise',
    timeEstimate: '~3 min',
    icon: Building2
  },
  {
    number: 2,
    title: 'Problem & Solution',
    titleFr: 'Problème et Solution',
    timeEstimate: '~4 min',
    icon: Lightbulb
  },
  {
    number: 3,
    title: 'Market',
    titleFr: 'Marché',
    timeEstimate: '~4 min',
    icon: Target
  },
  {
    number: 4,
    title: 'Competition',
    titleFr: 'Concurrence',
    timeEstimate: '~3 min',
    icon: Users
  },
  {
    number: 5,
    title: 'Revenue Model',
    titleFr: 'Modèle de revenus',
    timeEstimate: '~4 min',
    icon: DollarSign
  },
  {
    number: 6,
    title: 'Team',
    titleFr: 'Équipe',
    timeEstimate: '~3 min',
    icon: UserPlus
  },
  {
    number: 7,
    title: 'Financials',
    titleFr: 'Finances',
    timeEstimate: '~4 min',
    icon: Calculator
  }
];

// Icon mapping for dynamic icons - 7 sections
const STEP_ICONS: Record<number, React.ElementType> = {
  1: Building2,
  2: Lightbulb,
  3: Target,
  4: Users,
  5: DollarSign,
  6: UserPlus,
  7: Calculator
};

export default function WizardQuestionnairePage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { theme, language, t } = useTheme();
  const { getContent: cms } = useCmsContent('questionnaire');
  const strategyBlue = '#1A2B47';
  const momentumOrange = '#FF6B00';

  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [persona, setPersona] = useState<PersonaType | null>(null);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [showPreview, setShowPreview] = useState(true);
  const previewIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [showMilestone, setShowMilestone] = useState(false);
  const [milestoneStep, setMilestoneStep] = useState<number | null>(null);
  const [stepStartTime, setStepStartTime] = useState<number>(Date.now());
  const [showSectionReview, setShowSectionReview] = useState(false);
  const [sectionReviewLoading, setSectionReviewLoading] = useState(false);
  const [stepMetadata, setStepMetadata] = useState<StepMetadata[]>([]);

  // Merge dynamic step metadata with defaults
  const STEP_INFO: StepInfo[] = useMemo(() => {
    if (stepMetadata.length === 0) return DEFAULT_STEP_INFO;

    return stepMetadata.map((meta, index) => ({
      number: meta.stepNumber,
      title: meta.titleEN || meta.title,
      titleFr: meta.title,
      description: meta.descriptionEN || meta.description || undefined,
      descriptionFr: meta.description || undefined,
      timeEstimate: DEFAULT_STEP_INFO[index]?.timeEstimate || '~3 min',
      icon: STEP_ICONS[meta.stepNumber] || Target
    }));
  }, [stepMetadata]);

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<{
    status?: string;
    progress?: number;
    currentStep?: string;
    completedSections?: number;
    totalSections?: number;
  } | null>(null);
  const generationPollRef = useRef<NodeJS.Timeout | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const generationModalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Rotating tips for generation progress
  const generationTips = useMemo(() => [
    {
      en: "The best business plans are clear and concise - typically 15-25 pages.",
      fr: "Les meilleurs plans d'affaires sont clairs et concis - généralement 15-25 pages."
    },
    {
      en: "Investors spend an average of 3 minutes reviewing a business plan.",
      fr: "Les investisseurs passent en moyenne 3 minutes à examiner un plan d'affaires."
    },
    {
      en: "A strong executive summary can make or break your pitch.",
      fr: "Un résumé exécutif solide peut faire ou défaire votre présentation."
    },
    {
      en: "Include realistic financial projections - overly optimistic numbers raise red flags.",
      fr: "Incluez des projections financières réalistes - des chiffres trop optimistes soulèvent des inquiétudes."
    },
    {
      en: "Your competitive advantage should be clear within the first few pages.",
      fr: "Votre avantage concurrentiel doit être clair dès les premières pages."
    },
    {
      en: "Market research strengthens credibility - cite your sources when possible.",
      fr: "L'étude de marché renforce la crédibilité - citez vos sources lorsque possible."
    },
    {
      en: "A well-defined target audience shows you understand your market.",
      fr: "Un public cible bien défini montre que vous comprenez votre marché."
    },
    {
      en: "Risk assessment demonstrates maturity and thorough planning.",
      fr: "L'évaluation des risques démontre de la maturité et une planification approfondie."
    }
  ], []);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Rotate tips during generation
  useEffect(() => {
    if (!generating) return;

    const interval = setInterval(() => {
      setCurrentTipIndex(prev => (prev + 1) % generationTips.length);
    }, 5000); // Rotate every 5 seconds

    return () => clearInterval(interval);
  }, [generating, generationTips.length]);

  // Focus management for generation modal
  useEffect(() => {
    if (generating) {
      // Save current focus
      previousFocusRef.current = document.activeElement as HTMLElement;

      // Focus the modal or cancel button after a short delay
      setTimeout(() => {
        if (cancelButtonRef.current) {
          cancelButtonRef.current.focus();
        } else if (generationModalRef.current) {
          generationModalRef.current.focus();
        }
      }, 100);
    } else {
      // Restore focus when modal closes
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    }
  }, [generating]);

  // Trap focus within generation modal
  useEffect(() => {
    if (!generating || !generationModalRef.current) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !generationError) {
        // Allow escape to cancel if there's no error
        handleCancelGeneration();
      }

      // Trap focus within modal
      if (e.key === 'Tab') {
        const focusableElements = generationModalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements && focusableElements.length > 0) {
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [generating, generationError]);

  // Cancel generation handler
  const handleCancelGeneration = useCallback(() => {
    // Clear polling interval
    if (generationPollRef.current) {
      clearInterval(generationPollRef.current);
      generationPollRef.current = null;
    }

    setGenerating(false);
    setGenerationStatus(null);
    setGenerationError(null);
    setCurrentTipIndex(0);

    // TODO: Optionally call backend to cancel generation
    // await businessPlanService.cancelGeneration(planId);
  }, []);

  // Get persona from localStorage or user profile
  useEffect(() => {
    const storedPersona = localStorage.getItem('userPersona') as PersonaType | null;
    if (storedPersona) {
      setPersona(storedPersona);
    } else {
      // Try to get from user profile
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

  // Initialize step start time
  useEffect(() => {
    setStepStartTime(Date.now());
  }, [currentStep]);

  // Fetch step metadata from database
  useEffect(() => {
    const fetchStepMetadata = async () => {
      try {
        console.log('Fetching step metadata...');
        const response = await apiClient.get(`/api/v1/questionnaire-v2/steps?language=${language}`);
        console.log('Step metadata response:', response.data);
        if (response.data && Array.isArray(response.data)) {
          setStepMetadata(response.data);
        }
      } catch (err) {
        console.error('Failed to fetch step metadata, using defaults:', err);
        // Keep using defaults if fetch fails
      }
    };

    fetchStepMetadata();
  }, [language]);

  // Fetch questions based on persona
  useEffect(() => {
    if (planId && persona) {
      fetchQuestions();
    }
  }, [planId, persona, language]);

  // Handle hash navigation to specific question
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#question-')) {
      const questionId = hash.replace('#question-', '');
      // Find which step contains this question
      if (questions.length > 0) {
        const question = questions.find(q => q.id === questionId);
        if (question && question.stepNumber !== currentStep) {
          // Navigate to the correct step
          setCurrentStep(question.stepNumber);
          setStepStartTime(Date.now());
        }
        
        // Wait for step to load, then scroll to question
        setTimeout(() => {
          const questionElement = document.getElementById(`question-${questionId}`);
          if (questionElement) {
            questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Focus the textarea if it exists
            const textarea = questionElement.querySelector('textarea');
            if (textarea) {
              setTimeout(() => textarea.focus(), 300);
            }
          }
        }, 500);
      }
    }
  }, [questions, currentStep]);

  // Live preview sync
  useEffect(() => {
    if (planId && showPreview) {
      // Initial fetch
      fetchPreview();
      
      // Set up polling every 3 seconds
      previewIntervalRef.current = setInterval(() => {
        fetchPreview();
      }, 3000);

      return () => {
        if (previewIntervalRef.current) {
          clearInterval(previewIntervalRef.current);
        }
      };
    }
  }, [planId, showPreview, answers]);

  const fetchQuestions = async () => {
    if (!planId || !persona) return;

    setLoading(true);
    setError(null);

    try {
      // Fetch persona-specific questions (template structure)
      const response = await apiClient.get(`/api/v1/questionnaire/templates/${persona}?language=${language}`);

      // Also fetch existing responses for this business plan
      // Use the dedicated responses endpoint which properly returns V2 template question IDs
      let existingResponses: Record<string, string> = {};
      try {
        const responsesData = await businessPlanService.getQuestionnaireResponses(planId, language);
        if (Array.isArray(responsesData)) {
          responsesData.forEach((r: any) => {
            // The response contains the question ID and userResponse
            const questionId = r.id || r.Id || r.questionId || r.QuestionId;
            const responseText = r.userResponse || r.UserResponse || r.responseText || r.ResponseText;
            if (questionId && responseText) {
              existingResponses[questionId] = responseText;
            }
          });
        }
      } catch (responsesErr) {
        console.warn('Could not fetch existing responses, starting fresh:', responsesErr);
      }

      // Handle Result wrapper format: { isSuccess: true, value: { steps: [...] } }
      // or direct format: { steps: [...] }
      const responseData = response.data?.value || response.data;

      if (!responseData) {
        throw new Error('Invalid response format');
      }

      // Extract questions from steps structure
      // Backend returns: { steps: [{ stepNumber, questions: [...] }] }
      const steps = responseData.steps || [];

      // Flatten all questions from all steps
      const questionsData: any[] = [];
      steps.forEach((step: any) => {
        if (step.questions && Array.isArray(step.questions)) {
          step.questions.forEach((q: any) => {
            questionsData.push({
              ...q,
              stepNumber: step.stepNumber || q.stepNumber
            });
          });
        }
      });

      if (!Array.isArray(questionsData) || questionsData.length === 0) {
        console.warn('No questions found in response:', responseData);
        setError(cms('questionnaire.no_questions_error', '') || 'No questions found for this persona. Please try again.');
        return;
      }

      // Map to our Question interface
      // Backend uses PascalCase (QuestionText, QuestionTextEN, HelpText, etc.)
      const mappedQuestions: Question[] = questionsData.map((q: any) => {
        // Handle both camelCase and PascalCase property names
        const questionText = q.questionText || q.QuestionText || '';
        const questionTextEN = q.questionTextEN || q.QuestionTextEN || '';
        const questionTextFR = q.questionTextFR || q.QuestionTextFR || questionText;
        const helpText = q.helpText || q.HelpText || q.description || q.Description || '';
        const helpTextEN = q.helpTextEN || q.HelpTextEN || '';
        const helpTextFR = q.helpTextFR || q.HelpTextFR || helpText;

        const questionId = q.id || q.Id || q.questionId || q.QuestionId;
        // Check for existing response from saved responses
        const savedResponse = existingResponses[questionId];

        return {
          id: questionId,
          questionText: language === 'fr'
            ? (questionTextFR || questionText)
            : (questionTextEN || questionText),
          helpText: language === 'fr'
            ? (helpTextFR || helpText)
            : (helpTextEN || helpText),
          questionType: q.questionType || q.QuestionType || 'LongText',
          order: q.order || q.Order || 0,
          isRequired: q.isRequired !== false && q.IsRequired !== false,
          stepNumber: q.stepNumber || q.StepNumber || 1,
          responseText: savedResponse || q.responseText || q.ResponseText || q.userResponse || q.UserResponse || null,
          isAnswered: !!(savedResponse || q.responseText || q.ResponseText || q.userResponse || q.UserResponse)
        };
      });

      setQuestions(mappedQuestions);

      // Initialize answers from saved responses
      const initialAnswers: Record<string, string> = {};
      mappedQuestions.forEach(q => {
        if (q.responseText) {
          initialAnswers[q.id] = q.responseText;
        }
      });
      setAnswers(initialAnswers);

      // Restore user to where they left off - find the first step with unanswered required questions
      const savedStep = localStorage.getItem(`questionnaire_step_${planId}`);
      if (savedStep) {
        const stepNum = parseInt(savedStep, 10);
        if (stepNum >= 1 && stepNum <= 7) {
          setCurrentStep(stepNum);
        }
      } else {
        // Find the first step with unanswered required questions
        for (let step = 1; step <= 7; step++) {
          const stepQuestions = mappedQuestions.filter(q => q.stepNumber === step);
          const requiredQuestions = stepQuestions.filter(q => q.isRequired);
          const hasUnanswered = requiredQuestions.some(q => !initialAnswers[q.id] || initialAnswers[q.id].trim().length < 10);
          if (hasUnanswered) {
            setCurrentStep(step);
            break;
          }
        }
      }

      // Mark completed steps based on loaded answers
      const completed = new Set<number>();
      for (let step = 1; step <= 7; step++) {
        const stepQuestions = mappedQuestions.filter(q => q.stepNumber === step);
        const requiredQuestions = stepQuestions.filter(q => q.isRequired);
        const allAnswered = requiredQuestions.every(q => {
          const answer = initialAnswers[q.id];
          return answer && answer.trim().length >= 10;
        });
        if (allAnswered && requiredQuestions.length > 0) {
          completed.add(step);
        }
      }
      setCompletedSteps(completed);

      // Scroll to top after questions load to ensure user starts at the top
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
    } catch (err: any) {
      console.error('Failed to fetch questions:', err);
      console.error('Response data:', err.response?.data);
      setError(getUserFriendlyError(err, 'load'));
    } finally {
      setLoading(false);
    }
  };

  const fetchPreview = async () => {
    if (!planId) return;

    try {
      // Fetch current plan preview
      const plan = await businessPlanService.getBusinessPlan(planId);
      // Generate a simple preview from answers
      const preview = generatePreviewFromAnswers();
      setPreviewContent(preview);
    } catch (err) {
      console.error('Failed to fetch preview:', err);
    }
  };

  const generatePreviewFromAnswers = (): string => {
    // Calculate global question numbers
    const sortedQuestions = questions
      .sort((a, b) => {
        if (a.stepNumber !== b.stepNumber) return a.stepNumber - b.stepNumber;
        return a.order - b.order;
      });
    
    // Group questions by step
    const questionsByStep = new Map<number, Question[]>();
    sortedQuestions.forEach(q => {
      if (!questionsByStep.has(q.stepNumber)) {
        questionsByStep.set(q.stepNumber, []);
      }
      questionsByStep.get(q.stepNumber)!.push(q);
    });

    let preview = '';
    
    // Generate preview for each step that has answered questions
    Array.from(questionsByStep.entries())
      .sort(([a], [b]) => a - b)
      .forEach(([stepNum, stepQuestions]) => {
        const answeredQuestions = stepQuestions.filter(q => {
          const answer = answers[q.id] || '';
          return answer.trim().length >= 10; // Minimum length for a valid answer
        });

        if (answeredQuestions.length > 0) {
          const stepTitle = STEP_INFO[stepNum - 1]?.title || `Step ${stepNum}`;
          preview += `# ${stepTitle}\n\n`;
          
          answeredQuestions.forEach((q) => {
            const answer = answers[q.id] || '';
            if (answer.trim()) {
              const globalQuestionNumber = sortedQuestions.findIndex(sq => sq.id === q.id) + 1;
              preview += `## Q${globalQuestionNumber}: ${q.questionText}\n\n${answer}\n\n`;
            }
          });
        }
      });

    return preview;
  };

  // Format preview content as hybrid design (combining best elements from all options)
  const formatPreviewAsRichText = (content: string, currentTheme: 'light' | 'dark' = theme): string => {
    if (!content) return '';

    // Split by sections (lines starting with #)
    const lines = content.split('\n');
    let html = '';
    let currentSection = '';
    let inQuestion = false;
    let currentAnswer: string[] = [];
    let questionNumber = 0;
    let questionText = '';

    // Process inline markdown formatting - clean and professional
    const processInline = (text: string): string => {
      let result = text;
      // Links [text](url) - orange accent
      result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-orange-600 dark:text-orange-400 hover:underline font-medium">$1</a>');
      // Bold (**text** or __text__) - emphasis through font weight
      result = result.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>');
      result = result.replace(/__([^_]+)__/g, '<strong class="font-semibold text-gray-900 dark:text-gray-100">$1</strong>');
      // Italic (*text* or _text_)
      result = result.replace(/\*([^*\n]+?)\*/g, '<em class="italic text-gray-700 dark:text-gray-300">$1</em>');
      result = result.replace(/_([^_\n]+?)_/g, '<em class="italic text-gray-700 dark:text-gray-300">$1</em>');
      return result;
    };

    // Calculate word and character count
    const getWordCount = (text: string): number => {
      return text.trim().split(/\s+/).filter(word => word.length > 0).length;
    };

    const getCharCount = (text: string): number => {
      return text.trim().length;
    };

    // Process lists
    const processLists = (text: string): string => {
      const lines = text.split('\n');
      let result: string[] = [];
      let inList = false;
      let listType: 'ul' | 'ol' | null = null;
      let listItems: string[] = [];

      const flushList = () => {
        if (listItems.length > 0 && listType) {
          const tag = listType === 'ul' ? 'ul' : 'ol';
          const listClass = listType === 'ul' 
            ? 'list-disc list-outside ml-6 mb-4 space-y-2' 
            : 'list-decimal list-outside ml-6 mb-4 space-y-2';
          result.push(`<${tag} class="${listClass}">`);
          listItems.forEach(item => {
            result.push(`<li class="text-gray-700 dark:text-gray-300 leading-relaxed">${processInline(item)}</li>`);
          });
          result.push(`</${tag}>`);
          listItems = [];
        }
        inList = false;
        listType = null;
      };

      for (const line of lines) {
        const trimmed = line.trim();
        
        // Check for bullet list
        if (/^[-*•]\s+/.test(trimmed)) {
          if (!inList || listType !== 'ul') {
            flushList();
            inList = true;
            listType = 'ul';
          }
          listItems.push(trimmed.replace(/^[-*•]\s+/, ''));
        }
        // Check for numbered list
        else if (/^\d+\.\s+/.test(trimmed)) {
          if (!inList || listType !== 'ol') {
            flushList();
            inList = true;
            listType = 'ol';
          }
          listItems.push(trimmed.replace(/^\d+\.\s+/, ''));
        }
        // Regular line
        else if (trimmed) {
          flushList();
          result.push(processInline(line));
        } else {
          flushList();
          result.push('');
        }
      }
      flushList();
      return result.join('\n');
    };

    // Process paragraphs with optimal line length and clean typography
    const processParagraphs = (text: string): string => {
      if (!text.trim()) return '';
      
      const lines = text.split('\n');
      let result: string[] = [];
      let currentParagraph: string[] = [];
      let inList = false;
      let listType: 'ul' | 'ol' | null = null;
      let listItems: string[] = [];

      const flushParagraph = () => {
        if (currentParagraph.length > 0) {
          const paraText = currentParagraph.join(' ').trim();
          if (paraText) {
            // Optimal line length (max-w-2xl) with clean spacing
            result.push(`<p class="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed max-w-2xl" style="line-height: 1.75; font-size: 16px;">${processInline(paraText)}</p>`);
          }
          currentParagraph = [];
        }
      };

      const flushList = () => {
        if (listItems.length > 0 && listType) {
          flushParagraph();
          const tag = listType === 'ul' ? 'ul' : 'ol';
          // Clean list styling with orange markers
          const listClass = listType === 'ul' 
            ? 'list-disc list-outside ml-6 mb-4 space-y-2 max-w-2xl marker:text-orange-500 dark:marker:text-orange-400' 
            : 'list-decimal list-outside ml-6 mb-4 space-y-2 max-w-2xl';
          result.push(`<${tag} class="${listClass}">`);
          listItems.forEach(item => {
            result.push(`<li class="text-gray-700 dark:text-gray-300 leading-relaxed pl-2" style="font-size: 16px;">${processInline(item.trim())}</li>`);
          });
          result.push(`</${tag}>`);
          listItems = [];
        }
        inList = false;
        listType = null;
      };

      for (const line of lines) {
        const trimmed = line.trim();
        
        // Check for bullet list
        if (/^[-*•]\s+/.test(trimmed)) {
          flushParagraph();
          if (!inList || listType !== 'ul') {
            flushList();
            inList = true;
            listType = 'ul';
          }
          listItems.push(trimmed.replace(/^[-*•]\s+/, ''));
        }
        // Check for numbered list
        else if (/^\d+\.\s+/.test(trimmed)) {
          flushParagraph();
          if (!inList || listType !== 'ol') {
            flushList();
            inList = true;
            listType = 'ol';
          }
          listItems.push(trimmed.replace(/^\d+\.\s+/, ''));
        }
        // Empty line - end list or paragraph
        else if (!trimmed) {
          flushList();
          flushParagraph();
        }
        // Regular text line
        else {
          if (inList) {
            flushList();
          }
          currentParagraph.push(trimmed);
        }
      }
      
      flushList();
      flushParagraph();
      
      return result.join('');
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Section header (# Title) - Hybrid: Professional header with orange accent (Option 1)
      if (line.startsWith('# ')) {
        // Flush previous Q&A pair if exists
        if (currentAnswer.length > 0 && questionText) {
          const answerText = currentAnswer.join('\n');
          const answerHtml = processParagraphs(answerText);
          const wordCount = getWordCount(answerText);
          const charCount = getCharCount(answerText);
          
          html += `
            <div class="mb-8">
              <!-- Question Card - Hybrid: Card-based layout (Option 2) -->
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-5 mb-4">
                <div class="flex items-start gap-3 mb-3">
                  <span class="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-sm font-semibold text-orange-700 dark:text-orange-300">
                    ${questionNumber}
                  </span>
                  <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 flex-1">
                    ${processInline(questionText)}
                  </h2>
                </div>
              </div>
              
              <!-- Answer Card - Hybrid: Clean typography with optimal line length (Option 4) -->
              <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                ${answerHtml}
                
                <!-- Word/Character Count - Hybrid: Stats from Option 5 -->
                <div class="flex items-center justify-end gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                  <span>${wordCount} words</span>
                  <span>•</span>
                  <span>${charCount} characters</span>
                </div>
              </div>
            </div>`;
          currentAnswer = [];
        }
        
        const sectionTitle = line.replace(/^#\s+/, '').trim();
        if (sectionTitle) {
          // Hybrid: Professional section header with orange accent underline (Option 1)
          html += `<div class="mb-10 mt-12">
            <h1 class="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
              ${sectionTitle}
            </h1>
            <div class="h-1 w-20 mb-6" style="background-color: ${momentumOrange};"></div>
          </div>`;
        }
      }
      // Question header (## Q1: Question text) - Hybrid: Card-based layout
      else if (line.startsWith('## ')) {
        // Flush previous answer if exists
        if (currentAnswer.length > 0 && questionText) {
          const answerText = currentAnswer.join('\n');
          const answerHtml = processParagraphs(answerText);
          const wordCount = getWordCount(answerText);
          const charCount = getCharCount(answerText);
          
          html += `
            <div class="mb-8">
              <!-- Question Card - Hybrid: Card-based layout (Option 2) -->
              <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-5 mb-4">
                <div class="flex items-start gap-3 mb-3">
                  <span class="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-sm font-semibold text-orange-700 dark:text-orange-300">
                    ${questionNumber}
                  </span>
                  <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 flex-1">
                    ${processInline(questionText)}
                  </h2>
                </div>
              </div>
              
              <!-- Answer Card - Hybrid: Clean typography with optimal line length (Option 4) -->
              <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                ${answerHtml}
                
                <!-- Word/Character Count - Hybrid: Stats from Option 5 -->
                <div class="flex items-center justify-end gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
                  <span>${wordCount} words</span>
                  <span>•</span>
                  <span>${charCount} characters</span>
                </div>
              </div>
            </div>`;
          currentAnswer = [];
        }
        
        const questionMatch = line.match(/^##\s+Q(\d+):\s+(.+)$/);
        if (questionMatch) {
          questionNumber = parseInt(questionMatch[1], 10);
          questionText = questionMatch[2];
          inQuestion = true;
        }
      }
      // Answer content
      else if (inQuestion) {
        currentAnswer.push(line);
      }
    }

    // Flush last answer - Hybrid design
    if (currentAnswer.length > 0 && questionText) {
      const answerText = currentAnswer.join('\n');
      const answerHtml = processParagraphs(answerText);
      const wordCount = getWordCount(answerText);
      const charCount = getCharCount(answerText);
      
      html += `
        <div class="mb-8">
          <!-- Question Card - Hybrid: Card-based layout (Option 2) -->
          <div class="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-5 mb-4">
            <div class="flex items-start gap-3 mb-3">
              <span class="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-sm font-semibold text-orange-700 dark:text-orange-300">
                ${questionNumber}
              </span>
              <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100 flex-1">
                ${processInline(questionText)}
              </h2>
            </div>
          </div>
          
          <!-- Answer Card - Hybrid: Clean typography with optimal line length (Option 4) -->
          <div class="bg-gray-50 dark:bg-gray-900/50 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            ${answerHtml}
            
            <!-- Word/Character Count - Hybrid: Stats from Option 5 -->
            <div class="flex items-center justify-end gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
              <span>${wordCount} words</span>
              <span>•</span>
              <span>${charCount} characters</span>
            </div>
          </div>
        </div>`;
    }

    return html || '<p class="text-gray-400 dark:text-gray-500">Start answering questions to see your preview here...</p>';
  };

  const getCurrentStepQuestions = (): Question[] => {
    return questions
      .filter(q => q.stepNumber === currentStep)
      .sort((a, b) => a.order - b.order);
  };

  const saveAnswer = async (questionId: string, answer: string) => {
    if (!planId || !answer.trim()) return;

    setSaving(questionId);

    try {
      await businessPlanService.submitQuestionnaireResponses(planId, {
        questionTemplateId: questionId,
        responseText: answer
      });

      setQuestions(prev => prev.map(q => 
        q.id === questionId
          ? { ...q, isAnswered: true, responseText: answer }
          : q
      ));
    } catch (err: any) {
      console.error('Failed to save answer:', err);
      setError('Failed to save answer. Please try again.');
    } finally {
      setSaving(null);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
    
    // Auto-save after 2 seconds
    setTimeout(() => {
      if (value.trim()) {
        saveAnswer(questionId, value);
      }
    }, 2000);
  };

  const handleManualSave = async (questionId: string) => {
    const answer = answers[questionId];
    if (answer?.trim()) {
      await saveAnswer(questionId, answer);
    }
  };

  const canGoNext = () => {
    const currentStepQuestions = getCurrentStepQuestions();
    if (currentStepQuestions.length === 0) return false;
    return currentStepQuestions.every(q => q.isAnswered);
  };

  const canGoPrevious = () => {
    return currentStep > 1;
  };

  // Poll generation status
  const pollGenerationStatus = useCallback(async () => {
    if (!planId) return;

    try {
      const status = await businessPlanService.getGenerationStatus(planId);
      const normalizedStatus = {
        status: status.status || status.Status,
        progress: status.completionPercentage || status.CompletionPercentage || status.progress || 0,
        currentStep: status.currentSection || status.CurrentSection || status.currentStep,
        completedSections: status.completedSections || status.CompletedSections || 0,
        totalSections: status.totalSections || status.TotalSections || 0
      };

      setGenerationStatus(normalizedStatus);

      // Check if generation is complete
      const statusLower = (normalizedStatus.status || '').toLowerCase();
      if (statusLower === 'completed' || statusLower === 'generated' || normalizedStatus.progress >= 100) {
        // Clear polling interval
        if (generationPollRef.current) {
          clearInterval(generationPollRef.current);
          generationPollRef.current = null;
        }

        // Update status to show completion before redirect
        setGenerationStatus(prev => ({ ...prev, status: 'completed', progress: 100 }));

        // Wait a moment then navigate (automatic redirect)
        setTimeout(() => {
          setGenerating(false);
          setGenerationStatus(null);
          setGenerationError(null);
          localStorage.removeItem(`questionnaire_step_${planId}`);
          navigate(`/plans/${planId}`);
        }, 2000);
        return;
      }

      // Check if generation failed
      if (statusLower === 'failed' || statusLower === 'error') {
        if (generationPollRef.current) {
          clearInterval(generationPollRef.current);
          generationPollRef.current = null;
        }
        // Keep modal open but show error with retry option
        setGenerationError(status.errorMessage || (cms('questionnaire.generation_failed', '') || 'Business plan generation failed. Please try again.'));
        return;
      }
    } catch (err) {
      console.error('Failed to poll generation status:', err);
    }
  }, [planId, navigate, language]);

  // Retry generation handler
  const handleRetryGeneration = useCallback(async () => {
    if (!planId) return;

    setGenerationError(null);
    setGenerationStatus({ status: 'Starting', progress: 0 });
    setCurrentTipIndex(0);

    try {
      // Trigger generation
      await businessPlanService.generateBusinessPlan(planId);

      // Start polling for status
      generationPollRef.current = setInterval(pollGenerationStatus, 2000);
      // Initial poll
      pollGenerationStatus();
    } catch (err: any) {
      console.error('Failed to retry generation:', err);
      setGenerationError(err.message || (cms('questionnaire.generation_start_failed', '') || 'Failed to start business plan generation. Please try again.'));
    }
  }, [planId, pollGenerationStatus, language]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (generationPollRef.current) {
        clearInterval(generationPollRef.current);
      }
    };
  }, []);

  const handleNext = async () => {
    if (canGoNext() && currentStep < 7) {
      // Check if step is being completed for the first time
      if (!completedSteps.has(currentStep)) {
        setCompletedSteps(prev => new Set([...prev, currentStep]));
        setMilestoneStep(currentStep);
        setShowMilestone(true);
      }

      // Show section review before proceeding (optional - can be skipped)
      // For now, proceed directly
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setStepStartTime(Date.now());
      // Save current step for resume functionality
      if (planId) {
        localStorage.setItem(`questionnaire_step_${planId}`, nextStep.toString());
      }
      setError(null);
    } else if (currentStep === 7 && canGoNext()) {
      // All steps complete - redirect to generation page
      if (planId) {
        localStorage.removeItem(`questionnaire_step_${planId}`);
        navigate(`/generation/${planId}`);
      }
    }
  };

  const handlePrevious = () => {
    if (canGoPrevious()) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      setStepStartTime(Date.now());
      // Save current step for resume functionality
      if (planId) {
        localStorage.setItem(`questionnaire_step_${planId}`, prevStep.toString());
      }
      setError(null);
    }
  };

  const getStepProgress = () => {
    const totalQuestions = questions.length;
    const answeredQuestions = questions.filter(q => q.isAnswered).length;
    return {
      total: totalQuestions,
      answered: answeredQuestions,
      percentage: totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0
    };
  };

  const isStepComplete = (stepNum: number) => {
    const stepQuestions = questions.filter(q => q.stepNumber === stepNum);
    if (stepQuestions.length === 0) return false;
    return stepQuestions.every(q => q.isAnswered);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: momentumOrange }} />
          <p className="text-gray-600 dark:text-gray-400">{cms('questionnaire.loading', '') || 'Loading your questionnaire...'}</p>
        </div>
      </div>
    );
  }

  const currentStepQuestions = getCurrentStepQuestions();
  const stepInfo = STEP_INFO[currentStep - 1];
  const progress = getStepProgress();
  const StepIcon = stepInfo?.icon || FileText;
  
  // Calculate elapsed time for current step
  const elapsedTime = Math.floor((Date.now() - stepStartTime) / 1000 / 60); // minutes

  return (
    <div className="min-h-screen" style={{ backgroundColor: theme === 'dark' ? '#111827' : '#F9FAFB' }}>
      <SEO
        title={`${cms('questionnaire.seo_title', '') || 'Questionnaire'} | Sqordia`}
        description={cms('questionnaire.seo_description', '') || "Answer questions to create your business plan."}
        url={`/questionnaire/${planId}`}
        noindex={true}
        nofollow={true}
      />

      {/* Generation Progress Modal - WCAG 2.0 AA Compliant */}
      {generating && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="generation-modal-title"
          aria-describedby="generation-modal-description"
        >
          <div
            ref={generationModalRef}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-lg w-full mx-4 shadow-2xl"
            tabIndex={-1}
          >
            {/* Screen reader live region for progress updates */}
            <div
              aria-live="polite"
              aria-atomic="true"
              className="sr-only"
            >
              {generationError
                ? (cms('questionnaire.generation_error_sr', '') || 'Generation error')
                : generationStatus?.status === 'completed'
                ? (cms('questionnaire.generation_complete_sr', '') || 'Generation complete, redirecting')
                : `${cms('questionnaire.progress', '') || 'Progress'}: ${Math.round(generationStatus?.progress || 0)}%. ${
                    generationStatus?.currentStep || (cms('questionnaire.processing', '') || 'Processing')
                  }`
              }
            </div>

            <div className="text-center">
              {/* Animated Progress Indicator */}
              <div className="w-20 h-20 mx-auto mb-6 relative">
                {generationError ? (
                  /* Error state icon */
                  <div className="w-full h-full rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <XCircle
                      className="text-red-500 dark:text-red-400"
                      size={40}
                      aria-hidden="true"
                    />
                  </div>
                ) : generationStatus?.status === 'completed' ? (
                  /* Completion state icon */
                  <div
                    className={`w-full h-full rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center ${
                      !prefersReducedMotion ? 'animate-pulse' : ''
                    }`}
                  >
                    <CheckCircle2
                      className="text-green-500 dark:text-green-400"
                      size={40}
                      aria-hidden="true"
                    />
                  </div>
                ) : (
                  /* Progress state - animated spinner */
                  <>
                    {/* Background circle */}
                    <svg
                      className="w-full h-full"
                      viewBox="0 0 100 100"
                      aria-hidden="true"
                    >
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke={theme === 'dark' ? '#374151' : '#E5E7EB'}
                        strokeWidth="8"
                      />
                      {/* Progress arc with smooth transition */}
                      <circle
                        cx="50"
                        cy="50"
                        r="42"
                        fill="none"
                        stroke={momentumOrange}
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${(generationStatus?.progress || 0) * 2.64} 264`}
                        transform="rotate(-90 50 50)"
                        className={prefersReducedMotion ? '' : 'transition-all duration-700 ease-out'}
                      />
                    </svg>
                    {/* Center icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Sparkles
                        className={`text-orange-500 ${!prefersReducedMotion ? 'animate-pulse' : ''}`}
                        size={28}
                        aria-hidden="true"
                      />
                    </div>
                    {/* Rotating outer ring (if motion allowed) */}
                    {!prefersReducedMotion && (
                      <div
                        className="absolute inset-0 rounded-full border-2 border-transparent border-t-orange-300 dark:border-t-orange-600 animate-spin"
                        style={{ animationDuration: '3s' }}
                        aria-hidden="true"
                      />
                    )}
                  </>
                )}
              </div>

              {/* Title */}
              <h3
                id="generation-modal-title"
                className={`text-xl font-bold mb-2 ${
                  generationError
                    ? 'text-red-600 dark:text-red-400'
                    : generationStatus?.status === 'completed'
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-gray-900 dark:text-white'
                }`}
              >
                {generationError
                  ? (cms('questionnaire.generation_error_title', '') || 'Generation Error')
                  : generationStatus?.status === 'completed'
                  ? (cms('questionnaire.generation_complete_title', '') || 'Generation Complete!')
                  : (cms('questionnaire.generation_title', '') || 'Generating Your Business Plan...')}
              </h3>

              {/* Current Section / Status Description */}
              <p
                id="generation-modal-description"
                className={`mb-6 ${
                  generationError
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {generationError
                  ? generationError
                  : generationStatus?.status === 'completed'
                  ? (cms('questionnaire.generation_redirecting', '') || 'Redirecting to your business plan...')
                  : generationStatus?.currentStep || (cms('questionnaire.generation_preparing', '') || 'Preparing your personalized business plan')}
              </p>

              {/* Progress Bar - only show if not error */}
              {!generationError && (
                <>
                  <div
                    className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4 overflow-hidden"
                    role="progressbar"
                    aria-valuenow={Math.round(generationStatus?.progress || 0)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={cms('questionnaire.generation_progress_label', '') || 'Generation progress'}
                  >
                    <div
                      className={`h-full rounded-full ${
                        generationStatus?.status === 'completed'
                          ? 'bg-green-500'
                          : ''
                      } ${prefersReducedMotion ? '' : 'transition-all duration-700 ease-out'}`}
                      style={{
                        width: `${generationStatus?.progress || 0}%`,
                        backgroundColor: generationStatus?.status === 'completed' ? undefined : momentumOrange
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-6">
                    <span>
                      {generationStatus?.completedSections || 0} / {generationStatus?.totalSections || 8} {cms('questionnaire.sections', '') || 'sections'}
                    </span>
                    <span>{Math.round(generationStatus?.progress || 0)}%</span>
                  </div>
                </>
              )}

              {/* Rotating Tips - only show during generation (not error or complete) */}
              {!generationError && generationStatus?.status !== 'completed' && (
                <div
                  className={`bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mb-6 ${
                    !prefersReducedMotion ? 'transition-all duration-500 ease-in-out' : ''
                  }`}
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <div className="flex items-start gap-3">
                    <Lightbulb
                      className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div className="text-left">
                      <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                        {cms('questionnaire.did_you_know', '') || 'Did you know?'}
                      </span>
                      <p
                        className={`text-sm text-blue-800 dark:text-blue-200 mt-1 ${
                          !prefersReducedMotion ? 'animate-fadeIn' : ''
                        }`}
                        key={currentTipIndex}
                      >
                        {language === 'fr'
                          ? generationTips[currentTipIndex].fr
                          : generationTips[currentTipIndex].en}
                      </p>
                    </div>
                  </div>
                  {/* Tip indicator dots */}
                  <div className="flex justify-center gap-1.5 mt-3" aria-hidden="true">
                    {generationTips.map((_, index) => (
                      <div
                        key={index}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                          index === currentTipIndex
                            ? 'bg-blue-600 dark:bg-blue-400 w-3'
                            : 'bg-blue-300 dark:bg-blue-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-center">
                {generationError ? (
                  /* Error state buttons */
                  <>
                    <button
                      onClick={handleCancelGeneration}
                      className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      {cms('questionnaire.cancel', '') || 'Cancel'}
                    </button>
                    <button
                      ref={cancelButtonRef}
                      onClick={handleRetryGeneration}
                      className="px-6 py-2.5 rounded-lg text-white font-medium hover:opacity-90 transition-colors flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                      style={{ backgroundColor: momentumOrange }}
                    >
                      <RefreshCw size={18} aria-hidden="true" />
                      {cms('questionnaire.retry', '') || 'Retry'}
                    </button>
                  </>
                ) : generationStatus?.status !== 'completed' ? (
                  /* In progress - show cancel button */
                  <button
                    ref={cancelButtonRef}
                    onClick={handleCancelGeneration}
                    className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    {cms('questionnaire.cancel', '') || 'Cancel'}
                  </button>
                ) : null}
              </div>

              {/* Estimated time remaining (when in progress) */}
              {!generationError && generationStatus?.status !== 'completed' && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
                  {cms('questionnaire.estimated_time', '') || 'Estimated: 1-2 minutes remaining'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="border-b" style={{ 
        backgroundColor: theme === 'dark' ? '#1F2937' : '#FFFFFF',
        borderColor: theme === 'dark' ? '#374151' : '#E5E7EB'
      }}>
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity"
              style={{ color: theme === 'dark' ? '#9CA3AF' : '#6B7280' }}
            >
              <ArrowLeft size={18} />
              <span>{cms('questionnaire.back_to_dashboard', '') || 'Back to Dashboard'}</span>
            </button>

            <div className="flex items-center gap-4">
              {/* Preview Toggle */}
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={showPreview ? (cms('questionnaire.hide_preview', '') || 'Hide Preview') : (cms('questionnaire.show_preview', '') || 'Show Preview')}
              >
                {showPreview ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>

              {/* Progress */}
              <div className="text-sm">
                <span className="font-medium">{progress.answered}/{progress.total}</span>
                <span className="text-gray-500 dark:text-gray-400 ml-1">{cms('questionnaire.answered', '') || 'answered'}</span>
              </div>
            </div>
          </div>

          {/* Segmented Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">{cms('questionnaire.progress', '') || 'Progress'}</span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {Math.round(progress.percentage)}%
              </span>
            </div>
            <div className="flex gap-1 w-full">
              {STEP_INFO.map((step, idx) => {
                const stepQuestions = questions.filter(q => q.stepNumber === step.number);
                const stepAnswered = stepQuestions.filter(q => q.isAnswered).length;
                const stepProgress = stepQuestions.length > 0 
                  ? (stepAnswered / stepQuestions.length) * 100 
                  : 0;
                const isComplete = isStepComplete(step.number);
                
                return (
                  <div key={step.number} className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isComplete ? 'bg-green-500' : 'bg-orange-500'
                      }`}
                      style={{
                        width: `${stepProgress}%`
                      }}
                    />
                    {idx < STEP_INFO.length - 1 && (
                      <div className="absolute right-0 top-0 w-1 h-full bg-gray-200 dark:bg-gray-700" />
                    )}
                  </div>
                );
              })}
            </div>
            {/* Step Progress Percentages */}
            <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
              {STEP_INFO.map((step) => {
                const stepQuestions = questions.filter(q => q.stepNumber === step.number);
                const stepAnswered = stepQuestions.filter(q => q.isAnswered).length;
                const stepProgress = stepQuestions.length > 0 
                  ? Math.round((stepAnswered / stepQuestions.length) * 100)
                  : 0;
                return (
                  <span key={step.number} className="flex-1 text-center">
                    {stepProgress}%
                  </span>
                );
              })}
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex items-center justify-between mt-6">
            {STEP_INFO.map((step, idx) => {
              const isActive = currentStep === step.number;
              const isComplete = isStepComplete(step.number);
              const StepIconComponent = step.icon;

              return (
                <div
                  key={step.number}
                  className="flex items-center flex-1"
                >
                  <button
                    type="button"
                    onClick={() => setCurrentStep(step.number)}
                    className="flex flex-col items-center gap-2 flex-1 cursor-pointer group"
                  >
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all
                        group-hover:scale-110
                        ${isActive
                          ? 'ring-4 ring-opacity-30 scale-110'
                          : isComplete
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }
                      `}
                      style={isActive ? {
                        backgroundColor: momentumOrange,
                        ringColor: momentumOrange
                      } : {}}
                    >
                      {isComplete ? <CheckCircle2 size={20} /> : <StepIconComponent size={20} />}
                    </div>
                    <span className={`text-xs font-medium text-center transition-colors group-hover:text-[#FF6B00] ${isActive ? 'font-bold' : ''}`} style={{
                      color: isActive
                        ? momentumOrange
                        : undefined
                    }}>
                      {cms('questionnaire.step_' + step.number + '_title', '') || (language === 'fr' ? step.titleFr : step.title)}
                    </span>
                  </button>
                  {idx < STEP_INFO.length - 1 && (
                    <div 
                      className="flex-1 h-0.5 mx-2"
                      style={{ 
                        backgroundColor: idx < currentStep - 1 
                          ? momentumOrange 
                          : (theme === 'dark' ? '#374151' : '#E5E7EB')
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Milestone Celebration */}
      {showMilestone && milestoneStep !== null && (
        <MilestoneCelebration
          stepNumber={milestoneStep}
          stepTitle={cms('questionnaire.step_' + milestoneStep + '_title', '') || (language === 'fr' ? STEP_INFO[milestoneStep - 1]?.titleFr : STEP_INFO[milestoneStep - 1]?.title) || `Step ${milestoneStep}`}
          overallProgress={Math.round(progress.percentage)}
          isVisible={showMilestone}
          onClose={() => setShowMilestone(false)}
        />
      )}

      {/* Section Review Modal */}
      <SectionReviewModal
        isOpen={showSectionReview}
        onClose={() => setShowSectionReview(false)}
        stepNumber={currentStep}
        stepTitle={cms('questionnaire.step_' + currentStep + '_title', '') || (language === 'fr' ? stepInfo?.titleFr : stepInfo?.title) || `Step ${currentStep}`}
        questions={[]} // TODO: Populate with actual question reviews
        onApplyPolish={(questionId, polishedText) => {
          // TODO: Apply polished text
          console.log('Apply polish:', questionId, polishedText);
        }}
        onAddDetails={(questionId, gapIndex) => {
          // TODO: Handle adding details
          console.log('Add details:', questionId, gapIndex);
        }}
        onSkip={() => setShowSectionReview(false)}
        loading={sectionReviewLoading}
      />

      {/* Error Message */}
      {error && (
        <div className="max-w-full mx-auto px-6 pt-4">
          <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-3">
            <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Main Content - Split Pane */}
      <div className="flex h-[calc(100vh-200px)] max-w-full mx-auto">
        {/* Left Pane - Input (40%) */}
        <div 
          className="flex-1 overflow-y-auto p-6 border-r"
          style={{ 
            width: showPreview ? '40%' : '100%',
            backgroundColor: theme === 'dark' ? '#111827' : '#FFFFFF',
            borderColor: theme === 'dark' ? '#374151' : '#E5E7EB'
          }}
        >
          {stepInfo && (
            <WizardStep
              stepNumber={currentStep}
              totalSteps={7}
              title={cms('questionnaire.step_' + currentStep + '_title', '') || (language === 'fr' ? stepInfo.titleFr : stepInfo.title)}
              timeEstimate={stepInfo.timeEstimate}
              elapsedTime={elapsedTime}
              isComplete={isStepComplete(currentStep)}
              canGoNext={canGoNext()}
              canGoPrevious={canGoPrevious()}
              onNext={handleNext}
              onPrevious={handlePrevious}
            >
              <div className="space-y-6">
                {currentStepQuestions.length === 0 ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: momentumOrange }} />
                    <p className="text-gray-500 dark:text-gray-400">{cms('questionnaire.loading_questions', '') || 'Loading questions...'}</p>
                  </div>
                ) : (
                  <>
                    {/* Show Financial Driver Input for Consultant persona in Financials step (7) */}
                    {currentStep === 7 && persona === 'Consultant' && (
                      <FinancialDriverInput
                        persona={persona}
                        onCalculate={(projections) => {
                          // Store projections for later use
                          console.log('Financial projections calculated:', projections);
                        }}
                      />
                    )}
                    
                    {currentStepQuestions.map((question, index) => {
                      // Calculate global question number across all steps
                      const globalQuestionNumber = questions
                        .sort((a, b) => {
                          if (a.stepNumber !== b.stepNumber) return a.stepNumber - b.stepNumber;
                          return a.order - b.order;
                        })
                        .findIndex(q => q.id === question.id) + 1;
                      
                      return (
                        <div key={question.id} id={`question-${question.id}`}>
                          <QuestionField
                            questionId={question.id}
                            questionText={question.questionText}
                            helpText={question.helpText}
                            value={answers[question.id] || ''}
                            onChange={(value) => handleAnswerChange(question.id, value)}
                            onSave={() => handleManualSave(question.id)}
                            isRequired={question.isRequired}
                            isSaving={saving === question.id}
                            context={question.questionText}
                            persona={persona || 'Entrepreneur'}
                            location={{ province: 'Quebec' }} // TODO: Get from user profile or answers
                            enableAIFeedback={true}
                            questionNumber={globalQuestionNumber}
                            totalQuestions={questions.length}
                          />
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            </WizardStep>
          )}
        </div>

        {/* Right Pane - Live Preview (60%) */}
        {showPreview && (
          <div 
            className="flex-1 overflow-y-auto p-6"
            style={{ 
              width: '60%',
              backgroundColor: theme === 'dark' ? '#1F2937' : '#F9FAFB'
            }}
          >
            <div className="max-w-3xl mx-auto">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FileText size={20} />
                  {cms('questionnaire.live_preview', '') || t('questionnaire.livePreview')}
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  {cms('questionnaire.auto_updating', '') || t('questionnaire.autoUpdating')}
                </span>
              </div>
              
              <div 
                className="max-w-none p-8 rounded-lg border shadow-sm"
                style={{
                  backgroundColor: theme === 'dark' ? '#111827' : '#FFFFFF',
                  borderColor: theme === 'dark' ? '#374151' : '#E5E7EB'
                }}
              >
                {previewContent ? (
                  <div 
                    className="rich-preview-content"
                    dangerouslySetInnerHTML={{ 
                      __html: formatPreviewAsRichText(previewContent, theme)
                    }}
                  />
                ) : (
                  <div className="text-center py-12">
                    <FileText size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <p className="text-gray-400 dark:text-gray-500 text-lg">{cms('questionnaire.empty_preview', '') || t('questionnaire.emptyPreview')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
