import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Share2, TrendingUp, Download, LayoutDashboard, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import type { ExportFormat } from '../../lib/export-service';

interface NextStepCard {
  icon: React.ReactNode;
  titleKey: string;
  descKey: string;
  onClick: () => void;
}

interface ExportSuccessModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** The format that was exported */
  exportedFormat: ExportFormat;
  /** Callback to close modal */
  onClose: () => void;
  /** Callback to open share modal */
  onShare: () => void;
  /** Callback to navigate to financials */
  onGoToFinancials: () => void;
  /** Callback to re-trigger export */
  onDownloadAgain: () => void;
  /** Callback to go to dashboard */
  onGoToDashboard: () => void;
}

/**
 * Export Success Modal
 * Displays a celebration overlay after a successful PDF/Word export
 * with next-step action cards for continued workflow.
 */
export default function ExportSuccessModal({
  isOpen,
  exportedFormat,
  onClose,
  onShare,
  onGoToFinancials,
  onDownloadAgain,
  onGoToDashboard,
}: ExportSuccessModalProps) {
  const { t } = useTheme();

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  const nextSteps: NextStepCard[] = [
    {
      icon: <Share2 size={20} aria-hidden="true" />,
      titleKey: 'exportSuccess.step.share.title',
      descKey: 'exportSuccess.step.share.desc',
      onClick: () => {
        onClose();
        onShare();
      },
    },
    {
      icon: <TrendingUp size={20} aria-hidden="true" />,
      titleKey: 'exportSuccess.step.financials.title',
      descKey: 'exportSuccess.step.financials.desc',
      onClick: () => {
        onClose();
        onGoToFinancials();
      },
    },
    {
      icon: <Download size={20} aria-hidden="true" />,
      titleKey: 'exportSuccess.step.download.title',
      descKey: 'exportSuccess.step.download.desc',
      onClick: () => {
        onClose();
        onDownloadAgain();
      },
    },
    {
      icon: <LayoutDashboard size={20} aria-hidden="true" />,
      titleKey: 'exportSuccess.step.dashboard.title',
      descKey: 'exportSuccess.step.dashboard.desc',
      onClick: () => {
        onClose();
        onGoToDashboard();
      },
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-success-title"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-lg bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <div className="flex justify-end px-4 pt-4">
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
                aria-label={t('exportSuccess.close')}
              >
                <X size={20} />
              </button>
            </div>

            {/* Success Animation */}
            <div className="flex flex-col items-center px-6 pb-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  damping: 12,
                  stiffness: 200,
                  delay: 0.15,
                }}
                className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    type: 'spring',
                    damping: 10,
                    stiffness: 150,
                    delay: 0.3,
                  }}
                >
                  <CheckCircle2
                    size={36}
                    className="text-green-600 dark:text-green-400"
                    aria-hidden="true"
                  />
                </motion.div>
              </motion.div>

              <motion.h2
                id="export-success-title"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="text-xl font-bold text-gray-900 dark:text-white text-center"
              >
                {t('exportSuccess.heading')}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center"
              >
                {t('exportSuccess.subtitle').replace(
                  '{format}',
                  exportedFormat.toUpperCase()
                )}
              </motion.p>
            </div>

            {/* Next Steps */}
            <div className="px-6 pt-4 pb-2">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3"
              >
                {t('exportSuccess.nextSteps')}
              </motion.p>

              <div className="grid grid-cols-2 gap-3">
                {nextSteps.map((step, index) => (
                  <motion.button
                    key={step.titleKey}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.08 }}
                    onClick={step.onClick}
                    className="group flex flex-col items-start p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 hover:border-orange-300 dark:hover:border-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 text-left"
                  >
                    <div className="w-9 h-9 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 group-hover:border-orange-300 dark:group-hover:border-orange-600 group-hover:bg-orange-100 dark:group-hover:bg-orange-900/30 flex items-center justify-center mb-2.5 transition-colors duration-200">
                      <span className="text-gray-600 dark:text-gray-400 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-200">
                        {step.icon}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors duration-200">
                      {t(step.titleKey)}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">
                      {t(step.descKey)}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Footer dismiss */}
            <div className="px-6 py-4 mt-2">
              <button
                onClick={onClose}
                className="w-full px-4 py-2.5 text-sm text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/20 border border-orange-300 dark:border-orange-600 rounded-xl font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                {t('exportSuccess.dismiss')}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
