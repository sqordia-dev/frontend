import { useState, useCallback, useRef, useEffect } from 'react';
import { CmsContentBlock } from '@/lib/cms-types';

interface HistoryEntry {
  blocks: CmsContentBlock[];
  timestamp: number;
  description?: string;
}

interface UndoRedoState {
  canUndo: boolean;
  canRedo: boolean;
  undoCount: number;
  redoCount: number;
}

interface UseCmsUndoRedoOptions {
  /** Maximum number of history entries to keep */
  maxHistory?: number;
  /** Debounce time in ms for grouping rapid changes */
  debounceMs?: number;
}

interface UseCmsUndoRedoReturn extends UndoRedoState {
  /** Push a new state to history */
  pushState: (blocks: CmsContentBlock[], description?: string) => void;
  /** Undo to previous state */
  undo: () => CmsContentBlock[] | null;
  /** Redo to next state */
  redo: () => CmsContentBlock[] | null;
  /** Clear all history */
  clearHistory: () => void;
  /** Initialize with a starting state */
  initialize: (blocks: CmsContentBlock[]) => void;
  /** Get current state without modifying history */
  getCurrentState: () => CmsContentBlock[] | null;
}

/**
 * Hook for managing undo/redo functionality in the CMS editor
 *
 * Usage:
 * ```tsx
 * const { canUndo, canRedo, pushState, undo, redo, initialize } = useCmsUndoRedo();
 *
 * // Initialize with current blocks
 * useEffect(() => {
 *   initialize(blocks);
 * }, []);
 *
 * // Push state on block change
 * const handleBlockChange = (blockId, content) => {
 *   const newBlocks = updateBlock(blocks, blockId, content);
 *   pushState(newBlocks, `Updated ${blockId}`);
 *   setBlocks(newBlocks);
 * };
 *
 * // Handle undo
 * const handleUndo = () => {
 *   const previousState = undo();
 *   if (previousState) setBlocks(previousState);
 * };
 * ```
 */
export function useCmsUndoRedo({
  maxHistory = 50,
  debounceMs = 500,
}: UseCmsUndoRedoOptions = {}): UseCmsUndoRedoReturn {
  // History stack: past entries
  const [past, setPast] = useState<HistoryEntry[]>([]);
  // Current state
  const [present, setPresent] = useState<HistoryEntry | null>(null);
  // Future stack: entries for redo
  const [future, setFuture] = useState<HistoryEntry[]>([]);

  // Debounce timer ref
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Pending state for debouncing
  const pendingRef = useRef<{ blocks: CmsContentBlock[]; description?: string } | null>(null);

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Initialize with starting state
  const initialize = useCallback((blocks: CmsContentBlock[]) => {
    setPast([]);
    setPresent({
      blocks: JSON.parse(JSON.stringify(blocks)), // Deep clone
      timestamp: Date.now(),
    });
    setFuture([]);
    pendingRef.current = null;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  // Push new state to history (with debouncing)
  const pushState = useCallback((blocks: CmsContentBlock[], description?: string) => {
    // Clear any pending debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Store pending state
    pendingRef.current = { blocks, description };

    // Debounce the actual push
    debounceRef.current = setTimeout(() => {
      const pending = pendingRef.current;
      if (!pending) return;

      setPresent((currentPresent) => {
        if (!currentPresent) {
          // No present state, just set it
          return {
            blocks: JSON.parse(JSON.stringify(pending.blocks)),
            timestamp: Date.now(),
            description: pending.description,
          };
        }

        // Move current present to past
        setPast((currentPast) => {
          const newPast = [...currentPast, currentPresent];
          // Limit history size
          if (newPast.length > maxHistory) {
            return newPast.slice(newPast.length - maxHistory);
          }
          return newPast;
        });

        // Clear future (new branch)
        setFuture([]);

        // Return new present
        return {
          blocks: JSON.parse(JSON.stringify(pending.blocks)),
          timestamp: Date.now(),
          description: pending.description,
        };
      });

      pendingRef.current = null;
      debounceRef.current = null;
    }, debounceMs);
  }, [maxHistory, debounceMs]);

  // Undo to previous state
  const undo = useCallback((): CmsContentBlock[] | null => {
    if (past.length === 0) return null;

    // Flush any pending state first
    if (pendingRef.current && debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
      pendingRef.current = null;
    }

    let result: CmsContentBlock[] | null = null;

    setPast((currentPast) => {
      const newPast = [...currentPast];
      const previous = newPast.pop();

      if (!previous) return currentPast;

      setPresent((currentPresent) => {
        if (currentPresent) {
          setFuture((currentFuture) => [currentPresent, ...currentFuture]);
        }
        result = previous.blocks;
        return previous;
      });

      return newPast;
    });

    return result;
  }, [past.length]);

  // Redo to next state
  const redo = useCallback((): CmsContentBlock[] | null => {
    if (future.length === 0) return null;

    let result: CmsContentBlock[] | null = null;

    setFuture((currentFuture) => {
      const newFuture = [...currentFuture];
      const next = newFuture.shift();

      if (!next) return currentFuture;

      setPresent((currentPresent) => {
        if (currentPresent) {
          setPast((currentPast) => [...currentPast, currentPresent]);
        }
        result = next.blocks;
        return next;
      });

      return newFuture;
    });

    return result;
  }, [future.length]);

  // Clear all history
  const clearHistory = useCallback(() => {
    setPast([]);
    setFuture([]);
    pendingRef.current = null;
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  // Get current state
  const getCurrentState = useCallback((): CmsContentBlock[] | null => {
    return present?.blocks ?? null;
  }, [present]);

  return {
    canUndo: past.length > 0,
    canRedo: future.length > 0,
    undoCount: past.length,
    redoCount: future.length,
    pushState,
    undo,
    redo,
    clearHistory,
    initialize,
    getCurrentState,
  };
}

export default useCmsUndoRedo;
