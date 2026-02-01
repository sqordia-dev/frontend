/**
 * Rich Text Editor Components
 *
 * Exports the Tiptap-based rich text editor and its sub-components.
 *
 * Usage:
 * ```tsx
 * import { RichTextEditor } from '@/components/editor';
 *
 * <RichTextEditor
 *   content={htmlContent}
 *   onChange={setHtmlContent}
 *   placeholder="Start writing..."
 * />
 * ```
 */

export { RichTextEditor } from './RichTextEditor';
export { EditorToolbar } from './EditorToolbar';
export { ToolbarButton } from './ToolbarButton';
export { ToolbarDivider } from './ToolbarDivider';

// Default export for convenience
export { RichTextEditor as default } from './RichTextEditor';
