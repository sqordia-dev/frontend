export interface ExportTheme {
  id: string;
  name: string;
  description: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  headingColor: string;
  heading2Color: string;
  textColor: string;
  mutedTextColor: string;
  separatorColor: string;
  coverTitleColor: string;
  coverSubtitleColor: string;
  coverGradientEnd: string;
  pageBackgroundColor: string;
  bodyBackgroundColor: string;
  tocBackgroundColor: string;
  chartColorPalette: string[];
}

export interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  supportedFormats: string[];
  supportedLanguages: string[];
}
