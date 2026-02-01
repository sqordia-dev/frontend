import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const spinnerVariants = cva("animate-spin", {
  variants: {
    size: {
      xs: "h-3 w-3",
      sm: "h-4 w-4",
      default: "h-6 w-6",
      lg: "h-8 w-8",
      xl: "h-12 w-12",
    },
    variant: {
      default: "text-primary",
      muted: "text-muted-foreground",
      white: "text-white",
      destructive: "text-destructive",
    },
  },
  defaultVariants: {
    size: "default",
    variant: "default",
  },
});

export interface SpinnerProps
  extends React.SVGAttributes<SVGSVGElement>,
    VariantProps<typeof spinnerVariants> {
  /** Screen reader label */
  label?: string;
}

/**
 * Spinner Component
 *
 * Animated loading spinner with size and color variants.
 *
 * @example
 * ```tsx
 * <Spinner />
 * <Spinner size="lg" variant="muted" />
 * <Spinner label="Loading data..." />
 * ```
 */
const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size, variant, label = "Loading", ...props }, ref) => (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      className={cn(spinnerVariants({ size, variant }), className)}
      aria-label={label}
      role="status"
      {...props}
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  )
);
Spinner.displayName = "Spinner";

/**
 * Dots Loading Animation
 *
 * Three bouncing dots for a softer loading indicator.
 */
interface DotsLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg";
}

const DotsLoader = React.forwardRef<HTMLDivElement, DotsLoaderProps>(
  ({ className, size = "default", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-1.5 w-1.5",
      default: "h-2 w-2",
      lg: "h-3 w-3",
    };

    const gapClasses = {
      sm: "gap-1",
      default: "gap-1.5",
      lg: "gap-2",
    };

    return (
      <div
        ref={ref}
        role="status"
        aria-label="Loading"
        className={cn("flex items-center", gapClasses[size], className)}
        {...props}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "rounded-full bg-current animate-bounce",
              sizeClasses[size]
            )}
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: "0.6s",
            }}
          />
        ))}
      </div>
    );
  }
);
DotsLoader.displayName = "DotsLoader";

/**
 * Pulse Loader
 *
 * Pulsing circle animation.
 */
interface PulseLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "default" | "lg";
}

const PulseLoader = React.forwardRef<HTMLDivElement, PulseLoaderProps>(
  ({ className, size = "default", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-4 w-4",
      default: "h-6 w-6",
      lg: "h-10 w-10",
    };

    return (
      <div
        ref={ref}
        role="status"
        aria-label="Loading"
        className={cn("relative", sizeClasses[size], className)}
        {...props}
      >
        <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
        <div className="absolute inset-1 rounded-full bg-primary animate-pulse" />
      </div>
    );
  }
);
PulseLoader.displayName = "PulseLoader";

/**
 * Loading Overlay
 *
 * Full-screen or container overlay with loading indicator.
 *
 * @example
 * ```tsx
 * <div className="relative">
 *   <YourContent />
 *   {isLoading && <LoadingOverlay />}
 * </div>
 * ```
 */
interface LoadingOverlayProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Text to show below spinner */
  text?: string;
  /** Whether to use fixed positioning (full screen) */
  fullScreen?: boolean;
  /** Background blur amount */
  blur?: boolean;
}

const LoadingOverlay = React.forwardRef<HTMLDivElement, LoadingOverlayProps>(
  (
    { className, text, fullScreen = false, blur = true, ...props },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        "inset-0 z-50 flex flex-col items-center justify-center gap-3",
        fullScreen ? "fixed" : "absolute",
        blur ? "bg-background/80 backdrop-blur-sm" : "bg-background/90",
        className
      )}
      {...props}
    >
      <Spinner size="lg" />
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  )
);
LoadingOverlay.displayName = "LoadingOverlay";

/**
 * Button Loading State
 *
 * Inline loading state for buttons.
 *
 * @example
 * ```tsx
 * <Button disabled={isLoading}>
 *   {isLoading ? <ButtonLoader /> : "Submit"}
 * </Button>
 * ```
 */
interface ButtonLoaderProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Text to show while loading */
  text?: string;
}

const ButtonLoader = React.forwardRef<HTMLSpanElement, ButtonLoaderProps>(
  ({ className, text, ...props }, ref) => (
    <span
      ref={ref}
      className={cn("inline-flex items-center gap-2", className)}
      {...props}
    >
      <Spinner size="sm" variant="white" />
      {text && <span>{text}</span>}
    </span>
  )
);
ButtonLoader.displayName = "ButtonLoader";

/**
 * Page Loading State
 *
 * Full page loading indicator for route transitions.
 */
interface PageLoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Loading message */
  message?: string;
}

const PageLoader = React.forwardRef<HTMLDivElement, PageLoaderProps>(
  ({ className, message = "Loading...", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex min-h-[400px] w-full flex-col items-center justify-center gap-4",
        className
      )}
      {...props}
    >
      <Spinner size="xl" />
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
);
PageLoader.displayName = "PageLoader";

/**
 * Inline Loading State
 *
 * Small inline loading indicator for text or lists.
 */
interface InlineLoaderProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** Text to show while loading */
  text?: string;
}

const InlineLoader = React.forwardRef<HTMLSpanElement, InlineLoaderProps>(
  ({ className, text = "Loading...", ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-2 text-sm text-muted-foreground",
        className
      )}
      {...props}
    >
      <Spinner size="xs" variant="muted" />
      {text}
    </span>
  )
);
InlineLoader.displayName = "InlineLoader";

export {
  Spinner,
  spinnerVariants,
  DotsLoader,
  PulseLoader,
  LoadingOverlay,
  ButtonLoader,
  PageLoader,
  InlineLoader,
};
