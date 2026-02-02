import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  List,
  LayoutGrid,
  Minus,
  Newspaper,
  Building2,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { tocSettingsService } from '../../lib/toc-settings-service';
import {
  TOCStyle,
  TOCSettings,
  TOC_STYLE_OPTIONS,
  TOC_PRESETS,
  getPresetConfig,
} from '../../types/toc-settings';
import { useToast } from '../../contexts/ToastContext';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '../../lib/utils';

interface TOCStyleSelectorProps {
  planId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (settings: TOCSettings) => void;
}

// Icons for each style
const styleIcons: Record<TOCStyle, React.ReactNode> = {
  classic: <List className="w-6 h-6" />,
  modern: <LayoutGrid className="w-6 h-6" />,
  minimal: <Minus className="w-6 h-6" />,
  magazine: <Newspaper className="w-6 h-6" />,
  corporate: <Building2 className="w-6 h-6" />,
};

export function TOCStyleSelector({ planId, isOpen, onClose, onSave }: TOCStyleSelectorProps) {
  const toast = useToast();
  const { t } = useTheme();
  const [selectedStyle, setSelectedStyle] = useState<TOCStyle>('classic');
  const [currentSettings, setCurrentSettings] = useState<TOCSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load current settings when modal opens
  useEffect(() => {
    if (isOpen && planId) {
      loadSettings();
    }
  }, [isOpen, planId]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const settings = await tocSettingsService.getSettings(planId);
      setCurrentSettings(settings);
      setSelectedStyle(settings.style);
    } catch (error) {
      console.error('Failed to load TOC settings:', error);
      toast.error('Failed to load settings', 'Could not load table of contents settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const settings = await tocSettingsService.updateSettings(planId, {
        style: selectedStyle,
        showPageNumbers: TOC_PRESETS[selectedStyle].showPageNumbers,
        showIcons: TOC_PRESETS[selectedStyle].showIcons,
        showCategoryHeaders: TOC_PRESETS[selectedStyle].showCategoryHeaders,
      });
      setCurrentSettings(settings);
      toast.success('Style updated', 'Table of contents style has been updated');
      onSave?.(settings);
      onClose();
    } catch (error) {
      console.error('Failed to save TOC settings:', error);
      toast.error('Failed to save', 'Could not save table of contents settings');
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = currentSettings?.style !== selectedStyle;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Choose Table of Contents Style
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-momentum-orange" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Style Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-1">
              {TOC_STYLE_OPTIONS.map((option) => {
                const isSelected = selectedStyle === option.value;
                const preset = getPresetConfig(option.value);

                return (
                  <motion.button
                    key={option.value}
                    onClick={() => setSelectedStyle(option.value)}
                    className={cn(
                      'relative p-4 rounded-xl border-2 transition-all text-left',
                      'hover:border-momentum-orange/50 hover:shadow-md',
                      isSelected
                        ? 'border-momentum-orange bg-momentum-orange/5 shadow-md'
                        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                    )}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {/* Selected indicator */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="absolute top-2 right-2 w-6 h-6 bg-momentum-orange rounded-full flex items-center justify-center"
                        >
                          <Check className="w-4 h-4 text-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Icon and title */}
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className={cn(
                          'p-2 rounded-lg',
                          isSelected
                            ? 'bg-momentum-orange/10 text-momentum-orange'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        )}
                      >
                        {styleIcons[option.value]}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {option.label}
                        </h3>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                      {option.description}
                    </p>

                    {/* Mini preview */}
                    <div
                      className={cn(
                        'p-3 rounded-lg text-xs',
                        preset.showBorder ? 'border' : '',
                        preset.borderStyle === 'double' ? 'border-double border-4' : ''
                      )}
                      style={{
                        backgroundColor: preset.backgroundColor,
                        borderColor: preset.borderColor,
                        fontFamily: preset.bodyFont,
                      }}
                    >
                      <div
                        className="font-bold mb-2 text-center"
                        style={{
                          fontFamily: preset.headerFont,
                          color: preset.headerColor,
                          textTransform: preset.titleStyle === 'uppercase' ? 'uppercase' : 'none',
                        }}
                      >
                        {t('planView.tableOfContents')}
                      </div>

                      {preset.showDividers && (
                        <div
                          className="mb-2"
                          style={{
                            borderBottom: preset.dividerStyle === 'double'
                              ? `3px double ${preset.accentColor}`
                              : preset.dividerStyle === 'dashed'
                              ? `1px dashed ${preset.accentColor}`
                              : `1px solid ${preset.accentColor}`,
                          }}
                        />
                      )}

                      {/* Sample items */}
                      <div className="space-y-1">
                        {preset.showCategoryHeaders && (
                          <div
                            className="font-semibold"
                            style={{
                              color: option.value === 'magazine' ? '#FFFFFF' : preset.accentColor,
                              backgroundColor: option.value === 'magazine' ? preset.accentColor : 'transparent',
                              padding: option.value === 'magazine' ? '2px 4px' : '0',
                              textTransform: preset.categoryStyle === 'uppercase' ? 'uppercase' : 'none',
                            }}
                          >
                            Introduction
                          </div>
                        )}
                        <div
                          className="flex items-center gap-1"
                          style={{ color: preset.textColor }}
                        >
                          {preset.showIcons && <span aria-hidden="true">{String.fromCodePoint(128221)}</span>}
                          <span className={preset.indentSubsections ? 'ml-2' : ''}>
                            Executive Summary
                          </span>
                          {preset.showLeaderDots && (
                            <span className="flex-1 border-b border-dotted mx-1" style={{ borderColor: preset.textColor }} />
                          )}
                          {preset.showPageNumbers && <span>3</span>}
                        </div>
                        <div
                          className="flex items-center gap-1"
                          style={{ color: preset.textColor }}
                        >
                          {preset.showIcons && <span aria-hidden="true">{String.fromCodePoint(127970)}</span>}
                          <span className={preset.indentSubsections ? 'ml-2' : ''}>
                            Company Overview
                          </span>
                          {preset.showLeaderDots && (
                            <span className="flex-1 border-b border-dotted mx-1" style={{ borderColor: preset.textColor }} />
                          )}
                          {preset.showPageNumbers && <span>5</span>}
                        </div>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !hasChanges}
            className="bg-momentum-orange hover:bg-momentum-orange/90"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Apply Style
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default TOCStyleSelector;
