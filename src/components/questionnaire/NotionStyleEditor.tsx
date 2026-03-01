import { useState, useEffect, useMemo, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { DOMParser as ProseMirrorDOMParser } from '@tiptap/pm/model';
import { marked } from 'marked';

// Create base extensions once outside component
// Note: StarterKit v3 already includes Underline, so we don't import it separately
const baseExtensions = [
  StarterKit.configure({
    heading: false, // Disable headings for questionnaire answers
  }),
];
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Sparkles,
  Send,
  Loader2,
  Check,
  CornerDownLeft,
  ChevronDown,
  Wand2,
  Minimize2,
  Maximize2,
  Briefcase,
  Lightbulb,
  Type,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

// AI Action types
export type AIActionType = 'generate' | 'polish' | 'shorten' | 'expand' | 'professional' | 'examples' | 'simplify';

interface NotionStyleEditorProps {
  value: string;
  onChange: (value: string) => void;
  onSave: () => void;
  placeholder?: string;
  isSaving?: boolean;
  isRequired?: boolean;
  minLength?: number;
  onAIAction?: (action: AIActionType) => void;
  isAIProcessing?: boolean;
  questionId: string;
}

// Translations
const TRANSLATIONS = {
  en: {
    placeholder: 'Start typing your answer...',
    words: 'words',
    chars: 'chars',
    moreNeeded: 'more needed',
    askSqordia: 'Ask Sqordia',
    saving: 'Saving...',
    saved: 'Saved',
    save: 'Save',
    ctrlEnterToSave: 'Ctrl+Enter to save',
    // Toolbar tooltips
    boldTooltip: 'Bold (Ctrl+B)',
    italicTooltip: 'Italic (Ctrl+I)',
    underlineTooltip: 'Underline (Ctrl+U)',
    bulletListTooltip: 'Bullet list',
    numberedListTooltip: 'Numbered list',
    // AI Actions
    aiActions: {
      generate: { label: 'Generate Answer', desc: 'Create an answer based on your context' },
      polish: { label: 'Polish & Improve', desc: 'Enhance clarity and flow' },
      shorten: { label: 'Make Shorter', desc: 'Condense the answer' },
      expand: { label: 'Make Longer', desc: 'Add more details' },
      professional: { label: 'More Professional', desc: 'Business-ready tone' },
      examples: { label: 'Add Examples', desc: 'Include concrete examples' },
      simplify: { label: 'Simplify', desc: 'Easier to understand' },
    },
    generateAnswer: 'Generate Answer',
  },
  fr: {
    placeholder: 'Commencez à taper votre réponse...',
    words: 'mots',
    chars: 'car.',
    moreNeeded: 'de plus requis',
    askSqordia: 'Demander à Sqordia',
    saving: 'Sauvegarde...',
    saved: 'Sauvegardé',
    save: 'Sauvegarder',
    ctrlEnterToSave: 'Ctrl+Entrée pour sauvegarder',
    // Toolbar tooltips
    boldTooltip: 'Gras (Ctrl+B)',
    italicTooltip: 'Italique (Ctrl+I)',
    underlineTooltip: 'Souligné (Ctrl+U)',
    bulletListTooltip: 'Liste à puces',
    numberedListTooltip: 'Liste numérotée',
    // AI Actions
    aiActions: {
      generate: { label: 'Générer une réponse', desc: 'Créer une réponse basée sur votre contexte' },
      polish: { label: 'Améliorer', desc: 'Clarté et fluidité' },
      shorten: { label: 'Raccourcir', desc: 'Condenser la réponse' },
      expand: { label: 'Développer', desc: 'Ajouter plus de détails' },
      professional: { label: 'Plus professionnel', desc: 'Ton affaires' },
      examples: { label: 'Ajouter des exemples', desc: 'Exemples concrets' },
      simplify: { label: 'Simplifier', desc: 'Plus facile à comprendre' },
    },
    generateAnswer: 'Générer une réponse',
  },
};

// AI Action icons
const AI_ACTION_ICONS: Record<AIActionType, React.ElementType> = {
  generate: Sparkles,
  polish: Wand2,
  shorten: Minimize2,
  expand: Maximize2,
  professional: Briefcase,
  examples: Lightbulb,
  simplify: Type,
};

// Helper to strip HTML tags for counting
function stripHtml(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

// Configure marked for safe HTML output
marked.setOptions({
  breaks: true, // Convert \n to <br>
  gfm: true, // GitHub flavored markdown
});

// Helper to detect if text contains markdown syntax
function containsMarkdown(text: string): boolean {
  const markdownPatterns = [
    /^#{1,6}\s/m,           // Headers: # Header
    /\*\*[^*]+\*\*/,        // Bold: **text**
    /\*[^*]+\*/,            // Italic: *text*
    /__[^_]+__/,            // Bold: __text__
    /_[^_]+_/,              // Italic: _text_
    /^\s*[-*+]\s/m,         // Unordered lists: - item
    /^\s*\d+\.\s/m,         // Ordered lists: 1. item
    /\[.+\]\(.+\)/,         // Links: [text](url)
    /```[\s\S]*?```/,       // Code blocks: ```code```
    /`[^`]+`/,              // Inline code: `code`
    /^\s*>/m,               // Blockquotes: > text
    /\|.+\|/,               // Tables: | cell |
  ];

  return markdownPatterns.some(pattern => pattern.test(text));
}

// Helper to detect if text is HTML/XML
function containsHtmlOrXml(text: string): boolean {
  // Check for HTML/XML tags
  return /<[a-z][\s\S]*>/i.test(text);
}

// Convert markdown to HTML, cleaning up for TipTap
function markdownToHtml(markdown: string): string {
  const html = marked.parse(markdown, { async: false }) as string;
  // Clean up the HTML for TipTap compatibility
  return html
    .replace(/<h[1-6]>/g, '<p><strong>')  // Convert headers to bold paragraphs (headings disabled)
    .replace(/<\/h[1-6]>/g, '</strong></p>')
    .trim();
}

export default function NotionStyleEditor({
  value,
  onChange,
  onSave,
  placeholder,
  isSaving = false,
  isRequired = false,
  minLength = 10,
  onAIAction,
  isAIProcessing = false,
}: NotionStyleEditorProps) {
  const { theme, language } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showAIMenu, setShowAIMenu] = useState(false);
  const aiMenuRef = useRef<HTMLDivElement>(null);

  const t = TRANSLATIONS[language as keyof typeof TRANSLATIONS] || TRANSLATIONS.en;

  // Close AI menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (aiMenuRef.current && !aiMenuRef.current.contains(event.target as Node)) {
        setShowAIMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAIAction = (action: AIActionType) => {
    setShowAIMenu(false);
    onAIAction?.(action);
  };

  // Memoize extensions to prevent recreation on each render
  const extensions = useMemo(() => [
    ...baseExtensions,
    Placeholder.configure({
      placeholder: placeholder || t.placeholder,
    }),
  ], [placeholder, t.placeholder]);

  // TipTap editor setup
  const editor = useEditor({
    extensions,
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
    editorProps: {
      attributes: {
        class: 'prose-editor focus:outline-none min-h-[120px] p-4',
        role: 'textbox',
        'aria-multiline': 'true',
        'aria-label': 'Answer editor',
      },
      handleKeyDown: (_view, event) => {
        // Handle Ctrl+Enter to save
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
          event.preventDefault();
          onSave();
          return true;
        }
        return false;
      },
      handlePaste: (view, event) => {
        const clipboardData = event.clipboardData;
        if (!clipboardData) return false;

        // Check for HTML content first (e.g., from Word, web pages)
        const htmlContent = clipboardData.getData('text/html');
        if (htmlContent && containsHtmlOrXml(htmlContent)) {
          // Let TipTap handle HTML paste natively - it does a good job
          return false;
        }

        // Get plain text content
        const textContent = clipboardData.getData('text/plain');
        if (!textContent) return false;

        // Check if text contains markdown syntax
        if (containsMarkdown(textContent)) {
          event.preventDefault();

          // Convert markdown to HTML
          const html = markdownToHtml(textContent);

          // Parse HTML into ProseMirror content
          const { schema } = view.state;
          const domParser = new DOMParser();
          const doc = domParser.parseFromString(`<body>${html}</body>`, 'text/html');

          // Use ProseMirror's DOMParser to convert DOM to slice
          const pmParser = ProseMirrorDOMParser.fromSchema(schema);
          const slice = pmParser.parseSlice(doc.body);

          // Insert the parsed content
          const tr = view.state.tr.replaceSelection(slice);
          view.dispatch(tr);

          return true;
        }

        // Check if it's XML/HTML in plain text that TipTap should handle
        if (containsHtmlOrXml(textContent)) {
          return false;
        }

        // For plain text, let default behavior handle it
        return false;
      },
    },
  });

  // Update editor content when value changes externally (e.g., AI Polish)
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;

    const currentHTML = editor.getHTML();
    // Only update if content differs and not empty placeholder
    if (value && value !== currentHTML && value !== '<p></p>') {
      editor.commands.setContent(value, { emitUpdate: false });
    }
  }, [value, editor]);

  // Calculate word and char counts
  const plainText = stripHtml(value);
  const charCount = plainText.length;
  const wordCount = plainText.trim().split(/\s+/).filter(w => w.length > 0).length;
  const isValid = !isRequired || charCount >= minLength;

  // Save indicator
  useEffect(() => {
    if (isSaving) {
      setLastSaved(null);
    } else if (charCount >= minLength) {
      setLastSaved(new Date());
    }
  }, [isSaving, charCount, minLength]);

  const bgColor = theme === 'dark' ? 'bg-gray-900' : 'bg-white';
  const borderColor = theme === 'dark' ? 'border-gray-700' : 'border-gray-200';
  const focusBorderColor = 'border-orange-500';
  const textColor = theme === 'dark' ? 'text-gray-100' : 'text-gray-900';
  const mutedColor = theme === 'dark' ? 'text-gray-500' : 'text-gray-400';
  const toolbarBg = theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50';

  // Toolbar button component
  const ToolbarBtn = ({
    onClick,
    isActive,
    tooltip,
    children,
  }: {
    onClick: () => void;
    isActive?: boolean;
    tooltip: string;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={tooltip}
      className={`
        p-1.5 rounded transition-colors
        ${isActive
          ? 'bg-orange-500/20 text-orange-500'
          : theme === 'dark'
            ? 'text-gray-400 hover:bg-gray-700 hover:text-gray-200'
            : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'
        }
      `}
    >
      {children}
    </button>
  );

  return (
    <div className="relative">
      {/* Editor Container */}
      <div
        className={`
          relative rounded-xl border-2 transition-all duration-200 overflow-hidden
          ${bgColor}
          ${isFocused ? focusBorderColor : borderColor}
          ${isFocused ? 'shadow-lg shadow-orange-500/10' : ''}
        `}
      >
        {/* Formatting Toolbar */}
        <div className={`flex items-center gap-1 px-3 py-2 border-b ${borderColor} ${toolbarBg}`}>
          <ToolbarBtn
            onClick={() => editor?.chain().focus().toggleBold().run()}
            isActive={editor?.isActive('bold')}
            tooltip={t.boldTooltip}
          >
            <Bold size={16} />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor?.chain().focus().toggleItalic().run()}
            isActive={editor?.isActive('italic')}
            tooltip={t.italicTooltip}
          >
            <Italic size={16} />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
            isActive={editor?.isActive('underline')}
            tooltip={t.underlineTooltip}
          >
            <UnderlineIcon size={16} />
          </ToolbarBtn>

          <div className={`w-px h-5 mx-1 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`} />

          <ToolbarBtn
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
            isActive={editor?.isActive('bulletList')}
            tooltip={t.bulletListTooltip}
          >
            <List size={16} />
          </ToolbarBtn>
          <ToolbarBtn
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
            isActive={editor?.isActive('orderedList')}
            tooltip={t.numberedListTooltip}
          >
            <ListOrdered size={16} />
          </ToolbarBtn>
        </div>

        {/* TipTap Editor */}
        <EditorContent
          editor={editor}
          className={`${textColor}`}
        />

        {/* Bottom Bar */}
        <div className={`
          flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-3 border-t
          ${theme === 'dark' ? 'border-gray-800' : 'border-gray-100'}
        `}>
          {/* Left: Word/Char count */}
          <div className={`flex items-center gap-2 sm:gap-4 text-xs ${mutedColor}`}>
            <span className="whitespace-nowrap">{wordCount} <span className="hidden sm:inline">{t.words}</span><span className="sm:hidden">w</span></span>
            <span className="whitespace-nowrap">{charCount} <span className="hidden sm:inline">{t.chars}</span><span className="sm:hidden">c</span></span>
            {isRequired && charCount < minLength && (
              <span className="text-orange-500 whitespace-nowrap">
                (<span className="hidden sm:inline">{minLength - charCount} {t.moreNeeded}</span><span className="sm:hidden">+{minLength - charCount}</span>)
              </span>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Ask Sqordia - Generate when empty, dropdown when has content */}
            {onAIAction && (
              <div className="relative" ref={aiMenuRef}>
                {charCount < minLength ? (
                  /* When empty: Show Generate Answer button */
                  <button
                    onClick={() => handleAIAction('generate')}
                    disabled={isAIProcessing}
                    className={`
                      flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium
                      transition-all
                      bg-gradient-to-r from-purple-500/10 to-orange-500/10 text-purple-600 dark:text-purple-400
                      hover:from-purple-500/20 hover:to-orange-500/20
                      disabled:opacity-50 disabled:cursor-not-allowed
                    `}
                  >
                    {isAIProcessing ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Sparkles size={14} />
                    )}
                    <span className="hidden sm:inline">{(t as typeof TRANSLATIONS.en).generateAnswer || t.aiActions.generate.label}</span>
                    <span className="sm:hidden">AI</span>
                  </button>
                ) : (
                  /* When has content: Show dropdown with all AI actions */
                  <>
                    <button
                      onClick={() => setShowAIMenu(!showAIMenu)}
                      disabled={isAIProcessing}
                      className={`
                        flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-medium
                        transition-all
                        bg-gradient-to-r from-purple-500/10 to-orange-500/10 text-purple-600 dark:text-purple-400
                        hover:from-purple-500/20 hover:to-orange-500/20
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      {isAIProcessing ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Sparkles size={14} />
                      )}
                      <span className="hidden sm:inline">{t.askSqordia}</span>
                      <ChevronDown size={12} className={`transition-transform ${showAIMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown menu */}
                    {showAIMenu && (
                      <div className={`
                        absolute bottom-full right-0 mb-2 w-56 rounded-xl shadow-xl border overflow-hidden z-50
                        ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}
                      `}>
                        <div className={`px-3 py-2 text-xs font-medium uppercase tracking-wide border-b
                          ${theme === 'dark' ? 'text-gray-400 border-gray-700 bg-gray-800/50' : 'text-gray-500 border-gray-100 bg-gray-50'}
                        `}>
                          <Sparkles size={12} className="inline mr-1.5" />
                          {t.askSqordia}
                        </div>
                        {(Object.keys(t.aiActions) as AIActionType[]).map((action) => {
                          const Icon = AI_ACTION_ICONS[action];
                          const actionData = t.aiActions[action];
                          return (
                            <button
                              key={action}
                              onClick={() => handleAIAction(action)}
                              className={`
                                w-full flex items-start gap-3 px-3 py-2.5 text-left transition-colors
                                ${theme === 'dark'
                                  ? 'hover:bg-gray-700/50 text-gray-200'
                                  : 'hover:bg-gray-50 text-gray-700'
                                }
                              `}
                            >
                              <Icon size={16} className="mt-0.5 text-purple-500 flex-shrink-0" />
                              <div>
                                <div className="text-sm font-medium">{actionData.label}</div>
                                <div className={`text-xs ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {actionData.desc}
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Save button */}
            <button
              onClick={onSave}
              disabled={isSaving || !isValid}
              className={`
                flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 py-1.5 rounded-lg text-xs font-medium
                transition-all
                ${isValid
                  ? 'bg-orange-500 text-white hover:bg-orange-600'
                  : 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              {isSaving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : lastSaved ? (
                <Check size={14} />
              ) : (
                <Send size={14} />
              )}
              <span className="hidden sm:inline">{isSaving ? t.saving : lastSaved ? t.saved : t.save}</span>
            </button>
          </div>
        </div>

        {/* Keyboard shortcut hint */}
        {isFocused && (
          <div className={`
            absolute -bottom-6 right-0 flex items-center gap-1 text-xs ${mutedColor}
          `}>
            <CornerDownLeft size={12} />
            <span>{t.ctrlEnterToSave}</span>
          </div>
        )}
      </div>
    </div>
  );
}
