import { useMemo } from 'react';
import { PlanSection } from '../../types/preview';
import { groupSectionsByCategory, getCategoryIcon } from './utils';
import { TOCStyle, getPresetConfig } from '../../types/toc-settings';

interface TOCForExportProps {
  /** List of sections to display */
  sections: PlanSection[];
  /** Function to get page number for a section */
  getPageNumber?: (sectionId: string) => number;
  /** Company logo URL (optional) */
  logoUrl?: string;
  /** Company name for footer */
  companyName?: string;
  /** Optional className for styling */
  className?: string;
  /** TOC style preset */
  style?: TOCStyle;
  /** Primary color for branding */
  primaryColor?: string;
}

/**
 * TOCForExport - Printable version of Table of Contents for PDF/Word export
 * Supports multiple style presets: classic, modern, minimal, magazine, corporate
 */
export function TOCForExport({
  sections,
  getPageNumber,
  logoUrl,
  companyName = 'Business Plan',
  className = '',
  style = 'classic',
  primaryColor = '#2563EB',
}: TOCForExportProps) {
  // Get preset configuration
  const preset = useMemo(() => getPresetConfig(style), [style]);

  // Group sections by category
  const groupedSections = useMemo(() => {
    return groupSectionsByCategory(sections);
  }, [sections]);

  // Default page number function (estimates based on section order)
  const defaultGetPageNumber = (sectionId: string): number => {
    const index = sections.findIndex((s) => s.id === sectionId);
    // Start at page 4 (after cover and TOC), roughly 2 pages per section
    return index >= 0 ? 4 + index * 2 : 1;
  };

  const pageNumberFn = getPageNumber || defaultGetPageNumber;

  if (sections.length === 0) {
    return null;
  }

  // Use primary color from cover page or preset accent color
  const accentColor = primaryColor || preset.accentColor;

  // Modern style export
  if (style === 'modern') {
    return (
      <div
        className={`bg-white p-8 page-break-after ${className}`}
        style={{ fontFamily: preset.bodyFont, backgroundColor: preset.backgroundColor }}
      >
        {logoUrl && (
          <div className="flex justify-end mb-6">
            <img src={logoUrl} alt="Company logo" className="h-12 w-auto object-contain" />
          </div>
        )}

        <h1 className="text-2xl font-semibold mb-6 flex items-center gap-2" style={{ color: preset.headerColor }}>
          <span>&#128203;</span> {preset.title}
        </h1>

        <div className="grid grid-cols-2 gap-4">
          {sections.map((section) => (
            <div
              key={section.id}
              className="p-4 border rounded-lg"
              style={{ borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }}
            >
              <div className="flex items-center gap-2">
                <span dangerouslySetInnerHTML={{ __html: getCategoryIcon(section.title) }} />
                <span className="font-medium" style={{ color: preset.textColor }}>{section.title}</span>
              </div>
              {preset.showPageNumbers && (
                <div className="text-right text-sm mt-2" style={{ color: accentColor }}>
                  Page {pageNumberFn(section.id)}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 pt-4 border-t" style={{ borderColor: '#E5E7EB' }}>
          <div className="flex justify-between items-center text-sm" style={{ color: '#6B7280' }}>
            <span>Business Plan – {companyName}</span>
            <span>2</span>
          </div>
        </div>
      </div>
    );
  }

  // Minimal style export
  if (style === 'minimal') {
    return (
      <div
        className={`bg-white p-8 page-break-after ${className}`}
        style={{ fontFamily: preset.bodyFont }}
      >
        {logoUrl && (
          <div className="flex justify-end mb-8">
            <img src={logoUrl} alt="Company logo" className="h-10 w-auto object-contain" />
          </div>
        )}

        <h1 className="text-xl font-medium mb-8" style={{ color: preset.headerColor }}>
          {preset.title}
        </h1>

        <div className="space-y-4">
          {sections.map((section) => (
            <div key={section.id} style={{ color: preset.textColor }}>
              {section.title}
            </div>
          ))}
        </div>

        <div className="mt-12 text-sm" style={{ color: '#9CA3AF' }}>
          {companyName}
        </div>
      </div>
    );
  }

  // Magazine style export
  if (style === 'magazine') {
    return (
      <div
        className={`bg-white p-8 page-break-after ${className}`}
        style={{
          fontFamily: preset.bodyFont,
          border: preset.showBorder ? `4px double ${preset.borderColor}` : 'none',
        }}
      >
        {logoUrl && (
          <div className="flex justify-center mb-6">
            <img src={logoUrl} alt="Company logo" className="h-14 w-auto object-contain" />
          </div>
        )}

        <div className="text-center py-4 mb-6" style={{ backgroundColor: preset.borderColor }}>
          <h1 className="text-2xl font-bold tracking-widest" style={{ color: '#FFFFFF' }}>
            {preset.title}
          </h1>
        </div>

        {groupedSections.map(({ category, sections: categorySections }) => (
          <div key={category} className="mb-6">
            <div className="py-2 px-3 mb-3" style={{ backgroundColor: accentColor }}>
              <span className="font-bold text-white tracking-wide uppercase">{category}</span>
            </div>

            <div className="space-y-2 pl-4">
              {categorySections.map((section) => (
                <div key={section.id} className="flex items-end">
                  <span dangerouslySetInnerHTML={{ __html: getCategoryIcon(section.title) }} className="mr-2" />
                  <span style={{ color: preset.textColor }}>{section.title}</span>
                  <span className="flex-1" />
                  {preset.showPageNumbers && (
                    <span style={{ color: accentColor }}>Page {pageNumberFn(section.id)}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-8 pt-4 border-t-4 border-double" style={{ borderColor: preset.borderColor }}>
          <div className="flex justify-between items-center text-sm" style={{ color: preset.textColor }}>
            <span>{companyName}</span>
            <span>2</span>
          </div>
        </div>
      </div>
    );
  }

  // Corporate style export
  if (style === 'corporate') {
    let chapterNum = 0;
    return (
      <div
        className={`bg-white p-8 page-break-after ${className}`}
        style={{
          fontFamily: preset.bodyFont,
          border: preset.showBorder ? `1px solid ${preset.borderColor}` : 'none',
        }}
      >
        {logoUrl && (
          <div className="flex justify-end mb-6">
            <img src={logoUrl} alt="Company logo" className="h-12 w-auto object-contain" />
          </div>
        )}

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold tracking-wide" style={{ color: preset.headerColor }}>
            {preset.title}
          </h1>
          <div className="mt-2 mx-auto w-32 border-b-2" style={{ borderColor: accentColor }} />
        </div>

        {groupedSections.map(({ category, sections: categorySections }) => {
          chapterNum++;
          return (
            <div key={category} className="mb-5">
              <div className="mb-2 pb-1 border-b" style={{ borderColor: preset.borderColor }}>
                <span className="font-bold uppercase" style={{ color: preset.headerColor }}>
                  CHAPTER {chapterNum}: {category}
                </span>
              </div>

              <div className="space-y-1 pl-6">
                {categorySections.map((section, idx) => (
                  <div key={section.id} className="flex items-end">
                    <span className="w-10" style={{ color: preset.textColor }}>
                      {chapterNum}.{idx + 1}
                    </span>
                    <span style={{ color: preset.textColor }}>{section.title}</span>
                    <span
                      className="flex-1 mx-2 border-b border-dotted"
                      style={{ borderColor: '#9CA3AF', minWidth: '20px' }}
                    />
                    <span style={{ color: preset.textColor }}>{pageNumberFn(section.id)}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        <div className="mt-8 pt-4 border-t" style={{ borderColor: preset.borderColor }}>
          <div className="flex justify-between items-center text-sm" style={{ color: '#6B7280' }}>
            <span>Business Plan – {companyName}</span>
            <span>2</span>
          </div>
        </div>
      </div>
    );
  }

  // Classic style export (default)
  return (
    <div
      className={`bg-white p-8 page-break-after ${className}`}
      style={{ fontFamily: preset.bodyFont }}
    >
      {/* Logo (if provided) */}
      {logoUrl && (
        <div className="flex justify-end mb-6">
          <img
            src={logoUrl}
            alt="Company logo"
            className="h-12 w-auto object-contain"
          />
        </div>
      )}

      {/* Title */}
      <h1
        className="text-3xl font-bold mb-8"
        style={{ color: accentColor, fontFamily: preset.headerFont }}
      >
        {preset.title}
      </h1>

      {/* Separator line */}
      <div className="border-t mb-6" style={{ borderColor: accentColor }} />

      {/* Categories and Sections */}
      {groupedSections.map(({ category, sections: categorySections }) => (
        <div key={category} className="mb-6">
          {/* Category Header */}
          <h2
            className="text-lg font-bold mb-3 border-b pb-2 uppercase"
            style={{ color: preset.headerColor, borderColor: '#D1D5DB' }}
          >
            {category}
          </h2>

          {/* Sections with dotted lines and page numbers */}
          <div className="space-y-2 pl-4">
            {categorySections.map((section) => (
              <div key={section.id} className="flex items-end">
                <span style={{ color: preset.textColor }}>{section.title}</span>
                <span
                  className="flex-1 mx-2 border-b border-dotted"
                  style={{ borderColor: '#9CA3AF', minWidth: '20px' }}
                />
                <span className="font-medium" style={{ color: preset.textColor }}>
                  {pageNumberFn(section.id)}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Footer separator */}
      <div className="border-t mt-8 pt-4" style={{ borderColor: '#D1D5DB' }}>
        <div className="flex justify-between items-center text-sm" style={{ color: '#6B7280' }}>
          <span>Business Plan – {companyName}</span>
          <span>2</span>
        </div>
      </div>
    </div>
  );
}
