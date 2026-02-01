import * as React from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PreviewSidebar, PreviewSidebarCompact } from "./PreviewSidebar";
import type { PreviewSection } from "./PreviewSidebar";
import { cn } from "@/lib/utils";

interface PreviewLayoutProps {
  planTitle: string;
  planDescription?: string;
  sections: PreviewSection[];
  activeSection: string | null;
  onSectionClick: (sectionId: string) => void;
  onExport?: () => void;
  onShare?: () => void;
  onPrint?: () => void;
  onBack?: () => void;
  children: React.ReactNode;
  className?: string;
  sidebarClassName?: string;
  contentClassName?: string;
  translations?: {
    back?: string;
    export?: string;
    share?: string;
    print?: string;
    tableOfContents?: string;
    menu?: string;
  };
}

export function PreviewLayout({
  planTitle,
  planDescription,
  sections,
  activeSection,
  onSectionClick,
  onExport,
  onShare,
  onPrint,
  onBack,
  children,
  className,
  sidebarClassName,
  contentClassName,
  translations,
}: PreviewLayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleSectionClick = (sectionId: string) => {
    onSectionClick(sectionId);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={cn("flex h-screen bg-background", className)}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <PreviewSidebar
          planTitle={planTitle}
          planDescription={planDescription}
          sections={sections}
          activeSection={activeSection}
          onSectionClick={onSectionClick}
          onExport={onExport}
          onShare={onShare}
          onPrint={onPrint}
          onBack={onBack}
          className={sidebarClassName}
          translations={translations}
        />
      </div>

      {/* Mobile Header & Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex items-center justify-between border-b bg-card px-4 py-3 lg:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">
                  {translations?.menu || "Open menu"}
                </span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>{translations?.tableOfContents || "Navigation"}</SheetTitle>
              </SheetHeader>
              <PreviewSidebar
                planTitle={planTitle}
                planDescription={planDescription}
                sections={sections}
                activeSection={activeSection}
                onSectionClick={handleSectionClick}
                onExport={onExport}
                onShare={onShare}
                onPrint={onPrint}
                onBack={onBack}
                translations={translations}
              />
            </SheetContent>
          </Sheet>

          <h1 className="flex-1 truncate text-center font-semibold">
            {planTitle}
          </h1>

          <div className="flex items-center gap-1">
            {onExport && (
              <Button variant="ghost" size="icon" onClick={onExport}>
                <span className="sr-only">
                  {translations?.export || "Export"}
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" x2="12" y1="15" y2="3" />
                </svg>
              </Button>
            )}
          </div>
        </header>

        {/* Mobile Section Pills */}
        <div className="border-b lg:hidden">
          <PreviewSidebarCompact
            sections={sections}
            activeSection={activeSection}
            onSectionClick={onSectionClick}
          />
        </div>

        {/* Main Content */}
        <ScrollArea className="flex-1">
          <main
            className={cn(
              "mx-auto max-w-4xl px-4 py-6 lg:px-8 lg:py-8",
              contentClassName
            )}
          >
            {children}
          </main>
        </ScrollArea>
      </div>
    </div>
  );
}

// Simpler layout without sidebar (for print view or focused reading)
interface PreviewContentLayoutProps {
  planTitle: string;
  children: React.ReactNode;
  className?: string;
  showHeader?: boolean;
  headerActions?: React.ReactNode;
  onBack?: () => void;
  translations?: {
    back?: string;
  };
}

export function PreviewContentLayout({
  planTitle,
  children,
  className,
  showHeader = true,
  headerActions,
  onBack,
  translations,
}: PreviewContentLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {showHeader && (
        <header className="sticky top-0 z-10 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
          <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4 lg:px-8">
            <div className="flex items-center gap-4">
              {onBack && (
                <Button variant="ghost" size="sm" onClick={onBack}>
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
                    className="mr-1"
                  >
                    <path d="m15 18-6-6 6-6" />
                  </svg>
                  {translations?.back || "Back"}
                </Button>
              )}
              <h1 className="text-lg font-semibold">{planTitle}</h1>
            </div>
            {headerActions}
          </div>
        </header>
      )}

      <main className="mx-auto max-w-4xl px-4 py-6 lg:px-8 lg:py-8">
        {children}
      </main>
    </div>
  );
}
