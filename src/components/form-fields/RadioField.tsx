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
}

/**
 * RadioField - A labeled radio group component
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
}: RadioFieldProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {label && (
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </Label>
      )}

      <RadioGroup
        value={value}
        onValueChange={onChange}
        disabled={disabled}
        className={cn(
          orientation === 'horizontal'
            ? 'flex flex-wrap gap-4'
            : 'grid gap-2'
        )}
      >
        {options.map((option) => (
          <div
            key={option.value}
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg border transition-colors cursor-pointer',
              value === option.value
                ? 'border-momentum-orange bg-orange-50 dark:bg-orange-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
            )}
            onClick={() => !disabled && onChange(option.value)}
          >
            <RadioGroupItem value={option.value} id={option.value} className="mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                {option.icon && (
                  <span className="text-gray-500 dark:text-gray-400">
                    {option.icon}
                  </span>
                )}
                <Label
                  htmlFor={option.value}
                  className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer"
                >
                  {option.label}
                </Label>
              </div>
              {option.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {option.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </RadioGroup>

      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      )}
    </div>
  );
}

export default RadioField;
