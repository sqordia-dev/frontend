import { type LucideIcon, Search, AlertCircle, Plus, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

type EmptyStateVariant = 'default' | 'search' | 'error' | 'create';

const variantIcons: Record<EmptyStateVariant, LucideIcon> = {
  default: Inbox,
  search: Search,
  error: AlertCircle,
  create: Plus,
};

interface EmptyStateProps {
  /** Variant determines the default icon and styling */
  variant?: EmptyStateVariant;
  /** Custom icon to override the variant default */
  icon?: LucideIcon;
  /** Main heading text */
  title: string;
  /** Descriptive text below the heading */
  description?: string;
  /** Primary action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Additional class names */
  className?: string;
  /** Children rendered below the description */
  children?: React.ReactNode;
}

/**
 * EmptyState - Shared component for consistent empty/zero state UI
 *
 * Variants:
 * - default: generic empty state (inbox icon)
 * - search: no search results (search icon)
 * - error: failed to load (alert icon)
 * - create: prompt to create first item (plus icon)
 */
export function EmptyState({
  variant = 'default',
  icon,
  title,
  description,
  action,
  className,
  children,
}: EmptyStateProps) {
  const Icon = icon || variantIcons[variant];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
      role="status"
    >
      <div
        className={cn(
          'flex items-center justify-center w-14 h-14 rounded-full mb-4',
          variant === 'error'
            ? 'bg-destructive/10 text-destructive'
            : 'bg-muted text-muted-foreground'
        )}
      >
        <Icon className="w-7 h-7" aria-hidden="true" />
      </div>

      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>

      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      )}

      {action && (
        <Button
          onClick={action.onClick}
          variant={variant === 'create' ? 'default' : 'outline'}
          size="sm"
        >
          {variant === 'create' && <Plus className="w-4 h-4 mr-1.5" aria-hidden="true" />}
          {action.label}
        </Button>
      )}

      {children}
    </div>
  );
}
