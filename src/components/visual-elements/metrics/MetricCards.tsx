import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { MetricData, Metric, VisualStyling } from '../../../types/visual-elements';

interface MetricCardsProps {
  data: MetricData;
  styling?: VisualStyling;
}

/**
 * Format metric value based on format type
 */
function formatMetricValue(metric: Metric): string {
  const { value, format } = metric;

  if (value === null || value === undefined || value === '') return '-';

  if (format === 'currency' && typeof value === 'number') {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }

  if (format === 'percentage' && typeof value === 'number') {
    return `${(value * 100).toFixed(1)}%`;
  }

  if (format === 'number' && typeof value === 'number') {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }

  return String(value);
}

/**
 * Get trend icon component
 */
function TrendIcon({ trend }: { trend?: Metric['trend'] }) {
  switch (trend) {
    case 'up':
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    case 'down':
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    case 'neutral':
      return <Minus className="w-4 h-4 text-gray-400" />;
    default:
      return null;
  }
}

/**
 * Get trend color class
 */
function getTrendColorClass(trend?: Metric['trend']): string {
  switch (trend) {
    case 'up':
      return 'text-green-500';
    case 'down':
      return 'text-red-500';
    default:
      return 'text-gray-400';
  }
}

/**
 * Get metric icon component
 */
function MetricIcon({ icon, className }: { icon?: string; className?: string }) {
  if (!icon) return null;

  // Map common icon names to SVG icons
  const iconMap: Record<string, React.ReactNode> = {
    dollar: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    users: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
    chart: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      </svg>
    ),
    target: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
        />
      </svg>
    ),
    globe: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    percent: (
      <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
        />
      </svg>
    ),
  };

  return iconMap[icon] || null;
}

/**
 * Metric Cards Component
 * Displays key metrics with optional trends and icons
 */
export function MetricCards({ data, styling }: MetricCardsProps) {
  // Get grid columns based on layout and number of metrics
  const getGridClasses = () => {
    const metricCount = data.metrics.length;

    switch (data.layout) {
      case 'row':
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      case 'column':
        return 'grid-cols-1';
      case 'grid':
      default:
        if (metricCount <= 2) return 'grid-cols-1 sm:grid-cols-2';
        if (metricCount <= 3) return 'grid-cols-1 sm:grid-cols-3';
        return 'grid-cols-2 md:grid-cols-4';
    }
  };

  // Get font size classes
  const getFontSizeClasses = () => {
    switch (styling?.fontSize) {
      case 'small':
        return { label: 'text-xs', value: 'text-xl', trend: 'text-xs' };
      case 'large':
        return { label: 'text-base', value: 'text-4xl', trend: 'text-sm' };
      default:
        return { label: 'text-sm', value: 'text-2xl', trend: 'text-xs' };
    }
  };

  // Get card style based on theme
  const getCardClasses = () => {
    switch (styling?.theme) {
      case 'minimal':
        return 'bg-transparent border border-gray-200 dark:border-gray-700';
      case 'corporate':
        return 'bg-white dark:bg-gray-800 border-l-4 border-l-blue-600 border-y border-r border-gray-200 dark:border-gray-700 shadow';
      case 'modern':
        return 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-850 border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow';
      default:
        return 'bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-850 border border-gray-200 dark:border-gray-700 shadow-sm';
    }
  };

  const fontSizes = getFontSizeClasses();

  return (
    <div className={`grid ${getGridClasses()} gap-4 my-6`}>
      {data.metrics.map((metric, index) => (
        <div key={index} className={`rounded-xl p-5 ${getCardClasses()}`}>
          {/* Metric Label */}
          <div className="flex items-center justify-between mb-2">
            <p className={`${fontSizes.label} text-gray-500 dark:text-gray-400 font-medium`}>
              {metric.label}
            </p>
            {metric.icon && (
              <MetricIcon
                icon={metric.icon}
                className="w-5 h-5 text-gray-400 dark:text-gray-500"
              />
            )}
          </div>

          {/* Metric Value and Trend */}
          <div className="flex items-end justify-between gap-2">
            <p className={`${fontSizes.value} font-bold text-gray-900 dark:text-white`}>
              {formatMetricValue(metric)}
            </p>

            {metric.trend && (
              <div className="flex items-center gap-1 pb-1">
                <TrendIcon trend={metric.trend} />
                {metric.trendValue && (
                  <span className={`${fontSizes.trend} ${getTrendColorClass(metric.trend)} font-medium`}>
                    {metric.trendValue}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Optional Progress Bar */}
          {metric.format === 'percentage' && typeof metric.value === 'number' && (
            <div className="mt-3">
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(metric.value * 100, 100)}%`,
                    backgroundColor: styling?.primaryColor || '#3B82F6',
                  }}
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Empty State */}
      {data.metrics.length === 0 && (
        <div className="col-span-full py-8 text-center text-gray-500 dark:text-gray-400">
          No metrics available
        </div>
      )}
    </div>
  );
}

export default MetricCards;
