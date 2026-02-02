import React, { useCallback, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Bold,
  Italic,
  Underline,
  Link,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Pencil,
  Sparkles,
  GripHorizontal,
  type LucideIcon,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Format command types supported by the toolbar
 */
export type FormatCommand =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'link'
  | 'insertUnorderedList'
  | 'insertOrderedList'
  | 'heading1'
  | 'heading2'
  | 'quote';

interface ToolbarButton {
  icon: LucideIcon;
  command: FormatCommand;
  label: string;
  shortcut?: string;
}

interface FloatingToolbarProps {
  /** Position of the toolbar (x, y coordinates) */
  position: { x: number; y: number };
  /** Callback when a format command is applied */
  onFormat?: (command: FormatCommand) => void;
  /** Whether the toolbar is visible */
  isVisible: boolean;
  /** Callback when user clicks "Edit selection"; parent saves range and shows edit popover */
  onEditSelection?: () => void;
  /** Callback when user clicks "AI assist selection"; parent saves range and calls API */
  onAIAssistSelection?: () => void;
  /** Whether AI assist is loading (e.g. show spinner on button) */
  isAIAssistLoading?: boolean;
  /** Labels for selection actions (for a11y and tooltips) */
  editSelectionLabel?: string;
  aiAssistSelectionLabel?: string;
}

/**
 * Available formatting tools
 */
const TOOLS: ToolbarButton[] = [
  { icon: Bold, command: 'bold', label: 'Bold', shortcut: 'Ctrl+B' },
  { icon: Italic, command: 'italic', label: 'Italic', shortcut: 'Ctrl+I' },
  { icon: Underline, command: 'underline', label: 'Underline', shortcut: 'Ctrl+U' },
  { icon: Link, command: 'link', label: 'Link', shortcut: 'Ctrl+K' },
  { icon: List, command: 'insertUnorderedList', label: 'Bullet List' },
  { icon: ListOrdered, command: 'insertOrderedList', label: 'Numbered List' },
  { icon: Heading1, command: 'heading1', label: 'Heading 1' },
  { icon: Heading2, command: 'heading2', label: 'Heading 2' },
  { icon: Quote, command: 'quote', label: 'Quote' },
];

/**
 * Execute a format command on the current selection
 */
function executeCommand(command: FormatCommand): void {
  switch (command) {
    case 'heading1':
      document.execCommand('formatBlock', false, 'h2');
      break;
    case 'heading2':
      document.execCommand('formatBlock', false, 'h3');
      break;
    case 'quote':
      document.execCommand('formatBlock', false, 'blockquote');
      break;
    case 'link': {
      const selection = window.getSelection();
      const selectedText = selection?.toString() || '';
      const url = prompt('Enter URL:', 'https://');
      if (url) {
        document.execCommand('createLink', false, url);
        // If no text was selected, we need to insert the link with the URL as text
        if (!selectedText && selection && selection.anchorNode) {
          const linkElement = selection.anchorNode.parentElement;
          if (linkElement?.tagName === 'A') {
            linkElement.textContent = url;
          }
        }
      }
      break;
    }
    default:
      document.execCommand(command, false);
  }
}

/**
 * FloatingToolbar Component
 * A floating toolbar that appears on text selection for formatting
 */
export function FloatingToolbar({
  position,
  onFormat,
  isVisible,
  onEditSelection,
  onAIAssistSelection,
  isAIAssistLoading = false,
  editSelectionLabel = 'Edit selection',
  aiAssistSelectionLabel = 'AI assist selection',
}: FloatingToolbarProps) {
  const handleClick = useCallback(
    (command: FormatCommand) => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      executeCommand(command);
      onFormat?.(command);
    },
    [onFormat]
  );

  const handleEditSelection = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onEditSelection?.();
    },
    [onEditSelection]
  );

  const handleAIAssistSelection = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isAIAssistLoading) onAIAssistSelection?.();
    },
    [onAIAssistSelection, isAIAssistLoading]
  );

  // Drag state: offset from selection-based position so user can move the toolbar
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, offsetX: 0, offsetY: 0 });

  // Reset drag offset when position changes (e.g. new selection)
  useEffect(() => {
    setDragOffset({ x: 0, y: 0 });
  }, [position.x, position.y]);

  // Dragging: update offset on mousemove, clear on mouseup
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - dragStartRef.current.mouseX + dragStartRef.current.offsetX;
      const dy = e.clientY - dragStartRef.current.mouseY + dragStartRef.current.offsetY;
      setDragOffset({ x: dx, y: dy });
    };
    const onMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const handleDragHandleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isDraggingRef.current = true;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      offsetX: dragOffset.x,
      offsetY: dragOffset.y,
    };
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  }, [dragOffset.x, dragOffset.y]);

  // Prevent losing selection on mousedown (on buttons), but not on drag handle
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-drag-handle]')) return;
    e.preventDefault();
  }, []);

  const showSelectionActions = onEditSelection != null || onAIAssistSelection != null;

  const displayX = position.x + dragOffset.x;
  const displayY = position.y + dragOffset.y;

  const toolbarContent = (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="fixed z-50 floating-toolbar"
          style={{
            left: displayX,
            top: displayY,
            transform: 'translate(-50%, -100%)',
          }}
          onMouseDown={handleMouseDown}
        >
          {/* Drag handle: user can move the toolbar */}
          <div
            data-drag-handle
            role="button"
            tabIndex={0}
            onMouseDown={handleDragHandleMouseDown}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') e.preventDefault(); }}
            aria-label="Drag to move toolbar"
            className="flex items-center justify-center py-1 cursor-grab active:cursor-grabbing rounded-t-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 touch-none"
          >
            <GripHorizontal className="h-4 w-4 text-gray-400 dark:text-gray-500" aria-hidden="true" />
          </div>
          <div className="flex items-center gap-0.5 px-2 py-1.5 bg-white dark:bg-gray-800 rounded-b-lg rounded-t-none shadow-xl border border-gray-200 dark:border-gray-700 border-t-0">
            {TOOLS.map(({ icon: Icon, command, label, shortcut }) => (
              <React.Fragment key={command}>
                {(command === 'insertUnorderedList' || command === 'heading1') && (
                  <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
                )}

                <button
                  onClick={handleClick(command)}
                  className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                  title={shortcut ? `${label} (${shortcut})` : label}
                  aria-label={label}
                >
                  <Icon size={16} aria-hidden="true" />
                </button>
              </React.Fragment>
            ))}

            {showSelectionActions && (
              <>
                <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
                {onEditSelection != null && (
                  <button
                    onClick={handleEditSelection}
                    className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                    title={editSelectionLabel}
                    aria-label={editSelectionLabel}
                  >
                    <Pencil size={16} aria-hidden="true" />
                  </button>
                )}
                {onAIAssistSelection != null && (
                  <button
                    onClick={handleAIAssistSelection}
                    disabled={isAIAssistLoading}
                    className="p-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title={aiAssistSelectionLabel}
                    aria-label={aiAssistSelectionLabel}
                  >
                    {isAIAssistLoading ? (
                      <span className="inline-block w-4 h-4 border-2 border-momentum-orange border-t-transparent rounded-full animate-spin" aria-hidden />
                    ) : (
                      <Sparkles size={16} aria-hidden="true" />
                    )}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Arrow pointing down */}
          <div className="absolute left-1/2 top-full -translate-x-1/2 -mt-1">
            <div className="w-3 h-3 rotate-45 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // Render in portal so position:fixed is relative to viewport (works correctly inside transformed parents)
  return typeof document !== 'undefined' ? createPortal(toolbarContent, document.body) : null;
}

export default FloatingToolbar;
