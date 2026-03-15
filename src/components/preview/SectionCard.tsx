import React, { useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Loader2,
} from 'lucide-react';
import { PlanSection } from '../../types/preview';
import { EditableSection } from './inline-edit';
import { parseContent } from '../../utils/content-parser';
import { VisualElementRenderer } from '../visual-elements';
import HoverActions from './HoverActions';
import { cn } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';
import { useIsTouchDevice } from '../../hooks';
import { Button } from '../ui/button';
import { sanitizeHtml } from '../../utils/sanitize';

interface SectionCardProps {
  section: PlanSection;
  sectionNumber: number;
  onEdit: () => void;
  onRegenerate: () => void;
  onGenerate: () => void;
  onInlineSave?: (content: string) => Promise<void>;
  isRegenerating?: boolean;
  enableInlineEdit?: boolean;
  onAIAssistSelection?: (sectionId: string, selectedText: string) => Promise<string>;
  sectionRef?: React.RefObject<HTMLElement>;
  /** Force actions visible (for mobile) */
  alwaysShowActions?: boolean;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  },
};

const contentVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/**
 * SectionCard - Minimal section rendering for Notion-style preview
 *
 * Features:
 * - NO card shadows or borders - content flows naturally
 * - Hover-reveal actions (Edit, Regenerate, AI Assist)
 * - Clean typography with warm grays
 * - Subtle gradient divider between sections
 * - Smooth entrance animations
 */
const SectionCard = React.memo(function SectionCard({
  section,
  sectionNumber,
  onEdit,
  onRegenerate,
  onGenerate,
  onInlineSave,
  isRegenerating = false,
  enableInlineEdit = false,
  onAIAssistSelection: _onAIAssistSelection,
  sectionRef,
  alwaysShowActions = false,
}: SectionCardProps) {
  const { language } = useTheme();
  const isTouchDevice = useIsTouchDevice();
  const shouldAlwaysShowActions = alwaysShowActions || isTouchDevice;
  const hasContent = section.content && section.content.trim().length > 0;
  const wordCount = hasContent ? (section.content || '').split(/\s+/).filter(Boolean).length : 0;
  const isThinContent = hasContent && wordCount < 100;

  const handleInlineSave = useCallback(
    async (content: string) => {
      if (onInlineSave) {
        await onInlineSave(content);
      }
    },
    [onInlineSave]
  );

  const isInlineEditEnabled = enableInlineEdit && hasContent && !isRegenerating && !!onInlineSave;

  // Parse content for visual elements
  const parsedContent = useMemo(() => {
    if (!hasContent) return null;
    return parseContent(section.content || '');
  }, [section.content, hasContent]);

  return (
    <motion.section
      ref={sectionRef as React.RefObject<HTMLDivElement>}
      id={`section-${section.id}`}
      variants={sectionVariants}
      initial="hidden"
      animate="visible"
      className="group scroll-mt-20 lg:scroll-mt-24 mb-12"
      aria-labelledby={`section-title-${section.id}`}
    >
      {/* Section Header - Document-style numbered heading with bottom border */}
      <header className="relative mb-2">
        <h2
          id={`section-title-${section.id}`}
          className="document-section-heading"
        >
          {sectionNumber}. {section.title}
        </h2>

        {/* Hover Actions - floating top-right */}
        {hasContent && !isRegenerating && (
          <div className="absolute top-0 right-0 no-print">
            <HoverActions
              onEdit={onEdit}
              onRegenerate={onRegenerate}
              isRegenerating={isRegenerating}
              showAIAssist={false}
              alwaysVisible={shouldAlwaysShowActions}
            />
          </div>
        )}
      </header>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        {isRegenerating ? (
          <LoadingState key="loading" />
        ) : hasContent ? (
          <motion.div
            key="content"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="document-prose"
          >
            {isInlineEditEnabled ? (
              <EditableSection
                content={section.content || ''}
                onSave={handleInlineSave}
              >
                <ContentDisplay content={section.content || ''} parsedContent={parsedContent} />
              </EditableSection>
            ) : (
              <ContentDisplay content={section.content || ''} parsedContent={parsedContent} />
            )}
          </motion.div>
        ) : (
          <EmptyState
            key="empty"
            onGenerate={onGenerate}
          />
        )}
      </AnimatePresence>

      {/* Thin content hint */}
      {isThinContent && !isRegenerating && (
        <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-sm">
          <Sparkles size={14} className="shrink-0" />
          <span>
            {language === 'fr'
              ? 'Cette section est courte. Cliquez sur « Régénérer » pour enrichir le contenu.'
              : 'This section is thin. Click "Regenerate" to enrich the content.'}
          </span>
        </div>
      )}

      {/* Document Divider */}
      <hr className="document-divider" />
    </motion.section>
  );
});

export default SectionCard;

/**
 * Loading state while regenerating
 */
function LoadingState() {
  const { t } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-16"
    >
      <div className="relative">
        <Loader2 size={32} className="text-momentum-orange animate-spin" />
        <div className="absolute inset-0 rounded-full bg-momentum-orange/20 animate-ping" />
      </div>
      <p className="mt-4 text-sm text-warm-gray-500 dark:text-warm-gray-400">
        {t('preview.section.regenerating')}
      </p>
    </motion.div>
  );
}

/**
 * Empty state for sections without content
 */
