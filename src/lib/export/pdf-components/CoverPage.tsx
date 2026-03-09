import { Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { CoverPageSettings } from '../../../types/cover-page';
import type { ExportTheme } from '../../../types/export-theme';

interface CoverPagePDFProps {
  settings: CoverPageSettings;
  exportTheme?: ExportTheme;
}

export function CoverPagePDF({ settings, exportTheme }: CoverPagePDFProps) {
  const primaryColor = exportTheme?.primaryColor || settings.primaryColor || '#2563EB';
  const headingColor = exportTheme?.headingColor || '#1F2937';
  const textColor = exportTheme?.textColor || '#374151';
  const mutedTextColor = exportTheme?.mutedTextColor || '#6B7280';
  const accentColor = exportTheme?.accentColor || primaryColor;
  const chartColors = exportTheme?.chartColorPalette || [primaryColor];

  const formatDate = (dateStr?: string): string => {
    if (!dateStr) return new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const hasContactInfo = settings.contactName || settings.contactEmail || settings.contactPhone || settings.website;
  const hasAddress = settings.addressLine1 || settings.city;

  return (
    <Page size="LETTER" style={styles.page}>
      {/* Cover color band */}
      <View style={[styles.coverBand, { backgroundColor: primaryColor }]}>

        {/* Logo in the cover band */}
        {settings.logoUrl && (
          <View style={styles.coverLogo}>
            <Image src={settings.logoUrl} style={styles.logo} />
          </View>
        )}

        {/* Title area */}
        <View style={styles.coverTitleArea}>
          <Text style={styles.coverTitle}>
            {settings.companyName || 'Company Name'}
          </Text>
          <Text style={styles.coverSubtitle}>
            {settings.documentTitle || 'Business Plan'}
          </Text>
          {/* Chart color dots (matching preview) */}
          <View style={styles.colorDots}>
            {chartColors.slice(0, 4).map((color, i) => (
              <View key={i} style={[styles.colorDot, { backgroundColor: color, opacity: 0.8 }]} />
            ))}
          </View>
        </View>
      </View>

      {/* Below-band content */}
      <View style={styles.belowBand}>
        {/* Prepared date */}
        <Text style={[styles.preparedDate, { color: mutedTextColor }]}>
          Prepared: {formatDate(settings.preparedDate)}
        </Text>

        {/* Contact information */}
        {hasContactInfo && (
          <View style={styles.contactSection}>
            <Text style={[styles.contactTitle, { color: headingColor }]}>
              Contact Information
            </Text>

            {settings.contactName && (
              <View style={styles.contactRow}>
                <Text style={[styles.contactLabel, { color: mutedTextColor }]}>Name:</Text>
                <Text style={[styles.contactValue, { color: textColor }]}>
                  {settings.contactName}
                  {settings.contactTitle ? `, ${settings.contactTitle}` : ''}
                </Text>
              </View>
            )}

            {settings.contactEmail && (
              <View style={styles.contactRow}>
                <Text style={[styles.contactLabel, { color: mutedTextColor }]}>Email:</Text>
                <Text style={[styles.contactValue, { color: accentColor }]}>{settings.contactEmail}</Text>
              </View>
            )}

            {settings.contactPhone && (
              <View style={styles.contactRow}>
                <Text style={[styles.contactLabel, { color: mutedTextColor }]}>Phone:</Text>
                <Text style={[styles.contactValue, { color: textColor }]}>{settings.contactPhone}</Text>
              </View>
            )}

            {settings.website && (
              <View style={styles.contactRow}>
                <Text style={[styles.contactLabel, { color: mutedTextColor }]}>Website:</Text>
                <Text style={[styles.contactValue, { color: accentColor }]}>{settings.website}</Text>
              </View>
            )}
          </View>
        )}

        {hasAddress && (
          <View style={styles.addressSection}>
            {settings.addressLine1 && (
              <Text style={[styles.addressText, { color: textColor }]}>{settings.addressLine1}</Text>
            )}
            {settings.addressLine2 && (
              <Text style={[styles.addressText, { color: textColor }]}>{settings.addressLine2}</Text>
            )}
            {(settings.city || settings.stateProvince || settings.postalCode) && (
              <Text style={[styles.addressText, { color: textColor }]}>
                {[settings.city, settings.stateProvince, settings.postalCode]
                  .filter(Boolean)
                  .join(', ')}
              </Text>
            )}
            {settings.country && (
              <Text style={[styles.addressText, { color: textColor }]}>{settings.country}</Text>
            )}
          </View>
        )}
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 0,
  },
  coverBand: {
    paddingHorizontal: 60,
    paddingTop: 80,
    paddingBottom: 60,
    position: 'relative',
  },
  coverLogo: {
    marginBottom: 40,
  },
  logo: {
    maxWidth: 160,
    maxHeight: 60,
    objectFit: 'contain',
  },
  coverTitleArea: {
    marginTop: 20,
  },
  coverTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  coverSubtitle: {
    fontSize: 18,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 24,
  },
  colorDots: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  colorDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  belowBand: {
    paddingHorizontal: 60,
    paddingTop: 40,
    flex: 1,
  },
  preparedDate: {
    fontSize: 12,
    marginBottom: 40,
  },
  contactSection: {
    marginTop: 20,
  },
  contactTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  contactRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  contactLabel: {
    fontSize: 11,
    width: 80,
  },
  contactValue: {
    fontSize: 11,
    flex: 1,
  },
  addressSection: {
    marginTop: 20,
  },
  addressText: {
    fontSize: 11,
    marginBottom: 4,
  },
});
