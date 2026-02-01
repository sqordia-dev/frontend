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
}: SliderFieldProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </Label>
          )}
          {showValue && (
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {value}{valueSuffix}
            </span>
          )}
        </div>
      )}

      <Slider
        value={[value]}
        onValueChange={([newValue]) => onChange(newValue)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        className={cn(disabled && 'opacity-50')}
      />

      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      )}
    </div>
  );
}

export default SliderField;
