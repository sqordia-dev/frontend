import React, { useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Edit2,
  RefreshCw,
  Sparkles,
  Loader2,
  FileText,
  Building2,
  BarChart3,
  Package,
  Megaphone,
  Cog,
  Users,
  DollarSign,
  Wallet,
  Paperclip,
  Grid3X3,
  AlertTriangle,
  Calendar,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { PlanSection } from '../../types/preview';
import { EditableSection } from './inline-edit';
import { parseContent } from '../../utils/content-parser';
import { VisualElementRenderer } from '../visual-elements';

// Animation variants for card entrance
const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

// Modern layered shadow system (Josh W. Comeau style)
const shadowStyles = {
  base: `
    0 1px 1px hsl(0deg 0% 0% / 0.04),
    0 2px 2px hsl(0deg 0% 0% / 0.04),
    0 4px 4px hsl(0deg 0% 0% / 0.04),
    0 8px 8px hsl(0deg 0% 0% / 0.04)
  `,
  hover: `
    0 2px 2px hsl(0deg 0% 0% / 0.05),
    0 4px 4px hsl(0deg 0% 0% / 0.05),
    0 8px 8px hsl(0deg 0% 0% / 0.05),
    0 16px 16px hsl(0deg 0% 0% / 0.05),
    0 32px 32px hsl(0deg 0% 0% / 0.03)
  `,
};

// Animation variants for content states
const contentVariants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut' as const,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.2,
    },
  },
};

