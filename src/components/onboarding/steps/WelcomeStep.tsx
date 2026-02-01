import { CheckCircle, Clock, ArrowRight, SkipForward } from 'lucide-react';
import { StepProps } from '../../../types/onboarding';

/**
 * Welcome step - First step in onboarding flow
 * Shows greeting, explanation of process, and checklist of upcoming steps
 */
export default function WelcomeStep({
  data,
  onNext,
  isFirstStep,
}: StepProps) {
  const userName = data.userName || 'there';

  const checklist = [
    'Choose your profile type',
    'Tell us about your business',
    'Pick a template to get started',
    'Start building your plan',
  ];

  const handleGetStarted = () => {
    onNext({});
  };

  const handleSkip = () => {
    // Skip setup redirects to dashboard
    window.location.href = '/dashboard';
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center px-4">
      {/* Greeting */}
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
        Welcome to Sqordia, {userName}!
      </h1>

      {/* Subtitle */}
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
        Let's get you set up in just a few quick steps. We'll personalize your experience
        and help you create your first business plan.
      </p>

      {/* Estimated time */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 text-sm font-medium mb-8">
        <Clock size={16} aria-hidden="true" />
        <span>Estimated time: ~3 minutes</span>
      </div>

      {/* Checklist */}
      <div className="w-full max-w-md bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-8">
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
          What we'll cover
        </h2>
        <ul className="space-y-3">
          {checklist.map((item, index) => (
            <li
              key={index}
              className="flex items-center gap-3 text-left text-gray-700 dark:text-gray-300"
            >
              <CheckCircle
                size={20}
                className="flex-shrink-0 text-gray-400 dark:text-gray-500"
                aria-hidden="true"
              />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <button
          onClick={handleGetStarted}
          className="
            inline-flex items-center gap-2 px-8 py-3.5 rounded-xl
            bg-orange-500 hover:bg-orange-600 text-white font-semibold
            transition-all duration-200 min-h-[44px]
            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
            dark:focus:ring-offset-gray-900
          "
          style={{ backgroundColor: '#FF6B00' }}
        >
          Let's Get Started
          <ArrowRight size={20} aria-hidden="true" />
        </button>

        <button
          onClick={handleSkip}
          className="
            inline-flex items-center gap-2 px-6 py-3 rounded-xl
            text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200
            hover:bg-gray-100 dark:hover:bg-gray-800
            transition-all duration-200 min-h-[44px]
            focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2
            dark:focus:ring-offset-gray-900
          "
        >
          <SkipForward size={18} aria-hidden="true" />
          Skip setup
        </button>
      </div>

      {/* Help text for returning users */}
      <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
        Already know your way around? Skip setup and go straight to your dashboard.
      </p>
    </div>
  );
}
