import React, { useState, useCallback, createContext, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Menu, Download, Share2, Loader2, BookOpen, List, CheckCircle2 } from 'lucide-react';
import { PlanSection } from '../../types/preview';
import { cn } from '../../lib/utils';
import CollapsibleSidebar, { ExportFormat } from './CollapsibleSidebar';
import QuickNavPill from './QuickNavPill';
import ReadingProgressBar from './ReadingProgressBar';
import MobileDrawer from './MobileDrawer';

/**
 * Context for sharing layout state between components
 */
interface PreviewLayoutV2ContextValue {
  activeSectionId: string | null;
  sections: PlanSection[];
  scrollToSection: (sectionId: string) => void;
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
  isMobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const PreviewLayoutV2Context = createContext<PreviewLayoutV2ContextValue | null>(null);

export function usePreviewLayoutV2() {
  const context = useContext(PreviewLayoutV2Context);
  if (!context) {
    throw new Error('usePreviewLayoutV2 must be used within PreviewLayoutV2');
  }
  return context;
}

interface PreviewLayoutV2Props {
  children: React.ReactNode;
  planTitle: string;
  planStatus?: string;
  sections: PlanSection[];
  activeSectionId: string | null;
  onSectionClick: (sectionId: string) => void;
  onExportClick: (format?: ExportFormat) => void;
  onShareClick: () => void;
  isCoverPageActive?: boolean;
  onCoverPageClick?: () => void;
  isTOCActive?: boolean;
  onTOCClick?: () => void;
  isExporting?: boolean;
  exportingFormat?: ExportFormat | null;
}

/**
 * PreviewLayoutV2 - Modern, minimal layout for business plan preview
 *
 * Features:
 * - Collapsible sidebar (desktop) with clean white design
 * - Mobile header + drawer navigation
 * - QuickNav pill for touch-friendly navigation
 * - Reading progress bar
 * - Warm gray background
 */
export default function PreviewLayoutV2({
  children,
  planTitle,
  planStatus = 'Draft',
  sections,
  activeSectionId,
  onSectionClick,
  onExportClick,
  onShareClick,
  isCoverPageActive = false,
  onCoverPageClick,
  isTOCActive = false,
  onTOCClick,
  isExporting = false,
  exportingFormat = null,
}: PreviewLayoutV2Props) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mobileNavigationTarget, setMobileNavigationTarget] = useState<string | null>(null);

  // Current section index for QuickNav
  const currentSectionIndex = activeSectionId
    ? sections.findIndex(s => s.id === activeSectionId)
    : 0;

  // Scroll to section handler
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    onSectionClick(sectionId);
  }, [onSectionClick]);

  // QuickNav navigation handlers
  const handlePrevious = useCallback(() => {
    if (currentSectionIndex > 0) {
      const prevSection = sections[currentSectionIndex - 1];
      scrollToSection(prevSection.id);
    }
  }, [currentSectionIndex, sections, scrollToSection]);

  const handleNext = useCallback(() => {
    if (currentSectionIndex < sections.length - 1) {
      const nextSection = sections[currentSectionIndex + 1];
      scrollToSection(nextSection.id);
    }
  }, [currentSectionIndex, sections, scrollToSection]);

  // Context value
  const contextValue: PreviewLayoutV2ContextValue = {
    activeSectionId,
    sections,
    scrollToSection,
    isSidebarCollapsed,
    setSidebarCollapsed: setIsSidebarCollapsed,
    isMobileMenuOpen,
    setMobileMenuOpen: setIsMobileMenuOpen,
  };

  return (
    <PreviewLayoutV2Context.Provider value={contextValue}>
      <div className="min-h-screen bg-warm-gray-50 dark:bg-warm-gray-950">
        {/* Reading Progress Bar */}
        <ReadingProgressBar className="fixed top-0 left-0 right-0 z-50" />

        {/* Desktop Sidebar */}
        <CollapsibleSidebar
          planName={planTitle}
          planStatus={planStatus}
          sections={sections}
          activeSectionId={activeSectionId}
          onSectionClick={scrollToSection}
          onExportClick={onExportClick}
          onShareClick={onShareClick}
          isCoverPageActive={isCoverPageActive}
          onCoverPageClick={onCoverPageClick}
          isTOCActive={isTOCActive}
          onTOCClick={onTOCClick}
          isExporting={isExporting}
          exportingFormat={exportingFormat}
          defaultCollapsed={isSidebarCollapsed}
          onCollapseChange={setIsSidebarCollapsed}
        />

        {/* Mobile Header */}
        <MobileHeader
          planTitle={planTitle}
          onMenuClick={() => setIsMobileMenuOpen(true)}
          onExportClick={() => onExportClick('pdf')}
          onShareClick={onShareClick}
          isExporting={isExporting}
        />

        {/* Mobile Drawer */}
        <MobileDrawer
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          planName={planTitle}
          navigationTarget={mobileNavigationTarget}
          onNavigationComplete={() => setMobileNavigationTarget(null)}
        >
          <MobileDrawerContent
            sections={sections}
            activeSectionId={activeSectionId}
            onSectionClick={(sectionId: string) => {
              // Set navigation target first, then close drawer
              // The drawer will scroll to the target after cleanup
              setMobileNavigationTarget(sectionId);
              onSectionClick(sectionId);
              setIsMobileMenuOpen(false);
            }}
            isCoverPageActive={isCoverPageActive}
            onCoverPageClick={() => {
              onCoverPageClick?.();
              setIsMobileMenuOpen(false);
            }}
            isTOCActive={isTOCActive}
            onTOCClick={() => {
              onTOCClick?.();
              setIsMobileMenuOpen(false);
            }}
            onExportClick={onExportClick}
            onShareClick={onShareClick}
            isExporting={isExporting}
          />
        </MobileDrawer>

        {/* Main Content Area */}
        {/* Main Content Area */}
        <main className={cn(
          'min-h-screen',
          'pt-16 lg:pt-6 pb-24 lg:pb-16',
          'px-4 sm:px-6 lg:px-8'
        )}>
          {/* Desktop content with sidebar margin */}
          <div className="hidden lg:block">
            <motion.div
              animate={{
                marginLeft: isSidebarCollapsed ? 56 : 260,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 35 }}
              className="transition-[margin]"
            >
              <div className="mx-auto max-w-[720px] py-4">
                {children}
              </div>
            </motion.div>
          </div>

          {/* Mobile/Tablet content (no sidebar margin) */}
          <div className="lg:hidden">
            <div className="mx-auto max-w-[680px]">
              {children}
            </div>
          </div>
        </main>

        {/* Quick Nav Pill */}
        <QuickNavPill
          sections={sections}
          activeSectionId={activeSectionId}
          currentSectionIndex={currentSectionIndex >= 0 ? currentSectionIndex : 0}
          onSectionClick={scrollToSection}
          onPrevious={handlePrevious}
          onNext={handleNext}
          showThreshold={300}
        />
      </div>
    </PreviewLayoutV2Context.Provider>
  );
}

