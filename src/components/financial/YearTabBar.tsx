import { type FC } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface YearTabBarProps {
  projectionYears: number;
  activeYear: number;
  onYearChange: (year: number) => void;
  showPreOpening?: boolean;
  className?: string;
}

const YearTabBar: FC<YearTabBarProps> = ({
  projectionYears,
  activeYear,
  onYearChange,
  showPreOpening = true,
  className = '',
}) => {
  const { t } = useTheme();

  const years = [];
  if (showPreOpening) years.push({ value: 0, label: t('fin.yearTab.preOpening') });
  for (let i = 1; i <= projectionYears; i++) {
    years.push({ value: i, label: `${t('fin.yearTab.year')} ${i}` });
  }

  return (
    <div
      className={`relative flex items-center rounded-full bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8e] px-2 py-1.5 ${className}`}
    >
      {years.map((year) => {
        const isActive = activeYear === year.value;
        return (
          <button
            key={year.value}
            onClick={() => onYearChange(year.value)}
            className={`relative px-4 py-1.5 text-sm transition-colors rounded-full ${
              isActive
                ? 'font-bold text-white'
                : 'font-medium text-white/70 hover:text-white/90'
            }`}
          >
            {year.label}
            {isActive && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default YearTabBar;
