// frontend/src/components/questionnaire/ProgressBar.tsx
interface ProgressBarProps {
  percent: number; // 0-100
}

export default function ProgressBar({ percent }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percent));
  return (
    <div className="h-1 w-full bg-slate-200 dark:bg-slate-700">
      <div
        className="h-full bg-gradient-to-r from-orange-500 via-orange-400 to-amber-400 transition-all duration-700 ease-out relative"
        style={{ width: `${clamped}%` }}
      >
        {clamped > 5 && (
          <span className="absolute right-1 -top-4 text-[10px] font-semibold text-orange-500">
            {Math.round(clamped)}%
          </span>
        )}
      </div>
    </div>
  );
}
