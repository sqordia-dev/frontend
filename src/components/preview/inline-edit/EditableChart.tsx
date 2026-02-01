import React, { useState, useCallback } from 'react';
import { Table, Plus, Trash2, Palette } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChartData, ChartType } from '../../../types/visual-elements';
import { ChartWrapper } from '../../visual-elements/charts';

interface EditableChartProps {
  /** Chart data */
  data: ChartData;
  /** Callback when data changes */
  onDataChange: (data: ChartData) => void;
  /** Styling options */
  styling?: any;
}

/**
 * Available chart types for the selector
 */
const CHART_TYPES: { value: ChartType; label: string }[] = [
  { value: 'line', label: 'Line' },
  { value: 'bar', label: 'Bar' },
  { value: 'stacked-bar', label: 'Stacked Bar' },
  { value: 'area', label: 'Area' },
  { value: 'pie', label: 'Pie' },
  { value: 'donut', label: 'Donut' },
];

/**
 * Default color palette
 */
const COLOR_PALETTE = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
];

/**
 * EditableChart Component
 * Provides inline editing for chart data with a spreadsheet-like interface
 * and real-time chart preview.
 */
export function EditableChart({ data, onDataChange, styling }: EditableChartProps) {
  const [showDataEditor, setShowDataEditor] = useState(false);

  // Handle value change in dataset
  const handleValueChange = useCallback(
    (datasetIndex: number, valueIndex: number, value: number) => {
      const newDatasets = [...data.datasets];
      const newData = [...newDatasets[datasetIndex].data];
      newData[valueIndex] = value;
      newDatasets[datasetIndex] = { ...newDatasets[datasetIndex], data: newData };
      onDataChange({ ...data, datasets: newDatasets });
    },
    [data, onDataChange]
  );

  // Handle label change
  const handleLabelChange = useCallback(
    (index: number, label: string) => {
      const newLabels = [...data.labels];
      newLabels[index] = label;
      onDataChange({ ...data, labels: newLabels });
    },
    [data, onDataChange]
  );

  // Handle dataset label change
  const handleDatasetLabelChange = useCallback(
    (datasetIndex: number, label: string) => {
      const newDatasets = [...data.datasets];
      newDatasets[datasetIndex] = { ...newDatasets[datasetIndex], label };
      onDataChange({ ...data, datasets: newDatasets });
    },
    [data, onDataChange]
  );

  // Handle dataset color change
  const handleColorChange = useCallback(
    (datasetIndex: number, color: string) => {
      const newDatasets = [...data.datasets];
      newDatasets[datasetIndex] = { ...newDatasets[datasetIndex], color };
      onDataChange({ ...data, datasets: newDatasets });
    },
    [data, onDataChange]
  );

  // Handle chart type change
  const handleChartTypeChange = useCallback(
    (chartType: ChartType) => {
      onDataChange({ ...data, chartType });
    },
    [data, onDataChange]
  );

  // Add a new data point
  const handleAddDataPoint = useCallback(() => {
    const newLabels = [...data.labels, `Label ${data.labels.length + 1}`];
    const newDatasets = data.datasets.map((ds) => ({
      ...ds,
      data: [...ds.data, 0],
    }));
    onDataChange({ ...data, labels: newLabels, datasets: newDatasets });
  }, [data, onDataChange]);

  // Remove a data point
  const handleRemoveDataPoint = useCallback(
    (index: number) => {
      if (data.labels.length <= 1) return;

      const newLabels = data.labels.filter((_, i) => i !== index);
      const newDatasets = data.datasets.map((ds) => ({
        ...ds,
        data: ds.data.filter((_, i) => i !== index),
      }));
      onDataChange({ ...data, labels: newLabels, datasets: newDatasets });
    },
    [data, onDataChange]
  );

  // Add a new dataset
  const handleAddDataset = useCallback(() => {
    const newDataset = {
      label: `Series ${data.datasets.length + 1}`,
      data: data.labels.map(() => 0),
      color: COLOR_PALETTE[data.datasets.length % COLOR_PALETTE.length],
    };
    onDataChange({ ...data, datasets: [...data.datasets, newDataset] });
  }, [data, onDataChange]);

  // Remove a dataset
  const handleRemoveDataset = useCallback(
    (index: number) => {
      if (data.datasets.length <= 1) return;

      const newDatasets = data.datasets.filter((_, i) => i !== index);
      onDataChange({ ...data, datasets: newDatasets });
    },
    [data, onDataChange]
  );

  return (
    <div className="relative group">
      {/* Chart Display */}
      <ChartWrapper data={data} styling={styling} />

      {/* Edit Button */}
      <button
        onClick={() => setShowDataEditor(!showDataEditor)}
        className={`absolute top-2 right-2 p-2 rounded-lg shadow transition-all ${
          showDataEditor
            ? 'bg-blue-500 text-white'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 opacity-0 group-hover:opacity-100'
        }`}
        title={showDataEditor ? 'Hide data editor' : 'Edit chart data'}
        aria-label={showDataEditor ? 'Hide data editor' : 'Edit chart data'}
      >
        <Table size={16} aria-hidden="true" />
      </button>

      {/* Data Editor Panel */}
      <AnimatePresence>
        {showDataEditor && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 overflow-hidden"
          >
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              {/* Chart Type Selector */}
              <div className="flex items-center gap-4 mb-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Chart type:
                </label>
                <select
                  value={data.chartType}
                  onChange={(e) => handleChartTypeChange(e.target.value as ChartType)}
                  className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  {CHART_TYPES.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-600">
                      <th className="text-left py-2 pr-2 font-medium text-gray-700 dark:text-gray-300">
                        Label
                      </th>
                      {data.datasets.map((ds, dsIndex) => (
                        <th key={dsIndex} className="text-left py-2 px-2">
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={ds.label}
                              onChange={(e) =>
                                handleDatasetLabelChange(dsIndex, e.target.value)
                              }
                              className="flex-1 min-w-[80px] px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                              aria-label={`Dataset ${dsIndex + 1} name`}
                            />
                            <input
                              type="color"
                              value={ds.color || COLOR_PALETTE[dsIndex % COLOR_PALETTE.length]}
                              onChange={(e) =>
                                handleColorChange(dsIndex, e.target.value)
                              }
                              className="w-6 h-6 rounded cursor-pointer border-0"
                              title="Change color"
                              aria-label={`Dataset ${dsIndex + 1} color`}
                            />
                            {data.datasets.length > 1 && (
                              <button
                                onClick={() => handleRemoveDataset(dsIndex)}
                                className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                title="Remove dataset"
                                aria-label={`Remove dataset ${dsIndex + 1}`}
                              >
                                <Trash2 size={14} />
                              </button>
                            )}
                          </div>
                        </th>
                      ))}
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.labels.map((label, labelIndex) => (
                      <tr
                        key={labelIndex}
                        className="border-b border-gray-100 dark:border-gray-700"
                      >
                        <td className="py-2 pr-2">
                          <input
                            type="text"
                            value={label}
                            onChange={(e) =>
                              handleLabelChange(labelIndex, e.target.value)
                            }
                            className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                            aria-label={`Label ${labelIndex + 1}`}
                          />
                        </td>
                        {data.datasets.map((dataset, dsIndex) => (
                          <td key={dsIndex} className="py-2 px-2">
                            <input
                              type="number"
                              value={dataset.data[labelIndex] ?? 0}
                              onChange={(e) =>
                                handleValueChange(
                                  dsIndex,
                                  labelIndex,
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500"
                              aria-label={`Value for ${dataset.label} at ${label}`}
                            />
                          </td>
                        ))}
                        <td className="py-2 pl-2">
                          {data.labels.length > 1 && (
                            <button
                              onClick={() => handleRemoveDataPoint(labelIndex)}
                              className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              title="Remove data point"
                              aria-label={`Remove data point ${labelIndex + 1}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Buttons */}
              <div className="flex items-center gap-4 mt-4">
                <button
                  onClick={handleAddDataPoint}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <Plus size={14} aria-hidden="true" />
                  Add data point
                </button>
                <button
                  onClick={handleAddDataset}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                >
                  <Plus size={14} aria-hidden="true" />
                  Add dataset
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EditableChart;
