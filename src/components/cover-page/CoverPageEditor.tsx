import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Loader2,
  Check,
  Palette,
  Image as ImageIcon,
  Type,
  User,
  MapPin,
  Sparkles,
  Layout,
  Info,
} from 'lucide-react';
import {
  CoverPageSettings,
  UpdateCoverPageRequest,
  LAYOUT_STYLES,
  LAYOUT_PRESETS,
  FONT_FAMILIES,
  DATE_FORMATS,
  GRADIENT_DIRECTIONS,
  LayoutStyle,
  BackgroundType,
  GradientDirection,
  LogoPosition,
  LogoSize,
  TextAlignment,
  AccentLinePosition,
  BorderStyle,
} from '../../types/cover-page';
import { CoverPagePreview } from './CoverPagePreview';
import { coverPageService } from '../../lib/cover-page-service';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ColorPicker,
  ImageUploader,
  FormSection,
  ToggleField,
  SelectField,
  TextField,
  SliderField,
  RadioField,
} from '@/components/form-fields';

interface CoverPageEditorProps {
  isOpen: boolean;
  planId: string;
  planTitle: string;
  onClose: () => void;
  onSave: (settings: CoverPageSettings) => void;
}

/**
 * Enhanced Cover Page Editor Modal
 * Allows users to fully customize their business plan cover page
 * with all available options organized in collapsible sections
 */
