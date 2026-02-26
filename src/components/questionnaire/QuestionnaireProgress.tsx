import { Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { QuestionnaireProgressProps } from '../../types/questionnaire';
import { cn } from '@/lib/utils';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * QuestionnaireProgress Component
 * Elegant progress bar with question count and time estimate
 */
export default function QuestionnaireProgress({
  currentIndex,
  totalQuestions,
  estimatedMinutesRemaining,
}: QuestionnaireProgressProps) {
  const { t } = useTheme();

  // Calculate progress percentage
  const progressPercentage =
    totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  // Format time remaining
  const formatTime = (minutes: number): string => {
    if (minutes < 1) return t('questionnaire.lessThanMinute');
    if (minutes === 1) return t('questionnaire.oneMinRemaining');
    return t('questionnaire.minutesRemaining').replace('{minutes}', String(minutes));
  };

  return (
    <div className="w-full">
      {/* Progress Info Row */}
      <div className="flex items-center justify-between mb-3">
        {/* Question Counter */}
        <div className="flex items-center gap-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-foreground tabular-nums">
              {currentIndex + 1}
            </span>
            <span className="text-sm text-muted-foreground">
              / {totalQuestions}
            </span>
          </div>

          {/* Completion badge at certain milestones */}
          {progressPercentage >= 50 && progressPercentage < 100 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-momentum-orange/10 text-momentum-orange"
            >
              <Sparkles className="w-3 h-3" />
              <span className="text-[10px] font-semibold uppercase tracking-wide">
                {t('questionnaire.halfwayThere')}
              </span>
            </motion.div>
          )}
        </div>

        {/* Time Estimate */}
        {estimatedMinutesRemaining !== undefined && estimatedMinutesRemaining > 0 && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{formatTime(estimatedMinutesRemaining)}</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
        {/* Background track with subtle pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-muted to-muted/80" />

        {/* Progress fill */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className={cn(
            "absolute top-0 left-0 h-full rounded-full",
            "bg-gradient-to-r from-momentum-orange to-[#FF8533]"
          )}
        >
          {/* Animated glow on leading edge */}
          <motion.div
            className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white/40 blur-sm"
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>

        {/* Milestone markers */}
        <div className="absolute inset-0 flex items-center">
          {[25, 50, 75].map((milestone) => (
            <div
              key={milestone}
              className={cn(
                "absolute w-0.5 h-full transition-colors duration-300",
                progressPercentage >= milestone
                  ? "bg-white/30"
                  : "bg-border/50"
              )}
              style={{ left: `${milestone}%` }}
            />
          ))}
        </div>
      </div>

      {/* Progress Percentage */}
      <div className="flex justify-between items-center mt-2">
        <span className="text-[11px] font-medium text-muted-foreground/70">
          {t('questionnaire.progress')}
        </span>
        <span className="text-[11px] font-semibold text-muted-foreground tabular-nums">
          {Math.round(progressPercentage)}%
        </span>
      </div>
    </div>
  );
}
