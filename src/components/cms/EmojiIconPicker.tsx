import { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface EmojiIconPickerProps {
  value: string;
  onChange: (emoji: string) => void;
}

interface EmojiEntry {
  emoji: string;
  label: string;
  keywords: string[];
}

interface EmojiCategory {
  name: string;
  emojis: EmojiEntry[];
}

const EMOJI_LIBRARY: EmojiCategory[] = [
  {
    name: 'Vision & Identity',
    emojis: [
      { emoji: '\u{1F3AF}', label: 'Target', keywords: ['target', 'goal', 'aim', 'mission'] },
      { emoji: '\u{2B50}', label: 'Star', keywords: ['star', 'vision', 'excellence', 'quality'] },
      { emoji: '\u{1F4A1}', label: 'Light Bulb', keywords: ['idea', 'innovation', 'vision', 'insight'] },
      { emoji: '\u{1F680}', label: 'Rocket', keywords: ['launch', 'startup', 'growth', 'ambition'] },
      { emoji: '\u{1F3C6}', label: 'Trophy', keywords: ['trophy', 'achievement', 'success', 'win'] },
      { emoji: '\u{1F48E}', label: 'Gem', keywords: ['gem', 'value', 'premium', 'quality'] },
      { emoji: '\u{1F451}', label: 'Crown', keywords: ['crown', 'leader', 'king', 'top'] },
      { emoji: '\u{1F525}', label: 'Fire', keywords: ['fire', 'passion', 'hot', 'trending'] },
      { emoji: '\u{26A1}', label: 'Lightning', keywords: ['lightning', 'energy', 'power', 'fast'] },
      { emoji: '\u{1F30D}', label: 'Globe', keywords: ['globe', 'world', 'global', 'international'] },
      { emoji: '\u{2696}\u{FE0F}', label: 'Balance', keywords: ['balance', 'justice', 'legal', 'law'] },
      { emoji: '\u{1F3E2}', label: 'Office', keywords: ['office', 'building', 'company', 'corporate'] },
    ],
  },
  {
    name: 'Market & Customers',
    emojis: [
      { emoji: '\u{1F465}', label: 'People', keywords: ['people', 'team', 'group', 'customers'] },
      { emoji: '\u{1F464}', label: 'Person', keywords: ['person', 'user', 'customer', 'individual'] },
      { emoji: '\u{1F4CA}', label: 'Chart', keywords: ['chart', 'data', 'analytics', 'statistics'] },
      { emoji: '\u{1F50D}', label: 'Search', keywords: ['search', 'research', 'analysis', 'find'] },
      { emoji: '\u{1F4C8}', label: 'Trending Up', keywords: ['trending', 'growth', 'increase', 'up'] },
      { emoji: '\u{1F310}', label: 'Network', keywords: ['network', 'web', 'internet', 'connected'] },
      { emoji: '\u{1F4E3}', label: 'Megaphone', keywords: ['megaphone', 'marketing', 'announce', 'promotion'] },
      { emoji: '\u{1F91D}', label: 'Handshake', keywords: ['handshake', 'deal', 'partnership', 'agreement'] },
      { emoji: '\u{1F4AC}', label: 'Speech', keywords: ['speech', 'communication', 'feedback', 'chat'] },
      { emoji: '\u{2764}\u{FE0F}', label: 'Heart', keywords: ['heart', 'love', 'loyalty', 'satisfaction'] },
      { emoji: '\u{1F3AA}', label: 'Circus', keywords: ['circus', 'market', 'arena', 'competition'] },
      { emoji: '\u{1F6CD}\u{FE0F}', label: 'Shopping', keywords: ['shopping', 'buy', 'retail', 'commerce'] },
    ],
  },
  {
    name: 'Products & Services',
    emojis: [
      { emoji: '\u{1F4E6}', label: 'Package', keywords: ['package', 'product', 'box', 'delivery'] },
      { emoji: '\u{1F6E0}\u{FE0F}', label: 'Tools', keywords: ['tools', 'build', 'create', 'develop'] },
      { emoji: '\u{2699}\u{FE0F}', label: 'Gear', keywords: ['gear', 'settings', 'mechanism', 'operations'] },
      { emoji: '\u{1F4BB}', label: 'Laptop', keywords: ['laptop', 'tech', 'software', 'digital'] },
      { emoji: '\u{1F4F1}', label: 'Phone', keywords: ['phone', 'mobile', 'app', 'digital'] },
      { emoji: '\u{1F3A8}', label: 'Palette', keywords: ['palette', 'design', 'creative', 'art'] },
      { emoji: '\u{1F9E9}', label: 'Puzzle', keywords: ['puzzle', 'solution', 'integration', 'fit'] },
      { emoji: '\u{1F4DD}', label: 'Memo', keywords: ['memo', 'document', 'write', 'plan'] },
      { emoji: '\u{1F381}', label: 'Gift', keywords: ['gift', 'offer', 'bonus', 'reward'] },
      { emoji: '\u{1F512}', label: 'Lock', keywords: ['lock', 'security', 'privacy', 'protection'] },
      { emoji: '\u{1F3D7}\u{FE0F}', label: 'Construction', keywords: ['construction', 'building', 'develop', 'progress'] },
      { emoji: '\u{1F4DA}', label: 'Books', keywords: ['books', 'education', 'knowledge', 'learning'] },
    ],
  },
  {
    name: 'Strategy & Operations',
    emojis: [
      { emoji: '\u{1F4CB}', label: 'Clipboard', keywords: ['clipboard', 'plan', 'checklist', 'tasks'] },
      { emoji: '\u{1F5FA}\u{FE0F}', label: 'Map', keywords: ['map', 'roadmap', 'strategy', 'direction'] },
      { emoji: '\u{1F9ED}', label: 'Compass', keywords: ['compass', 'direction', 'navigate', 'guide'] },
      { emoji: '\u{265F}\u{FE0F}', label: 'Chess', keywords: ['chess', 'strategy', 'tactical', 'plan'] },
      { emoji: '\u{1F4C5}', label: 'Calendar', keywords: ['calendar', 'schedule', 'timeline', 'date'] },
      { emoji: '\u{23F0}', label: 'Clock', keywords: ['clock', 'time', 'deadline', 'efficiency'] },
      { emoji: '\u{1F3ED}', label: 'Factory', keywords: ['factory', 'production', 'manufacturing', 'operations'] },
      { emoji: '\u{1F69A}', label: 'Truck', keywords: ['truck', 'delivery', 'logistics', 'supply'] },
      { emoji: '\u{1F4CC}', label: 'Pin', keywords: ['pin', 'location', 'important', 'mark'] },
      { emoji: '\u{1F517}', label: 'Link', keywords: ['link', 'chain', 'connection', 'supply chain'] },
      { emoji: '\u{1F4C2}', label: 'Folder', keywords: ['folder', 'organize', 'files', 'structure'] },
      { emoji: '\u{1F504}', label: 'Cycle', keywords: ['cycle', 'process', 'repeat', 'workflow'] },
    ],
  },
  {
    name: 'Financials & Growth',
    emojis: [
      { emoji: '\u{1F4B0}', label: 'Money Bag', keywords: ['money', 'revenue', 'profit', 'investment'] },
      { emoji: '\u{1F4B5}', label: 'Dollar', keywords: ['dollar', 'cash', 'price', 'cost'] },
      { emoji: '\u{1F4B3}', label: 'Credit Card', keywords: ['credit', 'payment', 'card', 'billing'] },
      { emoji: '\u{1F4C9}', label: 'Chart Down', keywords: ['chart', 'decrease', 'loss', 'cost'] },
      { emoji: '\u{1F4B2}', label: 'Dollar Sign', keywords: ['dollar', 'price', 'currency', 'financial'] },
      { emoji: '\u{1F3E6}', label: 'Bank', keywords: ['bank', 'finance', 'institution', 'loan'] },
      { emoji: '\u{1F4B8}', label: 'Money Wings', keywords: ['money', 'spending', 'expense', 'cost'] },
      { emoji: '\u{1F4C6}', label: 'Date', keywords: ['date', 'fiscal', 'quarter', 'period'] },
      { emoji: '\u{1F331}', label: 'Seedling', keywords: ['seedling', 'growth', 'start', 'organic'] },
      { emoji: '\u{1F333}', label: 'Tree', keywords: ['tree', 'established', 'mature', 'stable'] },
      { emoji: '\u{1F4C8}', label: 'Growth', keywords: ['growth', 'increase', 'revenue', 'scale'] },
      { emoji: '\u{1F3C1}', label: 'Finish', keywords: ['finish', 'milestone', 'goal', 'complete'] },
    ],
  },
  {
    name: 'General',
    emojis: [
      { emoji: '\u{2705}', label: 'Check', keywords: ['check', 'done', 'yes', 'complete'] },
      { emoji: '\u{2757}', label: 'Exclamation', keywords: ['exclamation', 'important', 'alert', 'warning'] },
      { emoji: '\u{2753}', label: 'Question', keywords: ['question', 'help', 'ask', 'info'] },
      { emoji: '\u{1F4CC}', label: 'Pushpin', keywords: ['pin', 'mark', 'important', 'highlight'] },
      { emoji: '\u{1F4CE}', label: 'Paperclip', keywords: ['clip', 'attach', 'reference', 'link'] },
      { emoji: '\u{270F}\u{FE0F}', label: 'Pencil', keywords: ['pencil', 'edit', 'write', 'note'] },
      { emoji: '\u{1F4A4}', label: 'Zzz', keywords: ['sleep', 'rest', 'inactive', 'pause'] },
      { emoji: '\u{1F4AF}', label: 'Hundred', keywords: ['hundred', 'perfect', 'score', 'complete'] },
      { emoji: '\u{1F389}', label: 'Party', keywords: ['party', 'celebration', 'launch', 'event'] },
      { emoji: '\u{1F3C5}', label: 'Medal', keywords: ['medal', 'award', 'recognition', 'best'] },
      { emoji: '\u{1F4A5}', label: 'Boom', keywords: ['boom', 'impact', 'disrupt', 'power'] },
      { emoji: '\u{1F50E}', label: 'Magnify Right', keywords: ['magnify', 'zoom', 'detail', 'inspect'] },
    ],
  },
];

export default function EmojiIconPicker({ value, onChange }: EmojiIconPickerProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return EMOJI_LIBRARY;

    const q = search.toLowerCase();
    return EMOJI_LIBRARY
      .map((cat) => ({
        ...cat,
        emojis: cat.emojis.filter(
          (e) =>
            e.label.toLowerCase().includes(q) ||
            e.keywords.some((k) => k.includes(q))
        ),
      }))
      .filter((cat) => cat.emojis.length > 0);
  }, [search]);

  const handleSelect = (emoji: string) => {
    onChange(emoji);
    setOpen(false);
    setSearch('');
  };

  const handleClear = () => {
    onChange('');
    setOpen(false);
    setSearch('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center justify-center h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          {value ? (
            <span className="text-lg">{value}</span>
          ) : (
            <span className="text-muted-foreground text-xs">Pick icon...</span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        className="w-80 p-0"
      >
        {/* Search */}
        <div className="p-2 border-b border-gray-200 dark:border-gray-800">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search icons..."
              className="h-8 pl-8 pr-8 text-sm"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Emoji grid */}
        <ScrollArea className="h-64">
          <div className="p-2">
            {filteredCategories.length === 0 && (
              <p className="text-center text-xs text-muted-foreground py-6">
                No matching icons found
              </p>
            )}
            {filteredCategories.map((cat) => (
              <div key={cat.name} className="mb-3 last:mb-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 px-1">
                  {cat.name}
                </p>
                <div className="grid grid-cols-8 gap-0.5">
                  {cat.emojis.map((entry) => (
                    <button
                      key={entry.emoji + entry.label}
                      type="button"
                      onClick={() => handleSelect(entry.emoji)}
                      title={entry.label}
                      className="flex items-center justify-center w-8 h-8 rounded-md text-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      {entry.emoji}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Footer: clear */}
        {value && (
          <div className="p-2 border-t border-gray-200 dark:border-gray-800">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="w-full h-7 text-xs text-muted-foreground"
            >
              <X className="w-3 h-3 mr-1" />
              Remove icon
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
