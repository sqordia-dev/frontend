/**
 * Content Parser for Export
 * Parses markdown/HTML content into structured elements with rich inline formatting.
 *
 * Supports: headings, paragraphs, bullet/numbered lists, tables, blockquotes, images.
 * Inline formatting preserved: bold, italic, underline, strikethrough, code, links.
 */

/** A single run of text with inline formatting flags. */
export interface InlineRun {
  text: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  strikethrough?: boolean;
  code?: boolean;
  link?: string;
}

export interface ParsedElement {
  type: 'heading1' | 'heading2' | 'heading3' | 'paragraph' | 'bulletList' | 'numberedList' | 'table' | 'image' | 'blockquote';
  /** Plain-text content (backward compat for legacy consumers). */
  content?: string;
  /** Rich inline runs preserving bold/italic/link formatting. */
  runs?: InlineRun[];
  children?: ParsedElement[];
  level?: number;
  /** Plain-text list items (backward compat). */
  items?: string[];
  /** Rich list items with inline formatting. */
  richItems?: InlineRun[][];
  rows?: string[][];
  src?: string;
  alt?: string;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse content string to structured elements.
 * Handles both markdown and HTML content.
 */
export function parseHTMLToElements(content: string): ParsedElement[] {
  if (!content || typeof content !== 'string') {
    return [];
  }

  const hasHtmlTags = /<[a-z][\s\S]*>/i.test(content);

  if (hasHtmlTags) {
    return parseHTMLContent(content);
  }

  return parseMarkdownContent(content);
}

/**
 * Remove empty elements.
 */
export function cleanParsedElements(elements: ParsedElement[]): ParsedElement[] {
  return elements.filter((el) => {
    if (el.type === 'paragraph' && (!el.content || el.content.trim() === '') && (!el.runs || el.runs.length === 0)) {
      return false;
    }
    if ((el.type === 'bulletList' || el.type === 'numberedList') && (!el.items || el.items.length === 0) && (!el.richItems || el.richItems.length === 0)) {
      return false;
    }
    if (el.type === 'table' && (!el.rows || el.rows.length === 0)) {
      return false;
    }
    return true;
  });
}

/**
 * Combine adjacent paragraphs if they appear to be continuations.
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
      // Also merge runs
      if (previous.runs && current.runs) {
        previous.runs.push({ text: ' ' }, ...current.runs);
      }
    } else {
      result.push(current);
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// HTML parsing with rich inline formatting
// ---------------------------------------------------------------------------

function parseHTMLContent(html: string): ParsedElement[] {
  const elements: ParsedElement[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  processNodes(doc.body.childNodes, elements);
  return elements;
}

function processNodes(nodes: NodeListOf<ChildNode>, elements: ParsedElement[]): void {
  nodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        elements.push({
          type: 'paragraph',
          content: text,
          runs: [{ text }],
        });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const tagName = el.tagName.toLowerCase();

      switch (tagName) {
        case 'h1':
          elements.push({
            type: 'heading1',
            content: el.textContent?.trim() || '',
            runs: walkInlineNodes(el),
          });
          break;

        case 'h2':
          elements.push({
            type: 'heading2',
            content: el.textContent?.trim() || '',
            runs: walkInlineNodes(el),
          });
          break;

        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          elements.push({
            type: 'heading3',
            content: el.textContent?.trim() || '',
            runs: walkInlineNodes(el),
          });
          break;

        case 'p': {
          const runs = walkInlineNodes(el);
          const plainText = el.textContent?.trim() || '';
          if (plainText || runs.length > 0) {
            elements.push({ type: 'paragraph', content: plainText, runs });
          }
          break;
        }

        case 'ul': {
          const items: string[] = [];
          const richItems: InlineRun[][] = [];
          el.querySelectorAll(':scope > li').forEach((li) => {
            items.push(li.textContent?.trim() || '');
            richItems.push(walkInlineNodes(li));
          });
          elements.push({ type: 'bulletList', items, richItems });
          break;
        }

        case 'ol': {
          const items: string[] = [];
          const richItems: InlineRun[][] = [];
          el.querySelectorAll(':scope > li').forEach((li) => {
            items.push(li.textContent?.trim() || '');
            richItems.push(walkInlineNodes(li));
          });
          elements.push({ type: 'numberedList', items, richItems });
          break;
        }

        case 'table':
          elements.push({
            type: 'table',
            rows: extractTableRows(el),
          });
          break;

        case 'img': {
          const src = el.getAttribute('src');
          if (src) {
            elements.push({ type: 'image', src, alt: el.getAttribute('alt') || '' });
          }
          break;
        }

        case 'blockquote':
          elements.push({
            type: 'blockquote',
            content: el.textContent?.trim() || '',
            runs: walkInlineNodes(el),
          });
          break;

        case 'div':
        case 'section':
        case 'article':
          processNodes(el.childNodes, elements);
          break;

        case 'br':
          break;

        // Inline-only elements at block level — wrap in a paragraph
        case 'strong':
        case 'b':
        case 'em':
        case 'i':
        case 'u':
        case 'span':
        case 'a': {
          const runs = walkInlineNodes(el);
          const plainText = el.textContent?.trim() || '';
          if (plainText) {
            elements.push({ type: 'paragraph', content: plainText, runs });
          }
          break;
        }

        default: {
          const text = el.textContent?.trim() || '';
          if (text) {
            elements.push({ type: 'paragraph', content: text, runs: walkInlineNodes(el) });
          }
          break;
        }
      }
    }
  });
}

/**
 * Walk a DOM node's children and produce InlineRun[] preserving formatting context.
 * Handles nesting: <strong><em>text</em></strong> → { text, bold: true, italic: true }
 */
function walkInlineNodes(node: Node, inherited: Partial<InlineRun> = {}): InlineRun[] {
  const runs: InlineRun[] = [];

  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent || '';
      if (text) {
        runs.push({ text, ...inherited });
      }
    } else if (child.nodeType === Node.ELEMENT_NODE) {
      const el = child as Element;
      const tag = el.tagName.toLowerCase();
      const next: Partial<InlineRun> = { ...inherited };

      if (tag === 'strong' || tag === 'b') next.bold = true;
      if (tag === 'em' || tag === 'i') next.italic = true;
      if (tag === 'u') next.underline = true;
      if (tag === 's' || tag === 'del') next.strikethrough = true;
      if (tag === 'code') next.code = true;
      if (tag === 'a') next.link = el.getAttribute('href') || undefined;

      // For <br>, emit a newline run
      if (tag === 'br') {
        runs.push({ text: '\n', ...inherited });
        return;
      }

      runs.push(...walkInlineNodes(el, next));
    }
  });

  return runs;
}

