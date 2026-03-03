import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History,
  X,
  RotateCcw,
  ChevronRight,
  GitCompare,
  Clock,
  User,
  Check,
  Loader2,
} from 'lucide-react';
import { cn } from '../../../lib/utils';
import { useTheme } from '../../../contexts/ThemeContext';
import { VersionDiffViewer } from './VersionDiffViewer';

/**
 * Simplified version history item for sidebar display.
 * Note: Full prompt content may not be available from the API history endpoint.
 */
export interface VersionHistoryItem {
  id?: string;
  version: number;
  createdAt: string;
  createdBy: string;
  systemPrompt?: string;
  userPromptTemplate?: string;
  notes?: string;
}

interface VersionHistorySidebarProps {
  isOpen: boolean;
  onClose: () => void;
  versions: VersionHistoryItem[];
  currentSystemPrompt: string;
  currentUserPromptTemplate: string;
  loading: boolean;
  onRollback: (version: VersionHistoryItem) => Promise<void>;
  promptName?: string;
}

export function VersionHistorySidebar({
  isOpen,
  onClose,
  versions,
  currentSystemPrompt,
  currentUserPromptTemplate,
  loading,
  onRollback,
  promptName,
}: VersionHistorySidebarProps) {
  const { language } = useTheme();
  const [selectedVersion, setSelectedVersion] = useState<VersionHistoryItem | null>(null);
  const [showDiff, setShowDiff] = useState(false);
  const [diffType, setDiffType] = useState<'system' | 'user'>('system');
  const [rollingBack, setRollingBack] = useState<number | null>(null);

  const handleRollback = async (version: VersionHistoryItem) => {
    setRollingBack(version.version);
    try {
      await onRollback(version);
    } finally {
      setRollingBack(null);
    }
  };

  const handleViewDiff = (version: VersionHistoryItem, type: 'system' | 'user') => {
    setSelectedVersion(version);
    setDiffType(type);
    setShowDiff(true);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return language === 'fr' ? "À l'instant" : 'Just now';
    if (diffMins < 60) return `${diffMins}m ${language === 'fr' ? 'il y a' : 'ago'}`;
    if (diffHours < 24) return `${diffHours}h ${language === 'fr' ? 'il y a' : 'ago'}`;
    return `${diffDays}d ${language === 'fr' ? 'il y a' : 'ago'}`;
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[400px] lg:w-[450px]',
              'bg-white dark:bg-warm-gray-900',
              'border-l border-warm-gray-200 dark:border-warm-gray-800',
              'flex flex-col shadow-2xl'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-warm-gray-200 dark:border-warm-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <History className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-warm-gray-900 dark:text-white">
                    {language === 'fr' ? 'Historique' : 'Version History'}
                  </h2>
                  {promptName && (
                    <p className="text-xs text-warm-gray-500 truncate max-w-[200px]">{promptName}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-warm-gray-100 dark:hover:bg-warm-gray-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-warm-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-momentum-orange" />
                </div>
              ) : versions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-warm-gray-100 dark:bg-warm-gray-800 flex items-center justify-center mb-4">
                    <History className="w-8 h-8 text-warm-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-warm-gray-700 dark:text-warm-gray-300 mb-2">
                    {language === 'fr' ? 'Aucun historique' : 'No History Yet'}
                  </h3>
                  <p className="text-sm text-warm-gray-500 max-w-[250px]">
                    {language === 'fr'
                      ? 'Les versions précédentes apparaîtront ici après les modifications'
                      : 'Previous versions will appear here after you make changes'}
                  </p>
                </div>
              ) : (
                <div className="p-4 space-y-3">
                  {/* Current Version */}
                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-green-700 dark:text-green-300">
                          {language === 'fr' ? 'Version actuelle' : 'Current Version'}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                        v{versions.length > 0 ? versions[0].version + 1 : 1}
                      </span>
                    </div>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {language === 'fr' ? 'Version en cours de modification' : 'Currently being edited'}
                    </p>
                  </div>

                  {/* Version List */}
                  {versions.map((version, index) => (
                    <div
                      key={version.id}
                      className={cn(
                        'group p-4 rounded-xl border transition-all',
                        'bg-white dark:bg-warm-gray-800',
                        'border-warm-gray-200 dark:border-warm-gray-700',
                        'hover:border-momentum-orange/50 hover:shadow-md'
                      )}
                    >
                      {/* Version Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 text-sm font-semibold bg-momentum-orange/10 text-momentum-orange rounded-lg">
                            v{version.version}
                          </span>
                          <span className="text-xs text-warm-gray-400">
                            {formatTimeAgo(version.createdAt)}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRollback(version)}
                          disabled={rollingBack === version.version}
                          className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
                            'border border-momentum-orange text-momentum-orange',
                            'hover:bg-momentum-orange hover:text-white',
                            'disabled:opacity-50 disabled:cursor-not-allowed'
                          )}
                        >
                          {rollingBack === version.version ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3.5 h-3.5" />
                          )}
                          {language === 'fr' ? 'Restaurer' : 'Rollback'}
                        </button>
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-3 text-xs text-warm-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(version.createdAt)}</span>
                        </div>
                        {version.createdBy && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{version.createdBy}</span>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      {version.notes && (
                        <p className="text-sm text-warm-gray-600 dark:text-warm-gray-400 mb-3 line-clamp-2">
                          {version.notes}
                        </p>
                      )}

                      {/* Diff Buttons */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDiff(version, 'system')}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-warm-gray-600 dark:text-warm-gray-400 bg-warm-gray-50 dark:bg-warm-gray-700 hover:bg-warm-gray-100 dark:hover:bg-warm-gray-600 rounded-lg transition-colors"
                        >
                          <GitCompare className="w-3 h-3" />
                          {language === 'fr' ? 'Diff System' : 'System Diff'}
                          <ChevronRight className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleViewDiff(version, 'user')}
                          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-warm-gray-600 dark:text-warm-gray-400 bg-warm-gray-50 dark:bg-warm-gray-700 hover:bg-warm-gray-100 dark:hover:bg-warm-gray-600 rounded-lg transition-colors"
                        >
                          <GitCompare className="w-3 h-3" />
                          {language === 'fr' ? 'Diff User' : 'User Diff'}
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Diff View Modal */}
            <AnimatePresence>
              {showDiff && selectedVersion && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.95, opacity: 0 }}
                    className="w-full max-w-5xl max-h-[85vh] bg-white dark:bg-warm-gray-900 rounded-2xl shadow-2xl overflow-hidden"
                  >
                    <div className="flex items-center justify-between px-4 py-3 border-b border-warm-gray-200 dark:border-warm-gray-800">
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 text-sm font-medium bg-momentum-orange/10 text-momentum-orange rounded">
                          v{selectedVersion.version}
                        </span>
                        <span className="text-sm text-warm-gray-500">
                          {diffType === 'system' ? 'System Prompt' : 'User Prompt Template'}
                        </span>
                      </div>
                      <button
                        onClick={() => setShowDiff(false)}
                        className="p-2 hover:bg-warm-gray-100 dark:hover:bg-warm-gray-800 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5 text-warm-gray-500" />
                      </button>
                    </div>
                    <div className="overflow-auto max-h-[calc(85vh-60px)]">
                      <VersionDiffViewer
                        originalContent={
                          diffType === 'system'
                            ? (selectedVersion.systemPrompt ?? '')
                            : (selectedVersion.userPromptTemplate ?? '')
                        }
                        modifiedContent={
                          diffType === 'system' ? currentSystemPrompt : currentUserPromptTemplate
                        }
                        originalLabel={`v${selectedVersion.version}`}
                        modifiedLabel={language === 'fr' ? 'Actuel' : 'Current'}
                        height={500}
                      />
                    </div>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default VersionHistorySidebar;
