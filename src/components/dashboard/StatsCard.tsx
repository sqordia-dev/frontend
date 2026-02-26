import * as React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

export interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  variant?: "default" | "primary" | "success" | "warning" | "gradient" | "outlined";
  className?: string;
}

export function StatsCard({
  title,
  value,
  description,
  icon,
  trend,
  variant = "default",
  className,
}: StatsCardProps) {
  const variantStyles = {
    default: {
      container: "bg-card border border-border hover:border-border/80",
      icon: "bg-muted text-muted-foreground",
      iconHover: "group-hover:bg-muted/80",
    },
    primary: {
      container: "bg-gradient-to-br from-strategy-blue to-[#0f1a2e] border-0 text-white",
      icon: "bg-white/10 text-white",
      iconHover: "group-hover:bg-white/20",
    },
    success: {
      container: "bg-card border border-emerald-200/50 dark:border-emerald-900/50",
      icon: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400",
      iconHover: "group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50",
    },
    warning: {
      container: "bg-card border border-amber-200/50 dark:border-amber-900/50",
      icon: "bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400",
      iconHover: "group-hover:bg-amber-100 dark:group-hover:bg-amber-900/50",
    },
    gradient: {
      container: "bg-gradient-to-br from-primary/5 via-card to-card border border-primary/10",
      icon: "bg-primary/10 text-primary",
      iconHover: "group-hover:bg-primary group-hover:text-primary-foreground",
    },
    outlined: {
      container: "bg-transparent border-2 border-border hover:border-primary/30",
      icon: "bg-muted text-muted-foreground",
      iconHover: "group-hover:bg-primary/10 group-hover:text-primary",
    },
  };

  const styles = variantStyles[variant];
  const isPrimary = variant === "primary";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl p-5 transition-all duration-200",
        "hover:shadow-md",
        styles.container,
        className
      )}
    >
      {/* Subtle gradient overlay for primary variant */}
      {isPrimary && (
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      )}

      <div className="relative flex items-start justify-between gap-4">
        <div className="space-y-3 flex-1 min-w-0">
          <p className={cn(
            "text-xs font-medium uppercase tracking-wider",
            isPrimary ? "text-white/60" : "text-muted-foreground"
          )}>
            {title}
          </p>
          <p className={cn(
            "text-2xl lg:text-3xl font-bold tracking-tight tabular-nums",
            isPrimary ? "text-white" : "text-foreground"
          )}>
            {value}
          </p>
          {description && (
            <p className={cn(
              "text-sm",
              isPrimary ? "text-white/70" : "text-muted-foreground"
            )}>
              {description}
            </p>
          )}
          {trend && (
            <div className="flex items-center gap-2 pt-0.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-sm font-semibold",
                  trend.isPositive
                    ? isPrimary ? "text-emerald-300" : "text-emerald-600 dark:text-emerald-400"
                    : isPrimary ? "text-red-300" : "text-red-600 dark:text-red-400"
                )}
              >
                {trend.isPositive ? (
                  <TrendingUp className="h-3.5 w-3.5" />
                ) : (
                  <TrendingDown className="h-3.5 w-3.5" />
                )}
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </span>
              <span className={cn(
                "text-xs",
                isPrimary ? "text-white/50" : "text-muted-foreground"
              )}>
                {trend.label || "vs last month"}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg shrink-0",
              "transition-all duration-200",
              styles.icon,
              styles.iconHover,
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Compact stats card for smaller spaces
 */
export interface CompactStatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  className?: string;
}

export function CompactStatsCard({
  title,
  value,
  icon,
  className,
}: CompactStatsCardProps) {
  return (
    <div
      className={cn(
        "group flex items-center gap-4 rounded-xl border bg-card p-4",
        "transition-all duration-200 hover:shadow-sm hover:border-primary/20",
        className
      )}
    >
      {icon && (
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
          {icon}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide truncate">
          {title}
        </p>
        <p className="text-lg font-bold tabular-nums">{value}</p>
      </div>
    </div>
  );
}

/**
 * Stats card with sparkline/mini chart support
 */
export interface SparklineStatsCardProps extends StatsCardProps {
  sparklineData?: number[];
}

export function SparklineStatsCard({
  sparklineData,
  ...props
}: SparklineStatsCardProps) {
  // Simple SVG sparkline
  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length < 2) return null;

    const max = Math.max(...sparklineData);
    const min = Math.min(...sparklineData);
    const range = max - min || 1;
    const width = 100;
    const height = 32;
    const padding = 2;

    const points = sparklineData
      .map((value, index) => {
        const x = padding + (index / (sparklineData.length - 1)) * (width - padding * 2);
        const y = height - padding - ((value - min) / range) * (height - padding * 2);
        return `${x},${y}`;
      })
      .join(" ");

    const isPositive = sparklineData[sparklineData.length - 1] >= sparklineData[0];

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-8 mt-3"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id={`sparkline-gradient-${isPositive ? 'up' : 'down'}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0.3" />
            <stop offset="100%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          fill="none"
          stroke={isPositive ? "#10b981" : "#ef4444"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
          className="drop-shadow-sm"
        />
      </svg>
    );
  };

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card p-5",
        "transition-all duration-200 hover:shadow-md hover:border-primary/20",
        props.className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2 flex-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            {props.title}
          </p>
          <p className="text-2xl font-bold tracking-tight tabular-nums">
            {props.value}
          </p>
        </div>
        {props.icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
            {props.icon}
          </div>
        )}
      </div>
      {renderSparkline()}
      {props.trend && (
        <div className="flex items-center gap-2 mt-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 text-sm font-semibold",
              props.trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
            )}
          >
            {props.trend.isPositive ? (
              <TrendingUp className="h-3.5 w-3.5" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5" />
            )}
            {props.trend.isPositive ? "+" : ""}
            {props.trend.value}%
          </span>
          <span className="text-xs text-muted-foreground">
            {props.trend.label || "vs last month"}
          </span>
        </div>
      )}
    </div>
  );
}
