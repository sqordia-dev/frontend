import { ReactNode, useState } from 'react';

interface ToolbarButtonProps {
  /** Click handler */
  onClick: () => void;
  /** Whether the button represents an active state */
  isActive?: boolean;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Tooltip text to show on hover */
  tooltip?: string;
  /** Button children (typically an icon) */
  children: ReactNode;
  /** Accessible label for screen readers */
  'aria-label': string;
}

/**
 * Individual toolbar button with tooltip
 * Features active state highlighting, disabled state, and focus states
 * WCAG 2.0 compliant with aria-label and aria-pressed attributes
 */
export function ToolbarButton({
  onClick,
  isActive = false,
  disabled = false,
  tooltip,
  children,
  'aria-label': ariaLabel,
}: ToolbarButtonProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-pressed={isActive}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className={`
          p-2 rounded transition-colors
          focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-1
          ${isActive
            ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
          }
          ${disabled
            ? 'opacity-50 cursor-not-allowed'
            : 'cursor-pointer'
          }
        `}
      >
        {children}
      </button>

      {/* Tooltip */}
      {tooltip && showTooltip && !disabled && (
        <div
          role="tooltip"
          className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 dark:bg-gray-700 rounded shadow-lg whitespace-nowrap pointer-events-none"
        >
          {tooltip}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700" />
        </div>
      )}
    </div>
  );
}

export default ToolbarButton;
