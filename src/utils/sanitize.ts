import DOMPurify from 'dompurify';

/**
 * Sanitize HTML string to prevent XSS attacks.
 * Allows safe formatting tags (headings, lists, links, tables, etc.)
 * but strips scripts, event handlers, and dangerous attributes.
 */
export function sanitizeHtml(dirty: string): string {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'hr',
      'strong', 'b', 'em', 'i', 'u', 's', 'mark', 'small', 'sub', 'sup',
      'ul', 'ol', 'li',
      'a', 'blockquote', 'pre', 'code',
      'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
      'div', 'span', 'img',
      'svg', 'path', 'circle', 'rect', 'line', 'polyline', 'polygon',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'title', 'alt', 'src', 'width', 'height',
      'class', 'id',
      'colspan', 'rowspan', 'scope',
      'viewBox', 'd', 'fill', 'stroke', 'stroke-width', 'cx', 'cy', 'r',
      'x', 'y', 'x1', 'y1', 'x2', 'y2', 'points',
    ],
    ALLOW_DATA_ATTR: false,
  });
}
