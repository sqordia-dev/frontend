import { Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { PlanSection } from '../../../types/preview';
import { groupSectionsByCategory, type GroupedSections } from '../../../components/table-of-contents/utils';

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 72,
    paddingBottom: 72,
    paddingLeft: 90,
    paddingRight: 72,
    color: '#374151',
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
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 30,
  },
  separator: {
    height: 1,
    backgroundColor: '#D1D5DB',
    marginBottom: 24,
  },
  categorySection: {
    marginBottom: 20,
  },
  categoryHeader: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
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
    color: '#4B5563',
  },
  dottedLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#D1D5DB',
    borderBottomStyle: 'dotted',
    marginHorizontal: 8,
    marginBottom: 3,
  },
  pageNumber: {
    fontSize: 11,
    color: '#4B5563',
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
    color: '#6B7280',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 8,
  },
});

interface TableOfContentsPagePDFProps {
  sections: PlanSection[];
  companyName: string;
  logoUrl?: string;
  startPage?: number;
}

export function TableOfContentsPagePDF({
  sections,
  companyName,
  logoUrl,
  startPage = 3,
}: TableOfContentsPagePDFProps) {
  // Group sections by category
  const groupedSections: GroupedSections[] = groupSectionsByCategory(sections);

  // Calculate page numbers (estimate 2 pages per section on average)
  const getPageNumber = (sectionIndex: number): number => {
    return startPage + sectionIndex * 2;
  };

  let globalSectionIndex = 0;

  return (
    <Page size="LETTER" style={styles.page}>
      {/* Header with Logo */}
      {logoUrl && (
        <View style={styles.header} fixed>
          <Image src={logoUrl} style={styles.logo} />
        </View>
      )}

      {/* Title */}
      <Text style={styles.title}>Table of Contents</Text>
      <Text style={styles.subtitle}>TABLE OF CONTENTS</Text>
      <View style={styles.separator} />

      {/* Categories and Sections */}
      {groupedSections.map((group) => (
        <View key={group.category} style={styles.categorySection}>
          {/* Category Header */}
          <Text style={styles.categoryHeader}>{group.category}</Text>

          {/* Section Rows */}
          {group.sections.map((section) => {
            const pageNum = getPageNumber(globalSectionIndex);
            globalSectionIndex++;

            return (
              <View key={section.id} style={styles.sectionRow}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <View style={styles.dottedLine} />
                <Text style={styles.pageNumber}>{pageNum}</Text>
              </View>
            );
          })}
        </View>
      ))}

      {/* Footer */}
      <View style={styles.footer} fixed>
        <Text>Business Plan – {companyName}</Text>
        <Text render={({ pageNumber }) => `${pageNumber}`} />
      </View>
    </Page>
  );
}
