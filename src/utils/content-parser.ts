/**
 * Content Parser Utility
 * Parses AI-generated content to extract prose and visual elements
 *
 * Visual elements are embedded in content using fenced code blocks:
 * ```json:chart
 * { "chartType": "bar", "labels": [...], "datasets": [...] }
 * ```
 *
 * ```json:table
 * { "tableType": "financial", "headers": [...], "rows": [...] }
 * ```
 *
 * ```json:metrics
 * { "layout": "grid", "metrics": [...] }
 * ```
 *
 * ```json:infographic
 * { "infographicType": "process-flow", "items": [...] }
 * ```
 */

import {
  VisualElement,
  ChartData,
  TableData,
  MetricData,
  InfographicData,
} from '../types/visual-elements';

export interface ParsedContent {
  /** Array of content blocks (prose or visual elements) */
  blocks: ContentBlock[];
  /** Raw content without visual element markers (for backwards compatibility) */
  rawContent: string;
  /** Whether content contains visual elements */
  hasVisualElements: boolean;
}

export type ContentBlock =
  | { type: 'prose'; content: string }
  | { type: 'visual'; element: VisualElement };

/**
 * Regular expression to match visual element code blocks
 * Matches: ```json:chart {...} ``` or ```json:table {...} ``` etc.
 */
const VISUAL_ELEMENT_REGEX = /```json:(chart|table|metrics|infographic|swot)\s*\n([\s\S]*?)```/gi;

/**
 * Parse content to extract prose and visual elements
 * @param content Raw content from AI generation
 * @returns Parsed content with blocks array
 */
