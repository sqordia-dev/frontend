import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface YearTabBarProps {
  projectionYears: number;
  activeYear: number;
  onYearChange: (year: number) => void;
  showPreOpening?: boolean;
  className?: string;
}

const YearTabBar: React.FC<YearTabBarProps> = ({
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
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {years.map((year) => (
        <button
          key={year.value}
          onClick={() => onYearChange(year.value)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            activeYear === year.value
              ? 'bg-strategy-blue text-white shadow-sm'
              : 'text-muted-foreground hover:bg-muted rounded-md'
          }`}
        >
          {year.label}
        </button>
      ))}
    </div>
  );
};

export default YearTabBar;