// Animation variants for buttons
const buttonVariants = {
  initial: { scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

interface SectionCardProps {
  /** Section data */
  section: PlanSection;
  /** Section number (1-indexed) */
  sectionNumber: number;
  /** Callback when edit is clicked (opens modal editor) */
  onEdit: () => void;
  /** Callback when regenerate is clicked */
  onRegenerate: () => void;
  /** Callback when generate is clicked (for empty sections) */
  onGenerate: () => void;
  /** Callback when content is saved inline */
  onInlineSave?: (content: string) => Promise<void>;
  /** Whether section is currently regenerating */
  isRegenerating?: boolean;
  /** Whether inline editing is enabled (default: true) */
  enableInlineEdit?: boolean;
  /** Callback for AI assist on selected text: (sectionId, selectedText) => Promise<improvedText> */
  onAIAssistSelection?: (sectionId: string, selectedText: string) => Promise<string>;
  /** Ref for scrolling */
  sectionRef?: React.RefObject<HTMLElement>;
}

// Icon mapping for section titles
const sectionIconMap: Record<string, LucideIcon> = {
  'executive summary': FileText,
  'company overview': Building2,
  'company description': Building2,
  'market analysis': BarChart3,
  'market research': BarChart3,
  'products': Package,
  'services': Package,
  'products and services': Package,
  'products/services': Package,
  'marketing': Megaphone,
  'marketing strategy': Megaphone,
  'marketing plan': Megaphone,
  'operations': Cog,
  'operations plan': Cog,
  'management': Users,
  'management team': Users,
  'team': Users,
  'organization': Users,
  'financial': DollarSign,
  'financial projections': DollarSign,
  'financials': DollarSign,
  'funding': Wallet,
  'funding request': Wallet,
  'investment': Wallet,
  'appendix': Paperclip,
  'appendices': Paperclip,
  'swot': Grid3X3,
  'swot analysis': Grid3X3,
  'risk': AlertTriangle,
  'risk assessment': AlertTriangle,
  'risks': AlertTriangle,
  'timeline': Calendar,
  'implementation': Calendar,
  'implementation timeline': Calendar,
  'milestones': Calendar,
  'exit': LogOut,
  'exit strategy': LogOut,
};

/**
 * Get icon for a section based on its title
 */
function getSectionIcon(title: string): LucideIcon {
  const normalizedTitle = title.toLowerCase().trim();

  // Try exact match first
  if (sectionIconMap[normalizedTitle]) {
    return sectionIconMap[normalizedTitle];
  }

  // Try partial match
  for (const [key, icon] of Object.entries(sectionIconMap)) {
    if (normalizedTitle.includes(key) || key.includes(normalizedTitle)) {
      return icon;
    }
  }

  // Default icon
  return FileText;
}

/**
 * SectionCard - Individual section card for business plan preview
 * Clean white card with icon, title, divider, and content
 * Supports inline editing when enableInlineEdit is true
 * Features:
 * - Card entrance animation (fade in + slide up)
 * - Hover micro-interactions on buttons
 * - Smooth loading state transitions
 * - Proper spacing and padding
 */
export default function SectionCard({
  section,
  sectionNumber,
  onEdit,
  onRegenerate,
  onGenerate,
  onInlineSave,
  isRegenerating = false,
  enableInlineEdit = false,
  onAIAssistSelection,
  sectionRef,
}: SectionCardProps) {
  const hasContent = section.content && section.content.trim().length > 0;
  const Icon = getSectionIcon(section.title);

  // Handle inline save
  const handleInlineSave = useCallback(
    async (content: string) => {
      if (onInlineSave) {
        await onInlineSave(content);
      }
    },
    [onInlineSave]
  );

  // Determine if inline editing should be active
  const isInlineEditEnabled = enableInlineEdit && hasContent && !isRegenerating && !!onInlineSave;

  return (
    <motion.section
      ref={sectionRef as React.RefObject<HTMLDivElement>}
      id={`section-${section.id}`}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 md:p-8 scroll-mt-24 group hover:border-momentum-orange/30 dark:hover:border-momentum-orange/40"
      style={{
        boxShadow: shadowStyles.base,
        transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = shadowStyles.hover;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = shadowStyles.base;
      }}
      aria-labelledby={`section-title-${section.id}`}
    >
      {/* Section Header */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          {/* Icon Container - Modern gradient background */}
          <div className="flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-momentum-orange/10 to-orange-100 dark:from-momentum-orange/20 dark:to-orange-900/30 flex-shrink-0 ring-1 ring-momentum-orange/20 dark:ring-momentum-orange/30 group-hover:ring-momentum-orange/40 transition-all duration-300">
            <Icon
              size={22}
              className="text-momentum-orange dark:text-orange-400"
              aria-hidden="true"
            />
          </div>
          {/* Section Title - Enhanced typography */}
          <h2
            id={`section-title-${section.id}`}
            className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white tracking-tight"
          >
            <span className="text-gray-400 dark:text-gray-500 font-medium mr-1">{sectionNumber}.</span>
            {section.title}
          </h2>
        </div>

        {/* Action Buttons */}
        {hasContent && !isRegenerating && (
          <div className="flex items-center gap-1 flex-shrink-0">
            <motion.button
              onClick={onEdit}
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              className="p-2.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              aria-label={`Edit ${section.title} in modal`}
              title="Open full editor"
            >
              <Edit2 size={18} aria-hidden="true" />
            </motion.button>
            <motion.button
              onClick={onRegenerate}
              variants={buttonVariants}
              initial="initial"
              whileHover="hover"
              whileTap="tap"
              className="p-2.5 text-gray-400 hover:text-momentum-orange dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-momentum-orange focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              aria-label={`Regenerate ${section.title}`}
              title="Regenerate with AI"
            >
              <RefreshCw size={18} aria-hidden="true" />
            </motion.button>
          </div>
        )}
      </div>

      {/* Divider - Subtle gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent mb-6" />

      {/* Content Area with AnimatePresence for smooth transitions */}
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
          >
            {isInlineEditEnabled ? (
              <EditableSection
                content={section.content!}
                onSave={handleInlineSave}
                disabled={isRegenerating}
                onAIAssistSelection={
                  onAIAssistSelection
                    ? (text) => onAIAssistSelection(section.name || section.id, text)
                    : undefined
                }
                debounceMs={2000}
                autosave={true}
              >
                <ContentDisplay content={section.content!} />
              </EditableSection>
            ) : (
              <ContentDisplay content={section.content!} />
            )}
          </motion.div>
        ) : (
          <EmptyState key="empty" onGenerate={onGenerate} sectionTitle={section.title} />
        )}
      </AnimatePresence>
    </motion.section>
  );
}

/**
 * Loading state while regenerating
 * Features smooth pulse animation and spinner
 */
function LoadingState() {
  return (
    <motion.div
      key="loading"
      variants={contentVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex items-center justify-center py-16 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700"
    >
      <div className="text-center">
        <div className="relative">
          {/* Outer pulse ring */}
          <motion.div
            className="absolute inset-0 rounded-full bg-momentum-orange/20"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 0, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            style={{ width: 48, height: 48, margin: 'auto', left: 0, right: 0, top: -8 }}
          />
          <Loader2
            size={32}
            className="animate-spin mx-auto mb-4 text-momentum-orange"
            aria-hidden="true"
          />
        </div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Regenerating content...</p>
        <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">This may take a moment</p>
      </div>
    </motion.div>
  );
}

/**
 * Empty state for sections without content
 * Features animated icon and prominent generate button
 */
function EmptyState({
  onGenerate,
  sectionTitle,
}: {
  onGenerate: () => void;
  sectionTitle: string;
}) {
  return (
    <motion.div
      key="empty"
      variants={contentVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="flex flex-col items-center justify-center py-16 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700"
    >
      {/* Animated sparkles icon */}
      <motion.div
        animate={{
          y: [0, -4, 0],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
          <Sparkles
            size={28}
            className="text-gray-400 dark:text-gray-500"
            aria-hidden="true"
          />
        </div>
      </motion.div>
      <p className="text-gray-700 dark:text-gray-300 font-medium mb-1 text-center px-4">
        No content yet
      </p>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 text-center px-4">
        Generate AI-powered content for this section
      </p>
      <motion.button
        onClick={onGenerate}
        variants={buttonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        className="flex items-center gap-2 px-5 py-2.5 bg-momentum-orange hover:bg-orange-600 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-momentum-orange focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        aria-label={`Generate content for ${sectionTitle}`}
      >
        <Sparkles size={18} aria-hidden="true" />
        Generate Content
      </motion.button>
    </motion.div>
  );
}

/**
 * Convert markdown headings found within HTML content to proper HTML heading tags.
 * Handles headings in various contexts:
 * - Wrapped in <p> tags: <p>### Heading</p>
 * - After <br> tags inside paragraphs: <p>text<br>### Heading</p>
 * - Bare on their own line
 */
function convertMarkdownHeadingsInHtml(html: string): string {
  let result = html;

  // Step 1: Handle <p> tags that contain ONLY a heading
  // <p>### Heading</p> → <h3>Heading</h3>
  result = result.replace(/<p>\s*(#{1,6})\s+(.+?)\s*<\/p>/gi, (_match, hashes, text) => {
    const level = hashes.length;
    return `<h${level}>${text}</h${level}>`;
  });

  // Step 2: Handle headings after <br> tags (inside <p> or elsewhere)
  // <p>text<br>### Heading</p> → <p>text</p><h3>Heading</h3>
  // <p>text<br>### Heading<br>more</p> → <p>text</p><h3>Heading</h3><p>more</p>
  result = result.replace(/<br\s*\/?>\s*(#{1,6})\s+([^<\n]+)/gi, (_match, hashes, text) => {
    const level = hashes.length;
    return `</p><h${level}>${text.trim()}</h${level}><p>`;
  });

  // Step 3: Handle bare headings on their own line (not inside tags)
  result = result.replace(/^(#{1,6})\s+(.+)$/gm, (_match, hashes, text) => {
    const level = hashes.length;
    return `<h${level}>${text}</h${level}>`;
  });

  // Clean up empty <p></p> or <p><br></p> tags from the conversion
  result = result.replace(/<p>\s*<\/p>/g, '');
  result = result.replace(/<p>\s*<br\s*\/?>\s*<\/p>/g, '');

  return result;
}

/**
 * Content display with markdown-like rendering and visual elements support
 * Parses content to extract and render embedded visual elements (charts, tables, metrics)
 * Features proper prose styling with enhanced typography
 */
function ContentDisplay({ content }: { content: string }) {
  // Parse content to extract prose and visual elements
  const parsedContent = useMemo(() => parseContent(content), [content]);

  // Check if content is HTML (starts with < and contains closing tags)
  const isHtml = content.trim().startsWith('<') && content.includes('</');

  // Base prose classes for consistent typography
  const proseClasses =
    'prose prose-gray dark:prose-invert max-w-none ' +
    'prose-headings:font-bold prose-headings:tracking-tight ' +
    'prose-p:text-gray-700 prose-p:dark:text-gray-300 prose-p:leading-relaxed ' +
    'prose-li:text-gray-700 prose-li:dark:text-gray-300 ' +
    'prose-strong:text-gray-900 prose-strong:dark:text-white ' +
    'prose-a:text-blue-600 prose-a:dark:text-blue-400 prose-a:no-underline hover:prose-a:underline';

  // If content is HTML and has no visual elements, render it directly
  // Pre-process to convert any markdown headings mixed into HTML
  if (isHtml && !parsedContent.hasVisualElements) {
    const processedHtml = convertMarkdownHeadingsInHtml(content);
    return (
      <div
        className={proseClasses}
        dangerouslySetInnerHTML={{ __html: processedHtml }}
      />
    );
  }

  // If content has visual elements, render blocks
  if (parsedContent.hasVisualElements) {
    return (
      <div className={proseClasses}>
        {parsedContent.blocks.map((block, index) => {
          if (block.type === 'visual') {
            return (
              <div key={index} className="my-8 not-prose">
                <VisualElementRenderer element={block.element} />
              </div>
            );
          }
          // Render prose block
          return (
            <div key={index}>
              {renderMarkdownContent(block.content)}
            </div>
          );
        })}
      </div>
    );
  }

  // Simple markdown-like rendering for non-HTML content without visual elements
  return (
    <div className={proseClasses}>
      {renderMarkdownContent(content)}
    </div>
  );
}

/**
 * Render markdown-formatted text content
 * Enhanced typography with better spacing and visual hierarchy
 */
function renderMarkdownContent(text: string) {
  // Split into paragraphs
  const paragraphs = text.split(/\n\n+/);

  return paragraphs.map((para, index) => {
    // Check for headers (most specific first to avoid partial matches)
    if (para.startsWith('###### ')) {
      return (
        <h6
          key={index}
          className="text-sm font-semibold text-gray-900 dark:text-white mt-6 mb-3 tracking-tight"
        >
          {renderInlineStyles(para.replace(/^###### /, ''))}
        </h6>
      );
    }
    if (para.startsWith('##### ')) {
      return (
        <h5
          key={index}
          className="text-sm font-semibold text-gray-900 dark:text-white mt-6 mb-3 tracking-tight"
        >
          {renderInlineStyles(para.replace(/^##### /, ''))}
        </h5>
      );
    }
    if (para.startsWith('#### ')) {
      return (
        <h4
          key={index}
          className="text-base font-semibold text-gray-900 dark:text-white mt-6 mb-3 tracking-tight"
        >
          {renderInlineStyles(para.replace(/^#### /, ''))}
        </h4>
      );
    }
    if (para.startsWith('### ')) {
      return (
        <h3
          key={index}
          className="text-lg font-semibold text-gray-900 dark:text-white mt-8 mb-4 tracking-tight"
        >
          {renderInlineStyles(para.replace(/^### /, ''))}
        </h3>
      );
    }
    if (para.startsWith('## ')) {
      return (
        <h2
          key={index}
          className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4 tracking-tight"
        >
          {renderInlineStyles(para.replace(/^## /, ''))}
        </h2>
      );
    }
    if (para.startsWith('# ')) {
      return (
        <h1
          key={index}
          className="text-2xl font-bold text-gray-900 dark:text-white mt-8 mb-4 tracking-tight"
        >
          {renderInlineStyles(para.replace(/^# /, ''))}
        </h1>
      );
    }

    // Check for bullet lists
    if (para.match(/^[-*]\s/m)) {
      const items = para.split(/\n/).filter((line) => line.trim());
      return (
        <ul key={index} className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300 my-5">
          {items.map((item, i) => (
            <li key={i} className="pl-1">{renderInlineStyles(item.replace(/^[-*]\s/, ''))}</li>
          ))}
        </ul>
      );
    }

    // Check for numbered lists
    if (para.match(/^\d+\.\s/m)) {
      const items = para.split(/\n/).filter((line) => line.trim());
      return (
        <ol key={index} className="list-decimal pl-5 space-y-2 text-gray-700 dark:text-gray-300 my-5">
          {items.map((item, i) => (
            <li key={i} className="pl-1">{renderInlineStyles(item.replace(/^\d+\.\s/, ''))}</li>
          ))}
        </ol>
      );
    }

    // Regular paragraph
    return (
      <p
        key={index}
        className="text-gray-700 dark:text-gray-300 leading-relaxed mb-5 first:mt-0 last:mb-0"
      >
        {renderInlineStyles(para)}
      </p>
    );
  });
}

/**
 * Render inline styles (bold, italic)
 * Enhanced with better styling for strong and emphasis text
 */
function renderInlineStyles(text: string) {
  // Handle bold
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-gray-900 dark:text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    // Handle italic within non-bold parts
    const italicParts = part.split(/(\*[^*]+\*)/g);
    return italicParts.map((iPart, j) => {
      if (iPart.startsWith('*') && iPart.endsWith('*') && !iPart.startsWith('**')) {
        return (
          <em key={`${i}-${j}`} className="italic text-gray-600 dark:text-gray-400">
            {iPart.slice(1, -1)}
          </em>
        );
      }
      return iPart;
    });
  });
}