export function parseContent(content: string): ParsedContent {
  if (!content || typeof content !== 'string') {
    return {
      blocks: [],
      rawContent: '',
      hasVisualElements: false,
    };
  }

  const blocks: ContentBlock[] = [];
  let lastIndex = 0;
  let hasVisualElements = false;

  // Reset regex index
  VISUAL_ELEMENT_REGEX.lastIndex = 0;

  let match;
  while ((match = VISUAL_ELEMENT_REGEX.exec(content)) !== null) {
    // Add prose block before this visual element
    if (match.index > lastIndex) {
      const prose = content.slice(lastIndex, match.index).trim();
      if (prose) {
        blocks.push({ type: 'prose', content: prose });
      }
    }

    // Parse the visual element
    const elementType = match[1].toLowerCase();
    const jsonContent = match[2].trim();

    try {
      const data = JSON.parse(jsonContent);
      const visualElement = createVisualElement(elementType, data);

      if (visualElement) {
        blocks.push({ type: 'visual', element: visualElement });
        hasVisualElements = true;
      }
    } catch (err) {
      console.warn(`Failed to parse visual element JSON (${elementType}):`, err);
      // If parsing fails, include the raw content as prose
      blocks.push({ type: 'prose', content: match[0] });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining prose after the last visual element
  if (lastIndex < content.length) {
    const prose = content.slice(lastIndex).trim();
    if (prose) {
      blocks.push({ type: 'prose', content: prose });
    }
  }

  // If no blocks were created, treat entire content as prose
  if (blocks.length === 0 && content.trim()) {
    blocks.push({ type: 'prose', content: content.trim() });
  }

  // Create raw content (content without visual element markers)
  const rawContent = content.replace(VISUAL_ELEMENT_REGEX, '').trim();

  return {
    blocks,
    rawContent,
    hasVisualElements,
  };
}

/**
 * Create a visual element from parsed data
 */
function createVisualElement(
  elementType: string,
  data: unknown
): VisualElement | null {
  const id = generateId();

  switch (elementType) {
    case 'chart':
      if (isValidChartData(data)) {
        return {
          id,
          type: 'chart',
          title: (data as any).title,
          data: data as ChartData,
        };
      }
      break;

    case 'table':
    case 'swot':
      if (isValidTableData(data)) {
        return {
          id,
          type: 'table',
          title: (data as any).title,
          data: data as TableData,
        };
      }
      break;

    case 'metrics':
      if (isValidMetricData(data)) {
        return {
          id,
          type: 'metric',
          title: (data as any).title,
          data: data as MetricData,
        };
      }
      break;

    case 'infographic':
      if (isValidInfographicData(data)) {
        return {
          id,
          type: 'infographic',
          title: (data as any).title,
          data: data as InfographicData,
        };
      }
      break;
  }

  console.warn(`Invalid or unsupported visual element type: ${elementType}`, data);
  return null;
}

/**
 * Validate chart data structure
 */
function isValidChartData(data: unknown): data is ChartData {
  if (!data || typeof data !== 'object') return false;
  const d = data as ChartData;
  return (
    typeof d.chartType === 'string' &&
    Array.isArray(d.labels) &&
    Array.isArray(d.datasets) &&
    d.datasets.every(
      (ds) =>
        typeof ds.label === 'string' &&
        Array.isArray(ds.data) &&
        ds.data.every((v) => typeof v === 'number')
    )
  );
}

/**
 * Validate table data structure
 */
function isValidTableData(data: unknown): data is TableData {
  if (!data || typeof data !== 'object') return false;
  const d = data as TableData;
  return (
    typeof d.tableType === 'string' &&
    Array.isArray(d.headers) &&
    Array.isArray(d.rows)
  );
}

/**
 * Validate metric data structure
 */
function isValidMetricData(data: unknown): data is MetricData {
  if (!data || typeof data !== 'object') return false;
  const d = data as MetricData;
  return (
    typeof d.layout === 'string' &&
    Array.isArray(d.metrics) &&
    d.metrics.every(
      (m) => typeof m.label === 'string' && (typeof m.value === 'string' || typeof m.value === 'number')
    )
  );
}

/**
 * Validate infographic data structure
 */
function isValidInfographicData(data: unknown): data is InfographicData {
  if (!data || typeof data !== 'object') return false;
  const d = data as InfographicData;
  return (
    typeof d.infographicType === 'string' &&
    Array.isArray(d.items) &&
    d.items.every((item) => typeof item.title === 'string')
  );
}

/**
 * Generate a unique ID for visual elements
 */
function generateId(): string {
  return `ve-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Extract only prose content (removes visual elements)
 * Useful for word count, text-only export, etc.
 */
export function extractProseOnly(content: string): string {
  const { rawContent } = parseContent(content);
  return rawContent;
}

/**
 * Extract only visual elements from content
 */
export function extractVisualElements(content: string): VisualElement[] {
  const { blocks } = parseContent(content);
  return blocks
    .filter((block): block is { type: 'visual'; element: VisualElement } => block.type === 'visual')
    .map((block) => block.element);
}

/**
 * Check if content contains any visual elements
 */
export function hasVisualElements(content: string): boolean {
  VISUAL_ELEMENT_REGEX.lastIndex = 0;
  return VISUAL_ELEMENT_REGEX.test(content);
}

/**
 * Serialize a visual element back to JSON code block format
 * @param element The visual element to serialize
 * @returns The JSON code block string
 */
export function serializeVisualElement(element: VisualElement): string {
  let elementType: string;

  switch (element.type) {
    case 'chart':
      elementType = 'chart';
      break;
    case 'table':
      // Check if it's a SWOT table
      if ((element.data as TableData).tableType === 'swot') {
        elementType = 'swot';
      } else {
        elementType = 'table';
      }
      break;
    case 'metric':
      elementType = 'metrics';
      break;
    case 'infographic':
      elementType = 'infographic';
      break;
    default:
      elementType = element.type;
  }

  const jsonContent = JSON.stringify(element.data, null, 2);
  return `\`\`\`json:${elementType}\n${jsonContent}\n\`\`\``;
}

/**
 * Reconstruct content from blocks
 * Combines prose and visual elements back into a single string
 * @param blocks Array of content blocks
 * @returns Reconstructed content string
 */
export function reconstructContent(blocks: ContentBlock[]): string {
  return blocks
    .map((block) => {
      if (block.type === 'prose') {
        return block.content;
      } else {
        return serializeVisualElement(block.element);
      }
    })
    .join('\n\n');
}

export default parseContent;
