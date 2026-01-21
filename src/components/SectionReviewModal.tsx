import { useState } from 'react';
import { X, CheckCircle2, AlertCircle, Sparkles, Loader2 } from 'lucide-react';

interface Gap {
  category: 'Financial' | 'Strategic' | 'Legal' | 'QuebecCompliance';
  priority: 'high' | 'medium' | 'low';
  message: string;
  suggestion: string;
  questionPrompt?: string;
}

interface QuestionReview {
  questionId: string;
  questionText: string;
  originalAnswer: string;
  polishedText?: string;
  gaps: Gap[];
}

interface SectionReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  stepNumber: number;
  stepTitle: string;
  questions: QuestionReview[];
  onApplyPolish: (questionId: string, polishedText: string) => void;
  onAddDetails: (questionId: string, gapIndex: number) => void;
  onSkip: () => void;
  loading?: boolean;
}

export default function SectionReviewModal({
  isOpen,
  onClose,
  stepNumber,
  stepTitle,
  questions,
  onApplyPolish,
  onAddDetails,
  onSkip,
  loading = false
}: SectionReviewModalProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const toggleQuestion = (questionId: string) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedQuestions(newExpanded);
  };

  const totalGaps = questions.reduce((sum, q) => sum + q.gaps.length, 0);
  const highPriorityGaps = questions.reduce(
    (sum, q) => sum + q.gaps.filter(g => g.priority === 'high').length,
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl max-w-5xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Step {stepNumber} Review: {stepTitle}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                Review AI suggestions and address any gaps before proceeding
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Summary Stats */}
          <div className="flex items-center gap-4 mt-4">
            {highPriorityGaps > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 text-sm font-medium">
                <AlertCircle size={16} />
                {highPriorityGaps} High Priority Gap{highPriorityGaps !== 1 ? 's' : ''}
              </div>
            )}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-sm font-medium">
              {totalGaps} Total Suggestion{totalGaps !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={32} className="animate-spin" style={{ color: '#FF6B00' }} />
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 size={48} className="mx-auto mb-4 text-green-500" />
              <p className="text-gray-600 dark:text-gray-400">No suggestions at this time. You're good to go!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {questions.map((question) => (
                <div
                  key={question.questionId}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                >
                  {/* Question Header */}
                  <button
                    onClick={() => toggleQuestion(question.questionId)}
                    className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                  >
                    <div className="flex items-start gap-3 flex-1 text-left">
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        question.gaps.length === 0
                          ? 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300'
                          : question.gaps.some(g => g.priority === 'high')
                          ? 'bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300'
                          : 'bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300'
                      }`}>
                        {question.gaps.length === 0 ? (
                          <CheckCircle2 size={14} />
                        ) : (
                          question.gaps.length
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {question.questionText}
                        </h3>
                        {question.gaps.length > 0 && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {question.gaps.length} suggestion{question.gaps.length !== 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      {expandedQuestions.has(question.questionId) ? (
                        <X size={20} className="text-gray-400" />
                      ) : (
                        <span className="text-gray-400">▼</span>
                      )}
                    </div>
                  </button>

                  {/* Expanded Content */}
                  {expandedQuestions.has(question.questionId) && (
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Left Column: Original Answer */}
                        <div>
                          <h4 className="text-sm font-semibold mb-2 text-gray-500 dark:text-gray-400">
                            Your Answer
                          </h4>
                          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                              {question.originalAnswer || 'No answer provided'}
                            </p>
                          </div>

                          {/* Polished Version */}
                          {question.polishedText && (
                            <div className="mt-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                                  <Sparkles size={14} style={{ color: '#FF6B00' }} />
                                  Polished Version
                                </h4>
                                <button
                                  onClick={() => onApplyPolish(question.questionId, question.polishedText!)}
                                  className="text-xs font-medium px-3 py-1 rounded-lg bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/70 transition-colors"
                                >
                                  Apply
                                </button>
                              </div>
                              <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800">
                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                  {question.polishedText}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Right Column: Gap Analysis */}
                        <div>
                          <h4 className="text-sm font-semibold mb-2 text-gray-900 dark:text-gray-100 flex items-center gap-2">
                            <AlertCircle size={14} style={{ color: '#FF6B00' }} />
                            Gap Analysis
                          </h4>
                          {question.gaps.length === 0 ? (
                            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                              <p className="text-sm text-green-800 dark:text-green-200">
                                No gaps identified. Your answer looks complete!
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {question.gaps.map((gap, idx) => (
                                <div
                                  key={idx}
                                  className={`p-3 rounded-lg border ${
                                    gap.priority === 'high'
                                      ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800'
                                      : gap.priority === 'medium'
                                      ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                                      : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                                  }`}
                                >
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                                      gap.priority === 'high'
                                        ? 'bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200'
                                        : gap.priority === 'medium'
                                        ? 'bg-yellow-200 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200'
                                        : 'bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                                    }`}>
                                      {gap.category} • {gap.priority}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">
                                    {gap.message}
                                  </p>
                                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
                                    {gap.suggestion}
                                  </p>
                                  {gap.questionPrompt && (
                                    <button
                                      onClick={() => onAddDetails(question.questionId, idx)}
                                      className="text-xs font-medium text-orange-600 dark:text-orange-400 hover:underline"
                                    >
                                      Add Details →
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <button
            onClick={onSkip}
            className="px-6 py-2 rounded-lg font-medium bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
          >
            Skip Review
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#FF6B00' }}
          >
            Continue to Next Step
          </button>
        </div>
      </div>
    </div>
  );
}
