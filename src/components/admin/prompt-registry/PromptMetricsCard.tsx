import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  CheckCircle,
  Edit3,
  RefreshCw,
  Star,
  Users,
  BarChart3,
} from 'lucide-react';
import { cn } from '../../../lib/utils';

export type MetricType = 'usage' | 'acceptance' | 'edit' | 'regenerate' | 'rating' | 'active';

interface PromptMetricsCardProps {
  type: MetricType;
  value: number;
  label: string;
  subtitle?: string;
  change?: number; // Percentage change from previous period
  format?: 'number' | 'percent' | 'rating';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const METRIC_CONFIG: Record<MetricType, { icon: typeof Activity; color: string; bgColor: string }> = {
  usage: {
    icon: BarChart3,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-500/20',
  },
  acceptance: {
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-500/20',
  },
  edit: {
    icon: Edit3,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-500/20',
  },
  regenerate: {
    icon: RefreshCw,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-500/20',
  },
  rating: {
    icon: Star,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-500/20',
  },
  active: {
    icon: Users,
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-100 dark:bg-cyan-500/20',
  },
};

const formatValue = (value: number, format: 'number' | 'percent' | 'rating'): string => {
  switch (format) {
    case 'percent':
      return `${(value * 100).toFixed(1)}%`;
    case 'rating':
      return value.toFixed(1);
    case 'number':
    default:
      if (value >= 1000000) {
        return `${(value / 1000000).toFixed(1)}M`;
      }
      if (value >= 1000) {
        return `${(value / 1000).toFixed(1)}K`;
      }
      return value.toLocaleString();
  }
};

export const PromptMetricsCard: React.FC<PromptMetricsCardProps> = ({
  type,
  value,
  label,
  subtitle,
  change,
  format = 'number',
  size = 'md',
  className,
}) => {
  const config = METRIC_CONFIG[type];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const valueSizes = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  const getTrendIcon = () => {
    if (!change) return null;
    if (change > 0) return <TrendingUp className="w-3 h-3" />;
    if (change < 0) return <TrendingDown className="w-3 h-3" />;
    return <Minus className="w-3 h-3" />;
  };

  const getTrendColor = () => {
    if (!change) return 'text-zinc-400';
    // For edit and regenerate rates, lower is better
    if (type === 'edit' || type === 'regenerate') {
      return change < 0 ? 'text-green-500' : change > 0 ? 'text-red-500' : 'text-zinc-400';
    }
    // For other metrics, higher is better
    return change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-zinc-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900',
        sizeClasses[size],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn('p-2 rounded-lg', config.bgColor)}>
          <Icon className={cn(iconSizes[size], config.color)} />
        </div>
        {change !== undefined && (
          <div className={cn('flex items-center gap-1 text-xs font-medium', getTrendColor())}>
            {getTrendIcon()}
            <span>{Math.abs(change).toFixed(1)}%</span>
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className={cn('font-bold text-zinc-900 dark:text-white', valueSizes[size])}>
          {formatValue(value, format)}
          {format === 'rating' && (
            <Star className="inline-block w-4 h-4 ml-1 text-yellow-400 fill-yellow-400" />
          )}
        </div>
        <div className="mt-1 text-sm font-medium text-zinc-600 dark:text-zinc-400">
          {label}
        </div>
        {subtitle && (
          <div className="mt-0.5 text-xs text-zinc-400 dark:text-zinc-500">
            {subtitle}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Mini version for inline use
export const PromptMetricsMini: React.FC<{
  type: MetricType;
  value: number;
  label: string;
  format?: 'number' | 'percent' | 'rating';
}> = ({ type, value, label, format = 'number' }) => {
  const config = METRIC_CONFIG[type];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-2">
      <div className={cn('p-1.5 rounded-md', config.bgColor)}>
        <Icon className={cn('w-3.5 h-3.5', config.color)} />
      </div>
      <div>
        <div className="text-sm font-semibold text-zinc-900 dark:text-white">
          {formatValue(value, format)}
        </div>
        <div className="text-xs text-zinc-500 dark:text-zinc-400">{label}</div>
      </div>
    </div>
  );
};

export default PromptMetricsCard;
