import React from 'react';
import { ArrowLeft, Check, Loader2, AlertCircle, Cloud } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QuestionnaireHeaderProps, SaveStatus } from '../../types/questionnaire';

/**
 * QuestionnaireHeader Component
 * Header with back link, save status indicator, and plan title
 */
export default function QuestionnaireHeader({
  planTitle,
  saveStatus,
  onBack,
}: QuestionnaireHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate('/dashboard');
    }
  };

  // Render save status indicator
  const renderSaveStatus = () => {
    switch (saveStatus) {
      case 'saved':
        return (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Check size={14} />
            </div>
            <span className="text-sm font-medium hidden sm:inline">Saved</span>
          </div>
        );

      case 'saving':
        return (
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
            <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Loader2 size={14} className="animate-spin" />
            </div>
            <span className="text-sm font-medium hidden sm:inline">Saving...</span>
          </div>
        );

      case 'unsaved':
        return (
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <div className="w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Cloud size={14} />
            </div>
            <span className="text-sm font-medium hidden sm:inline">Unsaved</span>
          </div>
        );

      case 'error':
        return (
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <div className="w-6 h-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertCircle size={14} />
            </div>
            <span className="text-sm font-medium hidden sm:inline">Save failed</span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <header
      className="
        sticky top-0 z-50
        w-full
        bg-white dark:bg-gray-900
        border-b border-gray-200 dark:border-gray-800
        shadow-sm
      "
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Back Button */}
          <button
            onClick={handleBack}
            className="
              flex items-center gap-2
              px-3 py-2
              rounded-lg
              text-gray-600 dark:text-gray-400
              hover:text-gray-900 dark:hover:text-white
              hover:bg-gray-100 dark:hover:bg-gray-800
              transition-all duration-200
              min-h-[44px] min-w-[44px]
              focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2
            "
            aria-label="Back to Dashboard"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium hidden sm:inline">
              Back to Dashboard
            </span>
          </button>

          {/* Center: Plan Title (optional) */}
          {planTitle && (
            <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2">
              <h1
                className="
                  text-lg font-semibold
                  text-gray-900 dark:text-white
                  truncate max-w-[300px]
                "
              >
                {planTitle}
              </h1>
            </div>
          )}

          {/* Right: Save Status */}
          <div
            className="
              flex items-center
              px-3 py-2
              rounded-lg
              bg-gray-50 dark:bg-gray-800
              border border-gray-200 dark:border-gray-700
            "
            role="status"
            aria-live="polite"
            aria-label={`Save status: ${saveStatus}`}
          >
            {renderSaveStatus()}
          </div>
        </div>
      </div>
    </header>
  );
}
