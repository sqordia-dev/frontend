/**
 * Table of Contents Settings Types
 * Defines types for TOC customization with 5 preset styles
 */

// Available TOC style presets
export type TOCStyle = 'classic' | 'modern' | 'minimal' | 'magazine' | 'corporate';

// TOC settings stored in the backend
export interface TOCSettings {
  id: string;
  businessPlanId: string;
  style: TOCStyle;
  showPageNumbers: boolean;
  showIcons: boolean;
  showCategoryHeaders: boolean;
  styleSettingsJson?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Request to update TOC settings
export interface UpdateTOCSettingsRequest {
  style: TOCStyle;
  showPageNumbers?: boolean;
  showIcons?: boolean;
  showCategoryHeaders?: boolean;
  styleSettingsJson?: string;
}

// Configuration for each TOC style preset
export interface TOCPresetConfig {
  // Typography
  headerFont: string;
  bodyFont: string;
  headerSize: string;
  bodySize: string;

  // Layout
  showCategoryHeaders: boolean;
  categoryStyle: 'uppercase' | 'titlecase' | 'bold';
  indentSubsections: boolean;
  columns: 1 | 2;

  // Decorations
  showIcons: boolean;
  showLeaderDots: boolean;
  showPageNumbers: boolean;
  showDividers: boolean;
  dividerStyle: 'line' | 'double' | 'dashed' | 'none';

  // Colors
  headerColor: string;
  textColor: string;
  accentColor: string;
  backgroundColor: string;

  // Spacing
  itemSpacing: 'compact' | 'normal' | 'relaxed';
  categorySpacing: 'compact' | 'normal' | 'relaxed';

  // Border
  showBorder: boolean;
  borderStyle: 'simple' | 'double' | 'rounded' | 'none';
  borderColor: string;

