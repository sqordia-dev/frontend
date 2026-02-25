import * as React from "react";
import { Link } from "react-router-dom";
import { FileText, Calendar, ArrowRight, Trash2, Copy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
 * Status badge variants according to user journey:
 * - Draft: Gray (secondary)
 * - Generating: Orange (warning)
 * - Complete: Green (success)
 * - Exported: Navy (info)
 */
const getStatusVariant = (status?: string): "success" | "warning" | "info" | "secondary" | "destructive" | "outline" | "default" => {
  switch (status?.toLowerCase()) {
    case "complete":
    case "completed":
      return "success";
    case "generated":
      return "success";
    case "generating":
      return "warning";
    case "exported":
      return "info";
    case "draft":
    default:
      return "secondary";
  }
};

const getStatusLabel = (
  status?: string,
  translations?: PlanCardProps["translations"]
) => {
  if (!status) return "Draft";
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

  return (
    <Card
      className={cn(
        "group relative transition-all hover:shadow-md",
        className
      )}
    >
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 min-w-0 flex items-start gap-4">
            <div className="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <FileText className="h-6 w-6" />
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold truncate group-hover:text-primary transition-colors">
                {title || "Untitled Plan"}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                {description || translations?.noDescription || "No description"}
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-3">
                {status && (
                  <Badge variant={getStatusVariant(status)}>
                    {getStatusLabel(status, translations)}
                  </Badge>
                )}
                {businessType && (
                  <Badge variant="outline">{businessType}</Badge>
                )}
                {createdAt && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
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

          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity lg:opacity-100">
            {isDraft ? (
              <Button asChild variant="brand" size="sm">
                <Link
                  to={`/questionnaire/${id}${
                    nextQuestionId ? `#question-${nextQuestionId}` : ""
                  }`}
                >
                  <span>{translations?.resume || "Resume"}</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : isGenerated ? (
              <Button asChild variant="brand" size="sm">
                <Link to={`/plans/${id}/preview`}>
                  <span>{translations?.viewPlan || "View Plan"}</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button asChild variant="brand" size="sm">
                <Link to={`/plans/${id}`}>
                  <span>{translations?.view || "View"}</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <span className="sr-only">Open menu</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={handleDuplicate}
                  disabled={isDuplicating}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {translations?.duplicate || "Duplicate"}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
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
      </CardContent>
    </Card>
  );
}
