import { useState, useEffect, useCallback, useRef } from 'react';
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
  X
} from 'lucide-react';
import { businessPlanService } from '../lib/business-plan-service';
import { useTheme } from '../contexts/ThemeContext';
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
  timeEstimate: string;
  icon: React.ElementType;
}

const STEP_INFO: StepInfo[] = [
  {
    number: 1,
    title: 'Identity & Vision',
    titleFr: 'Identité et Vision',
    timeEstimate: '~3 min',
    icon: Target
  },
  {
    number: 2,
    title: 'The Offering',
    titleFr: 'L\'Offre',
    timeEstimate: '~4 min',
    icon: Briefcase
  },
  {
    number: 3,
    title: 'Market Analysis',
    titleFr: 'Analyse du Marché',
    timeEstimate: '~5 min',
    icon: TrendingUp
  },
  {
    number: 4,
    title: 'Operations & People',
    titleFr: 'Opérations et Équipe',
    timeEstimate: '~4 min',
    icon: Users
  },
  {
    number: 5,
    title: 'Financials & Risks',
    titleFr: 'Finances et Risques',
    timeEstimate: '~4 min',
    icon: DollarSign
  }
];

export default function WizardQuestionnairePage() {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { theme, t, language } = useTheme();
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
      let existingResponses: Record<string, string> = {};
      try {
        const responsesResponse = await businessPlanService.getQuestionnaire(planId, language);
        const responsesData = responsesResponse?.value || responsesResponse;
        if (responsesData?.questions && Array.isArray(responsesData.questions)) {
          responsesData.questions.forEach((q: any) => {
            const questionId = q.questionId || q.QuestionId || q.id || q.Id;
            const responseText = q.responseText || q.ResponseText || q.userResponse || q.UserResponse;
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
        setError('No questions found for this persona. Please try again.');
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
        if (stepNum >= 1 && stepNum <= 5) {
          setCurrentStep(stepNum);
        }
      } else {
        // Find the first step with unanswered required questions
        for (let step = 1; step <= 5; step++) {
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
      for (let step = 1; step <= 5; step++) {
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
    } catch (err: any) {
      console.error('Failed to fetch questions:', err);
      console.error('Response data:', err.response?.data);
      setError(err.response?.data?.errorMessage || err.response?.data?.error?.message || err.message || 'Failed to load questions. Please try again.');
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
    const requiredQuestions = currentStepQuestions.filter(q => q.isRequired);
    return requiredQuestions.every(q => {
      const answer = answers[q.id];
      return answer && answer.trim().length >= 10;
    });
  };

  const canGoPrevious = () => {
    return currentStep > 1;
  };

  const handleNext = async () => {
    if (canGoNext() && currentStep < 5) {
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
    } else if (currentStep === 5 && canGoNext()) {
      // All steps complete, clear saved step and navigate to plan view
      if (planId) {
        localStorage.removeItem(`questionnaire_step_${planId}`);
      }
      navigate(`/plans/${planId}`);
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
    const requiredQuestions = stepQuestions.filter(q => q.isRequired);
    return requiredQuestions.every(q => {
      const answer = answers[q.id];
      return answer && answer.trim().length >= 10;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: momentumOrange }} />
          <p className="text-gray-600 dark:text-gray-400">Loading your questionnaire...</p>
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
        title={language === 'fr' 
          ? "Questionnaire | Sqordia"
          : "Questionnaire | Sqordia"}
        description={language === 'fr'
          ? "Répondez aux questions pour créer votre plan d'affaires."
          : "Answer questions to create your business plan."}
        url={`/questionnaire/${planId}`}
        noindex={true}
        nofollow={true}
      />

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
              <span>Back to Dashboard</span>
            </button>

            <div className="flex items-center gap-4">
              {/* Preview Toggle */}
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title={showPreview ? 'Hide Preview' : 'Show Preview'}
              >
                {showPreview ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>

              {/* Progress */}
              <div className="text-sm">
                <span className="font-medium">{progress.answered}/{progress.total}</span>
                <span className="text-gray-500 dark:text-gray-400 ml-1">answered</span>
              </div>
            </div>
          </div>

          {/* Segmented Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
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
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all
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
                    <span className={`text-xs font-medium text-center ${isActive ? 'font-bold' : ''}`} style={{
                      color: isActive 
                        ? momentumOrange 
                        : (theme === 'dark' ? '#9CA3AF' : '#6B7280')
                    }}>
                      {language === 'fr' ? step.titleFr : step.title}
                    </span>
                  </div>
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
          stepTitle={STEP_INFO[milestoneStep - 1]?.title || `Step ${milestoneStep}`}
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
        stepTitle={stepInfo?.title || `Step ${currentStep}`}
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
              totalSteps={5}
              title={language === 'fr' ? stepInfo.titleFr : stepInfo.title}
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
                    <p className="text-gray-500 dark:text-gray-400">Loading questions...</p>
                  </div>
                ) : (
                  <>
                    {/* Show Financial Driver Input for Consultant persona in Step 5 */}
                    {currentStep === 5 && persona === 'Consultant' && (
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
                  Live Preview
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Auto-updating
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
                    <p className="text-gray-400 dark:text-gray-500 text-lg">Start answering questions to see your preview here...</p>
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
