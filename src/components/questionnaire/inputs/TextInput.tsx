import React from 'react';
import { TextInputProps } from '../../../types/questionnaire';

/**
 * TextInput Component
 * Standard single-line text input with placeholder and character limit
 * WCAG 2.0 AA compliant
 */
export default function TextInput({
  value,
  onChange,
  placeholder,
  maxLength,
  autoFocus,
  id,
  'aria-describedby': ariaDescribedBy,
}: TextInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (maxLength && newValue.length > maxLength) return;
    onChange(newValue);
  };

  return (
    <div className="w-full">
      <input
        type="text"
        id={id}
        value={value}
        onChange={handleChange}
        placeholder={placeholder || 'Enter your answer...'}
        maxLength={maxLength}
        autoFocus={autoFocus}
        aria-describedby={ariaDescribedBy}
        className="
          w-full px-4 py-3
          border-2 border-gray-200 dark:border-gray-700
          rounded-xl
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-white
          placeholder-gray-400 dark:placeholder-gray-500
          focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
          transition-all duration-200
          text-base
          min-h-[48px]
        "
        style={{ fontSize: '16px' }} // Prevent iOS zoom
      />
      {maxLength && (
        <div className="flex justify-end mt-2">
          <span
            className={`text-xs ${
              value.length >= maxLength
                ? 'text-red-500'
                : value.length >= maxLength * 0.9
                ? 'text-amber-500'
                : 'text-gray-400 dark:text-gray-500'
            }`}
            aria-live="polite"
          >
            {value.length} / {maxLength}
          </span>
        </div>
      )}
    </div>
  );
}
