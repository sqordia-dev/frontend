import { useState } from 'react';
import { ChevronDown, ChevronUp, User, CheckCircle } from 'lucide-react';
import type { SkippedQuestionDto } from '../../types/organization-profile';

interface ProfileContextPanelProps {
  skippedQuestions: SkippedQuestionDto[];
  profileCompletenessScore: number;
}

export default function ProfileContextPanel({ skippedQuestions, profileCompletenessScore }: ProfileContextPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (skippedQuestions.length === 0) return null;

  return (
    <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-green-100/50 dark:hover:bg-green-900/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
            <User size={16} className="text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              {skippedQuestions.length} question{skippedQuestions.length > 1 ? 's' : ''} answered from your profile
            </p>
            <p className="text-xs text-green-600 dark:text-green-400">
              Profile completeness: {profileCompletenessScore}%
            </p>
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp size={18} className="text-green-600" />
        ) : (
          <ChevronDown size={18} className="text-green-600" />
        )}
      </button>

      {isExpanded && (
        <div className="px-4 pb-3 space-y-2">
          {skippedQuestions.map((q) => (
            <div key={q.id} className="flex items-start gap-2 py-1.5 text-sm">
              <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-green-800 dark:text-green-300 font-medium">Q{q.questionNumber}:</span>{' '}
                <span className="text-green-700 dark:text-green-400">{q.questionText}</span>
                <span className="ml-2 text-green-600 dark:text-green-500 italic">"{q.profileFieldValue}"</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
