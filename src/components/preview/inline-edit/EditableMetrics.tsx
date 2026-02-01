import React, { useState, useCallback } from 'react';
import { Settings, Plus, Trash2, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MetricData, Metric, MetricFormat, MetricTrend, MetricLayout } from '../../../types/visual-elements';
import { MetricCards } from '../../visual-elements/metrics';

interface EditableMetricsProps {
  /** Metric data */
  data: MetricData;
  /** Callback when data changes */
  onDataChange: (data: MetricData) => void;
  /** Styling options */
  styling?: any;
}

/**
 * Available format options
 */
const FORMAT_OPTIONS: { value: MetricFormat; label: string }[] = [
  { value: 'number', label: 'Number' },
  { value: 'currency', label: 'Currency' },
  { value: 'percentage', label: 'Percentage' },
  { value: 'text', label: 'Text' },
];

/**
 * Available trend options
 */
const TREND_OPTIONS: { value: MetricTrend | undefined; label: string; icon: React.FC<any> }[] = [
  { value: undefined, label: 'None', icon: Minus },
  { value: 'up', label: 'Up', icon: TrendingUp },
  { value: 'down', label: 'Down', icon: TrendingDown },
  { value: 'neutral', label: 'Neutral', icon: Minus },
];

/**
 * Available layout options
 */
const LAYOUT_OPTIONS: { value: MetricLayout; label: string }[] = [
  { value: 'grid', label: 'Grid' },
  { value: 'row', label: 'Row' },
  { value: 'column', label: 'Column' },
];

/**
 * EditableMetrics Component
 * Provides inline editing for metric cards with support for
 * adding/removing metrics, changing formats, and setting trends.
 */
export function EditableMetrics({ data, onDataChange, styling }: EditableMetricsProps) {
  const [showEditor, setShowEditor] = useState(false);

  // Handle metric value change
  const handleMetricChange = useCallback(
    (index: number, field: keyof Metric, value: any) => {
      const newMetrics = [...data.metrics];
      newMetrics[index] = { ...newMetrics[index], [field]: value };
      onDataChange({ ...data, metrics: newMetrics });
    },
    [data, onDataChange]
  );

  // Handle layout change
  const handleLayoutChange = useCallback(
    (layout: MetricLayout) => {
      onDataChange({ ...data, layout });
    },
    [data, onDataChange]
  );

  // Add a new metric
  const handleAddMetric = useCallback(() => {
    const newMetric: Metric = {
      label: `Metric ${data.metrics.length + 1}`,
      value: 0,
      format: 'number',
    };
    onDataChange({ ...data, metrics: [...data.metrics, newMetric] });
  }, [data, onDataChange]);

  // Remove a metric
  const handleRemoveMetric = useCallback(
    (index: number) => {
      if (data.metrics.length <= 1) return;

      const newMetrics = data.metrics.filter((_, i) => i !== index);
      onDataChange({ ...data, metrics: newMetrics });
    },
    [data, onDataChange]
  );

  return (
    <div className="relative group">
      {/* Metrics Display */}
      <MetricCards data={data} styling={styling} />

      {/* Edit Button */}
      <button
        onClick={() => setShowEditor(!showEditor)}
        className={`absolute top-2 right-2 p-2 rounded-lg shadow transition-all ${
          showEditor
            ? 'bg-blue-500 text-white'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 opacity-0 group-hover:opacity-100'
        }`}
        title={showEditor ? 'Hide editor' : 'Edit metrics'}
        aria-label={showEditor ? 'Hide editor' : 'Edit metrics'}
      >
        <Settings size={16} aria-hidden="true" />
      </button>

      {/* Editor Panel */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 overflow-hidden"
          >
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              {/* Layout Selector */}
              <div className="flex items-center gap-4 mb-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Layout:
                </label>
                <div className="flex items-center gap-2">
                  {LAYOUT_OPTIONS.map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => handleLayoutChange(value)}
                      className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                        data.layout === value
                          ? 'bg-blue-500 text-white'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Metrics Editor */}
              <div className="space-y-4">
                {data.metrics.map((metric, index) => (
                  <div
                    key={index}
                    className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Metric {index + 1}
                      </span>
                      {data.metrics.length > 1 && (
                        <button
                          onClick={() => handleRemoveMetric(index)}
                          className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                          title="Remove metric"
                          aria-label={`Remove metric ${index + 1}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {/* Label */}
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Label
                        </label>
                        <input
                          type="text"
                          value={metric.label}
                          onChange={(e) =>
                            handleMetricChange(index, 'label', e.target.value)
                          }
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Value */}
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Value
                        </label>
                        <input
                          type={metric.format === 'text' ? 'text' : 'number'}
                          value={metric.value}
                          onChange={(e) =>
                            handleMetricChange(
                              index,
                              'value',
                              metric.format === 'text'
                                ? e.target.value
                                : parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Format */}
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Format
                        </label>
                        <select
                          value={metric.format || 'number'}
                          onChange={(e) =>
                            handleMetricChange(index, 'format', e.target.value as MetricFormat)
                          }
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
                        >
                          {FORMAT_OPTIONS.map(({ value, label }) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Trend */}
                      <div>
                        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                          Trend
                        </label>
                        <select
                          value={metric.trend || ''}
                          onChange={(e) =>
                            handleMetricChange(
                              index,
                              'trend',
                              e.target.value ? (e.target.value as MetricTrend) : undefined
                            )
                          }
                          className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">None</option>
                          <option value="up">Up</option>
                          <option value="down">Down</option>
                          <option value="neutral">Neutral</option>
                        </select>
                      </div>

                      {/* Trend Value (only show if trend is set) */}
                      {metric.trend && (
                        <div className="col-span-2">
                          <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                            Trend Value (e.g., "+12%")
                          </label>
                          <input
                            type="text"
                            value={metric.trendValue || ''}
                            onChange={(e) =>
                              handleMetricChange(index, 'trendValue', e.target.value)
                            }
                            placeholder="+12%"
                            className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Button */}
              <button
                onClick={handleAddMetric}
                className="flex items-center gap-1.5 px-3 py-1.5 mt-4 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              >
                <Plus size={14} aria-hidden="true" />
                Add metric
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EditableMetrics;
