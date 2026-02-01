/**
 * Content Parser for Export
 * Parses markdown-like content from sections into structured elements for PDF/Word export
 *
 * The content is stored as plain text with markdown-like notation:
 * - Headers: # H1, ## H2, ### H3
 * - Bullet lists: - item or * item
 * - Numbered lists: 1. item
 * - Bold: **text**
 * - Italic: *text*
 * - Paragraphs separated by blank lines
 */

export interface ParsedElement {
  type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'bulletList' | 'numberedList' | 'table' | 'image' | 'blockquote';
  content?: string;
  children?: ParsedElement[];
  level?: number;
  items?: string[];
  rows?: string[][];
  src?: string;
  alt?: string;
}

/**
 * Parse content string to structured elements
 * Handles both markdown-like content and HTML content
 */
export function parseHTMLToElements(content: string): ParsedElement[] {
  if (!content || typeof content !== 'string') {
    return [];
  }

  // Check if content looks like HTML (contains HTML tags)
  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(content);

  if (hasHtmlTags) {
    return parseHTMLContent(content);
  }

  // Otherwise, parse as markdown-like content
  return parseMarkdownContent(content);
}

/**
 * Parse markdown-like content to structured elements
 */
function parseMarkdownContent(content: string): ParsedElement[] {
  const elements: ParsedElement[] = [];

  // Normalize line endings
  const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Split into blocks (separated by blank lines)
  const blocks = normalizedContent.split(/\n\n+/);

  for (const block of blocks) {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) continue;

    // Check for headers
    const headerMatch = trimmedBlock.match(/^(#{1,6})\s+(.+)$/m);
    if (headerMatch && trimmedBlock.startsWith('#')) {
      const level = headerMatch[1].length;
      const headerText = stripMarkdownFormatting(headerMatch[2]);

      if (level === 1) {
        elements.push({ type: 'heading1', content: headerText });
      } else if (level === 2) {
        elements.push({ type: 'heading2', content: headerText });
      } else {
        elements.push({ type: 'heading3', content: headerText });
      }
      continue;
    }

    // Check for bullet list (lines starting with - or *)
    if (/^[-*]\s/m.test(trimmedBlock)) {
      const items = parseBulletList(trimmedBlock);
      if (items.length > 0) {
        elements.push({ type: 'bulletList', items });
        continue;
      }
    }

    // Check for numbered list (lines starting with number.)
    if (/^\d+\.\s/m.test(trimmedBlock)) {
      const items = parseNumberedList(trimmedBlock);
      if (items.length > 0) {
        elements.push({ type: 'numberedList', items });
        continue;
      }
    }

    // Check for blockquote (lines starting with >)
    if (trimmedBlock.startsWith('>')) {
      const quoteContent = trimmedBlock
        .split('\n')
        .map(line => line.replace(/^>\s*/, ''))
        .join(' ')
        .trim();
      elements.push({ type: 'blockquote', content: stripMarkdownFormatting(quoteContent) });
      continue;
    }

    // Regular paragraph - may contain multiple lines that form one paragraph
    const paragraphText = trimmedBlock
      .split('\n')
      .map(line => line.trim())
      .join(' ')
      .trim();

    if (paragraphText) {
      elements.push({ type: 'paragraph', content: stripMarkdownFormatting(paragraphText) });
    }
  }

  return elements;
}

/**
 * Parse bullet list items from a block
 */
function parseBulletList(block: string): string[] {
  const items: string[] = [];
  const lines = block.split('\n');
  let currentItem = '';

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Check if this is a new list item
    const listMatch = trimmedLine.match(/^[-*]\s+(.+)$/);
    if (listMatch) {
      if (currentItem) {
        items.push(stripMarkdownFormatting(currentItem.trim()));
      }
      currentItem = listMatch[1];
    } else if (currentItem && trimmedLine) {
      // Continuation of previous item (indented text)
      currentItem += ' ' + trimmedLine;
    }
  }

  // Don't forget the last item
  if (currentItem) {
    items.push(stripMarkdownFormatting(currentItem.trim()));
  }

  return items;
}

/**
 * Parse numbered list items from a block
 */
function parseNumberedList(block: string): string[] {
  const items: string[] = [];
  const lines = block.split('\n');
  let currentItem = '';

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Check if this is a new list item
    const listMatch = trimmedLine.match(/^\d+\.\s+(.+)$/);
    if (listMatch) {
      if (currentItem) {
        items.push(stripMarkdownFormatting(currentItem.trim()));
      }
      currentItem = listMatch[1];
    } else if (currentItem && trimmedLine) {
      // Continuation of previous item
      currentItem += ' ' + trimmedLine;
    }
  }

  // Don't forget the last item
  if (currentItem) {
    items.push(stripMarkdownFormatting(currentItem.trim()));
  }

  return items;
}

/**
 * Strip markdown formatting from text (bold, italic, etc.)
 */
