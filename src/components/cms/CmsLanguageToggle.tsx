import { cn } from '@/lib/utils';

interface CmsLanguageToggleProps {
  value: string;
  onChange: (language: string) => void;
  disabled?: boolean;
}

export default function CmsLanguageToggle({
  value,
  onChange,
  disabled = false,
}: CmsLanguageToggleProps) {
  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'fr', label: 'FR' },
  ];

  return (
    <div className="inline-flex items-center rounded-full border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 p-0.5">
      {languages.map((lang) => (
        <button
          key={lang.code}
          type="button"
          disabled={disabled}
          onClick={() => onChange(lang.code)}
          className={cn(
            'px-3 py-1 text-xs font-semibold rounded-full transition-all duration-200',
            value === lang.code
              ? 'bg-[#FF6B00] text-white shadow-sm'
              : 'bg-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
}
