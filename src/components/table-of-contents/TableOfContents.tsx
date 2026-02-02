import { useMemo } from 'react';
import { PlanSection } from '../../types/preview';
import { TOCHeader } from './TOCHeader';
import { TOCCategoryHeader } from './TOCCategory';
import { TOCSectionRow } from './TOCSectionRow';
import { groupSectionsByCategory, getCategoryIcon } from './utils';
import { TOCStyle, getPresetConfig } from '../../types/toc-settings';
import { cn } from '../../lib/utils';
import { useTheme } from '../../contexts/ThemeContext';

interface TableOfContentsProps {
  /** List of sections to display */
  sections: PlanSection[];
  /** Callback when a section is clicked */
  onSectionClick: (sectionId: string) => void;
  /** Currently active section ID */
  activeSectionId?: string | null;
  /** Optional className for styling */
  className?: string;
  /** TOC style preset */
  style?: TOCStyle;
}

/**
 * TableOfContents - Main TOC component for business plan preview
 * Groups sections by category with clickable navigation
 * Supports multiple style presets: classic, modern, minimal, magazine, corporate
 */
export function TableOfContents({
  sections,
  onSectionClick,
  activeSectionId,
  className = '',
  style = 'classic',
}: TableOfContentsProps) {
  const { t } = useTheme();
  // Get preset configuration
  const preset = useMemo(() => getPresetConfig(style), [style]);
  const tocTitle = t('planView.tableOfContents');

  // Group sections by category
  const groupedSections = useMemo(() => {
    return groupSectionsByCategory(sections);
  }, [sections]);

  if (sections.length === 0) {
    return null;
  }

  // Modern style uses a grid layout
  if (style === 'modern') {
    return (
      <div
        className={cn(
          'rounded-xl overflow-hidden',
          className
        )}
        style={{
          backgroundColor: preset.backgroundColor,
          fontFamily: preset.bodyFont,
        }}
        role="navigation"
        aria-label="Table of contents"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2
            className="text-lg font-semibold flex items-center gap-2"
            style={{ color: preset.headerColor, fontFamily: preset.headerFont }}
          >
            <span className="text-xl" aria-hidden="true">{String.fromCodePoint(128203)}</span>
            {tocTitle}
          </h2>
        </div>

        {/* Grid of cards */}
        <div className="p-4 grid grid-cols-2 gap-3">
          {sections.map((section) => {
            const isActive = activeSectionId === section.id;
            return (
              <button
                key={section.id}
                onClick={() => onSectionClick(section.id)}
                className={cn(
                  'p-3 rounded-lg text-left transition-all',
                  'hover:shadow-md hover:scale-[1.02]',
                  isActive
                    ? 'bg-momentum-orange/10 border-2 border-momentum-orange shadow-md'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-momentum-orange/50'
                )}
              >
                <div className="flex items-center gap-2">
                  {preset.showIcons && (
                    <span className="text-lg">{getCategoryIcon(section.title)}</span>
                  )}
                  <span
                    className="text-sm font-medium truncate"
                    style={{ color: isActive ? preset.accentColor : preset.textColor }}
                  >
                    {section.title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Minimal style
  if (style === 'minimal') {
    return (
      <div
        className={cn('p-6', className)}
        style={{
          backgroundColor: preset.backgroundColor,
          fontFamily: preset.bodyFont,
        }}
        role="navigation"
        aria-label="Table of contents"
      >
        <h2
          className="text-lg font-medium mb-6"
          style={{ color: preset.headerColor, fontFamily: preset.headerFont }}
        >
          {tocTitle}
        </h2>
        <div className="space-y-3">
          {sections.map((section) => {
            const isActive = activeSectionId === section.id;
            return (
              <button
                key={section.id}
                onClick={() => onSectionClick(section.id)}
                className={cn(
                  'block w-full text-left py-2 transition-colors',
                  isActive ? 'font-medium' : ''
                )}
                style={{ color: isActive ? preset.headerColor : preset.textColor }}
              >
                {section.title}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Magazine style
  if (style === 'magazine') {
    return (
      <div
        className={cn(
          'overflow-hidden',
          preset.showBorder ? 'border-4 border-double' : '',
          className
        )}
        style={{
          backgroundColor: preset.backgroundColor,
          borderColor: preset.borderColor,
          fontFamily: preset.bodyFont,
        }}
        role="navigation"
        aria-label="Table of contents"
      >
        {/* Title bar */}
        <div
          className="px-6 py-4 text-center"
          style={{ backgroundColor: preset.borderColor }}
        >
          <h2
            className="text-xl font-bold tracking-wider"
            style={{ color: preset.headerColor, fontFamily: preset.headerFont }}
          >
            {tocTitle}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6">
          {groupedSections.map(({ category, sections: categorySections }) => (
            <div key={category} className="mb-6 last:mb-0">
              {preset.showCategoryHeaders && (
                <div
                  className="py-2 px-3 mb-3 font-bold tracking-wide"
                  style={{
                    backgroundColor: preset.accentColor,
                    color: '#FFFFFF',
                    textTransform: preset.categoryStyle === 'uppercase' ? 'uppercase' : 'none',
                  }}
                >
                  {category}
                </div>
              )}
              <div className="space-y-2 pl-2">
                {categorySections.map((section) => {
                  const isActive = activeSectionId === section.id;
                  return (
                    <button
                      key={section.id}
                      onClick={() => onSectionClick(section.id)}
                      className={cn(
                        'flex items-center w-full text-left py-1 transition-colors',
                        isActive ? 'font-semibold' : ''
                      )}
                      style={{ color: isActive ? preset.accentColor : preset.textColor }}
                    >
                      {preset.showIcons && (
                        <span className="mr-2">{getCategoryIcon(section.title)}</span>
                      )}
                      <span className="flex-1">{section.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Corporate style
  if (style === 'corporate') {
    let chapterNum = 0;
    return (
      <div
        className={cn(
          'overflow-hidden',
          preset.showBorder ? 'border' : '',
          className
        )}
        style={{
          backgroundColor: preset.backgroundColor,
          borderColor: preset.borderColor,
          fontFamily: preset.bodyFont,
        }}
        role="navigation"
        aria-label="Table of contents"
      >
        {/* Title */}
        <div className="px-6 py-5 border-b-2" style={{ borderColor: preset.borderColor }}>
          <h2
            className="text-xl font-bold text-center tracking-wide"
            style={{ color: preset.headerColor, fontFamily: preset.headerFont }}
          >
            {tocTitle}
          </h2>
          <div className="mt-2 mx-auto w-32 border-b-2" style={{ borderColor: preset.accentColor }} />
        </div>

        {/* Content */}
        <div className="p-6">
          {groupedSections.map(({ category, sections: categorySections }) => {
            chapterNum++;
            return (
              <div key={category} className="mb-5 last:mb-0">
                {preset.showCategoryHeaders && (
                  <div className="mb-2 pb-1 border-b" style={{ borderColor: preset.borderColor }}>
                    <span
                      className="font-bold"
                      style={{ color: preset.headerColor, textTransform: 'uppercase' }}
                    >
                      CHAPTER {chapterNum}: {category}
                    </span>
                  </div>
                )}
                <div className="space-y-1 pl-4">
                  {categorySections.map((section, idx) => {
                    const isActive = activeSectionId === section.id;
                    return (
                      <button
                        key={section.id}
                        onClick={() => onSectionClick(section.id)}
                        className={cn(
                          'flex items-center w-full text-left py-1 transition-colors',
                          isActive ? 'font-semibold' : ''
                        )}
                        style={{ color: isActive ? preset.accentColor : preset.textColor }}
                      >
                        <span className="w-8">{chapterNum}.{idx + 1}</span>
                        <span className="flex-1">{section.title}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Classic style (default)
  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden',
        className
      )}
      style={{ fontFamily: preset.bodyFont }}
      role="navigation"
      aria-label="Table of contents"
    >
      {/* Header */}
      <TOCHeader />

      {/* Categories and Sections */}
      <div>
        {groupedSections.map(({ category, sections: categorySections }) => (
          <div key={category}>
            {/* Category Header */}
            <TOCCategoryHeader category={category} />

            {/* Section Rows */}
            {categorySections.map((section) => (
              <TOCSectionRow
                key={section.id}
                number={section.orderNumber}
                title={section.title}
                isActive={activeSectionId === section.id}
                onClick={() => onSectionClick(section.id)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
