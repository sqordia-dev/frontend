import { useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, TrendingUp, Shield } from 'lucide-react';

interface ReadinessScoreDashboardProps {
  readinessScore: number; // 0-100
  pivotPointMonth?: number;
  runwayMonths?: number;
  confidenceInterval?: {
    ambition: number;
    evidence: number;
  };
}

export default function ReadinessScoreDashboard({
  readinessScore,
  pivotPointMonth,
  runwayMonths,
  confidenceInterval
}: ReadinessScoreDashboardProps) {
  const gaugeRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    if (gaugeRef.current) {
      const circumference = 2 * Math.PI * 45; // radius = 45
      const offset = circumference - (readinessScore / 100) * circumference;
      gaugeRef.current.style.strokeDashoffset = offset.toString();
    }
  }, [readinessScore]);

  const getScoreColor = (score: number): string => {
    if (score >= 80) return '#10B981'; // Green
    if (score >= 60) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getScoreLabel = (score: number): string => {
    if (score >= 80) return 'Bank-Ready';
    if (score >= 60) return 'Nearly Ready';
    return 'Needs Work';
  };

  const scoreColor = getScoreColor(readinessScore);
  const scoreLabel = getScoreLabel(readinessScore);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield size={20} style={{ color: '#FF6B00' }} />
        <h3 className="text-lg font-semibold">Readiness Score</h3>
      </div>

      {/* Bank-Ready Meter (Gauge) */}
      <div className="flex flex-col items-center">
        <div className="relative w-48 h-48">
          <svg className="transform -rotate-90 w-48 h-48">
            {/* Background circle */}
            <circle
              cx="96"
              cy="96"
              r="45"
              stroke="#E5E7EB"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle */}
            <circle
              ref={gaugeRef}
              cx="96"
              cy="96"
              r="45"
              stroke={scoreColor}
              strokeWidth="8"
              fill="none"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={2 * Math.PI * 45}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold" style={{ color: scoreColor }}>
              {Math.round(readinessScore)}
            </div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {scoreLabel}
            </div>
          </div>
        </div>
      </div>

      {/* Confidence Interval (Ambition vs Evidence) */}
      {confidenceInterval && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Confidence Interval</h4>
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">Ambition</span>
                <span className="text-xs font-medium">{confidenceInterval.ambition}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${confidenceInterval.ambition}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600 dark:text-gray-400">Evidence</span>
                <span className="text-xs font-medium">{confidenceInterval.evidence}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-300"
                  style={{ width: `${confidenceInterval.evidence}%` }}
                />
              </div>
            </div>
            {confidenceInterval.ambition > confidenceInterval.evidence + 20 && (
              <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded text-xs">
                <AlertCircle size={14} className="inline mr-1 text-yellow-600 dark:text-yellow-400" />
                <span className="text-yellow-800 dark:text-yellow-200">
                  Ambition gap detected. Consider adding more evidence to support projections.
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Financial Health Metrics */}
      {(pivotPointMonth !== undefined || runwayMonths !== undefined) && (
        <div className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp size={16} />
            Financial Health
          </h4>
          <div className="grid grid-cols-2 gap-4">
            {pivotPointMonth !== undefined && (
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Pivot Point</p>
                <p className="text-lg font-bold">
                  Month {pivotPointMonth}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Break-even point
                </p>
              </div>
            )}
            {runwayMonths !== undefined && (
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Runway</p>
                <p className={`text-lg font-bold ${runwayMonths >= 12 ? 'text-green-600 dark:text-green-400' : runwayMonths >= 6 ? 'text-yellow-600 dark:text-yellow-400' : 'text-red-600 dark:text-red-400'}`}>
                  {runwayMonths} months
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Remaining cash
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Status Indicators */}
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
        {readinessScore >= 80 && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle2 size={16} />
            <span>Plan is bank-ready. All critical elements are in place.</span>
          </div>
        )}
        {readinessScore >= 60 && readinessScore < 80 && (
          <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400">
            <AlertCircle size={16} />
            <span>Plan is nearly ready. Review recommendations below.</span>
          </div>
        )}
        {readinessScore < 60 && (
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
            <AlertCircle size={16} />
            <span>Plan needs work. Address critical issues before submission.</span>
          </div>
        )}
      </div>
    </div>
  );
}
