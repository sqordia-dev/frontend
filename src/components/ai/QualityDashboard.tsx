/**
 * QualityDashboard — Overview dashboard for business plan quality metrics.
 *
 * Combines completeness scores, judge evaluation, and RAGAS metrics
 * into a unified view. Used on the business plan detail/review page.
 *
 * Sqordia Design System:
 *  - 8px grid, responsive 1-2-3 column layout
 *  - momentum-orange accent color
 *  - Card components with shadow-card
 *  - Framer Motion entrance animations
 *  - Dark mode compatible
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CompletenessRing } from './CompletenessRing';
import { QualityScoreCard } from './QualityScoreCard';
import type { JudgeEvaluationResult } from '../../lib/ai-evaluation-service';

interface SectionScore {
  sectionName: string;
  completenessScore: number;
  judgeScore?: number;
}

interface QualityDashboardProps {
  /** Overall quality report from the generation pipeline */
  qualityReport?: {
    coherenceScore: number;
    bankReadinessScore: number;
    issues?: Array<{ section: string; type: string; description: string }>;
    improvements?: Array<{ section: string; suggestion: string }>;
  };
  /** Per-section completeness scores */
  sectionScores?: SectionScore[];
  /** LLM-as-Judge evaluation (if available) */
  judgeEvaluation?: JudgeEvaluationResult;
  className?: string;
}

export function QualityDashboard({
  qualityReport,
  sectionScores = [],
  judgeEvaluation,
  className = '',
}: QualityDashboardProps) {
  const coherence = qualityReport?.coherenceScore ?? 0;
  const bankReady = qualityReport?.bankReadinessScore ?? 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Top-level scores */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Coherence */}
        <motion.div
          className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-card dark:border-white/10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <CompletenessRing score={coherence} size={56} strokeWidth={4} />
          <div>
            <div className="text-sm font-medium text-muted-foreground">Coherence</div>
            <div className="text-2xl font-bold tabular-nums text-foreground">{Math.round(coherence)}%</div>
          </div>
        </motion.div>

        {/* Bank Readiness */}
        <motion.div
          className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-card dark:border-white/10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <CompletenessRing score={bankReady} size={56} strokeWidth={4} />
          <div>
            <div className="text-sm font-medium text-muted-foreground">Bank Readiness</div>
            <div className="text-2xl font-bold tabular-nums text-foreground">{Math.round(bankReady)}%</div>
          </div>
        </motion.div>

        {/* Overall Judge Score */}
        {judgeEvaluation && (
          <motion.div
            className="flex items-center gap-4 rounded-xl border bg-card p-4 shadow-card dark:border-white/10"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CompletenessRing score={judgeEvaluation.overallScore * 100} size={56} strokeWidth={4} />
            <div>
              <div className="text-sm font-medium text-muted-foreground">AI Judge Score</div>
              <div className="text-2xl font-bold tabular-nums text-foreground">
                {Math.round(judgeEvaluation.overallScore * 100)}%
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Judge detailed breakdown */}
      {judgeEvaluation && <QualityScoreCard evaluation={judgeEvaluation} />}

      {/* Section completeness grid */}
      {sectionScores.length > 0 && (
        <motion.div
          className="rounded-xl border bg-card p-6 shadow-card dark:border-white/10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="mb-4 text-lg font-semibold text-foreground">Section Scores</h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {sectionScores.map((section, i) => (
              <motion.div
                key={section.sectionName}
                className="flex items-center gap-2 rounded-lg bg-muted/10 px-3 py-2 dark:bg-white/5"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 * i }}
              >
                <CompletenessRing score={section.completenessScore} size={32} strokeWidth={2.5} />
                <span className="truncate text-xs font-medium text-foreground">
                  {section.sectionName.replace(/([A-Z])/g, ' $1').trim()}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Issues & improvements */}
      {qualityReport?.issues && qualityReport.issues.length > 0 && (
        <motion.div
          className="rounded-xl border bg-card p-6 shadow-card dark:border-white/10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="mb-3 text-lg font-semibold text-foreground">Issues Found</h3>
          <div className="space-y-2">
            {qualityReport.issues.map((issue, i) => (
              <div
                key={i}
                className="rounded-lg bg-red-50 px-3 py-2 text-sm dark:bg-red-900/20"
              >
                <span className="font-medium text-red-700 dark:text-red-300">{issue.section}</span>
                <span className="mx-1 text-red-400">·</span>
                <span className="text-red-600 dark:text-red-400">{issue.description}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {qualityReport?.improvements && qualityReport.improvements.length > 0 && (
        <motion.div
          className="rounded-xl border bg-card p-6 shadow-card dark:border-white/10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="mb-3 text-lg font-semibold text-foreground">Suggestions</h3>
          <div className="space-y-2">
            {qualityReport.improvements.map((imp, i) => (
              <div
                key={i}
                className="rounded-lg bg-blue-50 px-3 py-2 text-sm dark:bg-blue-900/20"
              >
                <span className="font-medium text-blue-700 dark:text-blue-300">{imp.section}</span>
                <span className="mx-1 text-blue-400">·</span>
                <span className="text-blue-600 dark:text-blue-400">{imp.suggestion}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
