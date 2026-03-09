import React, { useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Building2,
  BarChart3,
  Package,
  Megaphone,
  Cog,
  Users,
  DollarSign,
  Wallet,
  Grid3X3,
  AlertTriangle,
  Calendar,
  LogOut,
  Paperclip,
  Sparkles,
  Loader2,
  type LucideIcon,
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

// Icon mapping
const sectionIconMap: Record<string, LucideIcon> = {
  'executive summary': FileText,
  'company overview': Building2,
  'company description': Building2,
  'market analysis': BarChart3,
  'market research': BarChart3,
  'products': Package,
  'services': Package,
  'products and services': Package,
  'marketing': Megaphone,
  'marketing strategy': Megaphone,
  'operations': Cog,
  'operations plan': Cog,
  'management': Users,
  'management team': Users,
  'team': Users,
  'financial': DollarSign,
  'financial projections': DollarSign,
  'financials': DollarSign,
  'funding': Wallet,
  'funding request': Wallet,
  'swot': Grid3X3,
  'swot analysis': Grid3X3,
  'risk': AlertTriangle,
  'risks': AlertTriangle,
  'timeline': Calendar,
  'milestones': Calendar,
  'exit': LogOut,
  'exit strategy': LogOut,
  'appendix': Paperclip,
};

function getSectionIcon(title: string): LucideIcon {
  const normalizedTitle = title.toLowerCase().trim();
  if (sectionIconMap[normalizedTitle]) return sectionIconMap[normalizedTitle];
  for (const [key, icon] of Object.entries(sectionIconMap)) {
    if (normalizedTitle.includes(key) || key.includes(normalizedTitle)) return icon;
  }
  return FileText;
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
  const Icon = getSectionIcon(section.title);

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
      {/* Section Header - Number + Title + Hover Actions */}
      <header className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          {/* Section Number */}
          <span className="text-sm font-medium text-warm-gray-400 dark:text-warm-gray-500 tabular-nums">
            {sectionNumber}.
          </span>

          {/* Icon - subtle, not in a box */}
          <Icon
            size={20}
            className="text-warm-gray-400 dark:text-warm-gray-500 flex-shrink-0"
            aria-hidden="true"
          />

          {/* Title */}
          <h2
            id={`section-title-${section.id}`}
            className={cn(
              'text-lg sm:text-xl lg:text-2xl font-semibold tracking-tight',
              'text-warm-gray-900 dark:text-white'
            )}
          >
            {section.title}
          </h2>
        </div>

        {/* Hover Actions */}
        {hasContent && !isRegenerating && (
          <HoverActions
            onEdit={onEdit}
            onRegenerate={onRegenerate}
            isRegenerating={isRegenerating}
            showAIAssist={false}
            alwaysVisible={shouldAlwaysShowActions}
          />
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
            className="prose-warm"
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

      {/* Subtle Divider */}
      <div className="mt-12 h-px bg-gradient-to-r from-transparent via-warm-gray-200 dark:via-secondary to-transparent" />
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
                className="prose-warm-content"
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
      className="prose-warm-content"
      dangerouslySetInnerHTML={{ __html: sanitizeHtml(formatContent(content)) }}
    />
  );
}

/**
 * Format content - convert markdown to HTML
 */
function formatContent(content: string): string {
  if (!content) return '';

  let html = content;

  // Check if already HTML
  const hasCompleteHTML = /<[a-z]+[^>]*>[\s\S]*<\/[a-z]+>/i.test(html);
  const hasMarkdown = /#{1,6}\s|\*\*[^*]+\*\*|^\* |^\d+\.\s/m.test(html);

  if (hasCompleteHTML && !hasMarkdown) {
    return html;
  }

  // Convert markdown headings
  html = html.replace(/(^|\n)(#{1,6})\s+([^\n]+)/g, (_match, prefix, hashes, text) => {
    const level = Math.min(hashes.length, 6);
    return `${prefix}<h${level}>${text.trim()}</h${level}>`;
  });

  // Convert bold
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  // Convert italic
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Convert unordered lists
  html = html.replace(/^[\*\-]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');

  // Convert paragraphs (double newlines)
  html = html.replace(/\n\n/g, '</p><p>');
  if (!html.startsWith('<')) {
    html = '<p>' + html + '</p>';
  }

  return html;
}
