import * as React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveImageSource {
  src: string;
  width: number;
}

interface ResponsiveImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Array of image sources with their widths for srcset */
  sources?: ResponsiveImageSource[];
  /** Sizes attribute for responsive images */
  sizes?: string;
  /** Aspect ratio to maintain (e.g., "16/9", "4/3", "1/1") */
  aspectRatio?: string;
  /** Object fit mode */
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  /** Enable lazy loading (default: true) */
  lazy?: boolean;
  /** Placeholder blur while loading */
  showPlaceholder?: boolean;
  /** Fallback image on error */
  fallbackSrc?: string;
}

const defaultSizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

/**
 * Responsive image component with srcset, lazy loading, and placeholder support.
 * Optimizes image loading for different viewport sizes.
 */
const ResponsiveImage = React.forwardRef<HTMLImageElement, ResponsiveImageProps>(
  (
    {
      src,
      alt = '',
      sources,
      sizes = defaultSizes,
      aspectRatio,
      objectFit = 'cover',
      lazy = true,
      showPlaceholder = true,
      fallbackSrc,
      className,
      onLoad,
      onError,
      ...props
    },
    ref
  ) => {
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [hasError, setHasError] = React.useState(false);

    // Generate srcset from sources array
    const srcSet = React.useMemo(() => {
      if (!sources || sources.length === 0) return undefined;
      return sources.map((s) => `${s.src} ${s.width}w`).join(', ');
    }, [sources]);

    const handleLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
      setIsLoaded(true);
      onLoad?.(e);
    };

    const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
      setHasError(true);
      if (fallbackSrc) {
        (e.target as HTMLImageElement).src = fallbackSrc;
      }
      onError?.(e);
    };

    const currentSrc = hasError && fallbackSrc ? fallbackSrc : src;

    const aspectRatioStyle = aspectRatio
      ? { aspectRatio: aspectRatio.replace('/', ' / ') }
      : undefined;

    return (
      <div
        className={cn(
          'relative overflow-hidden',
          !isLoaded && showPlaceholder && 'img-lazy',
          className
        )}
        style={aspectRatioStyle}
      >
        <img
          ref={ref}
          src={currentSrc}
          srcSet={srcSet}
          sizes={srcSet ? sizes : undefined}
          alt={alt}
          loading={lazy ? 'lazy' : 'eager'}
          decoding="async"
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'w-full h-full transition-opacity duration-300',
            objectFit === 'cover' && 'object-cover',
            objectFit === 'contain' && 'object-contain',
            objectFit === 'fill' && 'object-fill',
            objectFit === 'none' && 'object-none',
            objectFit === 'scale-down' && 'object-scale-down',
            !isLoaded && showPlaceholder && 'opacity-0',
            isLoaded && 'opacity-100'
          )}
          {...props}
        />
      </div>
    );
  }
);
ResponsiveImage.displayName = 'ResponsiveImage';

/**
 * Picture element wrapper for art direction (different images for different viewports)
 */
interface PictureSource {
  srcSet: string;
  media: string;
  type?: string;
}

interface ResponsivePictureProps extends Omit<ResponsiveImageProps, 'sources'> {
  /** Picture source elements for art direction */
  pictureSources?: PictureSource[];
}

const ResponsivePicture = React.forwardRef<HTMLImageElement, ResponsivePictureProps>(
  ({ pictureSources, src, alt = '', className, lazy = true, aspectRatio, objectFit = 'cover', ...props }, ref) => {
    const [isLoaded, setIsLoaded] = React.useState(false);

    const aspectRatioStyle = aspectRatio
      ? { aspectRatio: aspectRatio.replace('/', ' / ') }
      : undefined;

    return (
      <div
        className={cn('relative overflow-hidden', !isLoaded && 'img-lazy', className)}
        style={aspectRatioStyle}
      >
        <picture>
          {pictureSources?.map((source, index) => (
            <source
              key={index}
              srcSet={source.srcSet}
              media={source.media}
              type={source.type}
            />
          ))}
          <img
            ref={ref}
            src={src}
            alt={alt}
            loading={lazy ? 'lazy' : 'eager'}
            decoding="async"
            onLoad={() => setIsLoaded(true)}
            className={cn(
              'w-full h-full transition-opacity duration-300',
              objectFit === 'cover' && 'object-cover',
              objectFit === 'contain' && 'object-contain',
              !isLoaded && 'opacity-0',
              isLoaded && 'opacity-100'
            )}
            {...props}
          />
        </picture>
      </div>
    );
  }
);
ResponsivePicture.displayName = 'ResponsivePicture';

/**
 * Avatar component with responsive sizing
 */
interface ResponsiveAvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const avatarSizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 sm:w-14 sm:h-14 text-lg',
  xl: 'w-16 h-16 sm:w-20 sm:h-20 text-xl',
};

const ResponsiveAvatar: React.FC<ResponsiveAvatarProps> = ({
  src,
  alt = '',
  fallback,
  size = 'md',
  className,
}) => {
  const [hasError, setHasError] = React.useState(false);

  const initials = React.useMemo(() => {
    if (!fallback) return '?';
    return fallback
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [fallback]);

  if (!src || hasError) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-full bg-muted text-muted-foreground font-medium',
          avatarSizes[size],
          className
        )}
        aria-label={alt || fallback}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={cn('rounded-full object-cover', avatarSizes[size], className)}
    />
  );
};

export { ResponsiveImage, ResponsivePicture, ResponsiveAvatar };
export type { ResponsiveImageProps, ResponsivePictureProps, ResponsiveAvatarProps };
