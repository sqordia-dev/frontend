import { useState } from 'react';
import { Lightbulb, X } from 'lucide-react';

interface ContextualHelpProps {
  helpText: string;
  language?: 'en' | 'fr';
}

export default function ContextualHelp({ helpText, language = 'en' }: ContextualHelpProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!helpText) return null;

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-orange-50 dark:hover:bg-orange-900/20"
        style={{ color: '#FF6B00' }}
        aria-label={language === 'fr' ? 'Aide contextuelle' : 'Contextual help'}
      >
        <Lightbulb size={16} />
        <span className="hidden sm:inline">
          {language === 'fr' ? 'Pourquoi c\'est important pour BDC' : 'Why this matters to BDC'}
        </span>
        <span className="sm:hidden">
          {language === 'fr' ? 'Info' : 'Info'}
        </span>
      </button>

      {/* Expandable Card */}
      {isOpen && (
        <div className="absolute z-10 mt-2 w-full max-w-md rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3 flex-1">
              <div className="flex-shrink-0 mt-0.5">
                <Lightbulb size={20} style={{ color: '#FF6B00' }} />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold mb-1.5 text-gray-900 dark:text-gray-100">
                  {language === 'fr' ? 'Pourquoi c\'est important' : 'Why this matters'}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {helpText}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
