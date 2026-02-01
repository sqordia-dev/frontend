import { apiClient } from './api-client';
import { CoverPageSettings, UpdateCoverPageRequest, DEFAULT_COVER_PAGE } from '../types/cover-page';

/**
 * Extended style settings that are serialized to JSON
 * These fields are stored in StyleSettingsJson on the backend
 */
interface ExtendedStyleSettings {
  backgroundType?: string;
  backgroundColor?: string;
  gradientStartColor?: string;
  gradientEndColor?: string;
  gradientDirection?: string;
  backgroundImageUrl?: string;
  backgroundImagePosition?: string;
  backgroundOverlayColor?: string;
  backgroundOverlayOpacity?: number;
  logoPosition?: string;
  logoSize?: string;
  showLogo?: boolean;
  tagline?: string;
  fontFamily?: string;
  titleColor?: string;
  titleSize?: number;
  subtitleColor?: string;
  subtitleSize?: number;
  textAlignment?: string;
  showDate?: boolean;
  dateFormat?: string;
  preparedBy?: string;
  showPreparedBy?: boolean;
  version?: string;
  showVersion?: boolean;
  showConfidentialBadge?: boolean;
  confidentialText?: string;
  showContactInfo?: boolean;
  showAddress?: boolean;
  showAccentLine?: boolean;
  accentLineColor?: string;
  accentLineWidth?: number;
  accentLinePosition?: string;
  showBorder?: boolean;
  borderStyle?: string;
  borderColor?: string;
  borderWidth?: number;
  showCornerDecoration?: boolean;
  cornerDecorationStyle?: string;
  cornerDecorationColor?: string;
}

/**
 * Cover Page Service
 * API functions for managing business plan cover page settings
 */
