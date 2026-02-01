/**
 * Vertical divider between toolbar button groups
 * Provides visual separation between different formatting categories
 */
export function ToolbarDivider() {
  return (
    <div
      className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1"
      role="separator"
      aria-orientation="vertical"
    />
  );
}

export default ToolbarDivider;
