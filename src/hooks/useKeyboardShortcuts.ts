import { useEffect, useCallback, useRef } from "react";

export interface KeyboardShortcut {
  /** The key to listen for (e.g., "k", "Escape", "Enter") */
  key: string;
  /** Require Ctrl key (or Cmd on Mac) */
  ctrlKey?: boolean;
  /** Require Meta/Cmd key */
  metaKey?: boolean;
  /** Require Shift key */
  shiftKey?: boolean;
  /** Require Alt key */
  altKey?: boolean;
  /** The action to perform */
  action: (event: KeyboardEvent) => void;
  /** Description for help/documentation */
  description?: string;
  /** Whether to prevent default browser behavior */
  preventDefault?: boolean;
  /** Whether the shortcut is currently enabled */
  enabled?: boolean;
}

interface UseKeyboardShortcutsOptions {
  /** Whether shortcuts are enabled globally */
  enabled?: boolean;
  /** Elements to ignore shortcuts in (e.g., inputs) */
  ignoreElements?: string[];
  /** Whether to use capture phase */
  capture?: boolean;
}

const defaultIgnoreElements = ["INPUT", "TEXTAREA", "SELECT", "[contenteditable]"];

/**
 * Hook for registering keyboard shortcuts
 *
 * @example
 * ```tsx
 * useKeyboardShortcuts([
 *   {
 *     key: "k",
 *     ctrlKey: true,
 *     action: () => setCommandPaletteOpen(true),
 *     description: "Open command palette",
 *   },
 *   {
 *     key: "Escape",
 *     action: () => closeModal(),
 *     description: "Close modal",
 *   },
 * ]);
 * ```
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options: UseKeyboardShortcutsOptions = {}
) {
  const {
    enabled = true,
    ignoreElements = defaultIgnoreElements,
    capture = false,
  } = options;

  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      // Check if we should ignore this event based on the target element
      const target = event.target as HTMLElement;
      const shouldIgnore = ignoreElements.some((selector) => {
        if (selector.startsWith("[")) {
          return target.matches(selector);
        }
        return target.tagName === selector;
      });

      // Still allow Escape key in ignored elements
      if (shouldIgnore && event.key !== "Escape") {
        return;
      }

      for (const shortcut of shortcutsRef.current) {
        if (shortcut.enabled === false) continue;

        const keyMatches =
          event.key.toLowerCase() === shortcut.key.toLowerCase();

        // Handle Ctrl/Cmd key (use metaKey on Mac, ctrlKey on other platforms)
        const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
        const ctrlMatches = shortcut.ctrlKey
          ? isMac
            ? event.metaKey
            : event.ctrlKey
          : !event.ctrlKey && !event.metaKey;

        const metaMatches = shortcut.metaKey
          ? event.metaKey
          : !shortcut.ctrlKey && !event.metaKey;

        const shiftMatches = shortcut.shiftKey
          ? event.shiftKey
          : !event.shiftKey;

        const altMatches = shortcut.altKey ? event.altKey : !event.altKey;

        if (
          keyMatches &&
          ctrlMatches &&
          (shortcut.ctrlKey || metaMatches) &&
          shiftMatches &&
          altMatches
        ) {
          if (shortcut.preventDefault !== false) {
            event.preventDefault();
          }
          shortcut.action(event);
          return;
        }
      }
    },
    [enabled, ignoreElements]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown, capture);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, capture);
    };
  }, [handleKeyDown, capture]);
}

/**
 * Hook for a single keyboard shortcut
 *
 * @example
 * ```tsx
 * useKeyboardShortcut("Escape", () => closeModal());
 * useKeyboardShortcut("k", () => openSearch(), { ctrlKey: true });
 * ```
 */
export function useKeyboardShortcut(
  key: string,
  action: (event: KeyboardEvent) => void,
  options: Omit<KeyboardShortcut, "key" | "action"> & UseKeyboardShortcutsOptions = {}
) {
  const { enabled = true, ignoreElements, capture, ...shortcutOptions } = options;

  useKeyboardShortcuts(
    [
      {
        key,
        action,
        ...shortcutOptions,
      },
    ],
    { enabled, ignoreElements, capture }
  );
}

/**
 * Format a keyboard shortcut for display
 *
 * @example
 * formatShortcut({ key: "k", ctrlKey: true }) // "⌘K" on Mac, "Ctrl+K" on Windows
 */
export function formatShortcut(shortcut: Pick<KeyboardShortcut, "key" | "ctrlKey" | "metaKey" | "shiftKey" | "altKey">): string {
  const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  const parts: string[] = [];

  if (shortcut.ctrlKey) {
    parts.push(isMac ? "⌘" : "Ctrl");
  }
  if (shortcut.metaKey) {
    parts.push(isMac ? "⌘" : "Win");
  }
  if (shortcut.altKey) {
    parts.push(isMac ? "⌥" : "Alt");
  }
  if (shortcut.shiftKey) {
    parts.push(isMac ? "⇧" : "Shift");
  }

  // Format special keys
  let key = shortcut.key;
  switch (key.toLowerCase()) {
    case "escape":
      key = "Esc";
      break;
    case "enter":
      key = "↵";
      break;
    case "arrowup":
      key = "↑";
      break;
    case "arrowdown":
      key = "↓";
      break;
    case "arrowleft":
      key = "←";
      break;
    case "arrowright":
      key = "→";
      break;
    case "backspace":
      key = "⌫";
      break;
    case "delete":
      key = "Del";
      break;
    case " ":
      key = "Space";
      break;
    default:
      key = key.toUpperCase();
  }

  parts.push(key);

  return isMac ? parts.join("") : parts.join("+");
}

/**
 * Keyboard Shortcut Display Component Helper
 *
 * Returns JSX-friendly parts for displaying shortcuts
 */
export function getShortcutParts(shortcut: Pick<KeyboardShortcut, "key" | "ctrlKey" | "metaKey" | "shiftKey" | "altKey">): string[] {
  const isMac = typeof navigator !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0;

  const parts: string[] = [];

  if (shortcut.ctrlKey) {
    parts.push(isMac ? "⌘" : "Ctrl");
  }
  if (shortcut.metaKey) {
    parts.push(isMac ? "⌘" : "Win");
  }
  if (shortcut.altKey) {
    parts.push(isMac ? "⌥" : "Alt");
  }
  if (shortcut.shiftKey) {
    parts.push(isMac ? "⇧" : "Shift");
  }

  let key = shortcut.key;
  switch (key.toLowerCase()) {
    case "escape":
      key = "Esc";
      break;
    case "enter":
      key = "↵";
      break;
    case " ":
      key = "Space";
      break;
    default:
      key = key.toUpperCase();
  }

  parts.push(key);

  return parts;
}
