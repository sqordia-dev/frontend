import React, { useRef, useEffect, useCallback } from 'react';
import Editor, { OnMount, Monaco } from '@monaco-editor/react';
import type { editor, IPosition } from 'monaco-editor';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  PROMPT_LANGUAGE_ID,
  promptLanguageDefinition,
  promptLightThemeData,
  promptDarkThemeData,
  KNOWN_VARIABLES,
  createVariableCompletions,
} from '../../../lib/monaco/promptLanguage';
import { cn } from '../../../lib/utils';

interface MonacoPromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  readOnly?: boolean;
  showLineNumbers?: boolean;
  showMinimap?: boolean;
  className?: string;
  onFocus?: () => void;
  onBlur?: () => void;
}

const LIGHT_THEME_NAME = 'sqordia-prompt-light';
const DARK_THEME_NAME = 'sqordia-prompt-dark';

let languageRegistered = false;

export function MonacoPromptEditor({
  value,
  onChange,
  label,
  placeholder,
  minHeight = 200,
  maxHeight = 500,
  readOnly = false,
  showLineNumbers = true,
  showMinimap = false,
  className,
  onFocus,
  onBlur,
}: MonacoPromptEditorProps) {
  const { theme } = useTheme();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);

  // Calculate editor height based on content
  const lineCount = value.split('\n').length;
  const lineHeight = 20;
  const calculatedHeight = Math.min(
    Math.max(lineCount * lineHeight + 40, minHeight),
    maxHeight
  );

  // Register language and themes
  const handleEditorWillMount = useCallback((monaco: Monaco) => {
    if (!languageRegistered) {
      // Register the custom language
      monaco.languages.register({ id: PROMPT_LANGUAGE_ID });
      monaco.languages.setMonarchTokensProvider(PROMPT_LANGUAGE_ID, promptLanguageDefinition);

      // Register completion provider
      monaco.languages.registerCompletionItemProvider(PROMPT_LANGUAGE_ID, {
        triggerCharacters: ['{'],
        provideCompletionItems: (model: editor.ITextModel, position: IPosition) => {
          const textUntilPosition = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column,
          });

          // Check if we're inside or starting a variable
          const match = textUntilPosition.match(/\{\{?$/);
          if (!match) {
            return { suggestions: [] };
          }

          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn - match[0].length,
            endColumn: word.endColumn,
          };

          return {
            suggestions: createVariableCompletions(range),
          };
        },
      });

      // Register hover provider
      monaco.languages.registerHoverProvider(PROMPT_LANGUAGE_ID, {
        provideHover: (model: editor.ITextModel, position: IPosition) => {
          const word = model.getWordAtPosition(position);
          if (!word) return null;

          // Check if the word is a known variable
          const lineContent = model.getLineContent(position.lineNumber);
          const variableMatch = lineContent.match(/\{\{(\w+)\}\}/g);

          if (variableMatch) {
            const variableName = word.word;
            if (KNOWN_VARIABLES.includes(variableName)) {
              return {
                contents: [
                  { value: `**Variable**: \`{{${variableName}}}\`` },
                  { value: `This placeholder will be replaced with the actual ${variableName.replace(/([A-Z])/g, ' $1').toLowerCase()} at generation time.` },
                ],
              };
            }
          }

          return null;
        },
      });

      // Register themes
      monaco.editor.defineTheme(LIGHT_THEME_NAME, promptLightThemeData);
      monaco.editor.defineTheme(DARK_THEME_NAME, promptDarkThemeData);

      languageRegistered = true;
    }

    monacoRef.current = monaco;
  }, []);

  // Handle editor mount
  const handleEditorMount: OnMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Set initial theme
    monaco.editor.setTheme(theme === 'dark' ? DARK_THEME_NAME : LIGHT_THEME_NAME);

    // Focus handlers
    editor.onDidFocusEditorText(() => {
      onFocus?.();
    });

    editor.onDidBlurEditorText(() => {
      onBlur?.();
    });

    // Format on paste
    editor.onDidPaste(() => {
      // Optionally format or process pasted content
    });
  }, [theme, onFocus, onBlur]);

  // Update theme when it changes
  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(
        theme === 'dark' ? DARK_THEME_NAME : LIGHT_THEME_NAME
      );
    }
  }, [theme]);

  // Handle value changes
  const handleChange = useCallback((newValue: string | undefined) => {
    onChange(newValue ?? '');
  }, [onChange]);

  return (
    <div className={cn('relative', className)}>
      {label && (
        <label className="block text-xs font-medium text-warm-gray-500 mb-2">
          {label}
        </label>
      )}
      <div
        className={cn(
          'border rounded-xl overflow-hidden transition-colors',
          'border-warm-gray-200 dark:border-warm-gray-700',
          'focus-within:ring-2 focus-within:ring-momentum-orange focus-within:border-transparent'
        )}
      >
        <Editor
          height={calculatedHeight}
          language={PROMPT_LANGUAGE_ID}
          value={value}
          onChange={handleChange}
          beforeMount={handleEditorWillMount}
          onMount={handleEditorMount}
          options={{
            readOnly,
            minimap: { enabled: showMinimap },
            lineNumbers: showLineNumbers ? 'on' : 'off',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            wrappingStrategy: 'advanced',
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', monospace",
            lineHeight: lineHeight,
            padding: { top: 12, bottom: 12 },
            scrollbar: {
              vertical: 'auto',
              horizontal: 'hidden',
              useShadows: false,
              verticalScrollbarSize: 8,
            },
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            renderLineHighlight: 'line',
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
            bracketPairColorization: { enabled: false },
            guides: { indentation: false },
            folding: false,
            glyphMargin: false,
            contextmenu: true,
            quickSuggestions: {
              other: true,
              comments: false,
              strings: true,
            },
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'on',
            tabCompletion: 'on',
            wordBasedSuggestions: 'off',
            parameterHints: { enabled: false },
            hover: { enabled: true, delay: 300 },
            links: false,
            colorDecorators: false,
            renderWhitespace: 'none',
            renderControlCharacters: false,
            unicodeHighlight: { ambiguousCharacters: false },
          }}
          loading={
            <div className="flex items-center justify-center h-full bg-warm-gray-50 dark:bg-warm-gray-800">
              <div className="w-6 h-6 border-2 border-momentum-orange border-t-transparent rounded-full animate-spin" />
            </div>
          }
        />
        {placeholder && !value && (
          <div className="absolute top-3 left-14 pointer-events-none text-warm-gray-400 dark:text-warm-gray-500 text-sm font-mono">
            {placeholder}
          </div>
        )}
      </div>
    </div>
  );
}

export default MonacoPromptEditor;
