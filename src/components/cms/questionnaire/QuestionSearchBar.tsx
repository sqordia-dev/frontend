import { Search, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuestionSearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onAddQuestion: () => void;
  disabled?: boolean;
}

export function QuestionSearchBar({
  query,
  onQueryChange,
  onAddQuestion,
  disabled = false,
}: QuestionSearchBarProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="relative flex-1">
        <Search
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search questions..."
          disabled={disabled}
          className={cn(
            'w-full pl-9 pr-4 py-2 text-sm border border-border rounded-lg bg-background',
            'focus:ring-2 focus:ring-[#FF6B00]/20 focus:border-[#FF6B00] outline-none transition-all',
            'disabled:opacity-50 disabled:cursor-not-allowed',
          )}
        />
      </div>

      <button
        onClick={onAddQuestion}
        disabled={disabled}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors',
          'bg-[#FF6B00] text-white hover:bg-orange-600 shadow-sm',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <Plus size={15} />
        Add Question
      </button>
    </div>
  );
}
