import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface SelectFieldProps {
  /** Label for the select */
  label?: string;
  /** Current value */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Available options */
  options: SelectOption[];
  /** Placeholder text */
  placeholder?: string;
  /** Optional description */
  description?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Additional class names */
  className?: string;
  /** Error message */
  error?: string;
}

/**
 * SelectField - A labeled select dropdown component
 */
export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  description,
  disabled = false,
  required = false,
  className,
  error,
}: SelectFieldProps) {
  const id = React.useId();
  const errorId = `${id}-error`;
  const descriptionId = `${id}-description`;

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label htmlFor={id} className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
        </Label>
      )}

      <Select value={value} onValueChange={onChange} disabled={disabled} required={required}>
        <SelectTrigger
          id={id}
          className={cn('w-full', error && 'border-red-500 focus:ring-red-500')}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? errorId : description ? descriptionId : undefined}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              className="flex items-center gap-2"
            >
              <div className="flex items-center gap-2">
                {option.icon && (
                  <span className="flex-shrink-0 text-gray-500" aria-hidden="true">
                    {option.icon}
                  </span>
                )}
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {description && (
        <p id={descriptionId} className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      )}

      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

export default SelectField;