export const coverPageService = {
  /**
   * Get cover page settings for a business plan
   * @param planId The business plan ID
   * @returns Cover page settings
   */
  async getCoverPage(planId: string): Promise<CoverPageSettings> {
    const response = await apiClient.get<any>(`/api/v1/business-plans/${planId}/cover`);
    const data = response.data?.value || response.data;
    return normalizeCoverPageResponse(data);
  },

  /**
   * Update cover page settings for a business plan
   * @param planId The business plan ID
   * @param settings Cover page settings to update
   * @returns Updated cover page settings
   */
  async updateCoverPage(planId: string, settings: UpdateCoverPageRequest): Promise<CoverPageSettings> {
    // Serialize extended settings to JSON
    const backendRequest = serializeForBackend(settings);
    const response = await apiClient.put<any>(`/api/v1/business-plans/${planId}/cover`, backendRequest);
    const data = response.data?.value || response.data;
    return normalizeCoverPageResponse(data);
  },

  /**
   * Upload a logo for the cover page
   * @param planId The business plan ID
   * @param file Logo file to upload
   * @returns URL of the uploaded logo
   */
  async uploadLogo(planId: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post<any>(
      `/api/v1/business-plans/${planId}/cover/logo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response.data?.value || response.data;
  },

  /**
   * Delete the logo from the cover page
   * @param planId The business plan ID
   */
  async deleteLogo(planId: string): Promise<void> {
    await apiClient.delete(`/api/v1/business-plans/${planId}/cover/logo`);
  },
};

/**
 * Normalize cover page response to handle different API response formats
 * Deserializes extended settings from StyleSettingsJson
 */
function normalizeCoverPageResponse(data: any): CoverPageSettings {
  // Parse extended settings from JSON if present
  let extendedSettings: ExtendedStyleSettings = {};
  const styleJson = data.styleSettingsJson || data.StyleSettingsJson;
  if (styleJson) {
    try {
      extendedSettings = JSON.parse(styleJson);
    } catch (e) {
      console.warn('Failed to parse StyleSettingsJson:', e);
    }
  }

  return {
    id: data.id || data.Id || '',
    businessPlanId: data.businessPlanId || data.BusinessPlanId || '',
    logoUrl: data.logoUrl || data.LogoUrl,
    companyName: data.companyName || data.CompanyName || '',
    documentTitle: data.documentTitle || data.DocumentTitle || 'Business Plan',
    primaryColor: data.primaryColor || data.PrimaryColor || '#FF6B00',
    layoutStyle: data.layoutStyle || data.LayoutStyle || 'modern',
    contactName: data.contactName || data.ContactName,
    contactTitle: data.contactTitle || data.ContactTitle,
    contactPhone: data.contactPhone || data.ContactPhone,
    contactEmail: data.contactEmail || data.ContactEmail,
    website: data.website || data.Website,
    addressLine1: data.addressLine1 || data.AddressLine1,
    addressLine2: data.addressLine2 || data.AddressLine2,
    city: data.city || data.City,
    stateProvince: data.stateProvince || data.StateProvince,
    postalCode: data.postalCode || data.PostalCode,
    country: data.country || data.Country,
    preparedDate: data.preparedDate || data.PreparedDate || new Date().toISOString(),
    createdAt: data.createdAt || data.CreatedAt,
    updatedAt: data.updatedAt || data.UpdatedAt,
    // Merge extended settings with defaults
    backgroundType: extendedSettings.backgroundType || DEFAULT_COVER_PAGE.backgroundType || 'solid',
    backgroundColor: extendedSettings.backgroundColor || DEFAULT_COVER_PAGE.backgroundColor || '#FFFFFF',
    gradientStartColor: extendedSettings.gradientStartColor || DEFAULT_COVER_PAGE.gradientStartColor || '#1A2B47',
    gradientEndColor: extendedSettings.gradientEndColor || DEFAULT_COVER_PAGE.gradientEndColor || '#2563EB',
    gradientDirection: extendedSettings.gradientDirection as any || DEFAULT_COVER_PAGE.gradientDirection || 'diagonal-down',
    backgroundImageUrl: extendedSettings.backgroundImageUrl,
    backgroundImagePosition: extendedSettings.backgroundImagePosition as any || DEFAULT_COVER_PAGE.backgroundImagePosition || 'cover',
    backgroundOverlayColor: extendedSettings.backgroundOverlayColor || DEFAULT_COVER_PAGE.backgroundOverlayColor || '#000000',
    backgroundOverlayOpacity: extendedSettings.backgroundOverlayOpacity ?? DEFAULT_COVER_PAGE.backgroundOverlayOpacity ?? 0,
    logoPosition: extendedSettings.logoPosition as any || DEFAULT_COVER_PAGE.logoPosition || 'top-left',
    logoSize: extendedSettings.logoSize as any || DEFAULT_COVER_PAGE.logoSize || 'medium',
    showLogo: extendedSettings.showLogo ?? DEFAULT_COVER_PAGE.showLogo ?? true,
    tagline: extendedSettings.tagline,
    fontFamily: extendedSettings.fontFamily || DEFAULT_COVER_PAGE.fontFamily || 'Plus Jakarta Sans',
    titleColor: extendedSettings.titleColor || DEFAULT_COVER_PAGE.titleColor || '#1A2B47',
    titleSize: extendedSettings.titleSize ?? DEFAULT_COVER_PAGE.titleSize ?? 48,
    subtitleColor: extendedSettings.subtitleColor || DEFAULT_COVER_PAGE.subtitleColor || '#FF6B00',
    subtitleSize: extendedSettings.subtitleSize ?? DEFAULT_COVER_PAGE.subtitleSize ?? 32,
    textAlignment: extendedSettings.textAlignment as any || DEFAULT_COVER_PAGE.textAlignment || 'left',
    showDate: extendedSettings.showDate ?? DEFAULT_COVER_PAGE.showDate ?? true,
    dateFormat: extendedSettings.dateFormat || DEFAULT_COVER_PAGE.dateFormat || 'MMMM yyyy',
    preparedBy: extendedSettings.preparedBy,
    showPreparedBy: extendedSettings.showPreparedBy ?? DEFAULT_COVER_PAGE.showPreparedBy ?? false,
    version: extendedSettings.version,
    showVersion: extendedSettings.showVersion ?? DEFAULT_COVER_PAGE.showVersion ?? false,
    showConfidentialBadge: extendedSettings.showConfidentialBadge ?? DEFAULT_COVER_PAGE.showConfidentialBadge ?? false,
    confidentialText: extendedSettings.confidentialText || DEFAULT_COVER_PAGE.confidentialText || 'CONFIDENTIAL',
    showContactInfo: extendedSettings.showContactInfo ?? DEFAULT_COVER_PAGE.showContactInfo ?? true,
    showAddress: extendedSettings.showAddress ?? DEFAULT_COVER_PAGE.showAddress ?? true,
    showAccentLine: extendedSettings.showAccentLine ?? DEFAULT_COVER_PAGE.showAccentLine ?? true,
    accentLineColor: extendedSettings.accentLineColor || DEFAULT_COVER_PAGE.accentLineColor || '#FF6B00',
    accentLineWidth: extendedSettings.accentLineWidth ?? DEFAULT_COVER_PAGE.accentLineWidth ?? 4,
    accentLinePosition: extendedSettings.accentLinePosition as any || DEFAULT_COVER_PAGE.accentLinePosition || 'below-title',
    showBorder: extendedSettings.showBorder ?? DEFAULT_COVER_PAGE.showBorder ?? false,
    borderStyle: extendedSettings.borderStyle as any || DEFAULT_COVER_PAGE.borderStyle || 'none',
    borderColor: extendedSettings.borderColor || DEFAULT_COVER_PAGE.borderColor || '#E5E7EB',
    borderWidth: extendedSettings.borderWidth ?? DEFAULT_COVER_PAGE.borderWidth ?? 1,
    showCornerDecoration: extendedSettings.showCornerDecoration ?? DEFAULT_COVER_PAGE.showCornerDecoration ?? false,
    cornerDecorationStyle: extendedSettings.cornerDecorationStyle as any || DEFAULT_COVER_PAGE.cornerDecorationStyle || 'none',
    cornerDecorationColor: extendedSettings.cornerDecorationColor || DEFAULT_COVER_PAGE.cornerDecorationColor || '#FF6B00',
  };
}

/**
 * Serialize settings for backend - extracts extended settings into JSON field
 */
function serializeForBackend(settings: UpdateCoverPageRequest): any {
  // Extract extended style settings
  const extendedSettings: ExtendedStyleSettings = {
    backgroundType: settings.backgroundType,
    backgroundColor: settings.backgroundColor,
    gradientStartColor: settings.gradientStartColor,
    gradientEndColor: settings.gradientEndColor,
    gradientDirection: settings.gradientDirection,
    backgroundImageUrl: settings.backgroundImageUrl,
    backgroundImagePosition: settings.backgroundImagePosition,
    backgroundOverlayColor: settings.backgroundOverlayColor,
    backgroundOverlayOpacity: settings.backgroundOverlayOpacity,
    logoPosition: settings.logoPosition,
    logoSize: settings.logoSize,
    showLogo: settings.showLogo,
    tagline: settings.tagline,
    fontFamily: settings.fontFamily,
    titleColor: settings.titleColor,
    titleSize: settings.titleSize,
    subtitleColor: settings.subtitleColor,
    subtitleSize: settings.subtitleSize,
    textAlignment: settings.textAlignment,
    showDate: settings.showDate,
    dateFormat: settings.dateFormat,
    preparedBy: settings.preparedBy,
    showPreparedBy: settings.showPreparedBy,
    version: settings.version,
    showVersion: settings.showVersion,
    showConfidentialBadge: settings.showConfidentialBadge,
    confidentialText: settings.confidentialText,
    showContactInfo: settings.showContactInfo,
    showAddress: settings.showAddress,
    showAccentLine: settings.showAccentLine,
    accentLineColor: settings.accentLineColor,
    accentLineWidth: settings.accentLineWidth,
    accentLinePosition: settings.accentLinePosition,
    showBorder: settings.showBorder,
    borderStyle: settings.borderStyle,
    borderColor: settings.borderColor,
    borderWidth: settings.borderWidth,
    showCornerDecoration: settings.showCornerDecoration,
    cornerDecorationStyle: settings.cornerDecorationStyle,
    cornerDecorationColor: settings.cornerDecorationColor,
  };

  return {
    companyName: settings.companyName,
    documentTitle: settings.documentTitle,
    primaryColor: settings.primaryColor || '#FF6B00',
    layoutStyle: settings.layoutStyle || 'modern',
    logoUrl: settings.logoUrl,
    contactName: settings.contactName,
    contactTitle: settings.contactTitle,
    contactPhone: settings.contactPhone,
    contactEmail: settings.contactEmail,
    website: settings.website,
    addressLine1: settings.addressLine1,
    addressLine2: settings.addressLine2,
    city: settings.city,
    stateProvince: settings.stateProvince,
    postalCode: settings.postalCode,
    country: settings.country,
    preparedDate: settings.preparedDate,
    styleSettingsJson: JSON.stringify(extendedSettings),
  };
}

export default coverPageService;
