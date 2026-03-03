import React, { useEffect, useRef, useCallback } from 'react';
import { DiffEditor, Monaco } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  PROMPT_LANGUAGE_ID,
  promptLanguageDefinition,
  promptLightThemeData,
  promptDarkThemeData,
} from '../../../lib/monaco/promptLanguage';
import { cn } from '../../../lib/utils';
import { ArrowLeftRight, GitCompare } from 'lucide-react';

interface VersionDiffViewerProps {
  originalContent: string;
  modifiedContent: string;
  originalLabel?: string;
  modifiedLabel?: string;
  height?: number | string;
  className?: string;
  onClose?: () => void;
}

const LIGHT_THEME_NAME = 'sqordia-prompt-light';
const DARK_THEME_NAME = 'sqordia-prompt-dark';

let languageRegistered = false;

export function VersionDiffViewer({
  originalContent,
  modifiedContent,
  originalLabel = 'Previous Version',
  modifiedLabel = 'Current Version',
  height = 400,
  className,
  onClose,
}: VersionDiffViewerProps) {
  const { theme, language } = useTheme();
  const editorRef = useRef<editor.IStandaloneDiffEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  // Register language and themes
  const handleEditorWillMount = useCallback((monaco: Monaco) => {
    if (!languageRegistered) {
      monaco.languages.register({ id: PROMPT_LANGUAGE_ID });
      monaco.languages.setMonarchTokensProvider(PROMPT_LANGUAGE_ID, promptLanguageDefinition);
      monaco.editor.defineTheme(LIGHT_THEME_NAME, promptLightThemeData);
      monaco.editor.defineTheme(DARK_THEME_NAME, promptDarkThemeData);
      languageRegistered = true;
    }
    monacoRef.current = monaco;
  }, []);

  // Handle editor mount
  const handleEditorMount = useCallback((editor: editor.IStandaloneDiffEditor, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    monaco.editor.setTheme(theme === 'dark' ? DARK_THEME_NAME : LIGHT_THEME_NAME);
  }, [theme]);

  // Update theme when it changes
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(
        theme === 'dark' ? DARK_THEME_NAME : LIGHT_THEME_NAME
      );
    }
  }, [theme]);

  // Count changes
  const countChanges = () => {
    const originalLines = originalContent.split('\n');
    const modifiedLines = modifiedContent.split('\n');
    let additions = 0;
    let deletions = 0;

    // Simple line-based diff count
    const maxLines = Math.max(originalLines.length, modifiedLines.length);
    for (let i = 0; i < maxLines; i++) {
      if (originalLines[i] !== modifiedLines[i]) {
        if (i >= originalLines.length) {
          additions++;
        } else if (i >= modifiedLines.length) {
          deletions++;
        } else {
          additions++;
          deletions++;
        }
      }
    }

    return { additions, deletions };
  };

  const changes = countChanges();

  return (
    <div className={cn('flex flex-col', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-warm-gray-900 border-b border-warm-gray-200 dark:border-warm-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
            <GitCompare className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-warm-gray-900 dark:text-white">
              {language === 'fr' ? 'Comparaison de versions' : 'Version Comparison'}
            </h3>
            <div className="flex items-center gap-2 text-xs text-warm-gray-500">
              {changes.additions > 0 && (
                <span className="text-green-600 dark:text-green-400">
                  +{changes.additions} {language === 'fr' ? 'ajouts' : 'additions'}
                </span>
              )}
              {changes.additions > 0 && changes.deletions > 0 && <span>/</span>}
              {changes.deletions > 0 && (
                <span className="text-red-600 dark:text-red-400">
                  -{changes.deletions} {language === 'fr' ? 'suppressions' : 'deletions'}
                </span>
              )}
              {changes.additions === 0 && changes.deletions === 0 && (
                <span>{language === 'fr' ? 'Aucune modification' : 'No changes'}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 rounded font-medium">
              {originalLabel}
            </span>
            <ArrowLeftRight className="w-4 h-4 text-warm-gray-400" />
            <span className="px-2 py-1 bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400 rounded font-medium">
              {modifiedLabel}
            </span>
          </div>
        </div>
      </div>

      {/* Diff Editor */}
      <div
        className={cn(
          'border rounded-b-xl overflow-hidden',
          'border-warm-gray-200 dark:border-warm-gray-700'
        )}
      >
        <DiffEditor
          height={height}
          language={PROMPT_LANGUAGE_ID}
          original={originalContent}
          modified={modifiedContent}
          beforeMount={handleEditorWillMount}
          onMount={handleEditorMount}
          options={{
            readOnly: true,
            renderSideBySide: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
            lineHeight: 20,
            padding: { top: 12, bottom: 12 },
            scrollbar: {
              vertical: 'auto',
              horizontal: 'hidden',
              useShadows: false,
              verticalScrollbarSize: 8,
            },
            overviewRulerLanes: 0,
            renderLineHighlight: 'none',
            automaticLayout: true,
            diffWordWrap: 'on',
            ignoreTrimWhitespace: false,
            renderIndicators: true,
            originalEditable: false,
          }}
          loading={
            <div className="flex items-center justify-center h-full bg-warm-gray-50 dark:bg-warm-gray-800">
              <div className="w-6 h-6 border-2 border-momentum-orange border-t-transparent rounded-full animate-spin" />
            </div>
          }
        />
      </div>
    </div>
  );
}

export default VersionDiffViewer;
