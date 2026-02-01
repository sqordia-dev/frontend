import React, { useCallback } from 'react';
import {
  VisualElement,
  TableData,
  ChartData,
  MetricData,
  InfographicData,
  isTableData,
  isChartData,
  isMetricData,
  isInfographicData,
} from '../../../types/visual-elements';
import { VisualElementRenderer } from '../../visual-elements/VisualElementRenderer';
import { EditableTable } from './EditableTable';
import { EditableChart } from './EditableChart';
import { EditableMetrics } from './EditableMetrics';

interface EditableVisualElementProps {
  /** The visual element to render/edit */
  element: VisualElement;
  /** Whether editing is enabled */
  editable?: boolean;
  /** Callback when element is updated */
  onUpdate?: (element: VisualElement) => void;
}

/**
 * EditableVisualElement Component
 * Wraps VisualElementRenderer with edit controls for different element types.
 * Supports editing tables, charts, and metrics.
 */
export function EditableVisualElement({
  element,
  editable = false,
  onUpdate,
}: EditableVisualElementProps) {
  // Handle data update
  const handleDataChange = useCallback(
    <T extends object>(newData: T) => {
      if (onUpdate) {
        onUpdate({ ...element, data: newData as VisualElement['data'] });
      }
    },
    [element, onUpdate]
  );

  // If not editable, just render the visual element
  if (!editable || !onUpdate) {
    return <VisualElementRenderer element={element} />;
  }

  // Render editable version based on element type
  const renderEditable = () => {
    switch (element.type) {
      case 'table':
        if (isTableData(element.data)) {
          return (
            <EditableTable
              data={element.data as TableData}
              onDataChange={(data) => handleDataChange(data)}
            />
          );
        }
        break;

      case 'chart':
        if (isChartData(element.data)) {
          return (
            <EditableChart
              data={element.data as ChartData}
              onDataChange={(data) => handleDataChange(data)}
              styling={element.styling}
            />
          );
        }
        break;

      case 'metric':
        if (isMetricData(element.data)) {
          return (
            <EditableMetrics
              data={element.data as MetricData}
              onDataChange={(data) => handleDataChange(data)}
              styling={element.styling}
            />
          );
        }
        break;

      case 'infographic':
        // For infographics, use the standard renderer with editable prop
        // (could be extended with dedicated editing in the future)
        return (
          <VisualElementRenderer
            element={element}
            editable={editable}
            onUpdate={onUpdate}
          />
        );

      default:
        return <VisualElementRenderer element={element} />;
    }

    // Fallback to non-editable if data type doesn't match
    return <VisualElementRenderer element={element} />;
  };

  // Get position classes
  const getPositionClasses = () => {
    switch (element.position) {
      case 'float-left':
        return 'float-left mr-6 mb-4 w-full md:w-1/2';
      case 'float-right':
        return 'float-right ml-6 mb-4 w-full md:w-1/2';
      case 'full-width':
        return 'w-full clear-both';
      case 'inline':
      default:
        return 'w-full';
    }
  };

  return (
    <div
      className={`editable-visual-element ${getPositionClasses()}`}
      data-element-id={element.id}
    >
      {/* Element Title */}
      {element.title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {element.title}
        </h3>
      )}

      {/* Editable Content */}
      {renderEditable()}
    </div>
  );
}

export default EditableVisualElement;
