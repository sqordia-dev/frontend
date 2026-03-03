import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Minus,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  FileText,
  User,
  Zap,
} from 'lucide-react';
import { DiffEditor } from '@monaco-editor/react';
import { PromptImprovementExplanation } from '../../../types/prompt-registry';

interface ImprovementPreviewProps {
  originalSystem: string;
  originalUser: string;
  improvedSystem: string;
  improvedUser: string;
  improvements: PromptImprovementExplanation[];
  summary: string;
  model: string;
  tokensUsed: number;
}

type ViewTab = 'system' | 'user';

export const ImprovementPreview: React.FC<ImprovementPreviewProps> = ({
  originalSystem,
  originalUser,
  improvedSystem,
  improvedUser,
  improvements,
  summary,
}) => {
  const [activeTab, setActiveTab] = useState<ViewTab>('system');
  const [expandedImprovements, setExpandedImprovements] = useState<Set<number>>(new Set([0]));

  const toggleImprovement = (index: number) => {
    setExpandedImprovements((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  // Count changes for each type
  const systemHasChanges = originalSystem !== improvedSystem;
  const userHasChanges = originalUser !== improvedUser;

  const getAreaColor = (area: string) => {
    const areaLower = area.toLowerCase();
    if (areaLower.includes('clarity')) return 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400';
    if (areaLower.includes('specific')) return 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400';
    if (areaLower.includes('format') || areaLower.includes('structure')) return 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400';
    return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300';
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-500/10 dark:to-purple-500/10 border border-violet-200 dark:border-violet-500/30">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-500/20">
            <Zap className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h3 className="font-medium text-violet-900 dark:text-violet-200">
              Improvement Summary
            </h3>
            <p className="mt-1 text-sm text-violet-700 dark:text-violet-300">
              {summary}
            </p>
            <div className="flex items-center gap-4 mt-3">
              <span className="flex items-center gap-1 text-xs">
                <Plus className="w-3 h-3 text-green-500" />
                <span className="text-green-600 dark:text-green-400">
                  {improvements.length} improvements
                </span>
              </span>
              {systemHasChanges && (
                <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <FileText className="w-3 h-3" />
                  System prompt modified
                </span>
              )}
              {userHasChanges && (
                <span className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
                  <User className="w-3 h-3" />
                  User template modified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-200 dark:border-zinc-700">
        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'system'
              ? 'border-violet-500 text-violet-600 dark:text-violet-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          <FileText className="w-4 h-4" />
          System Prompt
          {systemHasChanges && (
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400">
              Changed
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('user')}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'user'
              ? 'border-violet-500 text-violet-600 dark:text-violet-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          <User className="w-4 h-4" />
          User Template
          {userHasChanges && (
            <span className="px-1.5 py-0.5 text-xs rounded-full bg-violet-100 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400">
              Changed
            </span>
          )}
        </button>
      </div>

      {/* Diff View */}
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-zinc-50 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Minus className="w-3 h-3 text-red-500" />
              <span className="text-zinc-600 dark:text-zinc-400">Original</span>
            </span>
            <ArrowRight className="w-4 h-4 text-zinc-400" />
            <span className="flex items-center gap-1">
              <Plus className="w-3 h-3 text-green-500" />
              <span className="text-zinc-600 dark:text-zinc-400">Improved</span>
            </span>
          </div>
        </div>
        <DiffEditor
          height="300px"
          original={activeTab === 'system' ? originalSystem : originalUser}
          modified={activeTab === 'system' ? improvedSystem : improvedUser}
          language="markdown"
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            renderSideBySide: true,
            fontSize: 13,
            lineNumbers: 'off',
          }}
        />
      </div>

      {/* Improvements List */}
      {improvements.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Detailed Improvements ({improvements.length})
          </h3>
          <div className="space-y-2">
            {improvements.map((improvement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden"
              >
                <button
                  onClick={() => toggleImprovement(index)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-750 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded ${getAreaColor(improvement.area)}`}>
                      {improvement.area}
                    </span>
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                      {improvement.description}
                    </span>
                  </div>
                  {expandedImprovements.has(index) ? (
                    <ChevronUp className="w-4 h-4 text-zinc-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400" />
                  )}
                </button>
                {expandedImprovements.has(index) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50"
                  >
                    <div className="space-y-3">
                      {improvement.before && (
                        <div>
                          <span className="text-xs font-medium text-red-600 dark:text-red-400 uppercase">
                            Before
                          </span>
                          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 bg-red-50 dark:bg-red-500/10 px-3 py-2 rounded border-l-2 border-red-300 dark:border-red-500">
                            {improvement.before}
                          </p>
                        </div>
                      )}
                      {improvement.after && (
                        <div>
                          <span className="text-xs font-medium text-green-600 dark:text-green-400 uppercase">
                            After
                          </span>
                          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 bg-green-50 dark:bg-green-500/10 px-3 py-2 rounded border-l-2 border-green-300 dark:border-green-500">
                            {improvement.after}
                          </p>
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase">
                          Reason
                        </span>
                        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                          {improvement.reason}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImprovementPreview;
