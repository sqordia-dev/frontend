import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Loader2, ChevronDown, MessageSquare, Maximize2, Minimize2 } from 'lucide-react';
import { PlanSection, AIAssistAction } from '../../types/preview';
import { RichTextEditor } from '../editor';
import { parseContent, reconstructContent } from '../../utils/content-parser';
import { VisualElement } from '../../types/visual-elements';
import { EditableVisualElement } from './inline-edit';
import { Button } from '../ui/button';
import { useTheme } from '../../contexts/ThemeContext';

interface SectionEditorModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Section being edited */
  section: PlanSection | null;
  /** Callback to close modal */
  onClose: () => void;
  /** Callback when content is saved */
  onSave: (content: string) => Promise<void>;
  /** Callback for AI assist */
  onAIAssist: (action: AIAssistAction, content: string, customPrompt?: string) => Promise<string>;
}

/**
 * Helper function to get word count from HTML content
 * Strips HTML tags and counts words
 */
function getWordCountFromHtml(html: string): number {
  // Remove HTML tags
  const text = html.replace(/<[^>]*>/g, ' ').trim();
  if (!text) return 0;
  // Split by whitespace and filter empty strings
  return text.split(/\s+/).filter(Boolean).length;
}

/**
 * Helper function to get plain text content from HTML for AI assist check
 */
function getTextFromHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').trim();
}

/**
 * Full-screen modal for editing section content with rich text editor
 * Includes AI assist dropdown and word count
 * Supports formatting: bold, italic, underline, headings, lists, blockquotes, links
 * Renders visual elements (charts, tables, metrics) inline with editing support
 */