/**
 * Mobile Header Component
 */
interface MobileHeaderProps {
  planTitle: string;
  onMenuClick: () => void;
  onExportClick: () => void;
  onShareClick: () => void;
  isExporting?: boolean;
}

function MobileHeader({
  planTitle,
  onMenuClick,
  onExportClick,
  onShareClick,
  isExporting = false,
}: MobileHeaderProps) {
  const navigate = useNavigate();

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-40',
        'lg:hidden',
        'h-14',
        'bg-white/95 dark:bg-warm-gray-900/95',
        'backdrop-blur-xl',
        'border-b border-warm-gray-200/50 dark:border-warm-gray-800/50'
      )}
    >
      <div className="flex items-center justify-between h-full px-4">
        {/* Left: Back + Menu */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 -ml-2 rounded-lg text-warm-gray-500 hover:text-warm-gray-700 hover:bg-warm-gray-100 dark:text-warm-gray-400 dark:hover:text-warm-gray-200 dark:hover:bg-warm-gray-800 transition-colors"
            aria-label="Back to dashboard"
          >
            <ArrowLeft size={20} />
          </button>
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg text-warm-gray-500 hover:text-warm-gray-700 hover:bg-warm-gray-100 dark:text-warm-gray-400 dark:hover:text-warm-gray-200 dark:hover:bg-warm-gray-800 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Center: Title */}
        <h1 className="text-sm font-medium text-warm-gray-900 dark:text-white truncate max-w-[180px]">
          {planTitle}
        </h1>

        {/* Right: Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={onExportClick}
            disabled={isExporting}
            className="p-2 rounded-lg text-warm-gray-500 hover:text-momentum-orange hover:bg-orange-50 dark:text-warm-gray-400 dark:hover:text-momentum-orange dark:hover:bg-orange-900/20 transition-colors disabled:opacity-50"
            aria-label="Export"
          >
            {isExporting ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Download size={20} />
            )}
          </button>
          <button
            onClick={onShareClick}
            className="p-2 rounded-lg text-warm-gray-500 hover:text-warm-gray-700 hover:bg-warm-gray-100 dark:text-warm-gray-400 dark:hover:text-warm-gray-200 dark:hover:bg-warm-gray-800 transition-colors"
            aria-label="Share"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}

/**
 * Mobile Drawer Content Component
 */
interface MobileDrawerContentProps {
  sections: PlanSection[];
  activeSectionId: string | null;
  onSectionClick: (sectionId: string) => void;
  isCoverPageActive?: boolean;
  onCoverPageClick?: () => void;
  isTOCActive?: boolean;
  onTOCClick?: () => void;
  onExportClick: (format?: ExportFormat) => void;
  onShareClick: () => void;
  isExporting?: boolean;
}

function MobileDrawerContent({
  sections,
  activeSectionId,
  onSectionClick,
  isCoverPageActive = false,
  onCoverPageClick,
  isTOCActive = false,
  onTOCClick,
  onExportClick,
  onShareClick,
  isExporting = false,
}: MobileDrawerContentProps) {
  return (
    <div className="space-y-1">
      {/* Cover Page & TOC */}
      {onCoverPageClick && (
        <button
          onClick={onCoverPageClick}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
            isCoverPageActive
              ? 'bg-orange-50 dark:bg-orange-900/30 border-l-4 border-momentum-orange'
              : 'hover:bg-warm-gray-100 dark:hover:bg-warm-gray-800'
          )}
        >
          <BookOpen size={18} className={isCoverPageActive ? 'text-momentum-orange' : 'text-warm-gray-400'} />
          <span className={cn(
            'text-sm font-medium',
            isCoverPageActive ? 'text-momentum-orange' : 'text-warm-gray-700 dark:text-warm-gray-300'
          )}>
            Cover Page
          </span>
        </button>
      )}

      {onTOCClick && (
        <button
          onClick={onTOCClick}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
            isTOCActive
              ? 'bg-orange-50 dark:bg-orange-900/30 border-l-4 border-momentum-orange'
              : 'hover:bg-warm-gray-100 dark:hover:bg-warm-gray-800'
          )}
        >
          <List size={18} className={isTOCActive ? 'text-momentum-orange' : 'text-warm-gray-400'} />
          <span className={cn(
            'text-sm font-medium',
            isTOCActive ? 'text-momentum-orange' : 'text-warm-gray-700 dark:text-warm-gray-300'
          )}>
            Table of Contents
          </span>
        </button>
      )}

      {/* Divider */}
      <div className="my-2 mx-3 border-t border-warm-gray-200 dark:border-warm-gray-700" />

      {/* Section label */}
      <p className="text-[11px] uppercase tracking-widest text-warm-gray-400 dark:text-warm-gray-500 font-semibold mb-2 px-4 py-1">
        Sections
      </p>

      {/* Section list */}
      {sections.map((section, index) => {
        const isActive = activeSectionId === section.id;
        const hasContent = section.content && section.content.trim().length > 0;

        return (
          <button
            key={section.id}
            onClick={() => onSectionClick(section.id)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
              isActive
                ? 'bg-orange-50 dark:bg-orange-900/30 border-l-4 border-momentum-orange'
                : 'hover:bg-warm-gray-100 dark:hover:bg-warm-gray-800'
            )}
          >
            {/* Status indicator */}
            <div className="flex-shrink-0">
              {hasContent ? (
                <CheckCircle2 size={18} className="text-green-500" />
              ) : isActive ? (
                <div className="w-[18px] h-[18px] rounded-full bg-momentum-orange flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              ) : (
                <div className="w-[18px] h-[18px] rounded-full border-2 border-warm-gray-300 dark:border-warm-gray-600" />
              )}
            </div>

            {/* Section title */}
            <span className={cn(
              'text-sm font-medium truncate',
              isActive
                ? 'text-momentum-orange'
                : hasContent
                  ? 'text-warm-gray-600 dark:text-warm-gray-300'
                  : 'text-warm-gray-700 dark:text-warm-gray-300'
            )}>
              {index + 1}. {section.title}
            </span>
          </button>
        );
      })}

      {/* Actions */}
      <div className="mt-4 pt-4 border-t border-warm-gray-200 dark:border-warm-gray-700 space-y-2">
        <button
          onClick={() => onExportClick('pdf')}
          disabled={isExporting}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl',
            'bg-momentum-orange text-white',
            'hover:bg-orange-600 transition-colors',
            'disabled:opacity-50'
          )}
        >
          {isExporting ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Download size={18} />
          )}
          <span className="text-sm font-medium">
            {isExporting ? 'Exporting...' : 'Export PDF'}
          </span>
        </button>

        <button
          onClick={onShareClick}
          className={cn(
            'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl',
            'border border-warm-gray-200 dark:border-warm-gray-700',
            'text-warm-gray-600 dark:text-warm-gray-300',
            'hover:bg-warm-gray-50 dark:hover:bg-warm-gray-800 transition-colors'
          )}
        >
          <Share2 size={18} />
          <span className="text-sm font-medium">Share</span>
        </button>
      </div>
    </div>
  );
}