export function CoverPageEditor({
  isOpen,
  planId,
  planTitle,
  onClose,
  onSave,
}: CoverPageEditorProps) {
  const toast = useToast();

  // Form state with all fields
  const [formData, setFormData] = useState<UpdateCoverPageRequest>({
    // Core
    companyName: planTitle,
    documentTitle: 'Business Plan',
    layoutStyle: 'modern',
    // Background
    backgroundType: 'solid',
    backgroundColor: '#FFFFFF',
    gradientStartColor: '#1A2B47',
    gradientEndColor: '#2563EB',
    gradientDirection: 'diagonal-down',
    backgroundOverlayColor: '#000000',
    backgroundOverlayOpacity: 0,
    // Logo
    showLogo: true,
    logoPosition: 'top-left',
    logoSize: 'medium',
    // Typography
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
    preparedDate: new Date().toISOString().split('T')[0],
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
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<CoverPageSettings | null>(null);

  // Load existing settings
  useEffect(() => {
    if (!isOpen || !planId) return;

    const loadSettings = async () => {
      setIsLoading(true);
      try {
        const settings = await coverPageService.getCoverPage(planId);
        setOriginalSettings(settings);
        setFormData({
          ...settings,
          preparedDate: settings.preparedDate
            ? new Date(settings.preparedDate).toISOString().split('T')[0]
            : new Date().toISOString().split('T')[0],
        });
      } catch (error) {
        console.error('Failed to load cover page settings:', error);
        // Use defaults with plan title
        setFormData((prev) => ({
          ...prev,
          companyName: planTitle,
        }));
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, [isOpen, planId, planTitle]);

  // Handle form field changes
  const handleChange = useCallback(<K extends keyof UpdateCoverPageRequest>(
    field: K,
    value: UpdateCoverPageRequest[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  // Apply layout preset
  const applyLayoutPreset = useCallback((style: LayoutStyle) => {
    const preset = LAYOUT_PRESETS[style];
    setFormData((prev) => ({
      ...prev,
      ...preset,
      layoutStyle: style,
    }));
  }, []);

  // Handle logo upload
  const handleLogoUpload = useCallback(async (file: File): Promise<string> => {
    try {
      const logoUrl = await coverPageService.uploadLogo(planId, file);
      handleChange('logoUrl', logoUrl);
      toast.success('Logo uploaded', 'Your logo has been uploaded successfully.');
      return logoUrl;
    } catch (error) {
      console.error('Failed to upload logo:', error);
      toast.error('Upload failed', 'Failed to upload logo. Please try again.');
      throw error;
    }
  }, [planId, handleChange, toast]);

  // Handle logo deletion
  const handleDeleteLogo = useCallback(async () => {
    try {
      await coverPageService.deleteLogo(planId);
      handleChange('logoUrl', undefined);
      toast.success('Logo removed', 'Your logo has been removed.');
    } catch (error) {
      console.error('Failed to delete logo:', error);
      toast.error('Delete failed', 'Failed to remove logo. Please try again.');
    }
  }, [planId, handleChange, toast]);

  // Handle background image upload
  const handleBgImageUpload = useCallback(async (file: File): Promise<string> => {
    try {
      // For now, create a local URL - in production this should upload to storage
      const bgUrl = URL.createObjectURL(file);
      handleChange('backgroundImageUrl', bgUrl);
      toast.success('Background uploaded', 'Your background image has been set.');
      return bgUrl;
    } catch (error) {
      console.error('Failed to upload background:', error);
      toast.error('Upload failed', 'Failed to upload background image.');
      throw error;
    }
  }, [handleChange, toast]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!formData.companyName?.trim()) {
      toast.error('Validation error', 'Company name is required.');
      return;
    }

    setIsSaving(true);
    try {
      const settings = await coverPageService.updateCoverPage(planId, {
        ...formData,
        preparedDate: formData.preparedDate
          ? new Date(formData.preparedDate).toISOString()
          : new Date().toISOString(),
      });
      onSave(settings);
      toast.success('Cover page saved', 'Your cover page has been updated.');
      onClose();
    } catch (error) {
      console.error('Failed to save cover page:', error);
      toast.error('Save failed', 'Failed to save cover page. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [formData, planId, onSave, onClose, toast]);

  // Preview settings object
  const previewSettings = useMemo((): Partial<CoverPageSettings> => ({
    ...formData,
    id: originalSettings?.id || '',
    businessPlanId: planId,
    layoutStyle: formData.layoutStyle as LayoutStyle,
    preparedDate: formData.preparedDate || new Date().toISOString(),
  }), [formData, originalSettings, planId]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="fixed inset-4 lg:inset-8 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full h-full max-w-7xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Customize Cover Page
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Design your perfect business plan cover
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
              {/* Form Section */}
              <div className="flex-1 min-h-0 overflow-hidden border-r border-gray-200 dark:border-gray-700">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 animate-spin text-momentum-orange" />
                  </div>
                ) : (
                  <ScrollArea className="h-full">
                    <div className="p-6 space-y-4">
                      {/* Layout Style Presets */}
                      <FormSection
                        id="layout"
                        title="Layout Style"
                        icon={<Layout size={18} />}
                        description="Choose a preset or customize from scratch"
                        defaultOpen={true}
                      >
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {LAYOUT_STYLES.map((style) => (
                            <button
                              key={style.value}
                              onClick={() => applyLayoutPreset(style.value)}
                              className={`p-4 rounded-xl border-2 transition-all text-left ${
                                formData.layoutStyle === style.value
                                  ? 'border-momentum-orange bg-orange-50 dark:bg-orange-900/20'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                              }`}
                            >
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {style.label}
                              </span>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {style.description}
                              </p>
                            </button>
                          ))}
                        </div>
                      </FormSection>

                      {/* Background Settings */}
                      <FormSection
                        id="background"
                        title="Background"
                        icon={<Palette size={18} />}
                        description="Solid color, gradient, or image"
                      >
                        <Tabs value={formData.backgroundType} onValueChange={(v) => handleChange('backgroundType', v as BackgroundType)}>
                          <TabsList className="w-full mb-4">
                            <TabsTrigger value="solid" className="flex-1">Solid</TabsTrigger>
                            <TabsTrigger value="gradient" className="flex-1">Gradient</TabsTrigger>
                            <TabsTrigger value="image" className="flex-1">Image</TabsTrigger>
                          </TabsList>

                          <TabsContent value="solid" className="space-y-4">
                            <ColorPicker
                              label="Background Color"
                              value={formData.backgroundColor || '#FFFFFF'}
                              onChange={(c) => handleChange('backgroundColor', c)}
                            />
                          </TabsContent>

                          <TabsContent value="gradient" className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <ColorPicker
                                label="Start Color"
                                value={formData.gradientStartColor || '#1A2B47'}
                                onChange={(c) => handleChange('gradientStartColor', c)}
                              />
                              <ColorPicker
                                label="End Color"
                                value={formData.gradientEndColor || '#2563EB'}
                                onChange={(c) => handleChange('gradientEndColor', c)}
                              />
                            </div>
                            <SelectField
                              label="Direction"
                              value={formData.gradientDirection || 'diagonal-down'}
                              onChange={(v) => handleChange('gradientDirection', v as GradientDirection)}
                              options={GRADIENT_DIRECTIONS.map((d) => ({
                                value: d.value,
                                label: `${d.icon} ${d.label}`,
                              }))}
                            />
                          </TabsContent>

                          <TabsContent value="image" className="space-y-4">
                            <ImageUploader
                              label="Background Image"
                              value={formData.backgroundImageUrl}
                              onUpload={handleBgImageUpload}
                              onRemove={() => handleChange('backgroundImageUrl', undefined)}
                              previewHeight="h-32"
                              description="Recommended: 1920x1080 or larger"
                            />
                            {formData.backgroundImageUrl && (
                              <>
                                <SelectField
                                  label="Image Position"
                                  value={formData.backgroundImagePosition || 'cover'}
                                  onChange={(v) => handleChange('backgroundImagePosition', v as any)}
                                  options={[
                                    { value: 'cover', label: 'Cover (fill)' },
                                    { value: 'contain', label: 'Contain (fit)' },
                                    { value: 'center', label: 'Center' },
                                    { value: 'tile', label: 'Tile (repeat)' },
                                  ]}
                                />
                                <ColorPicker
                                  label="Overlay Color"
                                  value={formData.backgroundOverlayColor || '#000000'}
                                  onChange={(c) => handleChange('backgroundOverlayColor', c)}
                                />
                                <SliderField
                                  label="Overlay Opacity"
                                  value={formData.backgroundOverlayOpacity || 0}
                                  onChange={(v) => handleChange('backgroundOverlayOpacity', v)}
                                  min={0}
                                  max={100}
                                  valueSuffix="%"
                                />
                              </>
                            )}
                          </TabsContent>
                        </Tabs>
                      </FormSection>

                      {/* Logo & Branding */}
                      <FormSection
                        id="logo"
                        title="Logo & Branding"
                        icon={<ImageIcon size={18} />}
                        description="Upload your company logo"
                      >
                        <div className="space-y-4">
                          <ToggleField
                            label="Show Logo"
                            checked={formData.showLogo ?? true}
                            onChange={(v) => handleChange('showLogo', v)}
                          />

                          {formData.showLogo && (
                            <>
                              <ImageUploader
                                label="Company Logo"
                                value={formData.logoUrl}
                                onUpload={handleLogoUpload}
                                onRemove={handleDeleteLogo}
                                previewHeight="h-16"
                              />

                              <div className="grid grid-cols-2 gap-4">
                                <SelectField
                                  label="Position"
                                  value={formData.logoPosition || 'top-left'}
                                  onChange={(v) => handleChange('logoPosition', v as LogoPosition)}
                                  options={[
                                    { value: 'top-left', label: 'Top Left' },
                                    { value: 'top-center', label: 'Top Center' },
                                    { value: 'top-right', label: 'Top Right' },
                                    { value: 'center', label: 'Center' },
                                  ]}
                                />
                                <SelectField
                                  label="Size"
                                  value={formData.logoSize || 'medium'}
                                  onChange={(v) => handleChange('logoSize', v as LogoSize)}
                                  options={[
                                    { value: 'small', label: 'Small' },
                                    { value: 'medium', label: 'Medium' },
                                    { value: 'large', label: 'Large' },
                                  ]}
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </FormSection>

                      {/* Text Content */}
                      <FormSection
                        id="text"
                        title="Text Content"
                        icon={<Type size={18} />}
                        description="Titles, tagline, and typography"
                      >
                        <div className="space-y-4">
                          <TextField
                            label="Company Name"
                            value={formData.companyName}
                            onChange={(v) => handleChange('companyName', v)}
                            placeholder="Your Company Name"
                            required
                          />

                          <TextField
                            label="Document Title"
                            value={formData.documentTitle}
                            onChange={(v) => handleChange('documentTitle', v)}
                            placeholder="Business Plan"
                            required
                          />

                          <TextField
                            label="Tagline"
                            value={formData.tagline || ''}
                            onChange={(v) => handleChange('tagline', v)}
                            placeholder="Optional tagline or mission statement"
                            maxLength={120}
                          />

                          <SelectField
                            label="Font Family"
                            value={formData.fontFamily || 'Plus Jakarta Sans'}
                            onChange={(v) => handleChange('fontFamily', v)}
                            options={FONT_FAMILIES}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <ColorPicker
                              label="Title Color"
                              value={formData.titleColor || '#1A2B47'}
                              onChange={(c) => handleChange('titleColor', c)}
                            />
                            <ColorPicker
                              label="Subtitle Color"
                              value={formData.subtitleColor || '#FF6B00'}
                              onChange={(c) => handleChange('subtitleColor', c)}
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <SliderField
                              label="Title Size"
                              value={formData.titleSize || 48}
                              onChange={(v) => handleChange('titleSize', v)}
                              min={24}
                              max={72}
                              valueSuffix="px"
                            />
                            <SliderField
                              label="Subtitle Size"
                              value={formData.subtitleSize || 32}
                              onChange={(v) => handleChange('subtitleSize', v)}
                              min={16}
                              max={48}
                              valueSuffix="px"
                            />
                          </div>

                          <RadioField
                            label="Text Alignment"
                            value={formData.textAlignment || 'left'}
                            onChange={(v) => handleChange('textAlignment', v as TextAlignment)}
                            options={[
                              { value: 'left', label: 'Left' },
                              { value: 'center', label: 'Center' },
                              { value: 'right', label: 'Right' },
                            ]}
                            orientation="horizontal"
                          />
                        </div>
                      </FormSection>

                      {/* Additional Information */}
                      <FormSection
                        id="info"
                        title="Additional Information"
                        icon={<Info size={18} />}
                        description="Date, version, prepared by"
                      >
                        <div className="space-y-4">
                          <ToggleField
                            label="Show Date"
                            checked={formData.showDate ?? true}
                            onChange={(v) => handleChange('showDate', v)}
                          />
                          {formData.showDate && (
                            <div className="grid grid-cols-2 gap-4">
                              <TextField
                                label="Prepared Date"
                                type="date"
                                value={formData.preparedDate || ''}
                                onChange={(v) => handleChange('preparedDate', v)}
                              />
                              <SelectField
                                label="Date Format"
                                value={formData.dateFormat || 'MMMM yyyy'}
                                onChange={(v) => handleChange('dateFormat', v)}
                                options={DATE_FORMATS}
                              />
                            </div>
                          )}

                          <ToggleField
                            label="Show Prepared By"
                            checked={formData.showPreparedBy ?? false}
                            onChange={(v) => handleChange('showPreparedBy', v)}
                          />
                          {formData.showPreparedBy && (
                            <TextField
                              label="Prepared By"
                              value={formData.preparedBy || ''}
                              onChange={(v) => handleChange('preparedBy', v)}
                              placeholder="John Doe"
                            />
                          )}

                          <ToggleField
                            label="Show Version"
                            checked={formData.showVersion ?? false}
                            onChange={(v) => handleChange('showVersion', v)}
                          />
                          {formData.showVersion && (
                            <TextField
                              label="Version"
                              value={formData.version || ''}
                              onChange={(v) => handleChange('version', v)}
                              placeholder="1.0"
                            />
                          )}

                          <ToggleField
                            label="Show Confidential Badge"
                            checked={formData.showConfidentialBadge ?? false}
                            onChange={(v) => handleChange('showConfidentialBadge', v)}
                          />
                          {formData.showConfidentialBadge && (
                            <TextField
                              label="Confidential Text"
                              value={formData.confidentialText || 'CONFIDENTIAL'}
                              onChange={(v) => handleChange('confidentialText', v)}
                              placeholder="CONFIDENTIAL"
                            />
                          )}
                        </div>
                      </FormSection>

                      {/* Contact Information */}
                      <FormSection
                        id="contact"
                        title="Contact Information"
                        icon={<User size={18} />}
                        description="Name, phone, email, website"
                      >
                        <div className="space-y-4">
                          <ToggleField
                            label="Show Contact Information"
                            checked={formData.showContactInfo ?? true}
                            onChange={(v) => handleChange('showContactInfo', v)}
                          />

                          {formData.showContactInfo && (
                            <>
                              <div className="grid grid-cols-2 gap-4">
                                <TextField
                                  label="Contact Name"
                                  value={formData.contactName || ''}
                                  onChange={(v) => handleChange('contactName', v)}
                                  placeholder="John Doe"
                                />
                                <TextField
                                  label="Title"
                                  value={formData.contactTitle || ''}
                                  onChange={(v) => handleChange('contactTitle', v)}
                                  placeholder="CEO"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <TextField
                                  label="Phone"
                                  type="tel"
                                  value={formData.contactPhone || ''}
                                  onChange={(v) => handleChange('contactPhone', v)}
                                  placeholder="555-123-4567"
                                />
                                <TextField
                                  label="Email"
                                  type="email"
                                  value={formData.contactEmail || ''}
                                  onChange={(v) => handleChange('contactEmail', v)}
                                  placeholder="john@company.com"
                                />
                              </div>
                              <TextField
                                label="Website"
                                type="url"
                                value={formData.website || ''}
                                onChange={(v) => handleChange('website', v)}
                                placeholder="www.company.com"
                              />
                            </>
                          )}
                        </div>
                      </FormSection>

                      {/* Business Address */}
                      <FormSection
                        id="address"
                        title="Business Address"
                        icon={<MapPin size={18} />}
                        description="Street, city, country"
                      >
                        <div className="space-y-4">
                          <ToggleField
                            label="Show Address"
                            checked={formData.showAddress ?? true}
                            onChange={(v) => handleChange('showAddress', v)}
                          />

                          {formData.showAddress && (
                            <>
                              <TextField
                                label="Address Line 1"
                                value={formData.addressLine1 || ''}
                                onChange={(v) => handleChange('addressLine1', v)}
                                placeholder="123 Main Street"
                              />
                              <TextField
                                label="Address Line 2"
                                value={formData.addressLine2 || ''}
                                onChange={(v) => handleChange('addressLine2', v)}
                                placeholder="Suite 100"
                              />
                              <div className="grid grid-cols-2 gap-4">
                                <TextField
                                  label="City"
                                  value={formData.city || ''}
                                  onChange={(v) => handleChange('city', v)}
                                  placeholder="Montreal"
                                />
                                <TextField
                                  label="State/Province"
                                  value={formData.stateProvince || ''}
                                  onChange={(v) => handleChange('stateProvince', v)}
                                  placeholder="QC"
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <TextField
                                  label="Postal Code"
                                  value={formData.postalCode || ''}
                                  onChange={(v) => handleChange('postalCode', v)}
                                  placeholder="H2X 1Y4"
                                />
                                <TextField
                                  label="Country"
                                  value={formData.country || ''}
                                  onChange={(v) => handleChange('country', v)}
                                  placeholder="Canada"
                                />
                              </div>
                            </>
                          )}
                        </div>
                      </FormSection>

                      {/* Decorative Elements */}
                      <FormSection
                        id="decorative"
                        title="Decorative Elements"
                        icon={<Sparkles size={18} />}
                        description="Accent lines, borders, corner decorations"
                      >
                        <div className="space-y-6">
                          {/* Accent Line */}
                          <div className="space-y-4">
                            <ToggleField
                              label="Show Accent Line"
                              checked={formData.showAccentLine ?? true}
                              onChange={(v) => handleChange('showAccentLine', v)}
                            />
                            {formData.showAccentLine && (
                              <>
                                <ColorPicker
                                  label="Accent Line Color"
                                  value={formData.accentLineColor || '#FF6B00'}
                                  onChange={(c) => handleChange('accentLineColor', c)}
                                />
                                <SliderField
                                  label="Line Width"
                                  value={formData.accentLineWidth || 4}
                                  onChange={(v) => handleChange('accentLineWidth', v)}
                                  min={1}
                                  max={10}
                                  valueSuffix="px"
                                />
                                <SelectField
                                  label="Position"
                                  value={formData.accentLinePosition || 'below-title'}
                                  onChange={(v) => handleChange('accentLinePosition', v as AccentLinePosition)}
                                  options={[
                                    { value: 'above-title', label: 'Above Title' },
                                    { value: 'below-title', label: 'Below Title' },
                                    { value: 'bottom', label: 'Bottom of Page' },
                                  ]}
                                />
                              </>
                            )}
                          </div>

                          {/* Border */}
                          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <ToggleField
                              label="Show Border"
                              checked={formData.showBorder ?? false}
                              onChange={(v) => handleChange('showBorder', v)}
                            />
                            {formData.showBorder && (
                              <>
                                <SelectField
                                  label="Border Style"
                                  value={formData.borderStyle || 'simple'}
                                  onChange={(v) => handleChange('borderStyle', v as BorderStyle)}
                                  options={[
                                    { value: 'simple', label: 'Simple' },
                                    { value: 'double', label: 'Double' },
                                    { value: 'elegant', label: 'Elegant' },
                                  ]}
                                />
                                <ColorPicker
                                  label="Border Color"
                                  value={formData.borderColor || '#E5E7EB'}
                                  onChange={(c) => handleChange('borderColor', c)}
                                />
                                <SliderField
                                  label="Border Width"
                                  value={formData.borderWidth || 1}
                                  onChange={(v) => handleChange('borderWidth', v)}
                                  min={1}
                                  max={6}
                                  valueSuffix="px"
                                />
                              </>
                            )}
                          </div>

                          {/* Corner Decorations */}
                          <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <ToggleField
                              label="Show Corner Decorations"
                              checked={formData.showCornerDecoration ?? false}
                              onChange={(v) => handleChange('showCornerDecoration', v)}
                            />
                            {formData.showCornerDecoration && (
                              <>
                                <SelectField
                                  label="Decoration Style"
                                  value={formData.cornerDecorationStyle || 'geometric'}
                                  onChange={(v) => handleChange('cornerDecorationStyle', v as any)}
                                  options={[
                                    { value: 'geometric', label: 'Geometric Circles' },
                                    { value: 'lines', label: 'Diagonal Lines' },
                                    { value: 'dots', label: 'Dot Grid' },
                                  ]}
                                />
                                <ColorPicker
                                  label="Decoration Color"
                                  value={formData.cornerDecorationColor || '#FF6B00'}
                                  onChange={(c) => handleChange('cornerDecorationColor', c)}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      </FormSection>
                    </div>
                  </ScrollArea>
                )}
              </div>

              {/* Preview Section */}
              <div className="w-full lg:w-[400px] xl:w-[480px] bg-gray-100 dark:bg-gray-800 p-6 overflow-y-auto">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">
                  Live Preview
                </h3>
                <div className="sticky top-0">
                  <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg overflow-hidden">
                    <CoverPagePreview
                      settings={previewSettings}
                      className="aspect-[8.5/11]"
                      compact={false}
                    />
                  </div>
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
                    Preview updates as you make changes
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Changes will be reflected in your exported documents
              </p>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  variant="brand"
                  onClick={handleSave}
                  disabled={isSaving || isLoading}
                  className="gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check size={16} />
                      Save Cover Page
                    </>
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}

export default CoverPageEditor;
