import { Lightbulb, Quote, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionCardProps } from '../../types/questionnaire';
import QuestionInput from './QuestionInput';
import { cn } from '@/lib/utils';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * QuestionCard Component
 * Typeform-inspired card with elegant animations and visual hierarchy
 */
export default function QuestionCard({
  question,
  value,
  onChange,
  isActive = true,
  questionNumber,
}: QuestionCardProps) {
  const { t } = useTheme();
  const descriptionId = `question-description-${question.id}`;
  const tipId = `question-tip-${question.id}`;
  const exampleId = `question-example-${question.id}`;

  // Check if the question has been answered
  const hasAnswer = value !== null && value !== undefined && value !== '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.5,
        ease: [0.16, 1, 0.3, 1] // Custom easing for smooth feel
      }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Main Card */}
      <div
        className={cn(
          "relative overflow-hidden",
          "bg-card rounded-2xl sm:rounded-3xl",
          "border border-border/40",
          "shadow-2xl shadow-black/[0.04] dark:shadow-black/[0.2]",
          "transition-shadow duration-500",
          hasAnswer && "shadow-momentum-orange/[0.04]"
        )}
      >
        {/* Subtle gradient overlay at top */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-muted/30 to-transparent pointer-events-none" />

        {/* Question Header */}
        <div className="relative p-6 sm:p-10 pb-0">
          {/* Question Number & Required Badge */}
          {questionNumber !== undefined && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="flex items-center gap-3 mb-6"
            >
              {/* Animated Question Number */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  delay: 0.15,
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }}
                className="relative"
              >
                <div
                  className={cn(
                    "flex items-center justify-center",
                    "w-12 h-12 rounded-2xl",
                    "bg-gradient-to-br from-momentum-orange via-momentum-orange to-[#FF8533]",
                    "text-white font-bold text-lg",
                    "shadow-lg shadow-momentum-orange/30"
                  )}
                >
                  {questionNumber}
                </div>
                {/* Pulse effect for current question */}
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 0, 0.4]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 rounded-2xl bg-momentum-orange/40 blur-md"
                />
              </motion.div>

              {/* Required Badge */}
              {question.required && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.25 }}
                  className={cn(
                    "px-3 py-1 rounded-full",
                    "text-[10px] font-bold uppercase tracking-wider",
                    "bg-destructive/10 text-destructive/80",
                    "border border-destructive/20"
                  )}
                >
                  {t('questionnaire.required')}
                </motion.span>
              )}

              {/* Answered indicator */}
              <AnimatePresence>
                {hasAnswer && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0 }}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      {t('questionnaire.answered')}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Question Text - Large and prominent */}
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className={cn(
              "text-2xl sm:text-3xl font-semibold",
              "text-foreground leading-tight",
              "tracking-tight"
            )}
          >
            {question.text}
          </motion.h2>

          {/* Description */}
          {question.description && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              id={descriptionId}
              className={cn(
                "mt-4 text-base sm:text-lg",
                "text-muted-foreground/80 leading-relaxed"
              )}
            >
              {question.description}
            </motion.p>
          )}
        </div>

        {/* Input Field - With generous spacing */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="relative p-6 sm:p-10 pt-8"
          role="group"
          aria-labelledby={`question-${question.id}`}
        >
          <QuestionInput
            question={question}
            value={value}
            onChange={onChange}
            autoFocus={isActive}
          />
        </motion.div>

        {/* Tip & Example Section */}
        {(question.tip || question.example) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45 }}
            className="px-6 sm:px-10 pb-6 sm:pb-10 space-y-4"
          >
            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border/50 to-transparent" />

            {/* Tip Box - Warm amber styling */}
            <AnimatePresence>
              {question.tip && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  id={tipId}
                  className={cn(
                    "group p-5 rounded-2xl",
                    "bg-gradient-to-br from-amber-50/80 to-amber-100/40",
                    "dark:from-amber-950/40 dark:to-amber-900/20",
                    "border border-amber-200/50 dark:border-amber-800/30",
                    "hover:border-amber-300/60 dark:hover:border-amber-700/40",
                    "transition-colors duration-300"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "flex-shrink-0 p-2.5 rounded-xl",
                      "bg-amber-200/60 dark:bg-amber-800/40",
                      "group-hover:scale-105 transition-transform duration-300"
                    )}>
                      <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={cn(
                        "block text-[11px] font-bold uppercase tracking-wider mb-1.5",
                        "text-amber-700/80 dark:text-amber-400/80"
                      )}>
                        {t('questionnaire.tip')}
                      </span>
                      <p className="text-sm sm:text-base text-amber-950/70 dark:text-amber-100/70 leading-relaxed">
                        {question.tip}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Example Box - Subtle quote styling */}
            <AnimatePresence>
              {question.example && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  id={exampleId}
                  className={cn(
                    "group p-5 rounded-2xl",
                    "bg-muted/40 border border-border/40",
                    "hover:border-border/60 transition-colors duration-300"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "flex-shrink-0 p-2.5 rounded-xl",
                      "bg-muted group-hover:scale-105 transition-transform duration-300"
                    )}>
                      <Quote className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={cn(
                        "block text-[11px] font-bold uppercase tracking-wider mb-1.5",
                        "text-muted-foreground/70"
                      )}>
                        {t('questionnaire.example')}
                      </span>
                      <p className="text-sm sm:text-base text-foreground/60 leading-relaxed italic">
                        "{question.example}"
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
