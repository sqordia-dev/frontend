import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { maintenanceService } from '../lib/maintenance-service';
import { MaintenanceStatus } from '../types/maintenance';

interface MaintenanceContextType {
  /** Current maintenance status */
  status: MaintenanceStatus | null;
  /** Whether the initial status check is loading */
  isLoading: boolean;
  /** Whether the app is currently in maintenance mode */
  isInMaintenance: boolean;
  /** Manually refetch the maintenance status */
  refetch: () => Promise<void>;
  /** Time remaining until estimated end */
  timeRemaining: { hours: number; minutes: number; seconds: number } | null;
}

const MaintenanceContext = createContext<MaintenanceContextType | undefined>(undefined);

interface MaintenanceProviderProps {
  children: ReactNode;
  /** Polling interval in milliseconds (default: 10 seconds) */
  pollInterval?: number;
  /** Whether to enable polling (default: true) */
  enablePolling?: boolean;
}

/**
 * Provider component that manages maintenance mode state.
 * Polls the maintenance API and provides status to all children.
 */
export function MaintenanceProvider({
  children,
  pollInterval = 10000,
  enablePolling = true
}: MaintenanceProviderProps) {
  const [status, setStatus] = useState<MaintenanceStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  const refetch = useCallback(async () => {
    try {
      const newStatus = await maintenanceService.getStatus();
      setStatus(newStatus);
    } catch (error) {
      console.error('Failed to fetch maintenance status:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial fetch and polling
  useEffect(() => {
    if (!enablePolling) {
      refetch();
      return;
    }

    const cleanup = maintenanceService.pollStatus((newStatus) => {
      setStatus(newStatus);
      setIsLoading(false);
    }, pollInterval);

    return cleanup;
  }, [pollInterval, enablePolling, refetch]);

  // Update time remaining every second when in maintenance
  useEffect(() => {
    if (!status?.isEnabled || !status?.estimatedEnd) {
      setTimeRemaining(null);
      return;
    }

    const updateTimeRemaining = () => {
      const remaining = maintenanceService.getTimeRemaining(status.estimatedEnd);
      setTimeRemaining(remaining);
    };

    updateTimeRemaining();
    const intervalId = setInterval(updateTimeRemaining, 1000);

    return () => clearInterval(intervalId);
  }, [status?.isEnabled, status?.estimatedEnd]);

  const isInMaintenance = status?.isEnabled ?? false;

  return (
    <MaintenanceContext.Provider
      value={{
        status,
        isLoading,
        isInMaintenance,
        refetch,
        timeRemaining
      }}
    >
      {children}
    </MaintenanceContext.Provider>
  );
}

/**
 * Hook to access maintenance mode context.
 * Must be used within a MaintenanceProvider.
 */
export function useMaintenance(): MaintenanceContextType {
  const context = useContext(MaintenanceContext);
  if (context === undefined) {
    throw new Error('useMaintenance must be used within a MaintenanceProvider');
  }
  return context;
}

/**
 * Hook to check if user can bypass maintenance mode.
 * Returns true if maintenance is enabled but admin bypass is allowed and user is admin.
 */
export function useCanBypassMaintenance(isAdmin: boolean): boolean {
  const { status, isInMaintenance } = useMaintenance();

  if (!isInMaintenance) return true; // Not in maintenance, no bypass needed
  if (!status?.allowAdminAccess) return false; // Admin access not allowed
  return isAdmin;
}
