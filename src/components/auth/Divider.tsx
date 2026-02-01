interface DividerProps {
  text?: string;
  className?: string;
}

/**
 * Horizontal divider with centered text
 * Used to separate OAuth buttons from email/password form
 */
export default function Divider({ text = 'or', className = '' }: DividerProps) {
  return (
    <div className={`relative ${className}`} role="separator" aria-orientation="horizontal">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-gray-200 dark:border-gray-700" />
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="bg-white px-4 text-gray-500 dark:bg-gray-900 dark:text-gray-400">
          {text}
        </span>
      </div>
    </div>
  );
}
