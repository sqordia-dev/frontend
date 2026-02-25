import { useState } from 'react';
import {
  ArrowRight,
  Layout,
  FileText,
  Sparkles,
  Download,
  CheckCircle2,
  SkipForward,
} from 'lucide-react';
import { StepProps } from '../../../types/onboarding';
import { useTheme } from '../../../contexts/ThemeContext';

interface FeatureHighlight {
  icon: React.ElementType;
  titleKey: string;
  descKey: string;
  color: string;
}

const featureHighlights: FeatureHighlight[] = [
  {
    icon: Layout,
    titleKey: 'onboarding.step4.feature.sidebar',
    descKey: 'onboarding.step4.feature.sidebar.desc',
    color: '#6366F1',
  },
  {
    icon: FileText,
    titleKey: 'onboarding.step4.feature.newProject',
    descKey: 'onboarding.step4.feature.newProject.desc',
    color: '#FF6B00',
  },
  {
    icon: Sparkles,
    titleKey: 'onboarding.step4.feature.ai',
    descKey: 'onboarding.step4.feature.ai.desc',
    color: '#8B5CF6',
  },
  {
    icon: Download,
    titleKey: 'onboarding.step4.feature.export',
    descKey: 'onboarding.step4.feature.export.desc',
    color: '#10B981',
  },
];

const nextStepKeys = [
  'onboarding.step4.next.step1',
  'onboarding.step4.next.step2',
  'onboarding.step4.next.step3',
  'onboarding.step4.next.step4',
];

/**
 * Step 4: Feature Tour
 * Shows key platform features and completes onboarding
 */
export default function FeatureTourStep({
  data,
  onNext,
  onComplete,
}: StepProps) {
  const { t } = useTheme();
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      // Pass the onboarding completion
      if (onComplete) {
        await onComplete();
      } else {
        onNext({});
      }
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setIsCompleting(false);
    }
  };

  const handleSkip = async () => {
    // Skip directly to dashboard without creating a plan
    window.location.href = '/dashboard';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 flex items-center justify-center shadow-lg shadow-green-500/20">
          <CheckCircle2 size={32} className="text-green-600 dark:text-green-400" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">
          {t('onboarding.step4.title')}{data.userName ? `, ${data.userName}` : ''}!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-base max-w-md mx-auto">
          {t('onboarding.step4.subtitle')}
        </p>
      </div>

      {/* Feature highlights grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto w-full mb-6">
        {featureHighlights.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow duration-200"
            >
              <div
                className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${feature.color}15` }}
              >
                <Icon size={22} style={{ color: feature.color }} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {t(feature.titleKey)}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-snug">
                  {t(feature.descKey)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* What's next section */}
      <div className="max-w-2xl mx-auto w-full mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
          {t('onboarding.step4.whatsNext')}
        </h3>
        <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-5 border border-orange-200/50 dark:border-orange-800/50">
          <ol className="space-y-3">
            {nextStepKeys.map((stepKey, index) => (
              <li key={index} className="flex items-center gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white text-sm font-semibold flex items-center justify-center shadow-sm">
                  {index + 1}
                </span>
                <span className="text-gray-700 dark:text-gray-300 text-sm">{t(stepKey)}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1 min-h-[24px]" />

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 border-t border-gray-200 dark:border-gray-700/50">
        <button
          onClick={handleSkip}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl
            font-medium text-gray-600 dark:text-gray-400 transition-all duration-200 min-h-[44px]
            hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800
            focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2
            dark:focus:ring-offset-gray-900"
        >
          <SkipForward size={18} aria-hidden="true" />
          {t('onboarding.step4.skipButton')}
        </button>

        <button
          onClick={handleComplete}
          disabled={isCompleting}
          className={`
            inline-flex items-center gap-2 px-7 py-2.5 rounded-xl
            font-semibold text-white transition-all duration-200 min-h-[44px]
            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
            dark:focus:ring-offset-gray-900
            ${isCompleting
              ? 'bg-orange-400 cursor-wait'
              : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40'
            }
          `}
        >
          {isCompleting ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {t('onboarding.step4.creating')}
            </>
          ) : (
            <>
              {t('onboarding.step4.startButton')}
              <ArrowRight size={18} aria-hidden="true" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