function EmptyState({
  onGenerate,
}: {
  onGenerate: () => void;
}) {
  const { t } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex flex-col items-center justify-center py-12 rounded-xl bg-warm-gray-50 dark:bg-card/50 border border-dashed border-warm-gray-200 dark:border-border"
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Sparkles size={32} className="text-warm-gray-300 dark:text-warm-gray-600" />
      </motion.div>
      <p className="mt-3 text-warm-gray-500 dark:text-warm-gray-400 text-sm">
        {t('preview.section.empty')}
      </p>
      <Button
        variant="brand"
        size="sm"
        onClick={onGenerate}
        className="mt-4"
      >
        {t('preview.section.generate')}
      </Button>
    </motion.div>
  );
}

/**
 * Content display with visual elements support
 */
function ContentDisplay({
  content,
  parsedContent,
}: {
  content: string;
  parsedContent: ReturnType<typeof parseContent> | null;
}) {
  // If we have parsed visual elements, render them mixed with prose
  if (parsedContent?.hasVisualElements && parsedContent.blocks.length > 0) {
    return (
      <div className="space-y-6">
        {parsedContent.blocks.map((block, index) => {
          if (block.type === 'prose') {
            return (
              <div
                key={`prose-${index}`}
                className="prose-warm-content document-prose"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(formatContent(block.content)) }}
              />
            );
          } else {
            return (
              <VisualElementRenderer key={`visual-${index}`} element={block.element} />
            );
          }
        })}
      </div>
    );
  }

  // Simple content rendering
  return (
    <div
      className="prose-warm-content document-prose"
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(formatContent(content)) }}
    />
  );
}

/**
 * Format content - convert markdown to rich HTML
 * Handles headings, bold, italic, lists, tables, and horizontal rules
 */
function formatContent(content: string): string {
  if (!content) return '';

  let html = content;

  // Check if already HTML
  const hasCompleteHTML = /<[a-z]+[^>]*>[\s\S]*<\/[a-z]+>/i.test(html);
  const hasMarkdown = /#{1,6}\s|\*\*[^*]+\*\*|^\* |^\d+\.\s|^\|/m.test(html);

  if (hasCompleteHTML && !hasMarkdown) {
    return html;
  }

  // Strip any remaining raw JSON code blocks (failed visual elements) - don't show raw JSON
  html = html.replace(/```json:(chart|table|metrics|infographic|swot)\s*\n[\s\S]*?```/gi, '');

  // Convert markdown tables (| col1 | col2 |) to HTML tables
  html = html.replace(
    /((?:^\|.+\|[ \t]*$\n?)+)/gm,
    (tableBlock) => {
      const rows = tableBlock.trim().split('\n').filter(r => r.trim());
      if (rows.length < 2) return tableBlock;

      // Check if second row is separator (|---|---|)
      const isSeparator = (row: string) => /^\|[\s\-:]+\|/.test(row);
      const hasSeparator = rows.length >= 2 && isSeparator(rows[1]);

      const parseRow = (row: string) =>
        row.split('|').filter((_, i, arr) => i > 0 && i < arr.length - 1).map(c => c.trim());

      let tableHtml = '<table class="business-plan-table">';

      if (hasSeparator) {
        // Header + separator + body
        const headerCells = parseRow(rows[0]);
        tableHtml += '<thead><tr>' + headerCells.map(c => `<th>${c}</th>`).join('') + '</tr></thead>';
        tableHtml += '<tbody>';
        for (let i = 2; i < rows.length; i++) {
          if (isSeparator(rows[i])) continue;
          const cells = parseRow(rows[i]);
          tableHtml += '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
        }
        tableHtml += '</tbody>';
      } else {
        // No separator - all body rows
        tableHtml += '<tbody>';
        for (const row of rows) {
          const cells = parseRow(row);
          tableHtml += '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
        }
        tableHtml += '</tbody>';
      }

      tableHtml += '</table>';
      return tableHtml;
    }
  );

  // Convert markdown headings
  html = html.replace(/(^|\n)(#{1,6})\s+([^\n]+)/g, (_match, prefix, hashes, text) => {
    const level = Math.min(hashes.length, 6);
    return `${prefix}<h${level}>${text.trim()}</h${level}>`;
  });

  // Convert bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Convert italic (but not already-converted bold)
  html = html.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');

  // Convert horizontal rules (---)
  html = html.replace(/^---+$/gm, '<hr class="document-divider">');

  // Convert numbered lists
  html = html.replace(/((?:^\d+\.\s+.+$\n?)+)/gm, (listBlock) => {
    const items = listBlock.trim().split('\n')
      .filter(l => l.trim())
      .map(l => l.replace(/^\d+\.\s+/, ''));
    return '<ol>' + items.map(item => `<li>${item}</li>`).join('') + '</ol>';
  });

  // Convert unordered lists
  html = html.replace(/((?:^[\*\-]\s+.+$\n?)+)/gm, (listBlock) => {
    const items = listBlock.trim().split('\n')
      .filter(l => l.trim())
      .map(l => l.replace(/^[\*\-]\s+/, ''));
    return '<ul>' + items.map(item => `<li>${item}</li>`).join('') + '</ul>';
  });

  // Convert paragraphs (double newlines)
  html = html.replace(/\n\n/g, '</p><p>');
  if (!html.startsWith('<')) {
    html = '<p>' + html + '</p>';
  }

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, '');

  return html;
}
