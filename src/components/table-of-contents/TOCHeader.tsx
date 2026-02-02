import { List } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface TOCHeaderProps {
  className?: string;
}

/**
 * TOCHeader - Header section for the Table of Contents
 * Displays the icon and title (translated for current language)
 */
export function TOCHeader({ className = '' }: TOCHeaderProps) {
  const { t } = useTheme();
  const title = t('planView.tableOfContents');
  return (
    <div className={`p-6 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <List
            className="h-5 w-5 text-gray-600 dark:text-gray-400"
            aria-hidden="true"
          />
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide font-medium">
            {title.toUpperCase()}
          </p>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
        </div>
      </div>
    </div>
  );
}
