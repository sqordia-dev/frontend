import { Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Minus,
  Quote,
  Link2,
  Undo2,
  Redo2,
} from 'lucide-react';
import { ToolbarButton } from './ToolbarButton';
import { ToolbarDivider } from './ToolbarDivider';
import { useCallback } from 'react';

interface EditorToolbarProps {
  /** The Tiptap editor instance */
  editor: Editor | null;
  /** Whether the toolbar is disabled */
  disabled?: boolean;
}

/**
 * Formatting toolbar for the rich text editor
 * Includes text formatting, headings, lists, blockquote, links, and undo/redo
 * All buttons have ARIA labels and keyboard shortcut tooltips
 */
export function EditorToolbar({ editor, disabled = false }: EditorToolbarProps) {
  const handleLinkInsert = useCallback(() => {
    if (!editor) return;

    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter URL:', previousUrl || 'https://');

    // Cancelled
    if (url === null) return;

    // Empty - remove link
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    // Set link
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800"
      role="toolbar"
      aria-label="Formatting options"
    >
      {/* Text Formatting */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive('bold')}
        disabled={disabled}
        tooltip="Bold (Ctrl+B)"
        aria-label="Toggle bold"
      >
        <Bold className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive('italic')}
        disabled={disabled}
        tooltip="Italic (Ctrl+I)"
        aria-label="Toggle italic"
      >
        <Italic className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive('underline')}
        disabled={disabled}
        tooltip="Underline (Ctrl+U)"
        aria-label="Toggle underline"
      >
        <Underline className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive('strike')}
        disabled={disabled}
        tooltip="Strikethrough (Ctrl+Shift+S)"
        aria-label="Toggle strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Headings */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor.isActive('heading', { level: 1 })}
        disabled={disabled}
        tooltip="Heading 1 (Ctrl+Alt+1)"
        aria-label="Toggle heading level 1"
      >
        <Heading1 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor.isActive('heading', { level: 2 })}
        disabled={disabled}
        tooltip="Heading 2 (Ctrl+Alt+2)"
        aria-label="Toggle heading level 2"
      >
        <Heading2 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        isActive={editor.isActive('heading', { level: 3 })}
        disabled={disabled}
        tooltip="Heading 3 (Ctrl+Alt+3)"
        aria-label="Toggle heading level 3"
      >
        <Heading3 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Lists */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        isActive={editor.isActive('bulletList')}
        disabled={disabled}
        tooltip="Bullet List (Ctrl+Shift+8)"
        aria-label="Toggle bullet list"
      >
        <List className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        isActive={editor.isActive('orderedList')}
        disabled={disabled}
        tooltip="Numbered List (Ctrl+Shift+7)"
        aria-label="Toggle numbered list"
      >
        <ListOrdered className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        disabled={disabled}
        tooltip="Horizontal Rule"
        aria-label="Insert horizontal rule"
      >
        <Minus className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* Block */}
      <ToolbarButton
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        isActive={editor.isActive('blockquote')}
        disabled={disabled}
        tooltip="Blockquote (Ctrl+Shift+B)"
        aria-label="Toggle blockquote"
      >
        <Quote className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={handleLinkInsert}
        isActive={editor.isActive('link')}
        disabled={disabled}
        tooltip="Insert Link (Ctrl+K)"
        aria-label="Insert or edit link"
      >
        <Link2 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarDivider />

      {/* History */}
      <ToolbarButton
        onClick={() => editor.chain().focus().undo().run()}
        disabled={disabled || !editor.can().undo()}
        tooltip="Undo (Ctrl+Z)"
        aria-label="Undo"
      >
        <Undo2 className="h-4 w-4" />
      </ToolbarButton>

      <ToolbarButton
        onClick={() => editor.chain().focus().redo().run()}
        disabled={disabled || !editor.can().redo()}
        tooltip="Redo (Ctrl+Y)"
        aria-label="Redo"
      >
        <Redo2 className="h-4 w-4" />
      </ToolbarButton>
    </div>
  );
}

export default EditorToolbar;
