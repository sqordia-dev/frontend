import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Edit history entry for undo/redo support
 */
interface HistoryEntry<T> {
  content: T;
  timestamp: number;
}

/**
 * Save state for inline editing
 */
export type InlineEditSaveState = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Options for useInlineEdit hook
 */
export interface UseInlineEditOptions<T> {
  /** Initial content value */
  initialContent: T;
  /** Save function that persists content */
  onSave: (content: T) => Promise<void>;
  /** Debounce delay in milliseconds (default: 2000) */
  debounceMs?: number;
  /** Whether autosave is enabled (default: true) */
  autosave?: boolean;
  /** Maximum history entries for undo (default: 50) */
  maxHistorySize?: number;
  /** Callback when edit mode changes */
  onEditModeChange?: (isEditing: boolean) => void;
}

/**
 * Return value from useInlineEdit hook
 */
export interface UseInlineEditReturn<T> {
  /** Current content value */
  content: T;
  /** Whether currently in edit mode */
  isEditing: boolean;
  /** Whether content has unsaved changes */
  isDirty: boolean;
  /** Current save state */
  saveState: InlineEditSaveState;
  /** Error message if save failed */
  error: string | null;
  /** Start editing */
  startEditing: () => void;
  /** Stop editing (will trigger save if dirty) */
  stopEditing: () => void;
  /** Update content value */
  updateContent: (newContent: T) => void;
  /** Manually trigger save */
  save: () => Promise<void>;
  /** Save immediately without debounce */
  saveNow: () => Promise<void>;
  /** Cancel editing and revert to last saved state */
  cancel: () => void;
  /** Undo last change */
  undo: () => void;
  /** Redo previously undone change */
  redo: () => void;
  /** Whether undo is available */
  canUndo: boolean;
  /** Whether redo is available */
  canRedo: boolean;
  /** Reset to initial content */
  reset: () => void;
}

/**
 * Hook for managing inline editing with autosave, debounce, and undo/redo support
 *
 * @param options Configuration options
 * @returns Edit state and control functions
 */
