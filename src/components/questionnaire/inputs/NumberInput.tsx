import React, { useState, useEffect } from 'react';
import { NumberInputProps } from '../../../types/questionnaire';

/**
 * NumberInput Component
 * Formatted number input with optional currency symbol
 * WCAG 2.0 AA compliant
 */
export default function NumberInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  prefix,
  suffix,
  placeholder,
  autoFocus,
  id,
  'aria-describedby': ariaDescribedBy,
}: NumberInputProps) {
  // Local state for formatted display value
  const [displayValue, setDisplayValue] = useState('');

  // Format number for display
  const formatNumber = (num: number | null): string => {
    if (num === null || isNaN(num)) return '';
    return num.toLocaleString('en-US', {
      maximumFractionDigits: step < 1 ? 2 : 0,
    });
  };

  // Parse display value to number
  const parseDisplayValue = (str: string): number | null => {
    const cleaned = str.replace(/[^0-9.-]/g, '');
    if (cleaned === '' || cleaned === '-') return null;
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  };

  // Sync display value with prop value
  useEffect(() => {
    setDisplayValue(formatNumber(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    setDisplayValue(input);

    const num = parseDisplayValue(input);

    // Validate bounds
    if (num !== null) {
      if (min !== undefined && num < min) return;
      if (max !== undefined && num > max) return;
    }

    onChange(num);
  };

  const handleBlur = () => {
    // Format on blur
    setDisplayValue(formatNumber(value));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow arrow keys to increment/decrement
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newValue = (value ?? 0) + step;
      if (max === undefined || newValue <= max) {
        onChange(newValue);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newValue = (value ?? 0) - step;
      if (min === undefined || newValue >= min) {
        onChange(newValue);
      }
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        {/* Prefix (e.g., currency symbol) */}
        {prefix && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium pointer-events-none">
            {prefix}
          </div>
        )}

        <input
          type="text"
          inputMode="decimal"
          id={id}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || 'Enter a number...'}
          autoFocus={autoFocus}
          aria-describedby={ariaDescribedBy}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value ?? undefined}
          className={`
            w-full py-3
            border-2 border-gray-200 dark:border-gray-700
            rounded-xl
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
            transition-all duration-200
            text-base text-right
            min-h-[48px]
            ${prefix ? 'pl-12' : 'pl-4'}
            ${suffix ? 'pr-16' : 'pr-4'}
          `}
          style={{ fontSize: '16px' }} // Prevent iOS zoom
        />

        {/* Suffix (e.g., unit) */}
        {suffix && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-medium pointer-events-none">
            {suffix}
          </div>
        )}
      </div>

      {/* Min/Max hint */}
      {(min !== undefined || max !== undefined) && (
        <div className="flex justify-end mt-2 text-xs text-gray-400 dark:text-gray-500">
          {min !== undefined && max !== undefined ? (
            <span>Range: {formatNumber(min)} - {formatNumber(max)}</span>
          ) : min !== undefined ? (
            <span>Minimum: {formatNumber(min)}</span>
          ) : (
            <span>Maximum: {formatNumber(max!)}</span>
          )}
        </div>
      )}
    </div>
  );
}
