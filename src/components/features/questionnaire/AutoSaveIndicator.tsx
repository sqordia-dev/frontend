import * as React from "react";
import { Check, Cloud, CloudOff, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type SaveStatus = "idle" | "saving" | "saved" | "error" | "offline";

interface AutoSaveIndicatorProps {
  status: SaveStatus;
  lastSaved?: Date;
  error?: string;
  className?: string;
  showTimestamp?: boolean;
}

export function AutoSaveIndicator({
  status,
  lastSaved,
  error,
  className,
  showTimestamp = true,
}: AutoSaveIndicatorProps) {
  const [timeAgo, setTimeAgo] = React.useState<string>("");

  React.useEffect(() => {
    if (!lastSaved || !showTimestamp) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diff = now.getTime() - lastSaved.getTime();
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);

      if (seconds < 5) {
        setTimeAgo("Just now");
      } else if (seconds < 60) {
        setTimeAgo(`${seconds}s ago`);
      } else if (minutes < 60) {
        setTimeAgo(`${minutes}m ago`);
      } else {
        setTimeAgo(`${hours}h ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 10000);

    return () => clearInterval(interval);
  }, [lastSaved, showTimestamp]);

  const renderContent = () => {
    switch (status) {
      case "saving":
        return (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            <span className="text-muted-foreground">Saving...</span>
          </>
        );

      case "saved":
        return (
          <>
            <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
            <span className="text-green-600 dark:text-green-500">Saved</span>
            {showTimestamp && timeAgo && (
              <span className="text-muted-foreground">{timeAgo}</span>
            )}
          </>
        );

      case "error":
        return (
          <>
            <AlertCircle className="h-3.5 w-3.5 text-destructive" />
            <span className="text-destructive">
              {error || "Failed to save"}
            </span>
          </>
        );

      case "offline":
        return (
          <>
            <CloudOff className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-500" />
            <span className="text-yellow-600 dark:text-yellow-500">Offline</span>
          </>
        );

      case "idle":
      default:
        return (
          <>
            <Cloud className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">
              {showTimestamp && timeAgo ? `Last saved ${timeAgo}` : "Auto-save enabled"}
            </span>
          </>
        );
    }
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs font-medium transition-opacity",
        className
      )}
      role="status"
      aria-live="polite"
    >
      {renderContent()}
    </div>
  );
}

// Hook for managing auto-save status
interface UseAutoSaveStatusOptions {
  onSave: () => Promise<void>;
  debounceMs?: number;
  dependencies?: unknown[];
}

export function useAutoSaveStatus({
  onSave,
  debounceMs = 1000,
  dependencies = [],
}: UseAutoSaveStatusOptions) {
  const [status, setStatus] = React.useState<SaveStatus>("idle");
  const [lastSaved, setLastSaved] = React.useState<Date | undefined>();
  const [error, setError] = React.useState<string | undefined>();
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const isOnline = useOnlineStatus();

  React.useEffect(() => {
    if (!isOnline) {
      setStatus("offline");
      return;
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set up debounced save
    timeoutRef.current = setTimeout(async () => {
      try {
        setStatus("saving");
        setError(undefined);
        await onSave();
        setStatus("saved");
        setLastSaved(new Date());

        // Reset to idle after a delay
        setTimeout(() => {
          setStatus("idle");
        }, 2000);
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Save failed");
      }
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [...dependencies, isOnline]);

  const reset = React.useCallback(() => {
    setStatus("idle");
    setError(undefined);
  }, []);

  const triggerSave = React.useCallback(async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    try {
      setStatus("saving");
      setError(undefined);
      await onSave();
      setStatus("saved");
      setLastSaved(new Date());
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Save failed");
    }
  }, [onSave]);

  return {
    status,
    lastSaved,
    error,
    reset,
    triggerSave,
  };
}

// Online status hook
function useOnlineStatus() {
  const [isOnline, setIsOnline] = React.useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );

  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
}

// Compact variant for tight spaces
interface AutoSaveIndicatorCompactProps {
  status: SaveStatus;
  className?: string;
}

export function AutoSaveIndicatorCompact({
  status,
  className,
}: AutoSaveIndicatorCompactProps) {
  const getIcon = () => {
    switch (status) {
      case "saving":
        return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
      case "saved":
        return <Check className="h-4 w-4 text-green-600 dark:text-green-500" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case "offline":
        return <CloudOff className="h-4 w-4 text-yellow-600 dark:text-yellow-500" />;
      default:
        return <Cloud className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getTitle = () => {
    switch (status) {
      case "saving":
        return "Saving...";
      case "saved":
        return "All changes saved";
      case "error":
        return "Failed to save";
      case "offline":
        return "You are offline";
      default:
        return "Auto-save enabled";
    }
  };

  return (
    <div
      className={cn("flex items-center justify-center", className)}
      title={getTitle()}
      role="status"
      aria-label={getTitle()}
    >
      {getIcon()}
    </div>
  );
}
