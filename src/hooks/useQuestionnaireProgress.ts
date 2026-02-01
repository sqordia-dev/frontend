import { useState, useEffect, useCallback } from 'react';
import { Question, QuestionTemplate, Answer } from '../types/questionnaire';
import { questionnaireService } from '../lib/questionnaire-service';

interface UseQuestionnaireProgressOptions {
  planId: string;
  onError?: (error: Error) => void;
}

interface UseQuestionnaireProgressReturn {
  /** List of questions */
  questions: Question[];
  /** Question template */
  template: QuestionTemplate | null;
  /** Current answers */
  answers: Record<string, Answer>;
  /** Loading state */
  isLoading: boolean;
  /** Error message */
  error: string | null;
  /** Current question index */
  currentIndex: number;
  /** Set current question index */
  setCurrentIndex: (index: number) => void;
  /** Update an answer */
  updateAnswer: (questionId: string, value: Answer) => void;
  /** Check if current question is answered */
  isCurrentAnswered: boolean;
  /** Check if all required questions are answered */
  isComplete: boolean;
  /** Progress percentage */
  progressPercentage: number;
  /** Estimated minutes remaining */
  estimatedMinutesRemaining: number;
  /** Reload questionnaire data */
  reload: () => Promise<void>;
}

// Average time per question in minutes
const MINUTES_PER_QUESTION = 1.5;

/**
 * Hook for managing questionnaire progress
 * Fetches questions and answers, tracks progress
 */
export function useQuestionnaireProgress({
  planId,
  onError,
}: UseQuestionnaireProgressOptions): UseQuestionnaireProgressReturn {
  const [template, setTemplate] = useState<QuestionTemplate | null>(null);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch questionnaire data
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch questionnaire template
      const questionnaireData = await questionnaireService.getQuestionnaire(planId);
      setTemplate(questionnaireData);

      // Fetch existing answers
      const existingAnswers = await questionnaireService.getAnswers(planId);
      setAnswers(existingAnswers);

      // Restore current index from localStorage
      const savedIndex = localStorage.getItem(`questionnaire_index_${planId}`);
      if (savedIndex) {
        const index = parseInt(savedIndex, 10);
        if (index >= 0 && index < questionnaireData.questions.length) {
          setCurrentIndex(index);
        }
      } else {
        // Find first unanswered required question
        const firstUnansweredIndex = questionnaireData.questions.findIndex((q) => {
          if (!q.required) return false;
          const answer = existingAnswers[q.id];
          return !answer || (typeof answer === 'string' && answer.trim() === '');
        });
        if (firstUnansweredIndex !== -1) {
          setCurrentIndex(firstUnansweredIndex);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load questionnaire';
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsLoading(false);
    }
  }, [planId, onError]);

  // Load data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Save current index to localStorage
  useEffect(() => {
    if (planId && currentIndex >= 0) {
      localStorage.setItem(`questionnaire_index_${planId}`, currentIndex.toString());
    }
  }, [planId, currentIndex]);

  // Update answer
  const updateAnswer = useCallback((questionId: string, value: Answer) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  }, []);

  // Get questions array
  const questions = template?.questions || [];

  // Check if current question is answered
  const isCurrentAnswered = (() => {
    if (questions.length === 0 || currentIndex >= questions.length) return false;
    const currentQuestion = questions[currentIndex];
    const answer = answers[currentQuestion.id];
    if (!answer) return false;
    if (typeof answer === 'string') return answer.trim().length > 0;
    if (Array.isArray(answer)) return answer.length > 0;
    return true;
  })();

  // Check if all required questions are answered
  const isComplete = (() => {
    if (questions.length === 0) return false;
    return questions.every((q) => {
      if (!q.required) return true;
      const answer = answers[q.id];
      if (!answer) return false;
      if (typeof answer === 'string') return answer.trim().length > 0;
      if (Array.isArray(answer)) return answer.length > 0;
      return true;
    });
  })();

  // Calculate progress percentage
  const progressPercentage = (() => {
    if (questions.length === 0) return 0;
    const answered = questions.filter((q) => {
      const answer = answers[q.id];
      if (!answer) return false;
      if (typeof answer === 'string') return answer.trim().length > 0;
      if (Array.isArray(answer)) return answer.length > 0;
      return true;
    }).length;
    return Math.round((answered / questions.length) * 100);
  })();

  // Estimate remaining time
  const estimatedMinutesRemaining = (() => {
    if (questions.length === 0) return 0;
    const unanswered = questions.filter((q) => {
      const answer = answers[q.id];
      if (!answer) return true;
      if (typeof answer === 'string') return answer.trim().length === 0;
      if (Array.isArray(answer)) return answer.length === 0;
      return false;
    }).length;
    return Math.ceil(unanswered * MINUTES_PER_QUESTION);
  })();

  return {
    questions,
    template,
    answers,
    isLoading,
    error,
    currentIndex,
    setCurrentIndex,
    updateAnswer,
    isCurrentAnswered,
    isComplete,
    progressPercentage,
    estimatedMinutesRemaining,
    reload: fetchData,
  };
}

export default useQuestionnaireProgress;