// ---------------------------------------------------------------------------
// Markdown parsing (backward compat — produces plain content + runs)
// ---------------------------------------------------------------------------

function parseMarkdownContent(content: string): ParsedElement[] {
  const elements: ParsedElement[] = [];
  const normalizedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const blocks = normalizedContent.split(/\n\n+/);

  for (const block of blocks) {
    const trimmedBlock = block.trim();
    if (!trimmedBlock) continue;

    // Headers
    const headerMatch = trimmedBlock.match(/^(#{1,6})\s+(.+)$/m);
    if (headerMatch && trimmedBlock.startsWith('#')) {
      const level = headerMatch[1].length;
      const rawText = headerMatch[2];
      const plainText = stripMarkdownFormatting(rawText);
      const runs = parseMarkdownInline(rawText);
      const type = level === 1 ? 'heading1' : level === 2 ? 'heading2' : 'heading3';
      elements.push({ type, content: plainText, runs });
      continue;
    }

    // Bullet list
    if (/^[-*]\s/m.test(trimmedBlock)) {
      const { plain, rich } = parseMdBulletList(trimmedBlock);
      if (plain.length > 0) {
        elements.push({ type: 'bulletList', items: plain, richItems: rich });
        continue;
      }
    }

    // Numbered list
    if (/^\d+\.\s/m.test(trimmedBlock)) {
      const { plain, rich } = parseMdNumberedList(trimmedBlock);
      if (plain.length > 0) {
        elements.push({ type: 'numberedList', items: plain, richItems: rich });
        continue;
      }
    }

    // Blockquote
    if (trimmedBlock.startsWith('>')) {
      const rawText = trimmedBlock
        .split('\n')
        .map((line) => line.replace(/^>\s*/, ''))
        .join(' ')
        .trim();
      elements.push({
        type: 'blockquote',
        content: stripMarkdownFormatting(rawText),
        runs: parseMarkdownInline(rawText),
      });
      continue;
    }

    // Paragraph
    const rawText = trimmedBlock
      .split('\n')
      .map((line) => line.trim())
      .join(' ')
      .trim();

    if (rawText) {
      elements.push({
        type: 'paragraph',
        content: stripMarkdownFormatting(rawText),
        runs: parseMarkdownInline(rawText),
      });
    }
  }

  return elements;
}

/**
 * Parse markdown inline formatting into InlineRun[].
 * Handles **bold**, *italic*, `code`, [text](url).
 */
function parseMarkdownInline(text: string): InlineRun[] {
  const runs: InlineRun[] = [];
  // Regex to match inline patterns: bold, italic, code, links
  // Order matters: bold (**) before italic (*)
  const pattern = /(\*\*(.+?)\*\*|__(.+?)__|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)|(?<!\*)\*([^*\n]+?)\*(?!\*)|(?<!_)_([^_\n]+?)_(?!_))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    // Push plain text before this match
    if (match.index > lastIndex) {
      runs.push({ text: text.slice(lastIndex, match.index) });
    }

    if (match[2] !== undefined) {
      // **bold**
      runs.push({ text: match[2], bold: true });
    } else if (match[3] !== undefined) {
      // __bold__
      runs.push({ text: match[3], bold: true });
    } else if (match[4] !== undefined) {
      // `code`
      runs.push({ text: match[4], code: true });
    } else if (match[5] !== undefined && match[6] !== undefined) {
      // [text](url)
      runs.push({ text: match[5], link: match[6] });
    } else if (match[7] !== undefined) {
      // *italic*
      runs.push({ text: match[7], italic: true });
    } else if (match[8] !== undefined) {
      // _italic_
      runs.push({ text: match[8], italic: true });
    }

    lastIndex = match.index + match[0].length;
  }

  // Trailing plain text
  if (lastIndex < text.length) {
    runs.push({ text: text.slice(lastIndex) });
  }

  // If no matches at all, return single plain run
  if (runs.length === 0) {
    runs.push({ text });
  }

  return runs;
}

