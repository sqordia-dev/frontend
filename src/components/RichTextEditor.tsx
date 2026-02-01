import { useRef, useEffect, useState } from 'react';
// Note: react-quill uses deprecated APIs (findDOMNode, DOMNodeInserted) which cause warnings.
// These are known issues with react-quill v2.0.0 and are safe to ignore.
// The findDOMNode warning is suppressed in development via suppressWarnings utility.
// The DOMNodeInserted browser deprecation notice cannot be suppressed but is harmless.
// These warnings don't affect functionality and will be resolved when react-quill updates.
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Sparkles, Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  instructions?: string;
  onHelpMeWrite?: () => void;
  helpMeWriteLoading?: boolean;
  wordCount?: number;
  lastSaved?: string;
  disabled?: boolean;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = 'Start writing here...',
  instructions,
  onHelpMeWrite,
  helpMeWriteLoading = false,
  wordCount,
  lastSaved,
  disabled = false
}: RichTextEditorProps) {
  const { t } = useTheme();
  const quillRef = useRef<ReactQuill>(null);
  const [showInstructions, setShowInstructions] = useState(true);

  // Custom toolbar configuration with table support
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['blockquote'],
        ['link', 'image'],
        [{ 'align': [] }],
        [{ 'color': [] }, { 'background': [] }],
        ['clean']
      ],
    },
    clipboard: {
      matchVisual: false,
    },
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'blockquote',
    'link', 'image',
    'align',
    'color', 'background'
  ];

  // Calculate word count from HTML
  const getWordCount = (html: string): number => {
    if (!html) return 0;
    const text = html.replace(/<[^>]*>/g, ' ').trim();
    return text ? text.split(/\s+/).filter(word => word.length > 0).length : 0;
  };

  const currentWordCount = wordCount !== undefined ? wordCount : getWordCount(value);

  return (
    <div className="space-y-4">
      {/* Instructions Section */}
      {instructions && showInstructions && (
        <div className="border-2 rounded-xl p-4 border-[#1A2B47] bg-[#F4F7FA] dark:bg-gray-800">
          <div className="flex items-start justify-between mb-3">
            <h4 className="text-sm font-bold text-[#1A2B47] dark:text-white">{t('richTextEditor.instructions')}</h4>
            <button
              onClick={() => setShowInstructions(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="text-sm leading-relaxed whitespace-pre-wrap text-[#1A2B47] dark:text-gray-300">
            {instructions}
          </div>
        </div>
      )}

      {/* AI Assistant Card */}
      {onHelpMeWrite && (
        <div className="border-2 rounded-xl p-4 transition-all hover:shadow-lg border-[#FF6B00] bg-[#F4F7FA]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[#FF6B00]">
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#1A2B47]">{t('richTextEditor.aiAssistant')}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t('richTextEditor.aiAssistantDesc')}</p>
              </div>
            </div>
            <button
              onClick={onHelpMeWrite}
              disabled={helpMeWriteLoading || disabled}
              className="px-4 sm:px-5 py-3 sm:py-2.5 rounded-lg font-semibold text-xs sm:text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md min-h-[44px] sm:min-h-0 bg-[#FF6B00] hover:bg-[#E55F00] text-white"
            >
              {helpMeWriteLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {t('richTextEditor.generating')}
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  {t('richTextEditor.helpMeWrite')}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Rich Text Editor */}
      <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          readOnly={disabled}
          className="rich-text-editor"
        />
        <style>{`
          .rich-text-editor .ql-container {
            min-height: 300px;
            font-size: 16px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            color: #1f2937;
          }
          .dark .rich-text-editor .ql-container {
            color: #f9fafb;
          }
          .rich-text-editor .ql-editor {
            min-height: 300px;
            padding: 16px;
            color: #1f2937;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
          }
          .dark .rich-text-editor .ql-editor {
            color: #f9fafb;
            background-color: #1f2937;
          }
          .rich-text-editor .ql-editor p,
          .rich-text-editor .ql-editor h1,
          .rich-text-editor .ql-editor h2,
          .rich-text-editor .ql-editor h3,
          .rich-text-editor .ql-editor h4,
          .rich-text-editor .ql-editor h5,
          .rich-text-editor .ql-editor h6,
          .rich-text-editor .ql-editor li,
          .rich-text-editor .ql-editor span,
          .rich-text-editor .ql-editor div {
            color: inherit;
          }
          .rich-text-editor .ql-editor.ql-blank::before {
            color: #9ca3af;
            font-style: normal;
          }
          .dark .rich-text-editor .ql-editor.ql-blank::before {
            color: #6b7280;
          }
          .rich-text-editor .ql-toolbar {
            border-top: 1px solid #e5e7eb;
            border-left: 1px solid #e5e7eb;
            border-right: 1px solid #e5e7eb;
            border-bottom: none;
            background: #f9fafb;
            padding: 8px;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          @media (max-width: 640px) {
            .rich-text-editor .ql-toolbar {
              padding: 6px 4px;
            }
            .rich-text-editor .ql-toolbar .ql-formats {
              margin-right: 4px;
            }
            .rich-text-editor .ql-toolbar button {
              min-width: 32px;
              min-height: 32px;
              padding: 4px;
            }
          }
          .dark .rich-text-editor .ql-toolbar {
            background: #374151;
            border-color: #4b5563;
          }
          .rich-text-editor .ql-toolbar .ql-stroke {
            stroke: #374151;
          }
          .dark .rich-text-editor .ql-toolbar .ql-stroke {
            stroke: #d1d5db;
          }
          .rich-text-editor .ql-toolbar .ql-fill {
            fill: #374151;
          }
          .dark .rich-text-editor .ql-toolbar .ql-fill {
            fill: #d1d5db;
          }
          .rich-text-editor .ql-toolbar button:hover,
          .rich-text-editor .ql-toolbar button.ql-active {
            color: #FF6B00;
          }
          .rich-text-editor .ql-toolbar button:hover .ql-stroke,
          .rich-text-editor .ql-toolbar button.ql-active .ql-stroke {
            stroke: #FF6B00;
          }
          .rich-text-editor .ql-toolbar button:hover .ql-fill,
          .rich-text-editor .ql-toolbar button.ql-active .ql-fill {
            fill: #FF6B00;
          }
          /* Table styles in editor */
          .rich-text-editor .ql-editor table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            border: 1px solid #e5e7eb;
          }
          .rich-text-editor .ql-editor table th,
          .rich-text-editor .ql-editor table td {
            border: 1px solid #e5e7eb;
            padding: 0.5rem 0.75rem;
            text-align: left;
          }
          .rich-text-editor .ql-editor table th {
            background-color: #1A2B47;
            color: white;
            font-weight: 600;
          }
          .rich-text-editor .ql-editor table tbody tr:nth-child(even) {
            background-color: #f9fafb;
          }
          .dark .rich-text-editor .ql-editor table {
            border-color: #374151;
          }
          .dark .rich-text-editor .ql-editor table th,
          .dark .rich-text-editor .ql-editor table td {
            border-color: #374151;
          }
          .dark .rich-text-editor .ql-editor table th {
            background-color: #374151;
          }
          .dark .rich-text-editor .ql-editor table tbody tr:nth-child(even) {
            background-color: #1f2937;
          }
        `}</style>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between text-sm px-2">
        <div className="flex items-center gap-4 dark:text-gray-400" style={{ color: '#1A2B47' }}>
          <span className="font-medium">{currentWordCount} {currentWordCount === 1 ? t('richTextEditor.word') : t('richTextEditor.words')}</span>
          {lastSaved && (
            <>
              <span>•</span>
              <span>{t('richTextEditor.lastSaved')} {lastSaved}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

