import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface SliderFieldProps {
  /** Label for the slider */
  label?: string;
  /** Current value */
  value: number;
  /** Callback when value changes */
  onChange: (value: number) => void;
  /** Minimum value */
  min?: number;
  /** Maximum value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Optional description */
  description?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Show value display */
  showValue?: boolean;
  /** Value suffix (e.g., 'px', '%') */
  valueSuffix?: string;
  /** Additional class names */
  className?: string;
  /** Error message */
  error?: string;
}

/**
 * SliderField - A labeled slider component with optional value display
 */
export function SliderField({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  description,
  disabled = false,
  showValue = true,
  valueSuffix = '',
  className,
  error,
}: SliderFieldProps) {
  const id = React.useId();
  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;

  return (
    <div className={cn('space-y-3', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <Label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </Label>
          )}
          {showValue && (
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400" aria-live="polite">
              {value}{valueSuffix}
            </span>
          )}
        </div>
      )}

      <Slider
        id={id}
        value={[value]}
        onValueChange={([newValue]) => onChange(newValue)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        aria-label={label}
        aria-invalid={!!error || undefined}
        aria-describedby={error ? errorId : description ? descriptionId : undefined}
        className={cn(disabled && 'opacity-50')}
      />

      {description && (
        <p id={descriptionId} className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      )}

      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

export default SliderField;
