/**
 * Cover Page Types
 * Types for business plan cover page customization
 */

// Background types
export type BackgroundType = 'solid' | 'gradient' | 'image';
export type GradientDirection = 'horizontal' | 'vertical' | 'diagonal-down' | 'diagonal-up' | 'radial';
export type BackgroundPosition = 'cover' | 'contain' | 'tile' | 'center';

// Logo types
export type LogoPosition = 'top-left' | 'top-center' | 'top-right' | 'center';
export type LogoSize = 'small' | 'medium' | 'large';

// Text alignment
export type TextAlignment = 'left' | 'center' | 'right';

// Layout styles
export type LayoutStyle = 'modern' | 'classic' | 'minimal' | 'bold' | 'creative' | 'elegant';

// Accent line position
export type AccentLinePosition = 'above-title' | 'below-title' | 'bottom';

// Border styles
export type BorderStyle = 'none' | 'simple' | 'double' | 'elegant';

export interface CoverPageSettings {
  id: string;
  businessPlanId: string;

  // Layout Style Preset
  layoutStyle: LayoutStyle;

  // Background Settings
  backgroundType: BackgroundType;
  backgroundColor: string;
  gradientStartColor: string;
  gradientEndColor: string;
  gradientDirection: GradientDirection;
  backgroundImageUrl?: string;
  backgroundImagePosition: BackgroundPosition;
  backgroundOverlayColor: string;
  backgroundOverlayOpacity: number;

  // Logo & Branding
  logoUrl?: string;
  logoPosition: LogoPosition;
  logoSize: LogoSize;
  showLogo: boolean;

  // Text Content
  companyName: string;
  documentTitle: string;
  tagline?: string;

  // Typography
  fontFamily: string;
  titleColor: string;
  titleSize: number;
  subtitleColor: string;
  subtitleSize: number;
  textAlignment: TextAlignment;

  // Primary accent color (used for various elements)
  primaryColor: string;

  // Additional Information Display
  showDate: boolean;
  dateFormat: string;
  preparedDate: string;

  preparedBy?: string;
  showPreparedBy: boolean;

  version?: string;
  showVersion: boolean;

  showConfidentialBadge: boolean;
  confidentialText: string;

  // Contact Information
  contactName?: string;
  contactTitle?: string;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  showContactInfo: boolean;

  // Business Address
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
  showAddress: boolean;

  // Decorative Elements
  showAccentLine: boolean;
  accentLineColor: string;
  accentLineWidth: number;
  accentLinePosition: AccentLinePosition;

  showBorder: boolean;
  borderStyle: BorderStyle;
  borderColor: string;
  borderWidth: number;

