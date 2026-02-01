import React, { useRef, useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Pencil, X, Check, Undo2, Redo2 } from 'lucide-react';
import { useInlineEdit } from '../../../hooks/useInlineEdit';
import { SaveIndicator } from './SaveIndicator';
import { FloatingToolbar, FormatCommand } from './FloatingToolbar';

interface EditableSectionProps {
  /** The content to edit (HTML or plain text) */
  content: string;
  /** Callback to save the content */
  onSave: (content: string) => Promise<void>;
  /** Disable editing */
  disabled?: boolean;
  /** Debounce delay for autosave in ms (default: 2000) */
  debounceMs?: number;
  /** Whether to enable autosave (default: true) */
  autosave?: boolean;
  /** Children to render when not editing */
  children: React.ReactNode;
  /** Additional class names */
  className?: string;
  /** Placeholder when content is empty */
  placeholder?: string;
}

/**
 * EditableSection Component
 * Wraps content with click-to-edit functionality, showing edit indicators on hover
 * and providing inline text editing with save/cancel buttons.
 */
export function EditableSection({
  content,
  onSave,
  disabled = false,
  debounceMs = 2000,
  autosave = true,
  children,
  className = '',
  placeholder = 'Click to add content...',
}: EditableSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const editableRef = useRef<HTMLDivElement>(null);

  // Floating toolbar state
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });

  // Use the inline edit hook
  const {
    content: editedContent,
    isEditing,
    isDirty,
    saveState,
    error,
    startEditing,
    stopEditing,
    updateContent,
    saveNow,
    cancel,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useInlineEdit<string>({
    initialContent: content,
    onSave,
    debounceMs,
    autosave,
  });

  // Handle click to start editing
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (disabled) return;

      // Don't activate on button clicks within the editable area
      if ((e.target as HTMLElement).closest('button')) return;

      if (!isEditing) {
        startEditing();
        // Focus the editable area after a short delay
        setTimeout(() => {
          editableRef.current?.focus();
        }, 0);
      }
    },
    [disabled, isEditing, startEditing]
  );

  // Handle blur (clicking outside)
  const handleBlur = useCallback(
    (e: React.FocusEvent) => {
      // Don't deactivate if clicking within the container or toolbar
      const relatedTarget = e.relatedTarget as HTMLElement | null;
      if (containerRef.current?.contains(relatedTarget)) return;

      // Don't close if clicking on toolbar
      if (relatedTarget?.closest('.floating-toolbar')) return;

      // Stop editing and trigger save if dirty
      if (isEditing) {
        stopEditing();
        setShowToolbar(false);
      }
    },
    [isEditing, stopEditing]
  );

  // Handle content input changes
  const handleInput = useCallback(
    (e: React.FormEvent<HTMLDivElement>) => {
      const newContent = (e.target as HTMLDivElement).innerHTML;
      updateContent(newContent);
    },
    [updateContent]
  );

  // Handle selection change for floating toolbar
  const handleSelectionChange = useCallback(() => {
    if (!isEditing) return;

    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);

      // Check if selection is within our editable area
      if (editableRef.current?.contains(range.commonAncestorContainer)) {
        const rect = range.getBoundingClientRect();
        setToolbarPosition({
          x: rect.left + rect.width / 2,
          y: rect.top - 10,
        });
        setShowToolbar(true);
      }
    } else {
      setShowToolbar(false);
    }
  }, [isEditing]);

  // Listen for selection changes
  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [handleSelectionChange]);

  // Handle format command from toolbar
  const handleFormat = useCallback(
    (command: FormatCommand) => {
      // Update content after format is applied
      setTimeout(() => {
        if (editableRef.current) {
          updateContent(editableRef.current.innerHTML);
        }
      }, 0);
    },
    [updateContent]
  );

  // Handle save button click
  const handleSave = useCallback(async () => {
    await saveNow();
    stopEditing();
    setShowToolbar(false);
  }, [saveNow, stopEditing]);

  // Handle cancel button click
  const handleCancel = useCallback(() => {
    cancel();
    setShowToolbar(false);
  }, [cancel]);

  return (
    <div
      ref={containerRef}
      className={`relative group ${className}`}
      onClick={handleClick}
      onBlur={handleBlur}
    >
      {/* Hover indicator when not editing */}
      {!isEditing && !disabled && (
        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          <div className="absolute inset-0 border-2 border-dashed border-blue-300 dark:border-blue-600 rounded-lg" />
          <div className="absolute top-2 right-2 flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-md shadow-sm border border-blue-200 dark:border-blue-700">
            <Pencil size={12} aria-hidden="true" />
            Click to edit
          </div>
        </div>
      )}

      {/* Edit mode indicator (border) */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 rounded-lg ring-2 ring-blue-500 ring-opacity-50 pointer-events-none z-10"
        />
      )}

      {/* Floating Toolbar */}
      <FloatingToolbar
        position={toolbarPosition}
        onFormat={handleFormat}
        isVisible={showToolbar}
      />

      {/* Content area */}
      {isEditing ? (
        <div
          ref={editableRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleInput}
          className="prose prose-gray dark:prose-invert max-w-none outline-none cursor-text min-h-[100px]"
          dangerouslySetInnerHTML={{ __html: editedContent || placeholder }}
          role="textbox"
          aria-multiline="true"
          aria-label="Edit section content"
        />
      ) : (
        <div className={disabled ? '' : 'cursor-pointer'}>{children}</div>
      )}

      {/* Save Indicator */}
      {isEditing && (
        <SaveIndicator
          state={saveState}
          error={error}
          onRetry={saveNow}
          position="top-right"
        />
      )}

      {/* Edit mode action bar */}
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
        >
          {/* Undo/Redo buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={undo}
              disabled={!canUndo}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Undo (Ctrl+Z)"
              aria-label="Undo"
            >
              <Undo2 size={16} aria-hidden="true" />
            </button>
            <button
              onClick={redo}
              disabled={!canRedo}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Redo (Ctrl+Shift+Z)"
              aria-label="Redo"
            >
              <Redo2 size={16} aria-hidden="true" />
            </button>
          </div>

          {/* Save/Cancel buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X size={14} aria-hidden="true" />
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!isDirty || saveState === 'saving'}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <Check size={14} aria-hidden="true" />
              {saveState === 'saving' ? 'Saving...' : 'Save'}
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default EditableSection;
