import { Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { PlanSection } from '../../../types/preview';
import type { ExportTheme } from '../../../types/export-theme';
import { groupSectionsByCategory, type GroupedSections } from '../../../components/table-of-contents/utils';

interface TableOfContentsPagePDFProps {
  sections: PlanSection[];
  companyName: string;
  logoUrl?: string;
  startPage?: number;
  exportTheme?: ExportTheme;
}

export function TableOfContentsPagePDF({
  sections,
  companyName,
  logoUrl,
  startPage = 3,
  exportTheme,
}: TableOfContentsPagePDFProps) {
  const headingColor = exportTheme?.headingColor || '#2563EB';
  const textColor = exportTheme?.textColor || '#4B5563';
  const mutedTextColor = exportTheme?.mutedTextColor || '#6B7280';
  const separatorColor = exportTheme?.separatorColor || '#D1D5DB';
  const tocBg = exportTheme?.tocBackgroundColor || '#FFFFFF';
  const categoryColor = exportTheme?.headingColor || '#1F2937';

  // Group sections by category
  const groupedSections: GroupedSections[] = groupSectionsByCategory(sections);

  // Calculate page numbers (estimate 2 pages per section on average)
  const getPageNumber = (sectionIndex: number): number => {
    return startPage + sectionIndex * 2;
  };

  let globalSectionIndex = 0;

  return (
    <Page size="LETTER" style={[styles.page, { backgroundColor: tocBg }]}>
      {/* Header with Logo */}
      {logoUrl && (
        <View style={styles.header} fixed>
          <Image src={logoUrl} style={styles.logo} />
        </View>
      )}

      {/* Title */}
      <Text style={[styles.title, { color: headingColor }]}>Table of Contents</Text>
      <View style={[styles.separator, { backgroundColor: separatorColor }]} />

      {/* Categories and Sections */}
      {groupedSections.map((group) => (
        <View key={group.category} style={styles.categorySection}>
          {/* Category Header */}
          <Text style={[styles.categoryHeader, { color: categoryColor, borderBottomColor: separatorColor }]}>
            {group.category}
          </Text>

          {/* Section Rows */}
          {group.sections.map((section) => {
            const pageNum = getPageNumber(globalSectionIndex);
            globalSectionIndex++;

            return (
              <View key={section.id} style={styles.sectionRow}>
                <Text style={[styles.sectionTitle, { color: textColor }]}>{section.title}</Text>
                <View style={[styles.dottedLine, { borderBottomColor: separatorColor }]} />
                <Text style={[styles.pageNumber, { color: mutedTextColor }]}>{pageNum}</Text>
              </View>
            );
          })}
        </View>
      ))}

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: separatorColor }]} fixed>
        <Text style={{ color: mutedTextColor }}>Business Plan – {companyName}</Text>
        <Text style={{ color: mutedTextColor }} render={({ pageNumber }) => `${pageNumber}`} />
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 72,
    paddingBottom: 72,
    paddingLeft: 90,
    paddingRight: 72,
  },
  header: {
    position: 'absolute',
    top: 30,
    right: 72,
  },
  logo: {
    maxWidth: 80,
    maxHeight: 30,
    objectFit: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  separator: {
    height: 1,
    marginBottom: 24,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    paddingBottom: 8,
    borderBottomWidth: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 8,
    paddingLeft: 16,
  },
  sectionTitle: {
    fontSize: 11,
  },
  dottedLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomStyle: 'dotted',
    marginHorizontal: 8,
    marginBottom: 3,
  },
  pageNumber: {
    fontSize: 11,
    minWidth: 20,
    textAlign: 'right',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 90,
    right: 72,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 9,
    borderTopWidth: 1,
    paddingTop: 8,
  },
});
