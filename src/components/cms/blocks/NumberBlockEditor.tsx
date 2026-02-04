import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { CmsContentBlock } from '@/lib/cms-types';
import { blockKeyToLabel, parseMetadata } from './utils';

interface BlockEditorProps {
  block: CmsContentBlock;
  onChange: (blockId: string, content: string, metadata?: string) => void;
  disabled?: boolean;
}

interface NumberMetadata {
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  helperText?: string;
}

/**
 * NumberBlockEditor
 *
 * A numeric input block editor with optional min/max/step constraints
 * and unit suffix display (e.g., "px", "%").
 * Content is always stored as a string representation of the number.
 */
export function NumberBlockEditor({ block, onChange, disabled }: BlockEditorProps) {
  const label = blockKeyToLabel(block.blockKey);
  const meta = parseMetadata<NumberMetadata>(block.metadata);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(block.id, e.target.value);
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor={`block-${block.id}`}>{label}</Label>
      <div className="relative">
        <Input
          id={`block-${block.id}`}
          type="number"
          value={block.content}
          onChange={handleChange}
          disabled={disabled}
          min={meta.min}
          max={meta.max}
          step={meta.step}
          className={cn(
            'bg-white dark:bg-gray-900',
            meta.unit && 'pr-12',
            disabled && 'cursor-not-allowed opacity-60'
          )}
        />
        {meta.unit && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
            {meta.unit}
          </span>
        )}
      </div>
      {meta.helperText && (
        <p className="text-xs text-muted-foreground">{meta.helperText}</p>
      )}
    </div>
  );
}

export default NumberBlockEditor;
