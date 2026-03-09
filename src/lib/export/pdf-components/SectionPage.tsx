import { Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { PlanSection } from '../../../types/preview';
import type { ExportTheme } from '../../../types/export-theme';
import { parseHTMLToElements, cleanParsedElements, ParsedElement } from '../html-parser';

interface SectionPagePDFProps {
  section: PlanSection;
  sectionNumber: number;
  companyName: string;
  logoUrl?: string;
  exportTheme?: ExportTheme;
}

export function SectionPagePDF({
  section,
  sectionNumber,
  companyName,
  logoUrl,
  exportTheme,
}: SectionPagePDFProps) {
  const accentColor = exportTheme?.accentColor || '#2563EB';
  const headingColor = exportTheme?.headingColor || '#1F2937';
  const heading2Color = exportTheme?.heading2Color || '#2563EB';
  const textColor = exportTheme?.textColor || '#374151';
  const mutedTextColor = exportTheme?.mutedTextColor || '#6B7280';
  const separatorColor = exportTheme?.separatorColor || '#E5E7EB';
  const pageBg = exportTheme?.pageBackgroundColor || '#FFFFFF';

  // Parse HTML content to elements
  const elements = section.content
    ? cleanParsedElements(parseHTMLToElements(section.content))
    : [];

  return (
    <Page size="LETTER" style={[styles.page, { color: textColor, backgroundColor: pageBg }]} wrap>
      {/* Header with Logo */}
      {logoUrl && (
        <View style={styles.header} fixed>
          <Image src={logoUrl} style={styles.logo} />
        </View>
      )}

      {/* Section Number */}
      <Text style={[styles.sectionNumber, { color: accentColor }]}>
        {String(sectionNumber).padStart(2, '0')}.
      </Text>

      {/* Section Title with accent border (matching preview) */}
      <View style={[styles.sectionTitleBar, { borderBottomColor: accentColor }]}>
        <Text style={[styles.sectionTitle, { color: headingColor }]}>{section.title}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {elements.length > 0 ? (
          elements.map((element, index) => (
            <ContentElement
              key={index}
              element={element}
              accentColor={accentColor}
              heading2Color={heading2Color}
              textColor={textColor}
              mutedTextColor={mutedTextColor}
              separatorColor={separatorColor}
            />
          ))
        ) : (
          <Text style={[styles.emptyContent, { color: mutedTextColor }]}>
            This section has not been generated yet.
          </Text>
        )}
      </View>

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: separatorColor }]} fixed>
        <Text style={{ color: mutedTextColor }}>Business Plan – {companyName}</Text>
        <Text style={{ color: mutedTextColor }} render={({ pageNumber }) => `${pageNumber}`} />
      </View>
    </Page>
  );
}

/**
 * Render a single content element with theme colors
 */
function ContentElement({
  element,
  accentColor,
  heading2Color,
  textColor,
  mutedTextColor,
  separatorColor,
}: {
  element: ParsedElement;
  accentColor: string;
  heading2Color: string;
  textColor: string;
  mutedTextColor: string;
  separatorColor: string;
}) {
  switch (element.type) {
    case 'heading1':
      return <Text style={[styles.heading1, { color: heading2Color }]}>{element.content}</Text>;

    case 'heading2':
      return <Text style={[styles.heading2, { color: textColor }]}>{element.content}</Text>;

    case 'heading3':
      return <Text style={[styles.heading3, { color: textColor }]}>{element.content}</Text>;

    case 'paragraph':
      return <Text style={[styles.paragraph, { color: textColor }]}>{element.content}</Text>;

    case 'bulletList':
      return (
        <View style={styles.bulletList}>
          {element.items?.map((item, i) => (
            <View key={i} style={styles.bulletItem}>
              <Text style={[styles.bullet, { color: accentColor }]}>•</Text>
              <Text style={[styles.bulletText, { color: textColor }]}>{item}</Text>
            </View>
          ))}
        </View>
      );

    case 'numberedList':
      return (
        <View style={styles.numberedList}>
          {element.items?.map((item, i) => (
            <View key={i} style={styles.numberedItem}>
              <Text style={[styles.number, { color: accentColor }]}>{i + 1}.</Text>
              <Text style={[styles.numberedText, { color: textColor }]}>{item}</Text>
            </View>
          ))}
        </View>
      );

    case 'table':
      if (!element.rows || element.rows.length === 0) return null;
      return (
        <View style={[styles.table, { borderColor: separatorColor }]}>
          {element.rows.map((row, rowIndex) => (
            <View
              key={rowIndex}
              style={rowIndex === 0
                ? [styles.tableHeaderRow, { borderBottomColor: separatorColor }]
                : [styles.tableRow, { borderBottomColor: separatorColor }]
              }
            >
              {row.map((cell, cellIndex) => (
                <Text
                  key={cellIndex}
                  style={rowIndex === 0
                    ? [styles.tableHeaderCell, { borderRightColor: separatorColor, color: textColor }]
                    : [styles.tableCell, { borderRightColor: separatorColor, color: textColor }]
                  }
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
        <View style={[styles.blockquote, { borderLeftColor: accentColor }]}>
          <Text style={[styles.paragraph, { color: mutedTextColor, fontStyle: 'italic' }]}>
            {element.content}
          </Text>
        </View>
      );

    default:
      return <Text style={[styles.paragraph, { color: textColor }]}>{element.content}</Text>;
  }
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
  sectionNumber: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  sectionTitleBar: {
    paddingBottom: 12,
    marginBottom: 24,
    borderBottomWidth: 2,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  heading1: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 12,
  },
  heading2: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 10,
  },
  heading3: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 11,
    lineHeight: 1.6,
    marginBottom: 10,
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
  },
  bulletText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 1.5,
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
  },
  numberedText: {
    flex: 1,
    fontSize: 11,
    lineHeight: 1.5,
  },
  table: {
    marginVertical: 12,
    borderWidth: 1,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    borderBottomWidth: 2,
    backgroundColor: '#F3F4F6',
  },
  tableCell: {
    flex: 1,
    padding: 8,
    fontSize: 10,
    borderRightWidth: 1,
  },
  tableHeaderCell: {
    flex: 1,
    padding: 8,
    fontSize: 10,
    fontWeight: 'bold',
    borderRightWidth: 1,
  },
  blockquote: {
    borderLeftWidth: 3,
    paddingLeft: 16,
    marginVertical: 12,
  },
  emptyContent: {
    fontSize: 11,
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
    borderTopWidth: 1,
    paddingTop: 8,
  },
});
