import { cn } from '@/lib/utils';

type PersonaFilter = 'all' | 'Entrepreneur' | 'Consultant' | 'OBNL';

interface PersonaTabsProps {
  persona: PersonaFilter;
  onPersonaChange: (persona: PersonaFilter) => void;
  counts: Record<string, number>;
}

const COMING_SOON: Set<PersonaFilter> = new Set(['Consultant', 'OBNL']);

const TABS: { value: PersonaFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'Entrepreneur', label: 'Entrepreneur' },
  { value: 'Consultant', label: 'Consultant' },
  { value: 'OBNL', label: 'OBNL' },
];

export function PersonaTabs({ persona, onPersonaChange, counts }: PersonaTabsProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {TABS.map((tab) => {
        const count = counts[tab.value] ?? 0;
        const isActive = persona === tab.value;
        const isComingSoon = COMING_SOON.has(tab.value);

        return (
          <button
            key={tab.value}
            onClick={() => !isComingSoon && onPersonaChange(tab.value)}
            disabled={isComingSoon}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all',
              isComingSoon
                ? 'bg-muted/50 text-muted-foreground/50 cursor-not-allowed'
                : isActive
                  ? 'bg-[#FF6B00] text-white shadow-sm'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground',
            )}
          >
            {tab.label}
            {isComingSoon ? (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                Soon
              </span>
            ) : (
              <span
                className={cn(
                  'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold',
                  isActive
                    ? 'bg-white/20 text-white'
                    : 'bg-background text-muted-foreground',
                )}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
