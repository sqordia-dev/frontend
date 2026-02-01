import React, { useCallback } from 'react';
import { SWOTData, VisualStyling } from '../../../types/visual-elements';

interface SWOTMatrixProps {
  data: SWOTData;
  styling?: VisualStyling;
  editable?: boolean;
  onDataChange?: (data: SWOTData) => void;
}

interface QuadrantConfig {
  key: keyof SWOTData;
  label: string;
  colorClasses: string;
  borderClasses: string;
  textColorClass: string;
}

const QUADRANT_CONFIG: QuadrantConfig[] = [
  {
    key: 'strengths',
    label: 'Strengths',
    colorClasses: 'bg-green-50 dark:bg-green-900/20',
    borderClasses: 'border-green-200 dark:border-green-800',
    textColorClass: 'text-green-700 dark:text-green-400',
  },
  {
    key: 'weaknesses',
    label: 'Weaknesses',
    colorClasses: 'bg-red-50 dark:bg-red-900/20',
    borderClasses: 'border-red-200 dark:border-red-800',
    textColorClass: 'text-red-700 dark:text-red-400',
  },
  {
    key: 'opportunities',
    label: 'Opportunities',
    colorClasses: 'bg-blue-50 dark:bg-blue-900/20',
    borderClasses: 'border-blue-200 dark:border-blue-800',
    textColorClass: 'text-blue-700 dark:text-blue-400',
  },
  {
    key: 'threats',
    label: 'Threats',
    colorClasses: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderClasses: 'border-yellow-200 dark:border-yellow-800',
    textColorClass: 'text-yellow-700 dark:text-yellow-600',
  },
];

/**
 * SWOT Matrix Component
 * Displays a 2x2 grid for Strengths, Weaknesses, Opportunities, and Threats analysis
 */
export function SWOTMatrix({
  data,
  styling,
  editable = false,
  onDataChange,
}: SWOTMatrixProps) {
  // Handle item change
  const handleItemChange = useCallback(
    (quadrantKey: keyof SWOTData, itemIndex: number, newValue: string) => {
      if (!onDataChange) return;

      const newItems = [...data[quadrantKey]];
      newItems[itemIndex] = newValue;

      onDataChange({ ...data, [quadrantKey]: newItems });
    },
    [data, onDataChange]
  );

  // Handle adding a new item
  const handleAddItem = useCallback(
    (quadrantKey: keyof SWOTData) => {
      if (!onDataChange) return;

      const newItems = [...data[quadrantKey], ''];
      onDataChange({ ...data, [quadrantKey]: newItems });
    },
    [data, onDataChange]
  );

  // Handle removing an item
  const handleRemoveItem = useCallback(
    (quadrantKey: keyof SWOTData, itemIndex: number) => {
      if (!onDataChange) return;

      const newItems = data[quadrantKey].filter((_, index) => index !== itemIndex);
      onDataChange({ ...data, [quadrantKey]: newItems });
    },
    [data, onDataChange]
  );

  // Get font size classes
  const getFontSizeClasses = () => {
    switch (styling?.fontSize) {
      case 'small':
        return { heading: 'text-sm', item: 'text-xs' };
      case 'large':
        return { heading: 'text-xl', item: 'text-base' };
      default:
        return { heading: 'text-lg', item: 'text-sm' };
    }
  };

  const fontSizes = getFontSizeClasses();

  return (
    <div className="my-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {QUADRANT_CONFIG.map((quadrant) => (
          <div
            key={quadrant.key}
            className={`${quadrant.colorClasses} rounded-xl p-5 border ${quadrant.borderClasses} transition-shadow hover:shadow-md`}
          >
            {/* Quadrant Header */}
            <h4
              className={`${fontSizes.heading} font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2`}
            >
              <QuadrantIcon quadrantKey={quadrant.key} />
              <span>{quadrant.label}</span>
              {editable && (
                <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
                  {data[quadrant.key].length} items
                </span>
              )}
            </h4>

            {/* Items List */}
            <ul className="space-y-2">
              {data[quadrant.key].map((item, itemIndex) => (
                <li
                  key={itemIndex}
                  className={`${fontSizes.item} text-gray-700 dark:text-gray-300 flex items-start gap-2 group`}
                >
                  <span className={`${quadrant.textColorClass} mt-0.5 flex-shrink-0`} aria-hidden="true">
                    &bull;
                  </span>
                  {editable ? (
                    <div className="flex-1 flex items-center gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleItemChange(quadrant.key, itemIndex, e.target.value)}
                        className="flex-1 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-600 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={`Enter ${quadrant.label.toLowerCase().slice(0, -1)}...`}
                        aria-label={`Edit ${quadrant.label} item ${itemIndex + 1}`}
                      />
                      <button
                        onClick={() => handleRemoveItem(quadrant.key, itemIndex)}
                        className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-all p-1 rounded"
                        aria-label={`Remove ${quadrant.label} item ${itemIndex + 1}`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <span>{item}</span>
                  )}
                </li>
              ))}

              {/* Empty State */}
              {data[quadrant.key].length === 0 && !editable && (
                <li className={`${fontSizes.item} text-gray-400 dark:text-gray-500 italic`}>
                  No {quadrant.label.toLowerCase()} identified
                </li>
              )}
            </ul>

            {/* Add Item Button */}
            {editable && (
              <button
                onClick={() => handleAddItem(quadrant.key)}
                className={`mt-3 ${fontSizes.item} ${quadrant.textColorClass} hover:underline flex items-center gap-1 transition-colors`}
                aria-label={`Add ${quadrant.label.slice(0, -1)}`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Add {quadrant.label.slice(0, -1)}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700" />
          <span>Internal - Positive</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700" />
          <span>Internal - Negative</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700" />
          <span>External - Positive</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700" />
          <span>External - Negative</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Quadrant Icon Component
 */
function QuadrantIcon({ quadrantKey }: { quadrantKey: keyof SWOTData }) {
  const iconClasses = 'w-5 h-5';

  switch (quadrantKey) {
    case 'strengths':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`${iconClasses} text-green-600 dark:text-green-400`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'weaknesses':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`${iconClasses} text-red-600 dark:text-red-400`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'opportunities':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`${iconClasses} text-blue-600 dark:text-blue-400`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
          <path
            fillRule="evenodd"
            d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
            clipRule="evenodd"
          />
        </svg>
      );
    case 'threats':
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`${iconClasses} text-yellow-600 dark:text-yellow-500`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z"
            clipRule="evenodd"
          />
        </svg>
      );
    default:
      return null;
  }
}

export default SWOTMatrix;
