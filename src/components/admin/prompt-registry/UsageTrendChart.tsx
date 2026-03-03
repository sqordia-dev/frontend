import React, { useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import { motion } from 'framer-motion';
import { UsageTrendDto } from '../../../types/prompt-registry';

interface UsageTrendChartProps {
  data: UsageTrendDto[];
  type?: 'area' | 'bar';
  height?: number;
  showLegend?: boolean;
  title?: string;
  className?: string;
}

const COLORS = {
  usage: '#3b82f6', // blue
  accept: '#22c55e', // green
  edit: '#f59e0b', // amber
  regenerate: '#a855f7', // purple
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload) return null;

  return (
    <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg p-3">
      <p className="text-sm font-medium text-zinc-900 dark:text-white mb-2">
        {formatDate(label)}
      </p>
      <div className="space-y-1">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-zinc-600 dark:text-zinc-400">{entry.name}</span>
            </div>
            <span className="font-medium text-zinc-900 dark:text-white">
              {entry.value.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const UsageTrendChart: React.FC<UsageTrendChartProps> = ({
  data,
  type = 'area',
  height = 300,
  showLegend = true,
  title,
  className,
}) => {
  const chartData = useMemo(() => {
    return data.map(d => ({
      date: d.date,
      Usage: d.usageCount,
      Accepted: d.acceptCount,
      Edited: d.editCount,
      Regenerated: d.regenerateCount,
    }));
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div className={className}>
        {title && (
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">
            {title}
          </h3>
        )}
        <div
          className="flex items-center justify-center bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700"
          style={{ height }}
        >
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            No usage data available
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      {title && (
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4">
          {title}
        </h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        {type === 'area' ? (
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.usage} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.usage} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAccept" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.accept} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.accept} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorEdit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.edit} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.edit} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorRegenerate" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={COLORS.regenerate} stopOpacity={0.3} />
                <stop offset="95%" stopColor={COLORS.regenerate} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 11, fill: '#71717a' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#71717a' }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              />
            )}
            <Area
              type="monotone"
              dataKey="Usage"
              stroke={COLORS.usage}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorUsage)"
            />
            <Area
              type="monotone"
              dataKey="Accepted"
              stroke={COLORS.accept}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAccept)"
            />
            <Area
              type="monotone"
              dataKey="Edited"
              stroke={COLORS.edit}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorEdit)"
            />
            <Area
              type="monotone"
              dataKey="Regenerated"
              stroke={COLORS.regenerate}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorRegenerate)"
            />
          </AreaChart>
        ) : (
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-700" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tick={{ fontSize: 11, fill: '#71717a' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#71717a' }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              />
            )}
            <Bar dataKey="Usage" fill={COLORS.usage} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Accepted" fill={COLORS.accept} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Edited" fill={COLORS.edit} radius={[4, 4, 0, 0]} />
            <Bar dataKey="Regenerated" fill={COLORS.regenerate} radius={[4, 4, 0, 0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </motion.div>
  );
};

// Acceptance Rate Gauge
export const AcceptanceRateGauge: React.FC<{
  rate: number;
  size?: number;
  label?: string;
}> = ({ rate, size = 120, label = 'Acceptance Rate' }) => {
  const percentage = rate * 100;
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (percentage >= 80) return '#22c55e'; // green
    if (percentage >= 60) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background circle */}
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-zinc-200 dark:text-zinc-700"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getColor()}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-zinc-900 dark:text-white">
            {percentage.toFixed(0)}%
          </span>
        </div>
      </div>
      <span className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
    </div>
  );
};

export default UsageTrendChart;
