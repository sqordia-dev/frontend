import { useState } from 'react';
import { ArrowRight, CheckCircle2, Compass } from 'lucide-react';
import { useTheme } from '../../../contexts/ThemeContext';
import type { StepProps } from '../OnboardingWizard';

export default function FeatureTourStep({ data, onNext, onComplete }: StepProps) {
  const { t } = useTheme();
  const [isCompleting, setIsCompleting] = useState(false);
  const [isSkipping, setIsSkipping] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      if (onComplete) {
        await onComplete();
      } else {
        onNext({});
      }
    } catch {
      setIsCompleting(false);
    }
  };

  const handleSkip = async () => {
    setIsSkipping(true);
    try {
      if (onComplete) {
        await onComplete();
      } else {
        onNext({});
      }
    } catch {
      setIsSkipping(false);
    }
  };

  const isProcessing = isCompleting || isSkipping;

  return (
    <div className="flex flex-col h-full">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center shadow-lg shadow-green-500/20">
          <CheckCircle2 size={32} className="text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          {t('onboarding.step4.title')}!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base max-w-md mx-auto">
          {t('onboarding.step4.subtitle')}
        </p>
      </div>

      <div className="flex-1 min-h-[24px]" />

      <div className="flex flex-col items-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700/50">
        <button
          onClick={handleComplete}
          disabled={isProcessing}
          className={`inline-flex items-center gap-2 px-7 py-3 rounded-xl font-semibold text-white min-h-[48px] text-base ${
            isProcessing ? 'bg-orange-400 cursor-wait' : 'bg-momentum-orange hover:bg-[#E56000] shadow-md shadow-momentum-orange/20'
          }`}
        >
          {isCompleting ? (
            <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />{t('onboarding.step4.creating')}</>
          ) : (
            <>{t('onboarding.step4.startButton')} <ArrowRight size={18} /></>
          )}
        </button>
        <button
          onClick={handleSkip}
          disabled={isProcessing}
          className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium min-h-[44px] ${
            isProcessing ? 'text-gray-400 cursor-wait' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          {isSkipping ? (
            <><span className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />{t('onboarding.step4.creating')}</>
          ) : (
            <><Compass size={18} /> {t('onboarding.step4.skipButton')}</>
          )}
        </button>
      </div>
    </div>
  );
}