function stripMarkdownFormatting(text: string): string {
  return text
    // Remove bold (**text** or __text__)
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    // Remove italic (*text* or _text_) - be careful not to remove list markers
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '$1')
    .replace(/(?<!_)_([^_\n]+)_(?!_)/g, '$1')
    // Remove inline code (`text`)
    .replace(/`([^`]+)`/g, '$1')
    // Remove links [text](url) -> text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Clean up any remaining artifacts
    .trim();
}

/**
 * Parse HTML content to structured elements (fallback for HTML content)
 */
function parseHTMLContent(html: string): ParsedElement[] {
  const elements: ParsedElement[] = [];

  // Create a temporary DOM parser
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;

  // Process child nodes
  processNodes(body.childNodes, elements);

  return elements;
}

/**
 * Process DOM nodes recursively
 */
function processNodes(nodes: NodeListOf<ChildNode>, elements: ParsedElement[]): void {
  nodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        elements.push({ type: 'paragraph', content: text });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      const tagName = element.tagName.toLowerCase();

      switch (tagName) {
        case 'h1':
          elements.push({
            type: 'heading1',
            content: getTextContent(element),
          });
          break;

        case 'h2':
          elements.push({
            type: 'heading2',
            content: getTextContent(element),
          });
          break;

        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          elements.push({
            type: 'heading3',
            content: getTextContent(element),
          });
          break;

        case 'p':
          const pText = getTextContent(element);
          if (pText) {
            elements.push({
              type: 'paragraph',
              content: pText,
            });
          }
          break;

        case 'ul':
          elements.push({
            type: 'bulletList',
            items: extractListItems(element),
          });
          break;

        case 'ol':
          elements.push({
            type: 'numberedList',
            items: extractListItems(element),
          });
          break;

        case 'table':
          elements.push({
            type: 'table',
            rows: extractTableRows(element),
          });
          break;

        case 'img':
          const src = element.getAttribute('src');
          if (src) {
            elements.push({
              type: 'image',
              src,
              alt: element.getAttribute('alt') || '',
            });
          }
          break;

        case 'blockquote':
          elements.push({
            type: 'blockquote',
            content: getTextContent(element),
          });
          break;

        case 'div':
        case 'section':
        case 'article':
          processNodes(element.childNodes, elements);
          break;

        case 'br':
          break;

        case 'strong':
        case 'b':
        case 'em':
        case 'i':
        case 'u':
        case 'span':
        case 'a':
          const inlineText = getTextContent(element);
          if (inlineText) {
            elements.push({
              type: 'paragraph',
              content: inlineText,
            });
          }
          break;

        default:
          const text = getTextContent(element);
          if (text) {
            elements.push({
              type: 'paragraph',
              content: text,
            });
          }
          break;
      }
    }
  });
}

/**
 * Get text content with inline formatting preserved as plain text
 */
function getTextContent(element: Element): string {
  return element.textContent?.trim() || '';
}

/**
 * Extract list items from ul/ol
 */
function extractListItems(listElement: Element): string[] {
  const items: string[] = [];
  const liElements = listElement.querySelectorAll(':scope > li');

  liElements.forEach((li) => {
    const text = li.textContent?.trim();
    if (text) {
      items.push(text);
    }
  });

  return items;
}

/**
 * Extract table rows
 */
function extractTableRows(tableElement: Element): string[][] {
  const rows: string[][] = [];

  const theadRows = tableElement.querySelectorAll('thead tr');
  theadRows.forEach((tr) => {
    const cells: string[] = [];
    tr.querySelectorAll('th, td').forEach((cell) => {
      cells.push(cell.textContent?.trim() || '');
    });
    if (cells.length > 0) {
      rows.push(cells);
    }
  });

  const tbodyRows = tableElement.querySelectorAll('tbody tr');
  tbodyRows.forEach((tr) => {
    const cells: string[] = [];
    tr.querySelectorAll('td').forEach((cell) => {
      cells.push(cell.textContent?.trim() || '');
    });
    if (cells.length > 0) {
      rows.push(cells);
    }
  });

  if (rows.length === 0) {
    const directRows = tableElement.querySelectorAll('tr');
    directRows.forEach((tr) => {
      const cells: string[] = [];
      tr.querySelectorAll('th, td').forEach((cell) => {
        cells.push(cell.textContent?.trim() || '');
      });
      if (cells.length > 0) {
        rows.push(cells);
      }
    });
  }

  return rows;
}

/**
 * Clean parsed elements and remove empty ones
 */
export function cleanParsedElements(elements: ParsedElement[]): ParsedElement[] {
  return elements.filter((el) => {
    if (el.type === 'paragraph' && (!el.content || el.content.trim() === '')) {
      return false;
    }
    if (el.type === 'bulletList' && (!el.items || el.items.length === 0)) {
      return false;
    }
    if (el.type === 'numberedList' && (!el.items || el.items.length === 0)) {
      return false;
    }
    if (el.type === 'table' && (!el.rows || el.rows.length === 0)) {
      return false;
    }
    return true;
  });
}

/**
 * Combine adjacent paragraphs if they appear to be continuations
 */
export function mergeParagraphs(elements: ParsedElement[]): ParsedElement[] {
  const result: ParsedElement[] = [];

  for (let i = 0; i < elements.length; i++) {
    const current = elements[i];
    const previous = result[result.length - 1];

    if (current.type !== 'paragraph' || !previous || previous.type !== 'paragraph') {
      result.push(current);
      continue;
    }

    const currentContent = current.content || '';
    if (currentContent.length > 0 && /^[a-z]/.test(currentContent)) {
      previous.content = `${previous.content} ${currentContent}`;
    } else {
      result.push(current);
    }
  }

  return result;
}
