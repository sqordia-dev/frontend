import { Document } from '@react-pdf/renderer';
import { PlanSection } from '../../types/preview';
import { CoverPageSettings } from '../../types/cover-page';
import { CoverPagePDF, TableOfContentsPagePDF, SectionPagePDF } from './pdf-components';

export interface BusinessPlanPDFProps {
  /** Cover page settings */
  coverSettings: CoverPageSettings;
  /** Business plan sections */
  sections: PlanSection[];
  /** Company name (for headers/footers) */
  companyName: string;
}

/**
 * BusinessPlanPDF - Main PDF document component
 * Combines cover page, table of contents, and section pages
 */
export function BusinessPlanPDF({
  coverSettings,
  sections,
  companyName,
}: BusinessPlanPDFProps) {
  const logoUrl = coverSettings.logoUrl;

  return (
    <Document
      title={`${companyName} - Business Plan`}
      author={coverSettings.contactName || companyName}
      subject="Business Plan"
      keywords="business plan, strategy, financial projections"
      creator="Sqordia Business Plan Generator"
      producer="Sqordia"
    >
      {/* Cover Page */}
      <CoverPagePDF settings={coverSettings} />

      {/* Table of Contents */}
      <TableOfContentsPagePDF
        sections={sections}
        companyName={companyName}
        logoUrl={logoUrl}
        startPage={3}
      />

      {/* Section Pages */}
      {sections.map((section, index) => (
        <SectionPagePDF
          key={section.id}
          section={section}
          sectionNumber={index + 1}
          companyName={companyName}
          logoUrl={logoUrl}
        />
      ))}
    </Document>
  );
}

export default BusinessPlanPDF;
