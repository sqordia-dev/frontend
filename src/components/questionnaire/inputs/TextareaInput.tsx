import React, { useRef, useEffect } from 'react';
import { TextareaInputProps } from '../../../types/questionnaire';

/**
 * TextareaInput Component
 * Multi-line text input with character count and auto-resize
 * WCAG 2.0 AA compliant
 */
export default function TextareaInput({
  value,
  onChange,
  placeholder,
  maxLength,
  autoFocus,
  rows = 4,
  id,
  'aria-describedby': ariaDescribedBy,
}: TextareaInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (maxLength && newValue.length > maxLength) return;
    onChange(newValue);
  };

  // Auto-resize textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(Math.max(textarea.scrollHeight, 120), 400);
      textarea.style.height = `${newHeight}px`;
    }
  }, [value]);

  // Focus on mount if autoFocus
  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const characterPercentage = maxLength ? (value.length / maxLength) * 100 : 0;
  const isNearLimit = characterPercentage >= 90;
  const isAtLimit = characterPercentage >= 100;

  return (
    <div className="w-full">
      <div className="relative">
        <textarea
          ref={textareaRef}
          id={id}
          value={value}
          onChange={handleChange}
          placeholder={placeholder || 'Share your thoughts...'}
          maxLength={maxLength}
          rows={rows}
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
            text-base leading-relaxed
            resize-none
            min-h-[120px]
          "
          style={{
            fontSize: '16px', // Prevent iOS zoom
            lineHeight: '1.75',
          }}
        />
      </div>

      {/* Character count */}
      {maxLength && (
        <div className="flex items-center justify-between mt-2">
          {/* Progress bar */}
          <div className="flex-1 mr-4">
            <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  isAtLimit
                    ? 'bg-red-500'
                    : isNearLimit
                    ? 'bg-amber-500'
                    : 'bg-orange-500'
                }`}
                style={{ width: `${Math.min(characterPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Character count text */}
          <span
            className={`text-xs font-medium ${
              isAtLimit
                ? 'text-red-500'
                : isNearLimit
                ? 'text-amber-500'
                : 'text-gray-400 dark:text-gray-500'
            }`}
            aria-live="polite"
          >
            {value.length.toLocaleString()} / {maxLength.toLocaleString()}
          </span>
        </div>
      )}

      {/* Word count for long text */}
      {!maxLength && value.length > 0 && (
        <div className="flex justify-end mt-2">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {value.split(/\s+/).filter(Boolean).length} words
          </span>
        </div>
      )}
    </div>
  );
}
