import { apiClient } from './api-client';
import { MaintenanceStatus, DEFAULT_MAINTENANCE_CONTENT } from '../types/maintenance';

// Static fallback URL for when the API is completely down
const STATIC_STATUS_URL = '/maintenance-status.json';

/**
 * Service for fetching and monitoring maintenance mode status.
 */
export const maintenanceService = {
  /**
   * Get the current maintenance status.
   * First tries the API, then falls back to a static JSON file.
   */
  async getStatus(): Promise<MaintenanceStatus | null> {
    try {
      // Try API first
      const response = await apiClient.get<MaintenanceStatus>('/api/v1/maintenance/status');
      return response.data;
    } catch (error: any) {
      // If API is down (network error or 5xx), try static file
      if (error.code === 'ERR_NETWORK' || error.response?.status >= 500) {
        return this.getStaticStatus();
      }

      // For other errors (4xx, etc.), return null (not in maintenance)
      console.warn('Failed to fetch maintenance status:', error.message);
      return null;
    }
  },

  /**
   * Fetch maintenance status from static JSON file.
   * Used as a fallback when the API is completely down.
   */
  async getStaticStatus(): Promise<MaintenanceStatus | null> {
    try {
      const response = await fetch(STATIC_STATUS_URL, {
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      // Ensure the static file has the required structure
      return {
        isEnabled: data.isEnabled ?? false,
        reason: data.reason,
        startedAt: data.startedAt,
        estimatedEnd: data.estimatedEnd,
        progressPercent: data.progressPercent ?? 0,
        currentStep: data.currentStep,
        deploymentId: data.deploymentId,
        type: data.type ?? 'Deployment',
        allowAdminAccess: data.allowAdminAccess ?? false,
        autoDisableAt: data.autoDisableAt,
        content: data.content ?? DEFAULT_MAINTENANCE_CONTENT
      };
    } catch (error) {
      console.warn('Failed to fetch static maintenance status:', error);
      return null;
    }
  },

  /**
   * Start polling for maintenance status changes.
   * @param callback Function called with the status on each poll
   * @param intervalMs Polling interval in milliseconds (default: 10 seconds)
   * @returns Cleanup function to stop polling
   */
  pollStatus(
    callback: (status: MaintenanceStatus | null) => void,
    intervalMs: number = 10000
  ): () => void {
    let isActive = true;

    const poll = async () => {
      if (!isActive) return;

      const status = await this.getStatus();
      if (isActive) {
        callback(status);
      }
    };

    // Initial poll
    poll();

    // Set up interval
    const intervalId = setInterval(poll, intervalMs);

    // Return cleanup function
    return () => {
      isActive = false;
      clearInterval(intervalId);
    };
  },

  /**
   * Calculate time remaining until estimated end.
   * @param estimatedEnd ISO date string
   * @returns Object with hours, minutes, seconds, or null if no estimate
   */
  getTimeRemaining(estimatedEnd?: string): { hours: number; minutes: number; seconds: number } | null {
    if (!estimatedEnd) return null;

    const endTime = new Date(estimatedEnd).getTime();
    const now = Date.now();
    const diff = Math.max(0, endTime - now);

    if (diff === 0) return null;

    const seconds = Math.floor((diff / 1000) % 60);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const hours = Math.floor(diff / (1000 * 60 * 60));

    return { hours, minutes, seconds };
  },

  /**
   * Format time remaining as a human-readable string.
   * @param estimatedEnd ISO date string
   * @param language 'en' or 'fr'
   */
  formatTimeRemaining(estimatedEnd?: string, language: 'en' | 'fr' = 'en'): string {
    const remaining = this.getTimeRemaining(estimatedEnd);
    if (!remaining) return language === 'fr' ? 'Bientot' : 'Soon';

    const { hours, minutes, seconds } = remaining;

    if (hours > 0) {
      return language === 'fr'
        ? `${hours}h ${minutes}m restantes`
        : `${hours}h ${minutes}m remaining`;
    }

    if (minutes > 0) {
      return language === 'fr'
        ? `${minutes}m ${seconds}s restantes`
        : `${minutes}m ${seconds}s remaining`;
    }

    return language === 'fr'
      ? `${seconds}s restantes`
      : `${seconds}s remaining`;
  }
};
