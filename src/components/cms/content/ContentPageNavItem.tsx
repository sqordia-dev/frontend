import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CmsPageDefinition, CmsSectionDefinition } from '@/lib/cms-page-registry';

interface SectionHealthEntry {
  filled: number;
  total: number;
}

interface ContentPageNavItemProps {
  page: CmsPageDefinition;
  isExpanded: boolean;
  onToggle: () => void;
  selectedSection: string | null;
  onSelectSection: (sectionKey: string) => void;
  sectionHealth: Map<string, SectionHealthEntry>;
}

function SectionDot({ filled, total }: SectionHealthEntry) {
  const pct = total > 0 ? (filled / total) * 100 : 100;
  const color =
    pct >= 80 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-red-500';
  return <span className={cn('w-2 h-2 rounded-full flex-shrink-0', color)} />;
}

export function ContentPageNavItem({
  page,
  isExpanded,
  onToggle,
  selectedSection,
  onSelectSection,
  sectionHealth,
}: ContentPageNavItemProps) {
  return (
    <div>
      {/* Page row */}
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors text-left',
          'hover:bg-muted/70 text-foreground',
        )}
      >
        <span className="flex-shrink-0 text-muted-foreground">{page.icon}</span>
        <span className="flex-1 truncate">{page.label}</span>
        {isExpanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        )}
      </button>

      {/* Sections */}
      {isExpanded && (
        <div className="ml-4 mt-0.5 space-y-0.5 border-l border-border pl-2">
          {page.sections.map((section: CmsSectionDefinition) => {
            const health = sectionHealth.get(section.key);
            const isSelected = selectedSection === section.key;

            return (
              <button
                key={section.key}
                type="button"
                onClick={() => onSelectSection(section.key)}
                className={cn(
                  'w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded-md transition-colors text-left',
                  isSelected
                    ? 'bg-[#FF6B00]/10 text-[#FF6B00] font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
                )}
              >
                <span className="flex-shrink-0">{section.icon}</span>
                <span className="flex-1 truncate">{section.label}</span>
                {health && (
                  <SectionDot filled={health.filled} total={health.total} />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
