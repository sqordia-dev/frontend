import React, { useMemo } from 'react';
import {
  LineChart as RechartsLine,
  BarChart as RechartsBar,
  PieChart as RechartsPie,
  AreaChart as RechartsArea,
  Line,
  Bar,
  Pie,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ChartData, VisualStyling } from '../../../types/visual-elements';

// Default color palette
const CHART_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
];

interface ChartWrapperProps {
  data: ChartData;
  styling?: VisualStyling;
  height?: number;
}

/**
 * Format value for display
 */
function formatValue(value: number, options?: ChartData['options']): string {
  if (options?.currency) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: options.currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  }

  if (options?.percentageFormat) {
    return `${(value * 100).toFixed(0)}%`;
  }

  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

/**
 * Custom tooltip component
 */
function CustomTooltip({
  active,
  payload,
  label,
  options,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  options?: ChartData['options'];
}) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3">
      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2 text-sm">
          <span
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-gray-600 dark:text-gray-400">{entry.name}:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {formatValue(entry.value, options)}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Chart Wrapper Component
 * Renders various chart types using Recharts
 */
export function ChartWrapper({ data, styling, height = 300 }: ChartWrapperProps) {
  // Transform data for Recharts format
  const chartData = useMemo(() => {
    return data.labels.map((label, index) => {
      const point: Record<string, string | number> = { name: label };
      data.datasets.forEach((dataset) => {
        point[dataset.label] = dataset.data[index] ?? 0;
      });
      return point;
    });
  }, [data.labels, data.datasets]);

  // Prepare pie chart data
  const pieData = useMemo(() => {
    if (data.chartType !== 'pie' && data.chartType !== 'donut') return [];

    return data.labels.map((label, index) => ({
      name: label,
      value: data.datasets[0]?.data[index] ?? 0,
    }));
  }, [data.chartType, data.labels, data.datasets]);

  // Get font size based on styling
  const getFontSize = () => {
    switch (styling?.fontSize) {
      case 'small':
        return 10;
      case 'large':
        return 14;
      default:
        return 12;
    }
  };

  const fontSize = getFontSize();

  // Common axis props
  const axisProps = {
    tick: { fontSize, fill: '#9CA3AF' },
    tickLine: { stroke: '#D1D5DB' },
    axisLine: { stroke: '#D1D5DB' },
  };

  // Render Line Chart
  const renderLineChart = () => (
    <RechartsLine data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      {data.options?.showGrid !== false && (
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:stroke-gray-700" />
      )}
      <XAxis dataKey="name" {...axisProps} />
      <YAxis tickFormatter={(value) => formatValue(value, data.options)} {...axisProps} />
      <Tooltip content={<CustomTooltip options={data.options} />} />
      {data.options?.showLegend !== false && (
        <Legend wrapperStyle={{ fontSize, paddingTop: 10 }} />
      )}
      {data.datasets.map((dataset, index) => (
        <Line
          key={dataset.label}
          type="monotone"
          dataKey={dataset.label}
          stroke={dataset.color || CHART_COLORS[index % CHART_COLORS.length]}
          strokeWidth={2}
          dot={{ r: 4, strokeWidth: 2 }}
          activeDot={{ r: 6, strokeWidth: 2 }}
        />
      ))}
    </RechartsLine>
  );

  // Render Bar Chart
  const renderBarChart = () => (
    <RechartsBar data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      {data.options?.showGrid !== false && (
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:stroke-gray-700" />
      )}
      <XAxis dataKey="name" {...axisProps} />
      <YAxis tickFormatter={(value) => formatValue(value, data.options)} {...axisProps} />
      <Tooltip content={<CustomTooltip options={data.options} />} />
      {data.options?.showLegend !== false && (
        <Legend wrapperStyle={{ fontSize, paddingTop: 10 }} />
      )}
      {data.datasets.map((dataset, index) => (
        <Bar
          key={dataset.label}
          dataKey={dataset.label}
          fill={dataset.color || CHART_COLORS[index % CHART_COLORS.length]}
          radius={[4, 4, 0, 0]}
          stackId={data.options?.stacked ? 'stack' : undefined}
        />
      ))}
    </RechartsBar>
  );

  // Render Stacked Bar Chart
  const renderStackedBarChart = () => (
    <RechartsBar data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      {data.options?.showGrid !== false && (
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:stroke-gray-700" />
      )}
      <XAxis dataKey="name" {...axisProps} />
      <YAxis tickFormatter={(value) => formatValue(value, data.options)} {...axisProps} />
      <Tooltip content={<CustomTooltip options={data.options} />} />
      {data.options?.showLegend !== false && (
        <Legend wrapperStyle={{ fontSize, paddingTop: 10 }} />
      )}
      {data.datasets.map((dataset, index) => (
        <Bar
          key={dataset.label}
          dataKey={dataset.label}
          fill={dataset.color || CHART_COLORS[index % CHART_COLORS.length]}
          stackId="stack"
          radius={index === data.datasets.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
        />
      ))}
    </RechartsBar>
  );

  // Render Pie/Donut Chart
  const renderPieChart = () => {
    const innerRadius = data.chartType === 'donut' ? 50 : 0;

    return (
      <RechartsPie margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={innerRadius}
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          labelLine={{ stroke: '#9CA3AF', strokeWidth: 1 }}
        >
          {pieData.map((_, index) => (
            <Cell
              key={`cell-${index}`}
              fill={data.datasets[0]?.color || CHART_COLORS[index % CHART_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => formatValue(value, data.options)}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
          }}
        />
        {data.options?.showLegend !== false && (
          <Legend wrapperStyle={{ fontSize, paddingTop: 10 }} />
        )}
      </RechartsPie>
    );
  };

  // Render Area Chart
  const renderAreaChart = () => (
    <RechartsArea data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      {data.options?.showGrid !== false && (
        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:stroke-gray-700" />
      )}
      <XAxis dataKey="name" {...axisProps} />
      <YAxis tickFormatter={(value) => formatValue(value, data.options)} {...axisProps} />
      <Tooltip content={<CustomTooltip options={data.options} />} />
      {data.options?.showLegend !== false && (
        <Legend wrapperStyle={{ fontSize, paddingTop: 10 }} />
      )}
      {data.datasets.map((dataset, index) => {
        const color = dataset.color || CHART_COLORS[index % CHART_COLORS.length];
        return (
          <Area
            key={dataset.label}
            type="monotone"
            dataKey={dataset.label}
            stroke={color}
            fill={color}
            fillOpacity={0.3}
            strokeWidth={2}
            stackId={data.options?.stacked ? 'stack' : undefined}
          />
        );
      })}
    </RechartsArea>
  );

  // Render chart based on type
  const renderChart = () => {
    switch (data.chartType) {
      case 'line':
        return renderLineChart();
      case 'bar':
        return renderBarChart();
      case 'stacked-bar':
        return renderStackedBarChart();
      case 'pie':
      case 'donut':
        return renderPieChart();
      case 'area':
        return renderAreaChart();
      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
            Unsupported chart type: {data.chartType}
          </div>
        );
    }
  };

  // Get container styles based on theme
  const getContainerClasses = () => {
    switch (styling?.theme) {
      case 'minimal':
        return 'bg-transparent border-0';
      case 'corporate':
        return 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600';
      case 'modern':
        return 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg';
      default:
        return 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm';
    }
  };

  return (
    <div className={`my-6 p-4 rounded-lg ${getContainerClasses()}`}>
      {/* Chart Title */}
      {data.title && (
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
          {data.title}
        </h4>
      )}

      {/* Chart Container */}
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>

      {/* No Data State */}
      {(!data.datasets || data.datasets.length === 0) && (
        <div className="flex items-center justify-center py-8 text-gray-500 dark:text-gray-400">
          No data available for chart
        </div>
      )}
    </div>
  );
}

export default ChartWrapper;
