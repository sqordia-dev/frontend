import * as React from "react";
import {
  FileText,
  FileSpreadsheet,
  Download,
  Loader2,
  Check,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export type ExportFormat = "pdf" | "docx" | "xlsx" | "html";

interface ExportOption {
  format: ExportFormat;
  label: string;
  description: string;
  icon: React.ReactNode;
  iconColor: string;
  disabled?: boolean;
  disabledReason?: string;
}

const defaultExportOptions: ExportOption[] = [
  {
    format: "pdf",
    label: "PDF Document",
    description: "Best for printing and sharing. Professional layout preserved.",
    icon: <FileText className="h-5 w-5" />,
    iconColor: "text-red-500",
  },
  {
    format: "docx",
    label: "Word Document",
    description: "Best for editing and collaboration. Fully editable format.",
    icon: <FileText className="h-5 w-5" />,
    iconColor: "text-blue-500",
  },
  {
    format: "xlsx",
    label: "Excel Spreadsheet",
    description: "Financial projections and tables only. Data analysis ready.",
    icon: <FileSpreadsheet className="h-5 w-5" />,
    iconColor: "text-green-500",
  },
];

type ExportStatus = "idle" | "exporting" | "success" | "error";

interface ExportDialogProps {
  planTitle?: string;
  onExport: (format: ExportFormat) => Promise<void>;
  exportOptions?: ExportOption[];
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  translations?: {
    title?: string;
    description?: string;
    cancel?: string;
    export?: string;
    exporting?: string;
    success?: string;
    error?: string;
    tryAgain?: string;
  };
}

export function ExportDialog({
  planTitle,
  onExport,
  exportOptions = defaultExportOptions,
  trigger,
  open,
  onOpenChange,
  translations,
}: ExportDialogProps) {
  const [selectedFormat, setSelectedFormat] = React.useState<ExportFormat>("pdf");
  const [status, setStatus] = React.useState<ExportStatus>("idle");
  const [error, setError] = React.useState<string | null>(null);

  const handleExport = async () => {
    try {
      setStatus("exporting");
      setError(null);
      await onExport(selectedFormat);
      setStatus("success");
      // Auto-close after success
      setTimeout(() => {
        onOpenChange?.(false);
        setStatus("idle");
      }, 1500);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Export failed");
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setStatus("idle");
      setError(null);
    }
    onOpenChange?.(newOpen);
  };

  const selectedOption = exportOptions.find((opt) => opt.format === selectedFormat);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {translations?.title || "Export Business Plan"}
          </DialogTitle>
          <DialogDescription>
            {planTitle
              ? `Export "${planTitle}" to your preferred format.`
              : translations?.description ||
                "Choose your preferred format for exporting."}
          </DialogDescription>
        </DialogHeader>

        {status === "success" ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
              <Check className="h-6 w-6" />
            </div>
            <p className="font-medium">
              {translations?.success || "Export complete!"}
            </p>
            <p className="text-sm text-muted-foreground">
              Your {selectedOption?.label.toLowerCase()} is ready.
            </p>
          </div>
        ) : status === "error" ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-6 w-6" />
            </div>
            <p className="font-medium">
              {translations?.error || "Export failed"}
            </p>
            <p className="mb-4 text-sm text-muted-foreground">{error}</p>
            <Button variant="outline" onClick={() => setStatus("idle")}>
              {translations?.tryAgain || "Try again"}
            </Button>
          </div>
        ) : (
          <>
            <RadioGroup
              value={selectedFormat}
              onValueChange={(value) => setSelectedFormat(value as ExportFormat)}
              className="gap-3"
            >
              {exportOptions.map((option) => (
                <div key={option.format}>
                  <Label
                    htmlFor={option.format}
                    className={cn(
                      "flex cursor-pointer items-start gap-4 rounded-lg border p-4 transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      selectedFormat === option.format &&
                        "border-primary bg-accent",
                      option.disabled && "cursor-not-allowed opacity-50"
                    )}
                  >
                    <RadioGroupItem
                      value={option.format}
                      id={option.format}
                      disabled={option.disabled}
                      className="mt-1"
                    />
                    <div className={cn("shrink-0", option.iconColor)}>
                      {option.icon}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">
                        {option.disabled
                          ? option.disabledReason
                          : option.description}
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={status === "exporting"}
              >
                {translations?.cancel || "Cancel"}
              </Button>
              <Button onClick={handleExport} disabled={status === "exporting"}>
                {status === "exporting" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {translations?.exporting || "Exporting..."}
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    {translations?.export || "Export"}
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Simple export button that triggers immediate download
interface ExportButtonProps {
  format: ExportFormat;
  onExport: (format: ExportFormat) => Promise<void>;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
  children?: React.ReactNode;
}

export function ExportButton({
  format,
  onExport,
  variant = "outline",
  size = "default",
  className,
  children,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = React.useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(format);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={isExporting}
      className={className}
    >
      {isExporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      {children || `Export as ${format.toUpperCase()}`}
    </Button>
  );
}
