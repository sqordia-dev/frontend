import React, { useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CmsContentBlock } from '@/lib/cms-types';
import { blockKeyToLabel, parseMetadata } from './utils';

interface BlockEditorProps {
  block: CmsContentBlock;
  onChange: (blockId: string, content: string, metadata?: string) => void;
  disabled?: boolean;
}

interface ImageBlockEditorProps extends BlockEditorProps {
  onUpload?: (file: File) => Promise<string>;
}

interface ImageMetadata {
  helperText?: string;
  altText?: string;
}

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml', 'image/webp'];
const ACCEPT_STRING = 'image/png,image/jpeg,image/svg+xml,image/webp';
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * ImageBlockEditor
 *
 * An image upload block editor with drag-and-drop support, preview thumbnail,
 * and file validation (type and size).
 */
export function ImageBlockEditor({
  block,
  onChange,
  disabled,
  onUpload,
}: ImageBlockEditorProps) {
  const label = blockKeyToLabel(block.blockKey);
  const meta = parseMetadata<ImageMetadata>(block.metadata);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasImage = Boolean(block.content);

  const validateFile = (file: File): string | null => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Invalid file type. Accepted: PNG, JPG, SVG, WebP.';
    }
    if (file.size > MAX_SIZE_BYTES) {
      return 'File is too large. Maximum size is 5MB.';
    }
    return null;
  };

  const handleFile = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);

      if (onUpload) {
        setIsUploading(true);
        try {
          const url = await onUpload(file);
          onChange(block.id, url);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
        } finally {
          setIsUploading(false);
        }
      } else {
        // Fallback: create a local object URL for preview (dev mode)
        const objectUrl = URL.createObjectURL(file);
        onChange(block.id, objectUrl);
      }
    },
    [block.id, onChange, onUpload]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (disabled || isUploading) return;

      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [disabled, isUploading, handleFile]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isUploading) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleRemove = () => {
    onChange(block.id, '');
    setError(null);
  };

  const handleClickZone = () => {
    if (!disabled && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_STRING}
        onChange={handleInputChange}
        disabled={disabled || isUploading}
        className="hidden"
        aria-label={`Upload image for ${label}`}
      />

      {/* Drop zone / Preview */}
      <div
        role="button"
        tabIndex={0}
        onClick={handleClickZone}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClickZone();
          }
        }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors',
          'bg-gray-50 dark:bg-gray-900',
          isDragOver
            ? 'border-[#FF6B00] bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10'
            : 'border-gray-300 dark:border-gray-600',
          'hover:border-[#FF6B00]/60 hover:bg-gray-100 dark:hover:bg-gray-800',
          disabled && 'pointer-events-none opacity-60',
          isUploading && 'pointer-events-none'
        )}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Spinner size="lg" />
            <p className="text-sm text-muted-foreground">Uploading...</p>
          </div>
        ) : hasImage ? (
          <div className="relative w-full p-3">
            <img
              src={block.content}
              alt={meta.altText || label}
              className="mx-auto max-h-48 rounded-md object-contain"
            />
            {/* Overlay with Change button */}
            <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 opacity-0 transition-opacity hover:bg-black/40 hover:opacity-100">
              <span className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-gray-900 shadow-sm">
                Change
              </span>
            </div>
            {/* Remove button */}
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              className="absolute right-2 top-2 z-10"
              onClick={(e) => {
                e.stopPropagation();
                handleRemove();
              }}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove image</span>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 p-6">
            {isDragOver ? (
              <Upload className="h-8 w-8 text-[#FF6B00]" />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground" />
            )}
            <div className="text-center">
              <p className="text-sm font-medium text-foreground dark:text-gray-200">
                Drop image here or click to upload
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PNG, JPG, SVG, WebP - Max 5MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {meta.helperText && (
        <p className="text-xs text-muted-foreground">{meta.helperText}</p>
      )}
    </div>
  );
}

export default ImageBlockEditor;
