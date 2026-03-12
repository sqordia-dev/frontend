import { Check, X, Minus } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { usePublishedContent } from '@/hooks/usePublishedContent';
import { cn } from '@/lib/utils';
import { ScrollReveal } from '../animations/ScrollReveal';

type CellValue = 'yes' | 'no' | 'limited' | string;

interface ComparisonRow {
  labelKey: string;
  diy: CellValue;
  sqordia: CellValue;
  consultant: CellValue;
}

const rows: ComparisonRow[] = [
  { labelKey: 'landing.comparison.row.time', diy: 'landing.comparison.diy.time', sqordia: 'landing.comparison.sqordia.time', consultant: 'landing.comparison.consultant.time' },
  { labelKey: 'landing.comparison.row.cost', diy: 'landing.comparison.diy.cost', sqordia: 'landing.comparison.sqordia.cost', consultant: 'landing.comparison.consultant.cost' },
  { labelKey: 'landing.comparison.row.ai', diy: 'no', sqordia: 'yes', consultant: 'no' },
  { labelKey: 'landing.comparison.row.financials', diy: 'limited', sqordia: 'yes', consultant: 'yes' },
  { labelKey: 'landing.comparison.row.exports', diy: 'limited', sqordia: 'yes', consultant: 'limited' },
  { labelKey: 'landing.comparison.row.updates', diy: 'landing.comparison.diy.updates', sqordia: 'landing.comparison.sqordia.updates', consultant: 'landing.comparison.consultant.updates' },
  { labelKey: 'landing.comparison.row.bankScore', diy: 'no', sqordia: 'yes', consultant: 'no' },
];

function CellContent({ value, t, isDark }: { value: CellValue; t: (k: string) => string; isDark: boolean }) {
  if (value === 'yes') {
    return <Check size={18} className="text-green-500 mx-auto" aria-label={t('landing.comparison.yes')} />;
  }
  if (value === 'no') {
    return <X size={18} className="text-gray-400 mx-auto" aria-label={t('landing.comparison.no')} />;
  }
  if (value === 'limited') {
    return (
      <span className={cn('text-xs sm:text-sm flex items-center justify-center gap-1', isDark ? 'text-gray-400' : 'text-gray-500')}>
        <Minus size={14} className="text-amber-500" />
        {t('landing.comparison.limited')}
      </span>
    );
  }
  return (
    <span className={cn('text-xs sm:text-sm font-medium', isDark ? 'text-gray-300' : 'text-gray-700')}>
      {t(value)}
    </span>
  );
}

function MobileCellContent({ value, t, isDark }: { value: CellValue; t: (k: string) => string; isDark: boolean }) {
  if (value === 'yes') {
    return <Check size={16} className="text-green-500" aria-label={t('landing.comparison.yes')} />;
  }
  if (value === 'no') {
    return <X size={16} className="text-gray-400" aria-label={t('landing.comparison.no')} />;
  }
  if (value === 'limited') {
    return (
      <span className={cn('text-xs flex items-center gap-1', isDark ? 'text-gray-400' : 'text-gray-500')}>
        <Minus size={14} className="text-amber-500" />
        {t('landing.comparison.limited')}
      </span>
    );
  }
  return (
    <span className={cn('text-xs font-medium', isDark ? 'text-gray-300' : 'text-gray-700')}>
      {t(value)}
    </span>
  );
}

