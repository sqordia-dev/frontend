import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ImageUploaderProps {
  /** Label for the uploader */
  label?: string;
  /** Current image URL */
  value?: string;
  /** Callback when image is uploaded */
  onUpload: (file: File) => Promise<string>;
  /** Callback when image is removed */
  onRemove?: () => void | Promise<void>;
  /** Optional description */
  description?: string;
  /** Whether the uploader is disabled */
  disabled?: boolean;
  /** Accepted file types */
  accept?: string;
  /** Max file size in bytes (default 2MB) */
  maxSize?: number;
  /** Additional class names */
  className?: string;
  /** Preview height class */
  previewHeight?: string;
  /** Alternative text for preview */
  alt?: string;
}

/**
 * ImageUploader - A reusable image upload component with preview
 */
export function ImageUploader({
  label,
  value,
  onUpload,
  onRemove,
  description = 'PNG, JPG, SVG or WebP (max 2MB)',
  disabled = false,
  accept = 'image/png,image/jpeg,image/svg+xml,image/webp',
  maxSize = 2 * 1024 * 1024,
  className,
  previewHeight = 'h-20',
  alt = 'Uploaded image',
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = accept.split(',');
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type');
      return;
    }

    // Validate file size
    if (file.size > maxSize) {
      setError(`File must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      await onUpload(file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (onRemove) {
      try {
        await onRemove();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Remove failed');
      }
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </Label>
      )}

      <div className="flex items-center gap-4">
        {/* Preview area */}
        {value ? (
          <div className="relative group">
            <img
              src={value}
              alt={alt}
              className={cn(
                previewHeight,
                'w-auto max-w-[120px] object-contain border border-gray-200 dark:border-gray-600 rounded-lg p-2 bg-white dark:bg-gray-800'
              )}
            />
            {onRemove && !disabled && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-md opacity-0 group-hover:opacity-100"
                title="Remove image"
              >
                <X size={12} />
              </button>
            )}
          </div>
        ) : (
          <div
            className={cn(
              previewHeight,
              'w-24 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg',
              'flex items-center justify-center bg-gray-50 dark:bg-gray-800'
            )}
          >
            <ImageIcon className="w-6 h-6 text-gray-400" />
          </div>
        )}

        {/* Upload controls */}
        <div className="space-y-1.5">
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleFileChange}
            className="hidden"
            disabled={disabled || isUploading}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || isUploading}
            className="gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={14} />
                {value ? 'Change' : 'Upload'}
              </>
            )}
          </Button>

          {description && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
          )}

          {error && (
            <p className="text-xs text-red-500">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ImageUploader;
