import { useMemo } from 'react';
import { TrendingUp, DollarSign } from 'lucide-react';

interface BreakevenChartProps {
  monthlyRevenue: number[];
  monthlyExpenses: number[];
  months: string[];
  breakEvenMonth?: number;
}

export default function BreakevenChart({
  monthlyRevenue,
  monthlyExpenses,
  months,
  breakEvenMonth
}: BreakevenChartProps) {
  const maxValue = useMemo(() => {
    const allValues = [...monthlyRevenue, ...monthlyExpenses];
    return Math.max(...allValues, 0) * 1.1; // Add 10% padding
  }, [monthlyRevenue, monthlyExpenses]);

  const getBarHeight = (value: number) => {
    if (maxValue === 0) return 0;
    return (value / maxValue) * 100;
  };

  const getBreakEvenPoint = () => {
    if (breakEvenMonth !== undefined) {
      return breakEvenMonth;
    }
    // Calculate break-even point
    for (let i = 0; i < monthlyRevenue.length; i++) {
      if (monthlyRevenue[i] >= monthlyExpenses[i]) {
        return i;
      }
    }
    return -1;
  };

  const breakEvenPoint = getBreakEvenPoint();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={20} style={{ color: '#FF6B00' }} />
        <h3 className="text-lg font-semibold">Breakeven Analysis</h3>
      </div>

      <div className="relative">
        {/* Chart Container */}
        <div className="h-64 flex items-end justify-between gap-2 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800">
          {months.map((month, idx) => {
            const revenue = monthlyRevenue[idx] || 0;
            const expenses = monthlyExpenses[idx] || 0;
            const isBreakEven = idx === breakEvenPoint;

            return (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1 relative">
                {/* Bars */}
                <div className="w-full flex flex-col items-center gap-1 relative" style={{ height: '200px' }}>
                  {/* Revenue Bar */}
                  <div
                    className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                    style={{
                      height: `${getBarHeight(revenue)}%`,
                      backgroundColor: '#10B981',
                      minHeight: revenue > 0 ? '2px' : '0'
                    }}
                    title={`Revenue: $${revenue.toLocaleString()}`}
                  />
                  
                  {/* Expenses Bar */}
                  <div
                    className="w-full rounded-t transition-all duration-300 hover:opacity-80"
                    style={{
                      height: `${getBarHeight(expenses)}%`,
                      backgroundColor: '#EF4444',
                      minHeight: expenses > 0 ? '2px' : '0'
                    }}
                    title={`Expenses: $${expenses.toLocaleString()}`}
                  />
                </div>

                {/* Break-even Indicator */}
                {isBreakEven && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <div className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></div>
                  </div>
                )}

                {/* Month Label */}
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  {month}
                </div>

                {/* Net Value */}
                <div className={`text-xs font-medium mt-1 ${revenue >= expenses ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  ${(revenue - expenses).toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Break-even Line */}
        {breakEvenPoint >= 0 && (
          <div 
            className="absolute left-0 right-0 h-0.5 border-t-2 border-dashed"
            style={{
              top: `${100 - getBarHeight(monthlyRevenue[breakEvenPoint] || 0)}%`,
              borderColor: '#FF6B00'
            }}
          >
            <div className="absolute -left-2 -top-2 px-2 py-1 rounded bg-orange-500 text-white text-xs font-medium">
              Break-even
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#10B981' }}></div>
          <span>Revenue</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded" style={{ backgroundColor: '#EF4444' }}></div>
          <span>Expenses</span>
        </div>
        {breakEvenPoint >= 0 && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 border-t-2 border-dashed" style={{ borderColor: '#FF6B00' }}></div>
            <span>Break-even: {months[breakEvenPoint]}</span>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <p className="text-xs text-green-600 dark:text-green-400 mb-1">Total Revenue</p>
          <p className="text-lg font-bold text-green-700 dark:text-green-300">
            ${monthlyRevenue.reduce((a, b) => a + b, 0).toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-xs text-red-600 dark:text-red-400 mb-1">Total Expenses</p>
          <p className="text-lg font-bold text-red-700 dark:text-red-300">
            ${monthlyExpenses.reduce((a, b) => a + b, 0).toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>
            <div className="p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
              <p className="text-xs mb-1" style={{ color: '#FF6B00' }}>Net Income</p>
              <p className="text-lg font-bold" style={{ color: '#FF6B00' }}>
            ${(monthlyRevenue.reduce((a, b) => a + b, 0) - monthlyExpenses.reduce((a, b) => a + b, 0)).toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>
    </div>
  );
}
