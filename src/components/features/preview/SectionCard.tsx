import * as React from "react";
import { Edit, Wand2, MoreHorizontal, RefreshCw, Copy, Check } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SectionCardProps {
  id: string;
  number: number;
  icon?: React.ReactNode;
  title: string;
  content: string;
  isEditable?: boolean;
  isLoading?: boolean;
  onEdit?: () => void;
  onRegenerate?: () => void;
  onPolish?: () => void;
  onCopy?: () => void;
  className?: string;
  translations?: {
    edit?: string;
    regenerate?: string;
    polish?: string;
    copy?: string;
    copied?: string;
    moreActions?: string;
    regenerating?: string;
    polishing?: string;
  };
}

export function SectionCard({
  id,
  number,
  icon,
  title,
  content,
  isEditable = true,
  isLoading = false,
  onEdit,
  onRegenerate,
  onPolish,
  onCopy,
  className,
  translations,
}: SectionCardProps) {
  const [isCopied, setIsCopied] = React.useState(false);

  const handleCopy = async () => {
    if (onCopy) {
      onCopy();
    } else {
      // Default copy behavior - copy text content
      const textContent = content.replace(/<[^>]*>/g, "");
      await navigator.clipboard.writeText(textContent);
    }
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card
      id={id}
      className={cn(
        "scroll-mt-24 transition-shadow",
        isLoading && "opacity-70",
        className
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {icon}
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold">
              {number}. {title}
            </h2>
          </div>
        </div>

        {isEditable && (
          <div className="flex items-center gap-1">
            <TooltipProvider>
              {onEdit && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={onEdit}
                      disabled={isLoading}
                      className="h-8 w-8"
                    >
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">
                        {translations?.edit || "Edit"}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {translations?.edit || "Edit"}
                  </TooltipContent>
                </Tooltip>
              )}

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopy}
                    disabled={isLoading}
                    className="h-8 w-8"
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {isCopied
                        ? translations?.copied || "Copied"
                        : translations?.copy || "Copy"}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isCopied
                    ? translations?.copied || "Copied!"
                    : translations?.copy || "Copy to clipboard"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={isLoading}
                  className="h-8 w-8"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">
                    {translations?.moreActions || "More actions"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onPolish && (
                  <DropdownMenuItem onClick={onPolish} disabled={isLoading}>
                    <Wand2 className="mr-2 h-4 w-4" />
                    {isLoading
                      ? translations?.polishing || "Polishing..."
                      : translations?.polish || "AI Polish"}
                  </DropdownMenuItem>
                )}
                {onRegenerate && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={onRegenerate}
                      disabled={isLoading}
                      className="text-destructive focus:text-destructive"
                    >
                      <RefreshCw className="mr-2 h-4 w-4" />
                      {isLoading
                        ? translations?.regenerating || "Regenerating..."
                        : translations?.regenerate || "Regenerate"}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </CardHeader>

      <CardContent>
        <div
          className={cn(
            "prose prose-gray max-w-none dark:prose-invert",
            "prose-headings:font-semibold prose-headings:tracking-tight",
            "prose-p:text-muted-foreground prose-p:leading-relaxed",
            "prose-ul:text-muted-foreground prose-ol:text-muted-foreground",
            "prose-li:marker:text-muted-foreground",
            "prose-strong:text-foreground",
            "prose-a:text-primary prose-a:no-underline hover:prose-a:underline"
          )}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </CardContent>
    </Card>
  );
}

// Empty state for sections without content
interface SectionCardEmptyProps {
  id: string;
  number: number;
  icon?: React.ReactNode;
  title: string;
  onGenerate?: () => void;
  isGenerating?: boolean;
  className?: string;
  translations?: {
    noContent?: string;
    generate?: string;
    generating?: string;
  };
}

export function SectionCardEmpty({
  id,
  number,
  icon,
  title,
  onGenerate,
  isGenerating = false,
  className,
  translations,
}: SectionCardEmptyProps) {
  return (
    <Card
      id={id}
      className={cn("scroll-mt-24 border-dashed", className)}
    >
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        {icon && (
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            {icon}
          </div>
        )}
        <h3 className="mb-2 font-semibold">
          {number}. {title}
        </h3>
        <p className="mb-4 text-sm text-muted-foreground">
          {translations?.noContent || "This section has no content yet."}
        </p>
        {onGenerate && (
          <Button onClick={onGenerate} disabled={isGenerating}>
            <Wand2 className="mr-2 h-4 w-4" />
            {isGenerating
              ? translations?.generating || "Generating..."
              : translations?.generate || "Generate with AI"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Loading skeleton
export function SectionCardSkeleton() {
  return (
    <Card className="scroll-mt-24">
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
          <div className="h-6 w-48 animate-pulse rounded bg-muted" />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-4 w-full animate-pulse rounded bg-muted" />
        <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  );
}
