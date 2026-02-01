import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Whether to show the pulse animation */
  animate?: boolean;
}

function Skeleton({
  className,
  animate = true,
  ...props
}: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-md bg-muted",
        animate && "animate-pulse",
        className
      )}
      {...props}
    />
  );
}

// Pre-built skeleton variants for common patterns

function SkeletonText({
  lines = 3,
  className,
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border p-4 space-y-3", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonText lines={2} />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-6 w-20 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
    </div>
  );
}

function SkeletonAvatar({
  size = "default",
  className,
}: {
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-8 w-8",
    default: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return (
    <Skeleton
      className={cn("rounded-full", sizeClasses[size], className)}
    />
  );
}

function SkeletonButton({
  size = "default",
  className,
}: {
  size?: "sm" | "default" | "lg";
  className?: string;
}) {
  const sizeClasses = {
    sm: "h-9 w-20",
    default: "h-10 w-24",
    lg: "h-11 w-28",
  };

  return (
    <Skeleton
      className={cn("rounded-md", sizeClasses[size], className)}
    />
  );
}

function SkeletonInput({ className }: { className?: string }) {
  return <Skeleton className={cn("h-10 w-full rounded-md", className)} />;
}

function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      {/* Header */}
      <div className="flex gap-4 border-b pb-3 mb-3">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={`header-${i}`}
            className="h-4 flex-1"
          />
        ))}
      </div>
      {/* Rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={`${rowIndex}-${colIndex}`}
                className="h-4 flex-1"
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Dashboard-specific skeletons

function SkeletonStatsCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border p-6", className)}>
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-12 w-12 rounded-lg" />
      </div>
      <Skeleton className="h-3 w-24 mb-2" />
      <Skeleton className="h-8 w-16" />
    </div>
  );
}

function SkeletonPlanCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border p-6", className)}>
      <div className="flex items-start gap-4">
        <Skeleton className="h-12 w-12 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <div className="flex items-center gap-2 pt-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-9 w-20 rounded-md" />
      </div>
    </div>
  );
}

// Section skeleton for preview pages
function SkeletonSection({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-lg border p-6 space-y-4", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <Skeleton className="h-6 w-48" />
      </div>
      <SkeletonText lines={4} />
    </div>
  );
}

// Full page loader skeleton
function SkeletonPage({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-6 p-6", className)}>
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonStatsCard key={i} />
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonPlanCard key={i} />
        ))}
      </div>
    </div>
  );
}

export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonInput,
  SkeletonTable,
  SkeletonStatsCard,
  SkeletonPlanCard,
  SkeletonSection,
  SkeletonPage,
};
