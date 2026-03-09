interface ProfileCompletionBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function ProfileCompletionBadge({ score, size = 'md' }: ProfileCompletionBadgeProps) {
  const sizeConfig = {
    sm: { width: 40, stroke: 3, text: 'text-xs' },
    md: { width: 56, stroke: 4, text: 'text-sm' },
    lg: { width: 72, stroke: 5, text: 'text-base' },
  }[size];

  const radius = (sizeConfig.width - sizeConfig.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 80 ? '#10B981' : score >= 50 ? '#F59E0B' : '#EF4444';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: sizeConfig.width, height: sizeConfig.width }}>
      <svg width={sizeConfig.width} height={sizeConfig.width} className="-rotate-90">
        <circle
          cx={sizeConfig.width / 2}
          cy={sizeConfig.width / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={sizeConfig.stroke}
          className="text-gray-200 dark:text-gray-700"
        />
        <circle
          cx={sizeConfig.width / 2}
          cy={sizeConfig.width / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={sizeConfig.stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <span className={`absolute ${sizeConfig.text} font-semibold text-gray-900 dark:text-white`}>
        {score}%
      </span>
    </div>
  );
}
