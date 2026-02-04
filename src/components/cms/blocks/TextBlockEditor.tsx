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

interface TextMetadata {
  helperText?: string;
  maxLength?: number;
  placeholder?: string;
}

/**
 * TextBlockEditor
 *
 * A standard single-line text input block editor with character count display.
 * Reads optional helperText, maxLength, and placeholder from block metadata.
 */
export function TextBlockEditor({ block, onChange, disabled }: BlockEditorProps) {
  const label = blockKeyToLabel(block.blockKey);
  const meta = parseMetadata<TextMetadata>(block.metadata);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (meta.maxLength && value.length > meta.maxLength) return;
    onChange(block.id, value);
  };

  const charCount = block.content.length;
  const showCounter = meta.maxLength !== undefined;

  return (
    <div className="space-y-1.5">
      <Label htmlFor={`block-${block.id}`}>{label}</Label>
      <Input
        id={`block-${block.id}`}
        value={block.content}
        onChange={handleChange}
        disabled={disabled}
        placeholder={meta.placeholder || `Enter ${label.toLowerCase()}...`}
        maxLength={meta.maxLength}
        className={cn(
          'bg-white dark:bg-gray-900',
          disabled && 'cursor-not-allowed opacity-60'
        )}
      />
      <div className="flex items-center justify-between">
        {meta.helperText ? (
          <p className="text-xs text-muted-foreground">{meta.helperText}</p>
        ) : (
          <span />
        )}
        {showCounter && (
          <p
            className={cn(
              'text-xs tabular-nums',
              meta.maxLength && charCount >= meta.maxLength
                ? 'text-destructive'
                : 'text-muted-foreground'
            )}
          >
            {charCount}/{meta.maxLength}
          </p>
        )}
      </div>
    </div>
  );
}

export default TextBlockEditor;
