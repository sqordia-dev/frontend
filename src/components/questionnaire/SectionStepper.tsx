// frontend/src/components/questionnaire/SectionStepper.tsx
import { CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface Step {
  number: number;
  title: string;
  titleFr: string;
}

interface SectionStepperProps {
  steps: Step[];
  currentIndex: number;
  completedIndices: Set<number>;
  onStepClick: (index: number) => void;
}

export default function SectionStepper({
  steps,
  currentIndex,
  completedIndices,
  onStepClick,
}: SectionStepperProps) {
  const { theme, language } = useTheme();

  return (
    <div className="flex items-center gap-1">
      {steps.map((step, idx) => {
        const isComplete = completedIndices.has(idx);
        const isCurrent = idx === currentIndex;
        const isPast = idx < currentIndex;

        return (
          <div key={step.number} className="flex items-center">
            <button
              onClick={() => onStepClick(idx)}
              title={language === 'fr' ? step.titleFr : step.title}
              className={`
                w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/50
                ${isComplete
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : isCurrent
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                    : isPast
                      ? 'bg-orange-200 text-orange-700 hover:bg-orange-300 dark:bg-orange-900/50 dark:text-orange-400'
                      : theme === 'dark'
                        ? 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                        : 'bg-slate-200 text-slate-500 hover:bg-slate-300'
                }
              `}
            >
              {isComplete ? <CheckCircle2 size={14} /> : step.number}
            </button>
            {idx < steps.length - 1 && (
              <div className={`w-4 h-0.5 mx-0.5 ${
                isPast || isComplete
                  ? 'bg-orange-300 dark:bg-orange-700'
                  : theme === 'dark' ? 'bg-slate-700' : 'bg-slate-200'
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
