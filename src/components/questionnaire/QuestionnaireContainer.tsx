import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle } from 'lucide-react';
import { QuestionnaireContainerProps, Answer, SaveStatus } from '../../types/questionnaire';
import { useQuestionnaireProgress } from '../../hooks/useQuestionnaireProgress';
import { useAutoSave } from '../../hooks/useAutoSave';
import { questionnaireService } from '../../lib/questionnaire-service';
import QuestionnaireHeader from './QuestionnaireHeader';
import QuestionnaireProgress from './QuestionnaireProgress';
import QuestionCard from './QuestionCard';
import QuestionnaireNavigation from './QuestionnaireNavigation';

/**
 * QuestionnaireContainer Component
 * Main container that orchestrates the questionnaire flow
 * Manages state, auto-save, navigation, and animations
 */
export default function QuestionnaireContainer({
  planId,
  onComplete,
  initialAnswers,
}: QuestionnaireContainerProps) {
  const navigate = useNavigate();

  // Use questionnaire progress hook
  const {
    questions,
    answers,
    isLoading,
    error: loadError,
    currentIndex,
    setCurrentIndex,
    updateAnswer,
    isCurrentAnswered,
    isComplete,
    progressPercentage,
    estimatedMinutesRemaining,
  } = useQuestionnaireProgress({
    planId,
    onError: (err) => console.error('Questionnaire error:', err),
  });

  // Local state
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-save hook
  const { status: saveStatus, saveNow } = useAutoSave({
    data: answers,
    onSave: async (data) => {
      await questionnaireService.saveAnswers(planId, data);
    },
    debounceMs: 2000,
    enabled: Object.keys(answers).length > 0,
  });

  // Ref for scroll container
  const containerRef = useRef<HTMLDivElement>(null);

  // Current question
  const currentQuestion = questions[currentIndex];

  // Initialize with initial answers if provided
  useEffect(() => {
    if (initialAnswers && Object.keys(initialAnswers).length > 0) {
      Object.entries(initialAnswers).forEach(([questionId, value]) => {
        updateAnswer(questionId, value);
      });
    }
  }, [initialAnswers, updateAnswer]);

  // Scroll to top when question changes
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentIndex]);

  // Scroll to top when initial loading completes
  useEffect(() => {
    if (!isLoading && questions.length > 0) {
      // Use requestAnimationFrame to ensure DOM has updated after autoFocus
      requestAnimationFrame(() => {
        if (containerRef.current) {
          containerRef.current.scrollTo({ top: 0, behavior: 'instant' });
        }
        window.scrollTo({ top: 0, behavior: 'instant' });
      });
    }
  }, [isLoading, questions.length]);

  // Handle answer change
  const handleAnswerChange = useCallback(
    (value: Answer) => {
      if (currentQuestion) {
        updateAnswer(currentQuestion.id, value);
        setError(null);
      }
    },
    [currentQuestion, updateAnswer]
  );

  // Navigate to next question
  const handleNext = useCallback(() => {
    // Validate required question
    if (currentQuestion?.required && !isCurrentAnswered) {
      setError('Please answer this question before continuing.');
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setError(null);
    }
  }, [currentQuestion, isCurrentAnswered, currentIndex, questions.length, setCurrentIndex]);

  // Navigate to previous question
  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setError(null);
    }
  }, [currentIndex, setCurrentIndex]);

  // Skip current question
  const handleSkip = useCallback(() => {
    if (!currentQuestion?.required && currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setError(null);
    }
  }, [currentQuestion, currentIndex, questions.length, setCurrentIndex]);

  // Complete questionnaire
  const handleComplete = useCallback(async () => {
    // Validate all required questions
    if (!isComplete) {
      setError('Please answer all required questions before completing.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Save any pending answers
      await saveNow();

      // Submit questionnaire (trigger generation)
      await questionnaireService.submitQuestionnaire(planId);

      // Call onComplete callback
      if (onComplete) {
        onComplete();
      } else {
        // Navigate to generation/plan view page
        navigate(`/plans/${planId}`);
      }
    } catch (err) {
      console.error('Failed to complete questionnaire:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to submit questionnaire. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [isComplete, saveNow, planId, onComplete, navigate]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    // Warn about unsaved changes
    if (saveStatus === 'unsaved') {
      const confirm = window.confirm(
        'You have unsaved changes. Are you sure you want to leave?'
      );
      if (!confirm) return;
    }
    navigate('/dashboard');
  }, [saveStatus, navigate]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2
            size={48}
            className="animate-spin mx-auto mb-4 text-[#FF6B00]"
          />
          <p className="text-gray-600 dark:text-gray-400">
            Loading your questionnaire...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center max-w-md">
          <AlertCircle
            size={48}
            className="mx-auto mb-4 text-red-500"
          />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Failed to load questionnaire
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {loadError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="
              px-6 py-3 rounded-xl
              bg-orange-500 hover:bg-orange-600
              text-white font-semibold
              transition-colors
            "
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No questions state
  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            No questions found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The questionnaire template is empty. Please contact support.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="
              px-6 py-3 rounded-xl
              bg-orange-500 hover:bg-orange-600
              text-white font-semibold
              transition-colors
            "
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <QuestionnaireHeader
        saveStatus={saveStatus}
        onBack={handleBack}
      />

      {/* Main Content */}
      <div
        ref={containerRef}
        className="
          flex flex-col
          min-h-[calc(100vh-64px)]
          pb-24
          overflow-y-auto
        "
      >
        {/* Progress Section */}
        <div className="sticky top-0 bg-gray-50 dark:bg-gray-900 z-30 px-4 py-4 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-3xl mx-auto">
            <QuestionnaireProgress
              currentIndex={currentIndex}
              totalQuestions={questions.length}
              estimatedMinutesRemaining={estimatedMinutesRemaining}
            />
          </div>
        </div>

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-3xl mx-auto px-4 mt-4"
            >
              <div
                className="
                  flex items-center gap-3
                  p-4 rounded-xl
                  bg-red-50 dark:bg-red-900/20
                  border border-red-200 dark:border-red-800
                "
                role="alert"
              >
                <AlertCircle
                  size={20}
                  className="text-red-600 dark:text-red-400 flex-shrink-0"
                />
                <p className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question Card */}
        <div className="flex-1 flex items-start justify-center px-4 py-8">
          <AnimatePresence mode="wait">
            {currentQuestion && (
              <QuestionCard
                key={currentQuestion.id}
                question={currentQuestion}
                value={answers[currentQuestion.id] ?? null}
                onChange={handleAnswerChange}
                isActive={true}
                questionNumber={currentIndex + 1}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <QuestionnaireNavigation
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        canGoNext={isCurrentAnswered || !currentQuestion?.required}
        canGoPrevious={currentIndex > 0}
        isLastQuestion={currentIndex === questions.length - 1}
        isRequired={currentQuestion?.required ?? false}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onSkip={handleSkip}
        onComplete={handleComplete}
      />

      {/* Submitting Overlay */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="
              fixed inset-0 z-50
              bg-black/50 backdrop-blur-sm
              flex items-center justify-center
            "
          >
            <div
              className="
                bg-white dark:bg-gray-800
                rounded-2xl p-8
                text-center
                shadow-2xl
                max-w-sm mx-4
              "
            >
              <Loader2
                size={48}
                className="animate-spin mx-auto mb-4 text-[#FF6B00]"
              />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                Submitting your responses...
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Please wait while we process your answers.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
