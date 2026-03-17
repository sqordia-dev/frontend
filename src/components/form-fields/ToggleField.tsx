import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ToggleFieldProps {
  /** Label for the toggle */
  label: string;
  /** Current value */
  checked: boolean;
  /** Callback when value changes */
  onChange: (checked: boolean) => void;
  /** Optional description */
  description?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
  /** Error message */
  error?: string;
}

/**
 * ToggleField - A labeled switch/toggle component
 */
export function ToggleField({
  label,
  checked,
  onChange,
  description,
  disabled = false,
  className,
  error,
}: ToggleFieldProps) {
  const id = React.useId();
  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-0.5">
          <Label
            htmlFor={id}
            className={cn(
              'text-sm font-medium',
              disabled ? 'text-gray-400 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'
            )}
          >
            {label}
          </Label>
          {description && (
            <p id={descriptionId} className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
          )}
        </div>
        <Switch
          id={id}
          checked={checked}
          onCheckedChange={onChange}
          disabled={disabled}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? errorId : description ? descriptionId : undefined}
        />
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

export default ToggleField;
