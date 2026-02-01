import { ChevronDown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import CA from 'country-flag-icons/react/3x2/CA';
import { useTheme } from '../../contexts/ThemeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { cn } from '@/lib/utils';

// Quebec flag - same as sidebar (create-plan / dashboard)
const QuebecFlag = ({
  size = 20,
  className = '',
  style,
}: { size?: number; className?: string; style?: React.CSSProperties }) => (
  <img
    src="/quebec-flag.svg"
    alt="Quebec Flag"
    width={size}
    height={size * 0.67}
    className={className}
    style={{ objectFit: 'contain', display: 'block', ...style }}
  />
);

const LANGUAGES = [
  { code: 'en' as const, label: 'EN', name: 'English', FlagComponent: CA },
  { code: 'fr' as const, label: 'FR', name: 'Français', FlagComponent: QuebecFlag },
];

export const THEME_ORANGE = '#FF6B00';

interface LanguageDropdownProps {
  textColor: string;
  isDark?: boolean;
  className?: string;
  /** Compact for mobile nav (icon-only or smaller) */
  variant?: 'default' | 'compact';
  /** Called after language is selected (e.g. close mobile menu) */
  onSelect?: () => void;
}

export default function LanguageDropdown({
  textColor,
  isDark,
  className,
  variant = 'default',
  onSelect,
}: LanguageDropdownProps) {
  const { language, setLanguage } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isLandingPage = location.pathname === '/' || location.pathname === '/fr';

  const current = LANGUAGES.find((l) => l.code === language) ?? LANGUAGES[0];
  const CurrentFlag = current.FlagComponent;
  const flagSize = { w: 20, h: 14 }; // 3x2 aspect

  const handleSelect = (code: 'en' | 'fr') => {
    setLanguage(code);
    if (isLandingPage) {
      navigate(code === 'fr' ? '/fr' : '/', { replace: true });
    }
    onSelect?.();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(
            'inline-flex items-center gap-2 rounded-lg border-0 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent',
            variant === 'compact' ? 'min-h-[44px] min-w-[44px] justify-center px-2.5' : 'min-h-[40px] px-3 py-2',
            className
          )}
          style={{
            color: textColor,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)',
          }}
          aria-label="Select language"
          aria-haspopup="listbox"
        >
          <span role="img" aria-hidden className="shrink-0 rounded overflow-hidden flex items-center justify-center" style={{ width: flagSize.w, height: flagSize.h }}>
            <CurrentFlag title={current.name} style={{ width: flagSize.w, height: flagSize.h, display: 'block' }} />
          </span>
          {variant === 'default' && (
            <span className="text-sm font-medium">{current.label}</span>
          )}
          <ChevronDown
            size={16}
            className="shrink-0 opacity-70"
            aria-hidden
          />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-[140px]"
        sideOffset={8}
      >
        {LANGUAGES.map((lang) => {
          const LangFlag = lang.FlagComponent;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleSelect(lang.code)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <span role="img" aria-hidden className="shrink-0 rounded overflow-hidden flex items-center justify-center" style={{ width: 20, height: 14 }}>
                <LangFlag title={lang.name} style={{ width: 20, height: 14, display: 'block' }} />
              </span>
              <span className="flex-1">{lang.name}</span>
              {language === lang.code && (
                <span className="shrink-0 w-2 h-2 rounded-full" style={{ backgroundColor: THEME_ORANGE }} aria-hidden />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { LANGUAGES };
