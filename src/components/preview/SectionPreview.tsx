import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, RefreshCw, Sparkles, Loader2 } from 'lucide-react';
import { PlanSection } from '../../types/preview';

interface SectionPreviewProps {
  /** Section data */
  section: PlanSection;
  /** Callback when edit is clicked */
  onEdit: () => void;
  /** Callback when regenerate is clicked */
  onRegenerate: () => void;
  /** Callback when generate is clicked (for empty sections) */
  onGenerate: () => void;
  /** Whether section is currently regenerating */
  isRegenerating?: boolean;
  /** Ref for scrolling */
  sectionRef?: React.RefObject<HTMLElement>;
}

/**
 * Section display component for business plan preview
 * Renders section content with edit/regenerate controls
 */
export default function SectionPreview({
  section,
  onEdit,
  onRegenerate,
  onGenerate,
  isRegenerating = false,
  sectionRef,
}: SectionPreviewProps) {
  const hasContent = section.content && section.content.trim().length > 0;

  return (
    <section
      ref={sectionRef as React.RefObject<HTMLDivElement>}
      id={`section-${section.id}`}
      className="scroll-mt-24"
      aria-labelledby={`section-title-${section.id}`}
    >
      {/* Section Header */}
      <div className="flex items-start justify-between gap-4 mb-4">
        <h2
          id={`section-title-${section.id}`}
          className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white"
        >
          {section.title}
        </h2>

        {/* Action Buttons */}
        {hasContent && !isRegenerating && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={onEdit}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              aria-label={`Edit ${section.title}`}
            >
              <Edit2 size={14} aria-hidden="true" />
              <span className="hidden sm:inline">Edit</span>
            </button>
            <button
              onClick={onRegenerate}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              aria-label={`Regenerate ${section.title}`}
            >
              <RefreshCw size={14} aria-hidden="true" />
              <span className="hidden sm:inline">Regenerate</span>
            </button>
          </div>
        )}
      </div>

      {/* Content Area */}
      {isRegenerating ? (
        <LoadingState />
      ) : hasContent ? (
        <ContentDisplay content={section.content!} />
      ) : (
        <EmptyState onGenerate={onGenerate} sectionTitle={section.title} />
      )}
    </section>
  );
}

/**
 * Loading state while regenerating
 */
function LoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700"
    >
      <div className="text-center">
        <Loader2
          size={32}
          className="animate-spin mx-auto mb-3 text-orange-500"
          aria-hidden="true"
        />
        <p className="text-gray-600 dark:text-gray-400">
          Regenerating content...
        </p>
      </div>
    </motion.div>
  );
}

/**
 * Empty state for sections without content
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
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700"
    >
      <Sparkles
        size={32}
        className="mb-3 text-gray-400 dark:text-gray-500"
        aria-hidden="true"
      />
      <p className="text-gray-600 dark:text-gray-400 mb-4 text-center px-4">
        This section doesn't have content yet.
      </p>
      <button
        onClick={onGenerate}
        className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        aria-label={`Generate content for ${sectionTitle}`}
      >
        <Sparkles size={16} aria-hidden="true" />
        Generate Content
      </button>
    </motion.div>
  );
}

/**
 * Content display with markdown rendering
 */
function ContentDisplay({ content }: { content: string }) {
  // Simple markdown-like rendering
  const renderContent = (text: string) => {
    // Split into paragraphs
    const paragraphs = text.split(/\n\n+/);

    return paragraphs.map((para, index) => {
      // Check for headers
      if (para.startsWith('### ')) {
        return (
          <h4
            key={index}
            className="text-lg font-semibold text-gray-900 dark:text-white mt-6 mb-3"
          >
            {para.replace('### ', '')}
          </h4>
        );
      }
      if (para.startsWith('## ')) {
        return (
          <h3
            key={index}
            className="text-xl font-semibold text-gray-900 dark:text-white mt-6 mb-3"
          >
            {para.replace('## ', '')}
          </h3>
        );
      }
      if (para.startsWith('# ')) {
        return (
          <h2
            key={index}
            className="text-2xl font-bold text-gray-900 dark:text-white mt-6 mb-4"
          >
            {para.replace('# ', '')}
          </h2>
        );
      }

      // Check for bullet lists
      if (para.match(/^[-*]\s/m)) {
        const items = para.split(/\n/).filter((line) => line.trim());
        return (
          <ul key={index} className="list-disc list-inside space-y-1 my-4">
            {items.map((item, i) => (
              <li key={i} className="text-gray-700 dark:text-gray-300">
                {renderInlineStyles(item.replace(/^[-*]\s/, ''))}
              </li>
            ))}
          </ul>
        );
      }

      // Check for numbered lists
      if (para.match(/^\d+\.\s/m)) {
        const items = para.split(/\n/).filter((line) => line.trim());
        return (
          <ol key={index} className="list-decimal list-inside space-y-1 my-4">
            {items.map((item, i) => (
              <li key={i} className="text-gray-700 dark:text-gray-300">
                {renderInlineStyles(item.replace(/^\d+\.\s/, ''))}
              </li>
            ))}
          </ol>
        );
      }

      // Regular paragraph
      return (
        <p key={index} className="text-gray-700 dark:text-gray-300 my-4 leading-relaxed">
          {renderInlineStyles(para)}
        </p>
      );
    });
  };

  // Render inline styles (bold, italic)
  const renderInlineStyles = (text: string) => {
    // Handle bold
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      // Handle italic within non-bold parts
      const italicParts = part.split(/(\*[^*]+\*)/g);
      return italicParts.map((iPart, j) => {
        if (iPart.startsWith('*') && iPart.endsWith('*') && !iPart.startsWith('**')) {
          return <em key={`${i}-${j}`}>{iPart.slice(1, -1)}</em>;
        }
        return iPart;
      });
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="prose prose-gray dark:prose-invert max-w-none"
    >
      {renderContent(content)}
    </motion.div>
  );
}
