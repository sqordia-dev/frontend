import React from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface RadioOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface RadioFieldProps {
  /** Label for the radio group */
  label?: string;
  /** Current value */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Available options */
  options: RadioOption[];
  /** Optional description */
  description?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Layout orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Additional class names */
  className?: string;
  /** Error message */
  error?: string;
}

/**
 * RadioField - A labeled radio group component wrapped in fieldset/legend for WCAG 1.3.1
 */
export function RadioField({
  label,
  value,
  onChange,
  options,
  description,
  disabled = false,
  orientation = 'vertical',
  className,
  error,
}: RadioFieldProps) {
  const id = React.useId();
  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;

  return (
    <fieldset className={cn('border-0 p-0 m-0', className)}>
      {label && (
        <legend className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {label}
        </legend>
      )}

      <RadioGroup
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? errorId : description ? descriptionId : undefined}
        className={cn(
          orientation === 'horizontal'
            ? 'flex flex-wrap gap-4'
            : 'grid gap-2'
        )}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer',
              value === option.value
                ? 'border-momentum-orange bg-orange-50 dark:bg-orange-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <RadioGroupItem value={option.value} id={`${id}-${option.value}`} className="mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {option.icon && (
                  <span className="text-gray-500 dark:text-gray-400" aria-hidden="true">
                    {option.icon}
                  </span>
                )}
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {option.label}
                </span>
              </div>
              {option.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {option.description}
                </p>
              )}
            </div>
          </label>
        ))}
      </RadioGroup>

      {description && (
        <p id={descriptionId} className="text-xs text-gray-500 dark:text-gray-400 mt-3">{description}</p>
      )}

      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-500 mt-2">{error}</p>
      )}
    </fieldset>
  );
}

export default RadioField;
