import { Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer';
import { CoverPageSettings } from '../../../types/cover-page';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 0,
  },
  container: {
    flex: 1,
    padding: 60,
    justifyContent: 'space-between',
  },
  topSection: {
    alignItems: 'center',
  },
  logo: {
    maxWidth: 200,
    maxHeight: 100,
    marginBottom: 40,
    objectFit: 'contain',
  },
  titleSection: {
    alignItems: 'center',
    marginTop: 60,
  },
  companyName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  documentTitle: {
    fontSize: 24,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  preparedDate: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 24,
  },
  colorBar: {
    height: 8,
    marginTop: 40,
  },
  bottomSection: {
    marginTop: 'auto',
  },
  contactSection: {
    marginTop: 60,
  },
  contactTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
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
    color: '#6B7280',
    width: 80,
  },
  contactValue: {
    fontSize: 11,
    color: '#374151',
    flex: 1,
  },
  addressSection: {
    marginTop: 20,
  },
  addressText: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 4,
  },
});

interface CoverPagePDFProps {
  settings: CoverPageSettings;
}

export function CoverPagePDF({ settings }: CoverPagePDFProps) {
  const primaryColor = settings.primaryColor || '#2563EB';

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
      <View style={styles.container}>
        {/* Top Section with Logo */}
        <View style={styles.topSection}>
          {settings.logoUrl && (
            <Image src={settings.logoUrl} style={styles.logo} />
          )}
        </View>

        {/* Title Section */}
        <View style={styles.titleSection}>
          <Text style={styles.companyName}>{settings.companyName}</Text>
          <Text style={styles.documentTitle}>{settings.documentTitle || 'Business Plan'}</Text>
          <View style={[styles.colorBar, { backgroundColor: primaryColor }]} />
          <Text style={styles.preparedDate}>
            Prepared: {formatDate(settings.preparedDate)}
          </Text>
        </View>

        {/* Bottom Section with Contact Info */}
        <View style={styles.bottomSection}>
          {hasContactInfo && (
            <View style={styles.contactSection}>
              <Text style={styles.contactTitle}>Contact Information</Text>

              {settings.contactName && (
                <View style={styles.contactRow}>
                  <Text style={styles.contactLabel}>Name:</Text>
                  <Text style={styles.contactValue}>
                    {settings.contactName}
                    {settings.contactTitle ? `, ${settings.contactTitle}` : ''}
                  </Text>
                </View>
              )}

              {settings.contactEmail && (
                <View style={styles.contactRow}>
                  <Text style={styles.contactLabel}>Email:</Text>
                  <Text style={styles.contactValue}>{settings.contactEmail}</Text>
                </View>
              )}

              {settings.contactPhone && (
                <View style={styles.contactRow}>
                  <Text style={styles.contactLabel}>Phone:</Text>
                  <Text style={styles.contactValue}>{settings.contactPhone}</Text>
                </View>
              )}

              {settings.website && (
                <View style={styles.contactRow}>
                  <Text style={styles.contactLabel}>Website:</Text>
                  <Text style={styles.contactValue}>{settings.website}</Text>
                </View>
              )}
            </View>
          )}

          {hasAddress && (
            <View style={styles.addressSection}>
              {settings.addressLine1 && (
                <Text style={styles.addressText}>{settings.addressLine1}</Text>
              )}
              {settings.addressLine2 && (
                <Text style={styles.addressText}>{settings.addressLine2}</Text>
              )}
              {(settings.city || settings.stateProvince || settings.postalCode) && (
                <Text style={styles.addressText}>
                  {[settings.city, settings.stateProvince, settings.postalCode]
                    .filter(Boolean)
                    .join(', ')}
                </Text>
              )}
              {settings.country && (
                <Text style={styles.addressText}>{settings.country}</Text>
              )}
            </View>
          )}
        </View>
      </View>
    </Page>
  );
}
