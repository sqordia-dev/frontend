/**
 * Vertical divider between toolbar button groups
 * Provides visual separation between different formatting categories
 */
export function ToolbarDivider() {
  return (
    <div
      className="w-px h-6 bg-warm-gray-300 dark:bg-border mx-1"
      role="separator"
      aria-orientation="vertical"
    />
  );
}

export default ToolbarDivider;
