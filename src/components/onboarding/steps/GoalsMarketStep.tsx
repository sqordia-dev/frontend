import { useState } from 'react';
import { ArrowLeft, ArrowRight, Target, Users, Check } from 'lucide-react';
import { StepProps, GOAL_OPTIONS, Goal } from '../../../types/onboarding';
import { useTheme } from '../../../contexts/ThemeContext';

// Map goal IDs to translation keys
const goalTranslationKeys: Record<Goal, string> = {
  'Funding': 'onboarding.goal.funding',
  'Growth': 'onboarding.goal.growth',
  'Launch': 'onboarding.goal.launch',
  'Market': 'onboarding.goal.market',
  'Team': 'onboarding.goal.team',
  'Strategy': 'onboarding.goal.strategy',
  'Partnerships': 'onboarding.goal.partnerships',
  'Validation': 'onboarding.goal.validation',
};

/**
 * Step 3: Goals & Target Market
 * Collects business goals (multi-select) and target market description
 */
export default function GoalsMarketStep({
  data,
  onNext,
  onBack,
  isFirstStep,
}: StepProps) {
  const { t } = useTheme();
  const [goals, setGoals] = useState<Goal[]>(data.goals || []);
  const [targetMarket, setTargetMarket] = useState(data.targetMarket || '');
  const [errors, setErrors] = useState<{ goals?: string; targetMarket?: string }>({});
  const [touched, setTouched] = useState<{ goals?: boolean; targetMarket?: boolean }>({});

  const validate = (): boolean => {
    const newErrors: { goals?: string; targetMarket?: string } = {};

    if (goals.length === 0) {
      newErrors.goals = t('onboarding.step3.goals.error');
    }

    if (!targetMarket.trim()) {
      newErrors.targetMarket = t('onboarding.step3.targetMarket.error.required');
    } else if (targetMarket.trim().length < 10) {
      newErrors.targetMarket = t('onboarding.step3.targetMarket.error.minLength');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGoalToggle = (goal: Goal) => {
    setTouched(prev => ({ ...prev, goals: true }));
    setGoals(prev => {
      if (prev.includes(goal)) {
        return prev.filter(g => g !== goal);
      }
      return [...prev, goal];
    });
  };

  const handleGoalKeyDown = (e: React.KeyboardEvent, goal: Goal) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleGoalToggle(goal);
    }
  };

  const handleTargetMarketBlur = () => {
    setTouched(prev => ({ ...prev, targetMarket: true }));
    validate();
  };

  const handleContinue = () => {
    setTouched({ goals: true, targetMarket: true });
    if (validate()) {
      onNext({
        goals,
        targetMarket: targetMarket.trim(),
      });
    }
  };

  const isValid = goals.length > 0 && targetMarket.trim().length >= 10;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          {t('onboarding.step3.title')}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base max-w-md mx-auto">
          {t('onboarding.step3.subtitle')}
        </p>
      </div>

      {/* Form */}
      <div className="space-y-6 max-w-2xl mx-auto w-full">
        {/* Goals - Multi-select Checkboxes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-orange-500" aria-hidden="true" />
              {t('onboarding.step3.goals')} <span className="text-red-500">*</span>
            </div>
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {t('onboarding.step3.goals.selectAll')}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {GOAL_OPTIONS.map((goal) => {
              const isSelected = goals.includes(goal);

              return (
                <button
                  key={goal}
                  onClick={() => handleGoalToggle(goal)}
                  onKeyDown={(e) => handleGoalKeyDown(e, goal)}
                  className={`
                    relative flex items-center gap-2.5 p-3 rounded-xl border-2 text-left transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900
                    ${isSelected
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20 shadow-sm'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm'
                    }
                  `}
                  role="checkbox"
                  aria-checked={isSelected}
                  aria-label={t(goalTranslationKeys[goal])}
                >
                  {/* Checkbox indicator */}
                  <div
                    className={`
                      w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all duration-200
                      ${isSelected
                        ? 'bg-orange-500 shadow-sm'
                        : 'border-2 border-gray-300 dark:border-gray-600'
                      }
                    `}
                  >
                    {isSelected && (
                      <Check size={14} className="text-white" strokeWidth={3} aria-hidden="true" />
                    )}
                  </div>

                  {/* Label */}
                  <span className={`text-sm font-medium ${
                    isSelected
                      ? 'text-orange-700 dark:text-orange-300'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {t(goalTranslationKeys[goal])}
                  </span>
                </button>
              );
            })}
          </div>
          {touched.goals && errors.goals && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5" role="alert">
              <span className="w-1 h-1 rounded-full bg-red-500" />
              {errors.goals}
            </p>
          )}
        </div>

        {/* Target Market - Textarea */}
        <div>
          <label
            htmlFor="targetMarket"
            className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2"
          >
            <div className="flex items-center gap-2">
              <Users size={18} className="text-orange-500" aria-hidden="true" />
              {t('onboarding.step3.targetMarket')} <span className="text-red-500">*</span>
            </div>
          </label>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            {t('onboarding.step3.targetMarket.help')}
          </p>
          <textarea
            id="targetMarket"
            name="targetMarket"
            value={targetMarket}
            onChange={(e) => setTargetMarket(e.target.value)}
            onBlur={handleTargetMarketBlur}
            placeholder={t('onboarding.step3.targetMarket.placeholder')}
            rows={4}
            className={`
              w-full rounded-xl border px-4 py-3.5 text-base
              text-gray-900 dark:text-white bg-white dark:bg-gray-800/50
              transition-all duration-200
              placeholder:text-gray-400 dark:placeholder:text-gray-500
              focus:outline-none focus:ring-2 focus:ring-offset-0
              resize-none
              ${touched.targetMarket && errors.targetMarket
                ? 'border-red-300 dark:border-red-500 focus:border-red-500 focus:ring-red-500/20'
                : 'border-gray-200 dark:border-gray-700 focus:border-orange-500 focus:ring-orange-500/20 hover:border-gray-300 dark:hover:border-gray-600'
              }
            `}
            aria-invalid={touched.targetMarket && !!errors.targetMarket}
            aria-describedby={errors.targetMarket ? 'targetMarket-error' : 'targetMarket-help'}
            required
          />
          {touched.targetMarket && errors.targetMarket ? (
            <p id="targetMarket-error" className="mt-2 text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5" role="alert">
              <span className="w-1 h-1 rounded-full bg-red-500" />
              {errors.targetMarket}
            </p>
          ) : (
            <p id="targetMarket-help" className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {targetMarket.length}/10 {t('onboarding.step3.targetMarket.counter')}
            </p>
          )}
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1 min-h-[24px]" />

      {/* Navigation buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700/50">
        <button
          onClick={onBack}
          disabled={isFirstStep}
          className={`
            inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
            font-medium transition-all duration-200 min-h-[44px]
            focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
            dark:focus:ring-offset-gray-900
            ${isFirstStep
              ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
            }
          `}
        >
          <ArrowLeft size={18} aria-hidden="true" />
          {t('onboarding.back')}
        </button>

        <button
          onClick={handleContinue}
          disabled={!isValid}
          className={`
            inline-flex items-center gap-2 px-7 py-2.5 rounded-xl
            font-semibold transition-all duration-200 min-h-[44px]
            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
            dark:focus:ring-offset-gray-900
            ${isValid
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {t('onboarding.continue')}
          <ArrowRight size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
