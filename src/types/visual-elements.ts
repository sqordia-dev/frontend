/**
 * Visual Elements Types
 * Types for tables, charts, metrics, and infographics in business plan sections
 */

// ============================================================================
// Core Types
// ============================================================================

export type VisualElementType = 'table' | 'chart' | 'metric' | 'infographic';

export interface VisualElement {
  id: string;
  type: VisualElementType;
  title?: string;
  data: TableData | ChartData | MetricData | InfographicData;
  styling?: VisualStyling;
  position?: 'inline' | 'full-width' | 'float-left' | 'float-right';
}

// ============================================================================
// Table Types
// ============================================================================

export type TableType = 'financial' | 'swot' | 'comparison' | 'timeline' | 'pricing' | 'custom';
export type ColumnType = 'text' | 'number' | 'currency' | 'percentage' | 'date';
export type CellFormat = 'bold' | 'italic' | 'highlight';

export interface TableData {
  tableType: TableType;
  headers: string[];
  rows: TableRow[];
  footer?: TableRow;
  columnTypes?: ColumnType[];
}

export interface TableRow {
  cells: TableCell[];
  isHighlighted?: boolean;
}

export interface TableCell {
  value: string | number;
  format?: CellFormat;
  colspan?: number;
  rowspan?: number;
}

// SWOT-specific data structure
export interface SWOTData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

// ============================================================================
// Chart Types
// ============================================================================

export type ChartType = 'line' | 'bar' | 'pie' | 'donut' | 'area' | 'stacked-bar';

export interface ChartData {
  chartType: ChartType;
  labels: string[];
  datasets: ChartDataset[];
  options?: ChartOptions;
  title?: string;
}

export interface ChartDataset {
  label: string;
  data: number[];
  color?: string;
}

export interface ChartOptions {
  showLegend?: boolean;
  showGrid?: boolean;
  currency?: string;
  percentageFormat?: boolean;
  stacked?: boolean;
}

// ============================================================================
// Metric Types
// ============================================================================

export type MetricFormat = 'currency' | 'percentage' | 'number' | 'text';
export type MetricTrend = 'up' | 'down' | 'neutral';
export type MetricLayout = 'grid' | 'row' | 'column';

export interface MetricData {
  metrics: Metric[];
  layout: MetricLayout;
}

export interface Metric {
  label: string;
  value: string | number;
  format?: MetricFormat;
  trend?: MetricTrend;
  trendValue?: string;
  icon?: string;
}

// ============================================================================
// Infographic Types
// ============================================================================

export type InfographicType = 'process-flow' | 'icon-list' | 'quote' | 'callout' | 'timeline';

export interface InfographicData {
  infographicType: InfographicType;
  items: InfographicItem[];
}

export interface InfographicItem {
  icon?: string;
  title: string;
  description?: string;
  order?: number;
}

// ============================================================================
// Styling Types
// ============================================================================

export type VisualTheme = 'default' | 'minimal' | 'corporate' | 'modern';
export type FontSize = 'small' | 'medium' | 'large';
export type BorderStyle = 'none' | 'light' | 'medium' | 'heavy';

export interface VisualStyling {
  theme?: VisualTheme;
  primaryColor?: string;
  fontSize?: FontSize;
  borderStyle?: BorderStyle;
}

// ============================================================================
// Section Content with Visuals
// ============================================================================

export type ContentLayout = 'prose-first' | 'visuals-first' | 'interleaved';

export interface SectionContent {
  prose: string;
  visualElements?: VisualElement[];
  layout?: ContentLayout;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface BaseTableProps {
  data: TableData;
  styling?: VisualStyling;
  editable?: boolean;
  onDataChange?: (data: TableData) => void;
}

export interface SWOTMatrixProps {
  data: SWOTData;
  styling?: VisualStyling;
  editable?: boolean;
  onDataChange?: (data: SWOTData) => void;
}

export interface ChartWrapperProps {
  data: ChartData;
  styling?: VisualStyling;
  height?: number;
}

export interface MetricCardsProps {
  data: MetricData;
  styling?: VisualStyling;
}

export interface VisualElementRendererProps {
  element: VisualElement;
  editable?: boolean;
  onUpdate?: (element: VisualElement) => void;
}

// ============================================================================
// Utility Types
// ============================================================================

// Type guard helpers
export function isTableData(data: unknown): data is TableData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'tableType' in data &&
    'headers' in data &&
    'rows' in data
  );
}

export function isChartData(data: unknown): data is ChartData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'chartType' in data &&
    'labels' in data &&
    'datasets' in data
  );
}

export function isMetricData(data: unknown): data is MetricData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'metrics' in data &&
    'layout' in data
  );
}

export function isInfographicData(data: unknown): data is InfographicData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'infographicType' in data &&
    'items' in data
  );
}

export function isSWOTData(data: unknown): data is SWOTData {
  return (
    typeof data === 'object' &&
    data !== null &&
    'strengths' in data &&
    'weaknesses' in data &&
    'opportunities' in data &&
    'threats' in data
  );
}
