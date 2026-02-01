import React from 'react';
import { Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { QuestionnaireProgressProps } from '../../types/questionnaire';

/**
 * QuestionnaireProgress Component
 * Shows progress bar with question count and time estimate
 */
export default function QuestionnaireProgress({
  currentIndex,
  totalQuestions,
  estimatedMinutesRemaining,
}: QuestionnaireProgressProps) {
  // Calculate progress percentage
  const progressPercentage =
    totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  // Format time remaining
  const formatTime = (minutes: number): string => {
    if (minutes < 1) return 'Less than a minute';
    if (minutes === 1) return '~1 min remaining';
    return `~${minutes} min remaining`;
  };

  return (
    <div className="w-full">
      {/* Progress Info Row */}
      <div className="flex items-center justify-between mb-3">
        {/* Question Counter */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">
            Question {currentIndex + 1}
          </span>
          <span className="text-sm text-gray-400 dark:text-gray-500">
            of {totalQuestions}
          </span>
        </div>

        {/* Time Estimate */}
        {estimatedMinutesRemaining !== undefined && estimatedMinutesRemaining > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Clock size={14} className="text-gray-400 dark:text-gray-500" />
            <span>{formatTime(estimatedMinutesRemaining)}</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressPercentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="absolute top-0 left-0 h-full rounded-full"
          style={{ backgroundColor: '#FF6B00' }}
        >
          {/* Shimmer effect */}
          <div
            className="
              absolute inset-0
              bg-gradient-to-r from-transparent via-white/30 to-transparent
              animate-shimmer
            "
            style={{
              animationDuration: '2s',
              animationIterationCount: 'infinite',
            }}
          />
        </motion.div>

        {/* Step indicators */}
        <div className="absolute inset-0 flex justify-between px-0.5">
          {Array.from({ length: totalQuestions }).map((_, index) => {
            const stepPercentage = ((index + 1) / totalQuestions) * 100;
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;

            return (
              <div
                key={index}
                className={`
                  w-0.5 h-full transition-colors duration-300
                  ${
                    isCompleted || isCurrent
                      ? 'bg-orange-600/50'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }
                `}
                style={{
                  position: 'absolute',
                  left: `${stepPercentage}%`,
                  transform: 'translateX(-50%)',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* Progress Percentage */}
      <div className="flex justify-end mt-2">
        <span className="text-xs font-medium text-gray-400 dark:text-gray-500">
          {Math.round(progressPercentage)}% complete
        </span>
      </div>
    </div>
  );
}
