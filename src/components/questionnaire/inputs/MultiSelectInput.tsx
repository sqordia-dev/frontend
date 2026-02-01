import React from 'react';
import { Check, Square, CheckSquare } from 'lucide-react';
import { MultiSelectInputProps } from '../../../types/questionnaire';

/**
 * MultiSelectInput Component
 * Checkbox-style cards for multiple selection
 * WCAG 2.0 AA compliant with proper focus states
 */
export default function MultiSelectInput({
  value,
  onChange,
  options,
  id,
  'aria-describedby': ariaDescribedBy,
}: MultiSelectInputProps) {
  const handleToggle = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter((v) => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent, optionValue: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle(optionValue);
    }
  };

  return (
    <div
      role="group"
      aria-describedby={ariaDescribedBy}
      className="space-y-3"
    >
      {/* Selected count indicator */}
      {value.length > 0 && (
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          {value.length} selected
        </div>
      )}

      {options.map((option, index) => {
        const isSelected = value.includes(option.value);
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
              type="checkbox"
              id={optionId}
              name={`${id}[]`}
              value={option.value}
              checked={isSelected}
              onChange={() => handleToggle(option.value)}
              className="sr-only"
            />

            {/* Custom checkbox indicator */}
            <div
              className={`
                flex-shrink-0 w-6 h-6 rounded-md border-2 mr-4
                flex items-center justify-center
                transition-all duration-200
                ${
                  isSelected
                    ? 'border-orange-500 bg-orange-500'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
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

            {/* Checkbox icon on the right */}
            <div className="flex-shrink-0 ml-4">
              {isSelected ? (
                <CheckSquare
                  size={24}
                  className="text-orange-500"
                  aria-hidden="true"
                />
              ) : (
                <Square
                  size={24}
                  className="text-gray-300 dark:text-gray-600"
                  aria-hidden="true"
                />
              )}
            </div>
          </label>
        );
      })}
    </div>
  );
}