export default function SectionEditorModal({
  isOpen,
  section,
  onClose,
  onSave,
  onAIAssist,
}: SectionEditorModalProps) {
  const { t } = useTheme();

  // Keep single content string state like original, but parse for display
  const [content, setContent] = useState('');
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAILoading, setIsAILoading] = useState(false);
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customPrompt, setCustomPrompt] = useState('');

  // AI assist options with i18n
  const aiAssistOptions: { action: AIAssistAction; labelKey: string; descKey: string; icon: typeof Sparkles }[] = useMemo(() => [
    { action: 'improve', labelKey: 'planView.improve', descKey: 'editor.improveDesc', icon: Sparkles },
    { action: 'expand', labelKey: 'planView.expand', descKey: 'editor.expandDesc', icon: Maximize2 },
    { action: 'shorten', labelKey: 'editor.makeItShorter', descKey: 'editor.shorterDesc', icon: Minimize2 },
  ], []);

  // Sync content when section changes or modal opens
  useEffect(() => {
    if (isOpen && section) {
      const sectionContent = section.content ?? '';
      setContent(sectionContent);
      setHasInitialized(true);
    } else {
      setHasInitialized(false);
    }
    setError(null);
  }, [isOpen, section?.id]);

  // Derive the editor content - use local state if initialized, otherwise section content
  const editorContent = hasInitialized ? content : (section?.content ?? '');

  // Parse content to check for visual elements
  const parsedContent = useMemo(() => parseContent(editorContent), [editorContent]);

  // Calculate word count from HTML content
  const wordCount = useMemo(() => getWordCountFromHtml(editorContent), [editorContent]);

  // Check if content has text (for AI assist button)
  const hasContent = useMemo(() => getTextFromHtml(editorContent).length > 0, [editorContent]);

  // Handle visual element update - reconstruct content with updated element
  const handleVisualElementUpdate = useCallback((index: number, updatedElement: VisualElement) => {
    const blocks = [...parsedContent.blocks];
    if (blocks[index]?.type === 'visual') {
      blocks[index] = { type: 'visual', element: updatedElement };
    }
    setContent(reconstructContent(blocks));
  }, [parsedContent.blocks]);

  // Handle save
  const handleSave = useCallback(async () => {
    setIsSaving(true);
    setError(null);
    try {
      await onSave(content);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  }, [content, onSave, onClose]);

  // Handle AI assist
  const handleAIAssist = useCallback(async (action: AIAssistAction, customInstructions?: string) => {
    setShowAIMenu(false);
    setIsAILoading(true);
    setError(null);
    try {
      const improvedContent = await onAIAssist(action, content, customInstructions);
      setContent(improvedContent);
      if (action === 'custom') {
        setCustomPrompt('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI assist failed');
    } finally {
      setIsAILoading(false);
    }
  }, [content, onAIAssist]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSaving && !isAILoading) {
        onClose();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (!isSaving && !isAILoading) {
          handleSave();
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, isSaving, isAILoading, onClose, handleSave]);

  // Close AI menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowAIMenu(false);
    };

    if (showAIMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showAIMenu]);

  if (!isOpen || !section) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="editor-title"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-card rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-warm-gray-200 dark:border-border">
            <h2
              id="editor-title"
              className="text-xl font-bold text-warm-gray-900 dark:text-white"
            >
              {t('planView.editSection')}: {section.title}
            </h2>
            <button
              onClick={onClose}
              disabled={isSaving || isAILoading}
              className="p-2 text-warm-gray-500 hover:text-warm-gray-700 dark:hover:text-warm-gray-300 hover:bg-warm-gray-100 dark:hover:bg-secondary rounded-lg transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-orange-500"
              aria-label={t('editor.closeEditor')}
            >
              <X size={20} />
            </button>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-4 px-6 py-3 border-b border-warm-gray-200 dark:border-border bg-warm-gray-50 dark:bg-card/50">
            {/* AI Assist Dropdown */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAIMenu(!showAIMenu);
                }}
                disabled={isAILoading || !hasContent}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-orange-500/10 text-purple-600 dark:text-purple-400 hover:from-purple-500/20 hover:to-orange-500/20 rounded-lg font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 border border-purple-200 dark:border-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAILoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
                {t('preview.actions.aiAssist')}
                <ChevronDown size={14} className={`transition-transform ${showAIMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {showAIMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute left-0 top-full mt-1 w-80 bg-white dark:bg-card rounded-lg shadow-lg border border-warm-gray-200 dark:border-border py-1 z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className="flex items-center gap-2 px-4 py-2 border-b border-warm-gray-100 dark:border-border">
                      <Sparkles size={14} className="text-purple-500" />
                      <span className="text-xs font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                        {t('planView.aiEnhancements')}
                      </span>
                    </div>

                    {/* Action Items */}
                    {aiAssistOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <button
                          key={option.action}
                          onClick={() => handleAIAssist(option.action)}
                          className="w-full text-left px-4 py-2.5 hover:bg-warm-gray-100 dark:hover:bg-secondary transition-colors flex items-start gap-3"
                        >
                          <Icon size={16} className="text-purple-500 mt-0.5 shrink-0" />
                          <div>
                            <span className="block text-sm font-medium text-warm-gray-900 dark:text-white">
                              {t(option.labelKey)}
                            </span>
                            <span className="block text-xs text-warm-gray-500 dark:text-warm-gray-400">
                              {t(option.descKey)}
                            </span>
                          </div>
                        </button>
                      );
                    })}

                    {/* Divider */}
                    <hr className="my-2 border-warm-gray-200 dark:border-border" />

                    {/* Custom Instructions Section */}
                    <div className="px-4 py-2">
                      <div className="flex items-center gap-2 mb-2">
                        <MessageSquare size={14} className="text-purple-500" />
                        <span className="text-sm font-medium text-warm-gray-900 dark:text-white">
                          {t('editor.customInstructions')}
                        </span>
                      </div>
                      <textarea
                        value={customPrompt}
                        onChange={(e) => setCustomPrompt(e.target.value)}
                        placeholder={t('editor.customPlaceholder')}
                        rows={3}
                        aria-label={t('editor.customInstructions')}
                        className="w-full px-3 py-2 text-sm rounded-lg border border-warm-gray-300 dark:border-border bg-white dark:bg-secondary text-warm-gray-900 dark:text-white placeholder-warm-gray-500 dark:placeholder-warm-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      />
                      <button
                        onClick={() => handleAIAssist('custom', customPrompt)}
                        disabled={!customPrompt.trim() || isAILoading}
                        className="w-full mt-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-orange-500/10 text-purple-600 dark:text-purple-400 hover:from-purple-500/20 hover:to-orange-500/20 border border-purple-200 dark:border-purple-500/30 rounded-lg font-semibold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {t('editor.apply')}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Word Count */}
            <div className="ml-auto text-sm text-warm-gray-500 dark:text-warm-gray-400">
              {wordCount} {wordCount === 1 ? t('editor.word') : t('editor.words')}
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="px-6 py-3 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
              <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Content Editor - Rich text editor with visual elements */}
          <div className="flex-1 flex flex-col min-h-0 p-6 overflow-y-auto">
            {parsedContent.hasVisualElements ? (
              // Content has visual elements - render blocks separately
              <div className="space-y-6">
                {parsedContent.blocks.map((block, index) => {
                  if (block.type === 'prose') {
                    return (
                      <RichTextEditor
                        key={`prose-${index}-${section?.id}`}
                        content={block.content}
                        onChange={(newContent) => {
                          // Update the specific prose block and reconstruct content
                          const blocks = [...parsedContent.blocks];
                          blocks[index] = { type: 'prose', content: newContent };
                          setContent(reconstructContent(blocks));
                        }}
                        placeholder="Write your content..."
                        disabled={isSaving || isAILoading}
                        className="min-h-[150px]"
                      />
                    );
                  } else {
                    return (
                      <div
                        key={`visual-${block.element.id}-${index}`}
                        className="rounded-xl border border-warm-gray-200 dark:border-border bg-warm-gray-50 dark:bg-card/50 p-6"
                      >
                        <EditableVisualElement
                          element={block.element}
                          editable={!isSaving && !isAILoading}
                          onUpdate={(updatedElement) => handleVisualElementUpdate(index, updatedElement)}
                        />
                      </div>
                    );
                  }
                })}
              </div>
            ) : (
              // No visual elements - single rich text editor (original behavior)
              <RichTextEditor
                key={`${section?.id}-${isOpen}`}
                content={editorContent}
                onChange={setContent}
                placeholder="Write your section content..."
                disabled={isSaving || isAILoading}
                className="flex-1 min-h-0"
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-warm-gray-200 dark:border-border bg-warm-gray-50 dark:bg-card/50">
            <p className="text-xs text-warm-gray-500 dark:text-warm-gray-400">
              {t('editor.ctrlSToSave')}
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                disabled={isSaving || isAILoading}
              >
                {t('planView.cancel')}
              </Button>
              <Button
                variant="brand"
                onClick={handleSave}
                disabled={isSaving || isAILoading}
              >
                {isSaving && <Loader2 size={16} className="animate-spin" />}
                {isSaving ? t('planView.saving') : t('planView.saveChanges')}
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
