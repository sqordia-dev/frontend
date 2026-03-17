import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface ErrorBannerProps {
  /** Error message to display */
  message: string;
  /** Optional retry handler */
  onRetry?: () => void;
  /** Retry button label */
  retryLabel?: string;
  /** Additional class names */
  className?: string;
}

/**
 * ErrorBanner - Inline error display for page-level load failures
 */
export function ErrorBanner({
  message,
  onRetry,
  retryLabel = 'Try again',
  className,
}: ErrorBannerProps) {
  return (
    <div
      role="alert"
      className={cn(
        'flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4',
        className
      )}
    >
      <AlertCircle className="h-5 w-5 shrink-0 text-destructive" aria-hidden="true" />
      <p className="flex-1 text-sm text-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" aria-hidden="true" />
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
