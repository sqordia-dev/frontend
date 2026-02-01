/**
 * Visual Elements Components Index
 * Exports all visual element components for use in business plan sections
 */

// Main renderer
export { VisualElementRenderer } from './VisualElementRenderer';
export { default as VisualElementRendererDefault } from './VisualElementRenderer';

// Table components
export { FinancialTable, SWOTMatrix, ComparisonTable, CustomTable } from './tables';

// Chart components
export { ChartWrapper } from './charts';

// Metric components
export { MetricCards } from './metrics';

// Re-export types for convenience
export type {
  VisualElement,
  VisualElementType,
  TableData,
  TableRow,
  TableCell,
  TableType,
  ColumnType,
  CellFormat,
  SWOTData,
  ChartData,
  ChartDataset,
  ChartOptions,
  ChartType,
  MetricData,
  Metric,
  MetricFormat,
  MetricTrend,
  MetricLayout,
  InfographicData,
  InfographicItem,
  InfographicType,
  VisualStyling,
  VisualTheme,
  FontSize,
  BorderStyle,
  SectionContent,
  ContentLayout,
  BaseTableProps,
  SWOTMatrixProps,
  ChartWrapperProps,
  MetricCardsProps,
  VisualElementRendererProps,
} from '../../types/visual-elements';

// Re-export type guards
export {
  isTableData,
  isChartData,
  isMetricData,
  isInfographicData,
  isSWOTData,
} from '../../types/visual-elements';
