import { useEffect, useState } from 'react';
import { CheckCircle2, Sparkles } from 'lucide-react';

interface MilestoneCelebrationProps {
  stepNumber: number;
  stepTitle: string;
  overallProgress: number;
  isVisible: boolean;
  onClose: () => void;
}

export default function MilestoneCelebration({
  stepNumber,
  stepTitle,
  overallProgress,
  isVisible,
  onClose
}: MilestoneCelebrationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 500);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!show) return null;

  const messages = [
    `You've completed ${stepTitle}!`,
    `You're ${overallProgress}% of the way to a finished plan.`,
    'Keep up the great work!'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
      <div className={`
        bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full
        transform transition-all duration-500 ease-out
        ${show ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        pointer-events-auto
      `}>
        <div className="text-center">
          {/* Celebration Icon */}
          <div className="mb-4 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-100 dark:bg-orange-900/50 rounded-full animate-ping" />
              <div className="relative bg-orange-500 rounded-full p-4">
                <CheckCircle2 size={48} className="text-white" />
              </div>
            </div>
          </div>

          {/* Sparkles Animation */}
          <div className="flex justify-center gap-2 mb-4">
            <Sparkles size={24} className="text-orange-500 animate-pulse" style={{ animationDelay: '0s' }} />
            <Sparkles size={24} className="text-orange-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
            <Sparkles size={24} className="text-orange-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
          </div>

          {/* Message */}
          <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Step {stepNumber} Complete!
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-1">
            {messages[0]}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500">
            {messages[1]}
          </p>

          {/* Progress Indicator */}
          <div className="mt-6">
            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {overallProgress}% Complete
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
