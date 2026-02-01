import * as React from "react";
import { FileText, Download, Share2, ChevronLeft, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export interface PreviewSection {
  id: string;
  number: number;
  title: string;
  icon?: React.ReactNode;
  hasContent?: boolean;
}

interface PreviewSidebarProps {
  planTitle: string;
  planDescription?: string;
  sections: PreviewSection[];
  activeSection: string | null;
  onSectionClick: (sectionId: string) => void;
  onExport?: () => void;
  onShare?: () => void;
  onPrint?: () => void;
  onBack?: () => void;
  className?: string;
  translations?: {
    back?: string;
    export?: string;
    share?: string;
    print?: string;
    tableOfContents?: string;
  };
}

export function PreviewSidebar({
  planTitle,
  planDescription,
  sections,
  activeSection,
  onSectionClick,
  onExport,
  onShare,
  onPrint,
  onBack,
  className,
  translations,
}: PreviewSidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full w-64 flex-col border-r bg-card",
        className
      )}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 p-4">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="justify-start -ml-2 text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            {translations?.back || "Back"}
          </Button>
        )}

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
              <FileText className="h-4 w-4" />
            </div>
            <h2 className="font-semibold text-sm line-clamp-1">{planTitle}</h2>
          </div>
          {planDescription && (
            <p className="text-xs text-muted-foreground line-clamp-2 pl-10">
              {planDescription}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              className="flex-1"
            >
              <Download className="mr-1.5 h-3.5 w-3.5" />
              {translations?.export || "Export"}
            </Button>
          )}
          {onShare && (
            <Button variant="outline" size="icon" onClick={onShare}>
              <Share2 className="h-4 w-4" />
              <span className="sr-only">{translations?.share || "Share"}</span>
            </Button>
          )}
          {onPrint && (
            <Button variant="outline" size="icon" onClick={onPrint}>
              <Printer className="h-4 w-4" />
              <span className="sr-only">{translations?.print || "Print"}</span>
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Table of Contents */}
      <div className="flex-1 overflow-hidden">
        <div className="px-4 py-3">
          <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            {translations?.tableOfContents || "Table of Contents"}
          </h3>
        </div>

        <ScrollArea className="h-[calc(100%-3rem)]">
          <nav className="px-2 pb-4" aria-label="Sections">
            <ul className="space-y-1">
              {sections.map((section) => (
                <li key={section.id}>
                  <button
                    onClick={() => onSectionClick(section.id)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      activeSection === section.id
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground",
                      !section.hasContent && "opacity-50"
                    )}
                    disabled={!section.hasContent}
                  >
                    <span
                      className={cn(
                        "flex h-6 w-6 shrink-0 items-center justify-center rounded text-xs font-medium",
                        activeSection === section.id
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {section.number}
                    </span>
                    <span className="truncate">{section.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </ScrollArea>
      </div>
    </aside>
  );
}

// Compact version for mobile
interface PreviewSidebarCompactProps {
  sections: PreviewSection[];
  activeSection: string | null;
  onSectionClick: (sectionId: string) => void;
  className?: string;
}

export function PreviewSidebarCompact({
  sections,
  activeSection,
  onSectionClick,
  className,
}: PreviewSidebarCompactProps) {
  return (
    <div className={cn("flex items-center gap-1 overflow-x-auto p-2", className)}>
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => onSectionClick(section.id)}
          className={cn(
            "flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
            activeSection === section.id
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
          disabled={!section.hasContent}
        >
          <span>{section.number}</span>
          <span className="hidden sm:inline">{section.title}</span>
        </button>
      ))}
    </div>
  );
}
