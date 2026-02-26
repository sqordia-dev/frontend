import * as React from "react";
import { Link } from "react-router-dom";
import { FileText, Calendar, ArrowRight, Trash2, Copy, MoreVertical, CheckCircle2, Clock, Loader2, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface PlanCardProps {
  id: string;
  title: string;
  description?: string;
  status?: string;
  businessType?: string;
  createdAt?: string;
  isComplete?: boolean;
  nextQuestionId?: string;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  isDeleting?: boolean;
  isDuplicating?: boolean;
  translations?: {
    resume?: string;
    view?: string;
    viewPlan?: string;
    noDescription?: string;
    delete?: string;
    duplicate?: string;
    status?: {
      draft?: string;
      completed?: string;
      active?: string;
      inProgress?: string;
      generating?: string;
      generated?: string;
      exported?: string;
    };
  };
  className?: string;
}

/**
 * Status configuration for visual styling
 */
const statusConfig: Record<string, {
  variant: "success" | "warning" | "info" | "secondary" | "default";
  icon: React.ReactNode;
  dotColor: string;
}> = {
  complete: {
    variant: "success",
    icon: <CheckCircle2 className="h-3 w-3" />,
    dotColor: "bg-emerald-500",
  },
  completed: {
    variant: "success",
    icon: <CheckCircle2 className="h-3 w-3" />,
    dotColor: "bg-emerald-500",
  },
  generated: {
    variant: "success",
    icon: <CheckCircle2 className="h-3 w-3" />,
    dotColor: "bg-emerald-500",
  },
  generating: {
    variant: "warning",
    icon: <Loader2 className="h-3 w-3 animate-spin" />,
    dotColor: "bg-amber-500",
  },
  exported: {
    variant: "info",
    icon: <Download className="h-3 w-3" />,
    dotColor: "bg-blue-500",
  },
  draft: {
    variant: "secondary",
    icon: <Clock className="h-3 w-3" />,
    dotColor: "bg-slate-400",
  },
};

const getStatusConfig = (status?: string) => {
  const key = status?.toLowerCase() || "draft";
  return statusConfig[key] || statusConfig.draft;
};

const getStatusLabel = (
  status?: string,
  translations?: PlanCardProps["translations"]
) => {
  if (!status) return translations?.status?.draft || "Draft";
  const statusLower = status.toLowerCase();
  switch (statusLower) {
    case "draft":
      return translations?.status?.draft || "Draft";
    case "generating":
      return translations?.status?.generating || "Generating";
    case "generated":
      return translations?.status?.generated || "Generated";
    case "complete":
    case "completed":
      return translations?.status?.completed || "Complete";
    case "exported":
      return translations?.status?.exported || "Exported";
    case "active":
      return translations?.status?.active || "Active";
    case "inprogress":
      return translations?.status?.inProgress || "In Progress";
    default:
      return status;
  }
};

export function PlanCard({
  id,
  title,
  description,
  status,
  businessType,
  createdAt,
  isComplete,
  nextQuestionId,
  onDelete,
  onDuplicate,
  isDeleting,
  isDuplicating,
  translations,
  className,
}: PlanCardProps) {
  const statusLower = status?.toLowerCase();
  const isGenerated = statusLower === "generated";
  const isGenerating = statusLower === "generating";
  const isDraft =
    (status === "Draft" || status === "draft" || !isComplete) && !isGenerated;

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.(id);
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDuplicate?.(id);
  };

  const config = getStatusConfig(status);

  // Determine the link destination
  const linkTo = isDraft
    ? `/questionnaire/${id}${nextQuestionId ? `#question-${nextQuestionId}` : ""}`
    : isGenerated
    ? `/plans/${id}/preview`
    : `/plans/${id}`;

  // Action button text
  const actionText = isDraft
    ? translations?.resume || "Resume"
    : isGenerated
    ? translations?.viewPlan || "View Plan"
    : translations?.view || "View";

  return (
    <div
      className={cn(
        "group relative rounded-xl border bg-card transition-all duration-200",
        "hover:shadow-md hover:border-primary/20",
        isGenerating && "border-amber-200/50 dark:border-amber-800/30",
        className
      )}
    >
      {/* Left accent border */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-all duration-200",
        config.dotColor,
        "opacity-0 group-hover:opacity-100"
      )} />

      <div className="p-5 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          {/* Icon and Content */}
          <div className="flex items-start gap-4 flex-1 min-w-0">
            {/* Plan Icon */}
            <div className={cn(
              "flex h-11 w-11 items-center justify-center rounded-lg shrink-0 transition-all duration-200",
              "bg-muted/80 text-muted-foreground",
              "group-hover:bg-strategy-blue group-hover:text-white"
            )}>
              <FileText className="h-5 w-5" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-base font-semibold text-foreground truncate group-hover:text-strategy-blue transition-colors">
                  {title || "Untitled Plan"}
                </h3>

                {/* Mobile: Actions */}
                <div className="flex lg:hidden items-center gap-1">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem asChild>
                        <Link to={linkTo} className="cursor-pointer">
                          <ArrowRight className="mr-2 h-4 w-4" />
                          {actionText}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleDuplicate}
                        disabled={isDuplicating}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        {translations?.duplicate || "Duplicate"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {translations?.delete || "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <p className="text-sm text-muted-foreground line-clamp-1">
                {description || translations?.noDescription || "No description"}
              </p>

              {/* Metadata row */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {/* Status Badge */}
                <Badge
                  variant={config.variant}
                  className="gap-1.5 text-xs font-medium"
                >
                  {config.icon}
                  {getStatusLabel(status, translations)}
                </Badge>

                {/* Business Type */}
                {businessType && (
                  <Badge variant="outline" className="text-xs font-normal">
                    {businessType}
                  </Badge>
                )}

                {/* Created Date */}
                {createdAt && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>
                      {new Date(createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Desktop: Actions */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <Button
              asChild
              size="sm"
              className={cn(
                "gap-2 transition-all duration-200",
                isDraft
                  ? "bg-momentum-orange hover:bg-momentum-orange/90 text-white"
                  : "bg-primary hover:bg-primary/90"
              )}
            >
              <Link to={linkTo}>
                <span>{actionText}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-muted-foreground hover:text-foreground"
                >
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onClick={handleDuplicate}
                  disabled={isDuplicating}
                  className="cursor-pointer"
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {translations?.duplicate || "Duplicate"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="text-destructive focus:text-destructive cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {translations?.delete || "Delete"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
