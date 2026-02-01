import { Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { PlanSection } from '../../../types/preview';
import { parseHTMLToElements, cleanParsedElements, ParsedElement } from '../html-parser';

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
  sectionNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 24,
  },
  content: {
    flex: 1,
  },
  heading1: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563EB',
    marginTop: 20,
    marginBottom: 12,
  },
  heading2: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: 16,
    marginBottom: 10,
  },
  heading3: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#4B5563',
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 10,
    color: '#374151',
    textAlign: 'justify',
  },
  bulletList: {
    marginLeft: 20,
    marginBottom: 12,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  bullet: {
    width: 15,
    fontSize: 11,
    color: '#374151',
  },
  bulletText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 1.5,
    color: '#374151',
  },
  numberedList: {
    marginLeft: 20,
    marginBottom: 12,
  },
  numberedItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  number: {
    width: 20,
    fontSize: 11,
    color: '#374151',
  },
  numberedText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 1.5,
    color: '#374151',
  },
  table: {
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    borderBottomColor: '#D1D5DB',
    backgroundColor: '#F3F4F6',
  },
  tableCell: {
    flex: 1,
    padding: 8,
    fontSize: 10,
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  tableHeaderCell: {
    flex: 1,
    padding: 8,
    fontSize: 10,
    fontWeight: 'bold',
    borderRightWidth: 1,
    borderRightColor: '#E5E7EB',
  },
  blockquote: {
    borderLeftWidth: 3,
    borderLeftColor: '#2563EB',
    paddingLeft: 16,
    marginVertical: 12,
    fontStyle: 'italic',
    color: '#4B5563',
  },
  emptyContent: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
    marginTop: 20,
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

interface SectionPagePDFProps {
  section: PlanSection;
  sectionNumber: number;
  companyName: string;
  logoUrl?: string;
}

export function SectionPagePDF({
  section,
  sectionNumber,
  companyName,
  logoUrl,
}: SectionPagePDFProps) {
  // Parse HTML content to elements
  const elements = section.content
    ? cleanParsedElements(parseHTMLToElements(section.content))
    : [];

  return (
    <Page size="LETTER" style={styles.page} wrap>
      {/* Header with Logo */}
      {logoUrl && (
        <View style={styles.header} fixed>
          <Image src={logoUrl} style={styles.logo} />
        </View>
      )}

      {/* Section Number */}
      <Text style={styles.sectionNumber}>
        {String(sectionNumber).padStart(2, '0')}.
      </Text>

      {/* Section Title */}
      <Text style={styles.sectionTitle}>{section.title}</Text>

      {/* Content */}
      <View style={styles.content}>
        {elements.length > 0 ? (
          elements.map((element, index) => (
            <ContentElement key={index} element={element} />
          ))
        ) : (
          <Text style={styles.emptyContent}>
            This section has not been generated yet.
          </Text>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer} fixed>
        <Text>Business Plan – {companyName}</Text>
        <Text render={({ pageNumber }) => `${pageNumber}`} />
      </View>
    </Page>
  );
}

/**
 * Render a single content element
 */
function ContentElement({ element }: { element: ParsedElement }) {
  switch (element.type) {
    case 'heading1':
      return <Text style={styles.heading1}>{element.content}</Text>;

    case 'heading2':
      return <Text style={styles.heading2}>{element.content}</Text>;

    case 'heading3':
      return <Text style={styles.heading3}>{element.content}</Text>;

    case 'paragraph':
      return <Text style={styles.paragraph}>{element.content}</Text>;

    case 'bulletList':
      return (
        <View style={styles.bulletList}>
          {element.items?.map((item, i) => (
            <View key={i} style={styles.bulletItem}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{item}</Text>
            </View>
          ))}
        </View>
      );

    case 'numberedList':
      return (
        <View style={styles.numberedList}>
          {element.items?.map((item, i) => (
            <View key={i} style={styles.numberedItem}>
              <Text style={styles.number}>{i + 1}.</Text>
              <Text style={styles.numberedText}>{item}</Text>
            </View>
          ))}
        </View>
      );

    case 'table':
      if (!element.rows || element.rows.length === 0) return null;
      return (
        <View style={styles.table}>
          {element.rows.map((row, rowIndex) => (
            <View
              key={rowIndex}
              style={rowIndex === 0 ? styles.tableHeaderRow : styles.tableRow}
            >
              {row.map((cell, cellIndex) => (
                <Text
                  key={cellIndex}
                  style={rowIndex === 0 ? styles.tableHeaderCell : styles.tableCell}
                >
                  {cell}
                </Text>
              ))}
            </View>
          ))}
        </View>
      );

    case 'blockquote':
      return (
        <View style={styles.blockquote}>
          <Text style={styles.paragraph}>{element.content}</Text>
        </View>
      );

    default:
      return <Text style={styles.paragraph}>{element.content}</Text>;
  }
}