function parseMdBulletList(block: string): { plain: string[]; rich: InlineRun[][] } {
  const plain: string[] = [];
  const rich: InlineRun[][] = [];
  const lines = block.split('\n');
  let current = '';

  for (const line of lines) {
    const trimmed = line.trim();
    const listMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (listMatch) {
      if (current) {
        plain.push(stripMarkdownFormatting(current.trim()));
        rich.push(parseMarkdownInline(current.trim()));
      }
      current = listMatch[1];
    } else if (current && trimmed) {
      current += ' ' + trimmed;
    }
  }
  if (current) {
    plain.push(stripMarkdownFormatting(current.trim()));
    rich.push(parseMarkdownInline(current.trim()));
  }
  return { plain, rich };
}

function parseMdNumberedList(block: string): { plain: string[]; rich: InlineRun[][] } {
  const plain: string[] = [];
  const rich: InlineRun[][] = [];
  const lines = block.split('\n');
  let current = '';

  for (const line of lines) {
    const trimmed = line.trim();
    const listMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (listMatch) {
      if (current) {
        plain.push(stripMarkdownFormatting(current.trim()));
        rich.push(parseMarkdownInline(current.trim()));
      }
      current = listMatch[1];
    } else if (current && trimmed) {
      current += ' ' + trimmed;
    }
  }
  if (current) {
    plain.push(stripMarkdownFormatting(current.trim()));
    rich.push(parseMarkdownInline(current.trim()));
  }
  return { plain, rich };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function stripMarkdownFormatting(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/(?<!\*)\*([^*\n]+)\*(?!\*)/g, '$1')
    .replace(/(?<!_)_([^_\n]+)_(?!_)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
}

function extractTableRows(tableElement: Element): string[][] {
  const rows: string[][] = [];

  const theadRows = tableElement.querySelectorAll('thead tr');
  theadRows.forEach((tr) => {
    const cells: string[] = [];
    tr.querySelectorAll('th, td').forEach((cell) => {
      cells.push(cell.textContent?.trim() || '');
    });
    if (cells.length > 0) rows.push(cells);
  });

  const tbodyRows = tableElement.querySelectorAll('tbody tr');
  tbodyRows.forEach((tr) => {
    const cells: string[] = [];
    tr.querySelectorAll('td').forEach((cell) => {
      cells.push(cell.textContent?.trim() || '');
    });
    if (cells.length > 0) rows.push(cells);
  });

  if (rows.length === 0) {
    const directRows = tableElement.querySelectorAll('tr');
    directRows.forEach((tr) => {
      const cells: string[] = [];
      tr.querySelectorAll('th, td').forEach((cell) => {
        cells.push(cell.textContent?.trim() || '');
      });
      if (cells.length > 0) rows.push(cells);
    });
  }

  return rows;
}
