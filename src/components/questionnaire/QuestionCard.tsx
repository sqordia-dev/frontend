import { Lightbulb, Quote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionCardProps } from '../../types/questionnaire';
import QuestionInput from './QuestionInput';
import { cn } from '@/lib/utils';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * QuestionCard Component
 * Sophisticated card displaying question with input, tip, and example
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -30, scale: 0.98 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={cn(
        "w-full max-w-2xl mx-auto",
        "bg-card rounded-2xl",
        "border border-border/60",
        "shadow-xl shadow-black/5 dark:shadow-black/20",
        "transition-all duration-300"
      )}
    >
      {/* Question Header */}
      <div className="p-6 sm:p-8 pb-0">
        {/* Question Number Badge */}
        {questionNumber !== undefined && (
          <div className="flex items-center gap-3 mb-5">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 15 }}
              className={cn(
                "flex items-center justify-center",
                "w-10 h-10 rounded-xl",
                "bg-gradient-to-br from-momentum-orange to-[#FF8533]",
                "text-white font-bold text-lg",
                "shadow-lg shadow-momentum-orange/25"
              )}
            >
              {questionNumber}
            </motion.div>
            {question.required && (
              <span className="text-[10px] font-semibold uppercase tracking-wider text-destructive/80 bg-destructive/10 px-2 py-0.5 rounded-full">
                {t('questionnaire.required')}
              </span>
            )}
          </div>
        )}

        {/* Question Text */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-xl sm:text-2xl font-semibold text-foreground leading-snug mb-3"
        >
          {question.text}
        </motion.h2>

        {/* Description */}
        {question.description && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            id={descriptionId}
            className="text-sm text-muted-foreground leading-relaxed"
          >
            {question.description}
          </motion.p>
        )}
      </div>

      {/* Input Field */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="p-6 sm:p-8"
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
        <div className="px-6 sm:px-8 pb-6 sm:pb-8 space-y-3">
          {/* Tip Box */}
          <AnimatePresence>
            {question.tip && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                id={tipId}
                className={cn(
                  "p-4 rounded-xl",
                  "bg-gradient-to-br from-amber-50 to-amber-50/50 dark:from-amber-950/30 dark:to-amber-900/20",
                  "border border-amber-200/60 dark:border-amber-800/40"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "flex-shrink-0 p-2 rounded-lg",
                    "bg-amber-100 dark:bg-amber-900/40"
                  )}>
                    <Lightbulb className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1">
                      {t('questionnaire.tip')}
                    </span>
                    <p className="text-sm text-amber-900/80 dark:text-amber-100/80 leading-relaxed">
                      {question.tip}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Example Box */}
          <AnimatePresence>
            {question.example && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                id={exampleId}
                className={cn(
                  "p-4 rounded-xl",
                  "bg-muted/50 border border-border/50"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 p-2 rounded-lg bg-muted">
                    <Quote className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      {t('questionnaire.example')}
                    </span>
                    <p className="text-sm text-foreground/70 leading-relaxed italic">
                      "{question.example}"
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
