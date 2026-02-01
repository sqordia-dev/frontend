import { useState } from 'react';
import { Lightbulb, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { apiClient } from '../lib/api-client';

interface Gap {
  category: 'Financial' | 'Strategic' | 'Legal' | 'QuebecCompliance';
  priority: 'high' | 'medium' | 'low';
  message: string;
  suggestion: string;
  questionPrompt?: string;
}

interface AIStrengthFeedbackProps {
  questionId: string;
  answer: string;
  context?: string;
  persona?: string;
  location?: { city?: string; province?: string };
  language?: 'en' | 'fr';
  triggerType?: 'field' | 'section' | 'on-demand';
  onPolishApplied?: (polishedText: string) => void;
  onGapAddressed?: (gapIndex: number) => void;
}

export default function AIStrengthFeedback({
  questionId,
  answer,
  context,
  persona = 'Entrepreneur',
  location,
  language = 'en',
  triggerType = 'field',
  onPolishApplied,
  onGapAddressed
}: AIStrengthFeedbackProps) {
  const [loading, setLoading] = useState(false);
  const [polishedText, setPolishedText] = useState<string | null>(null);
  const [gaps, setGaps] = useState<Gap[]>([]);
  const [strengthScore, setStrengthScore] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Removed auto-trigger - polish should only be triggered by user action (clicking the lightbulb)

  const analyzeAnswer = async () => {
    if (!answer.trim() || answer.trim().length < 10) return;

    setLoading(true);
    setError(null);

    try {
      // Call combined endpoint for on-demand, or separate endpoints for field/section
      if (triggerType === 'on-demand') {
        const response = await apiClient.post('/api/v1/ai/analyze-answer', {
          questionId,
          answer: answer.trim(),
          context: context || '',
          persona,
          location: location || {},
          language,
          includePolish: true,
          includeGaps: true
        });

        const data = response.data?.value || response.data;
        setPolishedText(data.polishedText);
        setGaps(data.gaps || []);
        setStrengthScore(data.strengthScore);
      } else if (triggerType === 'field') {
        // Field-level: Focus on polishing
        const polishResponse = await apiClient.post('/api/v1/ai/polish-answer', {
          questionId,
          answer: answer.trim(),
          context: context || '',
          persona,
          location: location || {},
          language
        });

        const polishData = polishResponse.data?.value || polishResponse.data;
        setPolishedText(polishData.polishedText);
        setStrengthScore(polishData.strengthScore);
      } else {
        // Section-level: Focus on gaps
        const gapResponse = await apiClient.post('/api/v1/ai/analyze-step', {
          stepNumber: 1, // This should be passed as prop
          answers: [{ questionId, answer: answer.trim() }],
          persona,
          location: location || {},
          language
        });

        const gapData = gapResponse.data?.value || gapResponse.data;
        setGaps(gapData.questions?.[0]?.gaps || []);
        setStrengthScore(gapData.overallScore);
      }

      setShowFeedback(true);
    } catch (err: any) {
      console.error('AI feedback error:', err);
      setError(err.response?.data?.message || 'Failed to analyze answer. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPolish = () => {
    if (polishedText && onPolishApplied) {
      onPolishApplied(polishedText);
      setShowFeedback(false);
    }
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-gray-500';
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  const getScoreBgColor = (score: number | null) => {
    if (score === null) return 'bg-gray-100 dark:bg-gray-800';
    if (score >= 80) return 'bg-green-100 dark:bg-green-900/50';
    if (score >= 50) return 'bg-yellow-100 dark:bg-yellow-900/50';
    return 'bg-orange-100 dark:bg-orange-900/50';
  };

  // Field-level: Show lightbulb icon that expands on click
  if (triggerType === 'field' && answer.trim().length >= 10) {
    return (
      <div className="relative">
        {!showFeedback && !loading && (
          <button
            onClick={analyzeAnswer}
            className="absolute top-3 right-3 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-colors"
            title="Get AI feedback"
          >
            <Lightbulb size={18} style={{ color: '#FF6B00' }} />
          </button>
        )}

        {loading && (
          <div className="absolute top-3 right-3 p-2">
            <Loader2 size={18} className="animate-spin" style={{ color: '#FF6B00' }} />
          </div>
        )}

        {showFeedback && !loading && (
          <div className="mt-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
            {/* Strength Score */}
            {strengthScore !== null && (
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-3 ${getScoreBgColor(strengthScore)} ${getScoreColor(strengthScore)}`}>
                <span>Strength Score: {strengthScore}%</span>
              </div>
            )}

            {/* Polished Preview */}
            {polishedText && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <Sparkles size={16} style={{ color: '#FF6B00' }} />
                    Polished Version
                  </h4>
                  <button
                    onClick={handleApplyPolish}
                    className="text-xs font-medium px-3 py-1 rounded-lg bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/70 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    {polishedText}
                  </p>
                </div>
              </div>
            )}

            {/* Top Gaps (if any) */}
            {gaps.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                  <AlertCircle size={16} style={{ color: '#FF6B00' }} />
                  Suggestions
                </h4>
                <div className="space-y-2">
                  {gaps.slice(0, 3).map((gap, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
                      <p className="text-xs text-yellow-800 dark:text-yellow-200">
                        {gap.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {error && (
              <div className="mt-3 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-xs text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // For section-level or on-demand, return null (handled by SectionReviewModal)
  return null;
}
