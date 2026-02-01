import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  variant?: "default" | "gradient" | "outlined";
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
  const variants = {
    default: "bg-card border-border",
    gradient: "bg-gradient-to-br from-primary/5 via-card to-card border-primary/10",
    outlined: "bg-transparent border-2",
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-lg hover:border-primary/30",
        variants[variant],
        className
      )}
    >
      {/* Subtle gradient overlay on hover */}
      <div
        className={cn(
          "absolute inset-0 opacity-0 transition-opacity duration-300",
          "bg-gradient-to-br from-primary/5 to-transparent",
          "group-hover:opacity-100"
        )}
      />

      <CardContent className="relative z-10 p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">
              {title}
            </p>
            <p className="text-3xl font-bold tracking-tight">
              {value}
            </p>
            {description && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
            {trend && (
              <div className="flex items-center gap-1.5 pt-1">
                <span
                  className={cn(
                    "inline-flex items-center gap-1 text-sm font-semibold",
                    trend.isPositive ? "text-green-600 dark:text-green-500" : "text-red-600 dark:text-red-500"
                  )}
                >
                  {trend.isPositive ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </span>
                <span className="text-sm text-muted-foreground">
                  {trend.label || "vs last month"}
                </span>
              </div>
            )}
          </div>
          {icon && (
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl",
                "bg-primary/10 text-primary",
                "transition-all duration-300",
                "group-hover:bg-primary group-hover:text-primary-foreground",
                "group-hover:scale-110"
              )}
            >
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
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
        "flex items-center gap-4 rounded-xl border bg-card p-4",
        "transition-all duration-300 hover:shadow-md hover:border-primary/30",
        className
      )}
    >
      {icon && (
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
      )}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </p>
        <p className="text-xl font-bold">{value}</p>
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
        className="w-full h-8 mt-2"
        preserveAspectRatio="none"
      >
        <polyline
          fill="none"
          stroke={isPositive ? "#22c55e" : "#ef4444"}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "hover:-translate-y-1 hover:shadow-lg hover:border-primary/30",
        props.className
      )}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">
              {props.title}
            </p>
            <p className="text-3xl font-bold tracking-tight">
              {props.value}
            </p>
          </div>
          {props.icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {props.icon}
            </div>
          )}
        </div>
        {renderSparkline()}
        {props.trend && (
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={cn(
                "inline-flex items-center gap-1 text-sm font-semibold",
                props.trend.isPositive ? "text-green-600" : "text-red-600"
              )}
            >
              {props.trend.isPositive ? "+" : ""}
              {props.trend.value}%
            </span>
            <span className="text-xs text-muted-foreground">
              {props.trend.label || "vs last month"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
