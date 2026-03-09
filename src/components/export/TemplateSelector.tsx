import { useState, useEffect } from 'react';
import { Check, Loader2, Palette, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { businessPlanService } from '../../lib/business-plan-service';
import type { ExportTheme } from '../../types/export-theme';
import { cn } from '../../lib/utils';

// Hardcoded theme colors as fallback (matches backend ExportThemeRegistry)
export const FALLBACK_THEMES: ExportTheme[] = [
  { id: 'classic', name: 'Classic', description: 'Timeless navy and steel blue', primaryColor: '#1B2E4A', secondaryColor: '#4A90D9', accentColor: '#4A90D9', headingColor: '#1B2E4A', heading2Color: '#4A90D9', textColor: '#2D3748', mutedTextColor: '#718096', separatorColor: '#E2E8F0', coverTitleColor: '#FFFFFF', coverSubtitleColor: '#CBD5E0', coverGradientEnd: '#2B5797', pageBackgroundColor: '#FFFFFF', bodyBackgroundColor: '#F7FAFC', tocBackgroundColor: '#F7FAFC', chartColorPalette: ['#4A90D9', '#48BB78', '#ED8936', '#E53E3E', '#9F7AEA', '#38B2AC'] },
  { id: 'modern', name: 'Modern', description: 'Clean teal accents', primaryColor: '#0F766E', secondaryColor: '#2DD4BF', accentColor: '#0F766E', headingColor: '#134E4A', heading2Color: '#0F766E', textColor: '#1E293B', mutedTextColor: '#64748B', separatorColor: '#E2E8F0', coverTitleColor: '#FFFFFF', coverSubtitleColor: '#99F6E4', coverGradientEnd: '#134E4A', pageBackgroundColor: '#FFFFFF', bodyBackgroundColor: '#F8FAFC', tocBackgroundColor: '#F0FDFA', chartColorPalette: ['#0F766E', '#6366F1', '#F59E0B', '#EC4899', '#06B6D4', '#84CC16'] },
  { id: 'corporate', name: 'Corporate', description: 'Navy and gold', primaryColor: '#0C1E33', secondaryColor: '#C9962B', accentColor: '#C9962B', headingColor: '#0C1E33', heading2Color: '#C9962B', textColor: '#1A202C', mutedTextColor: '#718096', separatorColor: '#C9962B', coverTitleColor: '#FFFFFF', coverSubtitleColor: '#C9962B', coverGradientEnd: '#1A365D', pageBackgroundColor: '#FFFFFF', bodyBackgroundColor: '#FAFAF9', tocBackgroundColor: '#FFFBEB', chartColorPalette: ['#0C1E33', '#C9962B', '#2563EB', '#059669', '#7C3AED', '#DC2626'] },
  { id: 'startup', name: 'Startup', description: 'Electric purple + pink', primaryColor: '#7C3AED', secondaryColor: '#A78BFA', accentColor: '#EC4899', headingColor: '#5B21B6', heading2Color: '#7C3AED', textColor: '#1E1B4B', mutedTextColor: '#6B7280', separatorColor: '#E9D5FF', coverTitleColor: '#FFFFFF', coverSubtitleColor: '#DDD6FE', coverGradientEnd: '#EC4899', pageBackgroundColor: '#FFFFFF', bodyBackgroundColor: '#FAF5FF', tocBackgroundColor: '#F5F3FF', chartColorPalette: ['#7C3AED', '#EC4899', '#06B6D4', '#F59E0B', '#10B981', '#F43F5E'] },
  { id: 'minimal', name: 'Minimal', description: 'Swiss B&W typography', primaryColor: '#18181B', secondaryColor: '#71717A', accentColor: '#18181B', headingColor: '#09090B', heading2Color: '#3F3F46', textColor: '#27272A', mutedTextColor: '#A1A1AA', separatorColor: '#E4E4E7', coverTitleColor: '#FFFFFF', coverSubtitleColor: '#A1A1AA', coverGradientEnd: '#3F3F46', pageBackgroundColor: '#FFFFFF', bodyBackgroundColor: '#FAFAFA', tocBackgroundColor: '#FAFAFA', chartColorPalette: ['#18181B', '#71717A', '#A1A1AA', '#3F3F46', '#52525B', '#D4D4D8'] },
  { id: 'executive', name: 'Executive', description: 'Charcoal + burgundy', primaryColor: '#1F2937', secondaryColor: '#881337', accentColor: '#881337', headingColor: '#111827', heading2Color: '#881337', textColor: '#1F2937', mutedTextColor: '#6B7280', separatorColor: '#881337', coverTitleColor: '#FFFFFF', coverSubtitleColor: '#FCA5A5', coverGradientEnd: '#881337', pageBackgroundColor: '#FFFFFF', bodyBackgroundColor: '#F9FAFB', tocBackgroundColor: '#F9FAFB', chartColorPalette: ['#881337', '#1F2937', '#0369A1', '#15803D', '#A16207', '#7E22CE'] },
  { id: 'eco', name: 'Eco', description: 'Forest green (OBNL)', primaryColor: '#14532D', secondaryColor: '#65A30D', accentColor: '#65A30D', headingColor: '#14532D', heading2Color: '#15803D', textColor: '#1C1917', mutedTextColor: '#57534E', separatorColor: '#BBF7D0', coverTitleColor: '#FFFFFF', coverSubtitleColor: '#BBF7D0', coverGradientEnd: '#15803D', pageBackgroundColor: '#FFFFFF', bodyBackgroundColor: '#F0FDF4', tocBackgroundColor: '#ECFDF5', chartColorPalette: ['#14532D', '#65A30D', '#CA8A04', '#0E7490', '#9333EA', '#C2410C'] },
  { id: 'creative', name: 'Creative', description: 'Bold coral + navy', primaryColor: '#E11D48', secondaryColor: '#1E3A5F', accentColor: '#E11D48', headingColor: '#1E3A5F', heading2Color: '#E11D48', textColor: '#1F2937', mutedTextColor: '#6B7280', separatorColor: '#FECDD3', coverTitleColor: '#FFFFFF', coverSubtitleColor: '#FFE4E6', coverGradientEnd: '#1E3A5F', pageBackgroundColor: '#FFFFFF', bodyBackgroundColor: '#FFF5F5', tocBackgroundColor: '#FFF1F2', chartColorPalette: ['#E11D48', '#1E3A5F', '#8B5CF6', '#06B6D4', '#F59E0B', '#10B981'] },
  { id: 'finance', name: 'Finance', description: 'Midnight + electric blue', primaryColor: '#0F172A', secondaryColor: '#3B82F6', accentColor: '#3B82F6', headingColor: '#0F172A', heading2Color: '#2563EB', textColor: '#1E293B', mutedTextColor: '#94A3B8', separatorColor: '#CBD5E1', coverTitleColor: '#FFFFFF', coverSubtitleColor: '#93C5FD', coverGradientEnd: '#1E3A8A', pageBackgroundColor: '#FFFFFF', bodyBackgroundColor: '#F8FAFC', tocBackgroundColor: '#F1F5F9', chartColorPalette: ['#2563EB', '#0F172A', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'] },
  { id: 'quebec', name: 'Qu\u00e9bec', description: 'Fleur-de-lis blue', primaryColor: '#003DA5', secondaryColor: '#2563EB', accentColor: '#003DA5', headingColor: '#003DA5', heading2Color: '#1D4ED8', textColor: '#1E293B', mutedTextColor: '#64748B', separatorColor: '#BFDBFE', coverTitleColor: '#FFFFFF', coverSubtitleColor: '#93C5FD', coverGradientEnd: '#1E40AF', pageBackgroundColor: '#FFFFFF', bodyBackgroundColor: '#EFF6FF', tocBackgroundColor: '#EFF6FF', chartColorPalette: ['#003DA5', '#2563EB', '#06B6D4', '#10B981', '#F59E0B', '#8B5CF6'] },
];

interface TemplateSelectorProps {
  planId: string;
  selectedThemeId: string;
  onSelect: (theme: ExportTheme) => void;
  onPreview?: (theme: ExportTheme) => void;
  language: 'en' | 'fr';
}

const T = {
  en: {
    title: 'Choose a Template',
    subtitle: 'Select a visual style for your business plan',
    loading: 'Loading templates...',
    preview: 'Preview',
  },
  fr: {
    title: 'Choisir un mod\u00e8le',
    subtitle: 'S\u00e9lectionnez un style visuel pour votre plan d\u2019affaires',
    loading: 'Chargement des mod\u00e8les...',
    preview: 'Aper\u00e7u',
  },
};

/** Mini document preview showing theme colors */
function ThemeMiniPreview({ theme }: { theme: ExportTheme }) {
  return (
    <div
      className="w-full aspect-[3/4] rounded-md overflow-hidden border border-gray-200 dark:border-gray-600"
      style={{ backgroundColor: theme.pageBackgroundColor }}
    >
      {/* Cover band */}
      <div
        className="h-[30%] flex flex-col justify-end px-2 pb-1.5"
        style={{ backgroundColor: theme.primaryColor }}
      >
        <div className="w-[70%] h-1 rounded-full mb-0.5" style={{ backgroundColor: '#fff', opacity: 0.9 }} />
        <div className="w-[45%] h-0.5 rounded-full" style={{ backgroundColor: '#fff', opacity: 0.5 }} />
      </div>

      {/* Body content lines */}
      <div className="px-2 pt-1.5 space-y-1">
        <div className="w-[60%] h-1 rounded-full" style={{ backgroundColor: theme.headingColor }} />
        <div className="w-full h-0.5 rounded-full" style={{ backgroundColor: theme.textColor, opacity: 0.15 }} />
        <div className="w-[90%] h-0.5 rounded-full" style={{ backgroundColor: theme.textColor, opacity: 0.15 }} />
        <div className="w-[75%] h-0.5 rounded-full" style={{ backgroundColor: theme.textColor, opacity: 0.15 }} />
        <div className="w-[50%] h-1 rounded-full mt-0.5" style={{ backgroundColor: theme.heading2Color }} />
        <div className="w-full h-0.5 rounded-full" style={{ backgroundColor: theme.textColor, opacity: 0.15 }} />
        {/* Chart color dots */}
        <div className="flex gap-0.5 pt-0.5">
          {theme.chartColorPalette.slice(0, 4).map((color, i) => (
            <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TemplateSelector({
  planId,
  selectedThemeId,
  onSelect,
  onPreview,
  language,
}: TemplateSelectorProps) {
  const t = T[language] ?? T.en;
  const [themes, setThemes] = useState<ExportTheme[]>(FALLBACK_THEMES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 3000);
    businessPlanService.getExportTemplates(planId)
      .then((templates: any[]) => {
        if (templates && templates.length > 0) {
          const allowedIds = new Set(templates.map((t: any) => t.id));
          const filtered = FALLBACK_THEMES.filter((t) => allowedIds.has(t.id));
          if (filtered.length > 0) {
            setThemes(filtered);
          }
        }
      })
      .catch(() => {
        // Keep fallback themes
      })
      .finally(() => {
        clearTimeout(timeout);
        setLoading(false);
      });
    return () => clearTimeout(timeout);
  }, [planId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-8 text-gray-400">
        <Loader2 size={16} className="animate-spin" />
        <span className="text-sm">{t.loading}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Palette size={14} className="text-momentum-orange" />
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {t.title}
        </p>
      </div>

      {/* Two-row grid: 5 columns to show all 10 themes cleanly */}
      <div className="grid grid-cols-5 gap-3">
        {themes.map((theme) => {
          const isSelected = theme.id === selectedThemeId;
          return (
            <motion.button
              key={theme.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={() => onSelect(theme)}
              className={cn(
                'relative rounded-xl p-2 pb-2.5 transition-all text-left group',
                isSelected
                  ? 'ring-2 ring-momentum-orange bg-orange-50 dark:bg-orange-900/20'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800 ring-1 ring-gray-200 dark:ring-gray-700',
              )}
            >
              {isSelected && (
                <div className="absolute -top-1.5 -right-1.5 z-10 w-5 h-5 rounded-full bg-momentum-orange flex items-center justify-center shadow-sm">
                  <Check size={12} className="text-white" strokeWidth={3} />
                </div>
              )}

              {/* Preview thumbnail + always-visible eye button */}
              <div className="relative">
                <ThemeMiniPreview theme={theme} />
                {onPreview && (
                  <button
                    type="button"
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-white/80 dark:bg-gray-700/80 hover:bg-white dark:hover:bg-gray-600 flex items-center justify-center shadow-sm transition-colors border border-gray-200/50 dark:border-gray-600/50"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPreview(theme);
                    }}
                    title={t.preview}
                  >
                    <Eye size={12} className="text-gray-600 dark:text-gray-300" />
                  </button>
                )}
              </div>

              {/* Theme name + description */}
              <div className="mt-2">
                <p className={cn(
                  'text-xs font-semibold truncate',
                  isSelected ? 'text-momentum-orange' : 'text-gray-800 dark:text-gray-200',
                )}>
                  {theme.name}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
                  {theme.description}
                </p>
              </div>

              {/* Color swatches */}
              <div className="flex gap-1 mt-1.5">
                <div className="w-3 h-3 rounded-sm border border-black/10" style={{ backgroundColor: theme.primaryColor }} />
                <div className="w-3 h-3 rounded-sm border border-black/10" style={{ backgroundColor: theme.secondaryColor }} />
                <div className="w-3 h-3 rounded-sm border border-black/10" style={{ backgroundColor: theme.accentColor }} />
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
