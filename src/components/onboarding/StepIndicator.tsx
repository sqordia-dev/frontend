interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepTitles?: string[];
}

/**
 * Progress indicator showing current step in onboarding flow
 * Displays dots for each step with connecting lines
 * WCAG 2.0 AA compliant with proper ARIA labels
 */
export default function StepIndicator({
  currentStep,
  totalSteps,
  stepTitles = []
}: StepIndicatorProps) {
  return (
    <div
      className="flex items-center justify-center gap-2"
      role="progressbar"
      aria-valuenow={currentStep + 1}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Step ${currentStep + 1} of ${totalSteps}${stepTitles[currentStep] ? `: ${stepTitles[currentStep]}` : ''}`}
    >
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;
        const isFuture = index > currentStep;

        return (
          <div key={index} className="flex items-center">
            {/* Step dot */}
            <div
              className={`
                w-3 h-3 rounded-full transition-all duration-300
                ${isCurrent
                  ? 'bg-orange-500 ring-4 ring-orange-500/20'
                  : isCompleted
                    ? 'bg-orange-300'
                    : 'bg-gray-300 dark:bg-gray-600'
                }
              `}
              aria-hidden="true"
            />

            {/* Connecting line (not after last dot) */}
            {index < totalSteps - 1 && (
              <div
                className={`
                  w-8 h-0.5 mx-1 transition-all duration-300
                  ${index < currentStep
                    ? 'bg-orange-300'
                    : 'bg-gray-300 dark:bg-gray-600'
                  }
                `}
                aria-hidden="true"
              />
            )}
          </div>
        );
      })}

      {/* Screen reader text */}
      <span className="sr-only">
        Step {currentStep + 1} of {totalSteps}
        {stepTitles[currentStep] && `: ${stepTitles[currentStep]}`}
      </span>
    </div>
  );
}
