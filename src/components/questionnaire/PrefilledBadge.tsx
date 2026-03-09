import { CheckCircle } from 'lucide-react';

interface PrefilledBadgeProps {
  className?: string;
}

export default function PrefilledBadge({ className = '' }: PrefilledBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 ${className}`}>
      <CheckCircle size={12} />
      Pre-filled from profile
    </span>
  );
}
