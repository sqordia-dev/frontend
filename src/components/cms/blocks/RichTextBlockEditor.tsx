import React, { useRef, useCallback, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { CmsContentBlock } from '@/lib/cms-types';
import { blockKeyToLabel, parseMetadata } from './utils';

interface BlockEditorProps {
  block: CmsContentBlock;
  onChange: (blockId: string, content: string, metadata?: string) => void;
  disabled?: boolean;
}

interface RichTextMetadata {
  helperText?: string;
  placeholder?: string;
}

/**
 * RichTextBlockEditor
 *
 * A multiline textarea editor for markdown/rich text content.
 * Auto-resizes as content grows with a minimum height of 120px.
 */
export function RichTextBlockEditor({ block, onChange, disabled }: BlockEditorProps) {
  const label = blockKeyToLabel(block.blockKey);
  const meta = parseMetadata<RichTextMetadata>(block.metadata);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.max(120, textarea.scrollHeight)}px`;
  }, []);

  useEffect(() => {
    autoResize();
  }, [block.content, autoResize]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(block.id, e.target.value);
    autoResize();
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor={`block-${block.id}`}>{label}</Label>
      <textarea
        ref={textareaRef}
        id={`block-${block.id}`}
        value={block.content}
        onChange={handleChange}
        disabled={disabled}
        placeholder={meta.placeholder || `Enter ${label.toLowerCase()}...`}
        className={cn(
          'flex w-full rounded-md border border-input bg-white px-3 py-2 text-sm',
          'ring-offset-background placeholder:text-muted-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'dark:bg-gray-900 dark:text-gray-100',
          'resize-y'
        )}
        style={{ minHeight: 120 }}
      />
      {meta.helperText && (
        <p className="text-xs text-muted-foreground">{meta.helperText}</p>
      )}
    </div>
  );
}

export default RichTextBlockEditor;
