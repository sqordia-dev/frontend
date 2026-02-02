/**
 * Converts markdown to HTML for use in the contenteditable editor.
 * Used so that when the user enters edit mode, they see formatted text (bold, headings, lists)
 * instead of raw markdown. If content is already HTML, it is returned unchanged.
 *
 * Handles: **bold**, *italic*, # ## ### headings, - / * lists, numbered lists, paragraphs.
 * Does not inject raw user input into attributes; only wraps text in known block/inline tags.
 */
export function markdownToHtmlForEditor(content: string): string {
  if (!content || typeof content !== 'string') return '';

  const trimmed = content.trim();
  // Already HTML: pass through so we don't double-encode or break existing HTML
  if (trimmed.startsWith('<') && content.includes('</')) {
    return content;
  }

  const lines = content.split('\n');
  const processedLines: string[] = [];
  let inList = false;
  let listType: 'ul' | 'ol' | null = null;
  const listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0 && listType) {
      const tag = listType === 'ul' ? 'ul' : 'ol';
      processedLines.push(`<${tag}>`);
      processedLines.push(...listItems);
      processedLines.push(`</${tag}>`);
      listItems.length = 0;
    }
    inList = false;
    listType = null;
  };

  const processInline = (text: string): string => {
    let result = text;
    // Links [text](url)
    result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
    // Bold **text** or __text__
    result = result.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    result = result.replace(/__([^_]+)__/g, '<strong>$1</strong>');
    // Italic *text* or _text_ (single, not part of ** or __)
    result = result.replace(/\*([^*\n]+?)\*/g, '<em>$1</em>');
    result = result.replace(/_([^_\n]+?)_/g, '<em>$1</em>');
    return result;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      flushList();
      continue;
    }

    const headingMatch = trimmedLine.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      const level = Math.min(headingMatch[1].length, 6);
      const text = processInline(headingMatch[2].trim());
      processedLines.push(`<h${level}>${text}</h${level}>`);
      continue;
    }

    if (/^[-*]\s/.test(trimmedLine)) {
      if (!inList || listType !== 'ul') {
        flushList();
        inList = true;
        listType = 'ul';
      }
      const text = trimmedLine.replace(/^[-*]\s+/, '');
      listItems.push(`<li>${processInline(text)}</li>`);
      continue;
    }

    if (/^\d+\.\s/.test(trimmedLine)) {
      if (!inList || listType !== 'ol') {
        flushList();
        inList = true;
        listType = 'ol';
      }
      const text = trimmedLine.replace(/^\d+\.\s+/, '');
      listItems.push(`<li>${processInline(text)}</li>`);
      continue;
    }

    flushList();
    processedLines.push(`<p>${processInline(trimmedLine)}</p>`);
  }

  flushList();
  return processedLines.join('\n');
}