  // Corner decoration
  showCornerDecoration: boolean;
  cornerDecorationStyle: 'geometric' | 'lines' | 'dots' | 'none';
  cornerDecorationColor: string;

  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateCoverPageRequest {
  layoutStyle?: LayoutStyle;

  // Background
  backgroundType?: BackgroundType;
  backgroundColor?: string;
  gradientStartColor?: string;
  gradientEndColor?: string;
  gradientDirection?: GradientDirection;
  backgroundImageUrl?: string;
  backgroundImagePosition?: BackgroundPosition;
  backgroundOverlayColor?: string;
  backgroundOverlayOpacity?: number;

  // Logo
  logoUrl?: string;
  logoPosition?: LogoPosition;
  logoSize?: LogoSize;
  showLogo?: boolean;

  // Text
  companyName: string;
  documentTitle: string;
  tagline?: string;
  fontFamily?: string;
  titleColor?: string;
  titleSize?: number;
  subtitleColor?: string;
  subtitleSize?: number;
  textAlignment?: TextAlignment;
  primaryColor?: string;

  // Additional Info
  showDate?: boolean;
  dateFormat?: string;
  preparedDate?: string;
  preparedBy?: string;
  showPreparedBy?: boolean;
  version?: string;
  showVersion?: boolean;
  showConfidentialBadge?: boolean;
  confidentialText?: string;

  // Contact
  contactName?: string;
  contactTitle?: string;
  contactPhone?: string;
  contactEmail?: string;
  website?: string;
  showContactInfo?: boolean;

  // Address
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
  showAddress?: boolean;

  // Decorative
  showAccentLine?: boolean;
  accentLineColor?: string;
  accentLineWidth?: number;
  accentLinePosition?: AccentLinePosition;
  showBorder?: boolean;
  borderStyle?: BorderStyle;
  borderColor?: string;
  borderWidth?: number;
  showCornerDecoration?: boolean;
  cornerDecorationStyle?: 'geometric' | 'lines' | 'dots' | 'none';
  cornerDecorationColor?: string;
}

// Layout style configurations
export const LAYOUT_STYLES: { value: LayoutStyle; label: string; description: string }[] = [
  { value: 'modern', label: 'Modern', description: 'Clean design with bold typography and accent elements' },
  { value: 'classic', label: 'Classic', description: 'Traditional business plan layout with professional styling' },
  { value: 'minimal', label: 'Minimal', description: 'Simple and elegant with focus on content' },
  { value: 'bold', label: 'Bold', description: 'Eye-catching design with vibrant gradients' },
  { value: 'creative', label: 'Creative', description: 'Dynamic layout for startups and innovative businesses' },
  { value: 'elegant', label: 'Elegant', description: 'Refined design with subtle decorative elements' },
];

// Font families available
export const FONT_FAMILIES = [
  { value: 'Plus Jakarta Sans', label: 'Plus Jakarta Sans' },
  { value: 'Inter', label: 'Inter' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Open Sans', label: 'Open Sans' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Merriweather', label: 'Merriweather' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Times New Roman', label: 'Times New Roman' },
];

// Date format options
export const DATE_FORMATS = [
  { value: 'MMMM yyyy', label: 'January 2025' },
  { value: 'MMMM d, yyyy', label: 'January 15, 2025' },
  { value: 'MM/dd/yyyy', label: '01/15/2025' },
  { value: 'dd/MM/yyyy', label: '15/01/2025' },
  { value: 'yyyy-MM-dd', label: '2025-01-15' },
  { value: 'MMM yyyy', label: 'Jan 2025' },
];

// Gradient direction options
export const GRADIENT_DIRECTIONS: { value: GradientDirection; label: string; icon: string }[] = [
  { value: 'horizontal', label: 'Horizontal', icon: '→' },
  { value: 'vertical', label: 'Vertical', icon: '↓' },
  { value: 'diagonal-down', label: 'Diagonal Down', icon: '↘' },
  { value: 'diagonal-up', label: 'Diagonal Up', icon: '↗' },
  { value: 'radial', label: 'Radial', icon: '◎' },
];

// Default cover page settings
export const DEFAULT_COVER_PAGE: Partial<CoverPageSettings> = {
  layoutStyle: 'modern',

  // Background
  backgroundType: 'solid',
  backgroundColor: '#FFFFFF',
  gradientStartColor: '#1A2B47',
  gradientEndColor: '#2563EB',
  gradientDirection: 'diagonal-down',
  backgroundImagePosition: 'cover',
  backgroundOverlayColor: '#000000',
  backgroundOverlayOpacity: 0,

  // Logo
  logoPosition: 'top-left',
  logoSize: 'medium',
  showLogo: true,

  // Text
  companyName: '',
  documentTitle: 'Business Plan',
  fontFamily: 'Plus Jakarta Sans',
  titleColor: '#1A2B47',
  titleSize: 48,
  subtitleColor: '#FF6B00',
  subtitleSize: 32,
  textAlignment: 'left',
  primaryColor: '#FF6B00',

  // Additional Info
  showDate: true,
  dateFormat: 'MMMM yyyy',
  preparedDate: new Date().toISOString(),
  showPreparedBy: false,
  showVersion: false,
  showConfidentialBadge: false,
  confidentialText: 'CONFIDENTIAL',

  // Contact & Address
  showContactInfo: true,
  showAddress: true,

  // Decorative
  showAccentLine: true,
  accentLineColor: '#FF6B00',
  accentLineWidth: 4,
  accentLinePosition: 'below-title',
  showBorder: false,
  borderStyle: 'none',
  borderColor: '#E5E7EB',
  borderWidth: 1,
  showCornerDecoration: false,
  cornerDecorationStyle: 'none',
  cornerDecorationColor: '#FF6B00',
};

// Layout style presets - complete settings for each style
export const LAYOUT_PRESETS: Record<LayoutStyle, Partial<CoverPageSettings>> = {
  modern: {
    backgroundType: 'solid',
    backgroundColor: '#FFFFFF',
    titleColor: '#1A2B47',
    subtitleColor: '#FF6B00',
    textAlignment: 'left',
    showAccentLine: true,
    accentLinePosition: 'below-title',
    accentLineColor: '#FF6B00',
    accentLineWidth: 4,
    showBorder: false,
    fontFamily: 'Plus Jakarta Sans',
  },
  classic: {
    backgroundType: 'solid',
    backgroundColor: '#FFFFFF',
    titleColor: '#1F2937',
    subtitleColor: '#1A2B47',
    textAlignment: 'center',
    showAccentLine: false,
    showBorder: true,
    borderStyle: 'simple',
    borderColor: '#D1D5DB',
    borderWidth: 1,
    fontFamily: 'Georgia',
  },
  minimal: {
    backgroundType: 'solid',
    backgroundColor: '#FFFFFF',
    titleColor: '#374151',
    subtitleColor: '#6B7280',
    textAlignment: 'center',
    showAccentLine: false,
    showBorder: false,
    fontFamily: 'Inter',
  },
  bold: {
    backgroundType: 'gradient',
    gradientStartColor: '#1A2B47',
    gradientEndColor: '#3B82F6',
    gradientDirection: 'diagonal-down',
    titleColor: '#FFFFFF',
    subtitleColor: '#FCD34D',
    textAlignment: 'center',
    showAccentLine: false,
    showBorder: false,
    fontFamily: 'Montserrat',
  },
  creative: {
    backgroundType: 'gradient',
    gradientStartColor: '#FF6B00',
    gradientEndColor: '#EC4899',
    gradientDirection: 'diagonal-up',
    titleColor: '#FFFFFF',
    subtitleColor: '#FFFFFF',
    textAlignment: 'left',
    showAccentLine: false,
    showBorder: false,
    showCornerDecoration: true,
    cornerDecorationStyle: 'geometric',
    cornerDecorationColor: '#FFE4CC',
    fontFamily: 'Plus Jakarta Sans',
  },
  elegant: {
    backgroundType: 'solid',
    backgroundColor: '#1A2B47',
    titleColor: '#FFFFFF',
    subtitleColor: '#D4AF37',
    textAlignment: 'center',
    showAccentLine: true,
    accentLinePosition: 'below-title',
    accentLineColor: '#D4AF37',
    accentLineWidth: 2,
    showBorder: true,
    borderStyle: 'double',
    borderColor: '#D4AF37',
    borderWidth: 2,
    fontFamily: 'Playfair Display',
  },
};
