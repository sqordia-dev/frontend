import { Clock, Sparkles, CheckCircle2, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuestionnaireProgressProps } from '../../types/questionnaire';
import { cn } from '@/lib/utils';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * QuestionnaireProgress Component
 * Engaging progress bar with animated milestones and encouraging feedback
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

  const isComplete = progressPercentage >= 100;
  const isAlmostDone = progressPercentage >= 80 && !isComplete;
  const isHalfway = progressPercentage >= 50 && progressPercentage < 80;

  // Format time remaining
  const formatTime = (minutes: number): string => {
    if (minutes < 1) return t('questionnaire.lessThanMinute');
    if (minutes === 1) return t('questionnaire.oneMinRemaining');
    return t('questionnaire.minutesRemaining').replace('{minutes}', String(minutes));
  };

  // Get milestone message
  const getMilestoneMessage = (): { icon: typeof Sparkles; text: string; color: string } | null => {
    if (isComplete) {
      return {
        icon: Trophy,
        text: t('questionnaire.allDone'),
        color: 'text-emerald-500'
      };
    }
    if (isAlmostDone) {
      return {
        icon: CheckCircle2,
        text: t('questionnaire.almostDone'),
        color: 'text-blue-500'
      };
    }
    if (isHalfway) {
      return {
        icon: Sparkles,
        text: t('questionnaire.halfwayThere'),
        color: 'text-momentum-orange'
      };
    }
    return null;
  };

  const milestone = getMilestoneMessage();

  return (
    <div className="w-full">
      {/* Progress Info Row */}
      <div className="flex items-center justify-between mb-4">
        {/* Question Counter with animated number */}
        <div className="flex items-center gap-4">
          <div className="flex items-baseline gap-1">
            <AnimatePresence mode="wait">
              <motion.span
                key={currentIndex + 1}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="text-3xl font-bold text-foreground tabular-nums"
              >
                {currentIndex + 1}
              </motion.span>
            </AnimatePresence>
            <span className="text-lg text-muted-foreground font-medium">
              / {totalQuestions}
            </span>
          </div>

          {/* Milestone Badge */}
          <AnimatePresence mode="wait">
            {milestone && (
              <motion.div
                key={milestone.text}
                initial={{ opacity: 0, scale: 0.8, x: -10 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full",
                  "bg-gradient-to-r",
                  isComplete && "from-emerald-500/10 to-emerald-500/5 border border-emerald-500/20",
                  isAlmostDone && "from-blue-500/10 to-blue-500/5 border border-blue-500/20",
                  isHalfway && "from-momentum-orange/10 to-momentum-orange/5 border border-momentum-orange/20"
                )}
              >
                <motion.div
                  animate={isComplete ? { rotate: [0, -10, 10, 0] } : {}}
                  transition={{ duration: 0.5, repeat: isComplete ? Infinity : 0, repeatDelay: 2 }}
                >
                  <milestone.icon className={cn("w-4 h-4", milestone.color)} />
                </motion.div>
                <span className={cn(
                  "text-xs font-semibold uppercase tracking-wide",
                  milestone.color
                )}>
                  {milestone.text}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Time Estimate */}
        {estimatedMinutesRemaining !== undefined && estimatedMinutesRemaining > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-sm text-muted-foreground"
          >
            <Clock className="w-4 h-4" />
            <span className="font-medium">{formatTime(estimatedMinutesRemaining)}</span>
          </motion.div>
        )}
      </div>

      {/* Progress Bar Container */}
      <div className="relative">
        {/* Background Track */}
        <div className={cn(
          "relative w-full h-3 rounded-full overflow-hidden",
          "bg-muted/80"
        )}>
          {/* Subtle pattern overlay */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)'
            }}
          />

          {/* Progress Fill */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "absolute top-0 left-0 h-full rounded-full",
              "bg-gradient-to-r",
              isComplete
                ? "from-emerald-500 via-emerald-400 to-emerald-500"
                : "from-momentum-orange via-[#FF8533] to-momentum-orange"
            )}
          >
            {/* Animated shimmer effect */}
            <motion.div
              animate={{
                x: ['-100%', '200%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
                repeatDelay: 1
              }}
              className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            />

            {/* Glowing orb at the edge */}
            <motion.div
              className={cn(
                "absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2",
                "w-5 h-5 rounded-full",
                isComplete ? "bg-emerald-400" : "bg-white/60",
                "blur-sm"
              )}
              animate={{
                opacity: [0.5, 0.8, 0.5],
                scale: [1, 1.1, 1]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>

          {/* Milestone Markers */}
          {[25, 50, 75].map((milestone) => (
            <motion.div
              key={milestone}
              className="absolute top-0 bottom-0 flex items-center"
              style={{ left: `${milestone}%` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div
                className={cn(
                  "w-0.5 h-2 rounded-full transition-all duration-500",
                  progressPercentage >= milestone
                    ? isComplete
                      ? "bg-emerald-200/50"
                      : "bg-white/40"
                    : "bg-border/60"
                )}
              />
            </motion.div>
          ))}
        </div>

        {/* Progress Percentage Label */}
        <div className="flex justify-between items-center mt-2.5">
          <span className="text-xs font-medium text-muted-foreground/60">
            {t('questionnaire.progress')}
          </span>
          <motion.span
            key={Math.round(progressPercentage)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              "text-sm font-bold tabular-nums",
              isComplete ? "text-emerald-500" : "text-foreground/80"
            )}
          >
            {Math.round(progressPercentage)}%
          </motion.span>
        </div>
      </div>
    </div>
  );
}
