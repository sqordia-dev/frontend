import React, { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CmsContentBlock } from '@/lib/cms-types';
import { blockKeyToLabel, parseMetadata } from './utils';

interface BlockEditorProps {
  block: CmsContentBlock;
  onChange: (blockId: string, content: string, metadata?: string) => void;
  disabled?: boolean;
}

interface LinkMetadata {
  helperText?: string;
  placeholder?: string;
}

/**
 * Validates that a URL starts with http://, https://, or /
 */
function isValidUrl(value: string): boolean {
  if (!value) return true; // empty is valid (not required by default)
  return /^(https?:\/\/|\/)/i.test(value.trim());
}

/**
 * LinkBlockEditor
 *
 * A URL input with inline validation and clickable preview.
 * Accepted formats: absolute URLs (http/https) and root-relative paths (/).
 */
export function LinkBlockEditor({ block, onChange, disabled }: BlockEditorProps) {
  const label = blockKeyToLabel(block.blockKey);
  const meta = parseMetadata<LinkMetadata>(block.metadata);

  const validationError = useMemo(() => {
    if (!block.content) return null;
    if (!isValidUrl(block.content)) {
      return 'URL must start with http://, https://, or /';
    }
    return null;
  }, [block.content]);

  const isAbsoluteUrl = block.content.startsWith('http://') || block.content.startsWith('https://');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(block.id, e.target.value);
  };

  return (
    <div className="space-y-1.5">
      <Label htmlFor={`block-${block.id}`}>{label}</Label>
      <Input
        id={`block-${block.id}`}
        value={block.content}
        onChange={handleChange}
        disabled={disabled}
        placeholder={meta.placeholder || 'https://example.com or /page'}
        className={cn(
          'bg-white dark:bg-gray-900',
          validationError && 'border-destructive focus-visible:ring-destructive',
          disabled && 'cursor-not-allowed opacity-60'
        )}
      />
      {validationError && (
        <p className="text-xs text-destructive">{validationError}</p>
      )}
      {!validationError && block.content && isAbsoluteUrl && (
        <a
          href={block.content}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-[#FF6B00] hover:underline dark:text-[#FF8533]"
        >
          <ExternalLink className="h-3 w-3" />
          {block.content}
        </a>
      )}
      {!validationError && block.content && !isAbsoluteUrl && block.content.startsWith('/') && (
        <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
          <ExternalLink className="h-3 w-3" />
          Internal link: {block.content}
        </p>
      )}
      {meta.helperText && (
        <p className="text-xs text-muted-foreground">{meta.helperText}</p>
      )}
    </div>
  );
}

export default LinkBlockEditor;