export default function Comparison() {
  const { theme, t } = useTheme();
  const { getBlockContent } = usePublishedContent();
  const isDark = theme === 'dark';

  const columns = [
    { key: 'diy', labelKey: 'landing.comparison.col.diy', highlight: false },
    { key: 'sqordia', labelKey: 'landing.comparison.col.sqordia', highlight: true },
    { key: 'consultant', labelKey: 'landing.comparison.col.consultant', highlight: false },
  ] as const;

  return (
    <section
      id="comparison"
      className={cn(
        'relative py-12 sm:py-16 md:py-24 lg:py-32',
        isDark ? 'bg-[#161714]' : 'bg-gray-50',
      )}
      aria-labelledby="comparison-heading"
    >
      {/* Noise texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{ backgroundImage: "url('/noise.svg')", backgroundRepeat: 'repeat' }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-16">
          <ScrollReveal>
            <p className="text-label-sm uppercase tracking-widest text-momentum-orange mb-3 sm:mb-4">
              {getBlockContent('landing.comparison.badge', t('landing.comparison.badge'))}
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <h2
              id="comparison-heading"
              className={cn(
                'text-2xl sm:text-3xl md:text-display-md lg:text-display-lg font-heading mb-4 sm:mb-6',
                isDark ? 'text-white' : 'text-strategy-blue',
              )}
            >
              {getBlockContent('landing.comparison.title', t('landing.comparison.title'))}{' '}
              <span className="bg-gradient-to-r from-momentum-orange to-amber-500 bg-clip-text text-transparent">
                {getBlockContent('landing.comparison.title.highlight', t('landing.comparison.title.highlight'))}
              </span>
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={0.15}>
            <p className={cn('text-sm sm:text-body-lg', isDark ? 'text-gray-400' : 'text-gray-500')}>
              {getBlockContent('landing.comparison.subtitle', t('landing.comparison.subtitle'))}
            </p>
          </ScrollReveal>
        </div>

        {/* Mobile: stacked cards per row */}
        <ScrollReveal delay={0.2}>
          <div className="md:hidden space-y-3 max-w-lg mx-auto">
            {rows.map((row, index) => (
              <div
                key={index}
                className={cn(
                  'rounded-xl border p-4',
                  isDark
                    ? 'bg-white/[0.02] border-white/[0.06]'
                    : 'bg-white/70 border-gray-200/50',
                )}
              >
                <p className={cn('text-sm font-semibold mb-3', isDark ? 'text-gray-200' : 'text-gray-800')}>
                  {getBlockContent(row.labelKey, t(row.labelKey))}
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {columns.map((col) => (
                    <div
                      key={col.key}
                      className={cn(
                        'flex flex-col items-center gap-1 py-2 px-1 rounded-lg',
                        col.highlight
                          ? 'bg-momentum-orange/10 border border-momentum-orange/20'
                          : isDark ? 'bg-white/[0.02]' : 'bg-gray-50',
                      )}
                    >
                      <span className={cn(
                        'text-[10px] font-bold uppercase tracking-wide',
                        col.highlight
                          ? 'text-momentum-orange'
                          : isDark ? 'text-gray-500' : 'text-gray-400',
                      )}>
                        {getBlockContent(col.labelKey, t(col.labelKey))}
                      </span>
                      <MobileCellContent value={row[col.key]} t={t} isDark={isDark} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Desktop: table */}
        <ScrollReveal delay={0.2}>
          <div
            className={cn(
              'hidden md:block max-w-4xl mx-auto rounded-2xl border backdrop-blur-sm',
              isDark
                ? 'bg-white/[0.02] border-white/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.3)]'
                : 'bg-white/70 border-gray-200/50 shadow-[0_4px_24px_rgba(0,0,0,0.06)]',
            )}
          >
            <table className="w-full border-collapse" role="table">
              <thead>
                <tr>
                  <th className="w-1/4 p-3 md:p-4" scope="col">
                    <span className="sr-only">{t('landing.comparison.featureCol')}</span>
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      scope="col"
                      className={cn(
                        'w-1/4 p-3 md:p-4 text-center text-xs md:text-sm font-bold uppercase tracking-wide',
                        col.highlight
                          ? 'bg-momentum-orange/10 border-t-2 border-momentum-orange text-momentum-orange'
                          : isDark
                            ? 'text-gray-400'
                            : 'text-gray-500',
                      )}
                    >
                      {getBlockContent(col.labelKey, t(col.labelKey))}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr
                    key={index}
                    className={cn(
                      'transition-colors duration-150',
                      index % 2 === 0
                        ? isDark ? 'bg-white/[0.01]' : 'bg-white/40'
                        : isDark ? 'bg-transparent' : 'bg-gray-50/30',
                      isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-white/60',
                    )}
                  >
                    <td
                      className={cn(
                        'p-3 md:p-4 text-xs md:text-sm font-semibold text-left',
                        isDark ? 'text-gray-200' : 'text-gray-800',
                      )}
                    >
                      {getBlockContent(row.labelKey, t(row.labelKey))}
                    </td>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          'p-3 md:p-4 text-center',
                          col.highlight && 'bg-momentum-orange/[0.04]',
                        )}
                      >
                        <CellContent value={row[col.key]} t={t} isDark={isDark} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
