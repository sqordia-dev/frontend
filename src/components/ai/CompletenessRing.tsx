/**
 * CompletenessRing — Circular badge showing answer/step completeness score.
 *
 * Displays a mini circular progress indicator with a numeric score (0-100).
 * Color transitions from red → orange → green based on the score.
 *
 * Sqordia Design System:
 *  - momentum-orange (#FF6B00) for mid-range scores
 *  - strategy-blue (#181B22) for ring track in dark mode
 *  - 8px grid spacing
 *  - Framer Motion entrance animation
 */

import { motion } from 'framer-motion';

interface CompletenessRingProps {
  /** Score from 0 to 100 */
  score: number;
  /** Ring diameter in px */
  size?: number;
  /** Stroke width in px */
  strokeWidth?: number;
  /** Show numeric label inside */
  showLabel?: boolean;
  /** Optional className */
  className?: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e'; // green-500
  if (score >= 50) return '#FF6B00'; // momentum-orange
  return '#ef4444'; // red-500
}

export function CompletenessRing({
  score,
  size = 40,
  strokeWidth = 3,
  showLabel = true,
  className = '',
}: CompletenessRingProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(score, 0), 100);
  const offset = circumference - (progress / 100) * circumference;
  const color = getScoreColor(progress);

  return (
    <motion.div
      className={`relative inline-flex items-center justify-center ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      title={`Completeness: ${Math.round(progress)}%`}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted/20 dark:text-strategy-blue/30"
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
        />
      </svg>
      {showLabel && (
        <span
          className="absolute text-[10px] font-semibold tabular-nums"
          style={{ color }}
        >
          {Math.round(progress)}
        </span>
      )}
    </motion.div>
  );
}