  // Title
  title: string;
  titleStyle: 'uppercase' | 'titlecase' | 'none';
}

// Style preset metadata for display in selector
export interface TOCStyleOption {
  value: TOCStyle;
  label: string;
  description: string;
}

// Available style options
export const TOC_STYLE_OPTIONS: TOCStyleOption[] = [
  {
    value: 'classic',
    label: 'Classic',
    description: 'Traditional numbered list with dotted leaders and page numbers',
  },
  {
    value: 'modern',
    label: 'Modern',
    description: 'Card-style sections with icons and subtle shadows',
  },
  {
    value: 'minimal',
    label: 'Minimal',
    description: 'Clean and simple list with generous whitespace',
  },
  {
    value: 'magazine',
    label: 'Magazine',
    description: 'Editorial style with bold headers and color blocks',
  },
  {
    value: 'corporate',
    label: 'Corporate',
    description: 'Formal chapter-based layout with professional borders',
  },
];

// Default TOC settings
export const DEFAULT_TOC_SETTINGS: Omit<TOCSettings, 'id' | 'businessPlanId' | 'createdAt' | 'updatedAt'> = {
  style: 'classic',
  showPageNumbers: true,
  showIcons: true,
  showCategoryHeaders: true,
};

// Preset configurations for each style
export const TOC_PRESETS: Record<TOCStyle, TOCPresetConfig> = {
  classic: {
    headerFont: 'Georgia, serif',
    bodyFont: 'Georgia, serif',
    headerSize: '1.5rem',
    bodySize: '1rem',
    showCategoryHeaders: true,
    categoryStyle: 'uppercase',
    indentSubsections: true,
    columns: 1,
    showIcons: false,
    showLeaderDots: true,
    showPageNumbers: true,
    showDividers: true,
    dividerStyle: 'line',
    headerColor: '#1A2B47',
    textColor: '#374151',
    accentColor: '#1A2B47',
    backgroundColor: '#FFFFFF',
    itemSpacing: 'normal',
    categorySpacing: 'relaxed',
    showBorder: false,
    borderStyle: 'none',
    borderColor: '#E5E7EB',
    title: 'TABLE OF CONTENTS',
    titleStyle: 'uppercase',
  },
  modern: {
    headerFont: 'Plus Jakarta Sans, sans-serif',
    bodyFont: 'Plus Jakarta Sans, sans-serif',
    headerSize: '1.25rem',
    bodySize: '0.95rem',
    showCategoryHeaders: true,
    categoryStyle: 'titlecase',
    indentSubsections: false,
    columns: 2,
    showIcons: true,
    showLeaderDots: false,
    showPageNumbers: false,
    showDividers: false,
    dividerStyle: 'none',
    headerColor: '#1A2B47',
    textColor: '#4B5563',
    accentColor: '#FF6B00',
    backgroundColor: '#F9FAFB',
    itemSpacing: 'normal',
    categorySpacing: 'normal',
    showBorder: false,
    borderStyle: 'rounded',
    borderColor: '#E5E7EB',
    title: 'Table of Contents',
    titleStyle: 'titlecase',
  },
  minimal: {
    headerFont: 'Inter, sans-serif',
    bodyFont: 'Inter, sans-serif',
    headerSize: '1.125rem',
    bodySize: '0.9rem',
    showCategoryHeaders: false,
    categoryStyle: 'titlecase',
    indentSubsections: false,
    columns: 1,
    showIcons: false,
    showLeaderDots: false,
    showPageNumbers: false,
    showDividers: false,
    dividerStyle: 'none',
    headerColor: '#111827',
    textColor: '#6B7280',
    accentColor: '#111827',
    backgroundColor: '#FFFFFF',
    itemSpacing: 'relaxed',
    categorySpacing: 'relaxed',
    showBorder: false,
    borderStyle: 'none',
    borderColor: 'transparent',
    title: 'Contents',
    titleStyle: 'titlecase',
  },
  magazine: {
    headerFont: 'Plus Jakarta Sans, sans-serif',
    bodyFont: 'Plus Jakarta Sans, sans-serif',
    headerSize: '1.5rem',
    bodySize: '1rem',
    showCategoryHeaders: true,
    categoryStyle: 'uppercase',
    indentSubsections: true,
    columns: 1,
    showIcons: true,
    showLeaderDots: false,
    showPageNumbers: true,
    showDividers: true,
    dividerStyle: 'double',
    headerColor: '#FFFFFF',
    textColor: '#1A2B47',
    accentColor: '#FF6B00',
    backgroundColor: '#FFFFFF',
    itemSpacing: 'normal',
    categorySpacing: 'relaxed',
    showBorder: true,
    borderStyle: 'double',
    borderColor: '#1A2B47',
    title: 'IN THIS DOCUMENT',
    titleStyle: 'uppercase',
  },
  corporate: {
    headerFont: 'Times New Roman, serif',
    bodyFont: 'Times New Roman, serif',
    headerSize: '1.375rem',
    bodySize: '1rem',
    showCategoryHeaders: true,
    categoryStyle: 'uppercase',
    indentSubsections: true,
    columns: 1,
    showIcons: false,
    showLeaderDots: true,
    showPageNumbers: true,
    showDividers: true,
    dividerStyle: 'line',
    headerColor: '#1A2B47',
    textColor: '#374151',
    accentColor: '#1A2B47',
    backgroundColor: '#FFFFFF',
    itemSpacing: 'compact',
    categorySpacing: 'normal',
    showBorder: true,
    borderStyle: 'simple',
    borderColor: '#1A2B47',
    title: 'TABLE OF CONTENTS',
    titleStyle: 'uppercase',
  },
};

// Get preset config for a style
export function getPresetConfig(style: TOCStyle): TOCPresetConfig {
  return TOC_PRESETS[style] || TOC_PRESETS.classic;
}

// Spacing values for CSS
export const SPACING_VALUES = {
  compact: '0.5rem',
  normal: '0.75rem',
  relaxed: '1rem',
} as const;

// Category spacing values for CSS
export const CATEGORY_SPACING_VALUES = {
  compact: '1rem',
  normal: '1.5rem',
  relaxed: '2rem',
} as const;
