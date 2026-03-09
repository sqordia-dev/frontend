/**
 * QualityScoreCard — Displays LLM-as-Judge evaluation results.
 *
 * Shows the 4-dimension quality breakdown (writing, financial, compliance, bank-readiness)
 * with individual scores and severity-coded findings.
 *
 * Sqordia Design System:
 *  - Card with soft shadow
 *  - momentum-orange accent
 *  - DM Sans typography
 *  - Framer Motion stagger animation
 */

import { motion } from 'framer-motion';
import type { JudgeEvaluationResult } from '../../lib/ai-evaluation-service';

interface QualityScoreCardProps {
  evaluation: JudgeEvaluationResult;
  className?: string;
}

const DIMENSION_LABELS: Record<string, { label: string; icon: string }> = {
  writing_quality: { label: 'Writing Quality', icon: '✍️' },
  financial_consistency: { label: 'Financial Consistency', icon: '📊' },
  compliance: { label: 'Compliance', icon: '⚖️' },
  bank_readiness: { label: 'Bank Readiness', icon: '🏦' },
};

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
};

function ScoreBar({ score, label, icon }: { score: number; label: string; icon: string }) {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? 'bg-green-500' : pct >= 50 ? 'bg-momentum-orange' : 'bg-red-500';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">
          {icon} {label}
        </span>
        <span className="tabular-nums font-semibold" style={{ color: pct >= 80 ? '#22c55e' : pct >= 50 ? '#FF6B00' : '#ef4444' }}>
          {pct}%
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted/30 dark:bg-strategy-blue/20">
        <motion.div
          className={`h-2 rounded-full ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

export function QualityScoreCard({ evaluation, className = '' }: QualityScoreCardProps) {
  const overallPct = Math.round(evaluation.overallScore * 100);

  return (
    <motion.div
      className={`rounded-xl border bg-card p-6 shadow-card dark:border-white/10 ${className}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Quality Assessment</h3>
        <div
          className="rounded-full px-3 py-1 text-sm font-bold text-white"
          style={{
            backgroundColor: overallPct >= 80 ? '#22c55e' : overallPct >= 50 ? '#FF6B00' : '#ef4444',
          }}
        >
          {overallPct}%
        </div>
      </div>

      {/* Dimension scores */}
      <div className="space-y-3">
        {Object.entries(evaluation.dimensionScores).map(([dim, score], i) => {
          const meta = DIMENSION_LABELS[dim] || { label: dim, icon: '📋' };
          return (
            <motion.div
              key={dim}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 * i }}
            >
              <ScoreBar score={score} label={meta.label} icon={meta.icon} />
            </motion.div>
          );
        })}
      </div>

      {/* Findings */}
      {evaluation.findings.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Findings</h4>
          <div className="max-h-48 space-y-1.5 overflow-y-auto">
            {evaluation.findings.map((finding, i) => (
              <div
                key={i}
                className={`rounded-md px-3 py-1.5 text-xs ${SEVERITY_STYLES[finding.severity] || SEVERITY_STYLES.low}`}
              >
                <span className="font-medium capitalize">{finding.severity}</span>
                {finding.section && <span className="mx-1 opacity-60">· {finding.section}</span>}
                <span className="ml-1">{finding.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
