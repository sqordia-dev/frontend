import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface TextFieldProps {
  /** Label for the input */
  label?: string;
  /** Current value */
  value: string;
  /** Callback when value changes */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Optional description/helper text */
  description?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Whether the field is required */
  required?: boolean;
  /** Input type */
  type?: 'text' | 'email' | 'tel' | 'url' | 'number' | 'date' | 'password';
  /** Use textarea instead of input */
  multiline?: boolean;
  /** Number of rows for textarea */
  rows?: number;
  /** Maximum length */
  maxLength?: number;
  /** Additional class names */
  className?: string;
  /** Error message */
  error?: string;
}

/**
 * TextField - A reusable text input component with label and validation
 */
export function TextField({
  label,
  value,
  onChange,
  placeholder,
  description,
  disabled = false,
  required = false,
  type = 'text',
  multiline = false,
  rows = 3,
  maxLength,
  className,
  error,
}: TextFieldProps) {
  const id = React.useId();

  const commonProps = {
    id,
    value,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange(e.target.value),
    placeholder,
    disabled,
    maxLength,
    className: cn(
      error && 'border-red-500 focus:ring-red-500'
    ),
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label
          htmlFor={id}
          className={cn(
            'text-sm font-medium',
            disabled ? 'text-gray-400 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </Label>
      )}

      {multiline ? (
        <Textarea {...commonProps} rows={rows} />
      ) : (
        <Input {...commonProps} type={type} />
      )}

      {/* Character count for maxLength */}
      {maxLength && (
        <div className="flex justify-between">
          {description ? (
            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
          ) : (
            <span />
          )}
          <span className={cn(
            'text-xs',
            value.length >= maxLength ? 'text-red-500' : 'text-gray-400'
          )}>
            {value.length}/{maxLength}
          </span>
        </div>
      )}

      {/* Description (only if no maxLength) */}
      {description && !maxLength && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      )}

      {/* Error message */}
      {error && (
        <p className="text-xs text-red-500">{error}</p>
      )}
    </div>
  );
}

export default TextField;
