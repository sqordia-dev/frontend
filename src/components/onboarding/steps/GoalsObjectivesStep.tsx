import { useState } from 'react';
import { ArrowLeft, ArrowRight, Check, SkipForward } from 'lucide-react';
import { GOAL_OPTIONS } from '../../../types/onboarding';
import { useTheme } from '../../../contexts/ThemeContext';
import type { StepProps } from '../OnboardingWizard';

const goalTranslationKeys: Record<string, string> = {
  'Funding': 'onboarding.goal.funding',
  'Growth': 'onboarding.goal.growth',
  'Launch': 'onboarding.goal.launch',
  'Market': 'onboarding.goal.market',
  'Team': 'onboarding.goal.team',
  'Strategy': 'onboarding.goal.strategy',
  'Partnerships': 'onboarding.goal.partnerships',
  'Validation': 'onboarding.goal.validation',
};

export default function GoalsObjectivesStep({ data, onNext, onBack }: StepProps) {
  const { t } = useTheme();
  const [selectedGoals, setSelectedGoals] = useState<string[]>(data.goals || []);

  const toggleGoal = (goal: string) => {
    setSelectedGoals(prev =>
      prev.includes(goal) ? prev.filter(g => g !== goal) : [...prev, goal]
    );
  };

  const handleContinue = () => {
    onNext({ goals: selectedGoals.length > 0 ? selectedGoals : undefined });
  };

  const handleSkip = () => {
    onNext({});
  };

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          {t('onboarding.step3.title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base max-w-md mx-auto">
          {t('onboarding.step3.subtitle')}
        </p>
      </div>

      <div className="max-w-2xl mx-auto w-full">
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
          {t('onboarding.step3.goals')}
          <span className="text-gray-400 text-xs ml-2 font-normal">(optional, select multiple)</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          {GOAL_OPTIONS.map((goal) => {
            const isSelected = selectedGoals.includes(goal);
            return (
              <button
                key={goal}
                onClick={() => toggleGoal(goal)}
                className={`relative px-4 py-3 rounded-xl border-2 text-left text-sm font-medium transition-all ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-600'
                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 hover:shadow-sm'
                }`}
              >
                {isSelected && (
                  <Check size={16} className="absolute top-2 right-2 text-orange-500" />
                )}
                {t(goalTranslationKeys[goal]) || goal}
              </button>
            );
          })}
        </div>
        {selectedGoals.length > 0 && (
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            {selectedGoals.length} goal{selectedGoals.length > 1 ? 's' : ''} selected
          </p>
        )}
      </div>

      <div className="flex-1 min-h-[24px]" />

      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700/50">
        <button onClick={onBack} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 min-h-[44px]">
          <ArrowLeft size={18} /> {t('onboarding.back')}
        </button>
        <div className="flex gap-3">
          <button
            onClick={handleSkip}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 min-h-[44px]"
          >
            <SkipForward size={16} /> Skip
          </button>
          <button
            onClick={handleContinue}
            className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl font-semibold bg-momentum-orange hover:bg-[#E56000] text-white shadow-md shadow-momentum-orange/20 min-h-[44px]"
          >
            {t('onboarding.continue')} <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
