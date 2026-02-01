import { type TOCCategory, getCategoryIconComponent } from './utils';

interface TOCCategoryProps {
  category: TOCCategory;
  className?: string;
}

/**
 * TOCCategory - Category header row with icon and name
 * Dark background style matching the design
 */
export function TOCCategoryHeader({ category, className = '' }: TOCCategoryProps) {
  const Icon = getCategoryIconComponent(category);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 bg-strategy-blue text-white ${className}`}
      role="heading"
      aria-level={3}
    >
      <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <span className="text-sm font-medium uppercase tracking-wide">
        {category}
      </span>
    </div>
  );
}
