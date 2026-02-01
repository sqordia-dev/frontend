import React from 'react';
import {
  VisualElement,
  TableData,
  ChartData,
  MetricData,
  InfographicData,
  SWOTData,
  isTableData,
  isChartData,
  isMetricData,
  isInfographicData,
  isSWOTData,
} from '../../types/visual-elements';
import { FinancialTable, SWOTMatrix, ComparisonTable, CustomTable } from './tables';
import { ChartWrapper } from './charts';
import { MetricCards } from './metrics';

interface VisualElementRendererProps {
  element: VisualElement;
  editable?: boolean;
  onUpdate?: (element: VisualElement) => void;
}

/**
 * Infographic Renderer Component
 * Handles rendering of various infographic types
 */
function InfographicRenderer({ data }: { data: InfographicData }) {
  switch (data.infographicType) {
    case 'process-flow':
      return <ProcessFlowRenderer items={data.items} />;
    case 'icon-list':
      return <IconListRenderer items={data.items} />;
    case 'quote':
      return <QuoteRenderer items={data.items} />;
    case 'callout':
      return <CalloutRenderer items={data.items} />;
    case 'timeline':
      return <TimelineRenderer items={data.items} />;
    default:
      return (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-yellow-700 dark:text-yellow-400">
          Unknown infographic type: {data.infographicType}
        </div>
      );
  }
}

/**
 * Process Flow Renderer
 */
function ProcessFlowRenderer({ items }: { items: InfographicData['items'] }) {
  return (
    <div className="my-6">
      <div className="flex flex-col md:flex-row items-stretch gap-4">
        {items
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map((item, index) => (
            <React.Fragment key={index}>
              {/* Step Card */}
              <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                </div>
                {item.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
                )}
              </div>

              {/* Arrow */}
              {index < items.length - 1 && (
                <div className="hidden md:flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
      </div>
    </div>
  );
}

/**
 * Icon List Renderer
 */
function IconListRenderer({ items }: { items: InfographicData['items'] }) {
  return (
    <div className="my-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          {/* Icon placeholder */}
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-blue-600 dark:text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h4>
            {item.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400">{item.description}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Quote Renderer
 */
function QuoteRenderer({ items }: { items: InfographicData['items'] }) {
  return (
    <div className="my-6 space-y-4">
      {items.map((item, index) => (
        <blockquote
          key={index}
          className="relative p-6 bg-gray-50 dark:bg-gray-800 rounded-xl border-l-4 border-blue-500"
        >
          <svg
            className="absolute top-4 left-4 w-8 h-8 text-blue-200 dark:text-blue-800"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
          <p className="text-lg italic text-gray-700 dark:text-gray-300 pl-8">{item.title}</p>
          {item.description && (
            <cite className="block mt-3 text-sm text-gray-500 dark:text-gray-400 pl-8 not-italic">
              - {item.description}
            </cite>
          )}
        </blockquote>
      ))}
    </div>
  );
}

/**
 * Callout Renderer
 */
function CalloutRenderer({ items }: { items: InfographicData['items'] }) {
  return (
    <div className="my-6 space-y-4">
      {items.map((item, index) => (
        <div
          key={index}
          className="p-5 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg
                className="w-6 h-6 text-blue-600 dark:text-blue-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">{item.title}</h4>
              {item.description && (
                <p className="text-sm text-blue-700 dark:text-blue-300">{item.description}</p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Timeline Renderer
 */
function TimelineRenderer({ items }: { items: InfographicData['items'] }) {
  return (
    <div className="my-6">
      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

        {/* Timeline Items */}
        <div className="space-y-6">
          {items
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((item, index) => (
              <div key={index} className="relative pl-12">
                {/* Timeline Dot */}
                <div className="absolute left-2 w-5 h-5 rounded-full bg-blue-500 border-4 border-white dark:border-gray-900" />

                {/* Content */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h4 className="font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                  {item.description && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

/**
 * Visual Element Renderer Component
 * Routes to appropriate component based on element type
 */
export function VisualElementRenderer({
  element,
  editable = false,
  onUpdate,
}: VisualElementRendererProps) {
  // Handle data update
  const handleDataChange = <T extends object>(newData: T) => {
    if (onUpdate) {
      onUpdate({ ...element, data: newData as VisualElement['data'] });
    }
  };

  // Render element title if present
  const renderTitle = () => {
    if (!element.title) return null;
    return (
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{element.title}</h3>
    );
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

  // Render based on element type
  const renderElement = () => {
    switch (element.type) {
      case 'table':
        const tableData = element.data;
        if (!isTableData(tableData)) {
          return <ErrorState message="Invalid table data" />;
        }

        // Check for SWOT table type with SWOT data structure
        if (tableData.tableType === 'swot' && isSWOTData(tableData)) {
          return (
            <SWOTMatrix
              data={tableData as unknown as SWOTData}
              styling={element.styling}
              editable={editable}
              onDataChange={(data) => handleDataChange(data)}
            />
          );
        }

        // Route to specific table component based on tableType
        switch (tableData.tableType) {
          case 'financial':
            return (
              <FinancialTable
                data={tableData}
                styling={element.styling}
                editable={editable}
                onDataChange={(data) => handleDataChange(data)}
              />
            );
          case 'comparison':
            return (
              <ComparisonTable
                data={tableData}
                styling={element.styling}
                editable={editable}
                onDataChange={(data) => handleDataChange(data)}
              />
            );
          case 'timeline':
          case 'pricing':
          case 'custom':
          default:
            return (
              <CustomTable
                data={tableData}
                styling={element.styling}
                editable={editable}
                onDataChange={(data) => handleDataChange(data)}
              />
            );
        }

      case 'chart':
        const chartData = element.data;
        if (!isChartData(chartData)) {
          return <ErrorState message="Invalid chart data" />;
        }
        return <ChartWrapper data={chartData} styling={element.styling} />;

      case 'metric':
        const metricData = element.data;
        if (!isMetricData(metricData)) {
          return <ErrorState message="Invalid metric data" />;
        }
        return <MetricCards data={metricData} styling={element.styling} />;

      case 'infographic':
        const infographicData = element.data;
        if (!isInfographicData(infographicData)) {
          return <ErrorState message="Invalid infographic data" />;
        }
        return <InfographicRenderer data={infographicData} />;

      default:
        return <ErrorState message={`Unknown visual element type: ${element.type}`} />;
    }
  };

  return (
    <div className={`visual-element ${getPositionClasses()}`} data-element-id={element.id}>
      {renderTitle()}
      {renderElement()}
    </div>
  );
}

/**
 * Error State Component
 */
function ErrorState({ message }: { message: string }) {
  return (
    <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
      <p className="text-sm text-red-700 dark:text-red-400">{message}</p>
    </div>
  );
}

export default VisualElementRenderer;
