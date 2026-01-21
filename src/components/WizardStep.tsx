import { ReactNode } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

interface WizardStepProps {
  stepNumber: number;
  totalSteps: number;
  title: string;
  timeEstimate?: string;
  elapsedTime?: number;
  isComplete: boolean;
  children: ReactNode;
  onPrevious?: () => void;
  onNext?: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
}

export default function WizardStep({
  stepNumber,
  totalSteps,
  title,
  timeEstimate,
  elapsedTime,
  isComplete,
  children,
  onPrevious,
  onNext,
  canGoNext,
  canGoPrevious
}: WizardStepProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Step Header */}
      <div className="mb-6 pb-6 border-b" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm
              ${isComplete ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}
            `}>
              {isComplete ? <CheckCircle2 size={20} /> : stepNumber}
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'inherit' }}>
                {title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Step {stepNumber} of {totalSteps}
              </p>
            </div>
          </div>
          {timeEstimate && (
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Clock size={16} />
              <span>{timeEstimate}</span>
              {elapsedTime !== undefined && elapsedTime > 0 && (
                <span className="text-xs">
                  ({elapsedTime} min elapsed)
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Step Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>

      {/* Step Navigation */}
      <div className="mt-6 pt-6 border-t flex items-center justify-between" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
        <button
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className={`
            px-6 py-2 rounded-lg font-medium transition-all
            ${canGoPrevious
              ? 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              : 'bg-gray-50 dark:bg-gray-900 text-gray-400 dark:text-gray-600 cursor-not-allowed'
            }
          `}
        >
          Previous
        </button>
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className={`
            px-6 py-2 rounded-lg font-medium transition-all
            ${canGoNext
              ? 'text-white hover:opacity-90'
              : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }
          `}
          style={canGoNext ? { backgroundColor: '#FF6B00' } : {}}
        >
          Next Step
        </button>
      </div>
    </div>
  );
}
