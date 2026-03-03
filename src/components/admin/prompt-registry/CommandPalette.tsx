import React, { useEffect, useState, useCallback } from 'react';
import { Command } from 'cmdk';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Save,
  Play,
  History,
  Wand2,
  FileText,
  Settings,
  Maximize2,
  Minimize2,
  Command as CommandIcon,
  Plus,
  Copy,
  Download,
  ChevronRight,
  Keyboard,
} from 'lucide-react';
import './CommandPalette.css';

export interface CommandPaletteAction {
  id: string;
  label: string;
  description?: string;
  shortcut?: string[];
  icon?: React.ReactNode;
  group?: string;
  disabled?: boolean;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  actions: CommandPaletteAction[];
}

const KEYBOARD_SHORTCUT_MAP: Record<string, string> = {
  meta: '\u2318', // Cmd
  ctrl: 'Ctrl',
  alt: 'Alt',
  shift: '\u21E7', // Shift arrow
  enter: '\u21B5', // Enter
  escape: 'Esc',
};

const formatShortcut = (keys: string[]) => {
  return keys.map(key => KEYBOARD_SHORTCUT_MAP[key.toLowerCase()] || key.toUpperCase());
};

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  actions,
}) => {
  const [search, setSearch] = useState('');

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Reset search when closing
  useEffect(() => {
    if (!isOpen) {
      setSearch('');
    }
  }, [isOpen]);

  const handleSelect = useCallback((actionId: string) => {
    const action = actions.find(a => a.id === actionId);
    if (action && !action.disabled) {
      action.action();
      onClose();
    }
  }, [actions, onClose]);

  // Group actions by their group property
  const groupedActions = actions.reduce<Record<string, CommandPaletteAction[]>>((acc, action) => {
    const group = action.group || 'Actions';
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(action);
    return acc;
  }, {});

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.15 }}
          className="w-full max-w-xl overflow-hidden rounded-xl bg-white dark:bg-zinc-900 shadow-2xl border border-zinc-200 dark:border-zinc-800"
          onClick={(e) => e.stopPropagation()}
        >
          <Command
            className="command-palette"
            loop
            shouldFilter={true}
            onKeyDown={(e) => {
              // Allow escape to close
              if (e.key === 'Escape') {
                e.preventDefault();
                onClose();
              }
            }}
          >
            {/* Search Input */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
              <Search className="w-5 h-5 text-zinc-400" />
              <Command.Input
                value={search}
                onValueChange={setSearch}
                placeholder="Type a command or search..."
                className="flex-1 bg-transparent outline-none text-zinc-900 dark:text-white placeholder-zinc-400 text-base"
                autoFocus
              />
              <div className="flex items-center gap-1 text-xs text-zinc-400">
                <kbd className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono">Esc</kbd>
                <span>to close</span>
              </div>
            </div>

            {/* Command List */}
            <Command.List className="max-h-[400px] overflow-y-auto p-2">
              <Command.Empty className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
                No results found.
              </Command.Empty>

              {Object.entries(groupedActions).map(([group, groupActions]) => (
                <Command.Group key={group} heading={group} className="command-group">
                  <div className="px-2 py-1.5 text-xs font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
                    {group}
                  </div>
                  {groupActions.map((action) => (
                    <Command.Item
                      key={action.id}
                      value={`${action.label} ${action.description || ''}`}
                      onSelect={() => handleSelect(action.id)}
                      disabled={action.disabled}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-colors ${
                        action.disabled
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 data-[selected=true]:bg-zinc-100 dark:data-[selected=true]:bg-zinc-800'
                      }`}
                    >
                      {/* Icon */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                        {action.icon || <CommandIcon className="w-4 h-4" />}
                      </div>

                      {/* Label & Description */}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-zinc-900 dark:text-white truncate">
                          {action.label}
                        </div>
                        {action.description && (
                          <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                            {action.description}
                          </div>
                        )}
                      </div>

                      {/* Shortcut */}
                      {action.shortcut && (
                        <div className="flex items-center gap-0.5">
                          {formatShortcut(action.shortcut).map((key, idx) => (
                            <kbd
                              key={idx}
                              className="px-1.5 py-0.5 text-xs font-mono rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700"
                            >
                              {key}
                            </kbd>
                          ))}
                        </div>
                      )}
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
            </Command.List>

            {/* Footer */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
              <div className="flex items-center gap-4 text-xs text-zinc-400">
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 font-mono">\u2191</kbd>
                  <kbd className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 font-mono">\u2193</kbd>
                  <span>Navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 font-mono">\u21B5</kbd>
                  <span>Select</span>
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-zinc-400">
                <Keyboard className="w-3 h-3" />
                <span>Command Palette</span>
              </div>
            </div>
          </Command>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Hook to manage command palette with keyboard shortcuts
export const useCommandPalette = (actions: CommandPaletteAction[]) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Open with Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        return;
      }

      // Execute action shortcuts when palette is closed
      if (!isOpen) {
        actions.forEach(action => {
          if (!action.shortcut || action.disabled) return;

          const keys = action.shortcut.map(k => k.toLowerCase());
          const metaRequired = keys.includes('meta') || keys.includes('cmd');
          const ctrlRequired = keys.includes('ctrl');
          const altRequired = keys.includes('alt');
          const shiftRequired = keys.includes('shift');
          const mainKey = keys.find(k => !['meta', 'cmd', 'ctrl', 'alt', 'shift'].includes(k));

          if (!mainKey) return;

          const metaMatch = metaRequired ? e.metaKey : !e.metaKey || ctrlRequired;
          const ctrlMatch = ctrlRequired ? e.ctrlKey : !e.ctrlKey || metaRequired;
          const altMatch = altRequired ? e.altKey : !e.altKey;
          const shiftMatch = shiftRequired ? e.shiftKey : !e.shiftKey;
          const keyMatch = e.key.toLowerCase() === mainKey.toLowerCase();

          if (metaMatch && ctrlMatch && altMatch && shiftMatch && keyMatch) {
            e.preventDefault();
            action.action();
          }
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [actions, isOpen]);

  return {
    isOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen(prev => !prev),
  };
};

// Default actions factory for prompt registry
export const createPromptRegistryActions = (handlers: {
  onSave: () => void;
  onTest: () => void;
  onHistory: () => void;
  onImprove: () => void;
  onToggleFullscreen: () => void;
  onDuplicate?: () => void;
  onExport?: () => void;
  canSave: boolean;
  canTest: boolean;
  hasPrompt: boolean;
  language?: 'en' | 'fr';
}): CommandPaletteAction[] => {
  const lang = handlers.language || 'en';

  return [
    {
      id: 'save',
      label: lang === 'fr' ? 'Sauvegarder le prompt' : 'Save Prompt',
      description: lang === 'fr' ? 'Sauvegarder les modifications' : 'Save current changes',
      shortcut: ['Meta', 'S'],
      icon: <Save className="w-4 h-4" />,
      group: lang === 'fr' ? 'Actions' : 'Actions',
      disabled: !handlers.canSave,
      action: handlers.onSave,
    },
    {
      id: 'test',
      label: lang === 'fr' ? 'Tester le prompt' : 'Run Test',
      description: lang === 'fr' ? 'Exécuter le test du prompt' : 'Execute prompt test',
      shortcut: ['Meta', 'Enter'],
      icon: <Play className="w-4 h-4" />,
      group: lang === 'fr' ? 'Actions' : 'Actions',
      disabled: !handlers.canTest,
      action: handlers.onTest,
    },
    {
      id: 'improve',
      label: lang === 'fr' ? 'Améliorer avec IA' : 'Improve with AI',
      description: lang === 'fr' ? 'Améliorer le prompt avec l\'IA' : 'Use AI to improve prompt',
      shortcut: ['Meta', 'I'],
      icon: <Wand2 className="w-4 h-4" />,
      group: lang === 'fr' ? 'IA' : 'AI',
      disabled: !handlers.hasPrompt,
      action: handlers.onImprove,
    },
    {
      id: 'history',
      label: lang === 'fr' ? 'Historique des versions' : 'View History',
      description: lang === 'fr' ? 'Voir l\'historique des versions' : 'View version history',
      shortcut: ['Meta', 'H'],
      icon: <History className="w-4 h-4" />,
      group: lang === 'fr' ? 'Navigation' : 'Navigation',
      disabled: !handlers.hasPrompt,
      action: handlers.onHistory,
    },
    {
      id: 'fullscreen',
      label: lang === 'fr' ? 'Plein écran' : 'Toggle Fullscreen',
      description: lang === 'fr' ? 'Basculer en mode plein écran' : 'Toggle fullscreen editor',
      shortcut: ['Meta', 'Shift', 'F'],
      icon: <Maximize2 className="w-4 h-4" />,
      group: lang === 'fr' ? 'Vue' : 'View',
      action: handlers.onToggleFullscreen,
    },
  ];
};

export default CommandPalette;