export function useInlineEdit<T>({
  initialContent,
  onSave,
  debounceMs = 2000,
  autosave = true,
  maxHistorySize = 50,
  onEditModeChange,
}: UseInlineEditOptions<T>): UseInlineEditReturn<T> {
  // Current content state
  const [content, setContent] = useState<T>(initialContent);
  const [lastSavedContent, setLastSavedContent] = useState<T>(initialContent);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);

  // Save state
  const [saveState, setSaveState] = useState<InlineEditSaveState>('idle');
  const [error, setError] = useState<string | null>(null);

  // History for undo/redo
  const [history, setHistory] = useState<HistoryEntry<T>[]>([
    { content: initialContent, timestamp: Date.now() },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Refs for tracking
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);
  const pendingSaveRef = useRef<T | null>(null);

  // Check if content is dirty (has unsaved changes)
  const isDirty = JSON.stringify(content) !== JSON.stringify(lastSavedContent);

  // Check if undo/redo is available
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // Update initial content when it changes externally
  useEffect(() => {
    if (!isEditing && !isDirty) {
      setContent(initialContent);
      setLastSavedContent(initialContent);
      setHistory([{ content: initialContent, timestamp: Date.now() }]);
      setHistoryIndex(0);
    }
  }, [initialContent, isEditing, isDirty]);

  // Perform the actual save
  const performSave = useCallback(async (contentToSave: T) => {
    if (isSavingRef.current) {
      pendingSaveRef.current = contentToSave;
      return;
    }

    isSavingRef.current = true;
    setSaveState('saving');
    setError(null);

    try {
      await onSave(contentToSave);
      setSaveState('saved');
      setLastSavedContent(contentToSave);

      // Clear saved status after 2 seconds
      setTimeout(() => {
        setSaveState((current) => (current === 'saved' ? 'idle' : current));
      }, 2000);

      // Check for pending save
      if (pendingSaveRef.current !== null) {
        const pending = pendingSaveRef.current;
        pendingSaveRef.current = null;
        isSavingRef.current = false;
        await performSave(pending);
        return;
      }
    } catch (err) {
      console.error('Inline edit save failed:', err);
      setSaveState('error');
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      isSavingRef.current = false;
    }
  }, [onSave]);

  // Debounced save function
  const save = useCallback(async () => {
    if (!autosave || !isDirty) return;

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Schedule save after debounce delay
    debounceTimerRef.current = setTimeout(() => {
      performSave(content);
    }, debounceMs);
  }, [content, performSave, debounceMs, autosave, isDirty]);

  // Immediate save without debounce
  const saveNow = useCallback(async () => {
    if (!isDirty) return;

    // Clear any pending debounced save
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    await performSave(content);
  }, [content, performSave, isDirty]);

  // Add to history
  const addToHistory = useCallback((newContent: T) => {
    setHistory((prev) => {
      // Remove any redo history
      const newHistory = prev.slice(0, historyIndex + 1);

      // Add new entry
      newHistory.push({ content: newContent, timestamp: Date.now() });

      // Limit history size
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
        setHistoryIndex((i) => Math.max(0, i - 1));
      }

      return newHistory;
    });
    setHistoryIndex((prev) => Math.min(prev + 1, maxHistorySize - 1));
  }, [historyIndex, maxHistorySize]);

  // Update content with history tracking
  const updateContent = useCallback((newContent: T) => {
    setContent(newContent);
    addToHistory(newContent);

    // Trigger autosave if enabled
    if (autosave && isEditing) {
      save();
    }
  }, [addToHistory, autosave, isEditing, save]);

  // Start editing
  const startEditing = useCallback(() => {
    setIsEditing(true);
    onEditModeChange?.(true);
  }, [onEditModeChange]);

  // Stop editing
  const stopEditing = useCallback(() => {
    setIsEditing(false);
    onEditModeChange?.(false);

    // Save on exit if dirty
    if (isDirty) {
      saveNow();
    }
  }, [isDirty, saveNow, onEditModeChange]);

  // Cancel editing and revert changes
  const cancel = useCallback(() => {
    // Clear any pending save
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    // Revert to last saved content
    setContent(lastSavedContent);
    setHistory([{ content: lastSavedContent, timestamp: Date.now() }]);
    setHistoryIndex(0);
    setSaveState('idle');
    setError(null);
    setIsEditing(false);
    onEditModeChange?.(false);
  }, [lastSavedContent, onEditModeChange]);

  // Undo
  const undo = useCallback(() => {
    if (!canUndo) return;

    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    setContent(history[newIndex].content);

    // Trigger autosave
    if (autosave && isEditing) {
      save();
    }
  }, [canUndo, historyIndex, history, autosave, isEditing, save]);

  // Redo
  const redo = useCallback(() => {
    if (!canRedo) return;

    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    setContent(history[newIndex].content);

    // Trigger autosave
    if (autosave && isEditing) {
      save();
    }
  }, [canRedo, historyIndex, history, autosave, isEditing, save]);

  // Reset to initial content
  const reset = useCallback(() => {
    setContent(initialContent);
    setLastSavedContent(initialContent);
    setHistory([{ content: initialContent, timestamp: Date.now() }]);
    setHistoryIndex(0);
    setSaveState('idle');
    setError(null);
  }, [initialContent]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isEditing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y for redo
      if ((e.ctrlKey || e.metaKey) && ((e.key === 'z' && e.shiftKey) || e.key === 'y')) {
        e.preventDefault();
        redo();
      }
      // Ctrl/Cmd + S for save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveNow();
      }
      // Escape to cancel
      if (e.key === 'Escape') {
        cancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isEditing, undo, redo, saveNow, cancel]);

  return {
    content,
    isEditing,
    isDirty,
    saveState,
    error,
    startEditing,
    stopEditing,
    updateContent,
    save,
    saveNow,
    cancel,
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
  };
}

export default useInlineEdit;
