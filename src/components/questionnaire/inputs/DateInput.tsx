import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { DateInputProps } from '../../../types/questionnaire';

/**
 * DateInput Component
 * Date picker with month/year selection
 * WCAG 2.0 AA compliant
 */
export default function DateInput({
  value,
  onChange,
  min,
  max,
  autoFocus,
  id,
  'aria-describedby': ariaDescribedBy,
}: DateInputProps) {
  const [showMonthYearPicker, setShowMonthYearPicker] = useState(false);

  // Get current value as Date object
  const dateValue = value ? new Date(value) : null;

  // Format date for display
  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format date for input value
  const formatInputDate = (date: Date | null): string => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    if (!dateStr) {
      onChange(null);
      return;
    }

    const newDate = new Date(dateStr);
    if (!isNaN(newDate.getTime())) {
      onChange(newDate);
    }
  };

  // Generate month options
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate year range (10 years before and after current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 21 }, (_, i) => currentYear - 10 + i);

  const handleMonthYearSelect = (month: number, year: number) => {
    const day = dateValue?.getDate() || 1;
    const newDate = new Date(year, month, Math.min(day, new Date(year, month + 1, 0).getDate()));
    onChange(newDate);
    setShowMonthYearPicker(false);
  };

  return (
    <div className="w-full relative">
      {/* Native date input */}
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 pointer-events-none">
          <Calendar size={20} />
        </div>

        <input
          type="date"
          id={id}
          value={formatInputDate(dateValue)}
          onChange={handleDateChange}
          min={min}
          max={max}
          autoFocus={autoFocus}
          aria-describedby={ariaDescribedBy}
          className="
            w-full pl-12 pr-4 py-3
            border-2 border-gray-200 dark:border-gray-700
            rounded-xl
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-white
            focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
            transition-all duration-200
            text-base
            min-h-[48px]
            cursor-pointer
          "
          style={{ fontSize: '16px' }} // Prevent iOS zoom
        />

        {/* Custom month/year picker toggle */}
        <button
          type="button"
          onClick={() => setShowMonthYearPicker(!showMonthYearPicker)}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Quick select month and year"
        >
          <ChevronDown
            size={20}
            className={`text-gray-400 dark:text-gray-500 transition-transform duration-200 ${
              showMonthYearPicker ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* Month/Year quick picker dropdown */}
      {showMonthYearPicker && (
        <div
          className="
            absolute z-10 top-full left-0 right-0 mt-2
            bg-white dark:bg-gray-800
            border-2 border-gray-200 dark:border-gray-700
            rounded-xl shadow-xl
            p-4
            max-h-[300px] overflow-auto
          "
        >
          <div className="grid grid-cols-2 gap-4">
            {/* Month selector */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                Month
              </label>
              <select
                value={dateValue?.getMonth() ?? new Date().getMonth()}
                onChange={(e) => {
                  const month = parseInt(e.target.value, 10);
                  const year = dateValue?.getFullYear() ?? currentYear;
                  handleMonthYearSelect(month, year);
                }}
                className="
                  w-full px-3 py-2
                  border border-gray-200 dark:border-gray-700
                  rounded-lg
                  bg-white dark:bg-gray-800
                  text-gray-900 dark:text-white
                  text-sm
                  focus:outline-none focus:ring-2 focus:ring-orange-500
                "
              >
                {months.map((month, index) => (
                  <option key={month} value={index}>
                    {month}
                  </option>
                ))}
              </select>
            </div>

            {/* Year selector */}
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2 block">
                Year
              </label>
              <select
                value={dateValue?.getFullYear() ?? currentYear}
                onChange={(e) => {
                  const year = parseInt(e.target.value, 10);
                  const month = dateValue?.getMonth() ?? 0;
                  handleMonthYearSelect(month, year);
                }}
                className="
                  w-full px-3 py-2
                  border border-gray-200 dark:border-gray-700
                  rounded-lg
                  bg-white dark:bg-gray-800
                  text-gray-900 dark:text-white
                  text-sm
                  focus:outline-none focus:ring-2 focus:ring-orange-500
                "
              >
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quick select buttons */}
          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={() => {
                onChange(new Date());
                setShowMonthYearPicker(false);
              }}
              className="flex-1 px-3 py-2 text-sm font-medium text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => {
                onChange(null);
                setShowMonthYearPicker(false);
              }}
              className="flex-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Backdrop to close picker */}
      {showMonthYearPicker && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowMonthYearPicker(false)}
        />
      )}
    </div>
  );
}
