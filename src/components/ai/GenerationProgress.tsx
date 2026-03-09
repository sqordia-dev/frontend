/**
 * GenerationProgress — Real-time business plan generation progress display.
 *
 * Shows a tiered progress view where each section transitions through
 * pending → generating → complete states with animated bars.
 *
 * Sqordia Design System:
 *  - momentum-orange for active progress
 *  - green for completed sections
 *  - Framer Motion stagger animations
 *  - Card component with shadow-card
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getGenerationProgress, type GenerationProgress as ProgressData } from '../../lib/ai-evaluation-service';

interface GenerationProgressProps {
  jobId: string;
  /** Polling interval in ms (default: 2000) */
  pollInterval?: number;
  /** Called when generation completes */
  onComplete?: () => void;
  className?: string;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: string }> = {
  pending: { bg: 'bg-muted/30 dark:bg-white/5', text: 'text-muted-foreground', icon: '⏳' },
  generating: { bg: 'bg-momentum-orange/10 dark:bg-momentum-orange/20', text: 'text-momentum-orange', icon: '⚡' },
  complete: { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-600 dark:text-green-400', icon: '✓' },
  error: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400', icon: '✕' },
};

export function GenerationProgressPanel({
  jobId,
  pollInterval = 2000,
  onComplete,
  className = '',
}: GenerationProgressProps) {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId) return;

    let active = true;
    const poll = async () => {
      try {
        const data = await getGenerationProgress(jobId);
        if (!active) return;
        setProgress(data);
        if (data.status === 'complete' || data.status === 'error') {
          if (data.status === 'complete') onComplete?.();
          return; // stop polling
        }
        setTimeout(poll, pollInterval);
      } catch (err) {
        if (!active) return;
        setError('Failed to fetch generation progress');
      }
    };

    poll();
    return () => { active = false; };
  }, [jobId, pollInterval, onComplete]);

  if (error) {
    return (
      <div className={`rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300 ${className}`}>
        {error}
      </div>
    );
  }

  if (!progress) {
    return (
      <div className={`rounded-xl border bg-card p-6 shadow-card dark:border-white/10 ${className}`}>
        <div className="flex items-center gap-3">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-momentum-orange border-t-transparent" />
          <span className="text-sm text-muted-foreground">Initializing generation...</span>
        </div>
      </div>
    );
  }

  const pct = Math.round(progress.progressPercent);

  return (
    <motion.div
      className={`rounded-xl border bg-card p-6 shadow-card dark:border-white/10 ${className}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Overall progress */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Generating Business Plan
        </h3>
        <span className="text-sm font-bold tabular-nums text-momentum-orange">
          {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-6 h-2.5 w-full rounded-full bg-muted/30 dark:bg-strategy-blue/20">
        <motion.div
          className="h-2.5 rounded-full bg-momentum-orange"
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {/* Section list */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {progress.sections.map((section, i) => {
            const style = STATUS_STYLES[section.status] || STATUS_STYLES.pending;
            return (
              <motion.div
                key={section.sectionName}
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${style.bg}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 * i }}
                layout
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs">{style.icon}</span>
                  <span className={`font-medium ${style.text}`}>
                    {section.sectionName.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {section.completenessScore != null && (
                    <span className="text-xs tabular-nums text-muted-foreground">
                      {Math.round(section.completenessScore * 100)}%
                    </span>
                  )}
                  {section.status === 'generating' && (
                    <div className="h-3 w-3 animate-spin rounded-full border border-momentum-orange border-t-transparent" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Status message */}
      <div className="mt-4 text-center text-xs text-muted-foreground">
        {progress.status === 'complete'
          ? 'Generation complete!'
          : progress.status === 'error'
            ? 'Generation encountered an error'
            : 'Sections are generated in dependency order for coherence'}
      </div>
    </motion.div>
  );
}
