import React, { useCallback } from 'react';
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

  // Prevent losing selection on mousedown
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="fixed z-50"
          style={{
            left: position.x,
            top: position.y,
            transform: 'translate(-50%, -100%)',
          }}
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-0.5 px-2 py-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
            {TOOLS.map(({ icon: Icon, command, label, shortcut }, index) => (
              <React.Fragment key={command}>
                {/* Add separator before list items and headings */}
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
          </div>

          {/* Arrow pointing down */}
          <div className="absolute left-1/2 top-full -translate-x-1/2 -mt-1">
            <div className="w-3 h-3 rotate-45 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default FloatingToolbar;
