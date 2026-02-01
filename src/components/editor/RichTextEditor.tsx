import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import { useEffect, useMemo } from 'react';
import { EditorToolbar } from './EditorToolbar';

/**
 * Convert markdown text to HTML for Tiptap editor
 * Handles: bold, italic, headings, lists, blockquotes, links
 */
function markdownToHtml(markdown: string): string {
  if (!markdown) return '';

  const trimmed = markdown.trim();

  // If content already looks like HTML, convert any markdown headings mixed in
  if (trimmed.startsWith('<') && trimmed.includes('</')) {
    let result = markdown;
    // <p>### Heading</p> → <h3>Heading</h3>
    result = result.replace(/<p>\s*(#{1,6})\s+(.+?)\s*<\/p>/gi, (_m, h, t) => `<h${h.length}>${t}</h${h.length}>`);
    // <br>### Heading → </p><h3>Heading</h3><p>
    result = result.replace(/<br\s*\/?>\s*(#{1,6})\s+([^<\n]+)/gi, (_m, h, t) => `</p><h${h.length}>${t.trim()}</h${h.length}><p>`);
    // Bare headings on their own line
    result = result.replace(/^(#{1,6})\s+(.+)$/gm, (_m, h, t) => `<h${h.length}>${t}</h${h.length}>`);
    // Clean up empty tags
    result = result.replace(/<p>\s*<\/p>/g, '');
    result = result.replace(/<p>\s*<br\s*\/?>\s*<\/p>/g, '');
    return result;
  }

  // Check if content contains HTML-encoded entities that look like tags
  // This can happen if the API returns encoded HTML
  if (trimmed.includes('&lt;') && trimmed.includes('&gt;')) {
    // Decode HTML entities and return
    const decoded = markdown
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    return decoded;
  }

  let html = markdown;

  // Escape HTML entities first (but preserve existing HTML)
  html = html.replace(/&(?!amp;|lt;|gt;|quot;|#)/g, '&amp;');

  // Convert headings (most specific first: ###### to #)
  html = html.replace(/^###### (.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^##### (.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

  // Convert bold (**text** or __text__)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');

  // Convert italic (*text* or _text_) - but not inside URLs or already converted tags
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
  html = html.replace(/(?<!_)_([^_]+)_(?!_)/g, '<em>$1</em>');

  // Convert unordered lists (- item or * item)
  html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');

  // Convert ordered lists (1. item)
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

  // Wrap consecutive <li> items in <ul> or <ol>
  html = html.replace(/(<li>.*<\/li>\n?)+/g, (match) => {
    return '<ul>' + match.trim() + '</ul>';
  });

  // Convert blockquotes
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

  // Convert links [text](url)
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  // Convert line breaks to paragraphs
  // Split by double newlines for paragraphs
  const paragraphs = html.split(/\n\n+/);
  html = paragraphs
    .map((p) => {
      const trimmed = p.trim();
      // Don't wrap if already a block element
      if (
        trimmed.startsWith('<h') ||
        trimmed.startsWith('<ul') ||
        trimmed.startsWith('<ol') ||
        trimmed.startsWith('<blockquote') ||
        trimmed.startsWith('<p') ||
        trimmed.startsWith('<div')
      ) {
        return trimmed;
      }
      // Convert single newlines to <br> within paragraphs
      const withBreaks = trimmed.replace(/\n/g, '<br>');
      return withBreaks ? `<p>${withBreaks}</p>` : '';
    })
    .filter(Boolean)
    .join('');

  return html;
}

interface RichTextEditorProps {
  /** Initial HTML content */
  content: string;
  /** Callback when content changes */
  onChange: (content: string) => void;
  /** Placeholder text when editor is empty */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Whether the editor is disabled */
  disabled?: boolean;
}

/**
 * Rich text editor component built on Tiptap
 * Supports formatting: bold, italic, underline, strikethrough, headings, lists, blockquotes, links
 * WCAG 2.0 compliant with keyboard shortcuts and ARIA attributes
 */
export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing...',
  className = '',
  disabled = false,
}: RichTextEditorProps) {
  // Convert markdown to HTML for display
  const htmlContent = useMemo(() => markdownToHtml(content), [content]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300',
          rel: 'noopener noreferrer nofollow',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: htmlContent,
    editable: !disabled,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose-editor focus:outline-none min-h-[300px] p-4',
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': 'Rich text editor',
      },
    },
  });

  // Update content when it changes externally (e.g., AI Assist)
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    const currentHTML = editor.getHTML();
    const isEmpty = currentHTML === '' || currentHTML === '<p></p>';

    // If editor is empty but we have content to show, set it
    if (htmlContent && isEmpty) {
      editor.commands.setContent(htmlContent, false);
    }
    // If content differs from editor (e.g., AI assist update)
    else if (htmlContent && htmlContent !== currentHTML) {
      // Use setContent with emitUpdate to ensure proper HTML parsing
      editor.commands.setContent(htmlContent, true);
    }
  }, [htmlContent, editor]);

  // Update editable state when disabled changes
  useEffect(() => {
    if (editor) {
      editor.setEditable(!disabled);
    }
  }, [disabled, editor]);

  return (
    <div
      className={`border border-gray-300 dark:border-gray-600 rounded-lg flex flex-col overflow-hidden bg-white dark:bg-gray-900 ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      <EditorToolbar editor={editor} disabled={disabled} />
      <div className="flex-1 min-h-0 overflow-y-auto">
        <EditorContent
          editor={editor}
        />
      </div>
    </div>
  );
}

export default RichTextEditor;
