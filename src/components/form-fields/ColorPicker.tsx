import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  /** Label for the color picker */
  label?: string;
  /** Current color value (hex) */
  value: string;
  /** Callback when color changes */
  onChange: (color: string) => void;
  /** Optional description */
  description?: string;
  /** Whether the field is disabled */
  disabled?: boolean;
  /** Additional class names */
  className?: string;
  /** Show color preview square */
  showPreview?: boolean;
  /** Preset colors to show as quick select */
  presets?: string[];
}

const DEFAULT_PRESETS = [
  '#FF6B00', // momentum-orange
  '#2563EB', // blue
  '#1A2B47', // navy
  '#10B981', // emerald
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#F59E0B', // amber
  '#EF4444', // red
  '#6B7280', // gray
  '#000000', // black
  '#FFFFFF', // white
];

/**
 * ColorPicker - A reusable color picker component with hex input and presets
 */
export function ColorPicker({
  label,
  value,
  onChange,
  description,
  disabled = false,
  className,
  showPreview = true,
  presets = DEFAULT_PRESETS,
}: ColorPickerProps) {
  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let hex = e.target.value;
    // Allow typing without # prefix but ensure it's valid
    if (!hex.startsWith('#')) {
      hex = '#' + hex;
    }
    onChange(hex);
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </Label>
      )}

      <div className="flex items-center gap-3">
        {/* Color input (native picker) */}
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className={cn(
              'w-10 h-10 p-0.5 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer',
              'focus:ring-2 focus:ring-momentum-orange focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          />
          {showPreview && (
            <div
              className="absolute inset-1 rounded pointer-events-none"
              style={{ backgroundColor: value }}
            />
          )}
        </div>

        {/* Hex input */}
        <Input
          type="text"
          value={value}
          onChange={handleHexChange}
          disabled={disabled}
          className="flex-1 font-mono text-sm uppercase"
          placeholder="#000000"
          maxLength={7}
        />
      </div>

      {/* Preset colors */}
      {presets.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onChange(preset)}
              disabled={disabled}
              className={cn(
                'w-6 h-6 rounded-md border-2 transition-all',
                'hover:scale-110 focus:outline-none focus:ring-2 focus:ring-momentum-orange focus:ring-offset-1',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                value.toLowerCase() === preset.toLowerCase()
                  ? 'border-momentum-orange ring-2 ring-momentum-orange/30'
                  : 'border-gray-300 dark:border-gray-600'
              )}
              style={{ backgroundColor: preset }}
              title={preset}
            />
          ))}
        </div>
      )}

      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      )}
    </div>
  );
}

export default ColorPicker;
