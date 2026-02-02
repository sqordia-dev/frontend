import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, List } from 'lucide-react';
import { ReadingProgressBar } from './ReadingProgressBar';
import { StickyTableOfContents } from './StickyTableOfContents';
import { FloatingActions } from './FloatingActions';
import { PlanSection } from '../../types/preview';
import { useTheme } from '../../contexts/ThemeContext';

interface PreviewContentProps {
  children: React.ReactNode;
  /** Plan sections for sticky TOC */
  sections?: PlanSection[];
  /** Callback when section is clicked in TOC */
  onSectionClick?: (sectionId: string) => void;
  /** Callback when edit FAB is clicked */
  onEdit?: () => void;
  /** Callback when export FAB is clicked */
  onExport?: () => void;
  /** Callback when share FAB is clicked */
  onShare?: () => void;
  /** Callback when AI assist FAB is clicked */
  onAIAssist?: () => void;
  /** Show reading progress bar */
  showProgressBar?: boolean;
  /** Show sticky TOC on xl screens */
  showStickyTOC?: boolean;
  /** Show floating actions */
  showFloatingActions?: boolean;
}

/**
 * PreviewContent - Enhanced content container for business plan sections
 *
 * Features:
 * - Reading progress bar at top
 * - Fixed table of contents on right side (lg screens+)
 * - Includes Cover Page and Table of Contents in TOC
 * - Floating action buttons
 * - Responsive max-width and padding
 */
export default function PreviewContent({
  children,
  sections = [],
  onSectionClick,
  onEdit,
  onExport,
  onShare,
  onAIAssist,
  showProgressBar = true,
  showStickyTOC = true,
  showFloatingActions = true,
}: PreviewContentProps) {
  const { t } = useTheme();
  // Build TOC items including Cover Page and Table of Contents
  const tocItems = [
    // Cover Page
    {
      id: 'cover-page-section',
      title: t('planView.cover'),
      icon: <BookOpen size={14} />,
    },
    // Table of Contents
    {
      id: 'table-of-contents-section',
      title: t('planView.tableOfContents'),
      icon: <List size={14} />,
    },
    // Sections
    ...sections.map((section, index) => ({
      id: `section-${section.id}`,
      title: `${index + 1}. ${section.title}`,
    })),
  ];

  return (
    <>
      {/* Reading Progress Bar - Fixed at top */}
      {showProgressBar && <ReadingProgressBar position="top" />}

      {/* Main content area */}
      <div className="relative flex justify-center">
        {/* Main content column */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-4xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8"
        >
          <div className="space-y-6">{children}</div>
        </motion.div>

        {/* Fixed TOC - Only on lg screens when enabled */}
        {showStickyTOC && tocItems.length > 0 && (
          <StickyTableOfContents
            items={tocItems}
            title="On this page"
            scrollOffset={80}
          />
        )}
      </div>

      {/* Floating Action Buttons */}
      {showFloatingActions && (
        <FloatingActions
          onEdit={onEdit}
          onExport={onExport}
          onShare={onShare}
          onAIAssist={onAIAssist}
          showScrollTop={true}
        />
      )}
    </>
  );
}
