import React from 'react';
import { Check } from 'lucide-react';
import { SelectInputProps } from '../../../types/questionnaire';

/**
 * SelectInput Component
 * Radio-style cards for single selection
 * WCAG 2.0 AA compliant with proper focus states
 */
export default function SelectInput({
  value,
  onChange,
  options,
  id,
  'aria-describedby': ariaDescribedBy,
}: SelectInputProps) {
  const handleKeyDown = (e: React.KeyboardEvent, optionValue: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onChange(optionValue);
    }
  };

  return (
    <div
      role="radiogroup"
      aria-describedby={ariaDescribedBy}
      className="space-y-3"
    >
      {options.map((option, index) => {
        const isSelected = value === option.value;
        const optionId = `${id}-option-${index}`;

        return (
          <label
            key={option.value}
            htmlFor={optionId}
            className={`
              relative flex items-center p-4 rounded-xl border-2 cursor-pointer
              transition-all duration-200
              min-h-[56px]
              ${
                isSelected
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
              }
              focus-within:ring-2 focus-within:ring-orange-500 focus-within:ring-offset-2
            `}
            onKeyDown={(e) => handleKeyDown(e, option.value)}
          >
            <input
              type="radio"
              id={optionId}
              name={id}
              value={option.value}
              checked={isSelected}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />

            {/* Custom radio indicator */}
            <div
              className={`
                flex-shrink-0 w-6 h-6 rounded-full border-2 mr-4
                flex items-center justify-center
                transition-all duration-200
                ${
                  isSelected
                    ? 'border-orange-500 bg-orange-500'
                    : 'border-gray-300 dark:border-gray-600'
                }
              `}
            >
              {isSelected && <Check size={14} className="text-white" />}
            </div>

            {/* Option content */}
            <div className="flex-1 min-w-0">
              <span
                className={`
                  block font-medium text-base
                  ${
                    isSelected
                      ? 'text-orange-900 dark:text-orange-100'
                      : 'text-gray-900 dark:text-white'
                  }
                `}
              >
                {option.label}
              </span>
              {option.description && (
                <span
                  className={`
                    block text-sm mt-0.5
                    ${
                      isSelected
                        ? 'text-orange-700 dark:text-orange-300'
                        : 'text-gray-500 dark:text-gray-400'
                    }
                  `}
                >
                  {option.description}
                </span>
              )}
            </div>

            {/* Selected indicator */}
            {isSelected && (
              <div className="flex-shrink-0 ml-4">
                <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center">
                  <Check size={18} className="text-white" />
                </div>
              </div>
            )}
          </label>
        );
      })}
    </div>
  );
}
