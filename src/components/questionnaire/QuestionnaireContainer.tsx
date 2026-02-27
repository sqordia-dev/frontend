import { useState, useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Sparkles, Rocket } from 'lucide-react';
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
 * Modern container with smooth transitions and engaging loading states
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

  // Loading state with elegant animation
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {/* Background gradients */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-momentum-orange/[0.03] rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-strategy-blue/[0.03] rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center relative"
        >
          {/* Animated loading indicator */}
          <div className="relative w-20 h-20 mx-auto mb-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="w-full h-full rounded-full border-4 border-muted border-t-momentum-orange" />
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-momentum-orange" />
            </div>
          </div>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl font-semibold text-foreground mb-2"
          >
            {t('questionnaire.preparingQuestions')}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-muted-foreground"
          >
            {t('questionnaire.loading')}
          </motion.p>
        </motion.div>
      </div>
    );
  }

  // Error state with better styling
  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 rounded-3xl bg-destructive/10 flex items-center justify-center mx-auto mb-6"
          >
            <AlertCircle className="w-10 h-10 text-destructive" />
          </motion.div>
          <h2 className="text-2xl font-semibold text-foreground mb-3">
            {t('questionnaire.loadFailed')}
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            {loadError}
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.reload()}
            className={cn(
              "px-8 py-4 rounded-2xl",
              "bg-momentum-orange hover:bg-momentum-orange/90",
              "text-white font-semibold",
              "shadow-lg shadow-momentum-orange/20",
              "transition-all duration-200"
            )}
          >
            {t('questionnaire.tryAgain')}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // No questions state
  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-2xl font-semibold text-foreground mb-3">
            {t('questionnaire.noQuestions')}
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            {t('questionnaire.templateEmpty')}
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard')}
            className={cn(
              "px-8 py-4 rounded-2xl",
              "bg-momentum-orange hover:bg-momentum-orange/90",
              "text-white font-semibold",
              "shadow-lg shadow-momentum-orange/20",
              "transition-all duration-200"
            )}
          >
            {t('questionnaire.backToDashboard')}
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Ambient background gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] bg-momentum-orange/[0.02] rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -20, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute -bottom-1/4 -left-1/4 w-[800px] h-[800px] bg-strategy-blue/[0.02] rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <QuestionnaireHeader
        saveStatus={saveStatus}
        onBack={handleBack}
      />

      {/* Main Content */}
      <div
        ref={containerRef}
        className="relative flex flex-col min-h-[calc(100vh-72px)] pb-32 overflow-y-auto"
      >
        {/* Progress Section */}
        <div className={cn(
          "sticky top-0 z-30",
          "bg-background/80 backdrop-blur-2xl",
          "px-4 py-5 border-b border-border/20"
        )}>
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
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              className="max-w-2xl mx-auto px-4 mt-6"
            >
              <div
                className={cn(
                  "flex items-center gap-4 p-5 rounded-2xl",
                  "bg-destructive/5 border border-destructive/20"
                )}
                role="alert"
              >
                <div className="flex-shrink-0 p-2 rounded-xl bg-destructive/10">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                </div>
                <p className="text-sm text-destructive font-medium">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question Card */}
        <div className="flex-1 flex items-start justify-center px-4 py-10">
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

      {/* Submitting Overlay with celebration */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/90 backdrop-blur-xl flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={cn(
                "bg-card rounded-3xl p-10",
                "text-center shadow-2xl border border-border/50",
                "max-w-sm mx-4"
              )}
            >
              {/* Animated rocket icon */}
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotate: [0, -5, 5, 0]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-momentum-orange to-[#FF8533] flex items-center justify-center shadow-lg shadow-momentum-orange/30"
              >
                <Rocket className="w-10 h-10 text-white" />
              </motion.div>

              <h3 className="text-xl font-semibold text-foreground mb-3">
                {t('questionnaire.submitting')}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('questionnaire.processingAnswers')}
              </p>

              {/* Progress dots */}
              <div className="flex justify-center gap-2 mt-6">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{
                      scale: [1, 1.3, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                    className="w-2 h-2 rounded-full bg-momentum-orange"
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
