import React, { useRef, useCallback, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, Check, Undo2, Redo2, Loader2 } from 'lucide-react';
import { useInlineEdit } from '../../../hooks/useInlineEdit';
import { useTheme } from '../../../contexts/ThemeContext';
import { markdownToHtmlForEditor } from '../../../utils/markdown-to-html';
import { sanitizeHtml } from '../../../utils/sanitize';
import { SaveIndicator } from './SaveIndicator';
import { FloatingToolbar, FormatCommand } from './FloatingToolbar';
import { cn } from '../../../lib/utils';

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
  /** Callback for AI assist on selection: receives selected text, returns improved text */
  onAIAssistSelection?: (selectedText: string) => Promise<string>;
  /** Labels for toolbar selection actions */
  editSelectionLabel?: string;
  aiAssistSelectionLabel?: string;
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
  onAIAssistSelection,
  editSelectionLabel: editSelectionLabelProp,
  aiAssistSelectionLabel: aiAssistSelectionLabelProp,
}: EditableSectionProps) {
  const { t } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const editableRef = useRef<HTMLDivElement>(null);

  // Skip syncing state → DOM when the update came from user input (typing, format, replace)
  const contentUpdateFromInputRef = useRef(false);

  // Saved selection for Edit / AI assist (range is cloned when button is clicked)
  const savedRangeRef = useRef<Range | null>(null);
  const savedTextRef = useRef<string>('');

  // Floating toolbar state
  const [showToolbar, setShowToolbar] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });

  // Edit selection popover
  const [editPopoverOpen, setEditPopoverOpen] = useState(false);
  const [editPopoverValue, setEditPopoverValue] = useState('');
  const editPopoverPositionRef = useRef({ x: 0, y: 0 });

  // AI assist loading
  const [isAIAssistLoading, setIsAIAssistLoading] = useState(false);

  // Normalize content for editor: convert markdown to HTML so the contenteditable shows formatted text
  const initialContentForEditor = useMemo(
    () => markdownToHtmlForEditor(content),
    [content]
  );

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
    initialContent: initialContentForEditor,
    onSave,
    debounceMs,
    autosave,
  });

  // Set content once when entering edit mode and place cursor at end
  useEffect(() => {
    if (!isEditing) return;
    const el = editableRef.current;
    if (!el) return;
    el.innerHTML = sanitizeHtml(initialContentForEditor || placeholder);
    el.focus();
    const sel = window.getSelection();
    if (sel) {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [isEditing, initialContentForEditor, placeholder]);

  // Sync state → DOM only for undo/redo (not when update came from handleInput / replaceSelectionWith / handleFormat)
  useEffect(() => {
    if (!isEditing) return;
    const el = editableRef.current;
    if (!el) return;
    if (contentUpdateFromInputRef.current) {
      contentUpdateFromInputRef.current = false;
      return;
    }
    el.innerHTML = sanitizeHtml(editedContent || placeholder);
    const sel = window.getSelection();
    if (sel) {
      const range = document.createRange();
      range.selectNodeContents(el);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [isEditing, editedContent, placeholder]);

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
      contentUpdateFromInputRef.current = true;
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
        // Center above selection; clamp to viewport so toolbar stays on screen
        const toolbarWidth = 320;
        const toolbarHeight = 72; // includes drag handle
        const padding = 8;
        let x = rect.left + rect.width / 2;
        let y = rect.top - padding;
        x = Math.max(toolbarWidth / 2, Math.min(window.innerWidth - toolbarWidth / 2, x));
        y = Math.max(toolbarHeight + padding, y);
        setToolbarPosition({ x, y });
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

  // Replace saved selection with new text; fallback to string replace if range invalid
  const replaceSelectionWith = useCallback(
    (newText: string) => {
      const el = editableRef.current;
      if (!el) return;
      const range = savedRangeRef.current;
      const savedText = savedTextRef.current;
      try {
        if (range && savedText && (el.contains(range.startContainer) && el.contains(range.endContainer))) {
          const sel = window.getSelection();
          sel?.removeAllRanges();
          sel?.addRange(range);
          range.deleteContents();
          const textNode = document.createTextNode(newText);
          range.insertNode(textNode);
          range.collapse(false);
          sel?.removeAllRanges();
          sel?.addRange(range);
        } else if (savedText) {
          const html = el.innerHTML;
          const idx = html.indexOf(savedText);
          if (idx !== -1) {
            el.innerHTML = sanitizeHtml(html.slice(0, idx) + newText + html.slice(idx + savedText.length));
          }
        }
        contentUpdateFromInputRef.current = true;
        updateContent(el.innerHTML);
      } finally {
        savedRangeRef.current = null;
        savedTextRef.current = '';
      }
    },
    [updateContent]
  );

  // Edit selection: save range and text, show popover
  const handleEditSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !editableRef.current?.contains(sel.anchorNode)) return;
    savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    savedTextRef.current = sel.toString();
    setEditPopoverValue(savedTextRef.current);
    editPopoverPositionRef.current = { ...toolbarPosition };
    setEditPopoverOpen(true);
  }, [toolbarPosition]);

  // AI assist selection: save range and text, call API, replace with result
  const handleAIAssistSelection = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !editableRef.current?.contains(sel.anchorNode) || !onAIAssistSelection) return;
    savedRangeRef.current = sel.getRangeAt(0).cloneRange();
    savedTextRef.current = sel.toString();
    setIsAIAssistLoading(true);
    onAIAssistSelection(savedTextRef.current)
      .then((improved) => {
        replaceSelectionWith(improved);
        saveNow();
      })
      .catch(() => {
        savedRangeRef.current = null;
        savedTextRef.current = '';
      })
      .finally(() => setIsAIAssistLoading(false));
  }, [onAIAssistSelection, replaceSelectionWith, saveNow]);

  // Edit popover Apply: replace selection and close
  const handleEditPopoverApply = useCallback(() => {
    replaceSelectionWith(editPopoverValue);
    setEditPopoverOpen(false);
    setEditPopoverValue('');
    saveNow();
  }, [editPopoverValue, replaceSelectionWith, saveNow]);

  const handleEditPopoverCancel = useCallback(() => {
    setEditPopoverOpen(false);
    setEditPopoverValue('');
    savedRangeRef.current = null;
    savedTextRef.current = '';
  }, []);

  // Handle format command from toolbar
  const handleFormat = useCallback(
    (_command: FormatCommand) => {
      setTimeout(() => {
        if (editableRef.current) {
          contentUpdateFromInputRef.current = true;
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
      className={cn('relative group', className)}
      onClick={handleClick}
      onBlur={handleBlur}
    >
      {/* Subtle hover indicator - small edit icon only */}
      <AnimatePresence>
        {!isEditing && !disabled && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute -right-2 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10"
          >
            <div className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-warm-gray-500 dark:text-warm-gray-400 bg-white dark:bg-secondary rounded-md shadow-sm border border-warm-gray-200 dark:border-border">
              <Pencil size={11} aria-hidden="true" />
              <span className="hidden sm:inline">Edit</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle left border indicator on hover (like Notion) */}
      <div className={cn(
        'absolute -left-4 top-0 bottom-0 w-0.5 rounded-full transition-all duration-200',
        !isEditing && !disabled ? 'bg-transparent group-hover:bg-warm-gray-300 dark:group-hover:bg-border' : 'bg-transparent'
      )} />

      {/* Edit mode indicator - subtle warm border */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute -left-4 top-0 bottom-0 w-0.5 bg-momentum-orange rounded-full"
          />
        )}
      </AnimatePresence>

      {/* Floating Toolbar */}
      <FloatingToolbar
        position={toolbarPosition}
        onFormat={handleFormat}
        isVisible={showToolbar}
        onEditSelection={handleEditSelection}
        onAIAssistSelection={onAIAssistSelection ? handleAIAssistSelection : undefined}
        isAIAssistLoading={isAIAssistLoading}
        editSelectionLabel={editSelectionLabelProp ?? t('planView.editSelection')}
        aiAssistSelectionLabel={aiAssistSelectionLabelProp ?? t('planView.aiAssistSelection')}
      />

      {/* Edit selection popover */}
      <AnimatePresence>
        {editPopoverOpen && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'fixed z-50 p-3',
              'bg-white dark:bg-secondary',
              'rounded-xl shadow-elevated',
              'border border-warm-gray-200 dark:border-border'
            )}
            style={{
              left: editPopoverPositionRef.current.x,
              top: editPopoverPositionRef.current.y,
              transform: 'translate(-50%, -100%)',
              marginTop: -8,
            }}
          >
            <textarea
              value={editPopoverValue}
              onChange={(e) => setEditPopoverValue(e.target.value)}
              className={cn(
                'w-72 min-h-[80px] px-3 py-2 text-sm rounded-lg resize-y',
                'border border-warm-gray-200 dark:border-border',
                'bg-warm-gray-50 dark:bg-secondary',
                'text-warm-gray-900 dark:text-white',
                'placeholder:text-warm-gray-400',
                'focus:ring-2 focus:ring-momentum-orange/30 focus:border-momentum-orange',
                'focus:outline-none transition-colors'
              )}
              placeholder="Edit selection..."
              aria-label="Edit selection"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Escape') handleEditPopoverCancel();
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleEditPopoverApply();
                }
              }}
            />
            <div className="flex justify-end gap-2 mt-3">
              <button
                type="button"
                onClick={handleEditPopoverCancel}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                  'text-warm-gray-500 dark:text-warm-gray-400',
                  'hover:bg-warm-gray-100 dark:hover:bg-secondary'
                )}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEditPopoverApply}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                  'text-white bg-momentum-orange hover:bg-orange-600'
                )}
              >
                Apply
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content area: uncontrolled while editing so React does not overwrite DOM and lose cursor */}
      {isEditing ? (
        <motion.div
          initial={{ backgroundColor: 'transparent' }}
          animate={{ backgroundColor: 'rgba(255, 107, 0, 0.02)' }}
          transition={{ duration: 0.2 }}
          className="relative -mx-4 px-4 py-2 rounded-lg"
        >
          <div
            ref={editableRef}
            contentEditable
            suppressContentEditableWarning
            onInput={handleInput}
            className={cn(
              'prose-warm-content max-w-none outline-none cursor-text min-h-[100px]',
              'focus:outline-none'
            )}
            role="textbox"
            aria-multiline="true"
            aria-label="Edit section content"
          />
        </motion.div>
      ) : (
        <div className={cn(
          'transition-colors duration-200',
          !disabled && 'cursor-pointer'
        )}>
          {children}
        </div>
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

      {/* Edit mode action bar - Floating at bottom */}
      <AnimatePresence>
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className={cn(
              'flex items-center justify-between gap-3 mt-6 -mx-4 px-4 py-3',
              'bg-warm-gray-50 dark:bg-card/50',
              'border-t border-warm-gray-200 dark:border-border',
              'rounded-b-lg'
            )}
          >
            {/* Undo/Redo buttons */}
            <div className="flex items-center gap-0.5">
              <button
                onClick={undo}
                disabled={!canUndo}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  'text-warm-gray-400 dark:text-warm-gray-500',
                  'hover:text-warm-gray-600 dark:hover:text-warm-gray-300',
                  'hover:bg-warm-gray-100 dark:hover:bg-secondary',
                  'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent'
                )}
                title="Undo (Ctrl+Z)"
                aria-label="Undo"
              >
                <Undo2 size={16} aria-hidden="true" />
              </button>
              <button
                onClick={redo}
                disabled={!canRedo}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  'text-warm-gray-400 dark:text-warm-gray-500',
                  'hover:text-warm-gray-600 dark:hover:text-warm-gray-300',
                  'hover:bg-warm-gray-100 dark:hover:bg-secondary',
                  'disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent'
                )}
                title="Redo (Ctrl+Shift+Z)"
                aria-label="Redo"
              >
                <Redo2 size={16} aria-hidden="true" />
              </button>
            </div>

            {/* Status indicator */}
            <div className="flex-1 flex items-center justify-center">
              {saveState === 'saving' && (
                <span className="flex items-center gap-1.5 text-xs text-warm-gray-400">
                  <Loader2 size={12} className="animate-spin" />
                  Saving...
                </span>
              )}
              {saveState === 'saved' && (
                <span className="flex items-center gap-1.5 text-xs text-green-500">
                  <Check size={12} />
                  Saved
                </span>
              )}
              {isDirty && saveState === 'idle' && (
                <span className="text-xs text-warm-gray-400">
                  Unsaved changes
                </span>
              )}
            </div>

            {/* Save/Cancel buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCancel}
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-lg transition-colors',
                  'text-warm-gray-500 dark:text-warm-gray-400',
                  'hover:text-warm-gray-700 dark:hover:text-warm-gray-200',
                  'hover:bg-warm-gray-100 dark:hover:bg-secondary'
                )}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!isDirty || saveState === 'saving'}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-lg transition-colors',
                  'text-white bg-momentum-orange hover:bg-orange-600',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                <Check size={14} aria-hidden="true" />
                Done
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EditableSection;
