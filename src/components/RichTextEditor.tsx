import { useRef, useEffect, useState } from 'react';
// Note: react-quill uses deprecated findDOMNode internally, which causes a warning in React StrictMode.
// This is a known issue with react-quill v2.0.0 and is safe to ignore.
// The warning doesn't affect functionality and will be resolved when react-quill updates.
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

  // Custom toolbar configuration
  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['blockquote'],
        ['link', 'image'],
        [{ 'align': [] }],
        ['clean']
      ],
    },
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline',
    'list', 'bullet',
    'blockquote',
    'link', 'image',
    'align'
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
        <div className="border-2 rounded-xl p-4 dark:bg-gray-800" style={{ 
          borderColor: '#1A2B47',
          backgroundColor: '#F4F7FA'
        }}>
          <div className="flex items-start justify-between mb-3">
            <h4 className="text-sm font-bold dark:text-white" style={{ color: '#1A2B47' }}>{t('richTextEditor.instructions')}</h4>
            <button
              onClick={() => setShowInstructions(false)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="text-sm leading-relaxed whitespace-pre-wrap dark:text-gray-300" style={{ color: '#1A2B47' }}>
            {instructions}
          </div>
        </div>
      )}

      {/* AI Assistant Card */}
      {onHelpMeWrite && (
        <div className="border-2 rounded-xl p-4 transition-all hover:shadow-lg" style={{ 
          borderColor: '#FF6B00',
          backgroundColor: '#F4F7FA'
        }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#FF6B00' }}>
                <Sparkles size={20} className="text-white" />
              </div>
              <div>
                <h4 className="font-bold text-sm" style={{ color: '#1A2B47' }}>{t('richTextEditor.aiAssistant')}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t('richTextEditor.aiAssistantDesc')}</p>
              </div>
            </div>
            <button
              onClick={onHelpMeWrite}
              disabled={helpMeWriteLoading || disabled}
              className="px-5 py-2.5 rounded-lg font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow-md"
              style={{ 
                backgroundColor: helpMeWriteLoading ? '#E55F00' : '#FF6B00',
                color: 'white'
              }}
              onMouseEnter={(e) => {
                if (!helpMeWriteLoading && !disabled) {
                  e.currentTarget.style.backgroundColor = '#E55F00';
                }
              }}
              onMouseLeave={(e) => {
                if (!helpMeWriteLoading && !disabled) {
                  e.currentTarget.style.backgroundColor = '#FF6B00';
                }
              }}
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
      <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
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
            font-family: inherit;
          }
          .rich-text-editor .ql-editor {
            min-height: 300px;
            padding: 16px;
          }
          .rich-text-editor .ql-editor.ql-blank::before {
            color: #9ca3af;
            font-style: normal;
          }
          .rich-text-editor .ql-toolbar {
            border-top: 1px solid #e5e7eb;
            border-left: 1px solid #e5e7eb;
            border-right: 1px solid #e5e7eb;
            border-bottom: none;
            background: #f9fafb;
            padding: 8px;
          }
          .rich-text-editor .ql-toolbar .ql-stroke {
            stroke: #374151;
          }
          .rich-text-editor .ql-toolbar .ql-fill {
            fill: #374151;
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

