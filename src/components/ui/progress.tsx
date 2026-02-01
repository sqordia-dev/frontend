import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    indicatorClassName?: string;
  }
>(({ className, value, indicatorClassName, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className={cn(
        "h-full w-full flex-1 bg-primary transition-all",
        indicatorClassName
      )}
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

// Progress with label
interface ProgressWithLabelProps
  extends React.ComponentPropsWithoutRef<typeof Progress> {
  label?: string;
  showValue?: boolean;
  valuePrefix?: string;
  valueSuffix?: string;
}

const ProgressWithLabel = React.forwardRef<
  React.ElementRef<typeof Progress>,
  ProgressWithLabelProps
>(
  (
    { label, showValue = true, valuePrefix = "", valueSuffix = "%", value, className, ...props },
    ref
  ) => (
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between text-sm">
        {label && <span className="text-muted-foreground">{label}</span>}
        {showValue && (
          <span className="font-medium">
            {valuePrefix}
            {Math.round(value || 0)}
            {valueSuffix}
          </span>
        )}
      </div>
      <Progress ref={ref} value={value} {...props} />
    </div>
  )
);
ProgressWithLabel.displayName = "ProgressWithLabel";

// Circular progress
interface CircularProgressProps {
  value?: number;
  size?: "sm" | "default" | "lg";
  strokeWidth?: number;
  showValue?: boolean;
  className?: string;
}

const CircularProgress = React.forwardRef<SVGSVGElement, CircularProgressProps>(
  (
    {
      value = 0,
      size = "default",
      strokeWidth = 4,
      showValue = false,
      className,
    },
    ref
  ) => {
    const sizeMap = {
      sm: 32,
      default: 48,
      lg: 64,
    };

    const actualSize = sizeMap[size];
    const radius = (actualSize - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (value / 100) * circumference;

    return (
      <div className={cn("relative inline-flex", className)}>
        <svg
          ref={ref}
          width={actualSize}
          height={actualSize}
          viewBox={`0 0 ${actualSize} ${actualSize}`}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={actualSize / 2}
            cy={actualSize / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-secondary"
          />
          {/* Progress circle */}
          <circle
            cx={actualSize / 2}
            cy={actualSize / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="text-primary transition-all duration-300"
          />
        </svg>
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-medium">{Math.round(value)}%</span>
          </div>
        )}
      </div>
    );
  }
);
CircularProgress.displayName = "CircularProgress";

// Indeterminate progress (loading bar)
interface IndeterminateProgressProps {
  className?: string;
  indicatorClassName?: string;
}

const IndeterminateProgress = React.forwardRef<
  HTMLDivElement,
  IndeterminateProgressProps
>(({ className, indicatorClassName }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative h-1 w-full overflow-hidden rounded-full bg-secondary",
      className
    )}
  >
    <div
      className={cn(
        "absolute h-full w-1/3 animate-indeterminate rounded-full bg-primary",
        indicatorClassName
      )}
    />
  </div>
));
IndeterminateProgress.displayName = "IndeterminateProgress";

// Step progress
interface StepProgressProps {
  steps: number;
  currentStep: number;
  className?: string;
}

const StepProgress = React.forwardRef<HTMLDivElement, StepProgressProps>(
  ({ steps, currentStep, className }, ref) => (
    <div ref={ref} className={cn("flex items-center gap-1", className)}>
      {Array.from({ length: steps }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-2 flex-1 rounded-full transition-colors",
            index < currentStep ? "bg-primary" : "bg-secondary"
          )}
        />
      ))}
    </div>
  )
);
StepProgress.displayName = "StepProgress";

export {
  Progress,
  ProgressWithLabel,
  CircularProgress,
  IndeterminateProgress,
  StepProgress,
};
