import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, AlertCircle, Sparkles } from 'lucide-react';
import { QuestionnaireContainerProps, Answer } from '../../types/questionnaire';
import { useQuestionnaireProgress } from '../../hooks/useQuestionnaireProgress';
import { useAutoSave } from '../../hooks/useAutoSave';
import { questionnaireService } from '../../lib/questionnaire-service';
import QuestionnaireHeader from './QuestionnaireHeader';
import QuestionnaireProgress from './QuestionnaireProgress';
import QuestionCard from './QuestionCard';
import QuestionnaireNavigation from './QuestionnaireNavigation';
import { cn } from '@/lib/utils';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * QuestionnaireContainer Component
 * Main container orchestrating the questionnaire flow with refined design
 */
export default function QuestionnaireContainer({
  planId,
  onComplete,
  initialAnswers,
}: QuestionnaireContainerProps) {
  const navigate = useNavigate();
  const { t } = useTheme();

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
    if (currentQuestion?.required && !isCurrentAnswered) {
      setError(t('questionnaire.answerRequired'));
      return;
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setError(null);
    }
  }, [currentQuestion, isCurrentAnswered, currentIndex, questions.length, setCurrentIndex, t]);

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
    if (!isComplete) {
      setError(t('questionnaire.completeAllRequired'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await saveNow();
      await questionnaireService.submitQuestionnaire(planId);

      if (onComplete) {
        onComplete();
      } else {
        navigate(`/plans/${planId}`);
      }
    } catch (err) {
      console.error('Failed to complete questionnaire:', err);
      setError(
        err instanceof Error
          ? err.message
          : t('questionnaire.submitFailed')
      );
    } finally {
      setIsSubmitting(false);
    }
  }, [isComplete, saveNow, planId, onComplete, navigate, t]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (saveStatus === 'unsaved') {
      const confirm = window.confirm(t('questionnaire.unsavedWarning'));
      if (!confirm) return;
    }
    navigate('/dashboard');
  }, [saveStatus, navigate, t]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="w-10 h-10 text-momentum-orange mx-auto mb-4" />
          </motion.div>
          <p className="text-muted-foreground">
            {t('questionnaire.loading')}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-destructive" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {t('questionnaire.loadFailed')}
          </h2>
          <p className="text-muted-foreground mb-6">
            {loadError}
          </p>
          <button
            onClick={() => window.location.reload()}
            className={cn(
              "px-6 py-3 rounded-xl",
              "bg-momentum-orange hover:bg-momentum-orange/90",
              "text-white font-semibold",
              "transition-colors"
            )}
          >
            {t('questionnaire.tryAgain')}
          </button>
        </div>
      </div>
    );
  }

  // No questions state
  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {t('questionnaire.noQuestions')}
          </h2>
          <p className="text-muted-foreground mb-6">
            {t('questionnaire.templateEmpty')}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className={cn(
              "px-6 py-3 rounded-xl",
              "bg-momentum-orange hover:bg-momentum-orange/90",
              "text-white font-semibold",
              "transition-colors"
            )}
          >
            {t('questionnaire.backToDashboard')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle background gradient */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-momentum-orange/[0.02] rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-strategy-blue/[0.02] rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      {/* Header */}
      <QuestionnaireHeader
        saveStatus={saveStatus}
        onBack={handleBack}
      />

      {/* Main Content */}
      <div
        ref={containerRef}
        className="relative flex flex-col min-h-[calc(100vh-64px)] pb-28 overflow-y-auto"
      >
        {/* Progress Section */}
        <div className="sticky top-0 bg-background/80 backdrop-blur-xl z-30 px-4 py-4 border-b border-border/30">
          <div className="max-w-2xl mx-auto">
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
              className="max-w-2xl mx-auto px-4 mt-4"
            >
              <div className={cn(
                "flex items-center gap-3 p-4 rounded-xl",
                "bg-destructive/10 border border-destructive/20"
              )} role="alert">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive font-medium">{error}</p>
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
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={cn(
                "bg-card rounded-2xl p-8",
                "text-center shadow-2xl border border-border/50",
                "max-w-sm mx-4"
              )}
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 mx-auto mb-4"
              >
                <Sparkles className="w-12 h-12 text-momentum-orange" />
              </motion.div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {t('questionnaire.submitting')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('questionnaire.processingAnswers')}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
