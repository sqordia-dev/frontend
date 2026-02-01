import { useState, useEffect, useRef, useCallback } from 'react';
import { SaveStatus } from '../types/questionnaire';

interface UseAutoSaveOptions<T> {
  /** Data to auto-save */
  data: T;
  /** Save function that persists data */
  onSave: (data: T) => Promise<void>;
  /** Debounce delay in milliseconds (default: 2000) */
  debounceMs?: number;
  /** Whether auto-save is enabled (default: true) */
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  /** Current save status */
  status: SaveStatus;
  /** Manually trigger a save */
  save: () => Promise<void>;
  /** Force save immediately without debounce */
  saveNow: () => Promise<void>;
  /** Reset status to 'saved' */
  resetStatus: () => void;
  /** Last saved timestamp */
  lastSavedAt: Date | null;
}

/**
 * Hook for auto-saving data with debounce
 * @param options Configuration options
 * @returns Save status and control functions
 */
export function useAutoSave<T>({
  data,
  onSave,
  debounceMs = 2000,
  enabled = true,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [status, setStatus] = useState<SaveStatus>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // Refs to track state across renders
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<T>(data);
  const isSavingRef = useRef(false);
  const pendingDataRef = useRef<T | null>(null);

  // Serialize data for comparison
  const dataString = JSON.stringify(data);
  const previousDataString = JSON.stringify(previousDataRef.current);

  // Perform the actual save
  const performSave = useCallback(async (dataToSave: T) => {
    if (isSavingRef.current) {
      // Queue this save for later
      pendingDataRef.current = dataToSave;
      return;
    }

    isSavingRef.current = true;
    setStatus('saving');

    try {
      await onSave(dataToSave);
      setStatus('saved');
      setLastSavedAt(new Date());
      previousDataRef.current = dataToSave;

      // Check if there's pending data to save
      if (pendingDataRef.current !== null) {
        const pending = pendingDataRef.current;
        pendingDataRef.current = null;
        isSavingRef.current = false;
        await performSave(pending);
        return;
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
      setStatus('error');
    } finally {
      isSavingRef.current = false;
    }
  }, [onSave]);

  // Debounced save function
  const save = useCallback(async () => {
    if (!enabled) return;

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set unsaved status immediately
    setStatus('unsaved');

    // Schedule save after debounce delay
    debounceTimerRef.current = setTimeout(() => {
      performSave(data);
    }, debounceMs);
  }, [data, performSave, debounceMs, enabled]);

  // Immediate save without debounce
  const saveNow = useCallback(async () => {
    if (!enabled) return;

    // Clear any pending debounced save
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    await performSave(data);
  }, [data, performSave, enabled]);

  // Reset status
  const resetStatus = useCallback(() => {
    setStatus('saved');
  }, []);

  // Watch for data changes and trigger auto-save
  useEffect(() => {
    if (!enabled) return;

    // Check if data has changed
    if (dataString !== previousDataString) {
      save();
    }

    // Cleanup on unmount
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [dataString, previousDataString, save, enabled]);

  // Save before page unload
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (status === 'unsaved') {
        // Attempt to save synchronously (not guaranteed to complete)
        e.preventDefault();
        e.returnValue = '';

        // Try to save using sendBeacon or synchronous XHR
        // Note: This is a best-effort save
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [status, enabled]);

  return {
    status,
    save,
    saveNow,
    resetStatus,
    lastSavedAt,
  };
}

export default useAutoSave;
