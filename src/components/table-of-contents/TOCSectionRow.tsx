import { ChevronRight } from 'lucide-react';

interface TOCSectionRowProps {
  /** Section number (1, 2, 3, etc.) */
  number: number;
  /** Section title */
  title: string;
  /** Whether this section is currently active/selected */
  isActive?: boolean;
  /** Click handler for navigation */
  onClick: () => void;
  /** Optional className for styling */
  className?: string;
}

/**
 * TOCSectionRow - Individual section row in the table of contents
 * Clickable row with number badge and chevron indicator
 */
export function TOCSectionRow({
  number,
  title,
  isActive = false,
  onClick,
  className = '',
}: TOCSectionRowProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center justify-between px-4 py-4
        border-b border-gray-100 dark:border-gray-700 last:border-b-0
        hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors
        focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500
        ${isActive ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-white dark:bg-gray-900'}
        ${className}
      `}
      aria-current={isActive ? 'true' : undefined}
    >
      <div className="flex items-center gap-4">
        <span
          className={`
            w-8 h-8 flex items-center justify-center rounded-full
            text-sm font-medium
            ${
              isActive
                ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
            }
          `}
        >
          {number}
        </span>
        <span
          className={`
            text-left
            ${
              isActive
                ? 'text-blue-700 dark:text-blue-300 font-medium'
                : 'text-gray-900 dark:text-gray-100'
            }
          `}
        >
          {title}
        </span>
      </div>
      <ChevronRight
        className={`
          h-5 w-5 flex-shrink-0
          ${isActive ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'}
        `}
        aria-hidden="true"
      />
    </button>
  );
}
